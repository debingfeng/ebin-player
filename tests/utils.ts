/**
 * 测试工具函数
 */
import { PlayerOptions, UIMode } from '../src/types';

/**
 * 创建测试用的容器元素
 */
export function createTestContainer(): HTMLElement {
  const container = document.createElement('div');
  container.id = 'test-player-container';
  container.style.width = '800px';
  container.style.height = '450px';
  document.body.appendChild(container);
  return container;
}

/**
 * 清理测试容器
 */
export function cleanupTestContainer(): void {
  const container = document.getElementById('test-player-container');
  if (container) {
    container.remove();
  }
}

/**
 * 创建默认的播放器选项
 */
export function createDefaultPlayerOptions(): PlayerOptions {
  return {
    src: 'https://example.com/test-video.mp4',
    autoplay: false,
    muted: true,
    volume: 0.8,
    playbackRate: 1,
    width: 800,
    height: 450,
    uiMode: UIMode.CUSTOM,
    debug: false
  };
}

/**
 * 创建测试用的视频元素
 */
export function createMockVideoElement(): HTMLVideoElement {
  const video = document.createElement('video');
  
  // 设置默认属性
  video.src = 'https://example.com/test-video.mp4';
  video.duration = 120; // 2分钟
  video.currentTime = 0;
  video.paused = true;
  video.muted = false;
  video.volume = 1;
  video.playbackRate = 1;
  video.readyState = 4; // HAVE_ENOUGH_DATA
  video.networkState = 1; // NETWORK_IDLE
  video.videoWidth = 1920;
  video.videoHeight = 1080;
  
  return video;
}

/**
 * 模拟视频事件
 */
export function simulateVideoEvent(video: HTMLVideoElement, eventType: string): void {
  const event = new Event(eventType, { bubbles: true, cancelable: true });
  video.dispatchEvent(event);
}

/**
 * 等待异步操作完成
 */
export function waitFor(ms: number = 0): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 等待条件满足
 */
export async function waitForCondition(
  condition: () => boolean,
  timeout: number = 1000,
  interval: number = 10
): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (condition()) {
      return;
    }
    await waitFor(interval);
  }
  
  throw new Error(`Condition not met within ${timeout}ms`);
}

/**
 * 模拟用户交互
 */
export function simulateUserInteraction(element: HTMLElement, eventType: string): void {
  const event = new MouseEvent(eventType, {
    bubbles: true,
    cancelable: true,
    clientX: 0,
    clientY: 0
  });
  element.dispatchEvent(event);
}

/**
 * 创建模拟的Logger
 */
export function createMockLogger() {
  return {
    setEnabled: jest.fn(),
    child: jest.fn().mockReturnThis(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  };
}

/**
 * 创建模拟的插件上下文
 */
export function createMockPluginContext() {
  return {
    player: {} as any,
    logger: createMockLogger(),
    on: jest.fn().mockReturnValue(() => {}),
    off: jest.fn(),
    emit: jest.fn(),
    onAnyPlayerEvent: jest.fn().mockReturnValue(() => {}),
    onPluginEvent: jest.fn().mockReturnValue(() => {}),
    emitPluginEvent: jest.fn(),
    registerService: jest.fn(),
    getService: jest.fn(),
    getConfig: jest.fn().mockReturnValue({}),
    setConfig: jest.fn(),
    storage: {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      keys: jest.fn().mockReturnValue([])
    },
    hasPermission: jest.fn().mockReturnValue(true)
  };
}
