export interface SubtitleCueLike {
  startTime: number;
  endTime: number;
  text: string;
}

export class SubtitleRenderer {
  private container: HTMLElement;
  private active: SubtitleCueLike[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
    this.container.style.position = 'absolute';
    this.container.style.left = '0';
    this.container.style.right = '0';
    this.container.style.bottom = '10%';
    this.container.style.textAlign = 'center';
    this.container.style.pointerEvents = 'none';
  }

  render(cues: SubtitleCueLike[], currentTime: number): void {
    this.active = cues.filter(c => c.startTime <= currentTime && c.endTime >= currentTime);
    this.container.innerHTML = '';
    if (this.active.length === 0) return;
    const line = document.createElement('div');
    line.style.display = 'inline-block';
    line.style.background = 'rgba(0,0,0,0.6)';
    line.style.color = '#fff';
    line.style.padding = '4px 8px';
    line.style.borderRadius = '4px';
    line.style.fontSize = '16px';
    line.style.lineHeight = '1.4';
    line.innerHTML = this.active.map(a => a.text).join('<br/>');
    this.container.appendChild(line);
  }
}


