import React, { useRef, useState } from 'react'
import { EbinPlayer } from '@ebin-player/react'

function App() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const playerRef = useRef<any>(null)

  const handlePlay = () => {
    setIsPlaying(true)
    console.log('开始播放')
  }

  const handlePause = () => {
    setIsPlaying(false)
    console.log('暂停播放')
  }

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time)
  }

  const handleLoadedMetadata = () => {
    const player = playerRef.current?.getInstance()
    if (player) {
      setDuration(player.getDuration())
      console.log('视频已加载，时长:', player.getDuration())
    }
  }

  const handleVolumeChange = (vol: number, isMuted: boolean) => {
    setVolume(vol)
    setMuted(isMuted)
  }

  const handlePlayClick = () => {
    const player = playerRef.current?.getInstance()
    if (player) {
      if (isPlaying) {
        player.pause()
      } else {
        player.play()
      }
    }
  }

  const handleMuteClick = () => {
    const player = playerRef.current?.getInstance()
    if (player) {
      player.setMuted(!muted)
    }
  }

  const handleVolumeChangeClick = (newVolume: number) => {
    const player = playerRef.current?.getInstance()
    if (player) {
      player.setVolume(newVolume)
    }
  }

  const handleFullscreenClick = () => {
    const player = playerRef.current?.getInstance()
    if (player) {
      if (player.isFullscreen()) {
        player.exitFullscreen()
      } else {
        player.requestFullscreen()
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>EbinPlayer React 测试应用</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <EbinPlayer
          ref={playerRef}
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4"
          uiMode="advanced"
          onPlay={handlePlay}
          onPause={handlePause}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onVolumeChange={handleVolumeChange}
          onReady={() => console.log('播放器准备就绪')}
          style={{ width: '100%', height: '400px', marginBottom: '20px' }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>控制面板</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <button onClick={handlePlayClick}>
            {isPlaying ? '暂停' : '播放'}
          </button>
          <button onClick={handleMuteClick}>
            {muted ? '取消静音' : '静音'}
          </button>
          <button onClick={handleFullscreenClick}>
            全屏
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => handleVolumeChangeClick(0.5)}>音量 50%</button>
          <button onClick={() => handleVolumeChangeClick(0.8)}>音量 80%</button>
          <button onClick={() => handleVolumeChangeClick(1)}>音量 100%</button>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>状态信息</h3>
        <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
          <p><strong>播放状态:</strong> {isPlaying ? '播放中' : '暂停'}</p>
          <p><strong>当前时间:</strong> {formatTime(currentTime)} / {formatTime(duration)}</p>
          <p><strong>音量:</strong> {Math.round(volume * 100)}% {muted ? '(静音)' : ''}</p>
        </div>
      </div>

      <div>
        <h3>功能测试</h3>
        <ul>
          <li>✅ 基础播放/暂停</li>
          <li>✅ 时间显示</li>
          <li>✅ 音量控制</li>
          <li>✅ 全屏切换</li>
          <li>✅ 事件监听</li>
          <li>✅ Ref 命令式控制</li>
          <li>✅ 样式注入</li>
        </ul>
      </div>
    </div>
  )
}

export default App
