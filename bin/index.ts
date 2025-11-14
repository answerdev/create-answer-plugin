#! /usr/bin/env tsx

import fs from "fs";
import path from "path";
import ora from "ora";
import { URL, fileURLToPath } from "node:url";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { collectPluginInfo } from "../src/cli/prompts.js";
import { transformPluginName } from "../src/utils/name-transformer.js";
import {
  createPluginDirectory,
  generateBackendPlugin,
  generateStandardUIPlugin,
  generateInfoYaml,
  generateI18n,
  generateReadme,
  initGoModule,
  installNpmDependencies,
} from "../src/core/plugin-generator.js";
import { PluginContext } from "../src/types/index.js";
import { PLUGIN_TYPES } from "../src/config/constants.js";
import {
  discoverPlugins,
  checkInstallationStatus,
  installPlugins,
  uninstallPlugins,
  PluginInfo,
} from "../src/core/plugin-manager.js";
import { executeCommand } from "../src/utils/exec.js";
import { validateAnswerProjectPath } from "../src/utils/validators.js";
import { handleError } from "../src/core/error-handler.js";
import { validatePluginNameSecurity } from "../src/utils/security.js";
import { loadConfig, getConfigPath } from "../src/config/config.js";
import { getLogger } from "../src/core/logger.js";

const __dirname = path.dirname(fileURLToPath(new URL(import.meta.url)));
const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../package.json"), "utf8")
);

// Initialize configuration and logger
loadConfig();
const logger = getLogger();

/**
 * Create plugin command
 */
const createPlugin = async (pluginName?: string): Promise<void> => {
  try {
    // Collect user input
    const answers = await collectPluginInfo(pluginName);

    // Validate plugin name security
    validatePluginNameSecurity(answers.pluginName);

    // Transform plugin name
    const subType =
      answers.backendPluginType || answers.standardPluginType || "";
    const nameInfo = transformPluginName(
      answers.pluginName,
      answers.pluginType,
      subType
    );

    // Build plugin context
    const config = loadConfig(answers.answerProjectPath);
    const pluginsPath = getConfigPath(answers.answerProjectPath, "plugins");
    const targetPath = path.resolve(pluginsPath, nameInfo.packageName);

    logger.debug(`Creating plugin at: ${targetPath}`);

    const context: PluginContext = {
      ...nameInfo,
      targetPath,
      answerProjectPath: answers.answerProjectPath,
      pluginType: answers.pluginType,
      backendPluginType: answers.backendPluginType,
      standardPluginType: answers.standardPluginType,
      routePath: answers.routePath,
    };

    // Create plugin directory
    const spinner = ora("Creating plugin directory...").start();
    createPluginDirectory(context);
    spinner.succeed("Plugin directory created");

    // Generate i18n files
    spinner.start("Generating i18n files...");
    generateI18n(context);
    spinner.succeed("i18n files generated");

    // Generate plugin files based on type
    if (context.pluginType === PLUGIN_TYPES.BACKEND) {
      spinner.start("Generating Backend Plugin files...");
      generateBackendPlugin(context);
      spinner.succeed("Backend Plugin files generated");
    } else if (context.pluginType === PLUGIN_TYPES.STANDARD_UI) {
      spinner.start("Generating Standard UI Plugin files...");
      generateStandardUIPlugin(context);
      generateInfoYaml(context);
      spinner.succeed("Standard UI Plugin files generated");

      spinner.start("Installing npm dependencies...");
      await installNpmDependencies(context);
      spinner.succeed("Dependencies installed");
    }

    // Initialize Go module (for both Backend and Standard UI plugins)
    spinner.start("Initializing Go module...");
    await initGoModule(context);
    spinner.succeed("Go module initialized");

    // Generate README
    generateReadme(context);

    spinner.succeed(
      `Plugin "${nameInfo.packageName}" created successfully at ${targetPath}`
    );
  } catch (error) {
    handleError(error);
  }
};

/**
 * List plugins command
 */
const listPlugins = async (answerProjectPath?: string): Promise<void> => {
  try {
    const projectPath = answerProjectPath || process.cwd();
    const validation = validateAnswerProjectPath(projectPath);

    if (validation !== true) {
      ora().fail(validation);
      process.exit(1);
    }

    const spinner = ora("Discovering plugins...").start();
    const plugins = discoverPlugins(projectPath);
    const pluginsWithStatus = checkInstallationStatus(plugins, projectPath);
    spinner.stop();

    if (pluginsWithStatus.length === 0) {
      console.log("\n📦 No plugins found in the Answer project.\n");
      return;
    }

    console.log("\n📦 Found plugins:\n");

    pluginsWithStatus.forEach((plugin, index) => {
      const typeLabel =
        plugin.type === "backend"
          ? `Backend (${plugin.subType || "unknown"})`
          : `Standard UI (${plugin.subType || "unknown"})`;

      const statusIcon = plugin.installed ? "✅" : "⏸️ ";
      const statusText = plugin.installed ? "Installed" : "Not installed";

      console.log(`${index + 1}. ${plugin.name}`);
      console.log(`   Type: ${typeLabel}`);
      console.log(`   Slug: ${plugin.slugName}`);
      console.log(`   Version: ${plugin.version}`);
      console.log(`   Status: ${statusIcon} ${statusText}`);
      console.log(`   Path: ${plugin.path}\n`);
    });

    const installedCount = pluginsWithStatus.filter((p) => p.installed).length;
    const notInstalledCount = pluginsWithStatus.length - installedCount;

    console.log(
      `Total: ${pluginsWithStatus.length} plugins (${installedCount} installed, ${notInstalledCount} not installed)\n`
    );
  } catch (error) {
    handleError(error);
  }
};

/**
 * Install plugins command
 */
const installPluginsCommand = async (
  pluginNames: string[],
  answerProjectPath?: string
): Promise<void> => {
  try {
    const projectPath = answerProjectPath || process.cwd();
    const validation = validateAnswerProjectPath(projectPath);

    if (validation !== true) {
      ora().fail(validation);
      process.exit(1);
    }

    const spinner = ora("Discovering plugins...").start();
    const allPlugins = discoverPlugins(projectPath);
    const pluginsWithStatus = checkInstallationStatus(allPlugins, projectPath);
    spinner.stop();

    // Filter plugins to install
    let pluginsToInstall: PluginInfo[];

    if (pluginNames.length === 0) {
      // Install all not installed plugins
      pluginsToInstall = pluginsWithStatus.filter((p) => !p.installed);
    } else {
      // Install specified plugins
      pluginsToInstall = pluginsWithStatus.filter(
        (p) => pluginNames.includes(p.name) && !p.installed
      );
    }

    if (pluginsToInstall.length === 0) {
      ora().warn("No plugins found to install");
      return;
    }

    spinner.start(`Installing ${pluginsToInstall.length} plugin(s)...`);

    try {
      installPlugins(pluginsToInstall, projectPath);

      // Load configuration
      const config = loadConfig(projectPath);

      // Run go mod tidy
      spinner.text = "Running go mod tidy...";
      await executeCommand(config.commands.goModTidy, {
        cwd: projectPath,
        timeout: config.timeouts.goModTidy,
        retries: config.retries.goModTidy,
      });

      // Merge plugin i18n resources into Answer data
      spinner.text = "Merging plugin i18n resources...";
      const pluginsDir = getConfigPath(projectPath, "plugins");
      const answerDataI18nDir = getConfigPath(projectPath, "i18n");
      if (!fs.existsSync(answerDataI18nDir)) {
        fs.mkdirSync(answerDataI18nDir, { recursive: true });
      }
      const mergeCommand = `${config.commands.i18nMerge} -s "${pluginsDir}" -t "${answerDataI18nDir}"`;
      await executeCommand(mergeCommand, {
        cwd: projectPath,
        timeout: config.timeouts.i18nMerge,
        retries: config.retries.default,
      });

      logger.debug(`Installed ${pluginsToInstall.length} plugin(s)`);

      spinner.succeed(
        `Successfully installed ${pluginsToInstall.length} plugin(s)`
      );

      pluginsToInstall.forEach((plugin) => {
        console.log(`  ✅ ${plugin.name}`);
      });
    } catch (error: any) {
      spinner.fail(`Failed to install plugins: ${error.message}`);
      throw error;
    }
  } catch (error) {
    handleError(error);
  }
};

/**
 * Uninstall plugins command
 */
const uninstallPluginsCommand = async (
  pluginNames: string[],
  answerProjectPath?: string
): Promise<void> => {
  try {
    const projectPath = answerProjectPath || process.cwd();
    const validation = validateAnswerProjectPath(projectPath);

    if (validation !== true) {
      ora().fail(validation);
      process.exit(1);
    }

    const spinner = ora("Discovering plugins...").start();
    const allPlugins = discoverPlugins(projectPath);
    const pluginsWithStatus = checkInstallationStatus(allPlugins, projectPath);
    spinner.stop();

    // Filter plugins to uninstall
    let pluginsToUninstall: PluginInfo[];

    if (pluginNames.length === 0) {
      // Uninstall all installed plugins
      pluginsToUninstall = pluginsWithStatus.filter((p) => p.installed);
    } else {
      // Uninstall specified plugins
      pluginsToUninstall = pluginsWithStatus.filter(
        (p) => pluginNames.includes(p.name) && p.installed
      );
    }

    if (pluginsToUninstall.length === 0) {
      ora().warn("No plugins found to uninstall");
      return;
    }

    spinner.start(`Uninstalling ${pluginsToUninstall.length} plugin(s)...`);

    try {
      uninstallPlugins(pluginsToUninstall, projectPath);

      // Load configuration
      const config = loadConfig(projectPath);

      // Run go mod tidy
      spinner.text = "Running go mod tidy...";
      await executeCommand(config.commands.goModTidy, {
        cwd: projectPath,
        timeout: config.timeouts.goModTidy,
        retries: config.retries.goModTidy,
      });

      logger.debug(`Uninstalled ${pluginsToUninstall.length} plugin(s)`);

      spinner.succeed(
        `Successfully uninstalled ${pluginsToUninstall.length} plugin(s)`
      );

      pluginsToUninstall.forEach((plugin) => {
        console.log(`  ✅ ${plugin.name}`);
      });
    } catch (error: any) {
      spinner.fail(`Failed to uninstall plugins: ${error.message}`);
      throw error;
    }
  } catch (error) {
    handleError(error);
  }
};

// Setup yargs commands
yargs(hideBin(process.argv))
  .version(packageJson.version)
  .scriptName("answer-plugin")
  .usage("$0 <command> [options]")

  // Create command (default)
  .command(
    ["create [pluginName]", "$0 [pluginName]"],
    "Create a new plugin",
    (yargs) => {
      yargs.positional("pluginName", {
        type: "string",
        describe: "Plugin name",
      });
      yargs.option("path", {
        alias: "p",
        type: "string",
        describe: "Path to Answer project",
      });
    },
    async (argv) => {
      await createPlugin(argv.pluginName as string | undefined);
    }
  )

  // List command
  .command(
    "list [path]",
    "List all plugins in the Answer project",
    (yargs) => {
      yargs.positional("path", {
        type: "string",
        describe: "Path to Answer project",
        default: process.cwd(),
      });
    },
    async (argv) => {
      await listPlugins(argv.path as string | undefined);
    }
  )

  // Install command
  .command(
    "install [plugins...]",
    "Install plugins (defaults to all not installed plugins)",
    (yargs) => {
      yargs.positional("plugins", {
        type: "string",
        describe: "Plugin names to install",
        array: true,
        default: [],
      });
      yargs.option("path", {
        alias: "p",
        type: "string",
        describe: "Path to Answer project",
      });
    },
    async (argv) => {
      await installPluginsCommand(
        (argv.plugins as string[]) || [],
        argv.path as string | undefined
      );
    }
  )

  // Uninstall command
  .command(
    "uninstall [plugins...]",
    "Uninstall plugins (defaults to all installed plugins)",
    (yargs) => {
      yargs.positional("plugins", {
        type: "string",
        describe: "Plugin names to uninstall",
        array: true,
        default: [],
      });
      yargs.option("path", {
        alias: "p",
        type: "string",
        describe: "Path to Answer project",
      });
    },
    async (argv) => {
      await uninstallPluginsCommand(
        (argv.plugins as string[]) || [],
        argv.path as string | undefined
      );
    }
  )

  .help()
  .alias("help", "h")
  .demandCommand(0, "Please provide a command")
  .strict()
  .parse();
