# 开发指南

## 代码质量工具

本项目配置了以下代码质量工具来确保代码的一致性和质量：

### Prettier

- **Prettier**: 用于代码格式化，确保代码风格一致

#### 可用命令

```bash
# 格式化代码
npm run format

# 检查代码格式
npm run format:check

# 生成变更日志
npm run changelog

# 发布新版本
npm run version:patch  # 修订版本
npm run version:minor  # 次版本
npm run version:major  # 主版本
```


## 开发环境设置

### 安装依赖

```bash
npm install
```


### 开发命令

```bash
# 开发模式
npm run dev

# 构建项目
npm run build

# 运行测试
npm run test

# 类型检查
npm run type-check
```

## 代码规范

### TypeScript

- 使用TypeScript进行类型检查
- 使用明确的类型注解
- 遵循TypeScript最佳实践

### 代码风格

- 使用单引号
- 使用分号
- 行尾逗号
- 2个空格缩进
- 最大行宽120字符

## 版本管理和发布

### 变更日志

项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范来管理提交信息，并自动生成变更日志。

#### 提交规范

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动
- `perf`: 性能优化
- `ci`: CI配置文件和脚本的变动

#### 版本发布

```bash
# 修订版本 (1.0.0 -> 1.0.1)
npm run version:patch

# 次版本 (1.0.0 -> 1.1.0)
npm run version:minor

# 主版本 (1.0.0 -> 2.0.0)
npm run version:major

# 预发布版本
npm run version:prerelease
```

#### 生成变更日志

```bash
# 生成当前版本的变更日志
npm run changelog

# 生成所有版本的变更日志
npm run changelog:all
```

### 发布流程

1. **准备发布**：
   - 确保所有测试通过
   - 代码已格式化
   - 文档已更新

2. **发布版本**：
   - 运行相应的版本命令
   - 检查生成的变更日志
   - 提交版本变更

3. **发布到NPM**：
   - 运行 `npm publish`
   - 推送Git标签

## 故障排除

### Prettier格式化问题

如果遇到格式化问题，可以：

1. 运行 `npm run format` 自动格式化
2. 运行 `npm run format:check` 检查格式
3. 检查`.prettierrc`配置文件

### 版本发布问题

如果版本发布失败：

1. 检查Git状态是否干净
2. 确保所有变更已提交
3. 检查`.versionrc.json`配置
4. 查看生成的变更日志是否正确
