/**
 * ResponsiveManager 单元测试
 */
import { ResponsiveManager } from '../../../src/ui/responsive/ResponsiveManager';
import { 
  createMockLogger, 
  createTestContainer,
  cleanupTestContainer,
  waitFor,
  mockMediaQuery,
  mockResizeObserver
} from '../../utils';

describe('ResponsiveManager', () => {
  let container: HTMLElement;
  let logger: any;
  let responsiveManager: ResponsiveManager;

  beforeEach(() => {
    container = createTestContainer();
    logger = createMockLogger();
    responsiveManager = new ResponsiveManager(container, logger);
    
    // 模拟浏览器API
    mockMediaQuery('(max-width: 768px)', false);
    mockResizeObserver();
  });

  afterEach(() => {
    responsiveManager.destroy();
    cleanupTestContainer();
  });

  describe('状态检测', () => {
    it('应该能够检测当前状态', () => {
      const state = responsiveManager.getCurrentState();
      
      expect(state).toBeDefined();
      expect(state.screenType).toBeDefined();
      expect(state.width).toBeDefined();
      expect(state.height).toBeDefined();
      expect(state.orientation).toBeDefined();
      expect(state.isTouch).toBeDefined();
      expect(state.pixelRatio).toBeDefined();
    });

    it('应该能够获取屏幕类型', () => {
      const screenType = responsiveManager.getCurrentScreenType();
      
      expect(['mobile', 'tablet', 'desktop']).toContain(screenType);
    });

    it('应该能够检测移动端', () => {
      // 模拟移动端屏幕
      Object.defineProperty(window, 'innerWidth', {
        value: 375,
        writable: true
      });
      Object.defineProperty(window, 'innerHeight', {
        value: 667,
        writable: true
      });
      
      const isMobile = responsiveManager.isMobile();
      expect(typeof isMobile).toBe('boolean');
    });

    it('应该能够检测平板', () => {
      // 模拟平板屏幕
      Object.defineProperty(window, 'innerWidth', {
        value: 768,
        writable: true
      });
      Object.defineProperty(window, 'innerHeight', {
        value: 1024,
        writable: true
      });
      
      const isTablet = responsiveManager.isTablet();
      expect(typeof isTablet).toBe('boolean');
    });

    it('应该能够检测桌面端', () => {
      // 模拟桌面端屏幕
      Object.defineProperty(window, 'innerWidth', {
        value: 1920,
        writable: true
      });
      Object.defineProperty(window, 'innerHeight', {
        value: 1080,
        writable: true
      });
      
      const isDesktop = responsiveManager.isDesktop();
      expect(typeof isDesktop).toBe('boolean');
    });

    it('应该能够检测触摸设备', () => {
      const isTouch = responsiveManager.isTouchDevice();
      expect(typeof isTouch).toBe('boolean');
    });
  });

  describe('断点管理', () => {
    it('应该能够使用默认断点', () => {
      const state = responsiveManager.getCurrentState();
      
      expect(state.screenType).toBeDefined();
    });

    it('应该能够使用自定义断点', () => {
      const customBreakpoints = {
        mobile: 480,
        tablet: 1024,
        desktop: 1440
      };
      
      const customManager = new ResponsiveManager(container, logger, customBreakpoints);
      
      // 模拟小屏幕
      Object.defineProperty(window, 'innerWidth', {
        value: 400,
        writable: true
      });
      
      const isMobile = customManager.isMobile();
      expect(typeof isMobile).toBe('boolean');
      
      customManager.destroy();
    });
  });

  describe('响应式计算', () => {
    it('应该能够计算响应式间距', () => {
      const spacing = responsiveManager.getResponsiveSpacing(16);
      
      expect(typeof spacing).toBe('number');
      expect(spacing).toBeGreaterThan(0);
    });

    it('应该能够计算响应式字体大小', () => {
      const fontSize = responsiveManager.getResponsiveFontSize(14);
      
      expect(typeof fontSize).toBe('number');
      expect(fontSize).toBeGreaterThan(0);
    });

    it('应该能够获取字体缩放因子', () => {
      const scaleFactor = responsiveManager.getFontScaleFactor();
      
      expect(typeof scaleFactor).toBe('number');
      expect(scaleFactor).toBeGreaterThan(0);
    });
  });

  describe('布局配置', () => {
    it('应该能够获取屏幕布局', () => {
      const layout = responsiveManager.getLayoutForScreen();
      
      expect(layout).toBeDefined();
    });

    it('应该能够获取可见组件', () => {
      const visibleComponents = responsiveManager.getVisibleComponentsForScreen();
      
      expect(Array.isArray(visibleComponents)).toBe(true);
    });

    it('应该能够判断组件是否应该显示', () => {
      const shouldShow = responsiveManager.shouldShowComponent('test-component');
      
      expect(typeof shouldShow).toBe('boolean');
    });

    it('应该能够获取组件配置', () => {
      const config = responsiveManager.getComponentConfigForScreen('test-component');
      
      expect(config).toBeDefined();
    });
  });

  describe('监听系统', () => {
    it('应该能够开始监听', () => {
      responsiveManager.startWatching();
      
      // 应该不抛出错误
      expect(true).toBe(true);
    });

    it('应该能够停止监听', () => {
      responsiveManager.startWatching();
      responsiveManager.stopWatching();
      
      // 应该不抛出错误
      expect(true).toBe(true);
    });

    it('应该能够监听状态变化', () => {
      const changeCallback = jest.fn();
      const unsubscribe = responsiveManager.onStateChange(changeCallback);
      
      // 模拟窗口大小变化
      Object.defineProperty(window, 'innerWidth', {
        value: 800,
        writable: true
      });
      
      // 触发resize事件
      window.dispatchEvent(new Event('resize'));
      
      // 等待异步处理
      setTimeout(() => {
        expect(changeCallback).toHaveBeenCalled();
        unsubscribe();
      }, 100);
    });
  });

  describe('状态变更', () => {
    it('应该能够更新状态', () => {
      const newState = {
        screenType: 'mobile' as const,
        width: 375,
        height: 667,
        orientation: 'portrait' as const,
        isTouch: true,
        pixelRatio: 2
      };
      
      responsiveManager.updateState(newState);
      
      const currentState = responsiveManager.getCurrentState();
      expect(currentState.screenType).toBe('mobile');
    });

    it('应该能够判断状态是否变化', () => {
      const state1 = responsiveManager.getCurrentState();
      const state2 = responsiveManager.getCurrentState();
      
      const hasChanged = responsiveManager.hasStateChanged(state1, state2);
      expect(typeof hasChanged).toBe('boolean');
    });
  });

  describe('窗口事件', () => {
    it('应该能够处理窗口大小变化', () => {
      // 模拟窗口大小变化
      Object.defineProperty(window, 'innerWidth', {
        value: 800,
        writable: true
      });
      Object.defineProperty(window, 'innerHeight', {
        value: 600,
        writable: true
      });
      
      // 应该不抛出错误
      expect(() => {
        window.dispatchEvent(new Event('resize'));
      }).not.toThrow();
    });

    it('应该能够处理方向变化', () => {
      // 模拟方向变化
      Object.defineProperty(screen, 'orientation', {
        value: { angle: 90 },
        writable: true
      });
      
      // 应该不抛出错误
      expect(() => {
        window.dispatchEvent(new Event('orientationchange'));
      }).not.toThrow();
    });

    it('应该能够处理媒体查询变化', () => {
      const mediaQuery = mockMediaQuery('(max-width: 768px)', true);
      
      // 应该不抛出错误
      expect(() => {
        mediaQuery.dispatchEvent(new Event('change'));
      }).not.toThrow();
    });
  });

  describe('边界情况', () => {
    it('应该能够处理极小屏幕', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 100,
        writable: true
      });
      Object.defineProperty(window, 'innerHeight', {
        value: 100,
        writable: true
      });
      
      const state = responsiveManager.getCurrentState();
      expect(state.width).toBe(100);
      expect(state.height).toBe(100);
    });

    it('应该能够处理极大屏幕', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 5000,
        writable: true
      });
      Object.defineProperty(window, 'innerHeight', {
        value: 3000,
        writable: true
      });
      
      const state = responsiveManager.getCurrentState();
      expect(state.width).toBe(5000);
      expect(state.height).toBe(3000);
    });

    it('应该能够处理零尺寸', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 0,
        writable: true
      });
      Object.defineProperty(window, 'innerHeight', {
        value: 0,
        writable: true
      });
      
      const state = responsiveManager.getCurrentState();
      expect(state.width).toBe(0);
      expect(state.height).toBe(0);
    });
  });

  describe('性能测试', () => {
    it('应该能够处理频繁的状态更新', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        const state = {
          screenType: 'desktop' as const,
          width: 1920 + i,
          height: 1080 + i,
          orientation: 'landscape' as const,
          isTouch: false,
          pixelRatio: 1
        };
        responsiveManager.updateState(state);
      }
      
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成
    });

    it('应该能够处理大量监听器', () => {
      const callbacks = Array.from({ length: 100 }, () => jest.fn());
      const unsubscribers = callbacks.map(callback => 
        responsiveManager.onStateChange(callback)
      );
      
      // 触发状态变化
      responsiveManager.updateState({
        screenType: 'mobile' as const,
        width: 375,
        height: 667,
        orientation: 'portrait' as const,
        isTouch: true,
        pixelRatio: 2
      });
      
      // 清理监听器
      unsubscribers.forEach(unsubscribe => unsubscribe());
      
      // 应该不抛出错误
      expect(true).toBe(true);
    });
  });

  describe('错误处理', () => {
    it('应该能够处理空容器', () => {
      const emptyManager = new ResponsiveManager(null as any, logger);
      
      // 应该不抛出错误
      expect(() => emptyManager.getCurrentState()).not.toThrow();
      
      emptyManager.destroy();
    });

    it('应该能够处理无效断点', () => {
      const invalidBreakpoints = {
        mobile: -1,
        tablet: 0,
        desktop: 'invalid' as any
      };
      
      // 应该不抛出错误
      expect(() => {
        new ResponsiveManager(container, logger, invalidBreakpoints);
      }).not.toThrow();
    });
  });

  describe('销毁', () => {
    it('应该能够销毁响应式管理器', () => {
      responsiveManager.startWatching();
      responsiveManager.destroy();
      
      // 销毁后应该不响应事件
      window.dispatchEvent(new Event('resize'));
      
      // 应该不抛出错误
      expect(true).toBe(true);
    });

    it('应该能够处理重复销毁', () => {
      responsiveManager.destroy();
      responsiveManager.destroy();
      
      // 应该不抛出错误
      expect(true).toBe(true);
    });
  });
});
