# Ebin Player

一个现代化的、模块化的 Web 视频播放器，支持插件系统和自定义 UI。

[![npm version](https://img.shields.io/npm/v/ebin-player.svg)](https://www.npmjs.com/package/ebin-player)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

## ✨ 特性

- 🎬 **现代化架构** - 基于 TypeScript 构建，提供完整的类型支持
- 🔌 **插件系统** - 支持自定义插件，轻松扩展功能
- 🎨 **自定义 UI** - 提供默认 UI 组件，支持完全自定义
- ⚛️ **React 支持** - 提供 React 组件，无缝集成到 React 应用
- 📱 **响应式设计** - 支持各种屏幕尺寸和设备
- 🎯 **事件驱动** - 完整的事件系统，支持状态订阅
- 🚀 **高性能** - 优化的渲染和内存管理
- 📦 **多格式支持** - 支持 ESM、UMD 等多种模块格式

## 🚀 快速开始

### 安装

```bash
# 使用 npm
npm install ebin-player

# 使用 yarn
yarn add ebin-player

# 使用 pnpm
pnpm add ebin-player
```

### 基础使用

#### 原生 HTML

```html
<!DOCTYPE html>
<html>
<head>
    <title>Ebin Player Demo</title>
</head>
<body>
    <div id="player-container"></div>
    
    <script src="path/to/ebin-player.native.js"></script>
    <script>
        // 创建播放器实例
        const player = new EbinPlayer.PlayerInstance(
            document.getElementById('player-container'),
            {
                src: 'https://example.com/video.mp4',
                autoplay: false,
                controls: false,
                width: '100%',
                height: 'auto'
            }
        );
        
        // 创建默认 UI
        new EbinPlayer.DefaultUI(player, document.getElementById('player-container'));
        
        // 添加插件
        const playbackRatePlugin = new EbinPlayer.PlaybackRatePlugin();
        player.use(playbackRatePlugin);
    </script>
</body>
</html>
```


#### ES6 模块

```javascript
import { PlayerInstance, DefaultUI, PlaybackRatePlugin } from 'ebin-player';

const player = new PlayerInstance(container, {
  src: 'https://example.com/video.mp4',
  autoplay: false,
  controls: false
});

// 添加 UI
new DefaultUI(player, container);

// 添加插件
const plugin = new PlaybackRatePlugin();
player.use(plugin);
```

## 📖 API 文档

### PlayerInstance

播放器主类，提供核心播放功能。

#### 构造函数

```typescript
new PlayerInstance(container: HTMLElement, options: PlayerOptions)
```

#### 播放控制方法

```typescript
// 播放控制
await player.play(): Promise<void>
player.pause(): void
player.load(): void

// 时间控制
player.getCurrentTime(): number
player.setCurrentTime(time: number): void
player.getDuration(): number

// 音量控制
player.getVolume(): number
player.setVolume(volume: number): void
player.getMuted(): boolean
player.setMuted(muted: boolean): void

// 播放速度
player.getPlaybackRate(): number
player.setPlaybackRate(rate: number): void
```

#### 状态管理

```typescript
// 获取状态
player.getState(): PlayerState
player.setState(state: Partial<PlayerState>): void

// 订阅状态变化
player.subscribe(callback: (state: PlayerState) => void, keys?: (keyof PlayerState)[]): () => void
```

#### 事件系统

```typescript
// 事件监听
player.on(event: PlayerEventType, callback: (event: PlayerEvent) => void): void
player.off(event: PlayerEventType, callback: (event: PlayerEvent) => void): void
player.emit(event: PlayerEventType, data?: any): void
```

#### 插件系统

```typescript
// 插件管理
player.use(plugin: Plugin): PlayerInstance
player.unuse(pluginName: string): PlayerInstance
player.getPlugin(name: string): Plugin | undefined
```

### PlayerOptions

播放器配置选项。

```typescript
interface PlayerOptions {
  src: string;                    // 视频源
  autoplay?: boolean;             // 自动播放
  muted?: boolean;                // 静音
  volume?: number;                // 音量 (0-1)
  playbackRate?: number;          // 播放速度
  poster?: string;                // 封面图
  width?: number | string;        // 宽度
  height?: number | string;       // 高度
  controls?: boolean;             // 显示原生控件
  loop?: boolean;                 // 循环播放
  preload?: 'none' | 'metadata' | 'auto'; // 预加载
  crossOrigin?: 'anonymous' | 'use-credentials' | ''; // 跨域
  playsInline?: boolean;          // 内联播放
}
```

### 内置插件

#### PlaybackRatePlugin

播放速度控制插件。

```typescript
import { PlaybackRatePlugin } from 'ebin-player';

const plugin = new PlaybackRatePlugin();
player.use(plugin);

// 设置播放速度选项
plugin.setRateOptions([
  { value: 0.5, label: '0.5x' },
  { value: 1, label: '1x' },
  { value: 1.5, label: '1.5x' },
  { value: 2, label: '2x' }
]);

// 设置播放速度
plugin.setRate(1.5);
```

### 自定义插件

```typescript
interface Plugin {
  name: string;
  version?: string;
  apply(player: PlayerInstance): void;
  destroy?(): void;
}

const customPlugin: Plugin = {
  name: 'myPlugin',
  version: '1.0.0',
  apply(player) {
    // 插件初始化逻辑
    console.log('插件已加载');
  },
  destroy() {
    // 插件清理逻辑
    console.log('插件已销毁');
  }
};

player.use(customPlugin);
```

## 🎨 UI 组件

### DefaultUI

默认 UI 组件，提供完整的播放器界面。

```typescript
import { DefaultUI } from 'ebin-player';

const ui = new DefaultUI(player, container, {
  playButton: true,           // 播放按钮
  progressBar: true,          // 进度条
  timeDisplay: true,          // 时间显示
  volumeControl: true,        // 音量控制
  fullscreenButton: true,     // 全屏按钮
  customButtons: []           // 自定义按钮
});
```


## 🛠️ 开发

### 环境要求

- Node.js >= 16
- npm >= 8

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

启动开发服务器，支持热重载。

### 构建

```bash
npm run build
```

生成生产版本文件。

### 类型检查

```bash
npm run type-check
```

运行 TypeScript 类型检查。

## 📁 项目结构

```
src/
├── core/                 # 核心模块
│   ├── Player.ts        # 播放器主类
│   ├── PlayerCore.ts    # 播放器核心
│   └── PlayerStore.ts   # 状态管理
├── plugin/             # 插件系统
│   ├── PluginManager.ts
│   └── built-in/       # 内置插件
├── ui/                 # UI 组件
│   └── DefaultUI.ts
├── types/              # 类型定义
│   └── index.ts
├── index.ts            # 主入口
└── native.ts           # 原生 HTML 入口
```

## 📦 构建产物

- `ebin-player.esm.js` - ES 模块版本
- `ebin-player.umd.js` - UMD 版本
- `ebin-player.native.js` - 原生 HTML 版本
- `ebin-player.d.ts` - TypeScript 类型声明

## ❓ 常见问题

### Q: 如何在原生 HTML 中使用？

A: 使用 `ebin-player.native.js` 文件，它不包含 React 依赖：

```html
<script src="path/to/ebin-player.native.js"></script>
<script>
  const player = new EbinPlayer.PlayerInstance(container, options);
</script>
```

### Q: 如何自定义 UI？

A: 有两种方式：

1. 使用 `DefaultUI` 组件并配置选项
2. 创建自定义 UI 组件，监听播放器事件

### Q: 如何开发自定义插件？

A: 实现 `Plugin` 接口：

```typescript
const myPlugin: Plugin = {
  name: 'myPlugin',
  apply(player) {
    // 插件逻辑
  }
};
```

### Q: 支持哪些视频格式？

A: 支持所有现代浏览器支持的视频格式，包括 MP4、WebM、OGV 等。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- [原生 HTML 演示](./demo/native/index.html) - 在开发模式下访问 `http://localhost:8080/demo/native/index.html`