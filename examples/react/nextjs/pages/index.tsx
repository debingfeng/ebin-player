import { useState, useRef } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';

// 动态导入 EbinPlayer 组件，禁用 SSR
const EbinPlayer = dynamic(() => import('@ebin-player/react').then(mod => ({ default: mod.EbinPlayer })), {
  ssr: false,
  loading: () => <div style={{ width: '100%', height: '400px', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>加载播放器中...</div>
});

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef<any>(null);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleLoadedMetadata = () => {
    const player = playerRef.current?.getInstance();
    if (player) {
      setDuration(player.getDuration());
    }
  };

  const handlePlayClick = () => {
    const player = playerRef.current?.getInstance();
    if (player) player.play();
  };

  const handlePauseClick = () => {
    const player = playerRef.current?.getInstance();
    if (player) player.pause();
  };

  const handleMuteClick = () => {
    const player = playerRef.current?.getInstance();
    if (player) {
      const newMuted = !player.getMuted();
      player.setMuted(newMuted);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <Head>
        <title>EbinPlayer React - Next.js 示例</title>
        <meta name="description" content="EbinPlayer React 组件在 Next.js 中的使用示例" />
      </Head>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <h1>EbinPlayer React - Next.js 示例</h1>
        <p>这个示例展示了如何在 Next.js 中使用 EbinPlayer React 组件。</p>

        <div style={{ margin: '20px 0' }}>
          <EbinPlayer
            ref={playerRef}
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4"
            uiMode="advanced"
            styleInjection="manual" // Next.js 推荐手动引入样式
            onPlay={handlePlay}
            onPause={handlePause}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onReady={() => console.log('播放器已准备就绪')}
            style={{ width: '100%', height: '400px' }}
          />
        </div>

        <div style={{ margin: '20px 0' }}>
          <h3>控制按钮</h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <button onClick={handlePlayClick}>播放</button>
            <button onClick={handlePauseClick}>暂停</button>
            <button onClick={handleMuteClick}>静音切换</button>
          </div>
          
          <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
            <p>状态: {isPlaying ? '播放中' : '暂停'}</p>
            <p>时间: {formatTime(currentTime)} / {formatTime(duration)}</p>
          </div>
        </div>

        <div style={{ margin: '20px 0' }}>
          <h3>特性说明</h3>
          <ul>
            <li>✅ 动态导入，禁用 SSR</li>
            <li>✅ 手动样式注入（推荐用于 Next.js）</li>
            <li>✅ 完整的播放器功能</li>
            <li>✅ 事件监听和状态管理</li>
            <li>✅ 命令式控制 API</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
