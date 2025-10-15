import React, { useEffect, useImperativeHandle, useMemo, useRef, forwardRef } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';
import {
  createPlayer,
  type PlayerOptions,
  type ControlBarConfig,
  type PlayerTheme,
  type PluginDefinition,
  version as coreVersion,
} from '@ebin-player/core';
import { ensureStylesInjected, type StyleInjectionMode } from './styleInjection';

export interface ReactEbinPlayerProps extends Omit<HTMLAttributes<HTMLDivElement>, 
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

  // React specifics
  containerStyle?: CSSProperties;
  containerClassName?: string;
  containerProps?: HTMLAttributes<HTMLDivElement>;
  reinitializeOn?: Array<'src' | 'uiMode'>;
  ssr?: boolean;

  // Style injection
  styleInjection?: StyleInjectionMode; // 'auto' | 'manual'
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

export interface ReactEbinPlayerRef {
  getInstance: () => any;
}

function pickOptions(props: ReactEbinPlayerProps): PlayerOptions {
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

export const EbinPlayer = forwardRef<ReactEbinPlayerRef, ReactEbinPlayerProps>(function EbinPlayer(
  props: ReactEbinPlayerProps,
  ref: React.Ref<ReactEbinPlayerRef>,
) {
  const {
    containerStyle,
    containerClassName,
    reinitializeOn = ['src', 'uiMode'],
    ssr = true,
    styleInjection = 'auto',
    stylesheetUrl,
    nonce,
    injectOnceKey,
    plugins,
    onReady,
    onPlay,
    onPause,
    onTimeUpdate,
    onEnded,
    onError,
    onLoadedMetadata,
    onSeeking,
    onSeeked,
    onVolumeChange,
    onRateChange,
    onFullscreenChange,
    onPictureInPictureChange,
    containerProps,
    ...restUnused
  } = props;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const options = useMemo(() => pickOptions(props), [
    props.src,
    props.autoplay,
    props.muted,
    props.volume,
    props.playbackRate,
    props.poster,
    props.width,
    props.height,
    props.loop,
    props.preload,
    props.crossOrigin,
    props.playsInline,
    props.uiMode,
    props.uiConfig,
    props.theme,
    props.builtinPlugins,
    props.debug,
    props.logger,
  ]);

  // Style injection (client only)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    ensureStylesInjected({
      mode: styleInjection,
      stylesheetUrl,
      nonce,
      injectOnceKey,
      packageVersion: coreVersion,
    });
  }, [styleInjection, stylesheetUrl, nonce, injectOnceKey]);

  // Initialize / Reinitialize
  useEffect(() => {
    if (ssr && typeof window === 'undefined') return;
    const container = containerRef.current;
    if (!container) return;

    const create = () => {
      try {
        const instance = createPlayer(container, options);
        playerRef.current = instance;

        // External plugins
        if (Array.isArray(plugins) && plugins.length > 0) {
          plugins.forEach((p) => {
            try {
              const def = typeof p === 'function' ? p() : p;
              if (def) instance.use(def as any);
            } catch (e) {
              if (onError) onError(e);
            }
          });
        }

        // Bind events
        const offList: Array<() => void> = [];
        if (onPlay) offList.push(instance.on('play', () => onPlay()));
        if (onPause) offList.push(instance.on('pause', () => onPause()));
        if (onTimeUpdate) offList.push(instance.on('timeupdate', () => onTimeUpdate(instance.getCurrentTime())));
        if (onEnded) offList.push(instance.on('ended', () => onEnded()));
        if (onLoadedMetadata) offList.push(instance.on('loadedmetadata', () => onLoadedMetadata()));
        if (onSeeking) offList.push(instance.on('seeking', () => onSeeking()));
        if (onSeeked) offList.push(instance.on('seeked', () => onSeeked()));
        if (onVolumeChange) offList.push(instance.on('volumechange', () => onVolumeChange(instance.getVolume(), instance.getMuted())));
        if (onRateChange) offList.push(instance.on('ratechange', () => onRateChange(instance.getPlaybackRate())));
        if (onFullscreenChange) offList.push(instance.on('fullscreenchange', () => onFullscreenChange(instance.isFullscreen())));
        if (onPictureInPictureChange) {
          offList.push(instance.on('enterpictureinpicture', () => onPictureInPictureChange(true)));
          offList.push(instance.on('leavepictureinpicture', () => onPictureInPictureChange(false)));
        }

        // Ready
        if (onReady) onReady();

        // Cleanup binder on re-init or unmount
        (instance as any).__reactOffList = offList;
      } catch (e) {
        if (onError) onError(e);
      }
    };

    create();
    return () => {
      const inst = playerRef.current;
      if (inst) {
        try {
          const offList: Array<() => void> = (inst as any).__reactOffList || [];
          offList.forEach((off) => {
          try { off(); } catch {}
          });
          inst.destroy();
        } catch {}
        playerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, reinitializeOn.map((k: string) => (k === 'src' ? props.src : props.uiMode)));

  // Incremental updates (do not recreate)
  useEffect(() => {
    const inst = playerRef.current;
    if (!inst) return;
    if (props.muted !== undefined) try { inst.setMuted(!!props.muted); } catch {}
    if (props.volume !== undefined) try { inst.setVolume(props.volume); } catch {}
    if (props.playbackRate !== undefined) try { inst.setPlaybackRate(props.playbackRate); } catch {}
  }, [props.muted, props.volume, props.playbackRate]);

  useEffect(() => {
    const inst = playerRef.current;
    if (!inst) return;
    if (props.uiConfig) try { inst.updateUIConfig(props.uiConfig); } catch {}
  }, [props.uiConfig]);

  useEffect(() => {
    const inst = playerRef.current;
    if (!inst) return;
    if (props.theme) try { inst.updateUITheme(props.theme); } catch {}
  }, [props.theme]);

  useImperativeHandle(ref, () => ({
    getInstance: () => playerRef.current,
  }), []);

  return (
    <div
      ref={containerRef}
      className={containerClassName}
      style={{ width: props.width as any, height: props.height as any, ...containerStyle }}
      {...(containerProps as any)}
    />
  );
});

export default EbinPlayer;


