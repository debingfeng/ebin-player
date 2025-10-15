# 浏览器兼容性指南

Ebin Player 提供了全面的浏览器兼容性支持，包括自动播放、全屏、画中画、字幕渲染等功能的跨平台适配。

## 🌐 浏览器支持

### 桌面端浏览器
- **Chrome** 60+ ✅
- **Firefox** 55+ ✅  
- **Safari** 12+ ✅
- **Edge** 79+ ✅

### 移动端浏览器
- **iOS Safari** 12+ ✅
- **Chrome Mobile** 60+ ✅
- **Samsung Internet** 8+ ✅
- **UC Browser** 12+ ✅

## 🔧 兼容性适配层

Ebin Player 内置了完整的兼容性适配层，自动处理不同浏览器间的差异：

### 自动播放管理 (AutoplayManager)

```typescript
import { AutoplayManager } from '@ebin-player/core';

const autoplayManager = new AutoplayManager();

// 检查自动播放支持
const canAutoplay = await autoplayManager.canAutoplay({
  muted: false,
  withUserGesture: false
});

// 尝试自动播放
try {
  await autoplayManager.tryAutoplay(videoElement, {
    muted: true, // 静音播放更容易成功
    withUserGesture: false
  });
} catch (error) {
  console.log('自动播放失败，需要用户交互');
}
```

### 全屏适配 (FullscreenAdapter)

```typescript
import { FullscreenAdapter } from '@ebin-player/core';

const fullscreenAdapter = new FullscreenAdapter();

// 检查全屏支持
if (fullscreenAdapter.isSupported()) {
  // 进入全屏
  await fullscreenAdapter.requestFullscreen(videoElement);
  
  // 监听全屏状态变化
  fullscreenAdapter.on('change', (isFullscreen) => {
    console.log('全屏状态:', isFullscreen);
  });
}
```

### 画中画适配 (PictureInPictureAdapter)

```typescript
import { PictureInPictureAdapter } from '@ebin-player/core';

const pipAdapter = new PictureInPictureAdapter();

// 检查画中画支持
if (pipAdapter.isSupported()) {
  // 进入画中画
  await pipAdapter.requestPictureInPicture(videoElement);
  
  // 监听画中画状态变化
  pipAdapter.on('change', (isPiP) => {
    console.log('画中画状态:', isPiP);
  });
}
```

### 字幕渲染器 (SubtitleRenderer)

```typescript
import { SubtitleRenderer } from '@ebin-player/core';

const subtitleRenderer = new SubtitleRenderer(containerElement);

// 渲染字幕
const cues = [
  { startTime: 0, endTime: 3, text: 'Hello World' },
  { startTime: 3, endTime: 6, text: 'Ebin Player Subtitle' }
];

subtitleRenderer.render(cues, currentTime);

// 自定义样式
subtitleRenderer.setStyle({
  fontSize: '18px',
  color: '#ffffff',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  padding: '8px 12px',
  borderRadius: '4px'
});
```

### 能力探测 (Capabilities)

```typescript
import { detectCapabilities } from '@ebin-player/core';

const capabilities = await detectCapabilities();

console.log('浏览器能力:', {
  autoplay: capabilities.autoplay,
  fullscreen: capabilities.fullscreen,
  pictureInPicture: capabilities.pictureInPicture,
  webCodecs: capabilities.webCodecs,
  mediaSession: capabilities.mediaSession,
  touch: capabilities.touch
});
```

## 📱 移动端特殊处理

### 触摸手势支持

```typescript
// 自动检测触摸设备并启用手势支持
const player = new EbinPlayer(container, {
  src: 'video.mp4',
  touchGestures: true, // 启用触摸手势
  doubleTapToSeek: true, // 双击快进/快退
  pinchToZoom: false // 禁用双指缩放（避免与播放器冲突）
});
```

### 移动端优化

```typescript
// 移动端专用配置
const player = new EbinPlayer(container, {
  src: 'video.mp4',
  uiMode: 'mobile', // 移动端UI模式
  controls: true,
  playsInline: true, // iOS内联播放
  preload: 'metadata', // 移动端预加载策略
  autoplay: false // 移动端通常禁用自动播放
});
```

## 🎬 视频格式兼容性

### 推荐格式

| 格式 | 桌面端 | 移动端 | 备注 |
|------|--------|--------|------|
| MP4 (H.264) | ✅ | ✅ | 最佳兼容性 |
| WebM (VP9) | ✅ | ⚠️ | Chrome/Firefox支持 |
| WebM (VP8) | ✅ | ⚠️ | 较老浏览器支持 |
| OGG (Theora) | ⚠️ | ❌ | Firefox支持 |

### 多格式回退

```typescript
const player = new EbinPlayer(container, {
  src: [
    { src: 'video.mp4', type: 'video/mp4' },
    { src: 'video.webm', type: 'video/webm' },
    { src: 'video.ogg', type: 'video/ogg' }
  ]
});
```

## 🔧 常见兼容性问题解决

### 1. 自动播放失败

```typescript
// 问题：移动端自动播放被阻止
// 解决：使用静音自动播放 + 用户交互后取消静音

const player = new EbinPlayer(container, {
  src: 'video.mp4',
  autoplay: true,
  muted: true, // 静音自动播放
  onReady: () => {
    // 用户交互后取消静音
    document.addEventListener('click', () => {
      player.setMuted(false);
    }, { once: true });
  }
});
```

### 2. 全屏API差异

```typescript
// 问题：不同浏览器的全屏API不同
// 解决：使用FullscreenAdapter统一处理

import { FullscreenAdapter } from '@ebin-player/core';

const fullscreenAdapter = new FullscreenAdapter();

// 统一的全屏API
await fullscreenAdapter.requestFullscreen(videoElement);
```

### 3. 字幕格式支持

```typescript
// 问题：不同浏览器对字幕格式支持不同
// 解决：使用SubtitleRenderer自绘字幕

import { SubtitleRenderer } from '@ebin-player/core';

const subtitleRenderer = new SubtitleRenderer(container);

// 解析VTT字幕
const vttContent = `WEBVTT

00:00:00.000 --> 00:00:03.000
Hello World

00:00:03.000 --> 00:00:06.000
Ebin Player Subtitle`;

const cues = parseVTT(vttContent);
subtitleRenderer.render(cues, currentTime);
```

### 4. 内存管理

```typescript
// 问题：移动端内存限制
// 解决：及时清理资源

const player = new EbinPlayer(container, {
  src: 'video.mp4',
  onDestroy: () => {
    // 清理事件监听器
    player.off('timeupdate', timeUpdateHandler);
    
    // 清理定时器
    clearInterval(progressTimer);
    
    // 清理DOM引用
    container.innerHTML = '';
  }
});
```

## 🧪 兼容性测试

### 自动检测

```typescript
import { detectCapabilities } from '@ebin-player/core';

// 检测当前浏览器能力
const capabilities = await detectCapabilities();

if (!capabilities.autoplay) {
  console.warn('当前浏览器不支持自动播放');
}

if (!capabilities.fullscreen) {
  console.warn('当前浏览器不支持全屏');
}

if (!capabilities.pictureInPicture) {
  console.warn('当前浏览器不支持画中画');
}
```

### 手动测试

```typescript
// 测试自动播放
const testAutoplay = async () => {
  const video = document.createElement('video');
  video.src = 'test.mp4';
  video.muted = true;
  
  try {
    await video.play();
    console.log('自动播放支持');
    video.pause();
  } catch (error) {
    console.log('自动播放不支持');
  }
};

// 测试全屏
const testFullscreen = () => {
  if (document.fullscreenEnabled) {
    console.log('全屏支持');
  } else {
    console.log('全屏不支持');
  }
};
```

## 📋 兼容性检查清单

- [ ] 自动播放策略适配
- [ ] 全屏API统一处理
- [ ] 画中画功能检测
- [ ] 触摸手势支持
- [ ] 移动端内联播放
- [ ] 字幕格式兼容
- [ ] 内存使用优化
- [ ] 错误处理机制
- [ ] 降级方案准备

## 🔗 相关资源

- [MDN 视频兼容性](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video)
- [Can I Use 兼容性查询](https://caniuse.com/)
- [WebRTC 兼容性](https://webrtc.org/getting-started/browser-support)
- [Media Session API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API)

---

通过使用 Ebin Player 的兼容性适配层，您可以轻松处理各种浏览器差异，确保视频播放器在所有平台上都能正常工作。
