// Basic player example
document.addEventListener('DOMContentLoaded', function() {
    // Initialize player
    const player = new EbinPlayer(document.getElementById('basic-player'), {
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
    
    // Get DOM elements
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const muteBtn = document.getElementById('mute-btn');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const speedBtn = document.getElementById('speed-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeText = document.getElementById('volume-text');
    
    // Status display elements
    const statusEl = document.getElementById('status');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');
    const volumeEl = document.getElementById('volume');
    const playbackRateEl = document.getElementById('playback-rate');
    
    // Playback rates
    const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    let currentRateIndex = 2; // Start with 1x
    
    // Event listeners
    playBtn.addEventListener('click', () => {
        player.play();
    });
    
    pauseBtn.addEventListener('click', () => {
        player.pause();
    });
    
    muteBtn.addEventListener('click', () => {
        if (player.isMuted()) {
            player.unmute();
            muteBtn.textContent = 'Mute';
        } else {
            player.mute();
            muteBtn.textContent = 'Unmute';
        }
    });
    
    fullscreenBtn.addEventListener('click', () => {
        if (player.isFullscreen()) {
            player.exitFullscreen();
            fullscreenBtn.textContent = 'Fullscreen';
        } else {
            player.enterFullscreen();
            fullscreenBtn.textContent = 'Exit Fullscreen';
        }
    });
    
    speedBtn.addEventListener('click', () => {
        currentRateIndex = (currentRateIndex + 1) % playbackRates.length;
        const rate = playbackRates[currentRateIndex];
        player.setPlaybackRate(rate);
        speedBtn.textContent = rate + 'x';
    });
    
    volumeSlider.addEventListener('input', (e) => {
        const volume = parseFloat(e.target.value);
        player.setVolume(volume);
        volumeText.textContent = Math.round(volume * 100) + '%';
    });
    
    // Player event listeners
    player.on('ready', () => {
        statusEl.textContent = 'Ready';
        durationEl.textContent = Math.round(player.getDuration());
    });
    
    player.on('play', () => {
        statusEl.textContent = 'Playing';
        playBtn.textContent = 'Playing...';
        pauseBtn.textContent = 'Pause';
    });
    
    player.on('pause', () => {
        statusEl.textContent = 'Paused';
        playBtn.textContent = 'Play';
        pauseBtn.textContent = 'Paused';
    });
    
    player.on('timeupdate', () => {
        const state = player.getState();
        currentTimeEl.textContent = Math.round(state.currentTime);
        volumeEl.textContent = state.volume.toFixed(1);
        playbackRateEl.textContent = state.playbackRate + 'x';
    });
    
    player.on('volumechange', (volume) => {
        volumeSlider.value = volume;
        volumeText.textContent = Math.round(volume * 100) + '%';
    });
    
    player.on('error', (error) => {
        statusEl.textContent = 'Error: ' + error.message;
        console.error('Player error:', error);
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;
        
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                player.toggle();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                player.seek(player.getCurrentTime() - 10);
                break;
            case 'ArrowRight':
                e.preventDefault();
                player.seek(player.getCurrentTime() + 10);
                break;
            case 'ArrowUp':
                e.preventDefault();
                const currentVol = player.getVolume();
                player.setVolume(Math.min(1, currentVol + 0.1));
                break;
            case 'ArrowDown':
                e.preventDefault();
                const currentVolume = player.getVolume();
                player.setVolume(Math.max(0, currentVolume - 0.1));
                break;
            case 'KeyM':
                e.preventDefault();
                player.toggleMute();
                break;
        }
    });
});
