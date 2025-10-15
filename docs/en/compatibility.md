# Browser Compatibility Guide

Ebin Player provides comprehensive browser compatibility support, including cross-platform adaptation for autoplay, fullscreen, picture-in-picture, subtitle rendering, and other features.

## 🌐 Browser Support

### Desktop Browsers
- **Chrome** 60+ ✅
- **Firefox** 55+ ✅  
- **Safari** 12+ ✅
- **Edge** 79+ ✅

### Mobile Browsers
- **iOS Safari** 12+ ✅
- **Chrome Mobile** 60+ ✅
- **Samsung Internet** 8+ ✅
- **UC Browser** 12+ ✅

## 🔧 Compatibility Adapter Layer

Ebin Player includes a complete compatibility adapter layer that automatically handles differences between browsers:

### Autoplay Manager (AutoplayManager)

```typescript
import { AutoplayManager } from '@ebin-player/core';

const autoplayManager = new AutoplayManager();

// Check autoplay support
const canAutoplay = await autoplayManager.canAutoplay({
  muted: false,
  withUserGesture: false
});

// Try autoplay
try {
  await autoplayManager.tryAutoplay(videoElement, {
    muted: true, // Muted playback is more likely to succeed
    withUserGesture: false
  });
} catch (error) {
  console.log('Autoplay failed, user interaction required');
}
```

### Fullscreen Adapter (FullscreenAdapter)

```typescript
import { FullscreenAdapter } from '@ebin-player/core';

const fullscreenAdapter = new FullscreenAdapter();

// Check fullscreen support
if (fullscreenAdapter.isSupported()) {
  // Enter fullscreen
  await fullscreenAdapter.requestFullscreen(videoElement);
  
  // Listen for fullscreen state changes
  fullscreenAdapter.on('change', (isFullscreen) => {
    console.log('Fullscreen state:', isFullscreen);
  });
}
```

### Picture-in-Picture Adapter (PictureInPictureAdapter)

```typescript
import { PictureInPictureAdapter } from '@ebin-player/core';

const pipAdapter = new PictureInPictureAdapter();

// Check picture-in-picture support
if (pipAdapter.isSupported()) {
  // Enter picture-in-picture
  await pipAdapter.requestPictureInPicture(videoElement);
  
  // Listen for picture-in-picture state changes
  pipAdapter.on('change', (isPiP) => {
    console.log('Picture-in-picture state:', isPiP);
  });
}
```

### Subtitle Renderer (SubtitleRenderer)

```typescript
import { SubtitleRenderer } from '@ebin-player/core';

const subtitleRenderer = new SubtitleRenderer(containerElement);

// Render subtitles
const cues = [
  { startTime: 0, endTime: 3, text: 'Hello World' },
  { startTime: 3, endTime: 6, text: 'Ebin Player Subtitle' }
];

subtitleRenderer.render(cues, currentTime);

// Custom styling
subtitleRenderer.setStyle({
  fontSize: '18px',
  color: '#ffffff',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  padding: '8px 12px',
  borderRadius: '4px'
});
```

### Capabilities Detection (Capabilities)

```typescript
import { detectCapabilities } from '@ebin-player/core';

const capabilities = await detectCapabilities();

console.log('Browser capabilities:', {
  autoplay: capabilities.autoplay,
  fullscreen: capabilities.fullscreen,
  pictureInPicture: capabilities.pictureInPicture,
  webCodecs: capabilities.webCodecs,
  mediaSession: capabilities.mediaSession,
  touch: capabilities.touch
});
```

## 📱 Mobile-Specific Handling

### Touch Gesture Support

```typescript
// Automatically detect touch devices and enable gesture support
const player = new EbinPlayer(container, {
  src: 'video.mp4',
  touchGestures: true, // Enable touch gestures
  doubleTapToSeek: true, // Double tap to seek forward/backward
  pinchToZoom: false // Disable pinch to zoom (avoid conflicts with player)
});
```

### Mobile Optimization

```typescript
// Mobile-specific configuration
const player = new EbinPlayer(container, {
  src: 'video.mp4',
  uiMode: 'mobile', // Mobile UI mode
  controls: true,
  playsInline: true, // iOS inline playback
  preload: 'metadata', // Mobile preload strategy
  autoplay: false // Usually disable autoplay on mobile
});
```

## 🎬 Video Format Compatibility

### Recommended Formats

| Format | Desktop | Mobile | Notes |
|--------|---------|--------|-------|
| MP4 (H.264) | ✅ | ✅ | Best compatibility |
| WebM (VP9) | ✅ | ⚠️ | Chrome/Firefox support |
| WebM (VP8) | ✅ | ⚠️ | Older browser support |
| OGG (Theora) | ⚠️ | ❌ | Firefox support |

### Multi-format Fallback

```typescript
const player = new EbinPlayer(container, {
  src: [
    { src: 'video.mp4', type: 'video/mp4' },
    { src: 'video.webm', type: 'video/webm' },
    { src: 'video.ogg', type: 'video/ogg' }
  ]
});
```

## 🔧 Common Compatibility Issues & Solutions

### 1. Autoplay Failure

```typescript
// Problem: Mobile autoplay blocked
// Solution: Use muted autoplay + unmute after user interaction

const player = new EbinPlayer(container, {
  src: 'video.mp4',
  autoplay: true,
  muted: true, // Muted autoplay
  onReady: () => {
    // Unmute after user interaction
    document.addEventListener('click', () => {
      player.setMuted(false);
    }, { once: true });
  }
});
```

### 2. Fullscreen API Differences

```typescript
// Problem: Different browsers have different fullscreen APIs
// Solution: Use FullscreenAdapter for unified handling

import { FullscreenAdapter } from '@ebin-player/core';

const fullscreenAdapter = new FullscreenAdapter();

// Unified fullscreen API
await fullscreenAdapter.requestFullscreen(videoElement);
```

### 3. Subtitle Format Support

```typescript
// Problem: Different browsers support different subtitle formats
// Solution: Use SubtitleRenderer for custom subtitle rendering

import { SubtitleRenderer } from '@ebin-player/core';

const subtitleRenderer = new SubtitleRenderer(container);

// Parse VTT subtitles
const vttContent = `WEBVTT

00:00:00.000 --> 00:00:03.000
Hello World

00:00:03.000 --> 00:00:06.000
Ebin Player Subtitle`;

const cues = parseVTT(vttContent);
subtitleRenderer.render(cues, currentTime);
```

### 4. Memory Management

```typescript
// Problem: Mobile memory limitations
// Solution: Properly clean up resources

const player = new EbinPlayer(container, {
  src: 'video.mp4',
  onDestroy: () => {
    // Clean up event listeners
    player.off('timeupdate', timeUpdateHandler);
    
    // Clean up timers
    clearInterval(progressTimer);
    
    // Clean up DOM references
    container.innerHTML = '';
  }
});
```

## 🧪 Compatibility Testing

### Automatic Detection

```typescript
import { detectCapabilities } from '@ebin-player/core';

// Detect current browser capabilities
const capabilities = await detectCapabilities();

if (!capabilities.autoplay) {
  console.warn('Current browser does not support autoplay');
}

if (!capabilities.fullscreen) {
  console.warn('Current browser does not support fullscreen');
}

if (!capabilities.pictureInPicture) {
  console.warn('Current browser does not support picture-in-picture');
}
```

### Manual Testing

```typescript
// Test autoplay
const testAutoplay = async () => {
  const video = document.createElement('video');
  video.src = 'test.mp4';
  video.muted = true;
  
  try {
    await video.play();
    console.log('Autoplay supported');
    video.pause();
  } catch (error) {
    console.log('Autoplay not supported');
  }
};

// Test fullscreen
const testFullscreen = () => {
  if (document.fullscreenEnabled) {
    console.log('Fullscreen supported');
  } else {
    console.log('Fullscreen not supported');
  }
};
```

## 📋 Compatibility Checklist

- [ ] Autoplay policy adaptation
- [ ] Fullscreen API unified handling
- [ ] Picture-in-picture feature detection
- [ ] Touch gesture support
- [ ] Mobile inline playback
- [ ] Subtitle format compatibility
- [ ] Memory usage optimization
- [ ] Error handling mechanism
- [ ] Fallback solution preparation

## 🔗 Related Resources

- [MDN Video Compatibility](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video)
- [Can I Use Compatibility Query](https://caniuse.com/)
- [WebRTC Compatibility](https://webrtc.org/getting-started/browser-support)
- [Media Session API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API)

---

By using Ebin Player's compatibility adapter layer, you can easily handle various browser differences and ensure the video player works properly on all platforms.
