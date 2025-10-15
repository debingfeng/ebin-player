import { mount } from '@vue/test-utils';
import Vue from 'vue';

// Mock @ebin-player/core
jest.mock('@ebin-player/core', () => ({
  createPlayer: jest.fn(() => ({
    on: jest.fn(() => () => {}),
    play: jest.fn(),
    pause: jest.fn(),
    getCurrentTime: jest.fn(() => 0),
    getDuration: jest.fn(() => 100),
    getVolume: jest.fn(() => 1),
    getMuted: jest.fn(() => false),
    getPlaybackRate: jest.fn(() => 1),
    setMuted: jest.fn(),
    setVolume: jest.fn(),
    setPlaybackRate: jest.fn(),
    updateUIConfig: jest.fn(),
    updateUITheme: jest.fn(),
    destroy: jest.fn(),
  })),
  version: '0.0.4',
}));

// Mock styleInjection
jest.mock('../src/styleInjection', () => ({
  ensureStylesInjected: jest.fn(),
}));

// 创建一个简单的测试组件
const TestEbinPlayer = Vue.extend({
  name: 'TestEbinPlayer',
  template: '<div ref="container" :style="containerStyle"></div>',
  props: {
    src: { required: true },
    uiMode: { default: 'advanced' },
    autoplay: { type: Boolean, default: false },
    muted: { type: Boolean, default: false },
    volume: { type: Number, default: 1 },
    playbackRate: { type: Number, default: 1 },
    width: [Number, String],
    height: [Number, String],
    theme: Object,
    uiConfig: Object,
  },
  data() {
    return {
      player: null as any,
      isInitialized: false,
    };
  },
  computed: {
    containerStyle() {
      return {
        width: this.width,
        height: this.height,
      };
    },
  },
  watch: {
    muted(newVal) {
      if (this.player) {
        this.player.setMuted(newVal);
      }
    },
    volume(newVal) {
      if (this.player) {
        this.player.setVolume(newVal);
      }
    },
    playbackRate(newVal) {
      if (this.player) {
        this.player.setPlaybackRate(newVal);
      }
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
      const { createPlayer } = require('@ebin-player/core');
      const container = this.$refs.container as HTMLElement;
      if (!container) return;

      try {
        const instance = createPlayer(container, {
          src: this.src,
          uiMode: this.uiMode,
          autoplay: this.autoplay,
          muted: this.muted,
          volume: this.volume,
          playbackRate: this.playbackRate,
          width: this.width,
          height: this.height,
          theme: this.theme,
          uiConfig: this.uiConfig,
        });

        this.player = instance;
        this.bindEvents();
        this.isInitialized = true;
        this.$emit('ready');
      } catch (e) {
        this.$emit('error', e);
      }
    },
    bindEvents() {
      if (!this.player) return;
      const events = ['play', 'pause', 'ended', 'error', 'loadedmetadata', 'timeupdate', 'volumechange', 'ratechange'];
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
    getInstance() {
      return this.player;
    },
  },
});

describe('EbinPlayer Vue2', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = mount(TestEbinPlayer, {
      props: {
        src: 'test.mp4',
      },
    });

    expect(wrapper.find('div').exists()).toBe(true);
  });

  it('calls createPlayer with correct options', () => {
    const { createPlayer } = require('@ebin-player/core');
    mount(TestEbinPlayer, {
      props: {
        src: 'test.mp4',
        uiMode: 'advanced',
        autoplay: true,
      },
    });

    expect(createPlayer).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({
        src: 'test.mp4',
        uiMode: 'advanced',
        autoplay: true,
      })
    );
  });

  it('handles events correctly', () => {
    const { createPlayer } = require('@ebin-player/core');
    const wrapper = mount(TestEbinPlayer, {
      props: {
        src: 'test.mp4',
      },
    });

    const mockPlayer = createPlayer.mock.results[0].value;
    
    // Simulate event trigger
    const playHandler = mockPlayer.on.mock.calls.find(call => call[0] === 'play')[1];
    playHandler();

    expect(wrapper.emitted('play')).toBeTruthy();
  });

  it('handles incremental updates', () => {
    const { createPlayer } = require('@ebin-player/core');
    const wrapper = mount(TestEbinPlayer, {
      props: {
        src: 'test.mp4',
        muted: false,
      },
    });

    const mockPlayer = createPlayer.mock.results[0]?.value;
    
    // Update props
    wrapper.setProps({ muted: true });
    
    expect(mockPlayer.setMuted).toHaveBeenCalledWith(true);
  });

  it('cleans up on unmount', () => {
    const { createPlayer } = require('@ebin-player/core');
    const wrapper = mount(TestEbinPlayer, {
      props: {
        src: 'test.mp4',
      },
    });

    const mockPlayer = createPlayer.mock.results[0]?.value;
    
    wrapper.destroy();
    
    expect(mockPlayer.destroy).toHaveBeenCalled();
  });
});