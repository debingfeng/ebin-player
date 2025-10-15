# 🎬 Ebin Player

<div align="left">
  <p>
    <a href="./README.zhCN.md">中文文档</a> |
    <a href="./README.md">English Documentation</a>
  </p>
</div>

A modern, modular web video player built with TypeScript, featuring a brand-new architecture design with powerful plugin system and highly customizable UI.

## ✨ Core Features

### 🏗️ Modern Architecture
- ✅ **Layered Architecture Design** - Separated PlayerCore, PlayerStore, PluginManager layers
- ✅ **Reactive State Management** - Subscription-based state synchronization system
- ✅ **Event-Driven Architecture** - Complete event listening and dispatching mechanism
- ✅ **Plugin Design** - Modern plugin system with service, command, and configuration management
- ✅ **TypeScript Native** - Complete type definitions and type safety

### 🎨 Smart UI System
- ✅ **Multiple UI Modes** - Native, custom, advanced, and no-UI modes
- ✅ **Component Architecture** - Modular UI components based on UIManager
- ✅ **Responsive Design** - Auto-adaptation for mobile, tablet, and desktop
- ✅ **Theme System** - Dynamic theme switching based on ThemeManager
- ✅ **Accessibility Support** - Complete ARIA labels and keyboard navigation

### 🔌 Powerful Plugin System
- ✅ **Modern Plugin Architecture** - Declarative plugins based on PluginDefinition
- ✅ **Service Location** - Plugin service registration and discovery mechanism
- ✅ **Command System** - Inter-plugin command invocation and communication
- ✅ **Configuration Management** - Plugin configuration validation, version control, and migration
- ✅ **Permission Control** - Fine-grained plugin permission management

### 🚀 Player Features
- ✅ **Complete Playback Control** - Play/pause, fast forward/rewind, playback rate adjustment
- ✅ **Fullscreen Support** - Fullscreen and picture-in-picture modes
- ✅ **Volume Control** - Volume adjustment and mute functionality
- ✅ **Progress Control** - Precise time control and progress display
- ✅ **Keyboard Shortcuts** - Complete keyboard operation support

## 🚀 Quick Start

### Installation

```bash
pnpm add @ebin-player/core
# or
npm install @ebin-player/core
# or
yarn add @ebin-player/core
```

### Framework Bindings

Ebin Player provides official bindings for popular frontend frameworks:

#### React
```bash
npm install @ebin-player/react @ebin-player/core
```

```tsx
import { EbinPlayer } from '@ebin-player/react';
import '@ebin-player/core/styles';

function App() {
  return (
    <EbinPlayer
      src="video.mp4"
      uiMode="advanced"
      onReady={() => console.log('Player ready')}
    />
  );
}
```

#### Vue 2
```bash
npm install @ebin-player/vue2 @ebin-player/core
```

```vue
<template>
  <EbinPlayer
    :src="videoSrc"
    :ui-mode="'advanced'"
    @ready="onReady"
  />
</template>

<script>
import { EbinPlayer } from '@ebin-player/vue2';
import '@ebin-player/core/styles';

export default {
  components: { EbinPlayer },
  data() {
    return { videoSrc: 'video.mp4' };
  },
  methods: {
    onReady() { console.log('Player ready'); }
  }
};
</script>
```

#### Vue 3
```bash
npm install @ebin-player/vue3 @ebin-player/core
```

```vue
<template>
  <EbinPlayer
    :src="videoSrc"
    :ui-mode="'advanced'"
    @ready="onReady"
  />
</template>

<script setup>
import { ref } from 'vue';
import { EbinPlayer } from '@ebin-player/vue3';
import '@ebin-player/core/styles';

const videoSrc = ref('video.mp4');
const onReady = () => console.log('Player ready');
</script>
```

### Basic Usage

#### HTML Import

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="node_modules/@ebin-player/core/dist/styles.css">
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

#### ES6 Module Usage

```javascript
import { PlayerInstance } from '@ebin-player/core';
import '@ebin-player/core/styles';

const player = new EbinPlayer(container, {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    uiMode: 'advanced',
    debug: true
});
```

#### Using createPlayer Factory Function

```javascript
import { createPlayer } from '@ebin-player/core';
import '@ebin-player/core/styles';

const player = createPlayer(container, {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    uiMode: 'custom',
    theme: {
        primaryColor: '#3b82f6',
        backgroundColor: 'rgba(0, 0, 0, 0.8)'
    }
});
```

## 🎨 UI Modes

Ebin Player provides three UI modes to meet different scenario requirements:

### 1. Native Control Bar Mode (`native`)

Uses browser native HTML5 control bar for optimal performance:

```javascript
const player = new PlayerInstance(container, {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    uiMode: 'native'
});
```

### 2. Custom UI Mode (`custom`)

Modern custom interface based on ImprovedDefaultUI:

```javascript
const player = new PlayerInstance(container, {
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

### 3. No UI Mode (`none`)

Pure player core, suitable for custom development:

```javascript
const player = new PlayerInstance(container, {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    uiMode: 'none'
});

// Manually listen to events and state
player.on('play', () => console.log('Started playing'));
player.subscribe(state => console.log('State updated:', state));
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Function |
|----------|----------|
| `Space` / `Enter` | Play/Pause |
| `F` | Toggle fullscreen |
| `M` | Mute/Unmute |
| `C` | Toggle captions |
| `J` | Rewind 10 seconds |
| `L` | Forward 10 seconds |
| `←` | Rewind 5 seconds |
| `→` | Forward 5 seconds |
| `↑` | Increase volume |
| `↓` | Decrease volume |
| `Shift + <` | Decrease playback rate |
| `Shift + >` | Increase playback rate |

## 🔧 API Reference

### PlayerInstance

Main player class that integrates core functionality, state management, and plugin system.

#### Constructor

```typescript
new EbinPlayer(container: HTMLElement, options: PlayerOptions)
```

#### Core Methods

##### Playback Control
```typescript
// Async playback control
player.play(): Promise<PlayerInstance>
player.pause(): PlayerInstance
player.load(): PlayerInstance

// Time control
player.getCurrentTime(): number
player.setCurrentTime(time: number): PlayerInstance
player.getDuration(): number

// Volume control
player.getVolume(): number
player.setVolume(volume: number): PlayerInstance
player.getMuted(): boolean
player.setMuted(muted: boolean): PlayerInstance

// Playback rate
player.getPlaybackRate(): number
player.setPlaybackRate(rate: number): PlayerInstance
```

##### State Management
```typescript
// State access
player.getState(): PlayerState
player.setState(state: Partial<PlayerState>): void

// State subscription
player.subscribe(
    callback: (state: PlayerState) => void,
    keys?: (keyof PlayerState)[]
): () => void
```

##### Event System
```typescript
// Event listening
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

##### Fullscreen and Picture-in-Picture
```typescript
// Fullscreen control
player.requestFullscreen(): Promise<PlayerInstance>
player.exitFullscreen(): Promise<PlayerInstance>
player.isFullscreen(): boolean

// Picture-in-picture
player.requestPictureInPicture(): Promise<PictureInPictureWindow>
player.exitPictureInPicture(): Promise<PlayerInstance>
player.isPictureInPicture(): boolean
```

##### Plugin System
```typescript
// Plugin management
player.use(plugin: PluginDefinition): PlayerInstance
player.unuse(pluginId: string): PlayerInstance
player.getPlugin(pluginId: string): PluginDefinition | undefined
```

##### UI Control
```typescript
// UI management
player.updateUIMode(uiMode: UIMode): PlayerInstance
player.updateUIConfig(config: ControlBarConfig): PlayerInstance
player.updateUITheme(theme: PlayerTheme): PlayerInstance
player.getUIMode(): UIMode

// Element access
player.getContainer(): HTMLElement
player.getVideoElement(): HTMLVideoElement
```

##### Utility Methods
```typescript
// Player info
player.getInfo(): {
    version: string;
    lifecycle: string;
    plugins: string[];
    state: PlayerState;
    uiMode: UIMode;
}

// Debug
player.setDebug(enabled: boolean): void

// Destroy
player.destroy(): void
```

### Configuration Options

#### PlayerOptions

```typescript
interface PlayerOptions {
    // Basic configuration
    src: string;                    // Video source
    autoplay?: boolean;             // Auto play
    muted?: boolean;                // Muted
    volume?: number;                // Volume (0-1)
    playbackRate?: number;          // Playback rate
    poster?: string;                // Poster image
    width?: number | string;        // Width
    height?: number | string;       // Height
    loop?: boolean;                 // Loop playback
    preload?: 'none' | 'metadata' | 'auto';  // Preload strategy
    crossOrigin?: 'anonymous' | 'use-credentials' | '';  // CORS settings
    playsInline?: boolean;          // Inline playback
    
    // UI configuration
    uiMode?: UIMode;                // UI mode
    uiConfig?: ControlBarConfig;    // UI component configuration
    theme?: PlayerTheme;            // Theme configuration
    
    // Plugin configuration
    builtinPlugins?: {              // Built-in plugin configuration
        playbackRate?: boolean | {
            defaultRate?: number;
            options?: Array<{ value: number; label: string }>;
        };
    };
    
    // Debug configuration
    debug?: boolean;                // Debug mode
    logger?: Logger;                // Custom logger
}
```

#### ControlBarConfig

```typescript
interface ControlBarConfig {
    // Basic controls
    playButton?: boolean;
    progressBar?: boolean;
    timeDisplay?: boolean;
    volumeControl?: boolean;
    fullscreenButton?: boolean;
    
    // Advanced features
    playbackRateControl?: boolean;
    pictureInPictureButton?: boolean;
    qualitySelector?: boolean;
    subtitleToggle?: boolean;
    aspectRatio?: boolean;
    screenshot?: boolean;
    skipButtons?: boolean;
    
    // Custom components
    customButtons?: UIComponent[];
}
```

#### PlayerTheme

```typescript
interface PlayerTheme {
    primaryColor?: string;          // Primary color
    secondaryColor?: string;        // Secondary color
    backgroundColor?: string;       // Background color
    textColor?: string;             // Text color
    controlBarHeight?: number;      // Control bar height
    borderRadius?: number;          // Border radius
    fontFamily?: string;            // Font family
}
```

#### PlayerState

```typescript
interface PlayerState {
    // Basic playback state
    src: string;
    currentTime: number;
    duration: number;
    paused: boolean;
    muted: boolean;
    volume: number;
    playbackRate: number;
    
    // Media state
    readyState: number;
    networkState: number;
    error: MediaError | null;
    ended: boolean;
    loading: boolean;
    seeking: boolean;
    
    // Video dimensions
    videoWidth: number;
    videoHeight: number;
    
    // Buffer state
    buffered: TimeRanges | null;
    seekable: TimeRanges | null;
    
    // Playback quality
    quality: string;
    bitrate: number;
}
```

## 🎨 Theme Customization

### CSS Variables

```css
:root {
    --ebin-primary: #3b82f6;
    --ebin-secondary: #6b7280;
    --ebin-bg: rgba(0, 0, 0, 0.8);
    --ebin-text: #ffffff;
}
```

### Custom Styles

```css
/* Custom control bar styles */
.ebin-control-bar {
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
    border-radius: 12px;
}

/* Custom button styles */
.ebin-play-button {
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
    border-radius: 50%;
}
```

## 🔌 Modern Plugin System

Ebin Player adopts a brand-new plugin architecture based on `PluginDefinition` design, providing powerful extensibility and excellent developer experience.

### Plugin Architecture Features

- **Declarative Configuration** - Metadata-driven based on `PluginDefinition`
- **Service Location** - Plugin service registration and discovery mechanism
- **Command System** - Inter-plugin command invocation and communication
- **Configuration Management** - Configuration validation, version control, and migration
- **Permission Control** - Fine-grained plugin permission management
- **Lifecycle** - Complete plugin lifecycle management

### Built-in Plugin Configuration

Built-in plugins can be automatically enabled through configuration options:

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

### Plugin Development

#### Base Plugin Class

```typescript
import { BasePlugin, PluginDefinition, PluginContext } from '@ebin-player/core';

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
        description: 'An example plugin',
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
            errors: c?.enabled === undefined ? ['enabled must be boolean'] : []
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
        // Register service
        this.registerService('myService', {
            doSomething: () => console.log('Service call')
        });
        
        // Listen to player events
        this.on('play', () => console.log('Started playing'));
        
        return {
            getStatus: () => this.ctx.getConfig<MyPluginConfig>().enabled,
            doSomething: () => console.log('Execute operation')
        };
    }

    onStart() {
        console.log('Plugin started');
    }

    onConfigChange(newConfig: Partial<MyPluginConfig>) {
        console.log('Configuration updated:', newConfig);
    }
}

// Use plugin
const plugin = new MyPlugin();
player.use(plugin);
```

#### Plugin Context API

```typescript
interface PluginContext {
    player: PlayerInstance;
    logger: Logger;
    
    // Event system
    on<T extends PlayerEventType>(event: T, callback: (event: PlayerEventBase<T>) => void): () => void;
    off<T extends PlayerEventType>(event: T, callback: (event: PlayerEventBase<T>) => void): void;
    emit<T extends PlayerEventType>(event: T, data?: EventPayloadMap[T]): void;
    onAnyPlayerEvent(callback: (event: PlayerEvent) => void): () => void;
    
    // Inter-plugin communication
    onPluginEvent(pluginId: string, type: string, callback: (data: any) => void): () => void;
    emitPluginEvent(pluginId: string, type: string, data?: any): void;
    
    // Service system
    registerService<T>(name: string, service: T): void;
    getService<T>(name: string): T | undefined;
    
    // Configuration management
    getConfig<T = unknown>(): T;
    setConfig<T = unknown>(partial: Partial<T>): void;
    
    // Storage system
    storage: {
        get<T = unknown>(key: string): T | undefined;
        set<T = unknown>(key: string, value: T): void;
        delete(key: string): void;
        keys(): string[];
    };
    
    // Permission check
    hasPermission?(perm: PluginPermission): boolean;
}
```

### Built-in Plugins

#### PlaybackRatePlugin

Playback rate control plugin, automatically integrated into control bar:

```typescript
// Enable through configuration
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

// Or manually install
import { PlaybackRatePlugin } from '@ebin-player/core';
player.use(PlaybackRatePlugin);
```

### Plugin Development Best Practices

1. **Extend BasePlugin** - Use base class for common functionality
2. **Declare Permissions** - Clearly specify required permissions
3. **Provide Configuration Validation** - Ensure configuration correctness
4. **Implement Lifecycle** - Properly handle initialization and destruction
5. **Use Service System** - Collaborate with other plugins through services
6. **Error Handling** - Gracefully handle exception cases
7. **Type Safety** - Use TypeScript to ensure type safety

## 📱 Responsive Design

Intelligent responsive system based on `ResponsiveManager`:

- **Mobile** (< 768px): Large buttons, touch-friendly, simplified control bar
- **Tablet** (768px - 1024px): Moderate control size, balanced functionality and space
- **Desktop** (> 1024px): Complete functionality display, all control options

```typescript
// Responsive configuration
const player = new EbinPlayer(container, {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    uiMode: 'advanced',
    uiConfig: {
        // Responsive control bar configuration
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

## ♿ Accessibility

Complete accessibility support based on `ErrorHandler` and ARIA standards:

- ✅ **ARIA Labels** - All interactive elements have appropriate labels
- ✅ **Keyboard Navigation** - Complete Tab key navigation support
- ✅ **Screen Reader** - Compatible with mainstream screen readers
- ✅ **High Contrast** - Support for high contrast mode
- ✅ **Focus Management** - Clear focus indicators
- ✅ **Error Handling** - Graceful error prompts and recovery

## 🌐 Browser Support

- **Chrome** 60+
- **Firefox** 55+
- **Safari** 12+
- **Edge** 79+
- **Mobile Browsers** iOS Safari 12+, Chrome Mobile 60+

## 📦 Build and Development

### Development Environment

```bash
# Clone project
git clone https://github.com/your-org/ebin-player.git
cd ebin-player

# Install dependencies
pnpm install

# Development mode (watch file changes)
pnpm run dev

# Build production version
pnpm run build

# Type checking
pnpm run type-check

# Documentation development
pnpm run docs:dev
```

### Build Scripts

```bash
# Build CSS (development mode)
pnpm run build:css

# Build CSS (production mode)
pnpm run build:css:prod

# Build JavaScript
pnpm run build

# Clean build files
pnpm run clean

# Build documentation
pnpm run docs:build

# Start documentation server
pnpm run docs:serve

# Documentation development mode
pnpm run docs:dev

# Complete build and start demo server
pnpm run demo
```

### Project Structure

```
src/
├── core/                    # Core player
│   ├── Player.ts           # Main player class
│   ├── PlayerCore.ts       # Player core
│   ├── PlayerStore.ts      # State management
│   └── Logger.ts           # Logging system
├── plugin/                 # Plugin system
│   ├── BasePlugin.ts       # Plugin base class
│   ├── PluginManager.ts    # Plugin manager
│   └── built-in/           # Built-in plugins
├── ui/                     # UI system
│   ├── ImprovedDefaultUI.ts # Improved UI
│   ├── UIManager.ts        # UI manager
│   ├── components/         # UI components
│   ├── theme/              # Theme management
│   └── responsive/         # Responsive management
├── types/                  # Type definitions
└── index.ts               # Main entry file
```

## 📚 Documentation

- [📖 Complete Documentation](./docs/en/README.md)
- [🚀 Quick Start](./docs/en/quick-start.md)
- [🔌 Plugin Development](./docs/en/examples/plugin-development.md)
- [🎨 Theme Customization](./docs/en/examples/theming.md)
- [📋 API Documentation](./docs-api/)

## 🎯 Online Demos

- [🎬 Complete Demo](./demos/)
- [💻 Basic Example](./examples/basic/)
- [🎨 Custom UI Example](./examples/custom-ui/)
- [🔌 Plugin Example](./examples/plugins/)
- [🎨 Theme Example](./examples/themes/)

## 📖 Examples and Demos

### Basic Usage Example

```javascript
// Basic player
import { PlayerInstance } from '@ebin-player/core';

const player = new EbinPlayer(container, {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    uiMode: 'advanced',
    debug: true
});

// Listen to events
player.on('play', () => console.log('Started playing'));
player.on('pause', () => console.log('Paused playing'));

// State subscription
player.subscribe(state => {
    console.log('Current time:', state.currentTime);
    console.log('Playback state:', state.paused ? 'Paused' : 'Playing');
});
```

### Plugin Usage Example

```javascript
// Use built-in plugins
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

// Custom plugin
class CustomPlugin extends BasePlugin {
    meta = {
        id: 'custom-plugin',
        version: '1.0.0',
        displayName: 'Custom Plugin'
    };

    async onInit(ctx) {
        // Plugin initialization logic
        return { customMethod: () => console.log('Custom method') };
    }
}

player.use(new CustomPlugin());
```

## 🤝 Contributing

Welcome to submit Issues and Pull Requests!

### Development Guide

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards

- Write in TypeScript
- Follow ESLint configuration
- Add appropriate type definitions
- Write unit tests
- Update documentation

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

---

**Ebin Player** - Making video playback simpler, more powerful, and more beautiful!

> Built with modern architecture design, providing complete type safety and powerful extensibility

