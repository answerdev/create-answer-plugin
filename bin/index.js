#! /usr/bin/env node

import prompts from 'prompts'
import path from 'path'
import fs from 'fs'
import humps from 'humps'
import { exec } from 'child_process'
import ora from 'ora'
import { URL, fileURLToPath } from 'node:url';
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

const __dirname = path.dirname(fileURLToPath(new URL(import.meta.url)))

const args = process.argv.slice(2)

yargs(hideBin(process.argv))
  .command('[pluginName]', 'create a plugin', (yargs) => {
    yargs.positional('pluginName', {
      type: 'string',
      default: '',
      describe: 'plugin name',
    })
  })
  .help()
  .alias('help', 'h').argv

const selectPluginType = [
  {
    type: 'text',
    name: 'pluginName',
    message: 'What is the name of your plugin?',
    initial: args[0] || '',
    validate: (name) => {
      if (!name) {
        return 'Plugin name is required'
      }
      if (!validatePluginName(name)) {
        return 'Invalid plugin name, please use only letters, numbers, underscores, and hyphens, and cannot start with a number.'
      }
      return true
    },
  },
  {
    type: 'select',
    name: 'pluginType',
    message: 'What type of plugin do you want to create?',
    choices: [
      { title: 'Backend Plugin', value: 'backend' },
      { title: 'Standard UI Plugin', value: 'standard' },
    ],
  },
]

const validatePluginName = (name) => {
  const reg = /^[a-zA-Z_][a-zA-Z0-9_-]*$/
  return reg.test(name)
}

const createPluginDir = async (name) => {
  const pluginName = humps.camelize(name)
  const packageName = humps.decamelize(pluginName, { separator: '-' })
  const pluginDisplayName = humps.pascalize(pluginName)
  const pluginSlugName = humps.decamelize(pluginName, { separator: '_' })
  const targetPath = path.resolve(process.cwd(), packageName)

  fs.mkdirSync(targetPath)
  return {
    pluginName,
    packageName,
    pluginDisplayName,
    pluginSlugName,
    targetPath,
  }
}

const createBackendPlugin = async ({
  pluginName,
  pluginDisplayName,
  pluginSlugName,
  targetPath,
}) => {
  const templatePath = path.resolve(__dirname, '../template/plugin.go')
  const content = fs.readFileSync(templatePath, 'utf-8')
  const result = content
    .replace(/{{plugin_display_name}}/g, pluginDisplayName)
    .replace(/{{plugin_slug_name}}/g, pluginSlugName)

  fs.writeFileSync(path.resolve(targetPath, `${pluginName}.go`), result)
}

const createStandardPlugin = async ({ packageName, pluginSlugName, targetPath }) => {
  const templatePath = path.resolve(__dirname, '../template/ui')
  fs.readdirSync(templatePath).forEach((file) => {
    const content = fs.readFileSync(path.resolve(templatePath, file), 'utf-8')
    const result = content
      .replace(/{{plugin_name}}/g, packageName)
      .replace(/{{plugin_slug_name}}/g, pluginSlugName)
    fs.writeFileSync(path.resolve(targetPath, file), result)
  })
}

const createI18n = async ({ pluginSlugName, targetPath, pluginType }) => {
  const i18nDir = path.resolve(__dirname, '../template/i18n')
  fs.mkdirSync(path.resolve(targetPath, 'i18n'))
  fs.readdirSync(i18nDir).forEach((file) => {
    if (pluginType === 'backend' && file === 'index.ts') return
    const content = fs.readFileSync(path.resolve(i18nDir, file), 'utf-8')
    const result = content.replace(/{{plugin_slug_name}}/g, pluginSlugName)
    fs.writeFileSync(path.resolve(targetPath, 'i18n', file), result)
  })
}

const createInfoYaml = async ({ pluginSlugName, targetPath }) => {
  const infoYamlTemplate = path.resolve(__dirname, '../template/ui/info.yaml')
  const content = fs.readFileSync(infoYamlTemplate, 'utf-8')
  const result = content.replace(/{{plugin_slug_name}}/g, pluginSlugName)

  fs.writeFileSync(path.resolve(targetPath, 'info.yaml'), result)
}

const createReadme = async ({ pluginName, targetPath }) => {
  const name = humps.pascalize(pluginName)
  const content = `# ${name} Plugin`
  fs.writeFileSync(path.resolve(targetPath, 'README.md'), content)
}
const installGoMod = async ({ packageName }) => {
  process.chdir(path.resolve(process.cwd(), packageName))
  await exec(`go mod init github.com/apache/incubator-answer-plugins/${packageName} && go mod tidy`)
}

const installNpm = async () => {
  await exec(`pnpm install`)
}

;(async () => {
  const { pluginType, pluginName } = await prompts(selectPluginType)

  if (!pluginType || !pluginName) {
    return
  }
  
  const result = await createPluginDir(pluginName)
  createI18n({
    ...result,
    pluginType,
  })
  if (pluginType === 'standard') {
    await createStandardPlugin(result)

    const spinner = ora('Loading unicorns').start()
    await installNpm()
    spinner.succeed('Unicorns loaded')
  }

  await createBackendPlugin(result)
  await installGoMod(result)

  await createInfoYaml(result)
  await createReadme(result)
})()

