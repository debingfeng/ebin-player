/**
 * 播放器 API 与配置相关类型
 */
import type { Logger, UIMode } from "./common";
import type { PlayerState } from "./core-state";
import type { PlayerEventType, EventPayloadMap, PlayerEventBase } from "./core-events";
import type { PluginDefinition } from "./plugin";

export interface PlayerOptions {
  src: string;
  autoplay?: boolean;
  muted?: boolean;
  volume?: number;
  playbackRate?: number;
  poster?: string;
  width?: number | string;
  height?: number | string;
  controls?: boolean; // 已废弃
  loop?: boolean;
  preload?: "none" | "metadata" | "auto";
  crossOrigin?: "anonymous" | "use-credentials" | "";
  playsInline?: boolean;
  uiMode?: UIMode;
  uiConfig?: ControlBarConfig;
  theme?: PlayerTheme;
  logger?: Logger;
  debug?: boolean;
  builtinPlugins?: {
    playbackRate?:
      | boolean
      | {
          defaultRate?: number;
          options?: Array<{ value: number; label: string }>;
        };
  };
}

export interface PlayerInstance {
  play(): Promise<PlayerInstance>;
  pause(): PlayerInstance;
  load(): PlayerInstance;
  destroy(): void;

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

  getState(): PlayerState;
  setState(state: Partial<PlayerState>): void;

  on<T extends PlayerEventType>(
    event: T,
    callback: (event: PlayerEventBase<T>) => void,
  ): () => void;
  off<T extends PlayerEventType>(
    event: T,
    callback: (event: PlayerEventBase<T>) => void,
  ): void;
  emit<T extends PlayerEventType>(event: T, data?: EventPayloadMap[T]): PlayerInstance;

  use(plugin: PluginDefinition): PlayerInstance;
  unuse(pluginId: string): PlayerInstance;
  getPlugin(pluginId: string): PluginDefinition | undefined;

  getContainer(): HTMLElement;
  getVideoElement(): HTMLVideoElement;

  requestFullscreen(): Promise<PlayerInstance>;
  exitFullscreen(): Promise<PlayerInstance>;
  isFullscreen(): boolean;

  requestPictureInPicture(): Promise<PictureInPictureWindow>;
  exitPictureInPicture(): Promise<PlayerInstance>;
  isPictureInPicture(): boolean;

  getLogger?(): Logger;
}

export interface PlayerConfig extends PlayerOptions {
  theme?: PlayerTheme;
  controlBar?: ControlBarConfig;
  customUI?: boolean;
}

// UI组件接口（对外自定义按钮等可复用）
export interface UIComponent {
  name: string;
  render(container: HTMLElement, player: PlayerInstance): HTMLElement | void;
  destroy(): void;
  update?(state: PlayerState): void;
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


