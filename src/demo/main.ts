import { PlayerInstance } from '../core/Player';
import { DefaultUI } from '../ui/DefaultUI';
import { PlaybackRatePlugin } from '../plugin/built-in/PlaybackRatePlugin';

const container = document.getElementById('player')!;
const player = new PlayerInstance(container, {
  src: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
  poster: 'https://media.w3.org/2010/05/sintel/poster.png'
});

player.use(PlaybackRatePlugin);
new DefaultUI(player, container);