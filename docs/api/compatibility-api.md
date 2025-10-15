# 兼容性适配 API

Ebin Player 提供了完整的浏览器兼容性适配 API，帮助开发者处理不同浏览器间的差异。

## 核心适配器

### AutoplayManager

自动播放管理器，处理不同浏览器的自动播放策略。

```typescript
import { AutoplayManager } from '@ebin-player/core';

const autoplayManager = new AutoplayManager();
```

#### 方法

##### `canAutoplay(options?: AutoplayOptions): Promise<boolean>`

检查当前浏览器是否支持自动播放。

```typescript
const canAutoplay = await autoplayManager.canAutoplay({
  muted: false,
  withUserGesture: false
});
```

**参数:**
- `options.muted?: boolean` - 是否静音播放
- `options.withUserGesture?: boolean` - 是否需要用户手势

**返回值:** `Promise<boolean>` - 是否支持自动播放

##### `tryAutoplay(element: HTMLVideoElement, options?: AutoplayOptions): Promise<void>`

尝试自动播放视频。

```typescript
try {
  await autoplayManager.tryAutoplay(videoElement, {
    muted: true,
    withUserGesture: false
  });
} catch (error) {
  console.log('自动播放失败');
}
```

**参数:**
- `element: HTMLVideoElement` - 视频元素
- `options.muted?: boolean` - 是否静音播放
- `options.withUserGesture?: boolean` - 是否需要用户手势

**返回值:** `Promise<void>`

**异常:** 当自动播放失败时抛出异常

### FullscreenAdapter

全屏适配器，提供统一的全屏 API。

```typescript
import { FullscreenAdapter } from '@ebin-player/core';

const fullscreenAdapter = new FullscreenAdapter();
```

#### 方法

##### `isSupported(): boolean`

检查当前浏览器是否支持全屏。

```typescript
if (fullscreenAdapter.isSupported()) {
  // 支持全屏
}
```

**返回值:** `boolean` - 是否支持全屏

##### `requestFullscreen(element: HTMLElement): Promise<void>`

请求进入全屏模式。

```typescript
await fullscreenAdapter.requestFullscreen(videoElement);
```

**参数:**
- `element: HTMLElement` - 要全屏的元素

**返回值:** `Promise<void>`

##### `exitFullscreen(): Promise<void>`

退出全屏模式。

```typescript
await fullscreenAdapter.exitFullscreen();
```

**返回值:** `Promise<void>`

##### `isFullscreen(): boolean`

检查当前是否处于全屏状态。

```typescript
const isFullscreen = fullscreenAdapter.isFullscreen();
```

**返回值:** `boolean` - 是否处于全屏状态

#### 事件

##### `change`

全屏状态变化事件。

```typescript
fullscreenAdapter.on('change', (isFullscreen: boolean) => {
  console.log('全屏状态:', isFullscreen);
});
```

### PictureInPictureAdapter

画中画适配器，提供统一的画中画 API。

```typescript
import { PictureInPictureAdapter } from '@ebin-player/core';

const pipAdapter = new PictureInPictureAdapter();
```

#### 方法

##### `isSupported(): boolean`

检查当前浏览器是否支持画中画。

```typescript
if (pipAdapter.isSupported()) {
  // 支持画中画
}
```

**返回值:** `boolean` - 是否支持画中画

##### `requestPictureInPicture(element: HTMLVideoElement): Promise<PictureInPictureWindow>`

请求进入画中画模式。

```typescript
const pipWindow = await pipAdapter.requestPictureInPicture(videoElement);
```

**参数:**
- `element: HTMLVideoElement` - 视频元素

**返回值:** `Promise<PictureInPictureWindow>` - 画中画窗口对象

##### `exitPictureInPicture(): Promise<void>`

退出画中画模式。

```typescript
await pipAdapter.exitPictureInPicture();
```

**返回值:** `Promise<void>`

##### `isPictureInPicture(): boolean`

检查当前是否处于画中画状态。

```typescript
const isPiP = pipAdapter.isPictureInPicture();
```

**返回值:** `boolean` - 是否处于画中画状态

#### 事件

##### `change`

画中画状态变化事件。

```typescript
pipAdapter.on('change', (isPiP: boolean) => {
  console.log('画中画状态:', isPiP);
});
```

### SubtitleRenderer

字幕渲染器，提供自定义字幕渲染功能。

```typescript
import { SubtitleRenderer } from '@ebin-player/core';

const subtitleRenderer = new SubtitleRenderer(containerElement);
```

#### 方法

##### `render(cues: SubtitleCue[], currentTime: number): void`

渲染字幕。

```typescript
const cues = [
  { startTime: 0, endTime: 3, text: 'Hello World' },
  { startTime: 3, endTime: 6, text: 'Ebin Player Subtitle' }
];

subtitleRenderer.render(cues, currentTime);
```

**参数:**
- `cues: SubtitleCue[]` - 字幕片段数组
- `currentTime: number` - 当前播放时间

##### `setStyle(style: SubtitleStyle): void`

设置字幕样式。

```typescript
subtitleRenderer.setStyle({
  fontSize: '18px',
  color: '#ffffff',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  padding: '8px 12px',
  borderRadius: '4px'
});
```

**参数:**
- `style: SubtitleStyle` - 字幕样式配置

##### `clear(): void`

清除所有字幕。

```typescript
subtitleRenderer.clear();
```

##### `destroy(): void`

销毁字幕渲染器。

```typescript
subtitleRenderer.destroy();
```

### Capabilities

浏览器能力检测工具。

```typescript
import { detectCapabilities } from '@ebin-player/core';

const capabilities = await detectCapabilities();
```

#### 返回值

```typescript
interface MediaCapabilitiesResult {
  autoplay: boolean;           // 自动播放支持
  fullscreen: boolean;         // 全屏支持
  pictureInPicture: boolean;   // 画中画支持
  webCodecs: boolean;          // WebCodecs API 支持
  mediaSession: boolean;       // Media Session API 支持
  touch: boolean;              // 触摸支持
  webGL: boolean;              // WebGL 支持
  webAudio: boolean;           // Web Audio API 支持
  intersectionObserver: boolean; // Intersection Observer 支持
  resizeObserver: boolean;     // Resize Observer 支持
}
```

## 类型定义

### AutoplayOptions

```typescript
interface AutoplayOptions {
  muted?: boolean;           // 是否静音播放
  withUserGesture?: boolean; // 是否需要用户手势
}
```

### SubtitleCue

```typescript
interface SubtitleCue {
  startTime: number;  // 开始时间（秒）
  endTime: number;    // 结束时间（秒）
  text: string;       // 字幕文本
  id?: string;        // 可选的唯一标识
}
```

### SubtitleStyle

```typescript
interface SubtitleStyle {
  fontSize?: string;        // 字体大小
  color?: string;          // 文字颜色
  backgroundColor?: string; // 背景颜色
  padding?: string;        // 内边距
  borderRadius?: string;   // 圆角
  fontFamily?: string;     // 字体族
  fontWeight?: string;     // 字体粗细
  textAlign?: string;      // 文字对齐
  lineHeight?: string;     // 行高
  maxWidth?: string;       // 最大宽度
  position?: 'top' | 'bottom' | 'center'; // 位置
}
```

## 使用示例

### 完整的兼容性处理

```typescript
import { 
  AutoplayManager, 
  FullscreenAdapter, 
  PictureInPictureAdapter, 
  SubtitleRenderer,
  detectCapabilities 
} from '@ebin-player/core';

async function setupPlayer() {
  // 检测浏览器能力
  const capabilities = await detectCapabilities();
  
  // 初始化适配器
  const autoplayManager = new AutoplayManager();
  const fullscreenAdapter = new FullscreenAdapter();
  const pipAdapter = new PictureInPictureAdapter();
  const subtitleRenderer = new SubtitleRenderer(container);
  
  // 处理自动播放
  if (capabilities.autoplay) {
    try {
      await autoplayManager.tryAutoplay(videoElement, { muted: true });
    } catch (error) {
      console.log('自动播放失败，需要用户交互');
    }
  }
  
  // 处理全屏
  if (capabilities.fullscreen) {
    fullscreenAdapter.on('change', (isFullscreen) => {
      console.log('全屏状态变化:', isFullscreen);
    });
  }
  
  // 处理画中画
  if (capabilities.pictureInPicture) {
    pipAdapter.on('change', (isPiP) => {
      console.log('画中画状态变化:', isPiP);
    });
  }
  
  // 处理字幕
  const cues = parseVTT(vttContent);
  videoElement.addEventListener('timeupdate', () => {
    subtitleRenderer.render(cues, videoElement.currentTime);
  });
}
```

### 移动端优化

```typescript
// 移动端专用配置
const player = new EbinPlayer(container, {
  src: 'video.mp4',
  uiMode: 'mobile',
  touchGestures: true,
  doubleTapToSeek: true,
  pinchToZoom: false,
  playsInline: true,
  preload: 'metadata'
});
```

---

通过使用这些兼容性适配 API，您可以确保视频播放器在所有浏览器和平台上都能正常工作。
