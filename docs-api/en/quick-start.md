# Quick Start Guide

Get up and running with EbinPlayer in minutes.

## Basic Setup

### 1. Include the Library

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="node_modules/ebin-player/dist/styles.css">
</head>
<body>
    <div id="player"></div>
    <script src="node_modules/ebin-player/dist/ebin-player.umd.js"></script>
</body>
</html>
```

### 2. Initialize the Player

```javascript
const player = new EbinPlayer(document.getElementById('player'), {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    width: 800,
    height: 450,
    autoplay: false,
    controls: true
});
```

## Configuration Options

### Basic Configuration

```javascript
const player = new EbinPlayer(container, {
    src: 'video.mp4',                    // Video source
    width: 800,                          // Player width
    height: 450,                         // Player height
    autoplay: false,                     // Auto start playback
    controls: true,                      // Show control bar
    preload: 'metadata',                 // Preload strategy
    loop: false,                         // Loop playback
    muted: false,                        // Start muted
    volume: 1,                           // Initial volume (0-1)
    playbackRate: 1                      // Playback speed
});
```

### Advanced Configuration

```javascript
const player = new EbinPlayer(container, {
    src: 'video.mp4',
    uiMode: 'advanced',                  // UI mode: 'basic', 'advanced', 'minimal'
    theme: {                             // Theme customization
        primaryColor: '#007bff',
        controlBarHeight: 50,
        borderRadius: 4,
        fontSize: 14
    },
    plugins: {                           // Plugin configuration
        playbackRate: {
            rates: [0.5, 1, 1.25, 1.5, 2]
        }
    },
    debug: false                         // Enable debug mode
});
```

## Video Source Configuration

### Single Video Source

```javascript
const player = new EbinPlayer(container, {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
});
```

### Multiple Video Sources (Auto-select best format)

```javascript
const player = new EbinPlayer(container, {
    src: [
        { src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', type: 'video/mp4' },
        { src: 'video.webm', type: 'video/webm' },
        { src: 'video.ogv', type: 'video/ogg' }
    ]
});
```

## Event Handling

### Basic Events

```javascript
// Player ready
player.on('ready', () => {
    console.log('Player is ready');
});

// Playback events
player.on('play', () => {
    console.log('Playback started');
});

player.on('pause', () => {
    console.log('Playback paused');
});

player.on('ended', () => {
    console.log('Playback ended');
});

// Error handling
player.on('error', (error) => {
    console.error('Player error:', error);
});
```

### Time Events

```javascript
// Time update
player.on('timeupdate', (currentTime) => {
    console.log('Current time:', currentTime);
});

// Duration change
player.on('durationchange', (duration) => {
    console.log('Duration:', duration);
});

// Seeking
player.on('seeking', () => {
    console.log('Seeking...');
});

player.on('seeked', () => {
    console.log('Seek completed');
});
```

### Volume Events

```javascript
// Volume change
player.on('volumechange', (volume) => {
    console.log('Volume:', volume);
});

// Mute toggle
player.on('mute', () => {
    console.log('Muted');
});

player.on('unmute', () => {
    console.log('Unmuted');
});
```

## Player Control

### Playback Control

```javascript
// Play/pause
player.play();
player.pause();
player.toggle();

// Stop and reset
player.stop();

// Seek to specific time (in seconds)
player.seek(30);

// Set playback rate
player.setPlaybackRate(1.5);
```

### Volume Control

```javascript
// Set volume (0-1)
player.setVolume(0.5);

// Mute/unmute
player.mute();
player.unmute();
player.toggleMute();
```

### State Management

```javascript
// Get current state
const state = player.getState();
console.log('Current state:', state);

// Update state
player.setState({
    volume: 0.8,
    playbackRate: 1.25
});
```

## Plugin System

### Using Built-in Plugins

```javascript
const player = new EbinPlayer(container, {
    src: 'video.mp4',
    plugins: {
        playbackRate: {
            rates: [0.5, 0.75, 1, 1.25, 1.5, 2]
        }
    }
});
```

### Custom Plugin

```javascript
class CustomPlugin {
    constructor(player, options) {
        this.player = player;
        this.options = options;
        this.init();
    }
    
    init() {
        // Add custom UI elements
        this.createCustomControls();
        
        // Listen to player events
        this.player.on('ready', this.onReady.bind(this));
    }
    
    createCustomControls() {
        // Create custom control elements
    }
    
    onReady() {
        console.log('Custom plugin ready');
    }
    
    destroy() {
        // Cleanup
    }
}

// Use custom plugin
player.use(CustomPlugin, { option: 'value' });
```

## Theme Customization

### CSS Variables

```css
.ebin-player {
    --primary-color: #ff6b6b;
    --control-bar-height: 60px;
    --border-radius: 8px;
    --font-size: 16px;
    --background-color: rgba(0, 0, 0, 0.8);
    --text-color: #ffffff;
}
```

### JavaScript Theme

```javascript
const player = new EbinPlayer(container, {
    src: 'video.mp4',
    theme: {
        primaryColor: '#ff6b6b',
        controlBarHeight: 60,
        borderRadius: 8,
        fontSize: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        textColor: '#ffffff'
    }
});
```

## Responsive Design

### Auto Resize

```javascript
const player = new EbinPlayer(container, {
    src: 'video.mp4',
    width: '100%',
    height: 'auto',
    responsive: true
});
```

### Breakpoint Configuration

```javascript
const player = new EbinPlayer(container, {
    src: 'video.mp4',
    responsive: {
        breakpoints: {
            mobile: 768,
            tablet: 1024,
            desktop: 1200
        },
        layouts: {
            mobile: 'minimal',
            tablet: 'basic',
            desktop: 'advanced'
        }
    }
});
```

## Keyboard Shortcuts

EbinPlayer supports standard keyboard shortcuts:

- `Space` - Play/Pause
- `←` - Seek backward 10 seconds
- `→` - Seek forward 10 seconds
- `↑` - Increase volume
- `↓` - Decrease volume
- `M` - Mute/Unmute
- `F` - Toggle fullscreen

## Fullscreen Support

```javascript
// Enter fullscreen
player.enterFullscreen();

// Exit fullscreen
player.exitFullscreen();

// Toggle fullscreen
player.toggleFullscreen();

// Check fullscreen state
const isFullscreen = player.isFullscreen();
```

## Error Handling

```javascript
player.on('error', (error) => {
    console.error('Player error:', error);
    
    // Handle different error types
    switch (error.type) {
        case 'network':
            console.log('Network error, retrying...');
            break;
        case 'decode':
            console.log('Video decode error');
            break;
        case 'source':
            console.log('Invalid video source');
            break;
        default:
            console.log('Unknown error');
    }
});
```

## Cleanup

Always destroy the player when done:

```javascript
// Destroy player and cleanup
player.destroy();
```

## Next Steps

- [API Reference](../api/README.md)
- [Plugin Development Guide](../plugins/README.md)
- [Theme Customization](../themes/README.md)
- [Examples](../../examples/)
