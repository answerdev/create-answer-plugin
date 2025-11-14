# 发布指南 (Release Guide)

## Beta 版本发布

当前版本：`2.0.0-beta.1`

### 发布步骤

1. **确保代码已提交**
   ```bash
   git status
   git add .
   git commit -m "chore: prepare for beta release"
   ```

2. **构建项目**
   ```bash
   pnpm build
   ```

3. **运行测试（如果有）**
   ```bash
   pnpm verify:all
   ```

4. **发布到 npm（beta 标签）**

   有两种方式：

   **方式一：使用 release-it（推荐）**
   ```bash
   # 交互式发布，会自动处理版本号、git tag、GitHub release
   # 注意：使用 --preRelease=beta 会自动将版本号更新为 beta 版本
   pnpm release -- --preRelease=beta --npm.tag=beta
   ```

   **方式二：手动发布**
   ```bash
   # 1. 确保版本号是 beta 版本（已在 package.json 中设置为 2.0.0-beta.1）
   # 2. 构建
   pnpm build
   # 3. 发布到 npm（使用 beta 标签）
   npm publish --tag beta
   ```

5. **验证发布**
   ```bash
   # 检查 beta 版本是否发布成功
   npm view create-answer-plugin@beta version
   
   # 测试安装
   npm install -g create-answer-plugin@beta
   answer-plugin --version
   ```

### 使用 release-it 发布 Beta 版本

`release-it` 会自动：
- 更新版本号（如果使用 `--preRelease=beta`）
- 创建 git tag
- 创建 GitHub release
- 发布到 npm（使用 beta 标签）

```bash
# 交互式发布（推荐）
pnpm release -- --preRelease=beta

# 非交互式发布
pnpm release -- --preRelease=beta --ci
```

**注意**：使用 `--preRelease=beta` 时，release-it 会自动：
- 将版本号更新为 beta 版本（如 `1.1.3-beta.1`）
- 使用 `beta` 标签发布到 npm
- 不会影响 `latest` 标签

### 版本号管理

- **Beta 版本**：`2.0.0-beta.1`, `2.0.0-beta.2`, ...
- **正式版本**：`2.0.0`, `2.1.0`, ...

### 发布后检查清单

- [ ] npm 包已发布（beta 标签）
- [ ] GitHub release 已创建
- [ ] Git tag 已创建
- [ ] 版本号已更新
- [ ] 可以正常安装和运行

### 从 Beta 升级到正式版

当 beta 版本稳定后，发布正式版本：

```bash
   # 1. 更新版本号为正式版本
   # 编辑 package.json: "version": "2.0.0"

# 2. 发布正式版（会使用 latest 标签）
pnpm release
```

### 安装 Beta 版本

用户可以通过以下方式安装 beta 版本：

```bash
# 使用 npm
npm install -g create-answer-plugin@beta

# 使用 pnpm
pnpm add -g create-answer-plugin@beta

# 使用 npx（推荐，无需安装）
npx create-answer-plugin@beta create my-plugin
```

### 回滚 Beta 版本

如果需要回滚 beta 版本：

```bash
   # 1. 撤销 npm 发布（24小时内）
   npm unpublish create-answer-plugin@2.0.0-beta.1

   # 2. 删除 git tag
   git tag -d v2.0.0-beta.1
   git push origin :refs/tags/v2.0.0-beta.1

# 3. 删除 GitHub release（在 GitHub 网页上操作）
```
