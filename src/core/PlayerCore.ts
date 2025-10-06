/**
 * 播放器核心类
 * 负责播放器内核能力封装、API差异抹平、生命周期管理
 */
import { PlayerOptions, PlayerState, PlayerEventType, PlayerEvent, PlayerLifecycle, UIMode, ControlBarConfig, PlayerTheme, EventPayloadMap, PlayerEventBase } from '../types';
import { DefaultUI } from '../ui/DefaultUI';
import { AdvancedUI } from '../ui/AdvancedUI';
import { Logger as CoreLogger } from './Logger';
import type { Logger as LoggerType } from '../types';
import { logMethod } from './decorators';

export class PlayerCore {
  private videoElement!: HTMLVideoElement;
  private container: HTMLElement;
  private options: PlayerOptions;
  private lifecycle: PlayerLifecycle = PlayerLifecycle.INITIALIZING;
  private eventListeners: Map<PlayerEventType, Set<(event: PlayerEvent) => void>> = new Map();
  private state: PlayerState;
  private isDestroyed = false;
  private defaultUI: DefaultUI | null = null;
  private advancedUI: AdvancedUI | null = null;
  private uiMode: UIMode;
  // 保存外部暴露的 PlayerInstance 引用，供 UI 使用
  private externalPlayer: any | null = null;
  private logger: LoggerType;

  constructor(container: HTMLElement, options: PlayerOptions) {
    this.container = container;
    this.options = options;
    this.state = this.createInitialState();
    this.logger = options?.logger || new CoreLogger('Core');

    
    // 确定UI模式
    this.uiMode = this.determineUIMode();
    
    this.initializeVideoElement();
    this.setupEventListeners();
    this.setupLifecycle();
    this.logger.info('initialized');
  }

  /**
   * 初始化视频元素
   */
  private initializeVideoElement(): void {
    this.logger.debug('initializeVideoElement');
    this.videoElement = document.createElement('video');
    this.videoElement.style.width = '100%';
    this.videoElement.style.height = '100%';
    this.videoElement.style.objectFit = 'contain';
    
    // 设置基础属性
    this.videoElement.src = this.options.src;
    this.videoElement.autoplay = this.options.autoplay || false;
    this.videoElement.muted = this.options.muted || false;
    this.videoElement.volume = this.options.volume || 1;
    this.videoElement.playbackRate = this.options.playbackRate || 1;
    this.videoElement.controls = this.uiMode === UIMode.NATIVE; // 只有原生模式才显示控制条
    this.videoElement.loop = this.options.loop || false;
    this.videoElement.preload = this.options.preload || 'metadata';
    this.videoElement.playsInline = this.options.playsInline !== false;
    
    if (this.options.poster) {
      this.videoElement.poster = this.options.poster;
    }
    
    if (this.options.crossOrigin) {
      this.videoElement.crossOrigin = this.options.crossOrigin;
    }
    
    // 设置容器尺寸
    if (this.options.width) {
      this.container.style.width = typeof this.options.width === 'number' 
        ? `${this.options.width}px` 
        : this.options.width;
    }
    
    if (this.options.height) {
      this.container.style.height = typeof this.options.height === 'number' 
        ? `${this.options.height}px` 
        : this.options.height;
    }
    
    this.container.appendChild(this.videoElement);
    this.logger.debug('video element appended');
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    this.logger.debug('setupEventListeners');
    const mediaEvents: PlayerEventType[] = [
      'loadstart', 'loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough',
      'play', 'pause', 'ended', 'error', 'timeupdate', 'volumechange', 'ratechange',
      'seeking', 'seeked', 'waiting', 'stalled', 'progress', 'durationchange'
    ];

    mediaEvents.forEach(eventType => {
      this.videoElement.addEventListener(eventType, (event) => {
        this.handleMediaEvent(eventType, event);
      });
    });

    // 监听全屏变化
    document.addEventListener('fullscreenchange', () => {
      this.emit('fullscreenchange', { isFullscreen: this.isFullscreen() });
      this.logger.debug('fullscreenchange', { isFullscreen: this.isFullscreen() });
    });

    // 监听画中画变化
    this.videoElement.addEventListener('enterpictureinpicture', () => {
      this.emit('enterpictureinpicture', {});
    });

    this.videoElement.addEventListener('leavepictureinpicture', () => {
      this.emit('leavepictureinpicture', {});
    });
  }

  /**
   * 处理媒体事件
   */
  private handleMediaEvent(eventType: PlayerEventType, event: Event): void {
    this.updateState();
    this.emit(eventType, event);
    if (eventType === 'error') {
      this.logger.error('media error', this.videoElement.error);
    } else {
      this.logger.debug('media event', eventType, {
        currentTime: this.videoElement.currentTime,
        duration: this.videoElement.duration,
        paused: this.videoElement.paused
      });
    }
  }

  /**
   * 设置生命周期管理
   */
  private setupLifecycle(): void {
    this.videoElement.addEventListener('loadstart', () => {
      this.setLifecycle(PlayerLifecycle.INITIALIZING);
      this.logger.debug('lifecycle', 'INITIALIZING');
    });

    this.videoElement.addEventListener('canplay', () => {
      this.setLifecycle(PlayerLifecycle.READY);
      this.logger.debug('lifecycle', 'READY');
    });

    this.videoElement.addEventListener('play', () => {
      this.setLifecycle(PlayerLifecycle.PLAYING);
      this.logger.debug('lifecycle', 'PLAYING');
    });

    this.videoElement.addEventListener('pause', () => {
      this.setLifecycle(PlayerLifecycle.PAUSED);
      this.logger.debug('lifecycle', 'PAUSED');
    });

    this.videoElement.addEventListener('ended', () => {
      this.setLifecycle(PlayerLifecycle.ENDED);
      this.logger.debug('lifecycle', 'ENDED');
    });

    this.videoElement.addEventListener('error', () => {
      this.setLifecycle(PlayerLifecycle.ERROR);
      this.logger.error('lifecycle', 'ERROR', this.videoElement.error);
    });
  }

  /**
   * 创建初始状态
   */
  private createInitialState(): PlayerState {
    return {
      src: this.options.src,
      currentTime: 0,
      duration: 0,
      paused: true,
      muted: this.options.muted || false,
      volume: this.options.volume || 1,
      playbackRate: this.options.playbackRate || 1,
      readyState: 0,
      networkState: 0,
      error: null,
      ended: false,
      loading: false,
      seeking: false,
      videoWidth: 0,
      videoHeight: 0,
      buffered: null,
      seekable: null,
      quality: 'auto',
      bitrate: 0
    };
  }

  /**
   * 更新播放器状态
   */
  private updateState(): void {
    if (this.isDestroyed) return;

    this.state = {
      ...this.state,
      currentTime: this.videoElement.currentTime,
      duration: this.videoElement.duration || 0,
      paused: this.videoElement.paused,
      muted: this.videoElement.muted,
      volume: this.videoElement.volume,
      playbackRate: this.videoElement.playbackRate,
      readyState: this.videoElement.readyState,
      networkState: this.videoElement.networkState,
      error: this.videoElement.error,
      ended: this.videoElement.ended,
      loading: this.videoElement.readyState < 3,
      seeking: this.videoElement.seeking,
      videoWidth: this.videoElement.videoWidth,
      videoHeight: this.videoElement.videoHeight,
      buffered: this.videoElement.buffered,
      seekable: this.videoElement.seekable
    };
    this.logger.debug('state updated', {
      currentTime: this.state.currentTime,
      duration: this.state.duration,
      paused: this.state.paused
    });
  }

  /**
   * 设置生命周期状态
   */
  private setLifecycle(lifecycle: PlayerLifecycle): void {
    this.lifecycle = lifecycle;
  }

  /**
   * 播放视频
   */
  @logMethod({ includeArgs: false })
  async play(): Promise<void> {
    if (this.isDestroyed) return;
    
    try {
      this.logger.debug('video.play()');
      await this.videoElement.play();
    } catch (error) {
      console.error('播放失败:', error);
      this.logger.error('play failed', error);
      throw error;
    }
  }

  /**
   * 暂停视频
   */
  @logMethod({ includeArgs: false })
  pause(): void {
    if (this.isDestroyed) return;
    this.logger.debug('video.pause()');
    this.videoElement.pause();
  }

  /**
   * 加载视频
   */
  load(): void {
    if (this.isDestroyed) return;
    this.videoElement.load();
  }

  /**
   * 获取当前时间
   */
  getCurrentTime(): number {
    return this.videoElement.currentTime;
  }

  /**
   * 设置当前时间
   */
  setCurrentTime(time: number): void {
    if (this.isDestroyed) return;
    this.videoElement.currentTime = time;
  }

  /**
   * 获取时长
   */
  getDuration(): number {
    return this.videoElement.duration || 0;
  }

  /**
   * 获取音量
   */
  getVolume(): number {
    return this.videoElement.volume;
  }

  /**
   * 设置音量
   */
  setVolume(volume: number): void {
    if (this.isDestroyed) return;
    this.videoElement.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * 获取静音状态
   */
  getMuted(): boolean {
    return this.videoElement.muted;
  }

  /**
   * 设置静音状态
   */
  setMuted(muted: boolean): void {
    if (this.isDestroyed) return;
    this.videoElement.muted = muted;
  }

  /**
   * 获取播放速度
   */
  getPlaybackRate(): number {
    return this.videoElement.playbackRate;
  }

  /**
   * 设置播放速度
   */
  setPlaybackRate(rate: number): void {
    if (this.isDestroyed) return;
    this.videoElement.playbackRate = rate;
  }

  /**
   * 获取暂停状态
   */
  getPaused(): boolean {
    return this.videoElement.paused;
  }

  /**
   * 获取结束状态
   */
  getEnded(): boolean {
    return this.videoElement.ended;
  }

  /**
   * 获取就绪状态
   */
  getReadyState(): number {
    return this.videoElement.readyState;
  }

  /**
   * 获取网络状态
   */
  getNetworkState(): number {
    return this.videoElement.networkState;
  }

  /**
   * 获取错误信息
   */
  getError(): MediaError | null {
    return this.videoElement.error;
  }

  /**
   * 获取播放器状态
   */
  getState(): PlayerState {
    this.updateState();
    return { ...this.state };
  }

  /**
   * 设置播放器状态
   */
  setState(state: Partial<PlayerState>): void {
    if (this.isDestroyed) return;
    
    this.state = { ...this.state, ...state };
    this.logger.debug('setState', state);
    
    // 同步到视频元素
    if (state.volume !== undefined) {
      this.setVolume(state.volume);
    }
    if (state.muted !== undefined) {
      this.setMuted(state.muted);
    }
    if (state.playbackRate !== undefined) {
      this.setPlaybackRate(state.playbackRate);
    }
    if (state.currentTime !== undefined) {
      this.setCurrentTime(state.currentTime);
    }
  }

  /**
   * 事件监听
   */
  on<T extends PlayerEventType>(event: T, callback: (event: PlayerEventBase<T>) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback as any);
  }

  /**
   * 移除事件监听
   */
  off<T extends PlayerEventType>(event: T, callback: (event: PlayerEventBase<T>) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback as any);
    }
  }

  /**
   * 触发事件
   */
  emit<T extends PlayerEventType>(event: T, data?: EventPayloadMap[T]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const playerEvent: PlayerEventBase<T> = {
        type: event,
        target: this as any, // 这里会被PlayerInstance包装
        data,
        timestamp: Date.now()
      };
      
      (listeners as Set<(e: PlayerEventBase<T>) => void>).forEach(callback => {
        try {
          callback(playerEvent);
        } catch (error) {
          console.error(`事件处理器错误 (${event}):`, error);
        }
      });
    }
  }

  /**
   * 获取容器元素
   */
  getContainer(): HTMLElement {
    return this.container;
  }

  /**
   * 获取视频元素
   */
  getVideoElement(): HTMLVideoElement {
    return this.videoElement;
  }

  /**
   * 请求全屏
   */
  async requestFullscreen(): Promise<void> {
    if (this.isDestroyed) return;
    
    if (this.videoElement.requestFullscreen) {
      await this.videoElement.requestFullscreen();
    } else if ((this.videoElement as any).webkitRequestFullscreen) {
      await (this.videoElement as any).webkitRequestFullscreen();
    } else if ((this.videoElement as any).mozRequestFullScreen) {
      await (this.videoElement as any).mozRequestFullScreen();
    } else if ((this.videoElement as any).msRequestFullscreen) {
      await (this.videoElement as any).msRequestFullscreen();
    }
  }

  /**
   * 退出全屏
   */
  async exitFullscreen(): Promise<void> {
    if (this.isDestroyed) return;
    
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      await (document as any).webkitExitFullscreen();
    } else if ((document as any).mozCancelFullScreen) {
      await (document as any).mozCancelFullScreen();
    } else if ((document as any).msExitFullscreen) {
      await (document as any).msExitFullscreen();
    }
  }

  /**
   * 是否全屏
   */
  isFullscreen(): boolean {
    return !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
  }

  /**
   * 请求画中画
   */
  async requestPictureInPicture(): Promise<PictureInPictureWindow> {
    if (this.isDestroyed) throw new Error('播放器已销毁');
    
    if (this.videoElement.requestPictureInPicture) {
      return await this.videoElement.requestPictureInPicture();
    } else {
      throw new Error('浏览器不支持画中画功能');
    }
  }

  /**
   * 退出画中画
   */
  async exitPictureInPicture(): Promise<void> {
    if (this.isDestroyed) return;
    
    if (document.exitPictureInPicture) {
      await document.exitPictureInPicture();
    } else {
      throw new Error('浏览器不支持画中画功能');
    }
  }

  /**
   * 是否画中画
   */
  isPictureInPicture(): boolean {
    return (document as any).pictureInPictureElement === this.videoElement;
  }

  /**
   * 获取生命周期状态
   */
  getLifecycle(): PlayerLifecycle {
    return this.lifecycle;
  }

  /**
   * 确定UI模式
   */
  private determineUIMode(): UIMode {
    // 优先使用新的uiMode配置
    if (this.options.uiMode) {
      return this.options.uiMode;
    }
    
    // 兼容旧的controls配置
    if (this.options.controls === false) {
      return UIMode.CUSTOM;
    }
    
    // 默认使用原生UI
    return UIMode.NATIVE;
  }

  /**
   * 初始化UI
   */
  // 由外部（PlayerInstance）在设置 externalPlayer 后调用
  initializeUI(): void {
    if (this.uiMode === UIMode.CUSTOM) {
      this.createDefaultUI();
    } else if (this.uiMode === UIMode.ADVANCED) {
      this.createAdvancedUI();
    }
  }

  /**
   * 创建默认UI
   */
  private createDefaultUI(): void {
    if (this.defaultUI) {
      this.defaultUI.destroy();
    }

    const uiConfig: ControlBarConfig = {
      playButton: true,
      progressBar: true,
      timeDisplay: true,
      volumeControl: true,
      fullscreenButton: true,
      ...this.options.uiConfig
    };

    const theme: PlayerTheme = {
      primaryColor: '#007bff',
      secondaryColor: '#6c757d',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      textColor: '#ffffff',
      controlBarHeight: 50,
      borderRadius: 4,
      fontFamily: 'Arial, sans-serif',
      ...this.options.theme
    };

    this.defaultUI = new DefaultUI(
      (this.externalPlayer || (this as any)),
      this.container,
      uiConfig,
      theme
    );
    this.defaultUI.setDebug?.(!!this.options.debug);
    this.logger.debug('default UI created');
  }

  /**
   * 创建高级UI
   */
  private createAdvancedUI(): void {
    if (this.advancedUI) {
      this.advancedUI.destroy();
    }

    const uiConfig: ControlBarConfig = {
      playButton: true,
      progressBar: true,
      timeDisplay: true,
      volumeControl: true,
      fullscreenButton: true,
      playbackRateControl: true,
      qualitySelector: true,
      subtitleToggle: true,
      aspectRatio: true,
      pictureInPicture: true,
      screenshot: true,
      skipButtons: true,
      ...this.options.uiConfig
    };

    const theme: PlayerTheme = {
      primaryColor: '#3b82f6',
      secondaryColor: '#6c757d',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      textColor: '#ffffff',
      controlBarHeight: 60,
      borderRadius: 8,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      ...this.options.theme
    };

    this.advancedUI = new AdvancedUI(
      (this.externalPlayer || (this as any)),
      this.container,
      uiConfig,
      theme
    );
    (this.advancedUI as any).setDebug?.(!!this.options.debug);
    this.logger.debug('advanced UI created');
  }

  /**
   * 更新UI模式
   */
  updateUIMode(uiMode: UIMode): void {
    if (this.isDestroyed) return;
    
    this.uiMode = uiMode;
    this.logger.info('updateUIMode', uiMode);
    
    // 更新视频元素的controls属性
    this.videoElement.controls = uiMode === UIMode.NATIVE;
    
    // 销毁现有UI
    if (this.defaultUI) {
      this.defaultUI.destroy();
      this.defaultUI = null;
    }
    
    if (this.advancedUI) {
      this.advancedUI.destroy();
      this.advancedUI = null;
    }
    
    // 创建新的UI
    if (uiMode === UIMode.CUSTOM) {
      this.createDefaultUI();
    } else if (uiMode === UIMode.ADVANCED) {
      this.createAdvancedUI();
    }
  }

  /**
   * 更新UI配置
   */
  updateUIConfig(config: ControlBarConfig): void {
    if (this.isDestroyed) return;
    
    this.options.uiConfig = { ...this.options.uiConfig, ...config };
    this.logger.info('updateUIConfig', config);
    
    if (this.defaultUI) {
      this.defaultUI.updateConfig(config);
    }
  }

  /**
   * 更新UI主题
   */
  updateUITheme(theme: PlayerTheme): void {
    if (this.isDestroyed) return;
    
    this.options.theme = { ...this.options.theme, ...theme };
    this.logger.info('updateUITheme', theme);
    
    if (this.defaultUI) {
      this.defaultUI.updateTheme(theme);
    }
  }

  /**
   * 获取当前UI模式
   */
  getUIMode(): UIMode {
    return this.uiMode;
  }

  /**
   * 由 PlayerInstance 注入外部 Player 引用
   */
  setExternalPlayer(player: any): void {
    this.externalPlayer = player;
  }

  setDebug(enabled: boolean): void {
    this.logger.setEnabled(enabled);
    if (this.defaultUI) this.defaultUI.setDebug?.(enabled);
    if (this.advancedUI) (this.advancedUI as any).setDebug?.(enabled);
  }

  /**
   * 销毁播放器
   */
  destroy(): void {
    if (this.isDestroyed) return;
    
    this.isDestroyed = true;
    this.setLifecycle(PlayerLifecycle.DESTROYED);
    
    // 销毁UI
    if (this.defaultUI) {
      this.defaultUI.destroy();
      this.defaultUI = null;
    }
    
    if (this.advancedUI) {
      this.advancedUI.destroy();
      this.advancedUI = null;
    }
    
    // 清理事件监听器
    this.eventListeners.clear();
    
    // 移除视频元素
    if (this.videoElement && this.videoElement.parentNode) {
      this.videoElement.parentNode.removeChild(this.videoElement);
    }
    
    // 清理状态
    this.state = this.createInitialState();
  }
}
