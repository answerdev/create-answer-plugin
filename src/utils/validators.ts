import fs from "fs";
import { getConfigPath } from "../config/config.js";

/**
 * Validate plugin name
 */
export const validatePluginName = (name: string): boolean => {
  const reg = /^[a-zA-Z_][a-zA-Z0-9_-]*$/;
  return reg.test(name);
};

/**
 * Validate route path
 */
export const validateRoutePath = (routePath: string): string | true => {
  if (!routePath) {
    return "Route path is required";
  }
  if (!routePath.startsWith("/")) {
    return "Route path must start with /";
  }
  return true;
};

/**
 * Validate Answer project path
 */
export const validateAnswerProjectPath = (
  projectPath: string
): string | true => {
  if (!projectPath) {
    return "Answer project path is required";
  }

  const pluginsPath = getConfigPath(projectPath, "plugins");

  if (!fs.existsSync(pluginsPath)) {
    return `Path ${pluginsPath} does not exist. Please provide a valid Answer project path.`;
  }
  return true;
};
