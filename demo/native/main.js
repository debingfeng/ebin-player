/**
 * 原生HTML Demo
 * 演示播放器的基本功能和插件系统
 */

// 全局变量
let player = null;
let playbackRatePlugin = null;

// 动态加载脚本的辅助函数
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => {
      console.log('脚本加载成功:', src);
      resolve();
    };
    script.onerror = (error) => {
      console.error('脚本加载失败:', src, error);
      reject(error);
    };
    document.head.appendChild(script);
  });
}

// DOM元素
const playerContainer = document.getElementById('player-container');
const playBtn = document.getElementById('play-btn');
const pauseBtn = document.getElementById('pause-btn');
const muteBtn = document.getElementById('mute-btn');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const pipBtn = document.getElementById('pip-btn');
const playerInfo = document.getElementById('player-info');
const videoList = document.getElementById('video-list');
const playbackRateSelect = document.getElementById('playback-rate');

// 初始化播放器
async function initPlayer() {
  try {
    // 使用 UMD 版本，通过全局变量访问
    await loadScript('../../dist/ebin-player.umd.js');
    
    // 从全局变量中获取播放器类
    const { PlayerInstance, PlaybackRatePlugin, DefaultUI } = window.EbinPlayer;

    // 从URL参数获取UI模式设置
    const urlParams = new URLSearchParams(window.location.search);
    const uiParam = urlParams.get('ui');
    let uiMode = 'custom';
    
    if (uiParam === 'custom') {
      uiMode = 'custom';
    } else if (uiParam === 'advanced') {
      uiMode = 'advanced';
    }
    
    console.log('UI模式:', uiMode === 'custom' ? '基础自定义UI' : uiMode === 'advanced' ? '高级UI' : '原生控制条');
    
    // 创建播放器实例，使用新的UI配置方式
    const playerOptions = {
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      autoplay: false,
      muted: false,
      volume: 1,
      width: '100%',
      height: 'auto',
      uiMode: uiMode, // 使用新的uiMode配置
      theme: {
        primaryColor: '#3b82f6',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        textColor: '#ffffff',
        controlBarHeight: 50,
        borderRadius: 4,
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }
    };

    // 根据UI模式添加不同的配置
    if (uiMode === 'custom' || uiMode === 'advanced') {
      playerOptions.uiConfig = {
        playButton: true,
        progressBar: true,
        timeDisplay: true,
        volumeControl: true,
        fullscreenButton: true,
        playbackRateControl: uiMode === 'advanced',
        qualitySelector: uiMode === 'advanced',
        subtitleToggle: uiMode === 'advanced',
        aspectRatio: uiMode === 'advanced',
        pictureInPicture: uiMode === 'advanced',
        screenshot: uiMode === 'advanced',
        skipButtons: uiMode === 'advanced'
      };
    }

    player = new PlayerInstance(playerContainer, playerOptions);

    console.log('播放器初始化完成，UI模式:', player.getUIMode());

    // 注册播放速度插件
    playbackRatePlugin = new PlaybackRatePlugin();
    player.use(playbackRatePlugin);

    // 设置事件监听器
    setupEventListeners();
    
    // 更新UI状态
    updatePlayerInfo();
    
    // 确保在元数据加载后也更新一次
    player.on('loadedmetadata', () => {
      console.log('loadedmetadata event fired');
      updatePlayerInfo();
    });
    
    player.on('durationchange', () => {
      console.log('durationchange event fired');
      updatePlayerInfo();
    });
    
    console.log('播放器初始化成功');
  } catch (error) {
    console.error('播放器初始化失败:', error);
    console.error('错误详情:', error.message);
    console.error('错误堆栈:', error.stack);
  }
}

// 设置事件监听器
function setupEventListeners() {
  if (!player) return;

  // 播放器状态变化
  player.subscribe((state) => {
    updatePlayerInfo();
    updateControlButtons(state);
  });

  // 控制按钮事件
  playBtn.addEventListener('click', () => {
    if (player) {
      player.play();
    }
  });

  pauseBtn.addEventListener('click', () => {
    if (player) {
      player.pause();
    }
  });

  muteBtn.addEventListener('click', () => {
    if (player) {
      player.setMuted(!player.getMuted());
    }
  });

  fullscreenBtn.addEventListener('click', async () => {
    if (player) {
      try {
        if (player.isFullscreen()) {
          await player.exitFullscreen();
        } else {
          await player.requestFullscreen();
        }
      } catch (error) {
        console.error('全屏操作失败:', error);
      }
    }
  });

  pipBtn.addEventListener('click', async () => {
    if (player) {
      try {
        if (player.isPictureInPicture()) {
          await player.exitPictureInPicture();
        } else {
          await player.requestPictureInPicture();
        }
      } catch (error) {
        console.error('画中画操作失败:', error);
        alert('您的浏览器不支持画中画功能');
      }
    }
  });

  // 视频源选择
  videoList.addEventListener('click', (e) => {
    const target = e.target;
    const videoItem = target.closest('.video-item');
    
    if (videoItem && player) {
      const src = videoItem.dataset.src;
      if (src) {
        // 更新选中状态
        document.querySelectorAll('.video-item').forEach(item => {
          item.classList.remove('active');
        });
        videoItem.classList.add('active');
        
        // 切换视频源
        player.setState({ src });
        player.load();
      }
    }
  });

  // 播放速度控制
  playbackRateSelect.addEventListener('change', (e) => {
    const target = e.target;
    const rate = parseFloat(target.value);
    
    if (player) {
      player.setPlaybackRate(rate);
    }
  });

  // 截图按钮
  const screenshotBtn = document.getElementById('screenshot-btn');
  if (screenshotBtn) {
    screenshotBtn.addEventListener('click', () => {
      if (player) {
        // 这里可以实现截图功能
        console.log('截图功能');
        alert('截图功能已触发（实际实现需要Canvas支持）');
      }
    });
  }

  // UI配置功能
  setupUIConfig();

  // 播放器事件监听
  player.on('play', () => {
    console.log('播放开始');
  });

  player.on('pause', () => {
    console.log('播放暂停');
  });

  player.on('ended', () => {
    console.log('播放结束');
  });

  player.on('error', (event) => {
    console.error('播放错误:', event.data);
  });

  player.on('timeupdate', () => {
    updatePlayerInfo();
  });

  player.on('volumechange', () => {
    updatePlayerInfo();
  });

  player.on('ratechange', () => {
    updatePlayerInfo();
  });

  player.on('fullscreenchange', (event) => {
    console.log('全屏状态变化:', event.data?.isFullscreen);
    updatePlayerInfo();
  });
}

// 设置UI配置功能
function setupUIConfig() {
  const applyBtn = document.getElementById('apply-config');
  const resetBtn = document.getElementById('reset-config');
  const heightSlider = document.getElementById('controlBarHeight');
  const heightValue = document.getElementById('heightValue');

  // 控制栏高度滑块
  if (heightSlider && heightValue) {
    heightSlider.addEventListener('input', (e) => {
      heightValue.textContent = e.target.value + 'px';
    });
  }

  // 应用配置
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      if (!player) return;

      const uiConfig = {
        playButton: document.getElementById('playButton').checked,
        progressBar: document.getElementById('progressBar').checked,
        timeDisplay: document.getElementById('timeDisplay').checked,
        volumeControl: document.getElementById('volumeControl').checked,
        fullscreenButton: document.getElementById('fullscreenButton').checked,
        playbackRateControl: document.getElementById('playbackRateControl').checked,
        qualitySelector: document.getElementById('qualitySelector').checked,
        subtitleToggle: document.getElementById('subtitleToggle').checked,
        aspectRatio: document.getElementById('aspectRatio').checked,
        pictureInPicture: document.getElementById('pictureInPicture').checked,
        screenshot: document.getElementById('screenshot').checked,
        skipButtons: document.getElementById('skipButtons').checked
      };

      const theme = {
        primaryColor: document.getElementById('primaryColor').value,
        backgroundColor: document.getElementById('backgroundColor').value + '80', // 添加透明度
        textColor: document.getElementById('textColor').value,
        controlBarHeight: parseInt(document.getElementById('controlBarHeight').value),
        borderRadius: 4,
        fontFamily: 'system-ui, -apple-system, sans-serif'
      };

      // 重新创建播放器
      const currentSrc = player.getState().src;
      player.destroy();
      
      player = new PlayerInstance(playerContainer, {
        src: currentSrc,
        autoplay: false,
        muted: false,
        volume: 1,
        width: '100%',
        height: 'auto',
        uiMode: 'custom',
        uiConfig: uiConfig,
        theme: theme
      });

      // 重新设置事件监听器
      setupEventListeners();
      updatePlayerInfo();
      
      console.log('配置已应用:', { uiConfig, theme });
    });
  }

  // 重置配置
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      // 重置所有复选框
      document.getElementById('playButton').checked = true;
      document.getElementById('progressBar').checked = true;
      document.getElementById('timeDisplay').checked = true;
      document.getElementById('volumeControl').checked = true;
      document.getElementById('fullscreenButton').checked = true;
      document.getElementById('playbackRateControl').checked = false;
      document.getElementById('qualitySelector').checked = false;
      document.getElementById('subtitleToggle').checked = false;
      document.getElementById('aspectRatio').checked = false;
      document.getElementById('pictureInPicture').checked = false;
      document.getElementById('screenshot').checked = false;
      document.getElementById('skipButtons').checked = false;

      // 重置主题
      document.getElementById('primaryColor').value = '#3b82f6';
      document.getElementById('backgroundColor').value = '#000000';
      document.getElementById('textColor').value = '#ffffff';
      document.getElementById('controlBarHeight').value = '50';
      document.getElementById('heightValue').textContent = '50px';
    });
  }
}

// 更新播放器信息显示
function updatePlayerInfo() {
  if (!player) {
    console.log('updatePlayerInfo: player is null');
    return;
  }

  const state = player.getState();
  const info = playerInfo;
  
  console.log('updatePlayerInfo: state =', state);
  
  info.innerHTML = `
    <div class="info-item">状态: ${state.paused ? '暂停' : '播放中'}</div>
    <div class="info-item">当前时间: ${formatTime(state.currentTime)}</div>
    <div class="info-item">总时长: ${formatTime(state.duration)}</div>
    <div class="info-item">音量: ${Math.round(state.volume * 100)}%</div>
    <div class="info-item">播放速度: ${state.playbackRate}x</div>
    <div class="info-item">UI模式: ${player.getUIMode()}</div>
    <div class="info-item">就绪状态: ${getReadyStateText(state.readyState)}</div>
    <div class="info-item">网络状态: ${getNetworkStateText(state.networkState)}</div>
    <div class="info-item">全屏: ${player.isFullscreen() ? '是' : '否'}</div>
    <div class="info-item">画中画: ${player.isPictureInPicture() ? '是' : '否'}</div>
  `;
}

// 更新控制按钮状态
function updateControlButtons(state) {
  playBtn.disabled = !state.paused;
  pauseBtn.disabled = state.paused;
  muteBtn.textContent = state.muted ? '取消静音' : '静音';
  fullscreenBtn.textContent = player?.isFullscreen() ? '退出全屏' : '全屏';
  pipBtn.textContent = player?.isPictureInPicture() ? '退出画中画' : '画中画';
  
  // 更新播放速度选择器
  if (playbackRateSelect) {
    playbackRateSelect.value = state.playbackRate.toString();
  }
}

// 格式化时间
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// 获取就绪状态文本
function getReadyStateText(readyState) {
  const states = ['无数据', '元数据', '当前帧', '未来数据', '足够数据'];
  return states[readyState] || '未知';
}

// 获取网络状态文本
function getNetworkStateText(networkState) {
  const states = ['空闲', '加载中', '无数据', '无源'];
  return states[networkState] || '未知';
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async () => {
  console.log('页面加载完成，开始初始化播放器...');
  await initPlayer();
});

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
  if (player) {
    player.destroy();
  }
});

// 导出到全局作用域供调试使用
window.player = player;
window.playbackRatePlugin = playbackRatePlugin;
