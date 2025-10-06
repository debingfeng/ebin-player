document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('player-container');
  const { PlayerInstance, PlaybackRatePlugin } = window.EbinPlayer;

  const player = new PlayerInstance(container, {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    uiMode: 'advanced',
    uiConfig: {
      playButton: true,
      progressBar: true,
      timeDisplay: true,
      volumeControl: true,
      fullscreenButton: true,
      playbackRateControl: true,
      qualitySelector: true,
      subtitleToggle: true,
      aspectRatio: true,
      pictureInPicture: true,
      screenshot: true,
      skipButtons: true
    },
    theme: {
      primaryColor: '#3b82f6',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      textColor: '#ffffff',
      controlBarHeight: 60,
      borderRadius: 8,
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    autoplay: false,
    muted: false,
    volume: 1,
    width: '100%',
    height: 'auto'
  });

  // 注册内置播放速度插件作为示例
  const playbackRatePlugin = new PlaybackRatePlugin();
  player.use(playbackRatePlugin);

  window.player = player;
});

