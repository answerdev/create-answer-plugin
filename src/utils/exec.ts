import { exec, ExecOptions } from "child_process";
import { promisify } from "util";
import { CommandExecutionError } from "../errors/index.js";
import { validateCommand } from "./security.js";

const execAsync = promisify(exec);

export interface ExecuteOptions extends ExecOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

/**
 * Execute a shell command with timeout and retry support
 */
export const executeCommand = async (
  command: string,
  options?: ExecuteOptions
): Promise<string> => {
  // Validate command security
  validateCommand(command);

  const timeout = options?.timeout ?? 30000; // 30 seconds default
  const retries = options?.retries ?? 0;
  const retryDelay = options?.retryDelay ?? 1000;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Command timeout after ${timeout}ms`));
        }, timeout);
      });

      // Execute command with timeout
      const result = await Promise.race([
        execAsync(command, options),
        timeoutPromise,
      ]);

      // Ensure stdout is a string
      const stdout = typeof result.stdout === 'string' 
        ? result.stdout 
        : result.stdout.toString('utf-8');
      return stdout.trim();
    } catch (error: any) {
      lastError = error;

      // Don't retry on last attempt
      if (attempt === retries) {
        break;
      }

      // Wait before retry (exponential backoff)
      const delay = retryDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // All retries exhausted
  const exitCode = (lastError as any)?.code;
  throw new CommandExecutionError(
    `Command failed after ${retries + 1} attempt(s): ${command}\n${
      lastError?.message || ""
    }`,
    command,
    exitCode
  );
};
