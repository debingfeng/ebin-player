// 基础播放器示例
document.addEventListener('DOMContentLoaded', function() {
    // 初始化播放器
    const player = new PlayerInstance(document.getElementById('basic-player'), {
        src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
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
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const speedBtn = document.getElementById('speed-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeText = document.getElementById('volume-text');
    const statusEl = document.getElementById('status');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');
    const volumeEl = document.getElementById('volume');
    const playbackRateEl = document.getElementById('playback-rate');
    
    // 播放速度选项
    const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];
    let currentSpeedIndex = 2; // 默认1x速度
    
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
    
    // 全屏控制
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
            statusEl.textContent = '全屏操作失败: ' + error.message;
        }
    });
    
    // 播放速度控制
    speedBtn.addEventListener('click', () => {
        currentSpeedIndex = (currentSpeedIndex + 1) % speedOptions.length;
        const speed = speedOptions[currentSpeedIndex];
        player.setPlaybackRate(speed);
        speedBtn.textContent = speed + 'x';
    });
    
    // 音量控制
    volumeSlider.addEventListener('input', (e) => {
        const volume = parseFloat(e.target.value);
        player.setVolume(volume);
        volumeText.textContent = Math.round(volume * 100) + '%';
    });
    
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
        document.getElementById('basic-player').classList.add('loading');
    });
    
    player.on('loadedmetadata', () => {
        statusEl.textContent = '元数据加载完成';
        durationEl.textContent = player.getDuration().toFixed(1);
        document.getElementById('basic-player').classList.remove('loading');
    });
    
    player.on('loadeddata', () => {
        statusEl.textContent = '数据加载完成';
        document.getElementById('basic-player').classList.remove('loading');
    });
    
    player.on('canplay', () => {
        statusEl.textContent = '可以播放';
        playBtn.disabled = false;
        document.getElementById('basic-player').classList.remove('loading');
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
    
    player.on('fullscreenchange', () => {
        fullscreenBtn.textContent = player.isFullscreen() ? '退出全屏' : '全屏';
    });
    
    player.on('error', (event) => {
        statusEl.textContent = '播放错误: ' + (event.error?.message || '未知错误');
        console.error('播放器错误:', event.error);
        document.getElementById('basic-player').classList.remove('loading');
        document.getElementById('basic-player').classList.add('error');
    });
    
    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
        // 忽略输入框和文本区域的快捷键
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
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
            case 'KeyF':
                e.preventDefault();
                fullscreenBtn.click();
                break;
        }
    });
    
    // 初始化状态
    statusEl.textContent = '已加载';
    playBtn.disabled = false;
    pauseBtn.disabled = true;
    
    // 添加进度条点击跳转功能
    const progressBar = document.querySelector('.player-container video');
    if (progressBar) {
        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percentage = clickX / rect.width;
            const newTime = percentage * player.getDuration();
            player.setCurrentTime(newTime);
        });
    }
    
    // 添加鼠标悬停显示预览功能
    let hoverTimeout;
    progressBar?.addEventListener('mousemove', (e) => {
        clearTimeout(hoverTimeout);
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        const previewTime = percentage * player.getDuration();
        
        // 这里可以添加预览缩略图显示逻辑
        console.log('预览时间:', previewTime.toFixed(1) + 's');
    });
    
    progressBar?.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimeout);
        // 隐藏预览
    });
    
    // 添加窗口大小变化时的响应式处理
    window.addEventListener('resize', () => {
        // 播放器会自动处理响应式，这里可以添加额外的处理逻辑
        console.log('窗口大小变化，播放器尺寸已自动调整');
    });
    
    // 添加页面可见性变化处理
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // 页面隐藏时暂停播放（可选）
            // player.pause();
        }
    });
    
    // 添加网络状态监听
    window.addEventListener('online', () => {
        console.log('网络已连接');
        statusEl.textContent = '网络已连接';
    });
    
    window.addEventListener('offline', () => {
        console.log('网络已断开');
        statusEl.textContent = '网络已断开';
    });
    
    // 导出播放器实例到全局，方便调试
    window.player = player;
    console.log('播放器已初始化，可通过 window.player 访问');
});
