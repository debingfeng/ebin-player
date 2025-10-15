// 导出样式注入工具
export { ensureStylesInjected } from './styleInjection';
export type { StyleInjectionMode, StyleInjectionOptions } from './styleInjection';

// 导出类型
export interface VueEbinPlayerProps {
  // Core options (direct pass-through)
  src: string | object;
  autoplay?: boolean;
  muted?: boolean;
  volume?: number;
  playbackRate?: number;
  poster?: string;
  width?: number | string;
  height?: number | string;
  loop?: boolean;
  preload?: string;
  crossOrigin?: string;
  playsInline?: boolean;

  // UI & Theme
  uiMode?: string;
  uiConfig?: any;
  theme?: any;

  // Builtin plugins
  builtinPlugins?: any;

  // Debug
  debug?: boolean;
  logger?: any;

  // External plugins
  plugins?: Array<any>;

  // Vue specifics
  containerStyle?: Record<string, any>;
  containerClassName?: string;
  containerProps?: Record<string, any>;
  reinitializeOn?: Array<'src' | 'uiMode'>;
  ssr?: boolean;

  // Style injection
  styleInjection?: 'auto' | 'manual';
  stylesheetUrl?: string;
  nonce?: string;
  injectOnceKey?: string;
}

export interface VueEbinPlayerRef {
  getInstance: () => any;
}

// 注意：Vue组件需要用户手动从源码导入
// import { EbinPlayer } from '@ebin-player/vue2/src/EbinPlayer.vue';