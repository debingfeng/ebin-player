export type AutoplayResult = { ok: true } | { ok: false; reason: string };

export class AutoplayManager {
  private tried = false;

  async tryAutoplay(video: HTMLVideoElement, { muted = true } = {}): Promise<AutoplayResult> {
    if (!video) return { ok: false, reason: 'no-video' };
    try {
      video.muted = muted;
      const p = video.play();
      if (p && typeof (p as Promise<void>).then === 'function') {
        await p;
      }
      this.tried = true;
      return { ok: true };
    } catch (e: any) {
      return { ok: false, reason: e?.name || 'autoplay-blocked' };
    }
  }

  markUserInteracted(video: HTMLVideoElement): void {
    if (!video) return;
    this.tried = true;
    video.muted = false;
  }
}


