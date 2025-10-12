# EbinPlayer 文档

欢迎使用 EbinPlayer 文档！这里包含了完整的使用指南、API参考和示例代码。

## 📚 文档导航

### 快速开始
- [安装指南](./installation.md) - 如何安装和配置 EbinPlayer
- [快速开始](./quick-start.md) - 5分钟快速上手指南

### 使用示例
- [基础播放器](./examples/basic-player.md) - 基础播放器使用示例
- [自定义UI](./examples/custom-ui.md) - 自定义UI和主题示例
- [插件开发](./examples/plugin-development.md) - 插件开发指南
- [主题定制](./examples/theming.md) - 主题定制示例
- [高级功能](./examples/advanced-features.md) - 高级功能使用

### API 文档
- [完整API文档](../docs-api/) - 自动生成的API参考文档
- [播放器API](./api/player-api.md) - 播放器核心API
- [插件API](./api/plugin-api.md) - 插件系统API
- [UI组件API](./api/ui-api.md) - UI组件API
- [类型定义](./api/types.md) - TypeScript类型定义

### 在线演示
- [完整演示](../demos/) - 在线功能演示
- [基础示例](../examples/basic/) - 可运行的基础示例
- [自定义UI示例](../examples/custom-ui/) - 自定义UI示例
- [插件示例](../examples/plugins/) - 插件开发示例
- [主题示例](../examples/themes/) - 主题定制示例

## 🚀 快速开始

### 安装

```bash
npm install ebin-player
```

### 基础使用

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="node_modules/ebin-player/dist/styles.css">
</head>
<body>
    <div id="player"></div>
    <script src="node_modules/ebin-player/dist/ebin-player.umd.js"></script>
    <script>
        const player = new EbinPlayer(document.getElementById('player'), {
            src: 'your-video.mp4',
            autoplay: false,
            controls: true
        });
    </script>
</body>
</html>
```

### 高级使用

```typescript
import { createPlayer, PlaybackRatePlugin } from 'ebin-player';

const player = createPlayer(container, {
    src: 'video.mp4',
    plugins: {
        playbackRate: {
            rates: [0.5, 1, 1.25, 1.5, 2]
        }
    },
    theme: {
        primaryColor: '#ff6b6b'
    }
});

player.on('play', () => {
    console.log('视频开始播放');
});
```

## 🎯 主要特性

- **🎬 现代化播放器** - 基于HTML5 Video，支持所有现代浏览器
- **🔌 插件系统** - 灵活的插件架构，支持自定义功能扩展
- **🎨 主题定制** - 完整的主题系统，支持深色/浅色模式
- **📱 响应式设计** - 自适应移动端和桌面端
- **🎯 TypeScript** - 完整的TypeScript支持
- **🧪 测试覆盖** - 完整的单元测试和集成测试

## 📖 文档结构

```
docs/
├── README.md                 # 文档首页
├── installation.md          # 安装指南
├── quick-start.md           # 快速开始
├── examples/                # 使用示例
│   ├── basic-player.md      # 基础播放器
│   ├── custom-ui.md         # 自定义UI
│   ├── plugin-development.md # 插件开发
│   ├── theming.md           # 主题定制
│   └── advanced-features.md # 高级功能
├── api/                     # API文档
│   ├── player-api.md        # 播放器API
│   ├── plugin-api.md        # 插件API
│   ├── ui-api.md           # UI组件API
│   └── types.md            # 类型定义
└── ../docs-api/            # 自动生成的API文档
```

## 🔗 相关链接

- [项目主页](../README.md)
- [GitHub仓库](https://github.com/your-username/ebin-player)
- [NPM包](https://www.npmjs.com/package/ebin-player)
- [变更日志](../CHANGELOG.md)
- [许可证](../LICENSE)

## 🤝 贡献

欢迎贡献代码！请查看 [贡献指南](../CONTRIBUTING.md)。

## 📄 许可证

[MIT License](../LICENSE)