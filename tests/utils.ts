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
  
  // 使用 Object.defineProperty 来设置只读属性
  Object.defineProperty(video, 'duration', {
    value: 120, // 2分钟
    writable: false,
    configurable: true
  });
  
  Object.defineProperty(video, 'paused', {
    value: true,
    writable: false,
    configurable: true
  });
  
  Object.defineProperty(video, 'muted', {
    value: false,
    writable: false,
    configurable: true
  });
  
  Object.defineProperty(video, 'volume', {
    value: 1,
    writable: false,
    configurable: true
  });
  
  Object.defineProperty(video, 'playbackRate', {
    value: 1,
    writable: false,
    configurable: true
  });
  
  Object.defineProperty(video, 'readyState', {
    value: 4, // HAVE_ENOUGH_DATA
    writable: false,
    configurable: true
  });
  
  Object.defineProperty(video, 'networkState', {
    value: 1, // NETWORK_IDLE
    writable: false,
    configurable: true
  });
  
  Object.defineProperty(video, 'videoWidth', {
    value: 1920,
    writable: false,
    configurable: true
  });
  
  Object.defineProperty(video, 'videoHeight', {
    value: 1080,
    writable: false,
    configurable: true
  });
  
  video.currentTime = 0;
  
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
  const mockLogger: any = {
    setEnabled: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  };
  
  // child方法返回一个新的logger实例，而不是返回自身
  mockLogger.child = jest.fn().mockReturnValue({
    setEnabled: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    child: jest.fn().mockReturnThis() // 支持链式调用
  });
  
  return mockLogger;
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

/**
 * 创建模拟的插件管理器
 */
export function createMockPluginManager() {
  return {
    use: jest.fn(),
    unuse: jest.fn(),
    getPlugin: jest.fn(),
    getPluginIds: jest.fn().mockReturnValue([]),
    hasPlugin: jest.fn().mockReturnValue(false),
    getPlugins: jest.fn().mockReturnValue([]),
    updatePluginConfig: jest.fn(),
    registerCommand: jest.fn(),
    invokeCommand: jest.fn(),
    getPluginStats: jest.fn().mockReturnValue({
      totalPlugins: 0,
      pluginIds: [],
      totalDataEntries: 0,
      totalEventListeners: 0
    }),
    checkPluginConflicts: jest.fn().mockReturnValue([]),
    initializeFromOptions: jest.fn(),
    updateFromOptions: jest.fn(),
    destroy: jest.fn()
  };
}

/**
 * 创建模拟的UI管理器
 */
export function createMockUIManager() {
  return {
    init: jest.fn().mockResolvedValue(undefined),
    updateConfig: jest.fn(),
    updateTheme: jest.fn(),
    registerComponent: jest.fn(),
    unregisterComponent: jest.fn(),
    getComponent: jest.fn(),
    getAllComponents: jest.fn().mockReturnValue([]),
    showControlBar: jest.fn(),
    hideControlBar: jest.fn(),
    toggleControlBar: jest.fn(),
    showPlayOverlay: jest.fn(),
    hidePlayOverlay: jest.fn(),
    showLoadingIndicator: jest.fn(),
    hideLoadingIndicator: jest.fn(),
    updateState: jest.fn(),
    destroy: jest.fn()
  };
}

/**
 * 创建模拟的主题管理器
 */
export function createMockThemeManager() {
  return {
    getCurrentTheme: jest.fn().mockReturnValue({
      id: 'default',
      name: '默认主题',
      colors: {
        primary: '#3b82f6',
        secondary: '#6c757d',
        background: 'rgba(0, 0, 0, 0.8)',
        surface: 'rgba(255, 255, 255, 0.1)',
        text: '#ffffff',
        textSecondary: 'rgba(255, 255, 255, 0.7)',
        border: 'rgba(255, 255, 255, 0.2)',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
      }
    }),
    setTheme: jest.fn(),
    registerTheme: jest.fn(),
    getAvailableThemes: jest.fn().mockReturnValue([]),
    getThemeCSSVariables: jest.fn().mockReturnValue({}),
    toComponentTheme: jest.fn().mockReturnValue({
      primaryColor: '#3b82f6',
      secondaryColor: '#6c757d',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      textColor: '#ffffff',
      borderRadius: 4,
      fontSize: '1rem',
      spacing: 16
    }),
    detectSystemTheme: jest.fn().mockReturnValue('light'),
    watchSystemTheme: jest.fn().mockReturnValue(() => {}),
    onThemeChange: jest.fn().mockReturnValue(() => {}),
    destroy: jest.fn()
  };
}

/**
 * 创建模拟的响应式管理器
 */
export function createMockResponsiveManager() {
  return {
    getCurrentState: jest.fn().mockReturnValue({
      screenType: 'desktop',
      width: 1920,
      height: 1080,
      orientation: 'landscape',
      isTouch: false,
      pixelRatio: 1
    }),
    getCurrentScreenType: jest.fn().mockReturnValue('desktop'),
    isMobile: jest.fn().mockReturnValue(false),
    isTablet: jest.fn().mockReturnValue(false),
    isDesktop: jest.fn().mockReturnValue(true),
    isTouchDevice: jest.fn().mockReturnValue(false),
    getLayoutForScreen: jest.fn().mockReturnValue({}),
    getVisibleComponentsForScreen: jest.fn().mockReturnValue([]),
    getResponsiveSpacing: jest.fn().mockImplementation((base) => base),
    getResponsiveFontSize: jest.fn().mockImplementation((base) => base),
    shouldShowComponent: jest.fn().mockReturnValue(true),
    getComponentConfigForScreen: jest.fn().mockReturnValue({}),
    onStateChange: jest.fn().mockReturnValue(() => {}),
    startWatching: jest.fn(),
    stopWatching: jest.fn(),
    destroy: jest.fn()
  };
}

/**
 * 创建模拟的组件
 */
export function createMockComponent() {
  return {
    init: jest.fn().mockResolvedValue(undefined),
    update: jest.fn(),
    updateConfig: jest.fn(),
    updateTheme: jest.fn(),
    getElement: jest.fn().mockReturnValue(null),
    getConfig: jest.fn().mockReturnValue({}),
    destroy: jest.fn()
  };
}

/**
 * 模拟响应式变化
 */
export function simulateResponsiveChange(state: any) {
  const event = new CustomEvent('responsivechange', { detail: state });
  window.dispatchEvent(event);
}

/**
 * 模拟触摸事件
 */
export function simulateTouchEvent(element: HTMLElement, eventType: string, touches: Touch[] = []) {
  const touchEvent = new TouchEvent(eventType, {
    bubbles: true,
    cancelable: true,
    touches: touches as any,
    targetTouches: touches as any,
    changedTouches: touches as any
  });
  element.dispatchEvent(touchEvent);
}

/**
 * 模拟媒体查询
 */
export function mockMediaQuery(query: string, matches: boolean) {
  const mediaQueryList = {
    matches,
    media: query,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  };
  
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((q) => q === query ? mediaQueryList : { matches: false })
  });
  
  return mediaQueryList;
}

/**
 * 模拟ResizeObserver
 */
export function mockResizeObserver() {
  const ResizeObserverMock = jest.fn().mockImplementation((callback) => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
    callback
  }));
  
  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: ResizeObserverMock
  });
  
  return ResizeObserverMock;
}

/**
 * 创建模拟的播放器状态
 */
export function createMockPlayerState(overrides: Partial<any> = {}): any {
  return {
    src: 'test-video.mp4',
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
    bitrate: 0,
    ...overrides
  };
}

/**
 * 创建模拟的播放器实例
 */
export function createMockPlayerInstance(overrides: Partial<any> = {}): any {
  const mockState = createMockPlayerState();
  
  return {
    getState: jest.fn().mockReturnValue(mockState),
    getPaused: jest.fn().mockReturnValue(true),
    getMuted: jest.fn().mockReturnValue(false),
    getVolume: jest.fn().mockReturnValue(1),
    getCurrentTime: jest.fn().mockReturnValue(0),
    getDuration: jest.fn().mockReturnValue(120),
    getPlaybackRate: jest.fn().mockReturnValue(1),
    getVideoElement: jest.fn().mockReturnValue(createMockVideoElement()),
    getContainer: jest.fn().mockReturnValue(createTestContainer()),
    play: jest.fn().mockResolvedValue({}),
    pause: jest.fn().mockReturnValue({}),
    setVolume: jest.fn().mockReturnValue({}),
    setMuted: jest.fn().mockReturnValue({}),
    setCurrentTime: jest.fn().mockReturnValue({}),
    setPlaybackRate: jest.fn().mockReturnValue({}),
    on: jest.fn().mockReturnValue(() => {}),
    off: jest.fn(),
    emit: jest.fn().mockReturnValue({}),
    getLogger: jest.fn().mockReturnValue(createMockLogger()),
    ...overrides
  };
}

/**
 * 等待DOM更新
 */
export function waitForDOMUpdate(): Promise<void> {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });
}

/**
 * 模拟键盘事件
 */
export function simulateKeyboardEvent(element: HTMLElement, key: string, options: KeyboardEventInit = {}) {
  const event = new KeyboardEvent('keydown', {
    key,
    code: key,
    bubbles: true,
    cancelable: true,
    ...options
  });
  element.dispatchEvent(event);
}

/**
 * 模拟鼠标事件
 */
export function simulateMouseEvent(element: HTMLElement, eventType: string, options: MouseEventInit = {}) {
  const event = new MouseEvent(eventType, {
    bubbles: true,
    cancelable: true,
    clientX: 0,
    clientY: 0,
    ...options
  });
  element.dispatchEvent(event);
}

/**
 * 模拟滚轮事件
 */
export function simulateWheelEvent(element: HTMLElement, deltaY: number, options: WheelEventInit = {}) {
  const event = new WheelEvent('wheel', {
    bubbles: true,
    cancelable: true,
    deltaY,
    ...options
  });
  element.dispatchEvent(event);
}

/**
 * 创建模拟的TimeRanges对象
 */
export function createMockTimeRanges(ranges: Array<{start: number, end: number}> = []): TimeRanges {
  return {
    length: ranges.length,
    start: jest.fn().mockImplementation((index: number) => ranges[index]?.start || 0),
    end: jest.fn().mockImplementation((index: number) => ranges[index]?.end || 0)
  } as any;
}

/**
 * 创建模拟的插件定义
 */
export function createMockPluginDefinition(overrides: Partial<any> = {}) {
  return {
    meta: {
      id: 'test-plugin',
      version: '1.0.0',
      displayName: 'Test Plugin',
      description: 'A test plugin',
      capabilities: [],
      permissions: []
    },
    defaultConfig: {},
    configVersion: 1,
    onInit: jest.fn(),
    onStart: jest.fn(),
    onConfigChange: jest.fn(),
    onDestroy: jest.fn(),
    validateConfig: jest.fn().mockReturnValue({ valid: true, errors: [] }),
    commands: {},
    migrations: [],
    ...overrides
  };
}
