/**
 * ProgressBar 单元测试
 */
import { ProgressBar, ProgressBarConfig } from '../../../src/ui/components/ProgressBar';
import { 
  createMockPlayerInstance, 
  createMockLogger, 
  createTestContainer,
  cleanupTestContainer,
  createMockTimeRanges,
  waitFor,
  simulateUserInteraction,
  simulateMouseEvent,
  simulateTouchEvent,
  simulateKeyboardEvent
} from '../../utils';

describe('ProgressBar', () => {
  let container: HTMLElement;
  let player: any;
  let logger: any;
  let progressBar: ProgressBar;
  let config: ProgressBarConfig;

  beforeEach(() => {
    container = createTestContainer();
    player = createMockPlayerInstance({
      getCurrentTime: jest.fn().mockReturnValue(30),
      getDuration: jest.fn().mockReturnValue(120),
      setCurrentTime: jest.fn().mockReturnValue({}),
      getState: jest.fn().mockReturnValue({
        currentTime: 30,
        duration: 120,
        buffered: createMockTimeRanges([{ start: 0, end: 60 }])
      })
    });
    logger = createMockLogger();
    config = {
      id: 'progressBar',
      name: 'Progress Bar',
      enabled: true,
      order: 1,
      platforms: ['desktop', 'mobile'],
      showThumb: true,
      showBuffered: true,
      clickToSeek: true,
      keyboardSeek: true,
      seekStep: 5
    };
    progressBar = new ProgressBar(player, container, config, {}, logger);
  });

  // 辅助函数：模拟UIManager的行为
  const mountComponent = async () => {
    await progressBar.init();
    const element = progressBar.getElement();
    if (element) {
      container.appendChild(element);
    }
  };

  afterEach(() => {
    progressBar.destroy();
    cleanupTestContainer();
  });

  describe('基础功能', () => {
    it('应该能够创建进度条元素', async () => {
      await mountComponent();
      
      const progressContainer = container.querySelector('.ebin-progress-container');
      const progressBarElement = container.querySelector('.ebin-progress-bar');
      const thumb = container.querySelector('.ebin-progress-thumb');
      const bufferedBar = container.querySelector('.ebin-buffered-bar');
      
      expect(progressContainer).toBeDefined();
      expect(progressBarElement).toBeDefined();
      expect(thumb).toBeDefined();
      expect(bufferedBar).toBeDefined();
    });

    it('应该能够设置ARIA属性', async () => {
      await mountComponent();
      
      const progressContainer = container.querySelector('.ebin-progress-container');
      
      expect(progressContainer?.getAttribute('role')).toBe('slider');
      expect(progressContainer?.getAttribute('aria-label')).toBe('播放进度');
      expect(progressContainer?.getAttribute('aria-valuemin')).toBe('0');
      expect(progressContainer?.getAttribute('aria-valuemax')).toBe('100');
    });

    it('应该能够更新进度显示', async () => {
      await mountComponent();
      
      const state = {
        currentTime: 60,
        duration: 120,
        buffered: createMockTimeRanges([{ start: 0, end: 90 }])
      };
      
      progressBar.update(state as any);
      
      const progressBarElement = container.querySelector('.ebin-progress-bar') as HTMLElement;
      const thumb = container.querySelector('.ebin-progress-thumb') as HTMLElement;
      
      expect(progressBarElement.style.width).toBe('50%');
      expect(thumb.style.left).toBe('50%');
    });

    it('应该能够更新缓冲进度', async () => {
      await mountComponent();
      
      const state = {
        currentTime: 30,
        duration: 120,
        buffered: createMockTimeRanges([{ start: 0, end: 60 }])
      };
      
      progressBar.update(state as any);
      
      const bufferedBar = container.querySelector('.ebin-buffered-bar') as HTMLElement;
      expect(bufferedBar.style.width).toBe('50%');
    });
  });

  describe('交互功能', () => {
    it('应该能够处理点击跳转', async () => {
      await mountComponent();
      
      const progressContainer = container.querySelector('.ebin-progress-container') as HTMLElement;
      
      // 模拟点击事件
      const rect = progressContainer.getBoundingClientRect();
      const clickEvent = new MouseEvent('click', {
        clientX: rect.left + rect.width * 0.5, // 点击中间位置
        clientY: rect.top
      });
      
      Object.defineProperty(progressContainer, 'getBoundingClientRect', {
        value: () => rect,
        writable: true
      });
      
      progressContainer.dispatchEvent(clickEvent);
      
      expect(player.setCurrentTime).toHaveBeenCalledWith(60); // 50% of 120
    });

    it('应该能够处理拖拽操作', async () => {
      await mountComponent();
      
      const thumb = container.querySelector('.ebin-progress-thumb') as HTMLElement;
      const progressContainer = container.querySelector('.ebin-progress-container') as HTMLElement;
      
      const rect = { left: 0, width: 200 };
      Object.defineProperty(progressContainer, 'getBoundingClientRect', {
        value: () => rect,
        writable: true
      });
      
      // 开始拖拽
      const mousedownEvent = new MouseEvent('mousedown', {
        clientX: 50,
        clientY: 0
      });
      thumb.dispatchEvent(mousedownEvent);
      
      // 拖拽
      const mousemoveEvent = new MouseEvent('mousemove', {
        clientX: 100,
        clientY: 0
      });
      document.dispatchEvent(mousemoveEvent);
      
      // 结束拖拽
      const mouseupEvent = new MouseEvent('mouseup');
      document.dispatchEvent(mouseupEvent);
      
      expect(player.setCurrentTime).toHaveBeenCalled();
    });

    it('应该能够处理触摸拖拽', async () => {
      await mountComponent();
      
      const thumb = container.querySelector('.ebin-progress-thumb') as HTMLElement;
      const progressContainer = container.querySelector('.ebin-progress-container') as HTMLElement;
      
      const rect = { left: 0, width: 200 };
      Object.defineProperty(progressContainer, 'getBoundingClientRect', {
        value: () => rect,
        writable: true
      });
      
      // 创建模拟的触摸对象
      const touch = {
        clientX: 50,
        clientY: 0
      } as Touch;
      
      // 开始触摸
      const touchstartEvent = new TouchEvent('touchstart', {
        touches: [touch] as any
      });
      thumb.dispatchEvent(touchstartEvent);
      
      // 触摸移动
      const touchmoveEvent = new TouchEvent('touchmove', {
        touches: [{ ...touch, clientX: 100 }] as any
      });
      document.dispatchEvent(touchmoveEvent);
      
      // 结束触摸
      const touchendEvent = new TouchEvent('touchend');
      document.dispatchEvent(touchendEvent);
      
      expect(player.setCurrentTime).toHaveBeenCalled();
    });

    it('应该能够处理键盘控制', async () => {
      await mountComponent();
      
      const progressContainer = container.querySelector('.ebin-progress-container') as HTMLElement;
      
      // 左箭头键
      simulateKeyboardEvent(progressContainer, 'ArrowLeft');
      expect(player.setCurrentTime).toHaveBeenCalledWith(25); // 30 - 5
      
      // 右箭头键
      simulateKeyboardEvent(progressContainer, 'ArrowRight');
      expect(player.setCurrentTime).toHaveBeenCalledWith(35); // 30 + 5
      
      // Home键
      simulateKeyboardEvent(progressContainer, 'Home');
      expect(player.setCurrentTime).toHaveBeenCalledWith(0);
      
      // End键
      simulateKeyboardEvent(progressContainer, 'End');
      expect(player.setCurrentTime).toHaveBeenCalledWith(120);
    });

    it('应该能够显示悬停拖拽点', async () => {
      await mountComponent();
      
      const progressContainer = container.querySelector('.ebin-progress-container') as HTMLElement;
      const thumb = container.querySelector('.ebin-progress-thumb') as HTMLElement;
      
      // 鼠标进入
      const mouseenterEvent = new MouseEvent('mouseenter');
      progressContainer.dispatchEvent(mouseenterEvent);
      
      expect(thumb.style.opacity).toBe('1');
      expect(thumb.style.pointerEvents).toBe('auto');
      
      // 鼠标离开
      const mouseleaveEvent = new MouseEvent('mouseleave');
      progressContainer.dispatchEvent(mouseleaveEvent);
      
      expect(thumb.style.opacity).toBe('0');
      expect(thumb.style.pointerEvents).toBe('none');
    });
  });

  describe('进度计算', () => {
    it('应该能够处理零时长', async () => {
      player.getDuration = jest.fn().mockReturnValue(0);
      
      await mountComponent();
      
      const state = {
        currentTime: 0,
        duration: 0,
        buffered: createMockTimeRanges([])
      };
      
      progressBar.update(state as any);
      
      const progressBarElement = container.querySelector('.ebin-progress-bar') as HTMLElement;
      expect(progressBarElement.style.width).toBe('0%');
    });

    it('应该能够处理无效时间值', async () => {
      await mountComponent();
      
      const state = {
        currentTime: NaN,
        duration: 120,
        buffered: createMockTimeRanges([])
      };
      
      progressBar.update(state as any);
      
      const progressBarElement = container.querySelector('.ebin-progress-bar') as HTMLElement;
      expect(progressBarElement.style.width).toBe('0%');
    });

    it('应该能够处理超出范围的时间', async () => {
      await mountComponent();
      
      const state = {
        currentTime: 200, // 超出duration
        duration: 120,
        buffered: createMockTimeRanges([])
      };
      
      progressBar.update(state as any);
      
      const progressBarElement = container.querySelector('.ebin-progress-bar') as HTMLElement;
      expect(progressBarElement.style.width).toBe('100%');
    });

    it('应该能够处理多个缓冲区间', async () => {
      await mountComponent();
      
      const state = {
        currentTime: 30,
        duration: 120,
        buffered: createMockTimeRanges([
          { start: 0, end: 30 },
          { start: 60, end: 90 }
        ])
      };
      
      progressBar.update(state as any);
      
      const bufferedBar = container.querySelector('.ebin-buffered-bar') as HTMLElement;
      expect(bufferedBar.style.width).toBe('75%'); // 90/120 * 100
    });
  });

  describe('配置选项', () => {
    it('应该能够禁用拖拽点', async () => {
      const noThumbConfig = { ...config, showThumb: false };
      const noThumbBar = new ProgressBar(player, container, noThumbConfig, {}, logger);
      
      await noThumbBar.init();
      
      const thumb = container.querySelector('.ebin-progress-thumb');
      expect(thumb).toBeNull();
      
      noThumbBar.destroy();
    });

    it('应该能够禁用缓冲进度', async () => {
      const noBufferedConfig = { ...config, showBuffered: false };
      const noBufferedBar = new ProgressBar(player, container, noBufferedConfig, {}, logger);
      
      await noBufferedBar.init();
      
      const bufferedBar = container.querySelector('.ebin-buffered-bar');
      expect(bufferedBar).toBeNull();
      
      noBufferedBar.destroy();
    });

    it('应该能够禁用点击跳转', async () => {
      const noClickConfig = { ...config, clickToSeek: false };
      const noClickBar = new ProgressBar(player, container, noClickConfig, {}, logger);
      
      await noClickBar.init();
      
      const progressContainer = container.querySelector('.ebin-progress-container') as HTMLElement;
      const clickEvent = new MouseEvent('click', { clientX: 100, clientY: 0 });
      
      Object.defineProperty(progressContainer, 'getBoundingClientRect', {
        value: () => ({ left: 0, width: 200 }),
        writable: true
      });
      
      progressContainer.dispatchEvent(clickEvent);
      
      expect(player.setCurrentTime).not.toHaveBeenCalled();
      
      noClickBar.destroy();
    });

    it('应该能够禁用键盘控制', async () => {
      const noKeyboardConfig = { ...config, keyboardSeek: false };
      const noKeyboardBar = new ProgressBar(player, container, noKeyboardConfig, {}, logger);
      
      await noKeyboardBar.init();
      
      const progressContainer = container.querySelector('.ebin-progress-container') as HTMLElement;
      simulateKeyboardEvent(progressContainer, 'ArrowLeft');
      
      expect(player.setCurrentTime).not.toHaveBeenCalled();
      
      noKeyboardBar.destroy();
    });

    it('应该能够自定义跳转步长', async () => {
      const customStepConfig = { ...config, seekStep: 10 };
      const customStepBar = new ProgressBar(player, container, customStepConfig, {}, logger);
      
      await customStepBar.init();
      
      const progressContainer = container.querySelector('.ebin-progress-container') as HTMLElement;
      simulateKeyboardEvent(progressContainer, 'ArrowLeft');
      
      expect(player.setCurrentTime).toHaveBeenCalledWith(20); // 30 - 10
      
      customStepBar.destroy();
    });
  });

  describe('边界情况', () => {
    it('应该能够处理快速连续操作', async () => {
      await mountComponent();
      
      const progressContainer = container.querySelector('.ebin-progress-container') as HTMLElement;
      
      // 快速连续点击
      for (let i = 0; i < 10; i++) {
        const clickEvent = new MouseEvent('click', { clientX: i * 20, clientY: 0 });
        Object.defineProperty(progressContainer, 'getBoundingClientRect', {
          value: () => ({ left: 0, width: 200 }),
          writable: true
        });
        progressContainer.dispatchEvent(clickEvent);
      }
      
      expect(player.setCurrentTime).toHaveBeenCalledTimes(10);
    });

    it('应该能够处理拖拽时快速移动', async () => {
      await mountComponent();
      
      const thumb = container.querySelector('.ebin-progress-thumb') as HTMLElement;
      const progressContainer = container.querySelector('.ebin-progress-container') as HTMLElement;
      
      Object.defineProperty(progressContainer, 'getBoundingClientRect', {
        value: () => ({ left: 0, width: 200 }),
        writable: true
      });
      
      // 开始拖拽
      const mousedownEvent = new MouseEvent('mousedown', { clientX: 50, clientY: 0 });
      thumb.dispatchEvent(mousedownEvent);
      
      // 快速移动
      for (let i = 0; i < 5; i++) {
        const mousemoveEvent = new MouseEvent('mousemove', { 
          clientX: 50 + i * 10, 
          clientY: 0 
        });
        document.dispatchEvent(mousemoveEvent);
      }
      
      // 结束拖拽
      const mouseupEvent = new MouseEvent('mouseup');
      document.dispatchEvent(mouseupEvent);
      
      expect(player.setCurrentTime).toHaveBeenCalled();
    });

    it('应该能够处理窗口大小变化', async () => {
      await mountComponent();
      
      const progressContainer = container.querySelector('.ebin-progress-container') as HTMLElement;
      
      // 模拟窗口大小变化
      Object.defineProperty(progressContainer, 'getBoundingClientRect', {
        value: () => ({ left: 0, width: 400 }), // 宽度变化
        writable: true
      });
      
      const clickEvent = new MouseEvent('click', { clientX: 200, clientY: 0 });
      progressContainer.dispatchEvent(clickEvent);
      
      expect(player.setCurrentTime).toHaveBeenCalledWith(60); // 50% of 120
    });
  });

  describe('无障碍支持', () => {
    it('应该能够更新ARIA值', async () => {
      await mountComponent();
      
      const progressContainer = container.querySelector('.ebin-progress-container') as HTMLElement;
      
      const state = {
        currentTime: 60,
        duration: 120,
        buffered: createMockTimeRanges([])
      };
      
      progressBar.update(state as any);
      
      expect(progressContainer.getAttribute('aria-valuenow')).toBe('50');
    });

    it('应该能够支持键盘焦点', async () => {
      await mountComponent();
      
      const progressContainer = container.querySelector('.ebin-progress-container') as HTMLElement;
      
      progressContainer.focus();
      expect(document.activeElement).toBe(progressContainer);
    });
  });

  describe('主题样式', () => {
    it('应该能够应用主题样式', async () => {
      const theme = {
        primaryColor: '#ff0000',
        borderRadius: 8
      };
      
      const themedBar = new ProgressBar(player, container, config, theme, logger);
      await themedBar.init();
      
      const progressBarElement = container.querySelector('.ebin-progress-bar') as HTMLElement;
      expect(progressBarElement.style.backgroundColor).toBe('rgb(255, 0, 0)');
      
      themedBar.destroy();
    });
  });

  describe('性能测试', () => {
    it('应该能够处理大量状态更新', async () => {
      await mountComponent();
      
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        const state = {
          currentTime: i,
          duration: 1000,
          buffered: createMockTimeRanges([{ start: 0, end: i + 10 }])
        };
        progressBar.update(state as any);
      }
      
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成
    });
  });
});
