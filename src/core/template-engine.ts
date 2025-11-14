import fs from "fs";
import path from "path";
import { TemplateError } from "../errors/index.js";
import { getLogger } from "./logger.js";

/**
 * Renders a template string with provided context.
 * Uses more precise matching to avoid conflicts with content that contains {{}}
 */
export const renderTemplate = (
  content: string,
  context: Record<string, string>,
  templatePath?: string
): string => {
  try {
    // Use word boundary to match only complete placeholder names
    // Matches {{key}} but not {{key}}something
    let renderedContent = content;

    // First pass: replace all known placeholders
    for (const key in context) {
      const value = context[key] ?? "";
      // Escape special regex characters in key
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      // Match {{key}} with word boundaries
      const regex = new RegExp(`\\{\\{${escapedKey}\\}\\}`, "g");
      renderedContent = renderedContent.replace(regex, value);
    }

    // Second pass: check for unreplaced placeholders (warn but don't fail)
    const unreplacedMatches = renderedContent.match(/\{\{(\w+)\}\}/g);
    if (unreplacedMatches && unreplacedMatches.length > 0) {
      const missing = unreplacedMatches
        .map((m) => m.replace(/[{}]/g, ""))
        .filter((k) => !(k in context));

      if (missing.length > 0) {
        const logger = getLogger();
        logger.warn(
          `Unreplaced template variables in ${
            templatePath || "template"
          }: ${missing.join(", ")}`
        );
      }
    }

    return renderedContent;
  } catch (error) {
    throw new TemplateError(
      `Failed to render template${templatePath ? `: ${templatePath}` : ""}`,
      templatePath
    );
  }
};

/**
 * Copies template files from source to destination, rendering them with context.
 */
export const copyTemplateFiles = (
  sourceDir: string,
  destDir: string,
  context: Record<string, string>,
  fileFilter?: (file: string) => boolean
): void => {
  if (!fs.existsSync(sourceDir)) {
    return;
  }

  fs.readdirSync(sourceDir).forEach((file) => {
    if (fileFilter && !fileFilter(file)) {
      return;
    }

    const sourcePath = path.resolve(sourceDir, file);
    const destPath = path.resolve(destDir, file);

    if (fs.statSync(sourcePath).isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyTemplateFiles(sourcePath, destPath, context, fileFilter);
    } else {
      const content = fs.readFileSync(sourcePath, "utf-8");
      const rendered = renderTemplate(content, context);
      fs.writeFileSync(destPath, rendered);
    }
  });
};
