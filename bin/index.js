#!/usr/bin/env node

// This is a wrapper script that uses tsx to run the TypeScript file
// It finds tsx from node_modules
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Try to find tsx in node_modules
const tsxPaths = [
  resolve(__dirname, '../node_modules/.bin/tsx'),
  resolve(__dirname, '../../node_modules/.bin/tsx'),
  'tsx' // fallback to global tsx
]

let tsxPath = null
for (const path of tsxPaths) {
  if (path === 'tsx' || existsSync(path)) {
    tsxPath = path
    break
  }
}

if (!tsxPath) {
  console.error('Error: tsx not found. Please run "pnpm install" first.')
  process.exit(1)
}

// Spawn tsx with the TypeScript file
const tsFile = resolve(__dirname, 'index.ts')
const child = spawn(tsxPath, [tsFile, ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: true
})

child.on('exit', (code) => {
  process.exit(code || 0)
})
