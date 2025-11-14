#!/usr/bin/env tsx

/*
 * Verify All Plugins Script
 * 
 * This script verifies all plugins in the Answer project's plugins directory.
 * 
 * Usage:
 *   tsx scripts/verify-all-plugins.ts [answer-project-path]
 */

import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import ora from 'ora'

const execAsync = promisify(exec)

const ANSWER_PROJECT_PATH = process.argv[2] || '/Users/robin/Projects/answer'
const PLUGINS_PATH = path.resolve(ANSWER_PROJECT_PATH, 'ui/src/plugins')

interface PluginResult {
  name: string
  success: boolean
  errors: string[]
}

/**
 * Verify a single plugin
 */
async function verifyPlugin(pluginName: string): Promise<PluginResult> {
  const pluginPath = path.resolve(PLUGINS_PATH, pluginName)
  const errors: string[] = []

  // Check if plugin directory exists
  if (!fs.existsSync(pluginPath)) {
    return {
      name: pluginName,
      success: false,
      errors: ['Plugin directory not found'],
    }
  }

  // Check required files
  const goFiles = fs.readdirSync(pluginPath).filter(f => f.endsWith('.go'))
  if (goFiles.length === 0) {
    errors.push('No Go files found')
  }

  if (!fs.existsSync(path.resolve(pluginPath, 'info.yaml'))) {
    errors.push('info.yaml not found')
  }

  if (!fs.existsSync(path.resolve(pluginPath, 'go.mod'))) {
    errors.push('go.mod not found')
  }

  // Check info.yaml
  try {
    const infoContent = fs.readFileSync(path.resolve(pluginPath, 'info.yaml'), 'utf-8')
    if (!infoContent.includes('slug_name:')) errors.push('info.yaml missing slug_name')
    if (!infoContent.includes('type:')) errors.push('info.yaml missing type')
    if (!infoContent.includes('version:')) errors.push('info.yaml missing version')
  } catch (error) {
    errors.push('Cannot read info.yaml')
  }

  // Check Go compilation
  try {
    await execAsync('go build .', { cwd: pluginPath, timeout: 10000 })
  } catch (error: any) {
    errors.push(`Go compilation failed: ${error.stderr || error.message}`)
  }

  return {
    name: pluginName,
    success: errors.length === 0,
    errors,
  }
}

/**
 * Main function
 */
async function verifyAllPlugins(): Promise<void> {
  console.log(`\n🔍 Verifying all plugins in: ${PLUGINS_PATH}\n`)

  if (!fs.existsSync(PLUGINS_PATH)) {
    console.error(`❌ Plugins directory not found: ${PLUGINS_PATH}`)
    process.exit(1)
  }

  const plugins = fs.readdirSync(PLUGINS_PATH).filter(item => {
    const itemPath = path.resolve(PLUGINS_PATH, item)
    return fs.statSync(itemPath).isDirectory()
  })

  if (plugins.length === 0) {
    console.log('No plugins found')
    process.exit(0)
  }

  console.log(`Found ${plugins.length} plugin(s):\n`)

  const results: PluginResult[] = []

  for (const plugin of plugins) {
    const spinner = ora(`Verifying ${plugin}...`).start()
    const result = await verifyPlugin(plugin)
    results.push(result)

    if (result.success) {
      spinner.succeed(`${plugin} - ✅ Valid`)
    } else {
      spinner.fail(`${plugin} - ❌ Invalid`)
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60))
  console.log('Verification Summary')
  console.log('='.repeat(60) + '\n')

  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)

  console.log(`✅ Successful: ${successful.length}`)
  successful.forEach(r => {
    console.log(`   - ${r.name}`)
  })

  if (failed.length > 0) {
    console.log(`\n❌ Failed: ${failed.length}`)
    failed.forEach(r => {
      console.log(`   - ${r.name}`)
      r.errors.forEach(error => {
        console.log(`     • ${error}`)
      })
    })
  }

  console.log('\n' + '='.repeat(60) + '\n')

  process.exit(failed.length > 0 ? 1 : 0)
}

verifyAllPlugins().catch((error) => {
  console.error('Verification failed:', error)
  process.exit(1)
})

