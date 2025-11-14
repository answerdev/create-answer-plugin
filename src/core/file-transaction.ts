import fs from 'fs'
import path from 'path'
import { FileSystemError } from '../errors/index.js'

/**
 * Transaction manager for file operations
 * Provides rollback capability if operations fail
 */
export class FileTransaction {
  private backups: Map<string, string> = new Map()
  private modifiedFiles: Set<string> = new Set()

  /**
   * Backup a file before modification
   */
  backup(filePath: string): void {
    const resolvedPath = path.resolve(filePath)
    
    if (this.backups.has(resolvedPath)) {
      return // Already backed up
    }

    if (fs.existsSync(resolvedPath)) {
      try {
        const content = fs.readFileSync(resolvedPath, 'utf-8')
        this.backups.set(resolvedPath, content)
      } catch (error) {
        throw new FileSystemError(
          `Failed to backup file: ${resolvedPath}`,
          resolvedPath
        )
      }
    } else {
      // Mark as new file (no backup needed, will be deleted on rollback)
      this.backups.set(resolvedPath, '')
    }
  }

  /**
   * Write file with transaction support
   */
  writeFile(filePath: string, content: string): void {
    const resolvedPath = path.resolve(filePath)
    
    // Backup if not already backed up
    if (!this.backups.has(resolvedPath)) {
      this.backup(resolvedPath)
    }

    try {
      // Ensure directory exists
      const dir = path.dirname(resolvedPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      fs.writeFileSync(resolvedPath, content, 'utf-8')
      this.modifiedFiles.add(resolvedPath)
    } catch (error) {
      this.rollback()
      throw new FileSystemError(
        `Failed to write file: ${resolvedPath}`,
        resolvedPath
      )
    }
  }

  /**
   * Commit transaction (clear backups)
   */
  commit(): void {
    this.backups.clear()
    this.modifiedFiles.clear()
  }

  /**
   * Rollback all changes
   */
  rollback(): void {
    for (const [filePath, originalContent] of this.backups) {
      try {
        if (originalContent === '') {
          // New file, delete it
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
          }
        } else {
          // Restore original content
          fs.writeFileSync(filePath, originalContent, 'utf-8')
        }
      } catch (error) {
        // Log but continue rollback
        console.error(`Failed to rollback file: ${filePath}`, error)
      }
    }
    this.backups.clear()
    this.modifiedFiles.clear()
  }

  /**
   * Check if transaction has pending changes
   */
  hasChanges(): boolean {
    return this.modifiedFiles.size > 0
  }
}

