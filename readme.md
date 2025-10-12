# 🎬 Ebin Player

一个现代化的、模块化的 Web 视频播放器，基于 TypeScript 构建，采用全新架构设计，支持强大的插件系统和高度可定制的 UI。

## ✨ 核心特性

### 🏗️ 现代架构
- ✅ **分层架构设计** - PlayerCore、PlayerStore、PluginManager 三层分离
- ✅ **响应式状态管理** - 基于订阅模式的状态同步系统
- ✅ **事件驱动架构** - 完整的事件监听和分发机制
- ✅ **插件化设计** - 现代插件系统，支持服务、命令、配置管理
- ✅ **TypeScript 原生** - 完整的类型定义和类型安全

### 🎨 智能UI系统
- ✅ **多UI模式** - 原生、自定义、高级、无UI四种模式
- ✅ **组件化架构** - 基于 UIManager 的模块化UI组件
- ✅ **响应式设计** - 自动适配移动端、平板和桌面端
- ✅ **主题系统** - 基于 ThemeManager 的动态主题切换
- ✅ **无障碍支持** - 完整的 ARIA 标签和键盘导航

### 🔌 强大插件系统
- ✅ **现代插件架构** - 基于 PluginDefinition 的声明式插件
- ✅ **服务定位** - 插件间服务注册和发现机制
- ✅ **命令系统** - 插件间命令调用和通信
- ✅ **配置管理** - 插件配置验证、版本控制和迁移
- ✅ **权限控制** - 细粒度的插件权限管理

### 🚀 播放器功能
- ✅ **完整播放控制** - 播放/暂停、快进/快退、播放速度调节
- ✅ **全屏支持** - 全屏和画中画模式
- ✅ **音量控制** - 音量调节和静音功能
- ✅ **进度控制** - 精确的时间控制和进度显示
- ✅ **键盘快捷键** - 完整的键盘操作支持

## 🚀 快速开始

### 安装

```bash
pnpm add ebin-player
# 或
npm install ebin-player
# 或
yarn add ebin-player
```

### 基础使用

#### HTML 引入方式

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
        const player = new EbinPlayer(
            document.getElementById('player-container'),
            {
                src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
                uiMode: 'advanced',
                debug: true
            }
        );
    </script>
</body>
</html>
```

#### ES6 模块使用

```javascript
import { PlayerInstance } from 'ebin-player';
import 'ebin-player/styles';

const player = new EbinPlayer(container, {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    uiMode: 'advanced',
    debug: true
});
```

#### 使用 createPlayer 工厂函数

```javascript
import { createPlayer } from 'ebin-player';
import 'ebin-player/styles';

const player = createPlayer(container, {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    uiMode: 'custom',
    theme: {
        primaryColor: '#3b82f6',
        backgroundColor: 'rgba(0, 0, 0, 0.8)'
    }
});
```

## 🎨 UI 模式

Ebin Player 提供四种UI模式，满足不同场景需求：

### 1. 原生控制条模式 (`native`)

使用浏览器原生HTML5控制条，性能最优：

```javascript
const player = new EbinPlayer(container, {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    uiMode: 'native'
});
```

### 2. 自定义UI模式 (`custom`)

基于 ImprovedDefaultUI 的现代化自定义界面：

```javascript
const player = new EbinPlayer(container, {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    uiMode: 'custom',
    uiConfig: {
        playButton: true,
        progressBar: true,
        timeDisplay: true,
        volumeControl: true,
        fullscreenButton: true,
        playbackRateControl: true
    },
    theme: {
        primaryColor: '#3b82f6',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        textColor: '#ffffff',
        controlBarHeight: 50
    }
});
```

### 3. 高级UI模式 (`advanced`)

包含所有功能的完整UI界面：

```javascript
const player = new EbinPlayer(container, {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
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
        pictureInPictureButton: true,
        qualitySelector: true,
        subtitleToggle: true,
        aspectRatio: true,
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

### 4. 无UI模式 (`none`)

纯播放器核心，适合自定义开发：

```javascript
const player = new EbinPlayer(container, {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    uiMode: 'none'
});

// 手动监听事件和状态
player.on('play', () => console.log('开始播放'));
player.subscribe(state => console.log('状态更新:', state));
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

播放器主类，整合核心功能、状态管理和插件系统。

#### 构造函数

```typescript
new EbinPlayer(container: HTMLElement, options: PlayerOptions)
```

#### 核心方法

##### 播放控制
```typescript
// 异步播放控制
player.play(): Promise<PlayerInstance>
player.pause(): PlayerInstance
player.load(): PlayerInstance

// 时间控制
player.getCurrentTime(): number
player.setCurrentTime(time: number): PlayerInstance
player.getDuration(): number

// 音量控制
player.getVolume(): number
player.setVolume(volume: number): PlayerInstance
player.getMuted(): boolean
player.setMuted(muted: boolean): PlayerInstance

// 播放速度
player.getPlaybackRate(): number
player.setPlaybackRate(rate: number): PlayerInstance
```

##### 状态管理
```typescript
// 状态访问
player.getState(): PlayerState
player.setState(state: Partial<PlayerState>): void

// 状态订阅
player.subscribe(
    callback: (state: PlayerState) => void,
    keys?: (keyof PlayerState)[]
): () => void
```

##### 事件系统
```typescript
// 事件监听
player.on<T extends PlayerEventType>(
    event: T, 
    callback: (event: PlayerEventBase<T>) => void
): () => void

player.off<T extends PlayerEventType>(
    event: T, 
    callback: (event: PlayerEventBase<T>) => void
): void

player.emit<T extends PlayerEventType>(
    event: T, 
    data?: EventPayloadMap[T]
): PlayerInstance
```

##### 全屏和画中画
```typescript
// 全屏控制
player.requestFullscreen(): Promise<PlayerInstance>
player.exitFullscreen(): Promise<PlayerInstance>
player.isFullscreen(): boolean

// 画中画
player.requestPictureInPicture(): Promise<PictureInPictureWindow>
player.exitPictureInPicture(): Promise<PlayerInstance>
player.isPictureInPicture(): boolean
```

##### 插件系统
```typescript
// 插件管理
player.use(plugin: PluginDefinition): PlayerInstance
player.unuse(pluginId: string): PlayerInstance
player.getPlugin(pluginId: string): PluginDefinition | undefined
```

##### UI控制
```typescript
// UI管理
player.updateUIMode(uiMode: UIMode): PlayerInstance
player.updateUIConfig(config: ControlBarConfig): PlayerInstance
player.updateUITheme(theme: PlayerTheme): PlayerInstance
player.getUIMode(): UIMode

// 元素访问
player.getContainer(): HTMLElement
player.getVideoElement(): HTMLVideoElement
```

##### 工具方法
```typescript
// 播放器信息
player.getInfo(): {
    version: string;
    lifecycle: string;
    plugins: string[];
    state: PlayerState;
    uiMode: UIMode;
}

// 调试
player.setDebug(enabled: boolean): void

// 销毁
player.destroy(): void
```

### 配置选项

#### PlayerOptions

```typescript
interface PlayerOptions {
    // 基础配置
    src: string;                    // 视频源
    autoplay?: boolean;             // 自动播放
    muted?: boolean;                // 静音
    volume?: number;                // 音量 (0-1)
    playbackRate?: number;          // 播放速度
    poster?: string;                // 封面图
    width?: number | string;        // 宽度
    height?: number | string;       // 高度
    loop?: boolean;                 // 循环播放
    preload?: 'none' | 'metadata' | 'auto';  // 预加载策略
    crossOrigin?: 'anonymous' | 'use-credentials' | '';  // 跨域设置
    playsInline?: boolean;          // 内联播放
    
    // UI配置
    uiMode?: UIMode;                // UI模式
    uiConfig?: ControlBarConfig;    // UI组件配置
    theme?: PlayerTheme;            // 主题配置
    
    // 插件配置
    builtinPlugins?: {              // 内置插件配置
        playbackRate?: boolean | {
            defaultRate?: number;
            options?: Array<{ value: number; label: string }>;
        };
    };
    
    // 调试配置
    debug?: boolean;                // 调试模式
    logger?: Logger;                // 自定义日志器
}
```

#### ControlBarConfig

```typescript
interface ControlBarConfig {
    // 基础控制
    playButton?: boolean;
    progressBar?: boolean;
    timeDisplay?: boolean;
    volumeControl?: boolean;
    fullscreenButton?: boolean;
    
    // 高级功能
    playbackRateControl?: boolean;
    pictureInPictureButton?: boolean;
    qualitySelector?: boolean;
    subtitleToggle?: boolean;
    aspectRatio?: boolean;
    screenshot?: boolean;
    skipButtons?: boolean;
    
    // 自定义组件
    customButtons?: UIComponent[];
}
```

#### PlayerTheme

```typescript
interface PlayerTheme {
    primaryColor?: string;          // 主色调
    secondaryColor?: string;        // 辅助色
    backgroundColor?: string;       // 背景色
    textColor?: string;             // 文字颜色
    controlBarHeight?: number;      // 控制栏高度
    borderRadius?: number;          // 圆角半径
    fontFamily?: string;            // 字体族
}
```

#### PlayerState

```typescript
interface PlayerState {
    // 基础播放状态
    src: string;
    currentTime: number;
    duration: number;
    paused: boolean;
    muted: boolean;
    volume: number;
    playbackRate: number;
    
    // 媒体状态
    readyState: number;
    networkState: number;
    error: MediaError | null;
    ended: boolean;
    loading: boolean;
    seeking: boolean;
    
    // 视频尺寸
    videoWidth: number;
    videoHeight: number;
    
    // 缓冲状态
    buffered: TimeRanges | null;
    seekable: TimeRanges | null;
    
    // 播放质量
    quality: string;
    bitrate: number;
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

## 🔌 现代插件系统

Ebin Player 采用全新的插件架构，基于 `PluginDefinition` 设计，提供强大的扩展能力和优秀的开发体验。

### 插件架构特点

- **声明式配置** - 基于 `PluginDefinition` 的元数据驱动
- **服务定位** - 插件间服务注册和发现机制
- **命令系统** - 插件间命令调用和通信
- **配置管理** - 配置验证、版本控制和迁移
- **权限控制** - 细粒度的插件权限管理
- **生命周期** - 完整的插件生命周期管理

### 内置插件配置

内置插件可通过配置选项自动启用：

```javascript
const player = new EbinPlayer(container, {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    uiMode: 'custom',
    builtinPlugins: {
        playbackRate: {
            defaultRate: 1.25,
            options: [
                { value: 0.5, label: '0.5x' },
                { value: 1, label: '1x' },
                { value: 1.25, label: '1.25x' },
                { value: 1.5, label: '1.5x' },
                { value: 2, label: '2x' }
            ]
        }
    }
});
```

### 插件开发

#### 基础插件类

```typescript
import { BasePlugin, PluginDefinition, PluginContext } from 'ebin-player';

interface MyPluginConfig {
    enabled: boolean;
    customOption: string;
}

interface MyPluginExports {
    getStatus(): boolean;
    doSomething(): void;
}

class MyPlugin extends BasePlugin<MyPluginConfig, MyPluginExports> {
    meta = {
        id: 'my-plugin',
        version: '1.0.0',
        displayName: 'My Plugin',
        description: '一个示例插件',
        capabilities: ['custom-feature'],
        permissions: ['player:control']
    };

    defaultConfig: MyPluginConfig = {
        enabled: true,
        customOption: 'default'
    };

    validateConfig = (config: unknown) => {
        const c = config as Partial<MyPluginConfig>;
        return { 
            valid: typeof c?.enabled === 'boolean',
            errors: c?.enabled === undefined ? ['enabled 必须为 boolean'] : []
        };
    };

    commands = {
        toggle: (args: any) => {
            const enabled = !this.ctx.getConfig<MyPluginConfig>().enabled;
            this.ctx.setConfig({ enabled });
            return { enabled };
        }
    };

    async onInit(ctx: PluginContext): Promise<MyPluginExports> {
        // 注册服务
        this.registerService('myService', {
            doSomething: () => console.log('服务调用')
        });
        
        // 监听播放器事件
        this.on('play', () => console.log('开始播放'));
        
        return {
            getStatus: () => this.ctx.getConfig<MyPluginConfig>().enabled,
            doSomething: () => console.log('执行操作')
        };
    }

    onStart() {
        console.log('插件启动');
    }

    onConfigChange(newConfig: Partial<MyPluginConfig>) {
        console.log('配置更新:', newConfig);
    }
}

// 使用插件
const plugin = new MyPlugin();
player.use(plugin);
```

#### 插件上下文 API

```typescript
interface PluginContext {
    player: PlayerInstance;
    logger: Logger;
    
    // 事件系统
    on<T extends PlayerEventType>(event: T, callback: (event: PlayerEventBase<T>) => void): () => void;
    off<T extends PlayerEventType>(event: T, callback: (event: PlayerEventBase<T>) => void): void;
    emit<T extends PlayerEventType>(event: T, data?: EventPayloadMap[T]): void;
    onAnyPlayerEvent(callback: (event: PlayerEvent) => void): () => void;
    
    // 插件间通信
    onPluginEvent(pluginId: string, type: string, callback: (data: any) => void): () => void;
    emitPluginEvent(pluginId: string, type: string, data?: any): void;
    
    // 服务系统
    registerService<T>(name: string, service: T): void;
    getService<T>(name: string): T | undefined;
    
    // 配置管理
    getConfig<T = unknown>(): T;
    setConfig<T = unknown>(partial: Partial<T>): void;
    
    // 存储系统
    storage: {
        get<T = unknown>(key: string): T | undefined;
        set<T = unknown>(key: string, value: T): void;
        delete(key: string): void;
        keys(): string[];
    };
    
    // 权限检查
    hasPermission?(perm: PluginPermission): boolean;
}
```

### 内置插件

#### PlaybackRatePlugin

播放速度控制插件，自动集成到控制栏：

```typescript
// 通过配置启用
builtinPlugins: {
    playbackRate: { 
        defaultRate: 1.25,
        options: [
            { value: 0.5, label: '0.5x' },
            { value: 1, label: '1x' },
            { value: 1.25, label: '1.25x' },
            { value: 1.5, label: '1.5x' },
            { value: 2, label: '2x' }
        ]
    }
}

// 或手动安装
import { PlaybackRatePlugin } from 'ebin-player';
player.use(PlaybackRatePlugin);
```

### 插件开发最佳实践

1. **继承 BasePlugin** - 使用基础类获得通用功能
2. **声明权限** - 明确插件需要的权限
3. **提供配置验证** - 确保配置的正确性
4. **实现生命周期** - 正确处理初始化和销毁
5. **使用服务系统** - 通过服务与其他插件协作
6. **错误处理** - 优雅处理异常情况
7. **类型安全** - 使用 TypeScript 确保类型安全

## 📱 响应式设计

基于 `ResponsiveManager` 的智能响应式系统：

- **移动端** (< 768px): 大按钮，触摸友好，简化控制栏
- **平板端** (768px - 1024px): 适中控件大小，平衡功能与空间
- **桌面端** (> 1024px): 完整功能显示，所有控制选项

```typescript
// 响应式配置
const player = new EbinPlayer(container, {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    uiMode: 'advanced',
    uiConfig: {
        // 响应式控制栏配置
        controlBar: {
            mobile: {
                height: 60,
                showAdvancedControls: false
            },
            tablet: {
                height: 50,
                showAdvancedControls: true
            },
            desktop: {
                height: 40,
                showAdvancedControls: true
            }
        }
    }
});
```

## ♿ 无障碍访问

基于 `ErrorHandler` 和 ARIA 标准的完整无障碍支持：

- ✅ **ARIA 标签** - 所有交互元素都有适当的标签
- ✅ **键盘导航** - 完整的 Tab 键导航支持
- ✅ **屏幕阅读器** - 兼容主流屏幕阅读器
- ✅ **高对比度** - 支持高对比度模式
- ✅ **焦点管理** - 清晰的焦点指示器
- ✅ **错误处理** - 优雅的错误提示和恢复

## 🌐 浏览器支持

- **Chrome** 60+
- **Firefox** 55+
- **Safari** 12+
- **Edge** 79+
- **移动端浏览器** iOS Safari 12+, Chrome Mobile 60+

## 📦 构建和开发

### 开发环境

```bash
# 克隆项目
git clone https://github.com/your-org/ebin-player.git
cd ebin-player

# 安装依赖
pnpm install

# 开发模式（监听文件变化）
pnpm run dev

# 构建生产版本
pnpm run build

# 类型检查
pnpm run type-check

# 文档开发
pnpm run docs:dev
```

### 构建脚本

```bash
# 构建 CSS（开发模式）
pnpm run build:css

# 构建 CSS（生产模式）
pnpm run build:css:prod

# 构建 JavaScript
pnpm run build

# 清理构建文件
pnpm run clean

# 构建文档
pnpm run docs:build

# 启动文档服务器
pnpm run docs:serve

# 文档开发模式
pnpm run docs:dev

# 完整构建并启动演示服务器
pnpm run demo
```

### 项目结构

```
src/
├── core/                    # 核心播放器
│   ├── Player.ts           # 主播放器类
│   ├── PlayerCore.ts       # 播放器核心
│   ├── PlayerStore.ts      # 状态管理
│   └── Logger.ts           # 日志系统
├── plugin/                 # 插件系统
│   ├── BasePlugin.ts       # 插件基类
│   ├── PluginManager.ts    # 插件管理器
│   └── built-in/           # 内置插件
├── ui/                     # UI系统
│   ├── ImprovedDefaultUI.ts # 改进版UI
│   ├── UIManager.ts        # UI管理器
│   ├── components/         # UI组件
│   ├── theme/              # 主题管理
│   └── responsive/         # 响应式管理
├── types/                  # 类型定义
└── index.ts               # 主入口文件
```

## 📚 文档

- [📖 完整文档](./docs/README.md)
- [🚀 快速开始](./docs/quick-start.md)
- [🔌 插件开发](./docs/examples/plugin-development.md)
- [🎨 主题定制](./docs/examples/theming.md)
- [📋 API文档](./docs-api/)

## 🎯 在线演示

- [🎬 完整演示](./demos/)
- [💻 基础示例](./examples/basic/)
- [🎨 自定义UI示例](./examples/custom-ui/)
- [🔌 插件示例](./examples/plugins/)
- [🎨 主题示例](./examples/themes/)

## 📖 示例和演示

### 基础使用示例

```javascript
// 基础播放器
import { PlayerInstance } from 'ebin-player';

const player = new EbinPlayer(container, {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    uiMode: 'advanced',
    debug: true
});

// 监听事件
player.on('play', () => console.log('开始播放'));
player.on('pause', () => console.log('暂停播放'));

// 状态订阅
player.subscribe(state => {
    console.log('当前时间:', state.currentTime);
    console.log('播放状态:', state.paused ? '暂停' : '播放');
});
```

### 插件使用示例

```javascript
// 使用内置插件
const player = new EbinPlayer(container, {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    uiMode: 'custom',
    builtinPlugins: {
        playbackRate: {
            defaultRate: 1.25,
            options: [
                { value: 0.5, label: '0.5x' },
                { value: 1, label: '1x' },
                { value: 1.25, label: '1.25x' },
                { value: 1.5, label: '1.5x' },
                { value: 2, label: '2x' }
            ]
        }
    }
});

// 自定义插件
class CustomPlugin extends BasePlugin {
    meta = {
        id: 'custom-plugin',
        version: '1.0.0',
        displayName: 'Custom Plugin'
    };

    async onInit(ctx) {
        // 插件初始化逻辑
        return { customMethod: () => console.log('Custom method') };
    }
}

player.use(new CustomPlugin());
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 开发指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

### 代码规范

- 使用 TypeScript 编写
- 遵循 ESLint 配置
- 添加适当的类型定义
- 编写单元测试
- 更新文档

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

**Ebin Player** - 让视频播放更简单、更强大、更美观！

> 基于现代架构设计，提供完整的类型安全和强大的扩展能力