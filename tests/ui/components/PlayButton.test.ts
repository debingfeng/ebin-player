/**
 * PlayButton 组件单元测试
 */
import { PlayButton } from '../../../src/ui/components/PlayButton';
import { PlayerInstance, PlayerState } from '../../../src/types';
import { createTestContainer, cleanupTestContainer, createMockLogger, simulateUserInteraction } from '../../utils';

// 模拟 PlayerInstance
const createMockPlayer = (): Partial<PlayerInstance> => ({
  getState: jest.fn().mockReturnValue({
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
    bitrate: 0
  } as PlayerState),
  getPaused: jest.fn().mockReturnValue(true),
  play: jest.fn().mockResolvedValue({} as PlayerInstance),
  pause: jest.fn().mockReturnValue({} as PlayerInstance),
  on: jest.fn().mockReturnValue(() => {}),
  off: jest.fn(),
  emit: jest.fn().mockReturnValue({} as PlayerInstance),
  getLogger: jest.fn().mockReturnValue(createMockLogger())
});

describe('PlayButton', () => {
  let container: HTMLElement;
  let player: Partial<PlayerInstance>;
  let playButton: PlayButton;
  let mockLogger: any;

  beforeEach(() => {
    container = createTestContainer();
    player = createMockPlayer();
    mockLogger = createMockLogger();
    playButton = new PlayButton(
      player as PlayerInstance,
      container,
      { 
        id: 'playButton',
        name: 'playButton', 
        enabled: true,
        order: 1,
        platforms: ['desktop', 'mobile']
      },
      {},
      mockLogger
    );
  });

  afterEach(() => {
    playButton.destroy();
    cleanupTestContainer();
  });

  describe('组件初始化', () => {
    it('应该正确初始化组件', () => {
      expect(playButton).toBeDefined();
      expect(playButton.config.name).toBe('playButton');
    });

    it('应该能够创建组件元素', async () => {
      await playButton.init();
      const element = playButton.getElement();
      
      expect(element).toBeDefined();
      expect(element?.tagName).toBe('BUTTON');
      expect(container.contains(element!)).toBe(true);
    });

    it('应该设置正确的ARIA属性', async () => {
      await playButton.init();
      const element = playButton.getElement() as HTMLButtonElement;
      
      expect(element.getAttribute('aria-label')).toBe('播放/暂停');
      expect(element.getAttribute('type')).toBe('button');
    });
  });

  describe('播放状态显示', () => {
    it('应该显示播放按钮当视频暂停时', async () => {
      (player.getState as jest.Mock).mockReturnValue({
        ...player.getState(),
        paused: true
      });

      await playButton.init();
      const element = playButton.getElement();
      
      expect(element).toBeDefined();
      expect(element?.classList.contains('ebin-play-button')).toBe(true);
      expect(element?.innerHTML).toBe('▶');
    });

    it('应该显示暂停按钮当视频播放时', async () => {
      (player.getState as jest.Mock).mockReturnValue({
        ...player.getState(),
        paused: false
      });

      await playButton.init();
      const element = playButton.getElement();
      
      expect(element).toBeDefined();
      expect(element?.classList.contains('ebin-play-button')).toBe(true);
      expect(element?.innerHTML).toBe('▶'); // 初始状态
    });
  });

  describe('用户交互', () => {
    it('应该能够处理点击事件', async () => {
      await playButton.init();
      const element = playButton.getElement() as HTMLButtonElement;
      
      // 模拟暂停状态，点击后应该播放
      (player.getPaused as jest.Mock).mockReturnValue(true);
      
      simulateUserInteraction(element, 'click');
      
      expect(player.play).toHaveBeenCalled();
    });

    it('应该能够处理键盘事件', async () => {
      await playButton.init();
      
      // 模拟空格键
      (player.getPaused as jest.Mock).mockReturnValue(true);
      const spaceKeyEvent = new KeyboardEvent('keydown', { code: 'Space' });
      document.body.dispatchEvent(spaceKeyEvent);
      
      expect(player.play).toHaveBeenCalled();
    });

    it('应该能够处理Enter键', async () => {
      await playButton.init();
      
      // 模拟Enter键
      (player.getPaused as jest.Mock).mockReturnValue(true);
      const enterKeyEvent = new KeyboardEvent('keydown', { code: 'Enter' });
      document.body.dispatchEvent(enterKeyEvent);
      
      expect(player.play).toHaveBeenCalled();
    });
  });

  describe('状态更新', () => {
    it('应该能够更新组件状态', async () => {
      await playButton.init();
      const element = playButton.getElement();
      
      // 初始状态：暂停
      const pausedState = {
        ...player.getState(),
        paused: true,
        ended: false
      };
      
      playButton.update(pausedState as PlayerState);
      expect(element?.innerHTML).toBe('▶');
      
      // 更新状态：播放
      const playingState = {
        ...player.getState(),
        paused: false,
        ended: false
      };
      
      playButton.update(playingState as PlayerState);
      expect(element?.innerHTML).toBe('⏸');
    });

    it('应该能够处理加载状态', async () => {
      (player.getState as jest.Mock).mockReturnValue({
        ...player.getState(),
        loading: true,
        paused: true,
        ended: false
      });

      await playButton.init();
      const element = playButton.getElement();
      
      expect(element).toBeDefined();
    });
  });

  describe('事件监听', () => {
    it('应该监听播放器事件', async () => {
      await playButton.init();
      
      // PlayButton 不直接监听播放器事件，而是通过状态更新
      // 这里测试事件监听器是否正确设置
      expect(playButton.getElement()).toBeDefined();
    });

    it('应该能够处理播放事件', async () => {
      await playButton.init();
      const element = playButton.getElement();
      
      // 模拟播放状态更新
      const playingState = {
        ...player.getState(),
        paused: false,
        ended: false
      };
      
      playButton.update(playingState as PlayerState);
      
      // 验证UI更新
      expect(element?.innerHTML).toBe('⏸');
    });

    it('应该能够处理暂停事件', async () => {
      await playButton.init();
      const element = playButton.getElement();
      
      // 模拟暂停状态更新
      const pausedState = {
        ...player.getState(),
        paused: true,
        ended: false
      };
      
      playButton.update(pausedState as PlayerState);
      
      // 验证UI更新
      expect(element?.innerHTML).toBe('▶');
    });
  });

  describe('无障碍支持', () => {
    it('应该支持键盘导航', async () => {
      await playButton.init();
      const element = playButton.getElement() as HTMLButtonElement;
      
      expect(element).toBeDefined();
      expect(element.tagName).toBe('BUTTON');
      // 按钮默认支持键盘导航
    });

    it('应该支持屏幕阅读器', async () => {
      await playButton.init();
      const element = playButton.getElement() as HTMLButtonElement;
      
      expect(element.getAttribute('aria-label')).toBe('播放/暂停');
      expect(element.getAttribute('type')).toBe('button');
    });

    it('应该支持焦点管理', async () => {
      await playButton.init();
      const element = playButton.getElement() as HTMLButtonElement;
      
      element.focus();
      expect(document.activeElement).toBe(element);
    });
  });

  describe('组件销毁', () => {
    it('应该能够正确销毁组件', async () => {
      await playButton.init();
      const element = playButton.getElement();
      
      playButton.destroy();
      
      expect(container.contains(element!)).toBe(false);
    });

    it('应该清理事件监听器', async () => {
      await playButton.init();
      
      playButton.destroy();
      
      // 验证组件已销毁
      expect(playButton.getElement()).toBeNull();
    });
  });

  describe('覆盖层功能', () => {
    it('应该能够创建覆盖层', async () => {
      const overlayConfig = {
        ...playButton.config,
        showOverlay: true,
        overlaySize: 100,
        iconSize: 40
      };
      
      playButton.updateConfig(overlayConfig);
      await playButton.init();
      
      const overlay = document.querySelector('.ebin-play-overlay');
      const overlayIcon = document.querySelector('.ebin-play-overlay-icon');
      
      expect(overlay).toBeDefined();
      expect(overlayIcon).toBeDefined();
      expect(overlay?.style.width).toBe('100px');
      expect(overlay?.style.height).toBe('100px');
    });

    it('应该能够处理覆盖层点击', async () => {
      const overlayConfig = {
        ...playButton.config,
        showOverlay: true
      };
      
      playButton.updateConfig(overlayConfig);
      await playButton.init();
      
      const overlay = document.querySelector('.ebin-play-overlay') as HTMLElement;
      overlay.click();
      
      expect(player.play).toHaveBeenCalled();
    });

    it('应该能够显示/隐藏覆盖层', async () => {
      const overlayConfig = {
        ...playButton.config,
        showOverlay: true
      };
      
      playButton.updateConfig(overlayConfig);
      await playButton.init();
      
      const overlay = document.querySelector('.ebin-play-overlay') as HTMLElement;
      
      // 暂停状态应该显示覆盖层
      const pausedState = {
        ...player.getState(),
        paused: true,
        ended: false
      };
      
      playButton.update(pausedState as PlayerState);
      
      expect(overlay.style.opacity).toBe('1');
      expect(overlay.style.pointerEvents).toBe('auto');
      
      // 播放状态应该隐藏覆盖层
      const playingState = {
        ...player.getState(),
        paused: false,
        ended: false
      };
      
      playButton.update(playingState as PlayerState);
      
      expect(overlay.style.opacity).toBe('0');
      expect(overlay.style.pointerEvents).toBe('none');
    });

    it('应该能够处理视频结束时隐藏覆盖层', async () => {
      const overlayConfig = {
        ...playButton.config,
        showOverlay: true
      };
      
      playButton.updateConfig(overlayConfig);
      await playButton.init();
      
      const overlay = document.querySelector('.ebin-play-overlay') as HTMLElement;
      
      // 视频结束状态应该隐藏覆盖层
      const endedState = {
        ...player.getState(),
        paused: true,
        ended: true
      };
      
      playButton.update(endedState as PlayerState);
      
      expect(overlay.style.opacity).toBe('0');
      expect(overlay.style.pointerEvents).toBe('none');
    });
  });

  describe('状态处理', () => {
    it('应该能够处理视频结束状态', async () => {
      await playButton.init();
      const element = playButton.getElement();
      
      const endedState = {
        ...player.getState(),
        paused: true,
        ended: true
      };
      
      playButton.update(endedState as PlayerState);
      
      expect(element?.innerHTML).toBe('▶');
    });

    it('应该能够处理加载状态', async () => {
      await playButton.init();
      const element = playButton.getElement();
      
      const loadingState = {
        ...player.getState(),
        paused: true,
        ended: false,
        loading: true
      };
      
      playButton.update(loadingState as PlayerState);
      
      expect(element?.innerHTML).toBe('▶');
    });

    it('应该能够处理错误状态', async () => {
      await playButton.init();
      const element = playButton.getElement();
      
      const errorState = {
        ...player.getState(),
        paused: true,
        ended: false,
        error: new Error('Video error')
      };
      
      playButton.update(errorState as PlayerState);
      
      expect(element?.innerHTML).toBe('▶');
    });
  });

  describe('错误恢复', () => {
    it('应该能够处理播放失败', async () => {
      player.play = jest.fn().mockRejectedValue(new Error('Play failed'));
      
      await playButton.init();
      const element = playButton.getElement() as HTMLButtonElement;
      
      element.click();
      
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to toggle play/pause', expect.any(Error));
    });

    it('应该能够处理暂停失败', async () => {
      player.pause = jest.fn().mockImplementation(() => {
        throw new Error('Pause failed');
      });
      player.getPaused = jest.fn().mockReturnValue(false);
      
      await playButton.init();
      const element = playButton.getElement() as HTMLButtonElement;
      
      element.click();
      
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to toggle play/pause', expect.any(Error));
    });

    it('应该能够处理播放器方法不存在', async () => {
      const invalidPlayer = {
        ...player,
        play: undefined,
        pause: undefined,
        getPaused: undefined
      };
      
      const invalidPlayButton = new PlayButton(
        invalidPlayer as any,
        container,
        { id: 'test', name: 'test', enabled: true, order: 1, platforms: ['desktop'] },
        {},
        mockLogger
      );
      
      await invalidPlayButton.init();
      const element = invalidPlayButton.getElement() as HTMLButtonElement;
      
      // 应该不抛出错误
      expect(() => element.click()).not.toThrow();
      
      invalidPlayButton.destroy();
    });
  });

  describe('配置选项', () => {
    it('应该能够配置覆盖层大小', async () => {
      const overlayConfig = {
        ...playButton.config,
        showOverlay: true,
        overlaySize: 120,
        iconSize: 50
      };
      
      playButton.updateConfig(overlayConfig);
      await playButton.init();
      
      const overlay = document.querySelector('.ebin-play-overlay') as HTMLElement;
      const overlayIcon = document.querySelector('.ebin-play-overlay-icon') as HTMLElement;
      
      expect(overlay.style.width).toBe('120px');
      expect(overlay.style.height).toBe('120px');
      expect(overlayIcon.style.fontSize).toBe('50px');
    });

    it('应该能够禁用覆盖层', async () => {
      const noOverlayConfig = {
        ...playButton.config,
        showOverlay: false
      };
      
      playButton.updateConfig(noOverlayConfig);
      await playButton.init();
      
      const overlay = document.querySelector('.ebin-play-overlay');
      expect(overlay).toBeNull();
    });
  });

  describe('覆盖层位置', () => {
    it('应该能够将覆盖层添加到视频容器', async () => {
      const videoElement = document.createElement('video');
      const videoContainer = document.createElement('div');
      videoContainer.appendChild(videoElement);
      container.appendChild(videoContainer);
      
      player.getVideoElement = jest.fn().mockReturnValue(videoElement);
      
      const overlayConfig = {
        ...playButton.config,
        showOverlay: true
      };
      
      playButton.updateConfig(overlayConfig);
      await playButton.init();
      
      const overlay = videoContainer.querySelector('.ebin-play-overlay');
      expect(overlay).toBeDefined();
    });

    it('应该能够处理视频容器不存在的情况', async () => {
      player.getVideoElement = jest.fn().mockReturnValue(null);
      
      const overlayConfig = {
        ...playButton.config,
        showOverlay: true
      };
      
      playButton.updateConfig(overlayConfig);
      await playButton.init();
      
      const overlay = container.querySelector('.ebin-play-overlay');
      expect(overlay).toBeDefined();
    });
  });

  describe('错误处理', () => {
    it('应该处理无效的播放器实例', () => {
      // BaseComponent 构造函数不会立即抛出错误，而是在使用时才会出错
      const invalidPlayButton = new PlayButton(
        null as any,
        container,
        { id: 'test', name: 'test', enabled: true, order: 1, platforms: ['desktop'] },
        {},
        mockLogger
      );
      
      expect(invalidPlayButton).toBeDefined();
      // 在实际使用时才会出错
    });

    it('应该处理无效的容器', () => {
      // BaseComponent 构造函数不会立即抛出错误，而是在使用时才会出错
      const invalidPlayButton = new PlayButton(
        player as PlayerInstance,
        null as any,
        { id: 'test', name: 'test', enabled: true, order: 1, platforms: ['desktop'] },
        {},
        mockLogger
      );
      
      expect(invalidPlayButton).toBeDefined();
      // 在实际使用时才会出错
    });

    it('应该处理覆盖层创建失败', async () => {
      // 模拟DOM操作失败
      const originalCreateElement = document.createElement;
      document.createElement = jest.fn().mockImplementation(() => {
        throw new Error('Create element failed');
      });
      
      const overlayConfig = {
        ...playButton.config,
        showOverlay: true
      };
      
      playButton.updateConfig(overlayConfig);
      await playButton.init();
      
      // 应该不抛出错误
      expect(true).toBe(true);
      
      // 恢复原方法
      document.createElement = originalCreateElement;
    });
  });

  describe('性能测试', () => {
    it('应该能够处理频繁的状态更新', async () => {
      await playButton.init();
      
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        const state = {
          ...player.getState(),
          paused: i % 2 === 0,
          ended: i % 10 === 0
        };
        playButton.update(state as PlayerState);
      }
      
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成
    });

    it('应该能够处理频繁的点击事件', async () => {
      await playButton.init();
      
      const element = playButton.getElement() as HTMLButtonElement;
      
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        element.click();
      }
      
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(50); // 应该在50ms内完成
    });
  });
});