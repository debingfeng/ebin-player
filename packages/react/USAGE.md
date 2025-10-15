# @ebin-player/react 使用指南

## 安装

```bash
pnpm add @ebin-player/react @ebin-player/core
# 或
npm install @ebin-player/react @ebin-player/core
# 或
yarn add @ebin-player/react @ebin-player/core
```

## 基础使用

```tsx
import React from 'react';
import { EbinPlayer } from '@ebin-player/react';

function App() {
  return (
    <EbinPlayer
      src="https://example.com/video.mp4"
      uiMode="advanced"
      onPlay={() => console.log('开始播放')}
      onPause={() => console.log('暂停播放')}
    />
  );
}
```

## 样式注入策略

### 自动注入（默认）
```tsx
<EbinPlayer src="video.mp4" styleInjection="auto" />
```

### 手动注入（推荐用于 Next.js）
```tsx
// 在 _app.tsx 或全局 CSS 中引入
import '@ebin-player/core/styles';

<EbinPlayer src="video.mp4" styleInjection="manual" />
```

### 自定义样式源
```tsx
<EbinPlayer
  src="video.mp4"
  styleInjection="auto"
  stylesheetUrl="https://cdn.example.com/ebin-player.css"
  nonce="your-csp-nonce"
/>
```

## 事件处理

```tsx
<EbinPlayer
  src="video.mp4"
  onReady={() => console.log('播放器准备就绪')}
  onPlay={() => console.log('开始播放')}
  onPause={() => console.log('暂停播放')}
  onTimeUpdate={(time) => console.log('当前时间:', time)}
  onVolumeChange={(volume, muted) => console.log('音量:', volume, '静音:', muted)}
  onFullscreenChange={(isFullscreen) => console.log('全屏状态:', isFullscreen)}
  onPictureInPictureChange={(isPip) => console.log('画中画状态:', isPip)}
/>
```

## 命令式控制

```tsx
import React, { useRef } from 'react';
import { EbinPlayer } from '@ebin-player/react';

function App() {
  const playerRef = useRef(null);

  const handlePlay = () => {
    const player = playerRef.current?.getInstance();
    if (player) {
      player.play();
    }
  };

  const handlePause = () => {
    const player = playerRef.current?.getInstance();
    if (player) {
      player.pause();
    }
  };

  const handleMute = () => {
    const player = playerRef.current?.getInstance();
    if (player) {
      player.setMuted(!player.getMuted());
    }
  };

  return (
    <div>
      <EbinPlayer ref={playerRef} src="video.mp4" />
      <button onClick={handlePlay}>播放</button>
      <button onClick={handlePause}>暂停</button>
      <button onClick={handleMute}>静音</button>
    </div>
  );
}
```

## 插件使用

```tsx
import { EbinPlayer } from '@ebin-player/react';

// 内置插件
<EbinPlayer
  src="video.mp4"
  builtinPlugins={{
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
  }}
/>

// 外部插件
<EbinPlayer
  src="video.mp4"
  plugins={[
    MyCustomPlugin,
    () => new AnotherPlugin({ config: 'value' })
  ]}
/>
```

## Next.js 集成

### pages/_app.tsx
```tsx
import '@ebin-player/core/styles';

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
```

### pages/index.tsx
```tsx
import dynamic from 'next/dynamic';

const EbinPlayer = dynamic(
  () => import('@ebin-player/react').then(mod => ({ default: mod.EbinPlayer })),
  { ssr: false }
);

export default function Home() {
  return (
    <EbinPlayer
      src="video.mp4"
      styleInjection="manual"
      uiMode="advanced"
    />
  );
}
```

## 主题定制

```tsx
<EbinPlayer
  src="video.mp4"
  theme={{
    primaryColor: '#3b82f6',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    textColor: '#ffffff',
    controlBarHeight: 60,
    borderRadius: 8
  }}
/>
```

## 响应式配置

```tsx
<EbinPlayer
  src="video.mp4"
  uiConfig={{
    playButton: true,
    progressBar: true,
    timeDisplay: true,
    volumeControl: true,
    fullscreenButton: true,
    playbackRateControl: true
  }}
/>
```

## 性能优化

1. **避免频繁重建**：只有 `src` 和 `uiMode` 变化时会重建播放器实例
2. **增量更新**：`muted`、`volume`、`playbackRate`、`uiConfig`、`theme` 等属性变化时只更新对应设置
3. **样式注入**：生产环境推荐手动引入样式以获得最佳首屏性能

## 类型支持

```tsx
import type { ReactEbinPlayerProps, ReactEbinPlayerRef } from '@ebin-player/react';

const props: ReactEbinPlayerProps = {
  src: 'video.mp4',
  uiMode: 'advanced',
  onPlay: () => {},
  // ... 其他属性
};

const ref: React.Ref<ReactEbinPlayerRef> = useRef();
```

## 常见问题

### Q: 样式没有生效？
A: 确保引入了样式文件，或设置 `styleInjection="auto"`

### Q: Next.js 中播放器不显示？
A: 使用 `dynamic` 导入并设置 `ssr: false`

### Q: 如何自定义播放器外观？
A: 通过 `theme` 属性或 CSS 变量覆盖样式

### Q: 如何添加自定义控制按钮？
A: 使用 `uiConfig.customButtons` 或通过 ref 获取实例进行自定义操作
