import { PluginType, StandardUIPluginType, BackendPluginType } from '../config/constants.js'
import { TransformedNames } from '../utils/name-transformer.js'

export interface PluginContext extends TransformedNames {
  targetPath: string
  answerProjectPath: string
  pluginType: PluginType
  backendPluginType?: BackendPluginType
  standardPluginType?: StandardUIPluginType
  routePath?: string
}

