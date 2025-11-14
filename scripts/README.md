# 插件验证脚本

## 脚本说明

### verify-plugin.ts

验证单个插件的可用性。

**用法：**
```bash
# 验证指定插件
pnpm verify <plugin-name> [answer-project-path]

# 验证插件并检查 Answer 项目集成
pnpm verify <plugin-name> [answer-project-path] --check-integration
```

**示例：**
```bash
# 验证插件 my-plugin
pnpm verify my-plugin

# 验证插件并检查是否已集成到 Answer 项目
pnpm verify my-plugin /Users/robin/Projects/answer --check-integration
```

**验证内容：**
1. ✅ 插件目录是否存在
2. ✅ 必需文件是否存在（Go 文件、info.yaml、go.mod）
3. ✅ info.yaml 格式是否正确（包含 slug_name、type、version）
4. ✅ Go 包名是否有效（不包含连字符）
5. ✅ go.mod 是否有效
6. ✅ Go 代码是否可以编译
7. ✅ （可选）插件是否已集成到 Answer 项目并可以编译

### verify-all-plugins.ts

验证 Answer 项目中所有插件的可用性。

**用法：**
```bash
# 验证所有插件
pnpm verify:all [answer-project-path]
```

**示例：**
```bash
# 验证所有插件
pnpm verify:all

# 指定 Answer 项目路径
pnpm verify:all /Users/robin/Projects/answer
```

**验证内容：**
- 检查每个插件的必需文件
- 检查 info.yaml 格式
- 尝试编译每个插件
- 生成验证报告

## 验证结果

脚本会输出详细的验证结果，包括：
- ✅ 通过的检查项
- ❌ 失败的检查项及错误信息
- 📊 总体统计（通过率）

## 退出码

- `0` - 所有验证通过
- `1` - 有验证失败

## 注意事项

1. 确保已安装 Go 环境
2. 确保 Answer 项目路径正确
3. 验证编译时可能需要一些时间
4. 如果插件未集成到 Answer 项目，`--check-integration` 选项会失败

