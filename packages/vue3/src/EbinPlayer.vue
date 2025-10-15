<template>
  <div
    ref="containerRef"
    :class="containerClassName"
    :style="containerStyle"
    v-bind="containerProps"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import type { CSSProperties, HTMLAttributes } from 'vue';
import {
  createPlayer,
  type PlayerOptions,
  type ControlBarConfig,
  type PlayerTheme,
  type PluginDefinition,
  version as coreVersion,
} from '@ebin-player/core';
import { ensureStylesInjected, type StyleInjectionMode } from './styleInjection';

export interface VueEbinPlayerProps extends Omit<HTMLAttributes, 
  'children' | 'onRateChange' | 'onTimeUpdate' | 'onVolumeChange' | 'onPlay' | 'onPause' | 'onEnded' | 'onError' | 'onLoadedMetadata' | 'onSeeking' | 'onSeeked' | 'onFullscreenChange' | 'onPictureInPictureChange'> {
  // Core options (direct pass-through)
  src: PlayerOptions['src'];
  autoplay?: PlayerOptions['autoplay'];
  muted?: PlayerOptions['muted'];
  volume?: PlayerOptions['volume'];
  playbackRate?: PlayerOptions['playbackRate'];
  poster?: PlayerOptions['poster'];
  width?: PlayerOptions['width'];
  height?: PlayerOptions['height'];
  loop?: PlayerOptions['loop'];
  preload?: PlayerOptions['preload'];
  crossOrigin?: PlayerOptions['crossOrigin'];
  playsInline?: PlayerOptions['playsInline'];

  // UI & Theme
  uiMode?: PlayerOptions['uiMode'];
  uiConfig?: ControlBarConfig;
  theme?: PlayerTheme;

  // Builtin plugins
  builtinPlugins?: PlayerOptions['builtinPlugins'];

  // Debug
  debug?: PlayerOptions['debug'];
  logger?: PlayerOptions['logger'];

  // External plugins
  plugins?: Array<PluginDefinition | (() => PluginDefinition)>;

  // Vue specifics
  containerStyle?: CSSProperties;
  containerClassName?: string;
  containerProps?: HTMLAttributes;
  reinitializeOn?: Array<'src' | 'uiMode'>;
  ssr?: boolean;

  // Style injection
  styleInjection?: StyleInjectionMode;
  stylesheetUrl?: string;
  nonce?: string;
  injectOnceKey?: string;

  // Events
  onReady?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onTimeUpdate?: (time: number) => void;
  onEnded?: () => void;
  onError?: (error: unknown) => void;
  onLoadedMetadata?: () => void;
  onSeeking?: () => void;
  onSeeked?: () => void;
  onVolumeChange?: (volume: number, muted: boolean) => void;
  onRateChange?: (rate: number) => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;
  onPictureInPictureChange?: (isPip: boolean) => void;
}

export interface VueEbinPlayerRef {
  getInstance: () => any;
}

const props = withDefaults(defineProps<VueEbinPlayerProps>(), {
  reinitializeOn: () => ['src', 'uiMode'],
  ssr: true,
  styleInjection: 'auto',
});

const emit = defineEmits<{
  ready: [];
  play: [];
  pause: [];
  timeupdate: [time: number];
  ended: [];
  error: [error: unknown];
  loadedmetadata: [];
  seeking: [];
  seeked: [];
  volumechange: [volume: number, muted: boolean];
  ratechange: [rate: number];
  fullscreenchange: [isFullscreen: boolean];
  pictureinpicturechange: [isPip: boolean];
}>();

const containerRef = ref<HTMLDivElement | null>(null);
const playerRef = ref<any>(null);
const isInitialized = ref(false);

function pickOptions(props: VueEbinPlayerProps): PlayerOptions {
  const {
    src,
    autoplay,
    muted,
    volume,
    playbackRate,
    poster,
    width,
    height,
    loop,
    preload,
    crossOrigin,
    playsInline,
    uiMode,
    uiConfig,
    theme,
    builtinPlugins,
    debug,
    logger,
  } = props;
  return {
    src,
    autoplay,
    muted,
    volume,
    playbackRate,
    poster,
    width,
    height,
    loop,
    preload,
    crossOrigin,
    playsInline,
    uiMode,
    uiConfig,
    theme,
    builtinPlugins,
    debug,
    logger,
  } as PlayerOptions;
}

const options = computed(() => pickOptions(props));

const containerStyle = computed(() => ({
  width: props.width as any,
  height: props.height as any,
  ...props.containerStyle,
}));

// Style injection (client only)
watch(() => [props.styleInjection, props.stylesheetUrl, props.nonce, props.injectOnceKey], () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  ensureStylesInjected({
    mode: props.styleInjection,
    stylesheetUrl: props.stylesheetUrl,
    nonce: props.nonce,
    injectOnceKey: props.injectOnceKey,
    packageVersion: coreVersion,
  });
}, { immediate: true });

// Initialize / Reinitialize
watch(() => props.reinitializeOn?.map((k: string) => (k === 'src' ? props.src : props.uiMode)), () => {
  if (props.ssr && typeof window === 'undefined') return;
  nextTick(() => {
    initializePlayer();
  });
}, { immediate: true });

// Incremental updates (do not recreate)
watch(() => [props.muted, props.volume, props.playbackRate], () => {
  const inst = playerRef.value;
  if (!inst) return;
  if (props.muted !== undefined) try { inst.setMuted(!!props.muted); } catch {}
  if (props.volume !== undefined) try { inst.setVolume(props.volume); } catch {}
  if (props.playbackRate !== undefined) try { inst.setPlaybackRate(props.playbackRate); } catch {}
});

watch(() => props.uiConfig, (newConfig) => {
  const inst = playerRef.value;
  if (!inst) return;
  if (newConfig) try { inst.updateUIConfig(newConfig); } catch {}
});

watch(() => props.theme, (newTheme) => {
  const inst = playerRef.value;
  if (!inst) return;
  if (newTheme) try { inst.updateUITheme(newTheme); } catch {}
});

function initializePlayer() {
  if (props.ssr && typeof window === 'undefined') return;
  const container = containerRef.value;
  if (!container) return;

  // Clean up existing player
  if (playerRef.value) {
    try {
      playerRef.value.destroy();
    } catch {}
    playerRef.value = null;
    isInitialized.value = false;
  }

  try {
    const instance = createPlayer(container, options.value);
    playerRef.value = instance;

    // External plugins
    if (Array.isArray(props.plugins) && props.plugins.length > 0) {
      props.plugins.forEach((p) => {
        try {
          const def = typeof p === 'function' ? p() : p;
          if (def) instance.use(def as any);
        } catch (e) {
          if (props.onError) props.onError(e);
          emit('error', e);
        }
      });
    }

    // Bind events
    const offList: Array<() => void> = [];
    if (props.onPlay) offList.push(instance.on('play', () => props.onPlay!()));
    if (props.onPause) offList.push(instance.on('pause', () => props.onPause!()));
    if (props.onTimeUpdate) offList.push(instance.on('timeupdate', () => props.onTimeUpdate!(instance.getCurrentTime())));
    if (props.onEnded) offList.push(instance.on('ended', () => props.onEnded!()));
    if (props.onLoadedMetadata) offList.push(instance.on('loadedmetadata', () => props.onLoadedMetadata!()));
    if (props.onSeeking) offList.push(instance.on('seeking', () => props.onSeeking!()));
    if (props.onSeeked) offList.push(instance.on('seeked', () => props.onSeeked!()));
    if (props.onVolumeChange) offList.push(instance.on('volumechange', () => props.onVolumeChange!(instance.getVolume(), instance.getMuted())));
    if (props.onRateChange) offList.push(instance.on('ratechange', () => props.onRateChange!(instance.getPlaybackRate())));
    if (props.onFullscreenChange) offList.push(instance.on('fullscreenchange', () => props.onFullscreenChange!(instance.isFullscreen())));
    if (props.onPictureInPictureChange) {
      offList.push(instance.on('enterpictureinpicture', () => props.onPictureInPictureChange!(true)));
      offList.push(instance.on('leavepictureinpicture', () => props.onPictureInPictureChange!(false)));
    }

    // Emit events
    offList.push(instance.on('play', () => emit('play')));
    offList.push(instance.on('pause', () => emit('pause')));
    offList.push(instance.on('timeupdate', () => emit('timeupdate', instance.getCurrentTime())));
    offList.push(instance.on('ended', () => emit('ended')));
    offList.push(instance.on('error', (e: any) => emit('error', e)));
    offList.push(instance.on('loadedmetadata', () => emit('loadedmetadata')));
    offList.push(instance.on('seeking', () => emit('seeking')));
    offList.push(instance.on('seeked', () => emit('seeked')));
    offList.push(instance.on('volumechange', () => emit('volumechange', instance.getVolume(), instance.getMuted())));
    offList.push(instance.on('ratechange', () => emit('ratechange', instance.getPlaybackRate())));
    offList.push(instance.on('fullscreenchange', () => emit('fullscreenchange', instance.isFullscreen())));
    offList.push(instance.on('enterpictureinpicture', () => emit('pictureinpicturechange', true)));
    offList.push(instance.on('leavepictureinpicture', () => emit('pictureinpicturechange', false)));

    // Cleanup binder on re-init or unmount
    (instance as any).__vueOffList = offList;

    isInitialized.value = true;
    if (props.onReady) props.onReady();
    emit('ready');
  } catch (e) {
    if (props.onError) props.onError(e);
    emit('error', e);
  }
}

onMounted(() => {
  if (!isInitialized.value) {
    initializePlayer();
  }
});

onUnmounted(() => {
  const inst = playerRef.value;
  if (inst) {
    try {
      const offList: Array<() => void> = (inst as any).__vueOffList || [];
      offList.forEach((off) => {
        try { off(); } catch {}
      });
      inst.destroy();
    } catch {}
    playerRef.value = null;
    isInitialized.value = false;
  }
});

// Expose methods
defineExpose({
  getInstance: () => playerRef.value,
});
</script>
