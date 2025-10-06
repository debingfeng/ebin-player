export interface PlayerOptions {
    src: string;
    autoplay?: boolean;
    muted?: boolean;
    volume?: number;
    playbackRate?: number;
    poster?: string;
}

export interface PlayerState {
    src: string;
    currentTime: number;
    duration: number;
    paused: boolean;
    muted: boolean;
    volume: number;
    playbackRate: number;
    readyState: number;
    error: MediaError | null;
    ended: boolean;
    loading: boolean;
}