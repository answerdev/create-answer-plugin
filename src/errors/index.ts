/**
 * Base error class for all plugin-related errors
 */
export class PluginError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly recoverable: boolean = false
  ) {
    super(message);
    this.name = "PluginError";
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error - recoverable, user can fix input
 */
export class ValidationError extends PluginError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", true);
    this.name = "ValidationError";
  }
}

/**
 * File system error - usually not recoverable
 */
export class FileSystemError extends PluginError {
  constructor(message: string, public readonly path: string) {
    super(message, "FILE_SYSTEM_ERROR", false);
    this.name = "FileSystemError";
  }
}

/**
 * Command execution error
 */
export class CommandExecutionError extends PluginError {
  constructor(
    message: string,
    public readonly command: string,
    public readonly exitCode?: number
  ) {
    super(message, "COMMAND_EXECUTION_ERROR", true);
    this.name = "CommandExecutionError";
  }
}

/**
 * Template rendering error
 */
export class TemplateError extends PluginError {
  constructor(message: string, public readonly templatePath?: string) {
    super(message, "TEMPLATE_ERROR", false);
    this.name = "TemplateError";
  }
}

/**
 * Plugin discovery error
 */
export class PluginDiscoveryError extends PluginError {
  constructor(message: string, public readonly pluginPath?: string) {
    super(message, "PLUGIN_DISCOVERY_ERROR", true);
    this.name = "PluginDiscoveryError";
  }
}

/**
 * Configuration error
 */
export class ConfigurationError extends PluginError {
  constructor(message: string) {
    super(message, "CONFIGURATION_ERROR", true);
    this.name = "ConfigurationError";
  }
}
