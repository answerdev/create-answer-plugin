# Create Answer Plugin

[中文](README.zh_CN.md) | English

A powerful CLI tool for creating and managing plugins for the [Apache Answer](https://github.com/apache/answer) project. This tool provides scaffolding for both Backend Plugins and Standard UI Plugins, along with plugin lifecycle management.

## Features

- 🚀 **Interactive Plugin Creation**: Create plugins with an interactive CLI
- 📦 **Multiple Plugin Types**: Support for 7 Backend Plugin types and 4 Standard UI Plugin types
- 🔧 **Plugin Management**: List, install, and uninstall plugins
- 🛡️ **Type Safety**: Built with TypeScript for better type safety
- 🔒 **Security**: Built-in security validation and command sanitization
- 📝 **Auto-generated Templates**: Hello World examples for all plugin types

## Installation

### Global Installation

```bash
npm install -g answer-plugin
# or
pnpm add -g answer-plugin
```

### Usage with npx (Recommended)

```bash
npx answer-plugin <command>
```

## Commands

### Create Plugin

Create a new plugin with an interactive wizard:

```bash
answer-plugin create [pluginName]
# or
answer-plugin [pluginName]
```

**Options:**
- `pluginName` (optional): Pre-fill the plugin name
- `--path, -p`: Path to Answer project (root directory)

**Example:**
```bash
answer-plugin create my-plugin
```

### List Plugins

List all plugins in the Answer project:

```bash
answer-plugin list [path]
```

**Options:**
- `path` (optional): Path to Answer project (defaults to current directory)

**Example:**
```bash
answer-plugin list
answer-plugin list /path/to/answer
```

### Install Plugins

Install plugins to the Answer project:

```bash
answer-plugin install [plugins...] [--path <path>]
```

**Options:**
- `plugins` (optional): Plugin names to install (defaults to all not installed plugins)
- `--path, -p`: Path to Answer project

**Example:**
```bash
# Install all not installed plugins
answer-plugin install

# Install specific plugins
answer-plugin install my-plugin another-plugin
```

### Uninstall Plugins

Uninstall plugins from the Answer project:

```bash
answer-plugin uninstall [plugins...] [--path <path>]
```

**Options:**
- `plugins` (optional): Plugin names to uninstall (defaults to all installed plugins)
- `--path, -p`: Path to Answer project

**Example:**
```bash
# Uninstall all installed plugins
answer-plugin uninstall

# Uninstall specific plugins
answer-plugin uninstall my-plugin another-plugin
```

## Supported Plugin Types

### Backend Plugins

Backend plugins extend Answer's backend functionality:

1. **Connector** - OAuth/SSO integration plugins
2. **Storage** - File storage plugins (e.g., S3, OSS)
3. **Cache** - Caching plugins (e.g., Redis, Memcached)
4. **Search** - Search engine plugins (e.g., Elasticsearch, Meilisearch)
5. **User Center** - User management plugins
6. **Notification** - Notification service plugins (e.g., Email, SMS)
7. **Reviewer** - Content review plugins

### Standard UI Plugins

Standard UI plugins extend Answer's frontend UI:

1. **Editor** - Rich text editor plugins
2. **Route** - Custom route/page plugins
3. **Captcha** - Captcha verification plugins
4. **Render** - Content rendering plugins

## Usage Examples

### Create a Backend Plugin

```bash
answer-plugin create github-connector
```

The tool will guide you through:
1. Plugin name (pre-filled if provided)
2. Answer project path
3. Plugin type (Backend or Standard UI)
4. Sub-type selection (e.g., Connector, Storage, etc.)

### Create a Standard UI Plugin

```bash
answer-plugin create my-custom-route
```

For Route plugins, you'll also be prompted for the route path.

### Manage Plugins

```bash
# List all plugins
answer-plugin list

# Install all plugins
answer-plugin install

# Install specific plugins
answer-plugin install plugin1 plugin2

# Uninstall plugins
answer-plugin uninstall plugin1
```

## Configuration

The tool supports configuration through environment variables:

- `ANSWER_PLUGINS_PATH`: Custom plugins directory path (default: `ui/src/plugins`)
- `ANSWER_I18N_PATH`: Custom i18n directory path (default: `answer-data/i18n`)
- `GO_MOD_TIDY_TIMEOUT`: Timeout for `go mod tidy` in milliseconds (default: 30000)
- `PNPM_INSTALL_TIMEOUT`: Timeout for `pnpm install` in milliseconds (default: 120000)
- `LOG_LEVEL`: Logging level - `DEBUG`, `INFO`, `WARN`, `ERROR`, `SILENT` (default: `INFO`)

## Generated Plugin Structure

### Backend Plugin

```
ui/src/plugins/my-plugin/
├── my_plugin.go          # Main plugin implementation
├── info.yaml             # Plugin metadata
├── go.mod                # Go module definition
├── i18n/                 # Internationalization files
│   ├── en_US.yaml
│   ├── zh_CN.yaml
│   └── translation.go
└── README.md             # Plugin documentation
```

### Standard UI Plugin

```
ui/src/plugins/my-plugin/
├── my_plugin.go          # Go wrapper
├── info.yaml             # Plugin metadata
├── Component.tsx         # React component
├── index.ts              # Plugin entry point
├── package.json          # npm dependencies
├── tsconfig.json         # TypeScript config
├── vite.config.ts        # Vite config
├── i18n/                 # Internationalization files
│   ├── en_US.yaml
│   ├── zh_CN.yaml
│   └── index.ts
└── README.md             # Plugin documentation
```

## Development

### Local Development

```bash
# Clone the repository
git clone https://github.com/answerdev/create-answer-plugin.git
cd create-answer-plugin

# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Build
pnpm build
```

### Testing

```bash
# Verify a single plugin
pnpm verify <plugin-name>

# Verify all plugins
pnpm verify:all

# Create all plugin types for testing
pnpm create:all
```

## How It Works

1. **Plugin Creation**: The tool generates plugin scaffolding based on the selected type, including:
   - Go implementation files (for Backend plugins)
   - React/TypeScript components (for Standard UI plugins)
   - Configuration files (`info.yaml`, `go.mod`, `package.json`)
   - i18n translation files
   - README documentation

2. **Plugin Installation**: When you run `install`:
   - Adds plugin import to `cmd/answer/main.go`
   - Adds `replace` directive to `go.mod`
   - Runs `go mod tidy`
   - Merges i18n resources using `go run ./cmd/answer/main.go i18n`

3. **Plugin Uninstallation**: When you run `uninstall`:
   - Removes plugin import from `main.go`
   - Removes `replace` directive from `go.mod`
   - Runs `go mod tidy`
   - Updates i18n resources

## Architecture

The tool is built with:

- **TypeScript**: For type safety and better developer experience
- **Error Handling**: Comprehensive error handling with custom error types
- **File Transactions**: Atomic file operations with rollback support
- **Security**: Command validation and path sanitization
- **Configuration Management**: Centralized configuration with environment variable support
- **Logging**: Structured logging with configurable log levels

## Requirements

- Node.js >= 16
- Go >= 1.23 (for Backend plugins)
- pnpm (for Standard UI plugins)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Related Links

- [Apache Answer](https://github.com/apache/answer)
- [Answer Plugin Documentation](https://answer.apache.org/docs/development/plugins)
