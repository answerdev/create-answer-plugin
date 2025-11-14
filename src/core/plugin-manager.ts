import fs from "fs";
import path from "path";
import { load } from "js-yaml";
import { FileTransaction } from "./file-transaction.js";
import { FileSystemError } from "../errors/index.js";
import { getConfigPath } from "../config/config.js";
import { getLogger } from "./logger.js";

export interface PluginInfo {
  name: string;
  packageName: string;
  type: "backend" | "standard-ui";
  subType?: string;
  version: string;
  author: string;
  slugName: string;
  path: string;
  installed: boolean;
}

/**
 * Discover all plugins in the Answer project
 */
export function discoverPlugins(answerProjectPath: string): PluginInfo[] {
  const pluginsPath = getConfigPath(answerProjectPath, "plugins");
  const logger = getLogger();

  logger.debug(`Discovering plugins in: ${pluginsPath}`);

  if (!fs.existsSync(pluginsPath)) {
    return [];
  }

  const plugins: PluginInfo[] = [];
  const entries = fs.readdirSync(pluginsPath, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const pluginPath = path.resolve(pluginsPath, entry.name);
    const info = readPluginInfo(pluginPath, entry.name);

    if (info) {
      plugins.push(info);
    }
  }

  return plugins;
}

/**
 * Read plugin information from directory
 */
function readPluginInfo(
  pluginPath: string,
  pluginName: string
): PluginInfo | null {
  const infoYamlPath = path.resolve(pluginPath, "info.yaml");

  if (!fs.existsSync(infoYamlPath)) {
    return null;
  }

  try {
    const infoYamlContent = fs.readFileSync(infoYamlPath, "utf-8");
    const info = load(infoYamlContent) as any;

    // Determine plugin type
    const pluginType = info.type;
    let type: "backend" | "standard-ui" = "backend";
    let subType: string | undefined;

    // Backend plugin types
    const backendTypes = [
      "connector",
      "storage",
      "cache",
      "search",
      "user-center",
      "notification",
      "reviewer",
    ];
    if (backendTypes.includes(pluginType)) {
      type = "backend";
      subType = pluginType;
    } else {
      // Standard UI plugin types
      const standardTypes = ["editor", "route", "captcha", "render"];
      if (standardTypes.includes(pluginType)) {
        type = "standard-ui";
        subType = pluginType;
      }
    }

    return {
      name: pluginName,
      packageName: pluginName,
      type,
      subType,
      version: info.version || "0.0.1",
      author: info.author || "",
      slugName: info.slug_name || pluginName,
      path: pluginPath,
      installed: false, // Will be updated by checkInstallationStatus
    };
  } catch (error) {
    return null;
  }
}

/**
 * Check if a plugin is installed in the Answer project
 */
export function checkInstallationStatus(
  plugins: PluginInfo[],
  answerProjectPath: string
): PluginInfo[] {
  const mainGoPath = getConfigPath(answerProjectPath, "mainGo");
  const goModPath = getConfigPath(answerProjectPath, "goMod");

  let mainGoContent = "";
  let goModContent = "";

  if (fs.existsSync(mainGoPath)) {
    mainGoContent = fs.readFileSync(mainGoPath, "utf-8");
  }

  if (fs.existsSync(goModPath)) {
    goModContent = fs.readFileSync(goModPath, "utf-8");
  }

  return plugins.map((plugin) => {
    const importPath = `github.com/apache/answer-plugins/${plugin.packageName}`;
    const isImported =
      mainGoContent.includes(`"${importPath}"`) ||
      mainGoContent.includes(`_ "${importPath}"`);
    const hasReplace = goModContent.includes(`replace ${importPath}`);

    return {
      ...plugin,
      installed: isImported && hasReplace,
    };
  });
}

/**
 * Install plugins by adding them to main.go and go.mod
 * Uses transaction to ensure atomicity
 */
export function installPlugins(
  plugins: PluginInfo[],
  answerProjectPath: string
): void {
  const mainGoPath = getConfigPath(answerProjectPath, "mainGo");
  const goModPath = getConfigPath(answerProjectPath, "goMod");
  const logger = getLogger();

  logger.debug(`Installing ${plugins.length} plugin(s)`);

  if (!fs.existsSync(mainGoPath)) {
    throw new FileSystemError(`main.go not found at ${mainGoPath}`, mainGoPath);
  }

  if (!fs.existsSync(goModPath)) {
    throw new FileSystemError(`go.mod not found at ${goModPath}`, goModPath);
  }

  const transaction = new FileTransaction();

  try {
    // Backup files before modification
    transaction.backup(mainGoPath);
    transaction.backup(goModPath);

    let mainGoContent = fs.readFileSync(mainGoPath, "utf-8");
    let goModContent = fs.readFileSync(goModPath, "utf-8");

    for (const plugin of plugins) {
      const importPath = `github.com/apache/answer-plugins/${plugin.packageName}`;
      const localPath = `./ui/src/plugins/${plugin.packageName}`;

      // Add import to main.go if not already present
      if (!mainGoContent.includes(`"${importPath}"`)) {
        // Find the import block
        const importBlockRegex = /import\s*\(([\s\S]*?)\)/;
        const match = mainGoContent.match(importBlockRegex);

        if (match) {
          // Add import inside existing import block
          const imports = match[1];
          const newImport = `\t_ "${importPath}"\n`;

          // Check if already imported
          if (!imports.includes(`"${importPath}"`)) {
            // Preserve existing imports and add new one
            const trimmedImports = imports.trim();
            const newImports =
              trimmedImports + (trimmedImports ? "\n" : "") + newImport;
            mainGoContent = mainGoContent.replace(
              importBlockRegex,
              `import (\n${newImports})`
            );
          }
        } else {
          // No import block, check for single import
          const singleImportRegex = /import\s+"([^"]+)"/;
          const singleMatch = mainGoContent.match(singleImportRegex);

          if (singleMatch) {
            // Convert single import to block
            mainGoContent = mainGoContent.replace(
              singleImportRegex,
              `import (\n\t"${singleMatch[1]}"\n\t_ "${importPath}"\n)`
            );
          } else {
            // Add import block after package declaration
            mainGoContent = mainGoContent.replace(
              /(package\s+\w+\s*\n)/,
              `$1\nimport (\n\t_ "${importPath}"\n)\n`
            );
          }
        }
      }

      // Add replace directive to go.mod if not already present
      const replaceDirective = `replace ${importPath} => ${localPath}`;
      if (!goModContent.includes(replaceDirective)) {
        // Add replace directive at the end of go.mod
        goModContent = goModContent.trim() + "\n\n" + replaceDirective + "\n";
      }
    }

    // Write files using transaction
    transaction.writeFile(mainGoPath, mainGoContent);
    transaction.writeFile(goModPath, goModContent);

    // Commit transaction
    transaction.commit();
  } catch (error) {
    // Rollback on error
    transaction.rollback();
    throw error;
  }
}

/**
 * Uninstall plugins by removing them from main.go and go.mod
 * Uses transaction to ensure atomicity
 */
export function uninstallPlugins(
  plugins: PluginInfo[],
  answerProjectPath: string
): void {
  const mainGoPath = getConfigPath(answerProjectPath, "mainGo");
  const goModPath = getConfigPath(answerProjectPath, "goMod");
  const logger = getLogger();

  logger.debug(`Uninstalling ${plugins.length} plugin(s)`);

  if (!fs.existsSync(mainGoPath)) {
    throw new FileSystemError(`main.go not found at ${mainGoPath}`, mainGoPath);
  }

  if (!fs.existsSync(goModPath)) {
    throw new FileSystemError(`go.mod not found at ${goModPath}`, goModPath);
  }

  const transaction = new FileTransaction();

  try {
    // Backup files before modification
    transaction.backup(mainGoPath);
    transaction.backup(goModPath);

    let mainGoContent = fs.readFileSync(mainGoPath, "utf-8");
    let goModContent = fs.readFileSync(goModPath, "utf-8");

    for (const plugin of plugins) {
      const importPath = `github.com/apache/answer-plugins/${plugin.packageName}`;
      const replaceDirective = `replace ${importPath} =>`;

      // Remove import from main.go
      // Remove the entire import line
      mainGoContent = mainGoContent.replace(
        new RegExp(`\t_ "${importPath}"\\s*\n`, "g"),
        ""
      );
      mainGoContent = mainGoContent.replace(
        new RegExp(`\t"${importPath}"\\s*\n`, "g"),
        ""
      );

      // Remove replace directive from go.mod
      const replaceRegex = new RegExp(
        `replace\\s+${importPath.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        )}\\s+=>[^\\n]+\\n`,
        "g"
      );
      goModContent = goModContent.replace(replaceRegex, "");
    }

    // Clean up empty import blocks
    mainGoContent = mainGoContent.replace(/import\s*\(\s*\)\s*\n/g, "");

    // Write files using transaction
    transaction.writeFile(mainGoPath, mainGoContent);
    transaction.writeFile(goModPath, goModContent);

    // Commit transaction
    transaction.commit();
  } catch (error) {
    // Rollback on error
    transaction.rollback();
    throw error;
  }
}
