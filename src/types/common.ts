/**
 * 通用与共享类型
 */

// UI模式枚举
export enum UIMode {
  NATIVE = "native",
  CUSTOM = "custom",
  NONE = "none",
}

// 日志级别与接口
export type LogLevel = "debug" | "info" | "warn" | "error";
export type LogArgs = [string, ...unknown[]];

export interface Logger {
  setEnabled(enabled: boolean): void;
  child(suffix: string): Logger;
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

// 播放器生命周期阶段
export enum PlayerLifecycle {
  INITIALIZING = "initializing",
  READY = "ready",
  PLAYING = "playing",
  PAUSED = "paused",
  ENDED = "ended",
  ERROR = "error",
  DESTROYED = "destroyed",
}


