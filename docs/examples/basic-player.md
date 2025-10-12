# 基础播放器示例

这个示例展示了如何使用 EbinPlayer 创建一个基础的视频播放器。

## HTML 结构

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EbinPlayer - 基础播放器示例</title>
    <link rel="stylesheet" href="../../dist/styles.css">
    <style>
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .player-container {
            background: #000;
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 20px;
        }
        .controls {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }
        .controls button {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            background: #007bff;
            color: white;
            cursor: pointer;
        }
        .controls button:hover {
            background: #0056b3;
        }
        .controls button:disabled {
            background: #6c757d;
            cursor: not-allowed;
        }
        .info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
        }
        .info p {
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>EbinPlayer 基础播放器示例</h1>
        
        <div class="player-container">
            <div id="player"></div>
        </div>
        
        <div class="controls">
            <button id="play-btn">播放</button>
            <button id="pause-btn">暂停</button>
            <button id="mute-btn">静音</button>
            <input type="range" id="volume-slider" min="0" max="1" step="0.1" value="1">
            <span id="volume-text">100%</span>
        </div>
        
        <div class="info">
            <h3>播放器信息</h3>
            <p>状态: <span id="status">未初始化</span></p>
            <p>当前时间: <span id="current-time">0</span>s</p>
            <p>总时长: <span id="duration">0</span>s</p>
            <p>音量: <span id="volume">1</span></p>
            <p>播放速度: <span id="playback-rate">1</span>x</p>
        </div>
    </div>
    
    <script src="../../dist/ebin-player.umd.js"></script>
    <script>
        // JavaScript 代码将在下面展示
    </script>
</body>
</html>
```

## JavaScript 代码

```javascript
// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 初始化播放器
    const player = new EbinPlayer(document.getElementById('player'), {
        src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        width: 800,
        height: 450,
        autoplay: false,
        controls: true,
        preload: 'metadata',
        theme: {
            primaryColor: '#007bff',
            controlBarHeight: 50
        }
    });
    
    // 获取DOM元素
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const muteBtn = document.getElementById('mute-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeText = document.getElementById('volume-text');
    const statusEl = document.getElementById('status');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');
    const volumeEl = document.getElementById('volume');
    const playbackRateEl = document.getElementById('playback-rate');
    
    // 播放控制
    playBtn.addEventListener('click', () => {
        player.play();
    });
    
    pauseBtn.addEventListener('click', () => {
        player.pause();
    });
    
    // 静音控制
    muteBtn.addEventListener('click', () => {
        const muted = player.getMuted();
        player.setMuted(!muted);
        muteBtn.textContent = muted ? '静音' : '取消静音';
    });
    
    // 音量控制
    volumeSlider.addEventListener('input', (e) => {
        const volume = parseFloat(e.target.value);
        player.setVolume(volume);
        volumeText.textContent = Math.round(volume * 100) + '%';
    });
    
    // 播放速度控制
    const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];
    let currentSpeedIndex = 2; // 默认1x速度
    
    // 添加播放速度控制按钮
    const speedBtn = document.createElement('button');
    speedBtn.textContent = '1x';
    speedBtn.addEventListener('click', () => {
        currentSpeedIndex = (currentSpeedIndex + 1) % speedOptions.length;
        const speed = speedOptions[currentSpeedIndex];
        player.setPlaybackRate(speed);
        speedBtn.textContent = speed + 'x';
    });
    document.querySelector('.controls').appendChild(speedBtn);
    
    // 事件监听
    player.on('play', () => {
        statusEl.textContent = '播放中';
        playBtn.disabled = true;
        pauseBtn.disabled = false;
    });
    
    player.on('pause', () => {
        statusEl.textContent = '已暂停';
        playBtn.disabled = false;
        pauseBtn.disabled = true;
    });
    
    player.on('ended', () => {
        statusEl.textContent = '播放结束';
        playBtn.disabled = false;
        pauseBtn.disabled = true;
    });
    
    player.on('loadstart', () => {
        statusEl.textContent = '开始加载';
    });
    
    player.on('loadedmetadata', () => {
        statusEl.textContent = '元数据加载完成';
        durationEl.textContent = player.getDuration().toFixed(1);
    });
    
    player.on('canplay', () => {
        statusEl.textContent = '可以播放';
        playBtn.disabled = false;
    });
    
    player.on('timeupdate', () => {
        currentTimeEl.textContent = player.getCurrentTime().toFixed(1);
    });
    
    player.on('volumechange', () => {
        const volume = player.getVolume();
        volumeEl.textContent = volume.toFixed(1);
        volumeSlider.value = volume;
        volumeText.textContent = Math.round(volume * 100) + '%';
    });
    
    player.on('ratechange', () => {
        playbackRateEl.textContent = player.getPlaybackRate();
    });
    
    player.on('error', (event) => {
        statusEl.textContent = '播放错误: ' + (event.error?.message || '未知错误');
        console.error('播放器错误:', event.error);
    });
    
    // 初始化状态
    statusEl.textContent = '已加载';
    playBtn.disabled = false;
    pauseBtn.disabled = true;
    
    // 添加键盘快捷键
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return; // 忽略输入框
        
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                if (player.getPaused()) {
                    player.play();
                } else {
                    player.pause();
                }
                break;
            case 'ArrowLeft':
                e.preventDefault();
                player.setCurrentTime(player.getCurrentTime() - 10);
                break;
            case 'ArrowRight':
                e.preventDefault();
                player.setCurrentTime(player.getCurrentTime() + 10);
                break;
            case 'ArrowUp':
                e.preventDefault();
                const currentVolume = player.getVolume();
                player.setVolume(Math.min(1, currentVolume + 0.1));
                break;
            case 'ArrowDown':
                e.preventDefault();
                const currentVol = player.getVolume();
                player.setVolume(Math.max(0, currentVol - 0.1));
                break;
            case 'KeyM':
                e.preventDefault();
                player.setMuted(!player.getMuted());
                break;
        }
    });
    
    // 添加全屏功能
    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.textContent = '全屏';
    fullscreenBtn.addEventListener('click', async () => {
        try {
            if (player.isFullscreen()) {
                await player.exitFullscreen();
                fullscreenBtn.textContent = '全屏';
            } else {
                await player.requestFullscreen();
                fullscreenBtn.textContent = '退出全屏';
            }
        } catch (error) {
            console.error('全屏操作失败:', error);
        }
    });
    document.querySelector('.controls').appendChild(fullscreenBtn);
    
    // 监听全屏状态变化
    player.on('fullscreenchange', () => {
        fullscreenBtn.textContent = player.isFullscreen() ? '退出全屏' : '全屏';
    });
});
```

## 功能特性

这个基础播放器示例包含了以下功能：

### 播放控制
- 播放/暂停按钮
- 静音控制
- 音量滑块
- 播放速度调节

### 信息显示
- 播放状态
- 当前播放时间
- 视频总时长
- 音量级别
- 播放速度

### 键盘快捷键
- `空格键`: 播放/暂停
- `左箭头`: 快退10秒
- `右箭头`: 快进10秒
- `上箭头`: 增加音量
- `下箭头`: 减少音量
- `M键`: 静音/取消静音

### 全屏支持
- 全屏按钮
- 全屏状态监听
- 自动更新按钮文本

## 在线演示

[查看完整示例](./examples/basic/)

## 相关链接

- [API 文档](../api/)
- [自定义UI示例](./custom-ui.md)
- [插件开发示例](./plugin-development.md)
