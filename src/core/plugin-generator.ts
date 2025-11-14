import fs from "fs";
import path from "path";
import { URL, fileURLToPath } from "node:url";
import { PluginContext } from "../types/index.js";
import { renderTemplate, copyTemplateFiles } from "./template-engine.js";
import { executeCommand } from "../utils/exec.js";
import { CommandExecutionError } from "../errors/index.js";
import { getConfig } from "../config/config.js";
import { getLogger } from "./logger.js";

const __dirname = path.dirname(fileURLToPath(new URL(import.meta.url)));
const rootDir = path.resolve(__dirname, "../../");

/**
 * Create plugin directory
 */
export const createPluginDirectory = (context: PluginContext): void => {
  if (!fs.existsSync(context.targetPath)) {
    fs.mkdirSync(context.targetPath, { recursive: true });
  }
};

/**
 * Generate Backend Plugin
 */
export const generateBackendPlugin = (context: PluginContext): void => {
  if (!context.backendPluginType) {
    throw new Error("Backend plugin type is required");
  }

  const templateContext: Record<string, string> = {
    package_name: context.packageNameForGo,
    plugin_name: context.packageName, // Full package name for import paths
    plugin_display_name: context.pluginDisplayName,
    plugin_slug_name: context.pluginSlugName,
    info_slug_name: context.infoSlugName,
    plugin_type: context.backendPluginType,
  };

  // Generate Go file from type-specific template
  const typeTemplatePath = path.resolve(
    rootDir,
    `template/backend/${context.backendPluginType}.go`
  );
  const defaultTemplatePath = path.resolve(rootDir, "template/plugin.go");

  const templatePath = fs.existsSync(typeTemplatePath)
    ? typeTemplatePath
    : defaultTemplatePath;
  const goFileName = `${context.packageNameForGo}.go`;
  const targetFile = path.resolve(context.targetPath, goFileName);

  const content = fs.readFileSync(templatePath, "utf-8");
  const rendered = renderTemplate(content, templateContext, templatePath);

  fs.writeFileSync(targetFile, rendered);

  // Generate info.yaml
  const infoYamlTemplatePath = path.resolve(
    rootDir,
    "template/backend/info.yaml"
  );
  if (fs.existsSync(infoYamlTemplatePath)) {
    const infoYamlContent = fs.readFileSync(infoYamlTemplatePath, "utf-8");
    const infoYamlRendered = renderTemplate(
      infoYamlContent,
      templateContext,
      infoYamlTemplatePath
    );
    fs.writeFileSync(
      path.resolve(context.targetPath, "info.yaml"),
      infoYamlRendered
    );
  }
};

/**
 * Generate Standard UI Plugin
 */
export const generateStandardUIPlugin = (context: PluginContext): void => {
  if (!context.standardPluginType) {
    throw new Error("Standard plugin type is required");
  }

  const templateContext: Record<string, string> = {
    plugin_name: context.packageName, // Full package name for import paths
    package_name: context.packageNameForGo,
    plugin_slug_name: context.pluginSlugName,
    plugin_display_name: context.pluginDisplayName,
    info_slug_name: context.infoSlugName,
    plugin_type: context.standardPluginType,
    route_path: context.routePath || "",
  };

  // Generate Go wrapper file
  const goTemplatePath = path.resolve(rootDir, "template/ui/plugin.go");
  if (fs.existsSync(goTemplatePath)) {
    const goContent = fs.readFileSync(goTemplatePath, "utf-8");
    const goRendered = renderTemplate(
      goContent,
      templateContext,
      goTemplatePath
    );
    const goFileName = `${context.packageNameForGo}.go`;
    fs.writeFileSync(path.resolve(context.targetPath, goFileName), goRendered);
  }

  // Copy base template files (package.json, tsconfig.json, vite.config.ts)
  const baseTemplatePath = path.resolve(rootDir, "template/ui");
  const baseFiles = [
    "package.json",
    "tsconfig.json",
    "tsconfig.node.json",
    "vite.config.ts",
  ];

  for (const file of baseFiles) {
    const sourcePath = path.resolve(baseTemplatePath, file);
    if (fs.existsSync(sourcePath)) {
      const content = fs.readFileSync(sourcePath, "utf-8");
      const rendered = renderTemplate(content, templateContext, sourcePath);
      fs.writeFileSync(path.resolve(context.targetPath, file), rendered);
    }
  }

  // Copy type-specific template files
  const typeTemplatePath = path.resolve(
    rootDir,
    `template/ui/types/${context.standardPluginType}`
  );
  if (!fs.existsSync(typeTemplatePath)) {
    throw new Error(
      `Template not found for type: ${context.standardPluginType}`
    );
  }

  // Copy Component.tsx and index.ts
  const componentPath = path.resolve(typeTemplatePath, "Component.tsx");
  const indexPath = path.resolve(typeTemplatePath, "index.ts");

  if (fs.existsSync(componentPath)) {
    const content = fs.readFileSync(componentPath, "utf-8");
    const rendered = renderTemplate(content, templateContext, componentPath);
    fs.writeFileSync(
      path.resolve(context.targetPath, "Component.tsx"),
      rendered
    );
  }

  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, "utf-8");
    const rendered = renderTemplate(content, templateContext, indexPath);
    fs.writeFileSync(path.resolve(context.targetPath, "index.ts"), rendered);
  }

  // Copy type-specific i18n files
  const typeI18nPath = path.resolve(typeTemplatePath, "i18n");
  if (fs.existsSync(typeI18nPath)) {
    const i18nTargetPath = path.resolve(context.targetPath, "i18n");
    fs.mkdirSync(i18nTargetPath, { recursive: true });
    copyTemplateFiles(typeI18nPath, i18nTargetPath, templateContext);
  }
};

/**
 * Generate info.yaml for Standard UI Plugin
 */
export const generateInfoYaml = (context: PluginContext): void => {
  if (!context.standardPluginType) {
    return; // Backend plugins handle info.yaml in generateBackendPlugin
  }

  // Use type-specific info.yaml template
  const templatePath = path.resolve(
    rootDir,
    `template/ui/types/${context.standardPluginType}/info.yaml`
  );

  if (!fs.existsSync(templatePath)) {
    throw new Error(
      `Info.yaml template not found for type: ${context.standardPluginType}`
    );
  }

  const content = fs.readFileSync(templatePath, "utf-8");
  const rendered = renderTemplate(
    content,
    {
      info_slug_name: context.infoSlugName,
      plugin_type: context.standardPluginType,
      route_path: context.routePath || "",
    },
    templatePath
  );

  fs.writeFileSync(path.resolve(context.targetPath, "info.yaml"), rendered);
};

/**
 * Generate i18n files
 */
export const generateI18n = (context: PluginContext): void => {
  const i18nDir = path.resolve(rootDir, "template/i18n");
  const targetI18nDir = path.resolve(context.targetPath, "i18n");

  if (!fs.existsSync(i18nDir)) {
    return;
  }

  fs.mkdirSync(targetI18nDir, { recursive: true });

  const templateContext: Record<string, string> = {
    plugin_slug_name: context.pluginSlugName,
    info_slug_name: context.infoSlugName,
    plugin_display_name: context.pluginDisplayName,
    plugin_type: context.backendPluginType || context.standardPluginType || "",
    plugin_name: context.packageName,
    package_name: context.packageNameForGo,
  };

  fs.readdirSync(i18nDir).forEach((file) => {
    // Skip index.ts for backend plugins
    if (context.pluginType === "backend" && file === "index.ts") {
      return;
    }

    const sourcePath = path.resolve(i18nDir, file);
    if (fs.statSync(sourcePath).isFile()) {
      const content = fs.readFileSync(sourcePath, "utf-8");
      const rendered = renderTemplate(content, templateContext, sourcePath);
      fs.writeFileSync(path.resolve(targetI18nDir, file), rendered);
    }
  });
};

/**
 * Generate README
 */
export const generateReadme = (context: PluginContext): void => {
  const content = `# ${context.pluginDisplayName} Plugin

This is a ${
    context.pluginType === "backend"
      ? context.backendPluginType
      : context.standardPluginType
  } type plugin.

## Installation

\`\`\`bash
# Install the plugin
create-answer-plugin install ${context.packageName}
\`\`\`

## Development

See the plugin documentation for development instructions.
`;
  fs.writeFileSync(path.resolve(context.targetPath, "README.md"), content);
};

/**
 * Initialize Go module
 */
export const initGoModule = async (context: PluginContext): Promise<void> => {
  const modulePath = `github.com/apache/answer-plugins/${context.packageName}`;
  const goModPath = path.resolve(context.targetPath, "go.mod");

  // Only create go.mod if it doesn't exist
  if (!fs.existsSync(goModPath)) {
    const goModContent = `module ${modulePath}

go 1.23.0

require (
	github.com/apache/answer v1.7.0
	github.com/apache/answer-plugins/util v1.0.3-0.20250107030257-cf94ebc70954
)
`;
    fs.writeFileSync(goModPath, goModContent);
  }

  // Run go mod tidy
  const config = getConfig();
  const logger = getLogger();

  try {
    await executeCommand(config.commands.goModTidy, {
      cwd: context.targetPath,
      timeout: config.timeouts.goModTidy,
      retries: config.retries.goModTidy,
    });
    logger.debug("go mod tidy completed successfully");
  } catch (error) {
    // Ignore errors if go is not installed or module is not ready
    if (error instanceof CommandExecutionError) {
      logger.warn("go mod tidy failed, you may need to run it manually");
    } else {
      throw error;
    }
  }
};

/**
 * Install npm dependencies for Standard UI Plugin
 */
export const installNpmDependencies = async (
  context: PluginContext
): Promise<void> => {
  if (context.pluginType !== "standard") {
    return;
  }

  const config = getConfig();
  const logger = getLogger();

  try {
    await executeCommand(config.commands.pnpmInstall, {
      cwd: context.targetPath,
      timeout: config.timeouts.pnpmInstall,
      retries: config.retries.pnpmInstall,
    });
    logger.debug("pnpm install completed successfully");
  } catch (error) {
    // Ignore errors if pnpm is not installed or install fails
    if (error instanceof CommandExecutionError) {
      logger.warn("pnpm install failed, you may need to run it manually");
    } else {
      throw error;
    }
  }
};
