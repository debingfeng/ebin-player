import { PlayerInstance } from '../core/Player';

export class DefaultUI {
  constructor(player: PlayerInstance, container: HTMLElement) {
    const ui = document.createElement('div');
    ui.style.cssText = `
      position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.7);
      color: white; padding: 8px; display: flex; align-items: center; gap: 10px;
    `;

    const playBtn = document.createElement('button');
    playBtn.textContent = '▶';
    playBtn.onclick = () => {
      const state = player.store.getState();
      if (state.paused) player.core.play();
      else player.core.pause();
    };

    const progress = document.createElement('input');
    progress.type = 'range';
    progress.min = '0';
    progress.max = '100';
    progress.value = '0';
    progress.style.flex = '1';
    progress.oninput = () => {
      const dur = player.store.getState().duration;
      const pct = parseFloat(progress.value) / 100;
      player.core.seek(pct * dur);
    };

    const timeEl = document.createElement('span');
    timeEl.textContent = '00:00 / 00:00';

    ui.append(playBtn, progress, timeEl);
    container.style.position = 'relative';
    container.appendChild(ui);

    player.store.subscribe(state => {
      playBtn.textContent = state.paused ? '▶' : '⏸';
      if (state.duration > 0) {
        progress.value = ((state.currentTime / state.duration) * 100).toFixed(2);
      }
      timeEl.textContent = `${this.formatTime(state.currentTime)} / ${this.formatTime(state.duration)}`;
    });
  }

  private formatTime(sec: number): string {
    if (isNaN(sec) || sec < 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
}