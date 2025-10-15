<template>
  <div
    ref="container"
    :class="containerClassName"
    :style="containerStyle"
    v-bind="containerProps"
  />
</template>

<script lang="ts">
import Vue from 'vue';
import {
  createPlayer,
  type PlayerOptions,
  type ControlBarConfig,
  type PlayerTheme,
  type PluginDefinition,
  version as coreVersion,
} from '@ebin-player/core';
import { ensureStylesInjected, type StyleInjectionMode } from './styleInjection';

export interface VueEbinPlayerProps {
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
  containerStyle?: Record<string, any>;
  containerClassName?: string;
  containerProps?: Record<string, any>;
  reinitializeOn?: Array<'src' | 'uiMode'>;
  ssr?: boolean;

  // Style injection
  styleInjection?: StyleInjectionMode;
  stylesheetUrl?: string;
  nonce?: string;
  injectOnceKey?: string;
}

export interface VueEbinPlayerRef {
  getInstance: () => any;
}

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

export default Vue.extend({
  name: 'EbinPlayer',
  props: {
    // Core options
    src: {
      type: [String, Object] as Vue.PropType<PlayerOptions['src']>,
      required: true,
    },
    autoplay: Boolean,
    muted: Boolean,
    volume: Number,
    playbackRate: Number,
    poster: String,
    width: [Number, String] as Vue.PropType<PlayerOptions['width']>,
    height: [Number, String] as Vue.PropType<PlayerOptions['height']>,
    loop: Boolean,
    preload: String as Vue.PropType<PlayerOptions['preload']>,
    crossOrigin: String as Vue.PropType<PlayerOptions['crossOrigin']>,
    playsInline: Boolean,

    // UI & Theme
    uiMode: String as Vue.PropType<PlayerOptions['uiMode']>,
    uiConfig: Object as Vue.PropType<ControlBarConfig>,
    theme: Object as Vue.PropType<PlayerTheme>,

    // Builtin plugins
    builtinPlugins: Object as Vue.PropType<PlayerOptions['builtinPlugins']>,

    // Debug
    debug: Boolean,
    logger: Object as Vue.PropType<PlayerOptions['logger']>,

    // External plugins
    plugins: Array as Vue.PropType<Array<PluginDefinition | (() => PluginDefinition)>>,

    // Vue specifics
    containerStyle: Object as Vue.PropType<Record<string, any>>,
    containerClassName: String,
    containerProps: Object as Vue.PropType<Record<string, any>>,
    reinitializeOn: {
      type: Array as Vue.PropType<Array<'src' | 'uiMode'>>,
      default: () => ['src', 'uiMode'],
    },
    ssr: {
      type: Boolean,
      default: true,
    },

    // Style injection
    styleInjection: {
      type: String as Vue.PropType<StyleInjectionMode>,
      default: 'auto',
    },
    stylesheetUrl: String,
    nonce: String,
    injectOnceKey: String,
  },
  data() {
    return {
      player: null as any,
      isInitialized: false,
    };
  },
  computed: {
    options(): PlayerOptions {
      return pickOptions(this.$props as VueEbinPlayerProps);
    },
    containerStyle(): Record<string, any> {
      return {
        width: this.width as any,
        height: this.height as any,
        ...this.containerStyle,
      };
    },
  },
  watch: {
    options: {
      handler(newOptions: PlayerOptions) {
        if (this.isInitialized && this.player) {
          // Handle incremental updates
          if (newOptions.muted !== undefined) {
            try {
              this.player.setMuted(!!newOptions.muted);
            } catch {}
          }
          if (newOptions.volume !== undefined) {
            try {
              this.player.setVolume(newOptions.volume);
            } catch {}
          }
          if (newOptions.playbackRate !== undefined) {
            try {
              this.player.setPlaybackRate(newOptions.playbackRate);
            } catch {}
          }
        }
      },
      deep: true,
    },
    'options.uiConfig': {
      handler(newConfig: ControlBarConfig) {
        if (this.isInitialized && this.player && newConfig) {
          try {
            this.player.updateUIConfig(newConfig);
          } catch {}
        }
      },
      deep: true,
    },
    'options.theme': {
      handler(newTheme: PlayerTheme) {
        if (this.isInitialized && this.player && newTheme) {
          try {
            this.player.updateUITheme(newTheme);
          } catch {}
        }
      },
      deep: true,
    },
  },
  mounted() {
    this.initializePlayer();
  },
  beforeDestroy() {
    this.destroyPlayer();
  },
  methods: {
    initializePlayer() {
      if (this.ssr && typeof window === 'undefined') return;
      
      const container = this.$refs.container as HTMLElement;
      if (!container) return;

      // Style injection (client only)
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        ensureStylesInjected({
          mode: this.styleInjection,
          stylesheetUrl: this.stylesheetUrl,
          nonce: this.nonce,
          injectOnceKey: this.injectOnceKey,
          packageVersion: coreVersion,
        });
      }

      try {
        const instance = createPlayer(container, this.options);
        this.player = instance;

        // External plugins
        if (Array.isArray(this.plugins) && this.plugins.length > 0) {
          this.plugins.forEach((p) => {
            try {
              const def = typeof p === 'function' ? p() : p;
              if (def) instance.use(def as any);
            } catch (e) {
              this.$emit('error', e);
            }
          });
        }

        // Bind events
        this.bindEvents();

        this.isInitialized = true;
        this.$emit('ready');
      } catch (e) {
        this.$emit('error', e);
      }
    },

    bindEvents() {
      if (!this.player) return;

      const events = [
        'play', 'pause', 'ended', 'error', 'loadedmetadata',
        'seeking', 'seeked', 'timeupdate', 'volumechange',
        'ratechange', 'fullscreenchange', 'enterpictureinpicture',
        'leavepictureinpicture'
      ];

      events.forEach(event => {
        this.player.on(event, (eventData: any) => {
          this.$emit(event, eventData);
        });
      });
    },

    destroyPlayer() {
      if (this.player) {
        try {
          this.player.destroy();
        } catch {}
        this.player = null;
        this.isInitialized = false;
      }
    },

    // Public methods
    getInstance() {
      return this.player;
    },
  },
});
</script>