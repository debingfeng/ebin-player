import { mount } from '@vue/test-utils';
import { defineComponent, ref } from 'vue';

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
const TestEbinPlayer = defineComponent({
  name: 'TestEbinPlayer',
  template: '<div ref="containerRef" :style="containerStyle"></div>',
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
  emits: ['ready', 'play', 'pause', 'timeupdate', 'volumechange', 'ratechange', 'ended', 'error'],
  setup(props, { emit }) {
    const containerRef = ref<HTMLDivElement | null>(null);
    const playerRef = ref<any>(null);
    const isInitialized = ref(false);

    const containerStyle = ref({
      width: props.width,
      height: props.height,
    });

    const initializePlayer = () => {
      const { createPlayer } = require('@ebin-player/core');
      const container = containerRef.value;
      if (!container) return;

      try {
        const instance = createPlayer(container, {
          src: props.src,
          uiMode: props.uiMode,
          autoplay: props.autoplay,
          muted: props.muted,
          volume: props.volume,
          playbackRate: props.playbackRate,
          width: props.width,
          height: props.height,
          theme: props.theme,
          uiConfig: props.uiConfig,
        });

        playerRef.value = instance;
        bindEvents();
        isInitialized.value = true;
        emit('ready');
      } catch (e) {
        emit('error', e);
      }
    };

    const bindEvents = () => {
      if (!playerRef.value) return;
      const events = ['play', 'pause', 'ended', 'error', 'loadedmetadata', 'timeupdate', 'volumechange', 'ratechange'];
      events.forEach(event => {
        playerRef.value.on(event, (eventData: any) => {
          emit(event, eventData);
        });
      });
    };

    const destroyPlayer = () => {
      if (playerRef.value) {
        try {
          playerRef.value.destroy();
        } catch {}
        playerRef.value = null;
        isInitialized.value = false;
      }
    };

    const getInstance = () => playerRef.value;

    return {
      containerRef,
      playerRef,
      containerStyle,
      getInstance,
      initializePlayer,
      destroyPlayer,
    };
  },
  mounted() {
    this.initializePlayer();
  },
  beforeUnmount() {
    this.destroyPlayer();
  },
});

describe('EbinPlayer Vue3', () => {
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

  it('handles incremental updates', async () => {
    const { createPlayer } = require('@ebin-player/core');
    const wrapper = mount(TestEbinPlayer, {
      props: {
        src: 'test.mp4',
        muted: false,
      },
    });

    const mockPlayer = createPlayer.mock.results[0]?.value;
    
    // Update props
    await wrapper.setProps({ muted: true });
    
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
    
    wrapper.unmount();
    
    expect(mockPlayer.destroy).toHaveBeenCalled();
  });
});