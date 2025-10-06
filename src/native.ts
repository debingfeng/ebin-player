/**
 * ebin-player 原生HTML入口文件
 * 不包含React相关组件，适合在原生HTML环境中使用
 */

// 核心播放器
export { PlayerInstance } from './core/Player';
export { PlayerCore } from './core/PlayerCore';
export { PlayerStore } from './core/PlayerStore';

// 类型定义
export type {
  PlayerOptions,
  PlayerState,
  PlayerInstance as IPlayerInstance,
  PlayerEventType,
  PlayerEvent,
  Plugin,
  UIComponent,
  ControlBarConfig,
  PlayerTheme,
  PlayerConfig,
  PlayerLifecycle
} from './types';

// 插件系统
export { PluginManager } from './plugin/PluginManager';
export { PlaybackRatePlugin } from './plugin/built-in/PlaybackRatePlugin';

// UI组件
export { DefaultUI } from './ui/DefaultUI';

// 工具函数
export const createPlayer = (container: HTMLElement, options: import('./types').PlayerOptions) => {
  return new PlayerInstance(container, options);
};

// 版本信息
export const version = '1.0.0';

// 默认导出播放器类
import { PlayerInstance } from './core/Player';
export default PlayerInstance;
