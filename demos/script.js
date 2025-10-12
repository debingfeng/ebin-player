// 在线演示脚本
document.addEventListener('DOMContentLoaded', function() {
    // 播放器实例
    let players = {};
    
    // 当前主题配置
    let currentTheme = {
        primaryColor: '#007bff',
        controlBarHeight: 50,
        borderRadius: 4,
        fontSize: 14
    };
    
    // 预定义主题
    const themes = {
        default: {
            primaryColor: '#007bff',
            controlBarHeight: 50,
            borderRadius: 4,
            fontSize: 14
        },
        dark: {
            primaryColor: '#ff6b6b',
            controlBarHeight: 60,
            borderRadius: 8,
            fontSize: 16
        },
        blue: {
            primaryColor: '#17a2b8',
            controlBarHeight: 45,
            borderRadius: 6,
            fontSize: 14
        },
        green: {
            primaryColor: '#28a745',
            controlBarHeight: 55,
            borderRadius: 10,
            fontSize: 15
        }
    };
    
    // 初始化所有播放器
    function initPlayers() {
        // 基础播放器
        players.basic = new EbinPlayer(document.getElementById('basic-demo-player'), {
            src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            width: '100%',
            height: 400,
            autoplay: false,
            controls: true,
            preload: 'metadata'
        });
        
        // 自定义UI播放器
        players.customUI = new EbinPlayer(document.getElementById('custom-ui-demo-player'), {
            src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            width: '100%',
            height: 400,
            autoplay: false,
            controls: true,
            preload: 'metadata',
            theme: currentTheme
        });
        
        // 插件播放器
        players.plugins = new EbinPlayer(document.getElementById('plugins-demo-player'), {
            src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            width: '100%',
            height: 400,
            autoplay: false,
            controls: true,
            preload: 'metadata',
            plugins: {
                playbackRate: {
                    rates: [0.5, 0.75, 1, 1.25, 1.5, 2]
                }
            }
        });
        
        // 主题播放器
        players.themes = new EbinPlayer(document.getElementById('themes-demo-player'), {
            src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            width: '100%',
            height: 400,
            autoplay: false,
            controls: true,
            preload: 'metadata',
            theme: currentTheme
        });
        
        // 高级功能播放器
        players.advanced = new EbinPlayer(document.getElementById('advanced-demo-player'), {
            src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            width: '100%',
            height: 400,
            autoplay: false,
            controls: true,
            preload: 'metadata'
        });
    }
    
    // 导航切换
    function initNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const sections = document.querySelectorAll('.demo-section');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = item.getAttribute('href').substring(1);
                
                // 移除所有active类
                navItems.forEach(nav => nav.classList.remove('active'));
                sections.forEach(section => section.classList.remove('active'));
                
                // 添加active类
                item.classList.add('active');
                document.getElementById(targetId).classList.add('active');
            });
        });
    }
    
    // 基础播放器控制
    function initBasicControls() {
        const playBtn = document.getElementById('basic-play');
        const pauseBtn = document.getElementById('basic-pause');
        const muteBtn = document.getElementById('basic-mute');
        const volumeSlider = document.getElementById('basic-volume');
        const volumeText = document.getElementById('basic-volume-text');
        
        playBtn.addEventListener('click', () => {
            players.basic.play();
        });
        
        pauseBtn.addEventListener('click', () => {
            players.basic.pause();
        });
        
        muteBtn.addEventListener('click', () => {
            const muted = players.basic.getMuted();
            players.basic.setMuted(!muted);
            muteBtn.textContent = muted ? '静音' : '取消静音';
        });
        
        volumeSlider.addEventListener('input', (e) => {
            const volume = parseFloat(e.target.value);
            players.basic.setVolume(volume);
            volumeText.textContent = Math.round(volume * 100) + '%';
        });
        
        // 播放器事件监听
        players.basic.on('play', () => {
            playBtn.disabled = true;
            pauseBtn.disabled = false;
        });
        
        players.basic.on('pause', () => {
            playBtn.disabled = false;
            pauseBtn.disabled = true;
        });
        
        players.basic.on('volumechange', () => {
            const volume = players.basic.getVolume();
            volumeSlider.value = volume;
            volumeText.textContent = Math.round(volume * 100) + '%';
        });
    }
    
    // 自定义UI控制
    function initCustomUIControls() {
        const themeButtons = document.querySelectorAll('.theme-btn');
        const themeColorInput = document.getElementById('theme-color');
        const controlHeightInput = document.getElementById('control-height');
        
        themeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                themeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const themeName = btn.dataset.theme;
                if (themes[themeName]) {
                    currentTheme = { ...themes[themeName] };
                    players.customUI.setState({ theme: currentTheme });
                }
            });
        });
        
        themeColorInput.addEventListener('input', (e) => {
            currentTheme.primaryColor = e.target.value;
            players.customUI.setState({ theme: currentTheme });
        });
        
        controlHeightInput.addEventListener('input', (e) => {
            currentTheme.controlBarHeight = parseInt(e.target.value);
            players.customUI.setState({ theme: currentTheme });
        });
    }
    
    // 插件控制
    function initPluginControls() {
        const togglePlaybackRateBtn = document.getElementById('toggle-playback-rate');
        const toggleCustomPluginBtn = document.getElementById('toggle-custom-plugin');
        const pluginActionBtn = document.getElementById('plugin-action');
        const pluginCountSpan = document.getElementById('plugin-count');
        
        let playbackRateEnabled = true;
        let customPluginEnabled = false;
        
        togglePlaybackRateBtn.addEventListener('click', () => {
            if (playbackRateEnabled) {
                players.plugins.unuse('playbackRate');
                togglePlaybackRateBtn.textContent = '启用播放速度插件';
                togglePlaybackRateBtn.classList.remove('active');
            } else {
                players.plugins.use(EbinPlayer.PlaybackRatePlugin, {
                    rates: [0.5, 0.75, 1, 1.25, 1.5, 2]
                });
                togglePlaybackRateBtn.textContent = '禁用播放速度插件';
                togglePlaybackRateBtn.classList.add('active');
            }
            playbackRateEnabled = !playbackRateEnabled;
            updatePluginCount();
        });
        
        toggleCustomPluginBtn.addEventListener('click', () => {
            if (customPluginEnabled) {
                players.plugins.unuse('custom-plugin');
                toggleCustomPluginBtn.textContent = '启用自定义插件';
                toggleCustomPluginBtn.classList.remove('active');
            } else {
                // 这里可以添加自定义插件
                toggleCustomPluginBtn.textContent = '禁用自定义插件';
                toggleCustomPluginBtn.classList.add('active');
            }
            customPluginEnabled = !customPluginEnabled;
            updatePluginCount();
        });
        
        pluginActionBtn.addEventListener('click', () => {
            if (customPluginEnabled) {
                alert('自定义插件操作执行成功！');
            } else {
                alert('请先启用自定义插件');
            }
        });
        
        function updatePluginCount() {
            const loadedPlugins = players.plugins.pluginManager.getPluginIds();
            pluginCountSpan.textContent = loadedPlugins.length;
        }
        
        updatePluginCount();
    }
    
    // 主题定制控制
    function initThemeControls() {
        const primaryColorInput = document.getElementById('primary-color');
        const controlBarHeightInput = document.getElementById('control-bar-height');
        const borderRadiusInput = document.getElementById('border-radius');
        const fontSizeInput = document.getElementById('font-size');
        
        primaryColorInput.addEventListener('input', (e) => {
            currentTheme.primaryColor = e.target.value;
            players.themes.setState({ theme: currentTheme });
        });
        
        controlBarHeightInput.addEventListener('input', (e) => {
            currentTheme.controlBarHeight = parseInt(e.target.value);
            players.themes.setState({ theme: currentTheme });
        });
        
        borderRadiusInput.addEventListener('input', (e) => {
            currentTheme.borderRadius = parseInt(e.target.value);
            players.themes.setState({ theme: currentTheme });
        });
        
        fontSizeInput.addEventListener('input', (e) => {
            currentTheme.fontSize = parseInt(e.target.value);
            players.themes.setState({ theme: currentTheme });
        });
    }
    
    // 高级功能控制
    function initAdvancedControls() {
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        const pipBtn = document.getElementById('pip-btn');
        const speedBtn = document.getElementById('speed-btn');
        const qualityBtn = document.getElementById('quality-btn');
        
        fullscreenBtn.addEventListener('click', async () => {
            try {
                if (players.advanced.isFullscreen()) {
                    await players.advanced.exitFullscreen();
                    fullscreenBtn.textContent = '全屏';
                } else {
                    await players.advanced.requestFullscreen();
                    fullscreenBtn.textContent = '退出全屏';
                }
            } catch (error) {
                console.error('全屏操作失败:', error);
            }
        });
        
        pipBtn.addEventListener('click', async () => {
            try {
                if (players.advanced.isPictureInPicture()) {
                    await players.advanced.exitPictureInPicture();
                    pipBtn.textContent = '画中画';
                } else {
                    await players.advanced.requestPictureInPicture();
                    pipBtn.textContent = '退出画中画';
                }
            } catch (error) {
                console.error('画中画操作失败:', error);
            }
        });
        
        speedBtn.addEventListener('click', () => {
            const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
            const currentSpeed = players.advanced.getPlaybackRate();
            const currentIndex = speeds.indexOf(currentSpeed);
            const nextIndex = (currentIndex + 1) % speeds.length;
            const nextSpeed = speeds[nextIndex];
            players.advanced.setPlaybackRate(nextSpeed);
            speedBtn.textContent = nextSpeed + 'x';
        });
        
        qualityBtn.addEventListener('click', () => {
            alert('画质选择功能演示\n在实际应用中，这里会显示可用的画质选项');
        });
    }
    
    // 键盘快捷键
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            const activeSection = document.querySelector('.demo-section.active');
            if (!activeSection) return;
            
            const playerId = activeSection.id.replace('-demo-player', '');
            const player = players[playerId];
            if (!player) return;
            
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
                    fullscreenBtn?.click();
                    break;
            }
        });
    }
    
    // 初始化所有功能
    function init() {
        initPlayers();
        initNavigation();
        initBasicControls();
        initCustomUIControls();
        initPluginControls();
        initThemeControls();
        initAdvancedControls();
        initKeyboardShortcuts();
        
        console.log('EbinPlayer 在线演示已初始化');
    }
    
    // 启动应用
    init();
    
    // 导出到全局，方便调试
    window.players = players;
    window.currentTheme = currentTheme;
});
