/**
 * 播放器核心类型定义
 * 基于架构文档的Web视频播放器设计
 */

// UI模式枚举
export enum UIMode {
  NATIVE = 'native',        // 使用原生HTML5控制条
  CUSTOM = 'custom',        // 使用内置自定义UI
  NONE = 'none'            // 不使用任何UI
}

// 日志级别
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// 日志参数类型
export type LogArgs = [string, ...unknown[]];

// 日志接口，用于在外部注入自定义日志实例
export interface Logger {
  setEnabled(enabled: boolean): void;
  child(suffix: string): Logger;
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

// 播放器配置选项
export interface PlayerOptions {
  src: string;
  autoplay?: boolean;
  muted?: boolean;
  volume?: number;
  playbackRate?: number;
  poster?: string;
  width?: number | string;
  height?: number | string;
  controls?: boolean;  // 已废弃，使用uiMode替代
  loop?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  crossOrigin?: 'anonymous' | 'use-credentials' | '';
  playsInline?: boolean;
  uiMode?: UIMode;  // UI模式配置
  uiConfig?: ControlBarConfig;  // 自定义UI配置
  theme?: PlayerTheme;  // UI主题配置
  logger?: Logger;
  debug?: boolean; // 是否开启调试日志
  // 内置插件开关（按需开启即可自动注册）
  builtinPlugins?: {
    playbackRate?: boolean | { defaultRate?: number; options?: Array<{ value: number; label: string }> };
  };
}

// 播放器状态
export interface PlayerState {
  // 基础播放状态
  src: string;
  currentTime: number;
  duration: number;
  paused: boolean;
  muted: boolean;
  volume: number;
  playbackRate: number;
  
  // 媒体状态
  readyState: number;
  networkState: number;
  error: MediaError | null;
  ended: boolean;
  loading: boolean;
  seeking: boolean;
  
  // 视频尺寸
  videoWidth: number;
  videoHeight: number;
  
  // 缓冲状态
  buffered: TimeRanges | null;
  seekable: TimeRanges | null;
  
  // 播放质量
  quality: string;
  bitrate: number;
}

// 播放器事件类型
export type PlayerEventType = 
  | 'loadstart'
  | 'loadedmetadata'
  | 'loadeddata'
  | 'canplay'
  | 'canplaythrough'
  | 'play'
  | 'pause'
  | 'ended'
  | 'error'
  | 'timeupdate'
  | 'volumechange'
  | 'ratechange'
  | 'seeking'
  | 'seeked'
  | 'waiting'
  | 'stalled'
  | 'progress'
  | 'durationchange'
  | 'resize'
  | 'fullscreenchange'
  | 'enterpictureinpicture'
  | 'leavepictureinpicture'
  | 'lifecyclechange'
  | 'statechange';

// 播放器事件
// 事件载荷映射（后续可细化为更具体的事件对象）
export type EventPayloadMap = {
  loadstart: Event;
  loadedmetadata: Event;
  loadeddata: Event;
  canplay: Event;
  canplaythrough: Event;
  play: Event;
  pause: Event;
  ended: Event;
  error: Event;
  timeupdate: Event;
  volumechange: Event;
  ratechange: Event;
  seeking: Event;
  seeked: Event;
  waiting: Event;
  stalled: Event;
  progress: Event;
  durationchange: Event;
  resize: Event;
  fullscreenchange: { isFullscreen: boolean };
  enterpictureinpicture: {};
  leavepictureinpicture: {};
  lifecyclechange: { lifecycle: PlayerLifecycle };
  statechange: { state: PlayerState };
};

export interface PlayerEventBase<T extends PlayerEventType = PlayerEventType> {
  type: T;
  target: PlayerInstance;
  data?: EventPayloadMap[T];
  timestamp: number;
}

export type PlayerEvent = PlayerEventBase;

// 播放器实例接口
export interface PlayerInstance {
  // 基础方法
  play(): Promise<PlayerInstance>;
  pause(): PlayerInstance;
  load(): PlayerInstance;
  destroy(): void;
  
  // 属性访问
  getCurrentTime(): number;
  setCurrentTime(time: number): PlayerInstance;
  getDuration(): number;
  getVolume(): number;
  setVolume(volume: number): PlayerInstance;
  getMuted(): boolean;
  setMuted(muted: boolean): PlayerInstance;
  getPlaybackRate(): number;
  setPlaybackRate(rate: number): PlayerInstance;
  getPaused(): boolean;
  getEnded(): boolean;
  getReadyState(): number;
  getNetworkState(): number;
  getError(): MediaError | null;
  
  // 状态管理
  getState(): PlayerState;
  setState(state: Partial<PlayerState>): void;
  
  // 事件系统
  on<T extends PlayerEventType>(event: T, callback: (event: PlayerEventBase<T>) => void): () => void;
  off<T extends PlayerEventType>(event: T, callback: (event: PlayerEventBase<T>) => void): void;
  emit<T extends PlayerEventType>(event: T, data?: EventPayloadMap[T]): PlayerInstance;
  
  // 插件系统
  use(plugin: PluginDefinition): PlayerInstance;
  unuse(pluginId: string): PlayerInstance;
  getPlugin(pluginId: string): PluginDefinition | undefined;
  
  // UI控制
  getContainer(): HTMLElement;
  getVideoElement(): HTMLVideoElement;
  
  // 全屏控制
  requestFullscreen(): Promise<PlayerInstance>;
  exitFullscreen(): Promise<PlayerInstance>;
  isFullscreen(): boolean;
  
  // 画中画
  requestPictureInPicture(): Promise<PictureInPictureWindow>;
  exitPictureInPicture(): Promise<PlayerInstance>;
  isPictureInPicture(): boolean;
  
  // 日志管理
  getLogger?(): Logger;
}

// 现代插件体系
export type SemverRange = string;

export interface PluginMeta {
  id: string;                 // 唯一ID（建议: 包名或域前缀）
  version: string;            // semver
  displayName?: string;
  description?: string;
  requires?: Record<string, SemverRange>;   // 硬依赖: 插件ID → 版本范围
  optional?: Record<string, SemverRange>;   // 软依赖
  capabilities?: string[];                   // 暴露的能力标签
  permissions?: string[];                    // 需要的权限（可用于沙箱策略）
}

export interface PluginContext {
  player: PlayerInstance;
  logger: Logger;
  // 播放器事件
  on<T extends PlayerEventType>(event: T, callback: (event: PlayerEventBase<T>) => void): () => void;
  off<T extends PlayerEventType>(event: T, callback: (event: PlayerEventBase<T>) => void): void;
  emit<T extends PlayerEventType>(event: T, data?: EventPayloadMap[T]): void;
  onAnyPlayerEvent(callback: (event: PlayerEvent) => void): () => void;
  // 插件事件
  onPluginEvent(pluginId: string, type: string, callback: (data: unknown) => void): () => void;
  emitPluginEvent(pluginId: string, type: string, data?: unknown): void;
  // 服务定位
  registerService<T>(name: string, service: T): void;
  getService<T>(name: string): T | undefined;
  // 配置
  getConfig<T = unknown>(): T;
  setConfig<T = unknown>(partial: Partial<T>): void;
  // 存储（沙箱）
  storage: {
    get<T = unknown>(key: string): T | undefined;
    set<T = unknown>(key: string, value: T): void;
    delete(key: string): void;
    keys(): string[];
  };
  // 权限
  hasPermission?(perm: PluginPermission): boolean;
}

export interface PluginHooks<Config = unknown, Exports = unknown> {
  onInit?(ctx: PluginContext): Promise<Exports> | Exports | void;
  onStart?(ctx: PluginContext): Promise<void> | void;
  onEvent?<T extends PlayerEventType>(event: PlayerEventBase<T>, ctx: PluginContext): void;
  onConfigChange?(newConfig: Partial<Config>, ctx: PluginContext): void;
  onDestroy?(ctx: PluginContext): Promise<void> | void;
}

export interface PluginDefinition<Config = unknown, Exports = unknown> extends PluginHooks<Config, Exports> {
  meta: PluginMeta;
  defaultConfig?: Config;
  validateConfig?(config: unknown): { valid: boolean; errors?: string[] };
  commands?: Record<string, (args: unknown, ctx: PluginContext) => unknown>;
  // 配置版本与迁移（可选）
  configVersion?: number; // 默认为 1
  migrations?: Array<{
    from: number;
    to: number;
    migrate: (oldConfig: unknown) => unknown;
  }>;
}

// 权限字符串（占位）
export type PluginPermission =
  | 'ui:inject'
  | 'player:control'
  | 'storage:write'
  | 'metrics:write'
  | 'network'
  | 'events:any';

// UI组件接口
export interface UIComponent {
  name: string;
  render(container: HTMLElement, player: PlayerInstance): HTMLElement | void;
  destroy(): void;
  update?(state: PlayerState): void;
}

// 控制栏配置
export interface ControlBarConfig {
  playButton?: boolean;
  progressBar?: boolean;
  timeDisplay?: boolean;
  volumeControl?: boolean;
  playbackRateControl?: boolean;
  fullscreenButton?: boolean;
  pictureInPictureButton?: boolean;
  qualitySelector?: boolean;
  subtitleToggle?: boolean;
  aspectRatio?: boolean;
  pictureInPicture?: boolean;
  screenshot?: boolean;
  skipButtons?: boolean;
  customButtons?: UIComponent[];
}

// 播放器主题配置
export interface PlayerTheme {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  controlBarHeight?: number;
  borderRadius?: number;
  fontFamily?: string;
}

// 播放器配置
export interface PlayerConfig extends PlayerOptions {
  theme?: PlayerTheme;
  controlBar?: ControlBarConfig;
  customUI?: boolean;
}

// 媒体事件映射
export const MEDIA_EVENTS: PlayerEventType[] = [
  'loadstart',
  'loadedmetadata', 
  'loadeddata',
  'canplay',
  'canplaythrough',
  'play',
  'pause',
  'ended',
  'error',
  'timeupdate',
  'volumechange',
  'ratechange',
  'seeking',
  'seeked',
  'waiting',
  'stalled',
  'progress',
  'durationchange'
];

// 播放器生命周期阶段
export enum PlayerLifecycle {
  INITIALIZING = 'initializing',
  READY = 'ready',
  PLAYING = 'playing',
  PAUSED = 'paused',
  ENDED = 'ended',
  ERROR = 'error',
  DESTROYED = 'destroyed'
}
