// 自定义UI示例
document.addEventListener('DOMContentLoaded', function() {
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
        },
        purple: {
            primaryColor: '#6f42c1',
            controlBarHeight: 50,
            borderRadius: 12,
            fontSize: 14
        }
    };
    
    // 初始化播放器
    const player = new EbinPlayer(document.getElementById('custom-player'), {
        src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        width: 800,
        height: 450,
        autoplay: false,
        controls: true,
        preload: 'metadata',
        theme: currentTheme
    });
    
    // 获取DOM元素
    const themeButtons = document.querySelectorAll('.theme-btn');
    const primaryColorInput = document.getElementById('primary-color');
    const controlHeightInput = document.getElementById('control-height');
    const borderRadiusInput = document.getElementById('border-radius');
    const fontSizeInput = document.getElementById('font-size');
    const heightValue = document.getElementById('height-value');
    const radiusValue = document.getElementById('radius-value');
    const fontValue = document.getElementById('font-value');
    const themeCode = document.getElementById('theme-code');
    
    // 主题切换
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // 移除所有active类
            themeButtons.forEach(b => b.classList.remove('active'));
            // 添加active类到当前按钮
            btn.classList.add('active');
            
            // 获取主题名称
            const themeName = btn.dataset.theme;
            if (themes[themeName]) {
                currentTheme = { ...themes[themeName] };
                applyTheme();
            }
        });
    });
    
    // 颜色选择器
    primaryColorInput.addEventListener('input', (e) => {
        currentTheme.primaryColor = e.target.value;
        applyTheme();
    });
    
    // 控制栏高度
    controlHeightInput.addEventListener('input', (e) => {
        currentTheme.controlBarHeight = parseInt(e.target.value);
        heightValue.textContent = e.target.value + 'px';
        applyTheme();
    });
    
    // 圆角大小
    borderRadiusInput.addEventListener('input', (e) => {
        currentTheme.borderRadius = parseInt(e.target.value);
        radiusValue.textContent = e.target.value + 'px';
        applyTheme();
    });
    
    // 字体大小
    fontSizeInput.addEventListener('input', (e) => {
        currentTheme.fontSize = parseInt(e.target.value);
        fontValue.textContent = e.target.value + 'px';
        applyTheme();
    });
    
    // 应用主题
    function applyTheme() {
        // 更新播放器主题
        player.setState({ theme: currentTheme });
        
        // 更新预览组件样式
        updatePreviewStyles();
        
        // 更新代码显示
        updateCodeDisplay();
        
        // 应用页面主题
        applyPageTheme();
    }
    
    // 更新预览组件样式
    function updatePreviewStyles() {
        const playBtn = document.querySelector('.play-btn');
        const progressFill = document.querySelector('.progress-fill');
        const progressThumb = document.querySelector('.progress-thumb');
        const volumeFill = document.querySelector('.volume-fill');
        
        if (playBtn) {
            playBtn.style.backgroundColor = currentTheme.primaryColor;
        }
        
        if (progressFill) {
            progressFill.style.backgroundColor = currentTheme.primaryColor;
        }
        
        if (progressThumb) {
            progressThumb.style.backgroundColor = currentTheme.primaryColor;
        }
        
        if (volumeFill) {
            volumeFill.style.backgroundColor = currentTheme.primaryColor;
        }
        
        // 更新控制栏高度预览
        const controlBar = document.querySelector('.player-container .control-bar');
        if (controlBar) {
            controlBar.style.height = currentTheme.controlBarHeight + 'px';
        }
        
        // 更新圆角预览
        const playerContainer = document.querySelector('.player-container');
        if (playerContainer) {
            playerContainer.style.borderRadius = currentTheme.borderRadius + 'px';
        }
        
        // 更新字体大小
        const controls = document.querySelector('.player-container .controls');
        if (controls) {
            controls.style.fontSize = currentTheme.fontSize + 'px';
        }
    }
    
    // 更新代码显示
    function updateCodeDisplay() {
        const code = `const player = new EbinPlayer(container, {
    src: 'video.mp4',
    theme: {
        primaryColor: '${currentTheme.primaryColor}',
        controlBarHeight: ${currentTheme.controlBarHeight},
        borderRadius: ${currentTheme.borderRadius},
        fontSize: ${currentTheme.fontSize}
    }
});`;
        themeCode.textContent = code;
    }
    
    // 应用页面主题
    function applyPageTheme() {
        const body = document.body;
        
        // 移除所有主题类
        body.classList.remove('theme-dark', 'theme-blue', 'theme-green', 'theme-purple');
        
        // 根据主色调应用页面主题
        if (currentTheme.primaryColor === '#ff6b6b') {
            body.classList.add('theme-dark');
        } else if (currentTheme.primaryColor === '#17a2b8') {
            body.classList.add('theme-blue');
        } else if (currentTheme.primaryColor === '#28a745') {
            body.classList.add('theme-green');
        } else if (currentTheme.primaryColor === '#6f42c1') {
            body.classList.add('theme-purple');
        }
    }
    
    // 初始化控制值
    primaryColorInput.value = currentTheme.primaryColor;
    controlHeightInput.value = currentTheme.controlBarHeight;
    borderRadiusInput.value = currentTheme.borderRadius;
    fontSizeInput.value = currentTheme.fontSize;
    
    // 初始化显示值
    heightValue.textContent = currentTheme.controlBarHeight + 'px';
    radiusValue.textContent = currentTheme.borderRadius + 'px';
    fontValue.textContent = currentTheme.fontSize + 'px';
    
    // 应用初始主题
    applyTheme();
    
    // 播放器事件监听
    player.on('play', () => {
        console.log('播放器开始播放');
    });
    
    player.on('pause', () => {
        console.log('播放器暂停');
    });
    
    player.on('error', (event) => {
        console.error('播放器错误:', event.error);
    });
    
    // 添加实时预览功能
    function addRealTimePreview() {
        const inputs = [primaryColorInput, controlHeightInput, borderRadiusInput, fontSizeInput];
        
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                // 防抖处理
                clearTimeout(input.previewTimeout);
                input.previewTimeout = setTimeout(() => {
                    applyTheme();
                }, 100);
            });
        });
    }
    
    addRealTimePreview();
    
    // 添加主题保存和加载功能
    function saveTheme() {
        localStorage.setItem('ebin-player-theme', JSON.stringify(currentTheme));
        console.log('主题已保存');
    }
    
    function loadTheme() {
        const saved = localStorage.getItem('ebin-player-theme');
        if (saved) {
            try {
                const theme = JSON.parse(saved);
                currentTheme = { ...theme };
                applyTheme();
                console.log('主题已加载');
            } catch (e) {
                console.error('加载主题失败:', e);
            }
        }
    }
    
    // 添加保存和加载按钮
    const saveBtn = document.createElement('button');
    saveBtn.textContent = '保存主题';
    saveBtn.className = 'theme-btn';
    saveBtn.addEventListener('click', saveTheme);
    
    const loadBtn = document.createElement('button');
    loadBtn.textContent = '加载主题';
    loadBtn.className = 'theme-btn';
    loadBtn.addEventListener('click', loadTheme);
    
    document.querySelector('.theme-buttons').appendChild(saveBtn);
    document.querySelector('.theme-buttons').appendChild(loadBtn);
    
    // 页面加载时尝试加载保存的主题
    loadTheme();
    
    // 添加主题重置功能
    const resetBtn = document.createElement('button');
    resetBtn.textContent = '重置主题';
    resetBtn.className = 'theme-btn';
    resetBtn.addEventListener('click', () => {
        currentTheme = { ...themes.default };
        applyTheme();
        console.log('主题已重置');
    });
    
    document.querySelector('.theme-buttons').appendChild(resetBtn);
    
    // 导出播放器实例到全局，方便调试
    window.player = player;
    window.currentTheme = currentTheme;
    console.log('自定义UI播放器已初始化，可通过 window.player 和 window.currentTheme 访问');
});
