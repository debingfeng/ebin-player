/**
 * 测试入口文件
 * 用于组织和导出所有测试相关的工具和配置
 */

// 导出测试工具
export * from './utils';

// 导出测试设置
export { default as setup } from './setup';

// 测试配置常量
export const TEST_CONFIG = {
  // 测试超时时间
  TIMEOUT: 5000,
  
  // 测试视频URL
  TEST_VIDEO_URL: 'https://example.com/test-video.mp4',
  
  // 测试容器尺寸
  CONTAINER_WIDTH: 800,
  CONTAINER_HEIGHT: 450,
  
  // 测试数据
  TEST_STATE: {
    src: 'https://example.com/test-video.mp4',
    currentTime: 0,
    duration: 120,
    paused: true,
    muted: false,
    volume: 1,
    playbackRate: 1,
    readyState: 4,
    networkState: 1,
    error: null,
    ended: false,
    loading: false,
    seeking: false,
    videoWidth: 1920,
    videoHeight: 1080,
    buffered: null,
    seekable: null,
    quality: 'auto',
    bitrate: 0
  }
} as const;

// 测试环境检查
export const isTestEnvironment = () => {
  return process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;
};

// 测试数据生成器
export const createTestData = {
  playerOptions: (overrides = {}) => ({
    src: TEST_CONFIG.TEST_VIDEO_URL,
    autoplay: false,
    muted: true,
    volume: 0.8,
    playbackRate: 1,
    width: TEST_CONFIG.CONTAINER_WIDTH,
    height: TEST_CONFIG.CONTAINER_HEIGHT,
    uiMode: 'custom' as any,
    debug: false,
    ...overrides
  }),

  playerState: (overrides = {}) => ({
    ...TEST_CONFIG.TEST_STATE,
    ...overrides
  }),

  componentConfig: (overrides = {}) => ({
    id: 'test-component',
    name: 'Test Component',
    enabled: true,
    order: 1,
    platforms: ['desktop', 'mobile'] as const,
    ...overrides
  })
};
