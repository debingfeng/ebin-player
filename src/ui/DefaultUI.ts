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
    this.container.style.cssText = `
      position: relative;
      width: 100%;
      height: 100%;
      background: #000;
      font-family: ${this.theme.fontFamily};
    `;

    // 创建控制栏
    this.createControlBar();
    
    // 创建播放按钮覆盖层
    this.createPlayButtonOverlay();
  }

  /**
   * 创建控制栏
   */
  private createControlBar(): void {
    this.controlBar = document.createElement('div');
    this.controlBar.className = 'ebin-player-control-bar';
    this.controlBar.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: ${this.theme.controlBarHeight}px;
      background: ${this.theme.backgroundColor};
      display: flex;
      align-items: center;
      padding: 0 10px;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    // 播放/暂停按钮
    if (this.config.playButton) {
      this.createPlayButton();
    }

    // 进度条
    if (this.config.progressBar) {
      this.createProgressBar();
    }

    // 时间显示
    if (this.config.timeDisplay) {
      this.createTimeDisplay();
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
    this.playButton.className = 'ebin-player-play-button';
    this.playButton.innerHTML = '▶';
    this.playButton.style.cssText = `
      background: none;
      border: none;
      color: ${this.theme.textColor};
      font-size: 18px;
      cursor: pointer;
      padding: 5px;
      margin-right: 10px;
      outline: none;
    `;

    this.controlBar.appendChild(this.playButton);
  }

  /**
   * 创建进度条
   */
  private createProgressBar(): void {
    const progressContainer = document.createElement('div');
    progressContainer.style.cssText = `
      flex: 1;
      height: 4px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 2px;
      margin: 0 10px;
      position: relative;
      cursor: pointer;
    `;

    this.progressBar = document.createElement('div');
    this.progressBar.className = 'ebin-player-progress-bar';
    this.progressBar.style.cssText = `
      height: 100%;
      background: ${this.theme.primaryColor};
      border-radius: 2px;
      width: 0%;
      transition: width 0.1s ease;
    `;

    progressContainer.appendChild(this.progressBar);
    this.controlBar.appendChild(progressContainer);
  }

  /**
   * 创建时间显示
   */
  private createTimeDisplay(): void {
    this.timeDisplay = document.createElement('div');
    this.timeDisplay.className = 'ebin-player-time-display';
    this.timeDisplay.style.cssText = `
      color: ${this.theme.textColor};
      font-size: 12px;
      margin-left: 10px;
      white-space: nowrap;
    `;

    this.controlBar.appendChild(this.timeDisplay);
  }

  /**
   * 创建音量控制
   */
  private createVolumeControl(): void {
    this.volumeControl = document.createElement('div');
    this.volumeControl.className = 'ebin-player-volume-control';
    this.volumeControl.style.cssText = `
      display: flex;
      align-items: center;
      margin-left: 10px;
    `;

    const volumeButton = document.createElement('button');
    volumeButton.innerHTML = '🔊';
    volumeButton.style.cssText = `
      background: none;
      border: none;
      color: ${this.theme.textColor};
      font-size: 16px;
      cursor: pointer;
      padding: 5px;
      outline: none;
    `;

    const volumeSlider = document.createElement('input');
    volumeSlider.type = 'range';
    volumeSlider.min = '0';
    volumeSlider.max = '1';
    volumeSlider.step = '0.1';
    volumeSlider.style.cssText = `
      width: 60px;
      margin-left: 5px;
    `;

    this.volumeControl.appendChild(volumeButton);
    this.volumeControl.appendChild(volumeSlider);
    this.controlBar.appendChild(this.volumeControl);
  }

  /**
   * 创建全屏按钮
   */
  private createFullscreenButton(): void {
    this.fullscreenButton = document.createElement('button');
    this.fullscreenButton.className = 'ebin-player-fullscreen-button';
    this.fullscreenButton.innerHTML = '⛶';
    this.fullscreenButton.style.cssText = `
      background: none;
      border: none;
      color: ${this.theme.textColor};
      font-size: 16px;
      cursor: pointer;
      padding: 5px;
      margin-left: 10px;
      outline: none;
    `;

    this.controlBar.appendChild(this.fullscreenButton);
  }

  /**
   * 创建播放按钮覆盖层
   */
  private createPlayButtonOverlay(): void {
    const overlay = document.createElement('div');
    overlay.className = 'ebin-player-play-overlay';
    overlay.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80px;
      height: 80px;
      background: ${this.theme.backgroundColor};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 100;
    `;

    const playIcon = document.createElement('div');
    playIcon.innerHTML = '▶';
    playIcon.style.cssText = `
      color: ${this.theme.textColor};
      font-size: 32px;
      margin-left: 4px;
    `;

    overlay.appendChild(playIcon);
    this.container.appendChild(overlay);
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
      this.controlBar.style.opacity = '1';
    }
  }

  /**
   * 隐藏控制栏
   */
  private hideControlBar(): void {
    if (this.controlBar) {
      this.controlBar.style.opacity = '0';
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
