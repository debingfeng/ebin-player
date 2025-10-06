import { PlayerCore } from './PlayerCore';
import { PlayerStore } from './PlayerStore';
import { PlayerOptions, PlayerState } from './types';
import { PluginManager } from '../plugin/PluginManager';

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

export class PlayerInstance {
  public core: PlayerCore;
  public store: PlayerStore;
  public pluginManager = new PluginManager();

  constructor(container: HTMLElement, options: PlayerOptions) {
    this.store = new PlayerStore(initialState);
    this.core = new PlayerCore(container, options);

    const sync = () => this.store.setState(this.core.getState());
    ['timeupdate', 'play', 'pause', 'volumechange', 'ended'].forEach(e =>
      this.core.getVideoElement().addEventListener(e, sync)
    );
    sync();
  }

  use(plugin: import('../plugin/PluginManager').Plugin) {
    plugin.apply(this);
    return this;
  }

  destroy() {
    this.core.getVideoElement().remove();
  }
}