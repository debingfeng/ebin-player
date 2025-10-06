# 🎬 Ebin Player

一个现代化的、模块化的 Web 视频播放器，基于 TypeScript 构建，支持插件系统和自定义 UI。

## ✨ 特性

### 🎯 核心功能
- ✅ **模块化架构** - 基于 TypeScript 的现代架构设计
- ✅ **插件系统** - 支持自定义插件扩展功能
- ✅ **状态管理** - 响应式状态管理系统
- ✅ **事件系统** - 完整的事件监听和分发机制
- ✅ **多格式支持** - 支持多种视频格式和编码

### 🎨 UI 系统
- ✅ **多种UI模式** - 原生控制条、基础自定义UI、高级UI
- ✅ **Tailwind CSS** - 基于 Tailwind CSS v4 的现代化样式系统
- ✅ **响应式设计** - 完美适配移动端、平板和桌面端
- ✅ **主题定制** - 支持颜色、字体、尺寸等主题定制
- ✅ **无障碍访问** - 完整的 ARIA 标签和键盘导航支持

### 🚀 高级功能
- ✅ **播放控制** - 播放/暂停、快进/快退、播放速度调节
- ✅ **画质选择** - 多画质切换支持
- ✅ **字幕系统** - 字幕开关和显示
- ✅ **全屏支持** - 全屏和画中画模式
- ✅ **截图功能** - 视频截图保存
- ✅ **键盘快捷键** - 完整的键盘操作支持
- ✅ **弹幕系统** - 可开关的弹幕显示

## 🚀 快速开始

### 安装

```bash
npm install ebin-player
# 或
yarn add ebin-player
# 或
pnpm add ebin-player
```

### 基础使用

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="node_modules/ebin-player/dist/styles.css">
</head>
<body>
    <div id="player-container"></div>
    <script src="node_modules/ebin-player/dist/ebin-player.umd.js"></script>
    <script>
        const player = new EbinPlayer.PlayerInstance(
            document.getElementById('player-container'),
            {
                src: 'video.mp4',
                uiMode: 'advanced'
            }
        );
    </script>
</body>
</html>
```

### ES6 模块使用

```javascript
import { PlayerInstance } from 'ebin-player';
import 'ebin-player/dist/styles.css';

const player = new PlayerInstance(container, {
    src: 'video.mp4',
    uiMode: 'advanced'
});
```

## 🎨 UI 模式

### 1. 原生控制条模式

```javascript
const player = new PlayerInstance(container, {
    src: 'video.mp4',
    uiMode: 'native'  // 使用浏览器原生控制条
});
```

### 2. 基础自定义UI模式

```javascript
const player = new PlayerInstance(container, {
    src: 'video.mp4',
    uiMode: 'custom',
    uiConfig: {
        playButton: true,
        progressBar: true,
        timeDisplay: true,
        volumeControl: true,
        fullscreenButton: true
    },
    theme: {
        primaryColor: '#3b82f6',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        textColor: '#ffffff',
        controlBarHeight: 50
    }
});
```

### 3. 高级UI模式

```javascript
const player = new PlayerInstance(container, {
    src: 'video.mp4',
    uiMode: 'advanced',
    uiConfig: {
        // 基础控制
        playButton: true,
        progressBar: true,
        timeDisplay: true,
        volumeControl: true,
        fullscreenButton: true,
        
        // 高级功能
        playbackRateControl: true,
        qualitySelector: true,
        subtitleToggle: true,
        aspectRatio: true,
        pictureInPicture: true,
        screenshot: true,
        skipButtons: true
    },
    theme: {
        primaryColor: '#3b82f6',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        textColor: '#ffffff',
        controlBarHeight: 60,
        borderRadius: 8,
        fontFamily: 'system-ui, -apple-system, sans-serif'
    }
});
```

## ⌨️ 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `空格` / `Enter` | 播放/暂停 |
| `F` | 全屏切换 |
| `M` | 静音/取消静音 |
| `C` | 字幕开关 |
| `J` | 快退10秒 |
| `L` | 快进10秒 |
| `←` | 快退5秒 |
| `→` | 快进5秒 |
| `↑` | 音量增加 |
| `↓` | 音量减少 |
| `Shift + <` | 播放速度减慢 |
| `Shift + >` | 播放速度加快 |

## 🔧 API 参考

### PlayerInstance

#### 构造函数

```typescript
new PlayerInstance(container: HTMLElement, options: PlayerOptions)
```

#### 主要方法

```typescript
// 播放控制
player.play(): void
player.pause(): void
player.setCurrentTime(time: number): void
player.getCurrentTime(): number

// 音量控制
player.setVolume(volume: number): void
player.getVolume(): number
player.setMuted(muted: boolean): void
player.getMuted(): boolean

// 播放速度
player.setPlaybackRate(rate: number): void
player.getPlaybackRate(): number

// 全屏控制
player.requestFullscreen(): Promise<void>
player.exitFullscreen(): Promise<void>
player.isFullscreen(): boolean

// 画中画
player.requestPictureInPicture(): Promise<void>
player.exitPictureInPicture(): Promise<void>
player.isPictureInPicture(): boolean

// 状态管理
player.getState(): PlayerState
player.setState(state: Partial<PlayerState>): void
player.subscribe(callback: (state: PlayerState) => void): void

// 事件监听
player.on(event: string, callback: Function): void
player.off(event: string, callback: Function): void

// 销毁
player.destroy(): void
```

### 配置选项

```typescript
interface PlayerOptions {
    src: string;                    // 视频源
    autoplay?: boolean;             // 自动播放
    muted?: boolean;                // 静音
    volume?: number;                // 音量 (0-1)
    width?: string;                 // 宽度
    height?: string;                // 高度
    uiMode?: 'native' | 'custom' | 'advanced';  // UI模式
    uiConfig?: ControlBarConfig;    // UI配置
    theme?: PlayerTheme;            // 主题配置
}

interface ControlBarConfig {
    playButton?: boolean;
    progressBar?: boolean;
    timeDisplay?: boolean;
    volumeControl?: boolean;
    fullscreenButton?: boolean;
    playbackRateControl?: boolean;
    qualitySelector?: boolean;
    subtitleToggle?: boolean;
    aspectRatio?: boolean;
    pictureInPicture?: boolean;
    screenshot?: boolean;
    skipButtons?: boolean;
    customButtons?: CustomButton[];
}

interface PlayerTheme {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    controlBarHeight?: number;
    borderRadius?: number;
    fontFamily?: string;
}
```

## 🎨 主题定制

### CSS 变量

```css
:root {
    --ebin-primary: #3b82f6;
    --ebin-secondary: #6b7280;
    --ebin-bg: rgba(0, 0, 0, 0.8);
    --ebin-text: #ffffff;
}
```

### 自定义样式

```css
/* 自定义控制栏样式 */
.ebin-control-bar {
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
    border-radius: 12px;
}

/* 自定义按钮样式 */
.ebin-play-button {
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
    border-radius: 50%;
}
```

## 🔌 插件系统

### 创建自定义插件

```typescript
class MyPlugin implements Plugin {
    name = 'myPlugin';
    
    install(player: PlayerInstance) {
        // 插件安装逻辑
    }
    
    uninstall() {
        // 插件卸载逻辑
    }
}

// 使用插件
player.use(new MyPlugin());
```

### 内置插件

- **PlaybackRatePlugin** - 播放速度控制插件

```typescript
import { PlaybackRatePlugin } from 'ebin-player';

const ratePlugin = new PlaybackRatePlugin();
player.use(ratePlugin);
```

## 📱 响应式设计

播放器自动适配不同屏幕尺寸：

- **移动端** (< 768px): 大按钮，触摸友好
- **平板端** (768px - 1024px): 适中控件大小
- **桌面端** (> 1024px): 完整功能显示

## ♿ 无障碍访问

- ✅ **ARIA 标签** - 所有交互元素都有适当的标签
- ✅ **键盘导航** - 完整的 Tab 键导航支持
- ✅ **屏幕阅读器** - 兼容主流屏幕阅读器
- ✅ **高对比度** - 支持高对比度模式
- ✅ **焦点管理** - 清晰的焦点指示器

## 🌐 浏览器支持

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📦 构建和开发

### 开发环境

```bash
# 克隆项目
git clone https://github.com/your-org/ebin-player.git
cd ebin-player

# 安装依赖
pnpm install

# 开发模式
pnpm run dev

# 构建
pnpm run build
```

### 构建脚本

```bash
# 构建 CSS
pnpm run build:css:prod

# 构建 JavaScript
pnpm run build

# 完整构建
pnpm run demo
```

## 📖 示例和演示

访问 [在线演示](http://localhost:8081/demo/native/index.html) 查看完整功能演示：

- 基础播放器功能
- UI 模式切换
- 配置选项演示
- 主题定制
- 键盘快捷键
- 响应式设计

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**Ebin Player** - 让视频播放更简单、更强大、更美观！