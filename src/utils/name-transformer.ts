import humps from 'humps'

export interface TransformedNames {
  pluginName: string // camelCase (e.g., "myPlugin")
  packageName: string // kebab-case (e.g., "my-plugin")
  pluginDisplayName: string // PascalCase (e.g., "MyPlugin")
  pluginSlugName: string // snake_case (e.g., "my_plugin")
  packageNameForGo: string // name without type prefix (e.g., "my-plugin" -> "my", "connector-github" -> "github")
  infoSlugName: string // format: {name}_{type} (e.g., "github_connector")
}

/**
 * Generate info slug name: {name}_{type}
 * e.g., "github_connector", "chart_editor"
 */
/**
 * Transform plugin name into various formats
 */
export const transformPluginName = (
  name: string,
  pluginType?: string,
  subType?: string
): TransformedNames => {
  const pluginName = humps.camelize(name)
  const packageName = humps.decamelize(pluginName, { separator: '-' })
  const pluginDisplayName = humps.pascalize(pluginName)
  const pluginSlugName = humps.decamelize(pluginName, { separator: '_' })
  const packageNameForGo = packageName.replace(/-/g, '_')
  const infoSlugName = pluginSlugName

  return {
    pluginName,
    packageName,
    pluginDisplayName,
    pluginSlugName,
    packageNameForGo,
    infoSlugName,
  }
}

