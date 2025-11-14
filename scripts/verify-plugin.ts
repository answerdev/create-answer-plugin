#!/usr/bin/env tsx

/*
 * Plugin Verification Script
 * 
 * This script verifies that generated plugins are valid and can be used in Answer project.
 * 
 * Usage:
 *   tsx scripts/verify-plugin.ts <plugin-name> [answer-project-path]
 */

import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import ora from 'ora'

const execAsync = promisify(exec)

// Parse command line arguments
const args = process.argv.slice(2)
const hasCheckIntegration = args.includes('--check-integration')
const filteredArgs = args.filter(arg => arg !== '--check-integration')

const ANSWER_PROJECT_PATH = filteredArgs[1] || '/Users/robin/Projects/answer'
const PLUGIN_NAME = filteredArgs[0]

if (!PLUGIN_NAME) {
  console.error('Usage: tsx scripts/verify-plugin.ts <plugin-name> [answer-project-path] [--check-integration]')
  console.error('')
  console.error('Options:')
  console.error('  --check-integration  Also check if plugin is integrated in Answer project')
  process.exit(1)
}

const PLUGINS_PATH = path.resolve(ANSWER_PROJECT_PATH, 'ui/src/plugins')
const PLUGIN_PATH = path.resolve(PLUGINS_PATH, PLUGIN_NAME)

interface VerificationResult {
  step: string
  success: boolean
  message: string
}

const results: VerificationResult[] = []

/**
 * Check if plugin directory exists
 */
function checkPluginExists(): boolean {
  const exists = fs.existsSync(PLUGIN_PATH)
  results.push({
    step: 'Plugin Directory',
    success: exists,
    message: exists ? `Plugin directory exists: ${PLUGIN_PATH}` : `Plugin directory not found: ${PLUGIN_PATH}`,
  })
  return exists
}

/**
 * Check if plugin has required files
 */
function checkRequiredFiles(): boolean {
  const goFiles = fs.readdirSync(PLUGIN_PATH).filter(f => f.endsWith('.go'))
  const requiredFiles = {
    'Go file': goFiles.length > 0,
    'info.yaml': fs.existsSync(path.resolve(PLUGIN_PATH, 'info.yaml')),
    'go.mod': fs.existsSync(path.resolve(PLUGIN_PATH, 'go.mod')),
  }

  let allExist = true
  for (const [file, exists] of Object.entries(requiredFiles)) {
    results.push({
      step: `Required File: ${file}`,
      success: exists,
      message: exists ? `${file} exists` : `${file} not found`,
    })
    if (!exists) allExist = false
  }

  return allExist
}

/**
 * Check if info.yaml is valid
 */
function checkInfoYaml(): boolean {
  try {
    const infoPath = path.resolve(PLUGIN_PATH, 'info.yaml')
    if (!fs.existsSync(infoPath)) {
      results.push({
        step: 'info.yaml Validation',
        success: false,
        message: 'info.yaml not found',
      })
      return false
    }

    const content = fs.readFileSync(infoPath, 'utf-8')
    
    // Check for required fields
    const hasSlugName = content.includes('slug_name:')
    const hasType = content.includes('type:')
    const hasVersion = content.includes('version:')

    const isValid = hasSlugName && hasType && hasVersion

    results.push({
      step: 'info.yaml Validation',
      success: isValid,
      message: isValid 
        ? 'info.yaml contains required fields (slug_name, type, version)'
        : `info.yaml missing required fields. Has slug_name: ${hasSlugName}, type: ${hasType}, version: ${hasVersion}`,
    })

    return isValid
  } catch (error: any) {
    results.push({
      step: 'info.yaml Validation',
      success: false,
      message: `Error reading info.yaml: ${error.message}`,
    })
    return false
  }
}

/**
 * Check if Go file has correct package name
 */
function checkGoPackage(): boolean {
  try {
    const goFiles = fs.readdirSync(PLUGIN_PATH).filter(f => f.endsWith('.go'))
    
    if (goFiles.length === 0) {
      results.push({
        step: 'Go Package Check',
        success: false,
        message: 'No Go files found',
      })
      return false
    }

    const goFile = goFiles[0]
    const content = fs.readFileSync(path.resolve(PLUGIN_PATH, goFile), 'utf-8')
    
    // Check if package declaration exists
    const packageMatch = content.match(/^package\s+(\w+)/m)
    
    if (!packageMatch) {
      results.push({
        step: 'Go Package Check',
        success: false,
        message: 'No package declaration found in Go file',
      })
      return false
    }

    const packageName = packageMatch[1]
    
    // Check if package name doesn't contain hyphens (Go requirement)
    const isValid = !packageName.includes('-')

    results.push({
      step: 'Go Package Check',
      success: isValid,
      message: isValid 
        ? `Package name is valid: ${packageName}`
        : `Package name contains invalid characters: ${packageName}`,
    })

    return isValid
  } catch (error: any) {
    results.push({
      step: 'Go Package Check',
      success: false,
      message: `Error checking Go package: ${error.message}`,
    })
    return false
  }
}

/**
 * Check if go.mod is valid
 */
function checkGoMod(): boolean {
  try {
    const goModPath = path.resolve(PLUGIN_PATH, 'go.mod')
    if (!fs.existsSync(goModPath)) {
      results.push({
        step: 'go.mod Validation',
        success: false,
        message: 'go.mod not found',
      })
      return false
    }

    const content = fs.readFileSync(goModPath, 'utf-8')
    
    // Check for module declaration
    const hasModule = content.includes('module ')
    const hasGoVersion = content.includes('go ')

    const isValid = hasModule && hasGoVersion

    results.push({
      step: 'go.mod Validation',
      success: isValid,
      message: isValid 
        ? 'go.mod is valid'
        : `go.mod missing required fields. Has module: ${hasModule}, has go version: ${hasGoVersion}`,
    })

    return isValid
  } catch (error: any) {
    results.push({
      step: 'go.mod Validation',
      success: false,
      message: `Error reading go.mod: ${error.message}`,
    })
    return false
  }
}

/**
 * Try to compile the plugin
 */
async function checkGoCompilation(): Promise<boolean> {
  try {
    const spinner = ora('Compiling plugin...').start()
    
    // Try to run go mod tidy
    try {
      await execAsync('go mod tidy', { cwd: PLUGIN_PATH, timeout: 10000 })
    } catch (error) {
      // Ignore errors, just try to compile
    }

    // Try to build the plugin
    try {
      await execAsync('go build .', { cwd: PLUGIN_PATH, timeout: 10000 })
      spinner.succeed('Plugin compiles successfully')
      results.push({
        step: 'Go Compilation',
        success: true,
        message: 'Plugin compiles without errors',
      })
      return true
    } catch (error: any) {
      spinner.fail('Plugin compilation failed')
      results.push({
        step: 'Go Compilation',
        success: false,
        message: `Compilation error: ${error.stderr || error.message}`,
      })
      return false
    }
  } catch (error: any) {
    results.push({
      step: 'Go Compilation',
      success: false,
      message: `Error during compilation: ${error.message}`,
    })
    return false
  }
}

/**
 * Check if plugin can be imported in Answer project
 */
async function checkAnswerIntegration(): Promise<boolean> {
  try {
    const mainGoPath = path.resolve(ANSWER_PROJECT_PATH, 'cmd/answer/main.go')
    const goModPath = path.resolve(ANSWER_PROJECT_PATH, 'go.mod')

    if (!fs.existsSync(mainGoPath) || !fs.existsSync(goModPath)) {
      results.push({
        step: 'Answer Integration',
        success: false,
        message: 'Answer project files not found',
      })
      return false
    }

    const importPath = `github.com/apache/answer-plugins/${PLUGIN_NAME}`
    
    // Check if plugin is already imported
    const mainGoContent = fs.readFileSync(mainGoPath, 'utf-8')
    const isImported = mainGoContent.includes(importPath)

    // Check if replace directive exists
    const goModContent = fs.readFileSync(goModPath, 'utf-8')
    const hasReplace = goModContent.includes(`replace ${importPath}`)

    if (!isImported || !hasReplace) {
      results.push({
        step: 'Answer Integration',
        success: false,
        message: `Plugin not integrated. Imported: ${isImported}, Replace directive: ${hasReplace}`,
      })
      return false
    }

    // Try to build Answer project
    const spinner = ora('Building Answer project...').start()
    try {
      await execAsync('go build ./cmd/answer/main.go', { 
        cwd: ANSWER_PROJECT_PATH, 
        timeout: 30000 
      })
      spinner.succeed('Answer project builds successfully with plugin')
      results.push({
        step: 'Answer Integration',
        success: true,
        message: 'Plugin integrated and Answer project builds successfully',
      })
      return true
    } catch (error: any) {
      spinner.fail('Answer project build failed')
      results.push({
        step: 'Answer Integration',
        success: false,
        message: `Build error: ${error.stderr || error.message}`,
      })
      return false
    }
  } catch (error: any) {
    results.push({
      step: 'Answer Integration',
      success: false,
      message: `Error checking integration: ${error.message}`,
    })
    return false
  }
}

/**
 * Main verification function
 */
async function verifyPlugin(): Promise<void> {
  console.log(`\n🔍 Verifying plugin: ${PLUGIN_NAME}`)
  console.log(`📁 Plugin path: ${PLUGIN_PATH}`)
  console.log(`📁 Answer project: ${ANSWER_PROJECT_PATH}\n`)

  // Step 1: Check if plugin exists
  if (!checkPluginExists()) {
    printResults()
    process.exit(1)
  }

  // Step 2: Check required files
  if (!checkRequiredFiles()) {
    printResults()
    process.exit(1)
  }

  // Step 3: Validate info.yaml
  checkInfoYaml()

  // Step 4: Check Go package
  checkGoPackage()

  // Step 5: Validate go.mod
  checkGoMod()

  // Step 6: Try to compile
  await checkGoCompilation()

  // Step 7: Check Answer integration (optional)
  if (hasCheckIntegration) {
    await checkAnswerIntegration()
  }

  // Print results
  printResults()

  // Exit with appropriate code
  const allPassed = results.every(r => r.success)
  process.exit(allPassed ? 0 : 1)
}

/**
 * Print verification results
 */
function printResults(): void {
  console.log('\n' + '='.repeat(60))
  console.log('Verification Results')
  console.log('='.repeat(60) + '\n')

  results.forEach((result, index) => {
    const icon = result.success ? '✅' : '❌'
    const color = result.success ? '\x1b[32m' : '\x1b[31m'
    const reset = '\x1b[0m'
    
    console.log(`${icon} ${index + 1}. ${result.step}`)
    console.log(`   ${color}${result.message}${reset}\n`)
  })

  const passed = results.filter(r => r.success).length
  const total = results.length
  const percentage = ((passed / total) * 100).toFixed(1)

  console.log('='.repeat(60))
  console.log(`Summary: ${passed}/${total} checks passed (${percentage}%)`)
  console.log('='.repeat(60) + '\n')
}

// Run verification
verifyPlugin().catch((error) => {
  console.error('Verification failed:', error)
  process.exit(1)
})

