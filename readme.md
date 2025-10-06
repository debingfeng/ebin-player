# ebin-player

A modular, plugin-based web video player built with modern web technologies.

## 项目介绍

ebin-player 是一个模块化、基于插件机制的网络视频播放器库。它采用现代化的前端技术栈构建，提供了灵活的扩展能力和良好的用户体验。该播放器旨在为开发者提供一个易于集成、可定制性强的视频播放解决方案。

### 核心特性

- 🧩 **模块化设计**: 组件化架构，易于维护和扩展
- 🔌 **插件系统**: 支持自定义插件，灵活添加功能
- 📦 **多种模块格式**: 同时支持 UMD 和 ESM 格式，适用于不同场景
- 🎯 **TypeScript 支持**: 完整的 TypeScript 类型定义，提升开发体验

## 技术架构

### 核心技术栈

- **构建工具**: Rollup
- **语言**: TypeScript
- **转译**: Babel (支持最新 JavaScript 特性和 React JSX)
- **包管理**: npm

### 架构设计

```text
src/
├── core/           # 核心播放器逻辑
├── ui/     # UI 组件
├── plugins/        # 内置插件
├── framework/          # 工具函数
└── types/          # TypeScript 类型定义
```

### 构建输出

- `dist/ebin-player.umd.js` - UMD 格式的通用模块，可在浏览器中直接使用
- `dist/ebin-player.esm.js` - ESM 格式的 ES6 模块，支持 tree-shaking
- `dist/ebin-player.d.ts` - TypeScript 类型定义文件

## 本地开发与部署

### 环境要求

- Node.js >= 16.x
- npm >= 8.x

### 安装依赖

```bash
npm install
```

### 开发模式

启动开发服务器并监听文件变化：

```bash
npm run dev
```

这将启动一个本地开发服务器，并在文件更改时自动重新构建。

### 生产构建

构建生产版本：

```bash
npm run build
```

构建产物将输出到 `dist/` 目录。

### 清理构建产物

清理之前的构建文件：

```bash
npm run clean
```

## 使用方式

### 在项目中安装

```bash
npm install ebin-player
```

### 基本使用

```jsx
import Player from 'ebin-player';
import 'ebin-player/dist/ebin-player.css';

function App() {
  return (
    <Player
      src="your-video-url.mp4"
      controls
      autoplay={false}
      width="100%"
      height="auto"
    />
  );
}
```

### 插件使用示例

```jsx
import Player from 'ebin-player';
import { VolumeControl, PlayButton } from 'ebin-player/plugins';

function CustomPlayer() {
  return (
    <Player
      src="your-video-url.mp4"
      plugins={[VolumeControl, PlayButton]}
    />
  );
}
```

## 问题及其他

### 常见问题

1. **兼容性问题**: 该项目使用了较新的 Web API，可能不支持老旧浏览器。
2. **性能优化**: 对于大型视频文件，建议启用流媒体支持。
3. **插件冲突**: 自定义插件可能会与内置插件产生冲突，请仔细阅读文档。

### 贡献指南

欢迎提交 Issue 和 Pull Request 来改进项目：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 许可证

本项目采用 ISC 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

### 联系方式

如有任何问题或建议，请通过以下方式联系我们：

- 提交 GitHub Issue
- 发送邮件至项目维护者

---

*注: 此 README 是基于 package.json 文件生成的概览文档，更多详细信息请参考源代码和完整的 API 文档。*