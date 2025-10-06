import { PlayerInstance } from '../core/Player';

export interface Plugin {
  name: string;
  apply(player: PlayerInstance): void;
}

export class PluginManager {
  use(plugin: Plugin) {
    // 实际使用在 PlayerInstance.use() 中直接调用 apply
  }
}