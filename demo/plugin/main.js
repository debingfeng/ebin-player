document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('player-container');
  const logEl = document.getElementById('log');
  const btnBump = document.getElementById('btn-bump');
  const btn2x = document.getElementById('btn-set-2x');
  const rateText = document.getElementById('rate-text');

  const { PlayerInstance } = window.EbinPlayer || {};

  function log(...args) {
    const line = `[${new Date().toLocaleTimeString()}] ` + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
    logEl.textContent += line + '\n';
    logEl.scrollTop = logEl.scrollHeight;
  }

  // 创建播放器
  const player = new PlayerInstance(container, {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    uiMode: 'custom',
    autoplay: true,
    muted: false,
    volume: 1,
    width: '100%',
    height: 'auto',
    builtinPlugins: {
      playbackRate: { defaultRate: 1.25 }
    }
  });

  // 由插件管理器根据 options 自动安装内置插件

  // 订阅播放器事件
  player.on('ratechange', () => {
    const rate = player.getPlaybackRate();
    rateText.textContent = `当前速率: ${rate.toFixed(2)}x`;
    log('ratechange', rate);
  });

  // 交互按钮
  btnBump.addEventListener('click', () => {
    // 调用命令（通过管理器）
    try {
      player.pluginManager?.invokeCommand?.('builtin.playback-rate', 'bump');
    } catch {}
  });

  btn2x.addEventListener('click', () => {
    // 直接通过播放器 API 设置，以简化演示
    try { player.setPlaybackRate(2); } catch {}
  });

  window.player = player;
});


