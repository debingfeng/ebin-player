# NPM 发布指南

## 📋 发布前检查清单

### 1. 代码质量检查
- [ ] 所有测试通过：`pnpm run test`
- [ ] 代码格式化：`pnpm run format`
- [ ] 类型检查：`pnpm run type-check`
- [ ] 构建成功：`pnpm run build`

### 2. 版本管理
- [ ] 更新版本号：`pnpm run version:patch` (或 minor/major)
- [ ] 检查 CHANGELOG.md 是否正确生成
- [ ] 提交版本更新：`git add . && git commit -m "chore: release vX.X.X"`

### 3. 文档更新
- [ ] README.md 内容完整
- [ ] API 文档更新：`pnpm run docs:build`
- [ ] 示例代码测试通过

### 4. 发布流程

#### 方式一：使用便捷脚本（推荐）
```bash
# 发布补丁版本 (0.0.1 -> 0.0.2)
pnpm run publish:patch

# 发布次版本 (0.0.1 -> 0.1.0)
pnpm run publish:minor

# 发布主版本 (0.0.1 -> 1.0.0)
pnpm run publish:major
```

#### 方式二：手动发布
```bash
# 1. 登录 npm
npm login

# 2. 检查包信息
npm whoami
npm view ebin-player

# 3. 干运行测试
pnpm run publish:dry

# 4. 发布
pnpm publish
```

### 5. 发布后验证
- [ ] 检查 npm 包页面：https://www.npmjs.com/package/ebin-player
- [ ] 测试安装：`npm install @ebin/player`
- [ ] 验证导入：`import EbinPlayer from '@ebin/player'`

## 🔧 常见问题

### 包名冲突
如果包名 `ebin-player` 已被占用，需要：
1. 在 package.json 中修改 `name` 字段
2. 建议使用：`@your-username/ebin-player` 或 `ebin-video-player`

### 权限问题
```bash
# 检查当前用户
npm whoami

# 登录
npm login

# 如果是组织包，需要添加权限
npm owner add your-username ebin-player
```

### 版本回滚
```bash
# 撤销发布（24小时内）
npm unpublish ebin-player@version

# 发布新版本覆盖
pnpm run publish:patch
```

## 📝 发布日志模板

```markdown
## v1.0.0 (2025-10-12)

### Features
- 初始发布
- 支持基础视频播放功能
- 插件系统
- 主题定制
- 响应式设计

### Documentation
- 完整的 API 文档
- 使用示例
- 在线演示
```

## 🚀 自动化发布（可选）

可以配置 GitHub Actions 实现自动发布：

```yaml
name: Publish to NPM
on:
  push:
    tags:
      - 'v*'
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: pnpm install
      - run: pnpm run build
      - run: pnpm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```
