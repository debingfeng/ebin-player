/**
 * 事件系统相关类型
 */
import type { PlayerLifecycle } from "./common";
import type { PlayerState } from "./core-state";

export type PlayerEventType =
  | "loadstart"
  | "loadedmetadata"
  | "loadeddata"
  | "canplay"
  | "canplaythrough"
  | "play"
  | "pause"
  | "ended"
  | "error"
  | "timeupdate"
  | "volumechange"
  | "ratechange"
  | "seeking"
  | "seeked"
  | "waiting"
  | "stalled"
  | "progress"
  | "durationchange"
  | "resize"
  | "fullscreenchange"
  | "enterpictureinpicture"
  | "leavepictureinpicture"
  | "lifecyclechange"
  | "statechange";

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
  target: any; // 避免循环依赖：不直接引用 PlayerInstance
  data?: EventPayloadMap[T];
  timestamp: number;
}

export type PlayerEvent = PlayerEventBase;

export const MEDIA_EVENTS: PlayerEventType[] = [
  "loadstart",
  "loadedmetadata",
  "loadeddata",
  "canplay",
  "canplaythrough",
  "play",
  "pause",
  "ended",
  "error",
  "timeupdate",
  "volumechange",
  "ratechange",
  "seeking",
  "seeked",
  "waiting",
  "stalled",
  "progress",
  "durationchange",
];


