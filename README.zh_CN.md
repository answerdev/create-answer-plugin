# Create Answer Plugin

中文 | [English](README.md)

一个强大的 CLI 工具，用于为 [Apache Answer](https://github.com/apache/answer) 项目创建和管理插件。该工具为后端插件和标准 UI 插件提供脚手架，并支持插件的生命周期管理。

## 特性

- 🚀 **交互式插件创建**：通过交互式 CLI 创建插件
- 📦 **多种插件类型**：支持 7 种后端插件类型和 4 种标准 UI 插件类型
- 🔧 **插件管理**：列出、安装和卸载插件
- 🛡️ **类型安全**：使用 TypeScript 构建，提供更好的类型安全
- 🔒 **安全性**：内置安全验证和命令清理
- 📝 **自动生成模板**：为所有插件类型提供 Hello World 示例

## 安装

### 全局安装

```bash
npm install -g create-answer-plugin
# 或
pnpm add -g create-answer-plugin
```

**注意**：包名是 `create-answer-plugin`，但命令是 `answer-plugin`。你也可以使用 `create-answer-plugin` 作为别名。

### 使用 npx（推荐）

```bash
# 两种命令都可以使用：
npx create-answer-plugin <command>
npx answer-plugin <command>
```

## 命令

### 创建插件

通过交互式向导创建新插件：

```bash
answer-plugin create [pluginName]
# 或
answer-plugin [pluginName]
```

**选项：**
- `pluginName`（可选）：预填充插件名称
- `--path, -p`：Answer 项目路径（根目录）

**示例：**
```bash
answer-plugin create my-plugin
```

### 列出插件

列出 Answer 项目中的所有插件：

```bash
answer-plugin list [path]
```

**选项：**
- `path`（可选）：Answer 项目路径（默认为当前目录）

**示例：**
```bash
answer-plugin list
answer-plugin list /path/to/answer
```

### 安装插件

将插件安装到 Answer 项目：

```bash
answer-plugin install [plugins...] [--path <path>]
```

**选项：**
- `plugins`（可选）：要安装的插件名称（默认为所有未安装的插件）
- `--path, -p`：Answer 项目路径

**示例：**
```bash
# 安装所有未安装的插件
answer-plugin install

# 安装指定插件
answer-plugin install my-plugin another-plugin
```

### 卸载插件

从 Answer 项目中卸载插件：

```bash
answer-plugin uninstall [plugins...] [--path <path>]
```

**选项：**
- `plugins`（可选）：要卸载的插件名称（默认为所有已安装的插件）
- `--path, -p`：Answer 项目路径

**示例：**
```bash
# 卸载所有已安装的插件
answer-plugin uninstall

# 卸载指定插件
answer-plugin uninstall my-plugin another-plugin
```

## 支持的插件类型

### 后端插件

后端插件扩展 Answer 的后端功能：

1. **Connector** - OAuth/SSO 集成插件
2. **Storage** - 文件存储插件（如 S3、OSS）
3. **Cache** - 缓存插件（如 Redis、Memcached）
4. **Search** - 搜索引擎插件（如 Elasticsearch、Meilisearch）
5. **User Center** - 用户管理插件
6. **Notification** - 通知服务插件（如 Email、SMS）
7. **Reviewer** - 内容审核插件

### 标准 UI 插件

标准 UI 插件扩展 Answer 的前端 UI：

1. **Editor** - 富文本编辑器插件
2. **Route** - 自定义路由/页面插件
3. **Captcha** - 验证码插件
4. **Render** - 内容渲染插件

## 使用示例

### 创建后端插件

```bash
answer-plugin create github-connector
```

工具将引导您完成：
1. 插件名称（如果已提供则预填充）
2. Answer 项目路径
3. 插件类型（后端或标准 UI）
4. 子类型选择（如 Connector、Storage 等）

### 创建标准 UI 插件

```bash
answer-plugin create my-custom-route
```

对于路由插件，您还需要输入路由路径。

### 管理插件

```bash
# 列出所有插件
answer-plugin list

# 安装所有插件
answer-plugin install

# 安装指定插件
answer-plugin install plugin1 plugin2

# 卸载插件
answer-plugin uninstall plugin1
```

## 配置

工具支持通过环境变量进行配置：

- `ANSWER_PLUGINS_PATH`：自定义插件目录路径（默认：`ui/src/plugins`）
- `ANSWER_I18N_PATH`：自定义 i18n 目录路径（默认：`answer-data/i18n`）
- `GO_MOD_TIDY_TIMEOUT`：`go mod tidy` 的超时时间（毫秒）（默认：30000）
- `PNPM_INSTALL_TIMEOUT`：`pnpm install` 的超时时间（毫秒）（默认：120000）
- `LOG_LEVEL`：日志级别 - `DEBUG`、`INFO`、`WARN`、`ERROR`、`SILENT`（默认：`INFO`）

## 生成的插件结构

### 后端插件

```
ui/src/plugins/my-plugin/
├── my_plugin.go          # 主插件实现
├── info.yaml             # 插件元数据
├── go.mod                # Go 模块定义
├── i18n/                 # 国际化文件
│   ├── en_US.yaml
│   ├── zh_CN.yaml
│   └── translation.go
└── README.md             # 插件文档
```

### 标准 UI 插件

```
ui/src/plugins/my-plugin/
├── my_plugin.go          # Go 包装器
├── info.yaml             # 插件元数据
├── Component.tsx         # React 组件
├── index.ts              # 插件入口点
├── package.json          # npm 依赖
├── tsconfig.json         # TypeScript 配置
├── vite.config.ts        # Vite 配置
├── i18n/                 # 国际化文件
│   ├── en_US.yaml
│   ├── zh_CN.yaml
│   └── index.ts
└── README.md             # 插件文档
```

## 开发

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/answerdev/create-answer-plugin.git
cd create-answer-plugin

# 安装依赖
pnpm install

# 开发模式运行
pnpm dev

# 构建
pnpm build
```

### 测试

```bash
# 验证单个插件
pnpm verify <plugin-name>

# 验证所有插件
pnpm verify:all

# 创建所有插件类型用于测试
pnpm create:all
```

## 工作原理

1. **插件创建**：工具根据所选类型生成插件脚手架，包括：
   - Go 实现文件（后端插件）
   - React/TypeScript 组件（标准 UI 插件）
   - 配置文件（`info.yaml`、`go.mod`、`package.json`）
   - i18n 翻译文件
   - README 文档

2. **插件安装**：运行 `install` 时：
   - 在 `cmd/answer/main.go` 中添加插件导入
   - 在 `go.mod` 中添加 `replace` 指令
   - 运行 `go mod tidy`
   - 使用 `go run ./cmd/answer/main.go i18n` 合并 i18n 资源

3. **插件卸载**：运行 `uninstall` 时：
   - 从 `main.go` 中移除插件导入
   - 从 `go.mod` 中移除 `replace` 指令
   - 运行 `go mod tidy`
   - 更新 i18n 资源

## 架构

工具使用以下技术构建：

- **TypeScript**：提供类型安全和更好的开发体验
- **错误处理**：使用自定义错误类型的全面错误处理
- **文件事务**：支持回滚的原子文件操作
- **安全性**：命令验证和路径清理
- **配置管理**：支持环境变量的集中配置
- **日志记录**：可配置日志级别的结构化日志

## 要求

- Node.js >= 16
- Go >= 1.23（后端插件需要）
- pnpm（标准 UI 插件需要）

## 许可证

MIT

## 贡献

欢迎贡献！请随时提交 Pull Request。

## 相关链接

- [Apache Answer](https://github.com/apache/answer)
- [Answer 插件文档](https://answer.apache.org/docs/development/plugins)

