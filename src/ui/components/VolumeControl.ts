/**
 * 音量控制组件
 */
import { BaseComponent, ComponentConfig, ComponentTheme } from './BaseComponent';
import { PlayerInstance, PlayerState, Logger } from '../../types';

export interface VolumeControlConfig extends ComponentConfig {
  showSlider?: boolean;
  showButton?: boolean;
  sliderWidth?: number;
  sliderHeight?: number;
  keyboardControl?: boolean;
  volumeStep?: number;
}

export class VolumeControl extends BaseComponent {
  private volumeButton: HTMLElement | null = null;
  private volumeSlider: HTMLInputElement | null = null;
  private volumeContainer: HTMLElement | null = null;
  private isSliderVisible = false;
  private previousVolume = 1; // 用于静音恢复
  private isDragging = false;
  private dragStartY = 0;
  private dragStartVolume = 0;

  constructor(
    player: PlayerInstance,
    container: HTMLElement,
    config: VolumeControlConfig,
    theme: ComponentTheme = {},
    logger: Logger
  ) {
    super(player, container, config, theme, logger);
  }

  protected async createElement(): Promise<void> {
    const config = this.config as VolumeControlConfig;
    
    // 创建音量控制容器
    this.volumeContainer = document.createElement('div');
    this.volumeContainer.className = 'ebin-volume-control';
    this.volumeContainer.style.cssText = `
      display: flex;
      align-items: center;
      margin-left: 0.75rem;
      position: relative;
    `;

    // 创建音量按钮
    if (config.showButton !== false) {
      this.volumeButton = document.createElement('button');
      this.volumeButton.className = 'ebin-volume-button';
      this.volumeButton.innerHTML = '🔊';
      this.volumeButton.setAttribute('aria-label', '静音/取消静音');
      this.volumeButton.setAttribute('type', 'button');
      this.volumeContainer.appendChild(this.volumeButton);
    }

    // 创建音量滑块
    if (config.showSlider !== false) {
      this.volumeSlider = document.createElement('input');
      this.volumeSlider.className = 'ebin-volume-slider';
      this.volumeSlider.type = 'range';
      this.volumeSlider.min = '0';
      this.volumeSlider.max = '1';
      this.volumeSlider.step = '0.1';
      this.volumeSlider.setAttribute('aria-label', '音量调节');
      // 垂直样式：显示在按钮上方，向上增加，向下降低
      const sliderHeight = config.sliderHeight || 100;
      const sliderWidth = config.sliderWidth || 24;
      this.volumeSlider.style.cssText = `
        position: absolute;
        bottom: calc(100% + 40px);
        left: 50%;
        transform: rotate(-90deg);
        transform-origin: center;
        height: ${sliderWidth}px;
        width: ${sliderHeight}px;
        accent-color: var(--primary-color, #3b82f6);
        background: transparent;
        outline: none;
        transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
        opacity: 0;
        pointer-events: none;
        z-index: 20;
        cursor: pointer;
        border-radius: 4px;
      `;
      this.volumeContainer.appendChild(this.volumeSlider);
    }

    this.applyTheme();
    this.element = this.volumeContainer;
    
    // 确保滑块位置正确
    this.adjustSliderPosition();
  }

  protected setupEventListeners(): void {
    const config = this.config as VolumeControlConfig;

    // 音量按钮点击
    if (this.volumeButton) {
      this.addEventListener(this.volumeButton, 'click', () => {
        this.logger.debug('Volume button clicked');
        this.toggleMute();
      });

      // 悬停或聚焦显示滑块
      this.addEventListener(this.volumeButton, 'mouseenter', () => {
        this.showSlider();
      });
      this.addEventListener(this.volumeButton, 'focus', () => {
        this.showSlider();
      });
      this.addEventListener(this.volumeContainer as HTMLElement, 'mouseleave', () => {
        this.hideSlider();
      });
    }

    // 音量滑块
    if (this.volumeSlider) {
      this.addEventListener(this.volumeSlider, 'input', (e) => {
        const target = e.target as HTMLInputElement;
        const volume = parseFloat(target.value);
        this.logger.debug('Volume changed', { volume });
        // 旋转后的滑块：向上拖动增加音量
        this.player.setVolume(volume);
        if (volume > 0 && this.player.getMuted()) {
          this.player.setMuted(false);
        }
      });

      this.addEventListener(this.volumeSlider, 'change', (e) => {
        const target = e.target as HTMLInputElement;
        const volume = parseFloat(target.value);
        this.logger.debug('Volume set', { volume });
        this.player.setVolume(volume);
      });
      
      // 鼠标事件处理
      this.addEventListener(this.volumeSlider, 'mousedown', (e) => {
        this.startDrag(e as MouseEvent);
        this.showSlider();
      });
      
      this.addEventListener(this.volumeSlider, 'mouseenter', () => this.showSlider());
      this.addEventListener(this.volumeSlider, 'mouseleave', () => {
        if (!this.isDragging) {
          this.hideSlider();
        }
      });
      
      // 触摸事件支持
      this.addEventListener(this.volumeSlider, 'touchstart', (e) => {
        this.startDrag((e as TouchEvent).touches[0]);
        this.showSlider();
      });
      
      // 全局鼠标/触摸事件
      this.addEventListener(document.body as HTMLElement, 'mousemove', (e) => {
        if (this.isDragging) {
          this.handleDrag(e as MouseEvent);
        }
      });
      
      this.addEventListener(document.body as HTMLElement, 'mouseup', () => {
        if (this.isDragging) {
          this.endDrag();
        }
      });
      
      this.addEventListener(document.body as HTMLElement, 'touchmove', (e) => {
        if (this.isDragging) {
          (e as Event).preventDefault();
          this.handleDrag((e as TouchEvent).touches[0]);
        }
      });
      
      this.addEventListener(document.body as HTMLElement, 'touchend', () => {
        if (this.isDragging) {
          this.endDrag();
        }
      });

      // 视口变化时重新计算位置
      this.addEventListener(window as unknown as HTMLElement, 'resize', () => this.adjustSliderPosition());
      this.addEventListener(window as unknown as HTMLElement, 'scroll', () => this.adjustSliderPosition());
    }

    // 容器滚轮控制（向上增加，向下降低）
    if (this.volumeContainer) {
      this.addEventListener(this.volumeContainer as HTMLElement, 'wheel', (e) => {
        const we = e as WheelEvent;
        we.preventDefault();
        const step = config.volumeStep || 0.1;
        const current = this.player.getVolume();
        const next = we.deltaY < 0 ? Math.min(1, current + step) : Math.max(0, current - step);
        this.logger.debug('Wheel volume change', { from: current, to: next });
        this.player.setVolume(next);
        if (next > 0 && this.player.getMuted()) this.player.setMuted(false);
        if (this.volumeSlider) this.volumeSlider.value = String(next);
        this.showSlider();
      }, { passive: false } as any);
    }

    // 键盘控制
    if (config.keyboardControl) {
      this.addEventListener(document.body as HTMLElement, 'keydown', (e) => {
        this.handleKeyboardControl(e as KeyboardEvent);
      });
    }
  }

  private toggleMute(): void {
    try {
      const isMuted = this.player.getMuted();
      const currentVolume = this.player.getVolume();

      if (!isMuted && currentVolume > 0) {
        // 进入静音：记录当前音量并将音量设为0
        this.previousVolume = currentVolume;
        this.player.setMuted(true);
        this.player.setVolume(0);
        this.logger.debug('Muted, volume set to 0', { previousVolume: this.previousVolume });
      } else {
        // 取消静音：恢复到之前音量（至少0.5作为默认）
        const restored = this.previousVolume > 0 ? this.previousVolume : 0.5;
        this.player.setMuted(false);
        this.player.setVolume(restored);
        this.logger.debug('Unmuted, volume restored', { restored });
      }
    } catch (error) {
      this.logger.error('Failed to toggle mute', error);
    }
  }

  private showSlider(): void {
    if (this.volumeSlider && !this.isSliderVisible) {
      // 重新调整位置
      this.adjustSliderPosition();
      
      this.volumeSlider.style.opacity = '1';
      this.volumeSlider.style.pointerEvents = 'auto';
      this.isSliderVisible = true;
    }
  }

  private hideSlider(): void {
    if (this.volumeSlider && this.isSliderVisible) {
      this.volumeSlider.style.opacity = '0';
      this.volumeSlider.style.pointerEvents = 'none';
      this.isSliderVisible = false;
    }
  }

  private startDrag(e: MouseEvent | Touch): void {
    this.isDragging = true;
    this.dragStartY = e.clientY;
    this.dragStartVolume = this.player.getVolume();
    this.logger.debug('Volume drag started', { startY: this.dragStartY, startVolume: this.dragStartVolume });
  }

  private handleDrag(e: MouseEvent | Touch): void {
    if (!this.volumeSlider || !this.isDragging) return;

    const deltaY = this.dragStartY - e.clientY; // 向上为正，向下为负
    const sliderHeight = (this.config as VolumeControlConfig).sliderHeight || 100;
    const volumeChange = deltaY / sliderHeight; // 根据滑块高度计算音量变化
    const newVolume = Math.max(0, Math.min(1, this.dragStartVolume + volumeChange));
    
    this.logger.debug('Volume dragging', { deltaY, volumeChange, newVolume });
    
    // 更新滑块值
    this.volumeSlider.value = newVolume.toString();
    
    // 更新播放器音量
    this.player.setVolume(newVolume);
    if (newVolume > 0 && this.player.getMuted()) {
      this.player.setMuted(false);
    }
  }

  private endDrag(): void {
    if (this.isDragging) {
      this.isDragging = false;
      this.logger.debug('Volume drag ended');
      
      // 如果不在滑块上，隐藏滑块
      if (!this.volumeContainer?.matches(':hover')) {
        this.hideSlider();
      }
    }
  }

  private adjustSliderPosition(): void {
    if (!this.volumeSlider || !this.volumeButton || !this.volumeContainer) return;

    const slider = this.volumeSlider;
    const button = this.volumeButton;
    const container = this.volumeContainer;
    
    // 等待DOM渲染完成
    setTimeout(() => {
      const buttonRect = button.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const containerStyle = window.getComputedStyle(container);
      const paddingLeft = parseFloat(containerStyle.paddingLeft || '0') || 0;
      
      // 计算按钮中心相对于容器的位置
      const buttonCenterX = buttonRect.left + buttonRect.width / 2 - containerRect.left - paddingLeft;
      
      // 调整滑块位置，确保在按钮正上方居中
      const halfSliderWidth = slider.offsetWidth / 2; // 旋转后视觉宽度即为元素的 offsetWidth
      slider.style.left = `${buttonCenterX - halfSliderWidth}px`;
      slider.style.transform = 'rotate(-90deg)';
      
      this.logger.debug('Slider position adjusted', {
        buttonCenterX,
        paddingLeft,
        halfSliderWidth,
        sliderLeft: slider.style.left
      });
    }, 0);
  }

  private handleKeyboardControl(e: KeyboardEvent): void {
    const config = this.config as VolumeControlConfig;
    const volumeStep = config.volumeStep || 0.1;
    const currentVolume = this.player.getVolume();

    let newVolume = currentVolume;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        newVolume = Math.min(1, currentVolume + volumeStep);
        break;
      case 'ArrowDown':
        e.preventDefault();
        newVolume = Math.max(0, currentVolume - volumeStep);
        break;
      case 'm':
      case 'M':
        e.preventDefault();
        this.toggleMute();
        return;
      default:
        return;
    }

    this.logger.debug('Keyboard volume change', { from: currentVolume, to: newVolume });
    this.player.setVolume(newVolume);
  }

  protected onStateUpdate(state: PlayerState): void {
    // 更新音量按钮图标
    if (this.volumeButton) {
      const icon = (state.muted || state.volume === 0) ? '🔇' : this.getVolumeIcon(state.volume);
      this.volumeButton.innerHTML = icon;
      this.volumeButton.setAttribute('aria-pressed', state.muted ? 'true' : 'false');
    }

    // 更新音量滑块
    if (this.volumeSlider) {
      this.volumeSlider.value = (state.muted ? 0 : state.volume).toString();
    }
  }

  private getVolumeIcon(volume: number): string {
    if (volume === 0) return '🔇';
    if (volume < 0.3) return '🔈';
    if (volume < 0.7) return '🔉';
    return '🔊';
  }

  protected getThemeStyles(): Record<string, string> {
    return {
      ...super.getThemeStyles(),
      '--button-size': '2rem',
      '--slider-height': '0.25rem',
    };
  }

  protected applyTheme(): void {
    if (!this.volumeButton) return;

    const styles = this.getThemeStyles();
    
    this.volumeButton.style.cssText = `
      background: transparent;
      border: none;
      color: var(--text-color, #ffffff);
      font-size: 1rem;
      cursor: pointer;
      padding: 0.5rem;
      outline: none;
      border-radius: var(--border-radius, 4px);
      transition: background-color 0.2s ease-in-out;
      width: var(--button-size, 2rem);
      height: var(--button-size, 2rem);
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // 悬停效果
    this.volumeButton.addEventListener('mouseenter', () => {
      this.volumeButton!.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    });

    this.volumeButton.addEventListener('mouseleave', () => {
      this.volumeButton!.style.backgroundColor = 'transparent';
    });

    // 焦点效果
    this.volumeButton.addEventListener('focus', () => {
      this.volumeButton!.style.outline = '2px solid var(--primary-color, #3b82f6)';
      this.volumeButton!.style.outlineOffset = '2px';
    });

    this.volumeButton.addEventListener('blur', () => {
      this.volumeButton!.style.outline = 'none';
    });

    // 主题对滑块的附加效果由创建时样式控制
    this.element = this.volumeContainer;
  }
}
