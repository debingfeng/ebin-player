document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('player-container');
  const { PlayerInstance } = window.EbinPlayer;

  const player = new PlayerInstance(container, {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    uiMode: 'custom',
    uiConfig: {
      playButton: true,
      progressBar: true,
      timeDisplay: true,
      volumeControl: true,
      fullscreenButton: true
    },
    theme: {
      primaryColor: '#3b82f6',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      textColor: '#ffffff',
      controlBarHeight: 50
    },
    autoplay: false,
    muted: false,
    volume: 1,
    width: '100%',
    height: 'auto'
  });

  window.player = player;
});

