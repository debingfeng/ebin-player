/**
 * 高级UI组件
 * 基于配置文件实现所有启用的UI功能
 */
import { PlayerInstance, PlayerState, UIComponent, ControlBarConfig, PlayerTheme } from '../types';

export class AdvancedUI {
  name = 'advancedUI';
  private player: PlayerInstance;
  private container: HTMLElement;
  private controlBar!: HTMLElement;
  private progressBar!: HTMLElement;
  private timeDisplay!: HTMLElement;
  private volumeControl!: HTMLElement;
  private playButton!: HTMLElement;
  private fullscreenButton!: HTMLElement;
  private isDestroyed = false;
  private config: ControlBarConfig;
  private theme: PlayerTheme;
  
  // 高级功能元素
  private playbackRateButton!: HTMLElement;
  private qualityButton!: HTMLElement;
  private subtitleButton!: HTMLElement;
  private aspectRatioButton!: HTMLElement;
  private pipButton!: HTMLElement;
  private screenshotButton!: HTMLElement;
  private skipBackButton!: HTMLElement;
  private skipForwardButton!: HTMLElement;
  private audioTrackButton!: HTMLElement;
  private equalizerButton!: HTMLElement;
  private abLoopButton!: HTMLElement;
  private bookmarkButton!: HTMLElement;
  private danmakuButton!: HTMLElement;
  
  // 菜单和面板
  private settingsMenu!: HTMLElement;
  private playbackRateMenu!: HTMLElement;
  private qualityMenu!: HTMLElement;
  private audioTrackMenu!: HTMLElement;
  private equalizerPanel!: HTMLElement;
  private bookmarkPanel!: HTMLElement;
  private danmakuPanel!: HTMLElement;
  
  // 状态
  private currentPlaybackRate = 1;
  private currentQuality = 'auto';
  private currentAudioTrack = 0;
  private subtitlesEnabled = false;
  private danmakuEnabled = false;
  private abLoopEnabled = false;
  private abLoopStart = 0;
  private abLoopEnd = 0;

  constructor(
    player: PlayerInstance, 
    container: HTMLElement,
    config: ControlBarConfig = {},
    theme: PlayerTheme = {}
  ) {
    this.player = player;
    this.container = container;
    this.config = {
      playButton: true,
      progressBar: true,
      timeDisplay: true,
      volumeControl: true,
      playbackRateControl: true,
      fullscreenButton: true,
      customButtons: [],
      ...config
    };
    this.theme = {
      primaryColor: '#007bff',
      secondaryColor: '#6c757d',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      textColor: '#ffffff',
      controlBarHeight: 50,
      borderRadius: 4,
      fontFamily: 'Arial, sans-serif',
      ...theme
    };

    this.createUI();
    this.setupEventListeners();
  }

  /**
   * 创建UI结构
   */
  private createUI(): void {
    // 设置容器样式
    this.container.className = 'ebin-player';
    this.container.style.fontFamily = this.theme.fontFamily || 'system-ui, -apple-system, sans-serif';

    // 创建控制栏
    this.createControlBar();
    
    // 创建播放按钮覆盖层
    this.createPlayButtonOverlay();
    
    // 创建加载指示器
    this.createLoadingIndicator();
    
    // 创建字幕显示区域
    this.createSubtitleDisplay();
    
    // 创建弹幕容器
    this.createDanmakuContainer();
    
    // 创建各种菜单和面板
    this.createMenus();
  }

  /**
   * 创建控制栏
   */
  private createControlBar(): void {
    this.controlBar = document.createElement('div');
    this.controlBar.className = 'ebin-control-bar';
    this.controlBar.style.height = `${this.theme.controlBarHeight || 50}px`;
    this.controlBar.style.backgroundColor = this.theme.backgroundColor || 'rgba(0, 0, 0, 0.8)';

    // 左侧控制组
    const leftControls = document.createElement('div');
    leftControls.className = 'flex items-center';

    // 播放/暂停按钮
    if (this.config.playButton) {
      this.createPlayButton();
      leftControls.appendChild(this.playButton);
    }

    // 快退/快进按钮
    this.createSkipButtons();
    leftControls.appendChild(this.skipBackButton);
    leftControls.appendChild(this.skipForwardButton);

    // 时间显示优先于进度条（显示在进度条上方）
    if (this.config.timeDisplay) {
      this.createTimeDisplay();
      leftControls.appendChild(this.timeDisplay);
    }

    this.controlBar.appendChild(leftControls);

    // 中间进度条
    if (this.config.progressBar) {
      this.createProgressBar();
    }

    // 右侧控制组
    const rightControls = document.createElement('div');
    rightControls.className = 'flex items-center ml-auto';

    // 音量控制
    if (this.config.volumeControl) {
      this.createVolumeControl();
      rightControls.appendChild(this.volumeControl);
    }

    // 播放速度选择
    this.createPlaybackRateControl();
    rightControls.appendChild(this.playbackRateButton);

    // 画质选择
    this.createQualityControl();
    rightControls.appendChild(this.qualityButton);

    // 字幕开关
    this.createSubtitleControl();
    rightControls.appendChild(this.subtitleButton);

    // 画面比例
    this.createAspectRatioControl();
    rightControls.appendChild(this.aspectRatioButton);

    // 画中画
    this.createPictureInPictureControl();
    rightControls.appendChild(this.pipButton);

    // 截图
    this.createScreenshotControl();
    rightControls.appendChild(this.screenshotButton);

    // 音轨选择
    this.createAudioTrackControl();
    rightControls.appendChild(this.audioTrackButton);

    // 均衡器
    this.createEqualizerControl();
    rightControls.appendChild(this.equalizerButton);

    // AB循环
    this.createABLoopControl();
    rightControls.appendChild(this.abLoopButton);

    // 书签
    this.createBookmarkControl();
    rightControls.appendChild(this.bookmarkButton);

    // 弹幕
    this.createDanmakuControl();
    rightControls.appendChild(this.danmakuButton);

    // 全屏按钮
    if (this.config.fullscreenButton) {
      this.createFullscreenButton();
      rightControls.appendChild(this.fullscreenButton);
    }

    this.controlBar.appendChild(rightControls);
    this.container.appendChild(this.controlBar);
  }

  /**
   * 创建播放按钮
   */
  private createPlayButton(): void {
    this.playButton = document.createElement('button');
    this.playButton.className = 'ebin-play-button';
    this.playButton.innerHTML = '▶';
    this.playButton.setAttribute('aria-label', '播放/暂停');
    this.playButton.style.color = this.theme.textColor || '#ffffff';
  }

  /**
   * 创建快退/快进按钮
   */
  private createSkipButtons(): void {
    this.skipBackButton = document.createElement('button');
    this.skipBackButton.className = 'ebin-skip-button';
    this.skipBackButton.innerHTML = '⏪';
    this.skipBackButton.setAttribute('aria-label', '快退10秒');
    this.skipBackButton.style.color = this.theme.textColor || '#ffffff';

    this.skipForwardButton = document.createElement('button');
    this.skipForwardButton.className = 'ebin-skip-button';
    this.skipForwardButton.innerHTML = '⏩';
    this.skipForwardButton.setAttribute('aria-label', '快进10秒');
    this.skipForwardButton.style.color = this.theme.textColor || '#ffffff';
  }

  /**
   * 创建进度条
   */
  private createProgressBar(): void {
    const progressContainer = document.createElement('div');
    progressContainer.className = 'ebin-progress-container';
    progressContainer.setAttribute('role', 'slider');
    progressContainer.setAttribute('aria-label', '播放进度');
    progressContainer.setAttribute('tabindex', '0');

    this.progressBar = document.createElement('div');
    this.progressBar.className = 'ebin-progress-bar';
    this.progressBar.style.backgroundColor = this.theme.primaryColor || '#3b82f6';

    // 创建进度条拖拽点
    const progressThumb = document.createElement('div');
    progressThumb.className = 'ebin-progress-thumb';

    progressContainer.appendChild(this.progressBar);
    progressContainer.appendChild(progressThumb);
    this.controlBar.appendChild(progressContainer);
  }

  /**
   * 创建时间显示
   */
  private createTimeDisplay(): void {
    this.timeDisplay = document.createElement('div');
    this.timeDisplay.className = 'ebin-time-display';
    this.timeDisplay.setAttribute('aria-live', 'polite');
    this.timeDisplay.style.color = this.theme.textColor || '#ffffff';
  }

  /**
   * 创建音量控制
   */
  private createVolumeControl(): void {
    this.volumeControl = document.createElement('div');
    this.volumeControl.className = 'ebin-volume-control';

    const volumeButton = document.createElement('button');
    volumeButton.className = 'ebin-volume-button';
    volumeButton.innerHTML = '🔊';
    volumeButton.setAttribute('aria-label', '静音/取消静音');
    volumeButton.style.color = this.theme.textColor || '#ffffff';

    const volumeSlider = document.createElement('input');
    volumeSlider.type = 'range';
    volumeSlider.className = 'ebin-volume-slider';
    volumeSlider.min = '0';
    volumeSlider.max = '1';
    volumeSlider.step = '0.1';
    volumeSlider.setAttribute('aria-label', '音量调节');

    this.volumeControl.appendChild(volumeButton);
    this.volumeControl.appendChild(volumeSlider);
  }

  /**
   * 创建播放速度控制
   */
  private createPlaybackRateControl(): void {
    this.playbackRateButton = document.createElement('button');
    this.playbackRateButton.className = 'ebin-speed-button';
    this.playbackRateButton.innerHTML = '1x';
    this.playbackRateButton.setAttribute('aria-label', '播放速度');
    this.playbackRateButton.style.color = this.theme.textColor || '#ffffff';
  }

  /**
   * 创建画质选择控制
   */
  private createQualityControl(): void {
    this.qualityButton = document.createElement('button');
    this.qualityButton.className = 'ebin-quality-button';
    this.qualityButton.innerHTML = '画质';
    this.qualityButton.setAttribute('aria-label', '画质选择');
    this.qualityButton.style.color = this.theme.textColor || '#ffffff';
  }

  /**
   * 创建字幕控制
   */
  private createSubtitleControl(): void {
    this.subtitleButton = document.createElement('button');
    this.subtitleButton.className = 'ebin-subtitle-button';
    this.subtitleButton.innerHTML = 'CC';
    this.subtitleButton.setAttribute('aria-label', '字幕开关');
    this.subtitleButton.style.color = this.theme.textColor || '#ffffff';
  }

  /**
   * 创建画面比例控制
   */
  private createAspectRatioControl(): void {
    this.aspectRatioButton = document.createElement('button');
    this.aspectRatioButton.className = 'ebin-aspect-ratio-button';
    this.aspectRatioButton.innerHTML = '比例';
    this.aspectRatioButton.setAttribute('aria-label', '画面比例');
    this.aspectRatioButton.style.color = this.theme.textColor || '#ffffff';
  }

  /**
   * 创建画中画控制
   */
  private createPictureInPictureControl(): void {
    this.pipButton = document.createElement('button');
    this.pipButton.className = 'ebin-pip-button';
    this.pipButton.innerHTML = '画中画';
    this.pipButton.setAttribute('aria-label', '画中画');
    this.pipButton.style.color = this.theme.textColor || '#ffffff';
  }

  /**
   * 创建截图控制
   */
  private createScreenshotControl(): void {
    this.screenshotButton = document.createElement('button');
    this.screenshotButton.className = 'ebin-screenshot-button';
    this.screenshotButton.innerHTML = '截图';
    this.screenshotButton.setAttribute('aria-label', '截图');
    this.screenshotButton.style.color = this.theme.textColor || '#ffffff';
  }

  /**
   * 创建音轨选择控制
   */
  private createAudioTrackControl(): void {
    this.audioTrackButton = document.createElement('button');
    this.audioTrackButton.className = 'ebin-audio-track-button';
    this.audioTrackButton.innerHTML = '音轨';
    this.audioTrackButton.setAttribute('aria-label', '音轨选择');
    this.audioTrackButton.style.color = this.theme.textColor || '#ffffff';
  }

  /**
   * 创建均衡器控制
   */
  private createEqualizerControl(): void {
    this.equalizerButton = document.createElement('button');
    this.equalizerButton.className = 'ebin-equalizer-button';
    this.equalizerButton.innerHTML = '均衡器';
    this.equalizerButton.setAttribute('aria-label', '音频均衡器');
    this.equalizerButton.style.color = this.theme.textColor || '#ffffff';
  }

  /**
   * 创建AB循环控制
   */
  private createABLoopControl(): void {
    this.abLoopButton = document.createElement('button');
    this.abLoopButton.className = 'ebin-ab-loop-button';
    this.abLoopButton.innerHTML = 'AB';
    this.abLoopButton.setAttribute('aria-label', 'AB循环播放');
    this.abLoopButton.style.color = this.theme.textColor || '#ffffff';
  }

  /**
   * 创建书签控制
   */
  private createBookmarkControl(): void {
    this.bookmarkButton = document.createElement('button');
    this.bookmarkButton.className = 'ebin-bookmark-button';
    this.bookmarkButton.innerHTML = '书签';
    this.bookmarkButton.setAttribute('aria-label', '时间戳书签');
    this.bookmarkButton.style.color = this.theme.textColor || '#ffffff';
  }

  /**
   * 创建弹幕控制
   */
  private createDanmakuControl(): void {
    this.danmakuButton = document.createElement('button');
    this.danmakuButton.className = 'ebin-danmaku-button';
    this.danmakuButton.innerHTML = '弹幕';
    this.danmakuButton.setAttribute('aria-label', '弹幕开关');
    this.danmakuButton.style.color = this.theme.textColor || '#ffffff';
  }

  /**
   * 创建全屏按钮
   */
  private createFullscreenButton(): void {
    this.fullscreenButton = document.createElement('button');
    this.fullscreenButton.className = 'ebin-fullscreen-button';
    this.fullscreenButton.innerHTML = '⛶';
    this.fullscreenButton.setAttribute('aria-label', '全屏/退出全屏');
    this.fullscreenButton.style.color = this.theme.textColor || '#ffffff';
  }

  /**
   * 创建播放按钮覆盖层
   */
  private createPlayButtonOverlay(): void {
    const overlay = document.createElement('div');
    overlay.className = 'ebin-play-overlay';
    overlay.setAttribute('aria-label', '播放视频');
    overlay.style.backgroundColor = this.theme.backgroundColor || 'rgba(0, 0, 0, 0.8)';

    const playIcon = document.createElement('div');
    playIcon.className = 'ebin-play-overlay-icon';
    playIcon.innerHTML = '▶';
    playIcon.style.color = this.theme.textColor || '#ffffff';

    overlay.appendChild(playIcon);
    this.container.appendChild(overlay);
  }

  /**
   * 创建加载指示器
   */
  private createLoadingIndicator(): void {
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'ebin-loading-indicator';
    loadingIndicator.setAttribute('aria-label', '加载中');
    loadingIndicator.style.display = 'none';

    this.container.appendChild(loadingIndicator);
  }

  /**
   * 创建字幕显示区域
   */
  private createSubtitleDisplay(): void {
    const subtitleDisplay = document.createElement('div');
    subtitleDisplay.className = 'ebin-subtitle';
    subtitleDisplay.style.display = 'none';

    this.container.appendChild(subtitleDisplay);
  }

  /**
   * 创建弹幕容器
   */
  private createDanmakuContainer(): void {
    const danmakuContainer = document.createElement('div');
    danmakuContainer.className = 'absolute inset-0 pointer-events-none overflow-hidden';
    danmakuContainer.id = 'danmaku-container';

    this.container.appendChild(danmakuContainer);
  }

  /**
   * 创建各种菜单和面板
   */
  private createMenus(): void {
    // 播放速度菜单
    this.createPlaybackRateMenu();
    
    // 画质菜单
    this.createQualityMenu();
    
    // 音轨菜单
    this.createAudioTrackMenu();
    
    // 均衡器面板
    this.createEqualizerPanel();
    
    // 书签面板
    this.createBookmarkPanel();
    
    // 弹幕设置面板
    this.createDanmakuPanel();
  }

  /**
   * 创建播放速度菜单
   */
  private createPlaybackRateMenu(): void {
    this.playbackRateMenu = document.createElement('div');
    this.playbackRateMenu.className = 'ebin-menu';
    
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    rates.forEach(rate => {
      const item = document.createElement('div');
      item.className = 'ebin-menu-item';
      item.textContent = `${rate}x`;
      if (rate === this.currentPlaybackRate) {
        item.classList.add('active');
      }
      item.addEventListener('click', () => {
        this.setPlaybackRate(rate);
        this.hideMenu(this.playbackRateMenu);
      });
      this.playbackRateMenu.appendChild(item);
    });
    
    this.container.appendChild(this.playbackRateMenu);
  }

  /**
   * 创建画质菜单
   */
  private createQualityMenu(): void {
    this.qualityMenu = document.createElement('div');
    this.qualityMenu.className = 'ebin-menu';
    
    const qualities = ['auto', '1080p', '720p', '480p', '360p'];
    qualities.forEach(quality => {
      const item = document.createElement('div');
      item.className = 'ebin-menu-item';
      item.textContent = quality === 'auto' ? '自动' : quality;
      if (quality === this.currentQuality) {
        item.classList.add('active');
      }
      item.addEventListener('click', () => {
        this.setQuality(quality);
        this.hideMenu(this.qualityMenu);
      });
      this.qualityMenu.appendChild(item);
    });
    
    this.container.appendChild(this.qualityMenu);
  }

  /**
   * 创建音轨菜单
   */
  private createAudioTrackMenu(): void {
    this.audioTrackMenu = document.createElement('div');
    this.audioTrackMenu.className = 'ebin-menu';
    
    const tracks = ['音轨1', '音轨2', '音轨3'];
    tracks.forEach((track, index) => {
      const item = document.createElement('div');
      item.className = 'ebin-menu-item';
      item.textContent = track;
      if (index === this.currentAudioTrack) {
        item.classList.add('active');
      }
      item.addEventListener('click', () => {
        this.setAudioTrack(index);
        this.hideMenu(this.audioTrackMenu);
      });
      this.audioTrackMenu.appendChild(item);
    });
    
    this.container.appendChild(this.audioTrackMenu);
  }

  /**
   * 创建均衡器面板
   */
  private createEqualizerPanel(): void {
    this.equalizerPanel = document.createElement('div');
    this.equalizerPanel.className = 'ebin-settings-panel';
    
    const title = document.createElement('div');
    title.className = 'ebin-settings-title';
    title.textContent = '音频均衡器';
    
    const controls = document.createElement('div');
    controls.className = 'space-y-4';
    
    const frequencies = [
      { label: '低频', freq: '60Hz' },
      { label: '中低频', freq: '170Hz' },
      { label: '中频', freq: '310Hz' },
      { label: '中高频', freq: '600Hz' },
      { label: '高频', freq: '1kHz' },
      { label: '超高频', freq: '3kHz' },
      { label: '极高频', freq: '6kHz' },
      { label: '超高', freq: '12kHz' },
      { label: '极高', freq: '14kHz' },
      { label: '最高', freq: '16kHz' }
    ];
    
    frequencies.forEach(freq => {
      const control = document.createElement('div');
      control.className = 'ebin-settings-option';
      
      const label = document.createElement('div');
      label.className = 'ebin-settings-label';
      label.textContent = `${freq.label} (${freq.freq})`;
      
      const slider = document.createElement('input');
      slider.type = 'range';
      slider.className = 'ebin-settings-select';
      slider.min = '-12';
      slider.max = '12';
      slider.value = '0';
      slider.step = '1';
      
      control.appendChild(label);
      control.appendChild(slider);
      controls.appendChild(control);
    });
    
    this.equalizerPanel.appendChild(title);
    this.equalizerPanel.appendChild(controls);
    this.container.appendChild(this.equalizerPanel);
  }

  /**
   * 创建书签面板
   */
  private createBookmarkPanel(): void {
    this.bookmarkPanel = document.createElement('div');
    this.bookmarkPanel.className = 'ebin-settings-panel';
    
    const title = document.createElement('div');
    title.className = 'ebin-settings-title';
    title.textContent = '时间戳书签';
    
    const addButton = document.createElement('button');
    addButton.className = 'ebin-menu-item';
    addButton.textContent = '添加书签';
    addButton.addEventListener('click', () => this.addBookmark());
    
    const bookmarksList = document.createElement('div');
    bookmarksList.className = 'space-y-2';
    bookmarksList.id = 'bookmarks-list';
    
    this.bookmarkPanel.appendChild(title);
    this.bookmarkPanel.appendChild(addButton);
    this.bookmarkPanel.appendChild(bookmarksList);
    this.container.appendChild(this.bookmarkPanel);
  }

  /**
   * 创建弹幕设置面板
   */
  private createDanmakuPanel(): void {
    this.danmakuPanel = document.createElement('div');
    this.danmakuPanel.className = 'ebin-settings-panel';
    
    const title = document.createElement('div');
    title.className = 'ebin-settings-title';
    title.textContent = '弹幕设置';
    
    const controls = document.createElement('div');
    controls.className = 'space-y-4';
    
    // 弹幕开关
    const toggleControl = document.createElement('div');
    toggleControl.className = 'ebin-settings-option';
    
    const toggleLabel = document.createElement('div');
    toggleLabel.className = 'ebin-settings-label';
    toggleLabel.textContent = '显示弹幕';
    
    const toggleSwitch = document.createElement('input');
    toggleSwitch.type = 'checkbox';
    toggleSwitch.checked = this.danmakuEnabled;
    toggleSwitch.addEventListener('change', (e) => {
      this.toggleDanmaku((e.target as HTMLInputElement).checked);
    });
    
    toggleControl.appendChild(toggleLabel);
    toggleControl.appendChild(toggleSwitch);
    controls.appendChild(toggleControl);
    
    // 弹幕透明度
    const opacityControl = document.createElement('div');
    opacityControl.className = 'ebin-settings-option';
    
    const opacityLabel = document.createElement('div');
    opacityLabel.className = 'ebin-settings-label';
    opacityLabel.textContent = '透明度';
    
    const opacitySlider = document.createElement('input');
    opacitySlider.type = 'range';
    opacitySlider.className = 'ebin-settings-select';
    opacitySlider.min = '0';
    opacitySlider.max = '1';
    opacitySlider.step = '0.1';
    opacitySlider.value = '0.8';
    
    opacityControl.appendChild(opacityLabel);
    opacityControl.appendChild(opacitySlider);
    controls.appendChild(opacityControl);
    
    this.danmakuPanel.appendChild(title);
    this.danmakuPanel.appendChild(controls);
    this.container.appendChild(this.danmakuPanel);
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 鼠标悬停显示/隐藏控制栏
    this.container.addEventListener('mouseenter', () => {
      this.showControlBar();
    });

    this.container.addEventListener('mouseleave', () => {
      this.hideControlBar();
    });

    // 播放按钮
    if (this.playButton) {
      this.playButton.addEventListener('click', () => {
        if (this.player.getPaused()) {
          this.player.play();
        } else {
          this.player.pause();
        }
      });
    }

    // 快退/快进按钮
    if (this.skipBackButton) {
      this.skipBackButton.addEventListener('click', () => {
        this.skipTime(-10);
      });
    }

    if (this.skipForwardButton) {
      this.skipForwardButton.addEventListener('click', () => {
        this.skipTime(10);
      });
    }

    // 进度条
    if (this.progressBar) {
      const progressContainer = this.progressBar.parentElement!;
      progressContainer.addEventListener('click', (e) => {
        const rect = progressContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        const duration = this.player.getDuration();
        const newTime = percentage * duration;
        this.player.setCurrentTime(newTime);
      });
    }

    // 音量控制
    if (this.volumeControl) {
      const volumeSlider = this.volumeControl.querySelector('input[type="range"]') as HTMLInputElement;
      const volumeButton = this.volumeControl.querySelector('button') as HTMLButtonElement;

      volumeSlider.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        this.player.setVolume(parseFloat(target.value));
      });

      volumeButton.addEventListener('click', () => {
        this.player.setMuted(!this.player.getMuted());
      });
    }

    // 播放速度控制
    if (this.playbackRateButton) {
      this.playbackRateButton.addEventListener('click', () => {
        this.toggleMenu(this.playbackRateMenu);
      });
    }

    // 画质控制
    if (this.qualityButton) {
      this.qualityButton.addEventListener('click', () => {
        this.toggleMenu(this.qualityMenu);
      });
    }

    // 字幕控制
    if (this.subtitleButton) {
      this.subtitleButton.addEventListener('click', () => {
        this.toggleSubtitles();
      });
    }

    // 画面比例控制
    if (this.aspectRatioButton) {
      this.aspectRatioButton.addEventListener('click', () => {
        this.toggleAspectRatio();
      });
    }

    // 画中画控制
    if (this.pipButton) {
      this.pipButton.addEventListener('click', () => {
        this.togglePictureInPicture();
      });
    }

    // 截图控制
    if (this.screenshotButton) {
      this.screenshotButton.addEventListener('click', () => {
        this.takeScreenshot();
      });
    }

    // 音轨控制
    if (this.audioTrackButton) {
      this.audioTrackButton.addEventListener('click', () => {
        this.toggleMenu(this.audioTrackMenu);
      });
    }

    // 均衡器控制
    if (this.equalizerButton) {
      this.equalizerButton.addEventListener('click', () => {
        this.togglePanel(this.equalizerPanel);
      });
    }

    // AB循环控制
    if (this.abLoopButton) {
      this.abLoopButton.addEventListener('click', () => {
        this.toggleABLoop();
      });
    }

    // 书签控制
    if (this.bookmarkButton) {
      this.bookmarkButton.addEventListener('click', () => {
        this.togglePanel(this.bookmarkPanel);
      });
    }

    // 弹幕控制
    if (this.danmakuButton) {
      this.danmakuButton.addEventListener('click', () => {
        this.togglePanel(this.danmakuPanel);
      });
    }

    // 全屏按钮
    if (this.fullscreenButton) {
      this.fullscreenButton.addEventListener('click', () => {
        if (this.player.isFullscreen()) {
          this.player.exitFullscreen();
        } else {
          this.player.requestFullscreen();
        }
      });
    }

    // 播放器状态变化
    if (this.player && 'subscribe' in this.player && typeof (this.player as any).subscribe === 'function') {
      (this.player as any).subscribe((state: PlayerState) => {
        this.updateUI(state);
      });
    }

    // 键盘快捷键
    this.setupKeyboardShortcuts();
  }

  /**
   * 设置键盘快捷键
   */
  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      if (!this.container.contains(document.activeElement)) return;

      switch (e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault();
          if (this.playButton) {
            this.playButton.click();
          }
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          if (this.fullscreenButton) {
            this.fullscreenButton.click();
          }
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          if (this.volumeControl) {
            const volumeButton = this.volumeControl.querySelector('button') as HTMLButtonElement;
            volumeButton.click();
          }
          break;
        case 'c':
        case 'C':
          e.preventDefault();
          if (this.subtitleButton) {
            this.subtitleButton.click();
          }
          break;
        case 'j':
        case 'J':
          e.preventDefault();
          if (this.skipBackButton) {
            this.skipBackButton.click();
          }
          break;
        case 'l':
        case 'L':
          e.preventDefault();
          if (this.skipForwardButton) {
            this.skipForwardButton.click();
          }
          break;
        case '<':
          if (e.shiftKey) {
            e.preventDefault();
            this.changePlaybackRate(-0.25);
          }
          break;
        case '>':
          if (e.shiftKey) {
            e.preventDefault();
            this.changePlaybackRate(0.25);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.changeVolume(0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          this.changeVolume(-0.1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.skipTime(-5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.skipTime(5);
          break;
      }
    });
  }

  /**
   * 更新UI状态
   */
  private updateUI(state: PlayerState): void {
    if (this.isDestroyed) return;

    // 更新播放按钮
    if (this.playButton) {
      this.playButton.innerHTML = state.paused ? '▶' : '⏸';
    }

    // 更新进度条
    if (this.progressBar && state.duration > 0) {
      const percentage = (state.currentTime / state.duration) * 100;
      this.progressBar.style.width = `${percentage}%`;
      
      // 更新进度条圆点位置
      const progressContainer = this.progressBar.parentElement;
      if (progressContainer) {
        const progressThumb = progressContainer.querySelector('.ebin-progress-thumb') as HTMLElement;
        if (progressThumb) {
          progressThumb.style.left = `${percentage}%`;
        }
      }
    }

    // 更新时间显示
    if (this.timeDisplay) {
      const currentTime = this.formatTime(state.currentTime);
      const duration = this.formatTime(state.duration);
      this.timeDisplay.textContent = `${currentTime} / ${duration}`;
    }

    // 更新音量控制
    if (this.volumeControl) {
      const volumeSlider = this.volumeControl.querySelector('input[type="range"]') as HTMLInputElement;
      const volumeButton = this.volumeControl.querySelector('button') as HTMLButtonElement;
      
      if (volumeSlider) {
        volumeSlider.value = state.volume.toString();
      }
      
      if (volumeButton) {
        volumeButton.innerHTML = state.muted ? '🔇' : '🔊';
      }
    }

    // 更新全屏按钮
    if (this.fullscreenButton) {
      this.fullscreenButton.innerHTML = this.player.isFullscreen() ? '⛶' : '⛶';
    }

    // 更新播放速度显示
    if (this.playbackRateButton) {
      this.playbackRateButton.textContent = `${this.currentPlaybackRate}x`;
    }

    // 更新字幕按钮状态
    if (this.subtitleButton) {
      this.subtitleButton.classList.toggle('active', this.subtitlesEnabled);
    }

    // 更新弹幕按钮状态
    if (this.danmakuButton) {
      this.danmakuButton.classList.toggle('active', this.danmakuEnabled);
    }

    // 更新AB循环按钮状态
    if (this.abLoopButton) {
      this.abLoopButton.classList.toggle('active', this.abLoopEnabled);
    }
  }

  /**
   * 格式化时间
   */
  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * 显示控制栏
   */
  private showControlBar(): void {
    if (this.controlBar) {
      this.controlBar.classList.add('visible');
    }
  }

  /**
   * 隐藏控制栏
   */
  private hideControlBar(): void {
    if (this.controlBar) {
      this.controlBar.classList.remove('visible');
    }
  }

  /**
   * 切换菜单显示
   */
  private toggleMenu(menu: HTMLElement): void {
    const isVisible = menu.classList.contains('visible');
    this.hideAllMenus();
    if (!isVisible) {
      menu.classList.add('visible');
    }
  }

  /**
   * 切换面板显示
   */
  private togglePanel(panel: HTMLElement): void {
    const isVisible = panel.classList.contains('visible');
    this.hideAllPanels();
    if (!isVisible) {
      panel.classList.add('visible');
    }
  }

  /**
   * 隐藏菜单
   */
  private hideMenu(menu: HTMLElement): void {
    menu.classList.remove('visible');
  }

  /**
   * 隐藏所有菜单
   */
  private hideAllMenus(): void {
    const menus = [this.playbackRateMenu, this.qualityMenu, this.audioTrackMenu];
    menus.forEach(menu => {
      if (menu) {
        menu.classList.remove('visible');
      }
    });
  }

  /**
   * 隐藏所有面板
   */
  private hideAllPanels(): void {
    const panels = [this.equalizerPanel, this.bookmarkPanel, this.danmakuPanel];
    panels.forEach(panel => {
      if (panel) {
        panel.classList.remove('visible');
      }
    });
  }

  /**
   * 设置播放速度
   */
  private setPlaybackRate(rate: number): void {
    this.currentPlaybackRate = rate;
    this.player.setPlaybackRate(rate);
  }

  /**
   * 改变播放速度
   */
  private changePlaybackRate(delta: number): void {
    const newRate = Math.max(0.25, Math.min(4, this.currentPlaybackRate + delta));
    this.setPlaybackRate(newRate);
  }

  /**
   * 设置画质
   */
  private setQuality(quality: string): void {
    this.currentQuality = quality;
    // 这里需要根据实际的播放器API来实现
    console.log('设置画质:', quality);
  }

  /**
   * 设置音轨
   */
  private setAudioTrack(track: number): void {
    this.currentAudioTrack = track;
    // 这里需要根据实际的播放器API来实现
    console.log('设置音轨:', track);
  }

  /**
   * 切换字幕
   */
  private toggleSubtitles(): void {
    this.subtitlesEnabled = !this.subtitlesEnabled;
    const subtitleDisplay = this.container.querySelector('.ebin-subtitle') as HTMLElement;
    if (subtitleDisplay) {
      subtitleDisplay.style.display = this.subtitlesEnabled ? 'block' : 'none';
    }
  }

  /**
   * 切换画面比例
   */
  private toggleAspectRatio(): void {
    // 这里需要根据实际的播放器API来实现
    console.log('切换画面比例');
  }

  /**
   * 切换画中画
   */
  private togglePictureInPicture(): void {
    // 这里需要根据实际的播放器API来实现
    console.log('切换画中画');
  }

  /**
   * 截图
   */
  private takeScreenshot(): void {
    // 这里需要根据实际的播放器API来实现
    console.log('截图');
  }

  /**
   * 切换AB循环
   */
  private toggleABLoop(): void {
    this.abLoopEnabled = !this.abLoopEnabled;
    if (this.abLoopEnabled) {
      this.abLoopStart = this.player.getCurrentTime();
    } else {
      this.abLoopEnd = this.player.getCurrentTime();
    }
  }

  /**
   * 添加书签
   */
  private addBookmark(): void {
    const currentTime = this.player.getCurrentTime();
    const bookmarksList = document.getElementById('bookmarks-list');
    if (bookmarksList) {
      const bookmarkItem = document.createElement('div');
      bookmarkItem.className = 'ebin-menu-item';
      bookmarkItem.textContent = this.formatTime(currentTime);
      bookmarkItem.addEventListener('click', () => {
        this.player.setCurrentTime(currentTime);
      });
      bookmarksList.appendChild(bookmarkItem);
    }
  }

  /**
   * 切换弹幕
   */
  private toggleDanmaku(enabled: boolean): void {
    this.danmakuEnabled = enabled;
    const danmakuContainer = document.getElementById('danmaku-container');
    if (danmakuContainer) {
      danmakuContainer.style.display = enabled ? 'block' : 'none';
    }
  }

  /**
   * 跳过时间
   */
  private skipTime(seconds: number): void {
    const currentTime = this.player.getCurrentTime();
    this.player.setCurrentTime(currentTime + seconds);
  }

  /**
   * 改变音量
   */
  private changeVolume(delta: number): void {
    const currentVolume = this.player.getVolume();
    const newVolume = Math.max(0, Math.min(1, currentVolume + delta));
    this.player.setVolume(newVolume);
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<ControlBarConfig>): void {
    this.config = { ...this.config, ...config };
    // 重新创建UI
    this.destroy();
    this.createUI();
    this.setupEventListeners();
  }

  /**
   * 更新主题
   */
  updateTheme(theme: Partial<PlayerTheme>): void {
    this.theme = { ...this.theme, ...theme };
    // 重新创建UI
    this.destroy();
    this.createUI();
    this.setupEventListeners();
  }

  /**
   * 销毁UI
   */
  destroy(): void {
    if (this.isDestroyed) return;
    
    this.isDestroyed = true;
    
    // 清理UI元素
    if (this.controlBar && this.controlBar.parentNode) {
      this.controlBar.parentNode.removeChild(this.controlBar);
    }
    
    const playOverlay = this.container.querySelector('.ebin-play-overlay');
    if (playOverlay && playOverlay.parentNode) {
      playOverlay.parentNode.removeChild(playOverlay);
    }
  }
}
