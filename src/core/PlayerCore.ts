import { PlayerOptions, PlayerState } from './types';

const initialState: PlayerState = {
  src: '',
  currentTime: 0,
  duration: 0,
  paused: true,
  muted: false,
  volume: 1,
  playbackRate: 1,
  readyState: 0,
  error: null,
  ended: false,
  loading: false,
};

export class PlayerCore {
  private readonly video: HTMLVideoElement;
  private _state: PlayerState = { ...initialState };

  constructor(container: HTMLElement, options: PlayerOptions) {
    this.video = document.createElement('video');
    this.video.setAttribute('playsinline', '');
    this.video.setAttribute('webkit-playsinline', '');
    if (options.poster) this.video.poster = options.poster;
    container.appendChild(this.video);

    this.load(options);
    this.bindEvents();
  }

  private bindEvents() {
    const events = [
      'play', 'pause', 'timeupdate', 'ended', 'error',
      'loadedmetadata', 'canplay', 'waiting', 'seeked', 'volumechange'
    ] as const;

    events.forEach(event => {
      this.video.addEventListener(event, () => this.syncState());
    });
  }

  private syncState() {
    const v = this.video;
    this._state = {
      src: v.currentSrc || v.src,
      currentTime: v.currentTime,
      duration: v.duration || 0,
      paused: v.paused,
      muted: v.muted,
      volume: v.volume,
      playbackRate: v.playbackRate,
      readyState: v.readyState,
      error: v.error,
      ended: v.ended,
      loading: v.networkState === v.NETWORK_LOADING,
    };
  }

  load(options: PlayerOptions) {
    this.video.src = options.src;
    this.video.autoplay = !!options.autoplay;
    this.video.muted = !!options.muted;
    this.video.volume = Math.max(0, Math.min(1, options.volume ?? 1));
    this.video.playbackRate = options.playbackRate ?? 1;
    this.video.load();
  }

  play() { return this.video.play(); }
  pause() { this.video.pause(); }
  seek(time: number) { this.video.currentTime = time; }
  setVolume(vol: number) { this.video.volume = vol; }
  setMuted(muted: boolean) { this.video.muted = muted; }
  setPlaybackRate(rate: number) { this.video.playbackRate = rate; }

  getState(): Readonly<PlayerState> {
    return { ...this._state };
  }

  getVideoElement(): HTMLVideoElement {
    return this.video;
  }
}