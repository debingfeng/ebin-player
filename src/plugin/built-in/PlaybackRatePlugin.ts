import { Plugin } from '../PluginManager';
import { PlayerInstance } from '../../core/Player';

export const PlaybackRatePlugin: Plugin = {
  name: 'playbackRate',
  apply(player: PlayerInstance) {
    (player as any).setPlaybackRate = (rate: number) => {
      player.core.setPlaybackRate(rate);
    };
  }
};