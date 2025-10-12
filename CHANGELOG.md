# 1.0.0 (2025-10-12)


### Bug Fixes

* 修复ui状态同步的问题 ([c0d81d3](https://github.com/your-username/ebin-player/commit/c0d81d3b20563e24a4302a6323bb84c07ae49b5f))
* 修复进度条thump不更新的问题 ([f9b4aba](https://github.com/your-username/ebin-player/commit/f9b4abae8a4e3f98d06dd990030a6b6b80e8331c))


### Features

* 优化播放器架构和清理项目结构 ([a0ac6c8](https://github.com/your-username/ebin-player/commit/a0ac6c831986cac68ad66ec58023c2acdaa0f85d))
* 使用全新的插件化架构 ([17f0f68](https://github.com/your-username/ebin-player/commit/17f0f684bf98d5507cffac32fc657a12ac3bac94))
* 保留核心能力、默认ui和测试demo ([8747d8e](https://github.com/your-username/ebin-player/commit/8747d8ebce812c1b682fbea4ddf332400632ff6a))
* 完善插件和UI组件测试，修复组件挂载策略 ([1c824e5](https://github.com/your-username/ebin-player/commit/1c824e5d508b4c0b9b3fc807bf34c91aa09cd464))
* 引入自定义twinldcss的ui支持 ([2c26410](https://github.com/your-username/ebin-player/commit/2c26410a9bbe82dab142c9c12a80a70851bd5b94))
* 播放器内核新增生命周期事件和代码优化 ([8e00cc7](https://github.com/your-username/ebin-player/commit/8e00cc7d98d6cc3a2a112174334612d9c5802b88))
* 新增各种能力测试页面和状态管理 ([2a58fd2](https://github.com/your-username/ebin-player/commit/2a58fd2226346bcc604909ffa5c280dae1569cae))
* 新增日志打印 ([d22eb71](https://github.com/your-username/ebin-player/commit/d22eb71f6b9c5dd4f5f0144df5de225ef1649d7e))
* 添加完整的Jest测试框架和单元测试 ([2d25542](https://github.com/your-username/ebin-player/commit/2d255423f16f5455c1d9b6d1e1195f31bed69c18))
* 调整ui架构 ([c54b822](https://github.com/your-username/ebin-player/commit/c54b8225b658f003ae4a4783052679c35562d29c))


### Performance Improvements

* 优化播放器状态管理 ([6b1313a](https://github.com/your-username/ebin-player/commit/6b1313aa0c5bb48ee727ffd9b2e19a1410c65f36))
* 增加注释删除无用代码 ([1d8255f](https://github.com/your-username/ebin-player/commit/1d8255fff045d1b192dae38832eff21a87671696))



# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.0.0](https://github.com/your-username/ebin-player/compare/v0.0.0...v1.0.0) (2024-01-01)

### Features

* **core**: 实现核心播放器功能
  * 支持HTML5视频播放
  * 实现播放器状态管理
  * 添加事件系统

* **plugin**: 实现插件系统
  * 支持插件注册和管理
  * 提供插件生命周期钩子
  * 内置播放速度控制插件

* **ui**: 实现用户界面组件
  * 播放/暂停按钮
  * 进度条控制
  * 时间显示
  * 音量控制
  * 全屏按钮

* **responsive**: 实现响应式设计
  * 支持移动端适配
  * 自动调整UI布局
  * 触摸手势支持

* **theme**: 实现主题系统
  * 支持自定义主题
  * 深色/浅色模式切换
  * CSS变量支持

### Documentation

* 添加完整的API文档
* 提供使用示例和最佳实践
* 添加开发指南

### Testing

* 添加单元测试覆盖
* 实现集成测试
* 添加端到端测试

---

## 开发说明

### 提交规范

本项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动
- `perf`: 性能优化
- `ci`: CI配置文件和脚本的变动

### 版本发布

- **主版本号 (Major)**: 不兼容的API修改
- **次版本号 (Minor)**: 向下兼容的功能性新增
- **修订号 (Patch)**: 向下兼容的问题修正

### 生成变更日志

```bash
# 生成变更日志
npm run changelog

# 生成完整变更日志
npm run changelog:all

# 发布新版本
npm run version:patch  # 修订版本
npm run version:minor  # 次版本
npm run version:major  # 主版本
```
