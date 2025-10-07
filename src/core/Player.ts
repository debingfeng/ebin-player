/**
 * 播放器主类
 * 整合核心功能、状态管理和插件系统
 */
import { PlayerCore } from './PlayerCore';
import { PlayerStore } from './PlayerStore';
import { PlayerOptions, PlayerState, PlayerEventType, PlayerEvent, Plugin, UIMode, ControlBarConfig, PlayerTheme, MEDIA_EVENTS, EventPayloadMap, PlayerEventBase } from '../types';
import { PluginManager } from '../plugin/PluginManager';
import { chainable, chainableAsync, logMethod } from './decorators';
import { Logger as CoreLogger } from './Logger';
import type { Logger as LoggerType } from '../types';

export class PlayerInstance {
  public core: PlayerCore;
  public store: PlayerStore;
  public pluginManager: PluginManager;
  private isDestroyed = false;
  // 每帧节流相关
  private syncScheduled = false;
  private rafId: number | null = null;
  private logger: LoggerType;

  constructor(container: HTMLElement, options: PlayerOptions) {
    // 初始化日志（可外部注入，否则创建默认实例）
    this.logger = options.logger || new CoreLogger('Player');
    this.logger.setEnabled(!!options.debug);
    this.logger.info('construct', { options: { ...options, src: !!options.src ? '***' : options.src } });

    // 初始化核心播放器（复用同一 logger）
    // 这里传入的 logger 是 types.Logger，但 PlayerCore 内部只以结构化使用，保持兼容
    this.core = new PlayerCore(container, { ...options, logger: this.logger } as any);
    
    // 先初始化状态管理器，确保 UI 在构建时可以订阅到 Store
    this.store = new PlayerStore(this.core.getState(), this.logger);
    
    // 初始化插件管理器
    this.pluginManager = new PluginManager(this, this.logger);
    
    // 设置状态变化监听与事件转发（依赖 store 已就绪）
    this.setupStateSync();
    this.setupEventForwarding();
    
    // 最后再初始化 UI，确保 DefaultUI 能访问到已就绪的 PlayerInstance 与 Store
    this.core.setExternalPlayer(this as any);
    this.core.initializeUI();
  }



  /**
   * 设置状态同步
   */
  private setupStateSync(): void {
    // 立即同步一次，确保初始一致
    const immediateSync = () => {
      if (this.isDestroyed) return;
      const coreState = this.core.getState();
      this.store.setState(coreState);
    };

    // 高频事件合帧同步
    const scheduleSync = () => {
      if (this.isDestroyed) return;
      if (this.syncScheduled) return;
      this.syncScheduled = true;
      this.rafId = (typeof requestAnimationFrame !== 'undefined'
        ? requestAnimationFrame
        : (cb: FrameRequestCallback) => setTimeout(() => cb(Date.now()), 16)
      )(() => {
        this.syncScheduled = false;
        immediateSync();
      }) as unknown as number;
    };

    // 监听关键事件来同步状态
    // 复用集中管理的媒体事件列表
    const events: PlayerEventType[] = MEDIA_EVENTS;

    events.forEach(eventType => {
      this.core.on(eventType, () => {
        // 对高频事件进行合帧，其余事件即时同步
        if (eventType === 'timeupdate' || eventType === 'progress') {
          scheduleSync();
        } else {
          immediateSync();
        }
      });
    });
  }

  /**
   * 设置事件转发
   */
  private setupEventForwarding(): void {
    // 将核心播放器的事件转发到状态管理器
    const events: PlayerEventType[] = [
      'loadstart', 'loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough',
      'play', 'pause', 'ended', 'error', 'timeupdate', 'volumechange', 'ratechange',
      'seeking', 'seeked', 'waiting', 'stalled', 'progress', 'durationchange',
      'fullscreenchange', 'enterpictureinpicture', 'leavepictureinpicture'
    ];

    events.forEach(eventType => {
      this.core.on(eventType, (event) => {
        if (this.isDestroyed) return;
        
        // 更新事件目标为当前播放器实例
        const playerEvent: PlayerEvent = {
          ...event,
          target: this
        };
        
        // 转发到状态管理器
        this.store.notifyEvent(playerEvent);
      });
    });
  }

  // 播放控制方法
  @chainableAsync
  async play(): Promise<PlayerInstance> {
    await this.core.play();
    return this;
  }

  @chainable
  @logMethod({ includeArgs: false })
  pause(): PlayerInstance {
    this.core.pause();
    return this;
  }

  @chainable
  load(): PlayerInstance {
    this.core.load();
    return this;
  }

  // 属性访问方法
  getCurrentTime(): number {
    return this.core.getCurrentTime();
  }

  @chainable
  @logMethod({ includeArgs: true })
  setCurrentTime(time: number): PlayerInstance {
    this.core.setCurrentTime(time);
    return this;
  }

  getDuration(): number {
    return this.core.getDuration();
  }

  getVolume(): number {
    return this.core.getVolume();
  }

  @chainable
  @logMethod({ includeArgs: true })
  setVolume(volume: number): PlayerInstance {
    this.core.setVolume(volume);
    return this;
  }

  getMuted(): boolean {
    return this.core.getMuted();
  }

  @chainable
  @logMethod({ includeArgs: true })
  setMuted(muted: boolean): PlayerInstance {
    this.core.setMuted(muted);
    return this;
  }

  getPlaybackRate(): number {
    return this.core.getPlaybackRate();
  }

  @chainable
  @logMethod({ includeArgs: true })
  setPlaybackRate(rate: number): PlayerInstance {
    this.core.setPlaybackRate(rate);
    return this;
  }

  getPaused(): boolean {
    return this.core.getPaused();
  }

  getEnded(): boolean {
    return this.core.getEnded();
  }

  getReadyState(): number {
    return this.core.getReadyState();
  }

  getNetworkState(): number {
    return this.core.getNetworkState();
  }

  getError(): MediaError | null {
    return this.core.getError();
  }

  // 状态管理方法
  getState(): PlayerState {
    return this.store.getState();
  }
  @chainable
  @logMethod({ includeArgs: true })
  setState(state: Partial<PlayerState>): void {

    
    // 仅更新核心播放器状态，随后以 Core 的完整状态同步到 Store，保持单向数据流
    this.core.setState(state);
    const syncedState = this.core.getState();
    this.store.setState(syncedState);
  }

  // 事件系统方法
  on<T extends PlayerEventType>(event: T, callback: (event: PlayerEventBase<T>) => void): () => void {
    if (this.isDestroyed) return () => {};
    this.logger.info('on', event);
    // 同时监听核心播放器和状态管理器的事件，并返回统一退订函数
    this.core.on(event, callback as any);
    const unsubscribeStore = this.store.subscribeEvent(event, callback as any);

    return () => {
      this.core.off(event, callback as any);
      unsubscribeStore();
    };
  }

  off<T extends PlayerEventType>(event: T, callback: (event: PlayerEventBase<T>) => void): void {
    if (this.isDestroyed) return;
    this.core.off(event, callback as any);
    // 尝试从 Store 侧移除（防止使用者未保存取消函数时的泄漏）
    // 由于 Store 需要取消函数，这里提供兜底方案：临时订阅后立刻退订以触发 delete
    const tmpUnsub = this.store.subscribeEvent(event, callback as any);
    tmpUnsub();
  }
  @logMethod({ includeArgs: true })
  @chainable
  emit<T extends PlayerEventType>(event: T, data?: EventPayloadMap[T]): PlayerInstance {
    this.core.emit(event, data as any);
    return this;
  }

  // 插件系统方法
  @chainable
  use(plugin: Plugin): PlayerInstance {
    this.pluginManager.use(plugin);
    return this;
  }

  @chainable
  unuse(pluginName: string): PlayerInstance {
    this.pluginManager.unuse(pluginName);
    return this;
  }

  getPlugin(name: string): Plugin | undefined {
    if (this.isDestroyed) return undefined;
    return this.pluginManager.getPlugin(name);
  }

  // UI控制方法
  getContainer(): HTMLElement {
    return this.core.getContainer();
  }

  getVideoElement(): HTMLVideoElement {
    return this.core.getVideoElement();
  }

  // 全屏控制方法
  @chainableAsync
  async requestFullscreen(): Promise<PlayerInstance> {
    await this.core.requestFullscreen();
    return this;
  }

  @chainableAsync
  async exitFullscreen(): Promise<PlayerInstance> {
    await this.core.exitFullscreen();
    return this;
  }

  isFullscreen(): boolean {
    return this.core.isFullscreen();
  }

  // 画中画方法
  async requestPictureInPicture(): Promise<PictureInPictureWindow> {
    if (this.isDestroyed) throw new Error('播放器已销毁');
    return await this.core.requestPictureInPicture();
  }

  @chainableAsync
  async exitPictureInPicture(): Promise<PlayerInstance> {
    await this.core.exitPictureInPicture();
    return this;
  }

  isPictureInPicture(): boolean {
    return this.core.isPictureInPicture();
  }

  // 状态订阅方法
  subscribe(
    callback: (state: PlayerState) => void,
    keys?: (keyof PlayerState)[]
  ): () => void {
    if (this.isDestroyed) return () => {};
    this.logger.info('subscribe', keys);
    return this.store.subscribe(callback, keys);
  }

  // UI管理方法
  @chainable
  updateUIMode(uiMode: UIMode): PlayerInstance {
    this.logger.info('updateUIMode', uiMode);
    this.core.updateUIMode(uiMode);
    return this;
  }

  @chainable
  updateUIConfig(config: ControlBarConfig): PlayerInstance {
    this.core.updateUIConfig(config);
    return this;
  }

  @chainable
  updateUITheme(theme: PlayerTheme): PlayerInstance {
    this.core.updateUITheme(theme);
    return this;
  }

  getUIMode(): UIMode {
    if (this.isDestroyed) return UIMode.NONE;
    return this.core.getUIMode();
  }

  // 获取播放器信息
  getInfo(): {
    version: string;
    lifecycle: string;
    plugins: string[];
    state: PlayerState;
    uiMode: UIMode;
  } {
    return {
      version: (typeof __VERSION__ !== 'undefined' ? (__VERSION__ as any) : '0.0.0'),
      lifecycle: this.core.getLifecycle(),
      plugins: this.pluginManager.getPluginNames(),
      state: this.getState(),
      uiMode: this.getUIMode()
    };
  }

  // 销毁播放器
  @logMethod({ includeArgs: false })
  destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;
    // 取消可能存在的帧同步
    if (this.rafId !== null) {
      const cancel = (typeof cancelAnimationFrame !== 'undefined' 
        ? cancelAnimationFrame 
        : (id: number) => clearTimeout(id as any)
      );
      cancel(this.rafId);
      this.rafId = null;
      this.syncScheduled = false;
    }
    
    // 销毁插件
    this.pluginManager.destroy();
    
    // 销毁状态管理器
    this.store.destroy();
    
    // 销毁核心播放器
    this.core.destroy();
  }

  // 运行时切换调试
  setDebug(enabled: boolean): void {
    this.core.setDebug(enabled);
  }
}
