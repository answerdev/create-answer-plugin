#!/usr/bin/env tsx

/*
 * Create All Plugin Types Script
 *
 * This script creates example plugins for all supported types.
 *
 * Usage:
 *   tsx scripts/create-all-plugin-types.ts [answer-project-path]
 */

import path from "path";
import fs from "fs";
import ora from "ora";
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
import { PLUGIN_TYPES, ANSWER_PATHS } from "../src/config/constants.js";

const ANSWER_PROJECT_PATH = process.argv[2] || "/Users/robin/Projects/answer";
const PLUGINS_PATH = path.resolve(ANSWER_PROJECT_PATH, ANSWER_PATHS.PLUGINS);

// Backend Plugin types
const BACKEND_PLUGINS = [
  { type: "connector", name: "demo-connector" },
  { type: "storage", name: "demo-storage" },
  { type: "cache", name: "demo-cache" },
  { type: "search", name: "demo-search" },
  { type: "user-center", name: "demo-user-center" },
  { type: "notification", name: "demo-notification" },
  { type: "reviewer", name: "demo-reviewer" },
];

// Standard UI Plugin types
const STANDARD_UI_PLUGINS = [
  { type: "editor", name: "demo-editor", routePath: undefined },
  { type: "route", name: "demo-route", routePath: "/demo-route" },
  { type: "captcha", name: "demo-captcha", routePath: undefined },
  { type: "render", name: "demo-render", routePath: undefined },
];

interface PluginResult {
  name: string;
  type: string;
  success: boolean;
  error?: string;
}

const results: PluginResult[] = [];

/**
 * Create a Backend Plugin
 */
async function createBackendPlugin(
  type: string,
  name: string
): Promise<boolean> {
  try {
    const spinner = ora(`Creating Backend Plugin: ${type} (${name})`).start();

    // Check if plugin already exists
    const nameInfo = transformPluginName(name, "backend", type);
    const pluginPath = path.resolve(PLUGINS_PATH, nameInfo.packageName);

    if (fs.existsSync(pluginPath)) {
      spinner.warn(`${nameInfo.packageName} already exists, skipping...`);
      results.push({
        name: nameInfo.packageName,
        type: `backend-${type}`,
        success: true,
      });
      return true;
    }

    // Build plugin context
    const context: PluginContext = {
      ...nameInfo,
      targetPath: pluginPath,
      answerProjectPath: ANSWER_PROJECT_PATH,
      pluginType: PLUGIN_TYPES.BACKEND,
      backendPluginType: type as any,
    };

    // Create plugin
    createPluginDirectory(context);
    generateI18n(context);
    generateBackendPlugin(context);
    await initGoModule(context);
    generateReadme(context);

    spinner.succeed(`Created: ${nameInfo.packageName}`);
    results.push({
      name: nameInfo.packageName,
      type: `backend-${type}`,
      success: true,
    });
    return true;
  } catch (error: any) {
    const spinner = ora();
    spinner.fail(`Failed to create ${name}`);
    results.push({
      name,
      type: `backend-${type}`,
      success: false,
      error: error.message || "Unknown error",
    });
    return false;
  }
}

/**
 * Create a Standard UI Plugin
 */
async function createStandardUIPlugin(
  type: string,
  name: string,
  routePath?: string
): Promise<boolean> {
  try {
    const spinner = ora(
      `Creating Standard UI Plugin: ${type} (${name})`
    ).start();

    // Check if plugin already exists
    const nameInfo = transformPluginName(name, "standard", type);
    const pluginPath = path.resolve(PLUGINS_PATH, nameInfo.packageName);

    if (fs.existsSync(pluginPath)) {
      spinner.warn(`${nameInfo.packageName} already exists, skipping...`);
      results.push({
        name: nameInfo.packageName,
        type: `standard-ui-${type}`,
        success: true,
      });
      return true;
    }

    // Build plugin context
    const context: PluginContext = {
      ...nameInfo,
      targetPath: pluginPath,
      answerProjectPath: ANSWER_PROJECT_PATH,
      pluginType: PLUGIN_TYPES.STANDARD_UI,
      standardPluginType: type as any,
      routePath,
    };

    // Create plugin
    createPluginDirectory(context);
    generateI18n(context);
    generateStandardUIPlugin(context);
    generateInfoYaml(context);
    await installNpmDependencies(context);
    await initGoModule(context);
    generateReadme(context);

    spinner.succeed(`Created: ${nameInfo.packageName}`);
    results.push({
      name: nameInfo.packageName,
      type: `standard-ui-${type}`,
      success: true,
    });
    return true;
  } catch (error: any) {
    const spinner = ora();
    spinner.fail(`Failed to create ${name}`);
    results.push({
      name,
      type: `standard-ui-${type}`,
      success: false,
      error: error.message || "Unknown error",
    });
    return false;
  }
}

/**
 * Main function
 */
async function createAllPlugins(): Promise<void> {
  console.log(`\n🚀 Creating all plugin types in: ${PLUGINS_PATH}\n`);

  // Check if plugins directory exists
  if (!fs.existsSync(PLUGINS_PATH)) {
    console.error(`❌ Plugins directory not found: ${PLUGINS_PATH}`);
    console.error(
      `   Please ensure the Answer project path is correct: ${ANSWER_PROJECT_PATH}`
    );
    process.exit(1);
  }

  // Create Backend Plugins
  console.log("📦 Creating Backend Plugins...\n");
  for (const plugin of BACKEND_PLUGINS) {
    await createBackendPlugin(plugin.type, plugin.name);
    // Small delay to avoid overwhelming the system
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  // Create Standard UI Plugins
  console.log("\n📦 Creating Standard UI Plugins...\n");
  for (const plugin of STANDARD_UI_PLUGINS) {
    await createStandardUIPlugin(plugin.type, plugin.name, plugin.routePath);
    // Small delay to avoid overwhelming the system
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("Creation Summary");
  console.log("=".repeat(60) + "\n");

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  successful.forEach((r) => {
    console.log(`   - ${r.name} (${r.type})`);
  });

  if (failed.length > 0) {
    console.log(`\n❌ Failed: ${failed.length}`);
    failed.forEach((r) => {
      console.log(`   - ${r.name} (${r.type})`);
      if (r.error) {
        console.log(`     Error: ${r.error}`);
      }
    });
  }

  console.log("\n" + "=".repeat(60) + "\n");

  if (failed.length > 0) {
    console.log(
      "⚠️  Some plugins failed to create. Please check the errors above."
    );
    process.exit(1);
  } else {
    console.log("✅ All plugins created successfully!");
    console.log(`\nYou can now verify them with:`);
    console.log(`  pnpm verify:all ${ANSWER_PROJECT_PATH}`);
  }
}

createAllPlugins().catch((error) => {
  console.error("Failed to create plugins:", error);
  process.exit(1);
});
