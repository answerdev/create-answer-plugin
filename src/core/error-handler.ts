import ora from 'ora'
import { PluginError } from '../errors/index.js'

/**
 * Handle errors with appropriate user feedback
 */
export function handleError(error: unknown): never {
  const spinner = ora()

  if (error instanceof PluginError) {
    if (error.recoverable) {
      spinner.warn(error.message)
      process.exit(0) // Exit gracefully for recoverable errors
    } else {
      spinner.fail(error.message)
      process.exit(1)
    }
  } else if (error instanceof Error) {
    spinner.fail(`Unexpected error: ${error.message}`)
    if (error.stack) {
      console.error(error.stack)
    }
    process.exit(1)
  } else {
    spinner.fail(`Unexpected error: ${String(error)}`)
    process.exit(1)
  }
}

/**
 * Wrap async function with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args)
    } catch (error) {
      handleError(error)
    }
  }) as T
}

