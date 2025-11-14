/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

/**
 * Logger interface
 */
export interface ILogger {
  debug(message: string, ...args: any[]): void
  info(message: string, ...args: any[]): void
  warn(message: string, ...args: any[]): void
  error(message: string, ...args: any[]): void
  setLevel(level: LogLevel): void
}

/**
 * Simple console logger implementation
 */
class Logger implements ILogger {
  private level: LogLevel = LogLevel.INFO

  constructor(initialLevel?: LogLevel) {
    if (initialLevel !== undefined) {
      this.level = initialLevel
    } else {
      // Set level from environment variable
      const envLevel = process.env.LOG_LEVEL?.toUpperCase()
      if (envLevel && envLevel in LogLevel) {
        this.level = LogLevel[envLevel as keyof typeof LogLevel]
      }
    }
  }

  setLevel(level: LogLevel): void {
    this.level = level
  }

  debug(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(`[DEBUG] ${message}`, ...args)
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.info(`[INFO] ${message}`, ...args)
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(`[WARN] ${message}`, ...args)
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(`[ERROR] ${message}`, ...args)
    }
  }
}

/**
 * Global logger instance
 */
let globalLogger: ILogger = new Logger()

/**
 * Get the global logger instance
 */
export function getLogger(): ILogger {
  return globalLogger
}

/**
 * Set the global logger instance (useful for testing)
 */
export function setLogger(logger: ILogger): void {
  globalLogger = logger
}

/**
 * Create a new logger instance
 */
export function createLogger(level?: LogLevel): ILogger {
  return new Logger(level)
}

