/**
 * 播放器主类
 * 整合核心功能、状态管理和插件系统
 */
import { PlayerCore } from './PlayerCore';
import { PlayerStore } from './PlayerStore';
import { PlayerOptions, PlayerState, PlayerEventType, PlayerEvent, Plugin, UIMode, ControlBarConfig, PlayerTheme } from '../types';
import { PluginManager } from '../plugin/PluginManager';

const initialState: PlayerState = {
  src: '',
  currentTime: 0,
  duration: 0,
  paused: true,
  muted: false,
  volume: 1,
  playbackRate: 1,
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

export class PlayerInstance {
  public core: PlayerCore;
  public store: PlayerStore;
  public pluginManager: PluginManager;
  private isDestroyed = false;

  constructor(container: HTMLElement, options: PlayerOptions) {
    // 初始化状态管理器
    this.store = new PlayerStore(initialState);
    
    // 初始化核心播放器
    this.core = new PlayerCore(container, options);
    // 向 Core 注入对外 PlayerInstance 引用，并延后初始化 UI
    this.core.setExternalPlayer(this as any);
    this.core.initializeUI();
    
    // 初始化插件管理器
    this.pluginManager = new PluginManager(this);
    
    // 同步核心状态到状态管理器
    this.syncCoreToStore();
    
    // 设置状态变化监听
    this.setupStateSync();
    
    // 设置事件转发
    this.setupEventForwarding();
  }

  /**
   * 同步核心状态到状态管理器
   */
  private syncCoreToStore(): void {
    const coreState = this.core.getState();
    this.store.setState(coreState);
  }

  /**
   * 设置状态同步
   */
  private setupStateSync(): void {
    // 监听核心播放器的状态变化
    const syncState = () => {
      if (this.isDestroyed) return;
      const coreState = this.core.getState();
      this.store.setState(coreState);
    };

    // 监听关键事件来同步状态
    const events: PlayerEventType[] = [
      'timeupdate', 'play', 'pause', 'volumechange', 'ratechange',
      'seeking', 'seeked', 'loadedmetadata', 'canplay', 'canplaythrough',
      'ended', 'error', 'waiting', 'stalled'
    ];

    events.forEach(eventType => {
      this.core.on(eventType, () => {
        syncState();
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
  async play(): Promise<void> {
    if (this.isDestroyed) return;
    await this.core.play();
  }

  pause(): void {
    if (this.isDestroyed) return;
    this.core.pause();
  }

  load(): void {
    if (this.isDestroyed) return;
    this.core.load();
  }

  // 属性访问方法
  getCurrentTime(): number {
    return this.core.getCurrentTime();
  }

  setCurrentTime(time: number): void {
    if (this.isDestroyed) return;
    this.core.setCurrentTime(time);
  }

  getDuration(): number {
    return this.core.getDuration();
  }

  getVolume(): number {
    return this.core.getVolume();
  }

  setVolume(volume: number): void {
    if (this.isDestroyed) return;
    this.core.setVolume(volume);
  }

  getMuted(): boolean {
    return this.core.getMuted();
  }

  setMuted(muted: boolean): void {
    if (this.isDestroyed) return;
    this.core.setMuted(muted);
  }

  getPlaybackRate(): number {
    return this.core.getPlaybackRate();
  }

  setPlaybackRate(rate: number): void {
    if (this.isDestroyed) return;
    this.core.setPlaybackRate(rate);
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

  setState(state: Partial<PlayerState>): void {
    if (this.isDestroyed) return;
    
    // 更新核心播放器状态
    this.core.setState(state);
    
    // 更新状态管理器
    this.store.setState(state);
  }

  // 事件系统方法
  on(event: PlayerEventType, callback: (event: PlayerEvent) => void): void {
    if (this.isDestroyed) return;
    
    // 同时监听核心播放器和状态管理器的事件
    this.core.on(event, callback);
    this.store.subscribeEvent(event, callback);
  }

  off(event: PlayerEventType, callback: (event: PlayerEvent) => void): void {
    if (this.isDestroyed) return;
    
    this.core.off(event, callback);
    // 注意：PlayerStore 的 subscribeEvent 返回的取消函数需要保存才能调用
    // 这里简化处理，实际使用中建议保存取消函数
  }

  emit(event: PlayerEventType, data?: any): void {
    if (this.isDestroyed) return;
    this.core.emit(event, data);
  }

  // 插件系统方法
  use(plugin: Plugin): PlayerInstance {
    if (this.isDestroyed) return this;
    
    this.pluginManager.use(plugin);
    return this;
  }

  unuse(pluginName: string): PlayerInstance {
    if (this.isDestroyed) return this;
    
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
  async requestFullscreen(): Promise<void> {
    if (this.isDestroyed) return;
    await this.core.requestFullscreen();
  }

  async exitFullscreen(): Promise<void> {
    if (this.isDestroyed) return;
    await this.core.exitFullscreen();
  }

  isFullscreen(): boolean {
    return this.core.isFullscreen();
  }

  // 画中画方法
  async requestPictureInPicture(): Promise<PictureInPictureWindow> {
    if (this.isDestroyed) throw new Error('播放器已销毁');
    return await this.core.requestPictureInPicture();
  }

  async exitPictureInPicture(): Promise<void> {
    if (this.isDestroyed) return;
    await this.core.exitPictureInPicture();
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
    return this.store.subscribe(callback, keys);
  }

  // UI管理方法
  updateUIMode(uiMode: UIMode): PlayerInstance {
    if (this.isDestroyed) return this;
    
    this.core.updateUIMode(uiMode);
    return this;
  }

  updateUIConfig(config: ControlBarConfig): PlayerInstance {
    if (this.isDestroyed) return this;
    
    this.core.updateUIConfig(config);
    return this;
  }

  updateUITheme(theme: PlayerTheme): PlayerInstance {
    if (this.isDestroyed) return this;
    
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
      version: '1.0.0',
      lifecycle: this.core.getLifecycle(),
      plugins: this.pluginManager.getPluginNames(),
      state: this.getState(),
      uiMode: this.getUIMode()
    };
  }

  // 销毁播放器
  destroy(): void {
    if (this.isDestroyed) return;
    
    this.isDestroyed = true;
    
    // 销毁插件
    this.pluginManager.destroy();
    
    // 销毁状态管理器
    this.store.destroy();
    
    // 销毁核心播放器
    this.core.destroy();
  }
}
