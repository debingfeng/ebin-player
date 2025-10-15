# EbinPlayer Documentation

A modular, plugin-based web video player with modern architecture and TypeScript support.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Plugin Development](#plugin-development)
- [Theme Customization](#theme-customization)
- [Contributing](#contributing)

## Installation

### NPM

```bash
npm install @ebin-player
```

### Yarn

```bash
yarn add ebin-player
```

### pnpm

```bash
pnpm add ebin-player
```

### CDN

```html
<script src="https://unpkg.com/ebin-player/dist/ebin-player.umd.js"></script>
<link rel="stylesheet" href="https://unpkg.com/ebin-player/dist/styles.css">
```

## Quick Start

### Basic Usage

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
            src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
            autoplay: false,
            controls: true
        });
    </script>
</body>
</html>
```

### ES6 Module

```javascript
import EbinPlayer from '@ebin-player';
import 'ebin-player/dist/styles.css';

const player = new EbinPlayer(container, {
    src: 'video.mp4',
    autoplay: false,
    controls: true
});
```

### TypeScript

```typescript
import { createPlayer, type PlayerOptions } from '@ebin-player';

const options: PlayerOptions = {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    autoplay: false,
    controls: true
};

const player = createPlayer(container, options);
```

## API Reference

### PlayerInstance

The main player class that integrates core functionality, state management, and plugin system.

#### Constructor

```typescript
new EbinPlayer(container: HTMLElement, options: PlayerOptions)
```

#### Core Methods

##### Playback Control

- `play()`: Start playback
- `pause()`: Pause playback
- `toggle()`: Toggle play/pause
- `stop()`: Stop playback and reset position
- `seek(time: number)`: Seek to specific time
- `setVolume(volume: number)`: Set volume (0-1)
- `mute()`: Mute audio
- `unmute()`: Unmute audio
- `toggleMute()`: Toggle mute state

##### State Management

- `getState()`: Get current player state
- `setState(state: Partial<PlayerState>)`: Update player state
- `on(event: string, callback: Function)`: Add event listener
- `off(event: string, callback: Function)`: Remove event listener
- `emit(event: string, data?: any)`: Emit custom event

##### Plugin System

- `use(plugin: PluginDefinition, options?: any)`: Use a plugin
- `unuse(pluginId: string)`: Remove a plugin
- `getPlugin(pluginId: string)`: Get plugin instance

### PlayerOptions

```typescript
interface PlayerOptions {
    src: string | Array<{src: string, type: string}>;
    width?: number | string;
    height?: number | string;
    autoplay?: boolean;
    controls?: boolean;
    preload?: 'none' | 'metadata' | 'auto';
    loop?: boolean;
    muted?: boolean;
    volume?: number;
    playbackRate?: number;
    theme?: PlayerTheme;
    plugins?: Record<string, any>;
    uiMode?: 'basic' | 'advanced' | 'minimal';
    debug?: boolean;
}
```

## Examples

### Basic Player

```javascript
const player = new EbinPlayer(container, {
    src: 'video.mp4',
    width: 800,
    height: 450,
    autoplay: false,
    controls: true
});
```

### Custom Theme

```javascript
const player = new EbinPlayer(container, {
    src: 'video.mp4',
    theme: {
        primaryColor: '#ff6b6b',
        controlBarHeight: 60,
        borderRadius: 8,
        fontSize: 16
    }
});
```

### Plugin Usage

```javascript
const player = new EbinPlayer(container, {
    src: 'video.mp4',
    plugins: {
        playbackRate: {
            rates: [0.5, 1, 1.25, 1.5, 2]
        }
    }
});
```

## Plugin Development

### Creating a Plugin

```javascript
class CustomPlugin {
    constructor(player, options) {
        this.player = player;
        this.options = options;
        this.init();
    }
    
    init() {
        // Plugin initialization
        this.player.on('ready', this.onReady.bind(this));
    }
    
    onReady() {
        console.log('Custom plugin ready');
    }
    
    destroy() {
        // Cleanup
        this.player.off('ready', this.onReady);
    }
}

// Use the plugin
player.use(CustomPlugin, { option: 'value' });
```

## Theme Customization

### CSS Variables

```css
.ebin-player {
    --primary-color: #007bff;
    --control-bar-height: 50px;
    --border-radius: 4px;
    --font-size: 14px;
}
```

### JavaScript Configuration

```javascript
const player = new EbinPlayer(container, {
    src: 'video.mp4',
    theme: {
        primaryColor: '#ff6b6b',
        controlBarHeight: 60,
        borderRadius: 8,
        fontSize: 16
    }
});
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/debingfeng/ebin-player.git

# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Run tests
pnpm run test

# Build
pnpm run build
```

## License

MIT License - see [LICENSE](LICENSE) file for details.
