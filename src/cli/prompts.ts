import prompts from "prompts";
import {
  validatePluginName,
  validateRoutePath,
  validateAnswerProjectPath,
} from "../utils/validators.js";
import {
  PLUGIN_TYPES,
  STANDARD_UI_TYPES,
  BACKEND_PLUGIN_TYPES,
} from "../config/constants.js";
import { getConfigPath } from "../config/config.js";
import path from "path";
import fs from "fs";

export interface PluginAnswers {
  pluginName: string;
  answerProjectPath: string;
  pluginType: "backend" | "standard";
  backendPluginType?:
  | "connector"
  | "storage"
  | "cache"
  | "search"
  | "user-center"
  | "notification"
  | "reviewer";
  standardPluginType?: "editor" | "route" | "captcha" | "render";
  routePath?: string;
}

/**
 * Collect plugin creation information from user
 */
export const collectPluginInfo = async (
  initialPluginName?: string
): Promise<PluginAnswers> => {
  // Step 1: Plugin name
  const { pluginName } = await prompts({
    type: "text",
    name: "pluginName",
    message: "What is the name of your plugin?",
    initial: initialPluginName || "",
    validate: (name) => {
      if (!name) {
        return "Plugin name is required";
      }
      if (!validatePluginName(name)) {
        return "Invalid plugin name, please use only letters, numbers, underscores, and hyphens, and cannot start with a number.";
      }
      return true;
    },
  });

  if (!pluginName) {
    throw new Error("Plugin name is required");
  }

  // Step 2: Answer project path
  const { answerProjectPath } = await prompts({
    type: "text",
    name: "answerProjectPath",
    message: "Path to Answer project (root directory)?",
    initial: process.cwd(),
    validate: validateAnswerProjectPath,
  });

  if (!answerProjectPath) {
    throw new Error("Answer project path is required");
  }

  // Step 3: Plugin type
  const { pluginType } = await prompts({
    type: "select",
    name: "pluginType",
    message: "What type of plugin do you want to create?",
    choices: [
      { title: "Backend Plugin", value: PLUGIN_TYPES.BACKEND },
      { title: "Standard UI Plugin", value: PLUGIN_TYPES.STANDARD_UI },
    ],
  });

  if (!pluginType) {
    throw new Error("Plugin type is required");
  }

  let backendPluginType:
    | "connector"
    | "storage"
    | "cache"
    | "search"
    | "user-center"
    | "notification"
    | "reviewer"
    | undefined;
  let standardPluginType: "editor" | "route" | "captcha" | "render" | undefined;
  let routePath: string | undefined;

  // Step 4: Backend Plugin sub-type
  if (pluginType === PLUGIN_TYPES.BACKEND) {
    const { backendType } = await prompts({
      type: "select",
      name: "backendType",
      message: "What type of Backend Plugin?",
      choices: [
        { title: "Connector", value: BACKEND_PLUGIN_TYPES.CONNECTOR },
        { title: "Storage", value: BACKEND_PLUGIN_TYPES.STORAGE },
        { title: "Cache", value: BACKEND_PLUGIN_TYPES.CACHE },
        { title: "Search", value: BACKEND_PLUGIN_TYPES.SEARCH },
        { title: "User Center", value: BACKEND_PLUGIN_TYPES.USER_CENTER },
        { title: "Notification", value: BACKEND_PLUGIN_TYPES.NOTIFICATION },
        { title: "Reviewer", value: BACKEND_PLUGIN_TYPES.REVIEWER },
      ],
    });

    if (!backendType) {
      throw new Error("Backend plugin type is required");
    }
    backendPluginType = backendType;
  }

  // Step 5: Standard UI Plugin sub-type
  if (pluginType === PLUGIN_TYPES.STANDARD_UI) {
    const { standardType } = await prompts({
      type: "select",
      name: "standardType",
      message: "What type of Standard UI Plugin?",
      choices: [
        { title: "Editor", value: STANDARD_UI_TYPES.EDITOR },
        { title: "Route", value: STANDARD_UI_TYPES.ROUTE },
        { title: "Captcha", value: STANDARD_UI_TYPES.CAPTCHA },
        { title: "Render", value: STANDARD_UI_TYPES.RENDER },
      ],
    });

    if (!standardType) {
      throw new Error("Standard UI plugin type is required");
    }

    standardPluginType = standardType;

    // Step 6: Route path (if route type)
    if (standardType === STANDARD_UI_TYPES.ROUTE) {
      const { route } = await prompts({
        type: "text",
        name: "route",
        message: "What is the route path?",
        initial: "/hello",
        validate: validateRoutePath,
      });

      if (!route) {
        throw new Error("Route path is required");
      }

      routePath = route;
    }
  }

  return {
    pluginName,
    answerProjectPath,
    pluginType: pluginType as "backend" | "standard",
    backendPluginType,
    standardPluginType,
    routePath,
  };
};
