/**
 * 播放器核心类型定义
 * 基于架构文档的Web视频播放器设计
 */

// UI模式枚举
export enum UIMode {
  NATIVE = 'native',        // 使用原生HTML5控制条
  CUSTOM = 'custom',        // 使用内置自定义UI
  ADVANCED = 'advanced',    // 使用高级UI（包含所有功能）
  NONE = 'none'            // 不使用任何UI
}

// 日志接口，用于在外部注入自定义日志实例
export interface Logger {
  setEnabled(enabled: boolean): void;
  child(suffix: string): Logger;
  debug(...args: any[]): void;
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
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
  use(plugin: Plugin): PlayerInstance;
  unuse(pluginName: string): PlayerInstance;
  getPlugin(name: string): Plugin | undefined;
  
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

// 插件接口
export interface Plugin {
  name: string;
  version?: string;
  apply(player: PlayerInstance): void;
  destroy?(): void;
}

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
  plugins?: Plugin[];
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
