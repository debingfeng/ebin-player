document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('player-container');
  const { PlayerInstance } = window.EbinPlayer;

  const player = new PlayerInstance(container, {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    uiMode: 'native',
    autoplay: false,
    muted: false,
    volume: 1,
    width: '100%',
    height: 'auto'
  });

  window.player = player;
});

