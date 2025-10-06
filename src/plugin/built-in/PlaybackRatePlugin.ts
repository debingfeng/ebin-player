/**
 * 播放速度控制插件
 * 提供播放速度调节功能
 */
import { Plugin, PlayerInstance, PlayerEventType, PlayerEvent } from '../../types';

export class PlaybackRatePlugin implements Plugin {
  name = 'playbackRate';
  version = '1.0.0';
  
  private player!: PlayerInstance;
  private container!: HTMLElement;
  private rateSelect!: HTMLSelectElement;
  private isDestroyed = false;

  // 预定义的播放速度选项
  private rateOptions = [
    { value: 0.25, label: '0.25x' },
    { value: 0.5, label: '0.5x' },
    { value: 0.75, label: '0.75x' },
    { value: 1, label: '1x' },
    { value: 1.25, label: '1.25x' },
    { value: 1.5, label: '1.5x' },
    { value: 1.75, label: '1.75x' },
    { value: 2, label: '2x' }
  ];

  apply(player: PlayerInstance): void {
    this.player = player;
    this.createUI();
    this.setupEventListeners();
  }

  /**
   * 创建播放速度控制UI
   */
  private createUI(): void {
    const container = this.player.getContainer();
    
    // 创建控制容器
    this.container = document.createElement('div');
    this.container.className = 'ebin-player-playback-rate';
    this.container.style.cssText = `
      position: absolute;
      bottom: 10px;
      right: 10px;
      z-index: 1000;
      background: rgba(0, 0, 0, 0.8);
      border-radius: 4px;
      padding: 5px;
      display: none;
    `;

    // 创建选择器
    this.rateSelect = document.createElement('select');
    this.rateSelect.style.cssText = `
      background: transparent;
      color: white;
      border: 1px solid #666;
      border-radius: 3px;
      padding: 2px 5px;
      font-size: 12px;
      outline: none;
    `;

    // 添加选项
    this.rateOptions.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option.value.toString();
      optionElement.textContent = option.label;
      this.rateSelect.appendChild(optionElement);
    });

    // 设置当前播放速度
    this.updateCurrentRate();

    this.container.appendChild(this.rateSelect);
    container.appendChild(this.container);
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 监听播放速度变化
    this.rateSelect.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      const rate = parseFloat(target.value);
      this.player.setPlaybackRate(rate);
    });

    // 监听播放器状态变化
    this.player.on('ratechange', () => {
      this.updateCurrentRate();
    });

    // 监听鼠标悬停显示/隐藏控制
    const videoContainer = this.player.getContainer();
    videoContainer.addEventListener('mouseenter', () => {
      this.showControls();
    });

    videoContainer.addEventListener('mouseleave', () => {
      this.hideControls();
    });
  }

  /**
   * 更新当前播放速度显示
   */
  private updateCurrentRate(): void {
    if (this.isDestroyed) return;
    
    const currentRate = this.player.getPlaybackRate();
    this.rateSelect.value = currentRate.toString();
  }

  /**
   * 显示控制
   */
  private showControls(): void {
    if (this.isDestroyed) return;
    this.container.style.display = 'block';
  }

  /**
   * 隐藏控制
   */
  private hideControls(): void {
    if (this.isDestroyed) return;
    this.container.style.display = 'none';
  }

  /**
   * 设置播放速度选项
   */
  setRateOptions(options: Array<{ value: number; label: string }>): void {
    if (this.isDestroyed) return;
    
    this.rateOptions = options;
    
    // 清空现有选项
    this.rateSelect.innerHTML = '';
    
    // 添加新选项
    options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option.value.toString();
      optionElement.textContent = option.label;
      this.rateSelect.appendChild(optionElement);
    });
    
    // 更新当前播放速度
    this.updateCurrentRate();
  }

  /**
   * 获取当前播放速度选项
   */
  getRateOptions(): Array<{ value: number; label: string }> {
    return [...this.rateOptions];
  }

  /**
   * 设置播放速度
   */
  setRate(rate: number): void {
    if (this.isDestroyed) return;
    
    // 检查速率是否在选项中
    const validRate = this.rateOptions.find(option => option.value === rate);
    if (validRate) {
      this.player.setPlaybackRate(rate);
    } else {
      console.warn(`播放速度 ${rate} 不在预定义选项中`);
    }
  }

  /**
   * 获取当前播放速度
   */
  getCurrentRate(): number {
    return this.player.getPlaybackRate();
  }

  /**
   * 销毁插件
   */
  destroy(): void {
    if (this.isDestroyed) return;
    
    this.isDestroyed = true;
    
    // 移除UI元素
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    
    // 清理引用
    this.player = null as any;
    this.container = null as any;
    this.rateSelect = null as any;
  }
}
