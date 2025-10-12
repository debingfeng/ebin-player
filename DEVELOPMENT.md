# 开发指南

## 代码质量工具

本项目配置了以下代码质量工具来确保代码的一致性和质量：

### ESLint + Prettier

- **ESLint**: 用于代码静态分析和错误检查
- **Prettier**: 用于代码格式化

#### 可用命令

```bash
# 检查代码质量
npm run lint

# 自动修复ESLint问题
npm run lint:fix

# 格式化代码
npm run format

# 检查代码格式
npm run format:check
```

### Husky + lint-staged

- **Husky**: Git钩子管理工具
- **lint-staged**: 在提交前对暂存的文件运行linter

#### 配置的Git钩子

1. **pre-commit**: 在提交前自动运行lint-staged
2. **commit-msg**: 检查提交信息格式

#### 工作流程

当你执行 `git commit` 时：

1. Husky会触发pre-commit钩子
2. lint-staged会对暂存的文件运行ESLint和Prettier
3. 如果有错误，提交会被阻止
4. 如果所有检查通过，提交会继续

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

- 使用严格的TypeScript配置
- 避免使用`any`类型
- 使用明确的类型注解

### 代码风格

- 使用单引号
- 使用分号
- 行尾逗号
- 2个空格缩进
- 最大行宽80字符

### 提交信息

- 提交信息不能为空
- 至少3个字符长度
- 使用有意义的描述

## 故障排除

### ESLint错误

如果遇到ESLint错误，可以：

1. 运行 `npm run lint:fix` 自动修复
2. 查看具体错误信息并手动修复
3. 如果规则过于严格，可以在`.eslintrc.js`中调整

### Prettier冲突

如果Prettier和ESLint有冲突：

1. 确保安装了`eslint-config-prettier`
2. 检查`.eslintrc.js`中的extends配置

### Husky钩子不工作

1. 确保运行了 `npm run prepare`
2. 检查`.husky`目录下的文件权限
3. 确保在Git仓库中运行
