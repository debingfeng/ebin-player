/**
 * ebin-player 主入口文件
 * 导出所有公共API和类型
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

// UI组件 - 全新架构
export { ImprovedDefaultUI } from './ui/ImprovedDefaultUI';
export { UIManager } from './ui/UIManager';
export { ThemeManager } from './ui/theme/ThemeManager';
export { ResponsiveManager } from './ui/responsive/ResponsiveManager';
export { ErrorHandler } from './ui/error/ErrorHandler';

// UI组件
export { BaseComponent } from './ui/components/BaseComponent';
export { PlayButton } from './ui/components/PlayButton';
export { ProgressBar } from './ui/components/ProgressBar';
export { VolumeControl } from './ui/components/VolumeControl';
export { TimeDisplay } from './ui/components/TimeDisplay';

// UI配置
export { UIConfigManager } from './ui/config/UIConfig';


// 工具函数
export const createPlayer = (container: HTMLElement, options: import('./types').PlayerOptions) => {
  const { PlayerInstance } = require('./core/Player');
  return new PlayerInstance(container, options);
};

// 版本信息
export const version = '1.0.0';

// 默认导出播放器类
import { PlayerInstance } from './core/Player';
export default PlayerInstance;