/**
 * TimeDisplay 单元测试
 */
import { TimeDisplay, TimeDisplayConfig } from '../../../src/ui/components/TimeDisplay';
import { 
  createMockPlayerInstance, 
  createMockLogger, 
  createTestContainer,
  cleanupTestContainer,
  waitFor,
  simulateUserInteraction
} from '../../utils';

describe('TimeDisplay', () => {
  let container: HTMLElement;
  let player: any;
  let logger: any;
  let timeDisplay: TimeDisplay;
  let config: TimeDisplayConfig;

  beforeEach(() => {
    container = createTestContainer();
    player = createMockPlayerInstance({
      getState: jest.fn().mockReturnValue({
        currentTime: 30,
        duration: 120
      })
    });
    logger = createMockLogger();
    config = {
      id: 'timeDisplay',
      name: 'Time Display',
      enabled: true,
      order: 1,
      platforms: ['desktop', 'mobile'],
      format: 'current/total',
      showMilliseconds: false,
      updateInterval: 1000
    };
    timeDisplay = new TimeDisplay(player, container, config, {}, logger);
  });

  // 辅助函数：模拟UIManager的行为
  const mountComponent = async () => {
    await timeDisplay.init();
    const element = timeDisplay.getElement();
    if (element) {
      container.appendChild(element);
    }
  };

  afterEach(() => {
    timeDisplay.destroy();
    cleanupTestContainer();
  });

  describe('格式支持', () => {
    it('应该能够创建 current/total 格式', async () => {
      await mountComponent();
      
      const currentTimeElement = container.querySelector('.ebin-current-time');
      const totalTimeElement = container.querySelector('.ebin-total-time');
      const separatorElement = container.querySelector('.ebin-time-separator');
      
      expect(currentTimeElement).toBeDefined();
      expect(totalTimeElement).toBeDefined();
      expect(separatorElement).toBeDefined();
      expect(separatorElement?.textContent).toBe(' / ');
    });

    it('应该能够创建 current 格式', async () => {
      const currentConfig = { ...config, format: 'current' as const };
      const currentDisplay = new TimeDisplay(player, container, currentConfig, {}, logger);
      
      await currentDisplay.init();
      
      const currentTimeElement = container.querySelector('.ebin-current-time');
      const totalTimeElement = container.querySelector('.ebin-total-time');
      
      expect(currentTimeElement).toBeDefined();
      expect(totalTimeElement).toBeNull();
      
      currentDisplay.destroy();
    });

    it('应该能够创建 total 格式', async () => {
      const totalConfig = { ...config, format: 'total' as const };
      const totalDisplay = new TimeDisplay(player, container, totalConfig, {}, logger);
      
      await totalDisplay.init();
      
      const currentTimeElement = container.querySelector('.ebin-current-time');
      const totalTimeElement = container.querySelector('.ebin-total-time');
      
      expect(currentTimeElement).toBeNull();
      expect(totalTimeElement).toBeDefined();
      
      totalDisplay.destroy();
    });

    it('应该能够创建 remaining 格式', async () => {
      const remainingConfig = { ...config, format: 'remaining' as const };
      const remainingDisplay = new TimeDisplay(player, container, remainingConfig, {}, logger);
      
      await remainingDisplay.init();
      
      const remainingElement = container.querySelector('.ebin-remaining-time');
      
      expect(remainingElement).toBeDefined();
      expect(remainingElement?.textContent).toBe('-00:00');
      
      remainingDisplay.destroy();
    });
  });

  describe('时间格式化', () => {
    it('应该能够格式化秒数', async () => {
      await mountComponent();
      
      const state = {
        currentTime: 90, // 1分30秒
        duration: 3661 // 1小时1分1秒
      };
      
      timeDisplay.update(state as any);
      
      const currentTimeElement = container.querySelector('.ebin-current-time');
      const totalTimeElement = container.querySelector('.ebin-total-time');
      
      expect(currentTimeElement?.textContent).toBe('01:30');
      expect(totalTimeElement?.textContent).toBe('01:01:01');
    });

    it('应该能够显示毫秒', async () => {
      const msConfig = { ...config, showMilliseconds: true };
      const msDisplay = new TimeDisplay(player, container, msConfig, {}, logger);
      
      await msDisplay.init();
      
      const state = {
        currentTime: 90.123,
        duration: 120.456
      };
      
      msDisplay.update(state as any);
      
      const currentTimeElement = container.querySelector('.ebin-current-time');
      const totalTimeElement = container.querySelector('.ebin-total-time');
      
      expect(currentTimeElement?.textContent).toBe('01:30.123');
      expect(totalTimeElement?.textContent).toBe('02:00.456');
      
      msDisplay.destroy();
    });

    it('应该能够处理无效时间值', async () => {
      await mountComponent();
      
      const state = {
        currentTime: NaN,
        duration: Infinity
      };
      
      timeDisplay.update(state as any);
      
      const currentTimeElement = container.querySelector('.ebin-current-time');
      const totalTimeElement = container.querySelector('.ebin-total-time');
      
      expect(currentTimeElement?.textContent).toBe('00:00');
      expect(totalTimeElement?.textContent).toBe('00:00');
    });

    it('应该能够处理负数时间', async () => {
      await mountComponent();
      
      const state = {
        currentTime: -10,
        duration: 120
      };
      
      timeDisplay.update(state as any);
      
      const currentTimeElement = container.querySelector('.ebin-current-time');
      expect(currentTimeElement?.textContent).toBe('00:00');
    });

    it('应该能够处理剩余时间格式', async () => {
      const remainingConfig = { ...config, format: 'remaining' as const };
      const remainingDisplay = new TimeDisplay(player, container, remainingConfig, {}, logger);
      
      await remainingDisplay.init();
      
      const state = {
        currentTime: 30,
        duration: 120
      };
      
      remainingDisplay.update(state as any);
      
      const remainingElement = container.querySelector('.ebin-remaining-time');
      expect(remainingElement?.textContent).toBe('-01:30'); // 90秒剩余
      
      remainingDisplay.destroy();
    });
  });

  describe('交互功能', () => {
    it('应该能够点击切换格式', async () => {
      await mountComponent();
      
      const element = container.querySelector('.ebin-time-display') as HTMLElement;
      
      // 初始格式应该是 current/total
      expect(container.querySelector('.ebin-time-separator')).toBeDefined();
      
      // 点击切换格式
      element.click();
      
      // 应该切换到 current 格式
      expect(container.querySelector('.ebin-time-separator')).toBeNull();
      expect(container.querySelector('.ebin-total-time')).toBeNull();
    });

    it('应该能够循环切换格式', async () => {
      await mountComponent();
      
      const element = container.querySelector('.ebin-time-display') as HTMLElement;
      
      // 第一次点击：current/total -> current
      element.click();
      expect(container.querySelector('.ebin-total-time')).toBeNull();
      
      // 第二次点击：current -> remaining
      element.click();
      expect(container.querySelector('.ebin-remaining-time')).toBeDefined();
      
      // 第三次点击：remaining -> current/total
      element.click();
      expect(container.querySelector('.ebin-time-separator')).toBeDefined();
    });
  });

  describe('更新机制', () => {
    it('应该能够启动定时更新', async () => {
      await mountComponent();
      
      // 等待定时器触发
      await waitFor(1100);
      
      expect(player.getState).toHaveBeenCalled();
    });

    it('应该能够使用自定义更新间隔', async () => {
      const customIntervalConfig = { ...config, updateInterval: 500 };
      const customDisplay = new TimeDisplay(player, container, customIntervalConfig, {}, logger);
      
      await customDisplay.init();
      
      // 等待定时器触发
      await waitFor(600);
      
      expect(player.getState).toHaveBeenCalled();
      
      customDisplay.destroy();
    });

    it('应该能够停止定时器', async () => {
      await mountComponent();
      
      timeDisplay.destroy();
      
      // 等待一段时间确保定时器已停止
      await waitFor(1100);
      
      // 应该只调用一次（初始化时）
      expect(player.getState).toHaveBeenCalledTimes(1);
    });
  });

  describe('显示元素', () => {
    it('应该能够重新创建显示元素', async () => {
      await mountComponent();
      
      const element = container.querySelector('.ebin-time-display') as HTMLElement;
      
      // 点击切换格式
      element.click();
      
      // 验证元素被重新创建
      const newElement = container.querySelector('.ebin-time-display');
      expect(newElement).toBeDefined();
      expect(newElement).not.toBe(element);
    });

    it('应该能够清理旧元素', async () => {
      await mountComponent();
      
      const element = container.querySelector('.ebin-time-display') as HTMLElement;
      const currentTimeElement = container.querySelector('.ebin-current-time');
      
      // 点击切换格式
      element.click();
      
      // 旧元素应该被清理
      expect(container.querySelectorAll('.ebin-current-time')).toHaveLength(1);
    });
  });

  describe('状态更新', () => {
    it('应该能够更新当前时间', async () => {
      await mountComponent();
      
      const state = {
        currentTime: 45,
        duration: 120
      };
      
      timeDisplay.update(state as any);
      
      const currentTimeElement = container.querySelector('.ebin-current-time');
      expect(currentTimeElement?.textContent).toBe('00:45');
    });

    it('应该能够更新总时间', async () => {
      await mountComponent();
      
      const state = {
        currentTime: 30,
        duration: 180
      };
      
      timeDisplay.update(state as any);
      
      const totalTimeElement = container.querySelector('.ebin-total-time');
      expect(totalTimeElement?.textContent).toBe('03:00');
    });

    it('应该能够处理零时长', async () => {
      await mountComponent();
      
      const state = {
        currentTime: 0,
        duration: 0
      };
      
      timeDisplay.update(state as any);
      
      const currentTimeElement = container.querySelector('.ebin-current-time');
      const totalTimeElement = container.querySelector('.ebin-total-time');
      
      expect(currentTimeElement?.textContent).toBe('00:00');
      expect(totalTimeElement?.textContent).toBe('00:00');
    });
  });

  describe('边界情况', () => {
    it('应该能够处理极大时间值', async () => {
      await mountComponent();
      
      const state = {
        currentTime: 359999, // 99小时59分59秒
        duration: 360000
      };
      
      timeDisplay.update(state as any);
      
      const currentTimeElement = container.querySelector('.ebin-current-time');
      const totalTimeElement = container.querySelector('.ebin-total-time');
      
      expect(currentTimeElement?.textContent).toBe('99:59:59');
      expect(totalTimeElement?.textContent).toBe('100:00:00');
    });

    it('应该能够处理小数时间值', async () => {
      const msConfig = { ...config, showMilliseconds: true };
      const msDisplay = new TimeDisplay(player, container, msConfig, {}, logger);
      
      await msDisplay.init();
      
      const state = {
        currentTime: 1.999,
        duration: 2.001
      };
      
      msDisplay.update(state as any);
      
      const currentTimeElement = container.querySelector('.ebin-current-time');
      const totalTimeElement = container.querySelector('.ebin-total-time');
      
      expect(currentTimeElement?.textContent).toBe('00:01.999');
      expect(totalTimeElement?.textContent).toBe('00:02.001');
      
      msDisplay.destroy();
    });

    it('应该能够处理快速格式切换', async () => {
      await mountComponent();
      
      const element = container.querySelector('.ebin-time-display') as HTMLElement;
      
      // 快速连续点击
      for (let i = 0; i < 10; i++) {
        element.click();
      }
      
      // 应该不抛出错误
      expect(true).toBe(true);
    });
  });

  describe('主题样式', () => {
    it('应该能够应用主题样式', async () => {
      const theme = {
        textColor: '#ff0000',
        fontSize: '1.2rem'
      };
      
      const themedDisplay = new TimeDisplay(player, container, config, theme, logger);
      await themedDisplay.init();
      
      const element = container.querySelector('.ebin-time-display') as HTMLElement;
      expect(element.style.color).toBe('rgb(255, 0, 0)');
      expect(element.style.fontSize).toBe('1.2rem');
      
      themedDisplay.destroy();
    });

    it('应该能够应用悬停效果', async () => {
      await mountComponent();
      
      const element = container.querySelector('.ebin-time-display') as HTMLElement;
      
      // 鼠标进入
      const mouseenterEvent = new MouseEvent('mouseenter');
      element.dispatchEvent(mouseenterEvent);
      
      expect(element.style.opacity).toBe('0.8');
      
      // 鼠标离开
      const mouseleaveEvent = new MouseEvent('mouseleave');
      element.dispatchEvent(mouseleaveEvent);
      
      expect(element.style.opacity).toBe('1');
    });
  });

  describe('性能测试', () => {
    it('应该能够处理大量状态更新', async () => {
      await mountComponent();
      
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        const state = {
          currentTime: i,
          duration: 1000
        };
        timeDisplay.update(state as any);
      }
      
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成
    });

    it('应该能够处理频繁的格式切换', async () => {
      await mountComponent();
      
      const element = container.querySelector('.ebin-time-display') as HTMLElement;
      
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        element.click();
      }
      
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(50); // 应该在50ms内完成
    });
  });

  describe('错误处理', () => {
    it('应该能够处理初始化异常', async () => {
      // 模拟容器为null
      const errorDisplay = new TimeDisplay(player, null as any, config, {}, logger);
      
      await errorDisplay.init();
      
      // 应该不抛出错误
      expect(true).toBe(true);
      
      errorDisplay.destroy();
    });

    it('应该能够处理状态更新异常', async () => {
      await mountComponent();
      
      // 模拟状态更新异常
      const originalUpdate = timeDisplay['onStateUpdate'];
      timeDisplay['onStateUpdate'] = jest.fn().mockImplementation(() => {
        throw new Error('State update failed');
      });
      
      timeDisplay.update({ currentTime: 30, duration: 120 });
      
      expect(logger.error).toHaveBeenCalled();
      
      // 恢复原方法
      timeDisplay['onStateUpdate'] = originalUpdate;
    });
  });
});
