import path from 'path'
import { ConfigurationError } from '../errors/index.js'

/**
 * Application configuration interface
 */
export interface AppConfig {
  answerPaths: {
    plugins: string
    i18n: string
    mainGo: string
    goMod: string
  }
  commands: {
    goModTidy: string
    pnpmInstall: string
    i18nMerge: string
  }
  timeouts: {
    default: number
    goModTidy: number
    pnpmInstall: number
    i18nMerge: number
  }
  retries: {
    default: number
    goModTidy: number
    pnpmInstall: number
  }
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: AppConfig = {
  answerPaths: {
    plugins: 'ui/src/plugins',
    i18n: 'answer-data/i18n',
    mainGo: 'cmd/answer/main.go',
    goMod: 'go.mod',
  },
  commands: {
    goModTidy: 'go mod tidy',
    pnpmInstall: 'pnpm install',
    i18nMerge: 'go run ./cmd/answer/main.go i18n',
  },
  timeouts: {
    default: 30000, // 30 seconds
    goModTidy: 30000, // 30 seconds
    pnpmInstall: 120000, // 2 minutes
    i18nMerge: 60000, // 1 minute
  },
  retries: {
    default: 0,
    goModTidy: 1,
    pnpmInstall: 1,
  },
}

/**
 * Global configuration instance
 */
let globalConfig: AppConfig = { ...DEFAULT_CONFIG }

/**
 * Load configuration from environment variables or use defaults
 */
export function loadConfig(projectPath?: string): AppConfig {
  const config: AppConfig = { ...DEFAULT_CONFIG }

  // Override from environment variables if present
  if (process.env.ANSWER_PLUGINS_PATH) {
    config.answerPaths.plugins = process.env.ANSWER_PLUGINS_PATH
  }

  if (process.env.ANSWER_I18N_PATH) {
    config.answerPaths.i18n = process.env.ANSWER_I18N_PATH
  }

  if (process.env.GO_MOD_TIDY_TIMEOUT) {
    const timeout = parseInt(process.env.GO_MOD_TIDY_TIMEOUT, 10)
    if (!isNaN(timeout)) {
      config.timeouts.goModTidy = timeout
    }
  }

  if (process.env.PNPM_INSTALL_TIMEOUT) {
    const timeout = parseInt(process.env.PNPM_INSTALL_TIMEOUT, 10)
    if (!isNaN(timeout)) {
      config.timeouts.pnpmInstall = timeout
    }
  }

  // Validate configuration
  validateConfig(config)

  globalConfig = config
  return config
}

/**
 * Get current configuration
 */
export function getConfig(): AppConfig {
  return globalConfig
}

/**
 * Update configuration (for testing or dynamic updates)
 */
export function setConfig(config: Partial<AppConfig>): void {
  globalConfig = { ...globalConfig, ...config }
  validateConfig(globalConfig)
}

/**
 * Validate configuration values
 */
function validateConfig(config: AppConfig): void {
  // Validate paths
  if (!config.answerPaths.plugins) {
    throw new ConfigurationError('plugins path is required')
  }

  if (!config.answerPaths.i18n) {
    throw new ConfigurationError('i18n path is required')
  }

  if (!config.answerPaths.mainGo) {
    throw new ConfigurationError('mainGo path is required')
  }

  if (!config.answerPaths.goMod) {
    throw new ConfigurationError('goMod path is required')
  }

  // Validate timeouts (must be positive)
  Object.entries(config.timeouts).forEach(([key, value]) => {
    if (value <= 0) {
      throw new ConfigurationError(`Timeout for ${key} must be positive, got ${value}`)
    }
  })

  // Validate retries (must be non-negative)
  Object.entries(config.retries).forEach(([key, value]) => {
    if (value < 0) {
      throw new ConfigurationError(`Retries for ${key} must be non-negative, got ${value}`)
    }
  })
}

/**
 * Resolve path relative to project root
 */
export function resolveProjectPath(projectPath: string, relativePath: string): string {
  return path.resolve(projectPath, relativePath)
}

/**
 * Get full path for a config path
 */
export function getConfigPath(
  projectPath: string,
  pathKey: keyof AppConfig['answerPaths']
): string {
  const config = getConfig()
  return resolveProjectPath(projectPath, config.answerPaths[pathKey])
}

