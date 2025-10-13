/**
 * 播放器状态类型
 */
export interface PlayerState {
  src: string;
  currentTime: number;
  duration: number;
  paused: boolean;
  muted: boolean;
  volume: number;
  playbackRate: number;

  readyState: number;
  networkState: number;
  error: MediaError | null;
  ended: boolean;
  loading: boolean;
  seeking: boolean;

  videoWidth: number;
  videoHeight: number;

  buffered: TimeRanges | null;
  seekable: TimeRanges | null;

  quality: string;
  bitrate: number;
}


