/**
 * Plugin type constants
 */
export const PLUGIN_TYPES = {
  BACKEND: 'backend',
  STANDARD_UI: 'standard',
} as const

export type PluginType = typeof PLUGIN_TYPES[keyof typeof PLUGIN_TYPES]

/**
 * Backend Plugin sub-types
 */
export const BACKEND_PLUGIN_TYPES = {
  CONNECTOR: 'connector',
  STORAGE: 'storage',
  CACHE: 'cache',
  SEARCH: 'search',
  USER_CENTER: 'user-center',
  NOTIFICATION: 'notification',
  REVIEWER: 'reviewer',
} as const

export type BackendPluginType = typeof BACKEND_PLUGIN_TYPES[keyof typeof BACKEND_PLUGIN_TYPES]

/**
 * Standard UI Plugin sub-types
 */
export const STANDARD_UI_TYPES = {
  EDITOR: 'editor',
  ROUTE: 'route',
  CAPTCHA: 'captcha',
  RENDER: 'render',
} as const

export type StandardUIPluginType = typeof STANDARD_UI_TYPES[keyof typeof STANDARD_UI_TYPES]

/**
 * Template paths
 */
export const TEMPLATE_PATHS = {
  BACKEND: 'template/backend',
  STANDARD_UI_BASE: 'template/ui',
  STANDARD_UI_TYPES: 'template/ui/types',
  I18N: 'template/i18n',
} as const

/**
 * Answer project structure
 */
export const ANSWER_PATHS = {
  PLUGINS: 'ui/src/plugins',
} as const

