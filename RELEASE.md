# 发布说明

## 发布流程

### 1. 准备发布

在发布新版本之前，请确保：

- [ ] 所有测试通过 (`npm test`)
- [ ] 代码格式化完成 (`npm run format`)
- [ ] 构建成功 (`npm run build`)
- [ ] 更新了相关文档
- [ ] 提交了所有变更

### 2. 版本发布

#### 修订版本 (Patch)
```bash
npm run version:patch
```
用于：
- Bug修复
- 文档更新
- 代码格式调整
- 性能优化

#### 次版本 (Minor)
```bash
npm run version:minor
```
用于：
- 新功能添加
- 现有功能增强
- 向下兼容的API修改

#### 主版本 (Major)
```bash
npm run version:major
```
用于：
- 破坏性API变更
- 重大架构调整
- 移除废弃功能

#### 预发布版本
```bash
npm run version:prerelease
```
用于：
- Alpha版本
- Beta版本
- RC版本

### 3. 发布到NPM

```bash
npm publish
```

### 4. 创建Git标签

```bash
git push --follow-tags origin main
```

## 变更日志管理

### 自动生成变更日志

```bash
# 生成当前版本的变更日志
npm run changelog

# 生成所有版本的变更日志
npm run changelog:all
```

### 手动更新变更日志

在 `CHANGELOG.md` 中按照以下格式添加：

```markdown
## [版本号] - 日期

### Added
- 新功能描述

### Changed
- 变更描述

### Fixed
- 修复描述

### Removed
- 移除功能描述
```

## 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 类型说明

- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动
- `perf`: 性能优化
- `ci`: CI配置文件和脚本的变动

### 示例

```
feat(player): 添加全屏播放功能

- 支持键盘快捷键切换全屏
- 添加全屏状态指示器
- 优化全屏模式下的UI布局

Closes #123
```

## 版本号规则

遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范：

- **主版本号**: 当你做了不兼容的 API 修改
- **次版本号**: 当你做了向下兼容的功能性新增
- **修订号**: 当你做了向下兼容的问题修正

## 发布检查清单

### 发布前检查

- [ ] 代码已通过所有测试
- [ ] 代码已格式化
- [ ] 文档已更新
- [ ] 变更日志已更新
- [ ] 版本号已正确设置
- [ ] 所有依赖已更新

### 发布后检查

- [ ] 版本已正确发布到NPM
- [ ] Git标签已创建
- [ ] 变更日志已更新
- [ ] 发布说明已发布
- [ ] 团队已通知新版本发布
