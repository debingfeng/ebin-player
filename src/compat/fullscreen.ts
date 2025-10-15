export class FullscreenAdapter {
  isFullscreen(): boolean {
    const d: any = document;
    return !!(d.fullscreenElement || d.webkitFullscreenElement);
  }

  async request(element: HTMLElement): Promise<void> {
    const el: any = element as any;
    if (el.requestFullscreen) return el.requestFullscreen();
    if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen();
  }

  async exit(): Promise<void> {
    const d: any = document as any;
    if (document.exitFullscreen) return document.exitFullscreen();
    if (d.webkitExitFullscreen) return d.webkitExitFullscreen();
  }

  onChange(handler: () => void): () => void {
    const fn = () => handler();
    document.addEventListener('fullscreenchange', fn);
    document.addEventListener('webkitfullscreenchange', fn as any);
    return () => {
      document.removeEventListener('fullscreenchange', fn);
      document.removeEventListener('webkitfullscreenchange', fn as any);
    };
  }
}


