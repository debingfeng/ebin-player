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
```

### Husky + lint-staged

- **Husky**: Git钩子管理工具
- **lint-staged**: 在提交前对暂存的文件运行格式化

#### 配置的Git钩子

1. **pre-commit**: 在提交前自动运行lint-staged
2. **commit-msg**: 检查提交信息格式

#### 工作流程

当你执行 `git commit` 时：

1. Husky会触发pre-commit钩子
2. lint-staged会对暂存的文件运行Prettier格式化
3. 如果格式化失败，提交会被阻止
4. 如果格式化成功，提交会继续

## 开发环境设置

### 安装依赖

```bash
npm install
```

### 初始化Husky

```bash
npm run prepare
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

### 提交信息

- 提交信息不能为空
- 至少3个字符长度
- 使用有意义的描述

## 故障排除

### Prettier格式化问题

如果遇到格式化问题，可以：

1. 运行 `npm run format` 自动格式化
2. 运行 `npm run format:check` 检查格式
3. 检查`.prettierrc`配置文件

### Husky钩子不工作

1. 确保运行了 `npm run prepare`
2. 检查`.husky`目录下的文件权限
3. 确保在Git仓库中运行
