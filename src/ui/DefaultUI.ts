/**
 * 默认UI组件
 * 提供一套通用的UI渲染，支持自定义渲染
 */
import { PlayerInstance, PlayerState, UIComponent, ControlBarConfig, PlayerTheme } from '../types';

export class DefaultUI {
  name = 'defaultUI';
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
      playbackRateControl: false,
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
  }

  /**
   * 创建控制栏
   */
  private createControlBar(): void {
    this.controlBar = document.createElement('div');
    this.controlBar.className = 'ebin-control-bar';
    this.controlBar.style.height = `${this.theme.controlBarHeight || 50}px`;
    this.controlBar.style.backgroundColor = this.theme.backgroundColor || 'rgba(0, 0, 0, 0.8)';

    // 播放/暂停按钮
    if (this.config.playButton) {
      this.createPlayButton();
    }

    // 时间显示优先于进度条（显示在进度条上方）
    if (this.config.timeDisplay) {
      this.createTimeDisplay();
    }

    // 进度条
    if (this.config.progressBar) {
      this.createProgressBar();
    }

    // 音量控制
    if (this.config.volumeControl) {
      this.createVolumeControl();
    }

    // 全屏按钮
    if (this.config.fullscreenButton) {
      this.createFullscreenButton();
    }

    // 自定义按钮
    if (this.config.customButtons) {
      this.config.customButtons.forEach(button => {
        try {
          const buttonElement = button.render(this.controlBar, this.player);
          if (buttonElement && buttonElement instanceof HTMLElement) {
            this.controlBar.appendChild(buttonElement);
          }
        } catch (error) {
          console.warn('自定义按钮渲染失败:', error);
        }
      });
    }

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

    this.controlBar.appendChild(this.playButton);
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

    // 插入到进度条上方（若进度条已存在则插入其前，否则追加到控制栏）
    const progressContainer = this.controlBar.querySelector('.ebin-progress-container');
    if (progressContainer && progressContainer.parentElement === this.controlBar) {
      this.controlBar.insertBefore(this.timeDisplay, progressContainer);
    } else {
      this.controlBar.appendChild(this.timeDisplay);
    }
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
    this.controlBar.appendChild(this.volumeControl);
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

    this.controlBar.appendChild(this.fullscreenButton);
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
    
    // 清理事件监听器
    // 注意：这里简化处理，实际使用中应该保存事件监听器的引用以便清理
    
    // 清理UI元素
    if (this.controlBar && this.controlBar.parentNode) {
      this.controlBar.parentNode.removeChild(this.controlBar);
    }
    
    const playOverlay = this.container.querySelector('.ebin-player-play-overlay');
    if (playOverlay && playOverlay.parentNode) {
      playOverlay.parentNode.removeChild(playOverlay);
    }
  }
}
