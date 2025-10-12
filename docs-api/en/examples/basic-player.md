# Basic Player Example

This example demonstrates how to create a basic video player with EbinPlayer.

## HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EbinPlayer - Basic Example</title>
    <link rel="stylesheet" href="../../dist/styles.css">
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .player-container {
            margin: 20px 0;
            border: 2px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
        }
        .controls {
            display: flex;
            gap: 10px;
            margin: 20px 0;
            flex-wrap: wrap;
        }
        .controls button {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            background: #007bff;
            color: white;
            cursor: pointer;
            transition: background 0.3s;
        }
        .controls button:hover {
            background: #0056b3;
        }
        .info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .volume-control {
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 20px 0;
        }
        .volume-slider {
            flex: 1;
            max-width: 200px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>EbinPlayer Basic Example</h1>
        
        <div class="player-container" id="player"></div>
        
        <div class="controls">
            <button id="play-btn">Play</button>
            <button id="pause-btn">Pause</button>
            <button id="mute-btn">Mute</button>
            <button id="fullscreen-btn">Fullscreen</button>
            <button id="speed-btn">1x</button>
        </div>
        
        <div class="volume-control">
            <label for="volume-slider">Volume:</label>
            <input type="range" id="volume-slider" min="0" max="1" step="0.1" value="1" class="volume-slider">
            <span id="volume-text">100%</span>
        </div>
        
        <div class="info">
            <h3>Player Information</h3>
            <p>Status: <span id="status">Not initialized</span></p>
            <p>Current Time: <span id="current-time">0</span>s</p>
            <p>Duration: <span id="duration">0</span>s</p>
            <p>Volume: <span id="volume">1</span></p>
            <p>Playback Rate: <span id="playback-rate">1</span>x</p>
        </div>
        
        <div class="info">
            <h3>Keyboard Shortcuts</h3>
            <ul>
                <li><kbd>Space</kbd> - Play/Pause</li>
                <li><kbd>←</kbd> - Seek backward 10s</li>
                <li><kbd>→</kbd> - Seek forward 10s</li>
                <li><kbd>↑</kbd> - Increase volume</li>
                <li><kbd>↓</kbd> - Decrease volume</li>
                <li><kbd>M</kbd> - Mute/Unmute</li>
            </ul>
        </div>
    </div>
    
    <script src="../../dist/ebin-player.umd.js"></script>
    <script>
        // Basic player example
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize player
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
    </script>
</body>
</html>
```

## Key Features Demonstrated

1. **Basic Player Initialization**: Shows how to create a player with essential options
2. **Custom Controls**: External control buttons for play, pause, mute, etc.
3. **Volume Control**: Slider for volume adjustment with real-time feedback
4. **Playback Rate Control**: Cycle through different playback speeds
5. **Fullscreen Support**: Toggle fullscreen mode
6. **Event Handling**: Listen to player events and update UI accordingly
7. **Keyboard Shortcuts**: Standard media player keyboard controls
8. **State Display**: Real-time display of player state information

## Usage

1. Open the HTML file in a web browser
2. The player will load with a sample video
3. Use the control buttons or keyboard shortcuts to interact with the player
4. Observe the real-time status updates in the information panel

## Customization

You can customize this example by:

- Changing the video source URL
- Modifying the player dimensions
- Adjusting the theme colors
- Adding more control buttons
- Implementing additional keyboard shortcuts
- Adding more event listeners for enhanced functionality
