import path from "path";
import { ValidationError } from "../errors/index.js";

/**
 * Validate that a path is within the allowed directory
 * Prevents directory traversal attacks
 */
export function validatePathWithinDirectory(
  targetPath: string,
  allowedDir: string
): void {
  const resolvedTarget = path.resolve(targetPath);
  const resolvedAllowed = path.resolve(allowedDir);

  if (!resolvedTarget.startsWith(resolvedAllowed)) {
    throw new ValidationError(
      `Path ${targetPath} is outside allowed directory ${allowedDir}`
    );
  }
}

/**
 * Sanitize command to prevent command injection
 * Only allow safe commands from whitelist
 */
const ALLOWED_COMMANDS = new Set([
  "go mod tidy",
  "go mod edit",
  "pnpm install",
  "go run",
]);

export function validateCommand(command: string): void {
  // Check if command starts with any allowed command
  const isAllowed = Array.from(ALLOWED_COMMANDS).some((allowed) =>
    command.startsWith(allowed)
  );

  if (!isAllowed) {
    throw new ValidationError(
      `Command not allowed: ${command}. Only safe commands are permitted.`
    );
  }

  // For 'go run', allow specific subcommands only
  if (command.startsWith("go run")) {
    // Only allow: go run ./cmd/answer/main.go i18n
    if (!/^go run \.\/cmd\/answer\/main\.go i18n/.test(command)) {
      throw new ValidationError(
        `Only 'go run ./cmd/answer/main.go i18n' is allowed, not: ${command}`
      );
    }
  }

  // Check for dangerous patterns (but allow parentheses for go run paths)
  const dangerousPatterns = [
    /[;&|`${}]/, // Removed () from dangerous patterns
    />\s*\w+/,
    /<\s*\w+/,
    /&&/,
    /\|\|/,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(command)) {
      throw new ValidationError(
        `Command contains dangerous pattern: ${command}`
      );
    }
  }
}

/**
 * Validate plugin name to prevent injection
 */
export function validatePluginNameSecurity(name: string): void {
  // Already validated in validators.ts, but add extra security checks
  if (name.includes("..") || name.includes("/") || name.includes("\\")) {
    throw new ValidationError("Plugin name contains invalid characters");
  }

  // Prevent reserved names
  const reservedNames = new Set(["node_modules", ".git", "..", "."]);
  if (reservedNames.has(name)) {
    throw new ValidationError(`Plugin name "${name}" is reserved`);
  }
}
