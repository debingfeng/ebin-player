# 本地测试指南

本指南介绍如何在其他项目中本地引用和测试 `@ebin-player/react` 包。

## 方法一：使用 pnpm link（推荐）

### 1. 链接包到全局

```bash
# 在 ebin-player/packages/react 目录下
cd /path/to/ebin-player/packages/react
pnpm link --global
```

### 2. 在测试项目中链接

```bash
# 在你的测试项目中
cd /path/to/your-test-project
pnpm link @ebin-player/react
```

### 3. 使用包

```tsx
import { EbinPlayer } from '@ebin-player/react';
import '@ebin-player/core/styles'; // 需要手动引入样式

function App() {
  return (
    <EbinPlayer
      src="https://example.com/video.mp4"
      uiMode="advanced"
      onPlay={() => console.log('播放')}
    />
  );
}
```

## 方法二：使用 file: 协议

### 1. 在测试项目的 package.json 中添加

```json
{
  "dependencies": {
    "@ebin-player/react": "file:../path/to/ebin-player/packages/react",
    "ebin-player": "file:../path/to/ebin-player"
  }
}
```

### 2. 安装依赖

```bash
pnpm install
```

## 方法三：使用 npm pack

### 1. 打包 React 包

```bash
cd /path/to/ebin-player/packages/react
pnpm run build
npm pack
# 这会生成 @ebin-player/react-0.0.1.tgz
```

### 2. 在测试项目中安装

```bash
cd /path/to/your-test-project
pnpm add /path/to/ebin-player/packages/react/@ebin-player/react-0.0.1.tgz
```

## 方法四：使用 pnpm workspace（推荐用于 monorepo）

### 1. 在根目录的 pnpm-workspace.yaml 中配置

```yaml
packages:
  - 'packages/*'
  - 'your-test-project'
```

### 2. 在测试项目中引用

```json
{
  "dependencies": {
    "@ebin-player/react": "workspace:*",
    "ebin-player": "workspace:*"
  }
}
```

## 测试项目示例

### React 项目示例

```tsx
// App.tsx
import React, { useRef, useState } from 'react';
import { EbinPlayer } from '@ebin-player/react';
import '@ebin-player/core/styles';

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef(null);

  const handlePlay = () => {
    setIsPlaying(true);
    console.log('开始播放');
  };

  const handlePause = () => {
    setIsPlaying(false);
    console.log('暂停播放');
  };

  const handlePlayClick = () => {
    const player = playerRef.current?.getInstance();
    if (player) player.play();
  };

  return (
    <div>
      <h1>EbinPlayer React 测试</h1>
      <EbinPlayer
        ref={playerRef}
        src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4"
        uiMode="advanced"
        onPlay={handlePlay}
        onPause={handlePause}
        style={{ width: '100%', height: '400px' }}
      />
      <div>
        <button onClick={handlePlayClick}>播放</button>
        <p>状态: {isPlaying ? '播放中' : '暂停'}</p>
      </div>
    </div>
  );
}

export default App;
```

### Next.js 项目示例

```tsx
// pages/index.tsx
import dynamic from 'next/dynamic';
import { EbinPlayer } from '@ebin-player/react';

// 动态导入，禁用 SSR
const DynamicEbinPlayer = dynamic(
  () => import('@ebin-player/react').then(mod => ({ default: mod.EbinPlayer })),
  { ssr: false }
);

export default function Home() {
  return (
    <div>
      <h1>Next.js 测试</h1>
      <DynamicEbinPlayer
        src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4"
        uiMode="advanced"
        styleInjection="manual"
        style={{ width: '100%', height: '400px' }}
      />
    </div>
  );
}
```

```tsx
// pages/_app.tsx
import '@ebin-player/core/styles';

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
```

## 调试技巧

### 1. 启用调试模式

```tsx
<EbinPlayer
  src="video.mp4"
  debug={true}
  onReady={() => console.log('播放器准备就绪')}
/>
```

### 2. 监听所有事件

```tsx
<EbinPlayer
  src="video.mp4"
  onPlay={() => console.log('play')}
  onPause={() => console.log('pause')}
  onTimeUpdate={(time) => console.log('time:', time)}
  onVolumeChange={(volume, muted) => console.log('volume:', volume, 'muted:', muted)}
  onFullscreenChange={(isFullscreen) => console.log('fullscreen:', isFullscreen)}
/>
```

### 3. 使用 ref 进行命令式控制

```tsx
const playerRef = useRef();

// 播放控制
playerRef.current?.getInstance()?.play();
playerRef.current?.getInstance()?.pause();

// 音量控制
playerRef.current?.getInstance()?.setVolume(0.5);
playerRef.current?.getInstance()?.setMuted(true);

// 全屏控制
playerRef.current?.getInstance()?.requestFullscreen();
```

## 常见问题

### Q: 样式没有生效？
A: 确保引入了样式文件：`import '@ebin-player/core/styles'`

### Q: Next.js 中播放器不显示？
A: 使用动态导入并设置 `ssr: false`

### Q: TypeScript 类型错误？
A: 确保安装了 `@types/react` 和 `@types/react-dom`

### Q: 包链接后找不到模块？
A: 尝试删除 `node_modules` 和 `pnpm-lock.yaml`，然后重新安装

## 开发模式

如果你在开发 `@ebin-player/react` 包，建议使用 `pnpm link` 方法，这样修改源码后会自动反映到测试项目中。

```bash
# 修改源码后重新构建
cd /path/to/ebin-player/packages/react
pnpm run build

# 测试项目会自动使用新构建的版本
```
