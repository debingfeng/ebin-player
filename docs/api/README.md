# EbinPlayer API 文档

欢迎使用 EbinPlayer API 文档！这里包含了播放器的所有公共 API 接口、类型定义和使用示例。

## 📚 文档导航

### 核心模块
- **[PlayerInstance](./classes/PlayerInstance.html)** - 播放器主类，提供所有播放控制功能
- **[PlayerCore](./classes/PlayerCore.html)** - 播放器核心引擎
- **[PlayerStore](./classes/PlayerStore.html)** - 播放器状态管理

### 插件系统
- **[PluginManager](./classes/PluginManager.html)** - 插件管理器
- **[BasePlugin](./classes/BasePlugin.html)** - 插件基类
- **[PlaybackRatePlugin](./classes/PlaybackRatePlugin.html)** - 播放速度插件

### UI 组件
- **[ImprovedDefaultUI](./classes/ImprovedDefaultUI.html)** - 默认UI组件
- **[UIManager](./classes/UIManager.html)** - UI管理器
- **[ThemeManager](./classes/ThemeManager.html)** - 主题管理器
- **[ResponsiveManager](./classes/ResponsiveManager.html)** - 响应式管理器

### 类型定义
- **[PlayerOptions](./interfaces/PlayerOptions.html)** - 播放器配置选项
- **[PlayerState](./interfaces/PlayerState.html)** - 播放器状态
- **[PluginDefinition](./interfaces/PluginDefinition.html)** - 插件定义
- **[PlayerEvent](./interfaces/PlayerEvent.html)** - 播放器事件

## 🚀 快速开始

### 基础使用

```typescript
import { createPlayer } from 'ebin-player';

const player = createPlayer(container, {
    src: 'video.mp4',
    autoplay: false,
    controls: true
});
```

### 事件监听

```typescript
player.on('play', () => {
    console.log('视频开始播放');
});

player.on('pause', () => {
    console.log('视频暂停');
});
```

### 插件使用

```typescript
import { PlaybackRatePlugin } from 'ebin-player';

player.use(PlaybackRatePlugin, {
    rates: [0.5, 1, 1.25, 1.5, 2]
});
```

## 📖 更多示例

- [基础播放器示例](../examples/basic-player.md)
- [自定义UI示例](../examples/custom-ui.md)
- [插件开发示例](../examples/plugin-development.md)
- [主题定制示例](../examples/theming.md)

## 🔗 相关链接

- [项目主页](../../README.md)
- [快速开始指南](../quick-start.md)
- [完整文档](../README.md)
