/**
 * 播放/暂停按钮组件
 */
import { BaseComponent, ComponentConfig, ComponentTheme } from './BaseComponent';
import { PlayerInstance, PlayerState, Logger } from '../../types';

export interface PlayButtonConfig extends ComponentConfig {
  showOverlay?: boolean;
  overlaySize?: number;
  iconSize?: number;
}

export class PlayButton extends BaseComponent {
  private overlayElement: HTMLElement | null = null;
  private buttonElement: HTMLElement | null = null;

  constructor(
    player: PlayerInstance,
    container: HTMLElement,
    config: PlayButtonConfig,
    theme: ComponentTheme = {},
    logger: Logger
  ) {
    super(player, container, config, theme, logger);
  }

  protected async createElement(): Promise<void> {
    // 创建控制栏中的播放按钮
    this.buttonElement = document.createElement('button');
    this.buttonElement.className = 'ebin-play-button';
    this.buttonElement.innerHTML = '▶';
    this.buttonElement.setAttribute('aria-label', '播放/暂停');
    this.buttonElement.setAttribute('type', 'button');
    
    this.applyTheme();
    this.element = this.buttonElement;

    // 创建播放覆盖层（如果启用）
    if ((this.config as PlayButtonConfig).showOverlay) {
      this.createOverlay();
    }
  }

  private createOverlay(): void {
    const config = this.config as PlayButtonConfig;
    const overlaySize = config.overlaySize || 80;
    const iconSize = config.iconSize || 30;

    this.overlayElement = document.createElement('div');
    this.overlayElement.className = 'ebin-play-overlay';
    this.overlayElement.setAttribute('aria-label', '播放视频');
    this.overlayElement.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: ${overlaySize}px;
      height: ${overlaySize}px;
      background-color: rgba(0, 0, 0, 0.8);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
      z-index: 50;
      pointer-events: none;
    `;

    const playIcon = document.createElement('div');
    playIcon.className = 'ebin-play-overlay-icon';
    playIcon.innerHTML = '▶';
    playIcon.style.cssText = `
      color: var(--text-color, #ffffff);
      font-size: ${iconSize}px;
      margin-left: 4px;
    `;

    this.overlayElement.appendChild(playIcon);
    
    // 将覆盖层添加到视频容器而不是控制栏
    const videoContainer = this.player.getVideoElement()?.parentElement;
    if (videoContainer) {
      videoContainer.appendChild(this.overlayElement);
    } else {
      // 如果找不到视频容器，添加到播放器容器
      const playerContainer = this.container.closest('.ebin-player') || this.container.parentElement;
      if (playerContainer) {
        playerContainer.appendChild(this.overlayElement);
      }
    }
  }

  protected setupEventListeners(): void {
    if (this.buttonElement) {
      this.addEventListener(this.buttonElement, 'click', () => {
        this.logger.debug('Play button clicked');
        this.togglePlayPause();
      });
    }

    if (this.overlayElement) {
      this.addEventListener(this.overlayElement, 'click', () => {
        this.logger.debug('Play overlay clicked');
        this.togglePlayPause();
      });
    }

    // 键盘快捷键
    this.addEventListener(document.body, 'keydown', (e) => {
      const keyboardEvent = e as KeyboardEvent;
      if (keyboardEvent.code === 'Space' || keyboardEvent.code === 'Enter') {
        e.preventDefault();
        this.togglePlayPause();
      }
    });
  }

  private togglePlayPause(): void {
    try {
      if (this.player.getPaused()) {
        this.player.play();
      } else {
        this.player.pause();
      }
    } catch (error) {
      this.logger.error('Failed to toggle play/pause', error);
    }
  }

  protected onStateUpdate(state: PlayerState): void {
    if (!this.buttonElement) return;

    // 更新按钮图标
    this.buttonElement.innerHTML = state.paused ? '▶' : '⏸';
    
    // 更新按钮状态
    this.buttonElement.setAttribute('aria-pressed', state.paused ? 'false' : 'true');

    // 更新覆盖层显示状态
    if (this.overlayElement) {
      const shouldShow = state.paused && !state.ended;
      this.overlayElement.style.opacity = shouldShow ? '1' : '0';
      this.overlayElement.style.pointerEvents = shouldShow ? 'auto' : 'none';
      this.overlayElement.classList.toggle('visible', shouldShow);
      
      this.logger.debug('Overlay visibility updated', { 
        shouldShow, 
        paused: state.paused, 
        ended: state.ended,
        opacity: this.overlayElement.style.opacity
      });
    }
  }

  protected getThemeStyles(): Record<string, string> {
    return {
      ...super.getThemeStyles(),
      '--button-size': '2.5rem',
      '--icon-size': '1.125rem',
    };
  }

  protected applyTheme(): void {
    if (!this.buttonElement) return;

    const styles = this.getThemeStyles();
    this.buttonElement.style.cssText = `
      background: transparent;
      border: none;
      color: var(--text-color, #ffffff);
      font-size: var(--icon-size, 1.125rem);
      cursor: pointer;
      padding: 0.5rem;
      margin-right: 0.75rem;
      outline: none;
      border-radius: var(--border-radius, 4px);
      transition: background-color 0.2s ease-in-out;
      width: var(--button-size, 2.5rem);
      height: var(--button-size, 2.5rem);
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // 悬停效果
    this.buttonElement.addEventListener('mouseenter', () => {
      this.buttonElement!.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    });

    this.buttonElement.addEventListener('mouseleave', () => {
      this.buttonElement!.style.backgroundColor = 'transparent';
    });

    // 焦点效果
    this.buttonElement.addEventListener('focus', () => {
      this.buttonElement!.style.outline = '2px solid var(--primary-color, #3b82f6)';
      this.buttonElement!.style.outlineOffset = '2px';
    });

    this.buttonElement.addEventListener('blur', () => {
      this.buttonElement!.style.outline = 'none';
    });
  }

  destroy(): void {
    if (this.overlayElement && this.overlayElement.parentNode) {
      this.overlayElement.parentNode.removeChild(this.overlayElement);
    }
    this.overlayElement = null;
    super.destroy();
  }
}
