/**
 * BaseComponent 单元测试
 */
import { BaseComponent, ComponentConfig, ComponentTheme } from '../../../src/ui/components/BaseComponent';
import { 
  createMockPlayerInstance, 
  createMockLogger, 
  createTestContainer,
  cleanupTestContainer,
  waitFor,
  simulateUserInteraction
} from '../../utils';

// 创建测试用的具体组件类
class TestComponent extends BaseComponent {
  protected async createElement(): Promise<void> {
    this.element = document.createElement('div');
    this.element.className = 'test-component';
    this.element.textContent = 'Test Component';
    
    // 应用无障碍配置
    if ((this.config as any).a11y) {
      const a11y = (this.config as any).a11y;
      if (a11y.ariaLabel) {
        this.element.setAttribute('aria-label', 'Test Component');
      }
      if (a11y.ariaLive) {
        this.element.setAttribute('aria-live', a11y.ariaLive);
      }
    }
    
    this.container.appendChild(this.element);
  }

  protected setupEventListeners(): void {
    if (this.element) {
      this.addEventListener(this.element, 'click', () => {
        this.logger.debug('Test component clicked');
      });
    }
  }

  protected onStateUpdate(state: any): void {
    if (this.element) {
      this.element.textContent = `Test Component - ${state.status || 'default'}`;
    }
  }
}

describe('BaseComponent', () => {
  let container: HTMLElement;
  let player: any;
  let logger: any;
  let component: TestComponent;
  let config: ComponentConfig;
  let theme: ComponentTheme;

  beforeEach(() => {
    container = createTestContainer();
    player = createMockPlayerInstance();
    logger = createMockLogger();
    config = {
      id: 'test-component',
      name: 'Test Component',
      enabled: true,
      order: 1,
      platforms: ['desktop', 'mobile']
    };
    theme = {
      primaryColor: '#3b82f6',
      secondaryColor: '#6c757d',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      textColor: '#ffffff',
      borderRadius: 4,
      fontSize: '1rem',
      spacing: 16
    };
    component = new TestComponent(player, container, config, theme, logger);
  });

  afterEach(() => {
    component.destroy();
    cleanupTestContainer();
  });

  describe('生命周期', () => {
    it('应该能够初始化组件', async () => {
      await component.init();
      
      expect(component.getElement()).toBeDefined();
      expect(component.getElement()?.classList.contains('test-component')).toBe(true);
    });

    it('应该能够跳过禁用的组件初始化', async () => {
      const disabledConfig = { ...config, enabled: false };
      const disabledComponent = new TestComponent(player, container, disabledConfig, theme, logger);
      
      await disabledComponent.init();
      
      expect(disabledComponent.getElement()).toBeNull();
      disabledComponent.destroy();
    });

    it('应该能够跳过不支持的平台', async () => {
      const tvConfig = { ...config, platforms: ['tv'] as any };
      const tvComponent = new TestComponent(player, container, tvConfig, theme, logger);
      
      await tvComponent.init();
      
      expect(tvComponent.getElement()).toBeNull();
      tvComponent.destroy();
    });

    it('应该能够处理初始化异常', async () => {
      class ErrorComponent extends BaseComponent {
        protected async createElement(): Promise<void> {
          throw new Error('Create element failed');
        }
        protected setupEventListeners(): void {}
        protected onStateUpdate(): void {}
      }
      
      const errorComponent = new ErrorComponent(player, container, config, theme, logger);
      
      await errorComponent.init();
      
      expect(logger.error).toHaveBeenCalled();
      errorComponent.destroy();
    });

    it('应该能够销毁组件', async () => {
      await component.init();
      const element = component.getElement();
      
      component.destroy();
      
      expect(component.getElement()).toBeNull();
      expect(container.contains(element!)).toBe(false);
    });
  });

  describe('状态管理', () => {
    it('应该能够更新组件状态', async () => {
      await component.init();
      
      const state = { status: 'playing' };
      component.update(state);
      
      expect(component.getElement()?.textContent).toBe('Test Component - playing');
    });

    it('应该能够跳过已销毁组件的状态更新', async () => {
      await component.init();
      component.destroy();
      
      const state = { status: 'playing' };
      component.update(state);
      
      // 应该不抛出错误
      expect(true).toBe(true);
    });

    it('应该能够跳过禁用组件的状态更新', async () => {
      const disabledConfig = { ...config, enabled: false };
      const disabledComponent = new TestComponent(player, container, disabledConfig, theme, logger);
      
      await disabledComponent.init();
      
      const state = { status: 'playing' };
      disabledComponent.update(state);
      
      // 应该不抛出错误
      expect(true).toBe(true);
      disabledComponent.destroy();
    });

    it('应该能够处理状态更新异常', async () => {
      class ErrorComponent extends BaseComponent {
        protected async createElement(): Promise<void> {
          this.element = document.createElement('div');
          this.container.appendChild(this.element);
        }
        protected setupEventListeners(): void {}
        protected onStateUpdate(): void {
          throw new Error('State update failed');
        }
      }
      
      const errorComponent = new ErrorComponent(player, container, config, theme, logger);
      await errorComponent.init();
      
      errorComponent.update({});
      
      expect(logger.error).toHaveBeenCalled();
      errorComponent.destroy();
    });
  });

  describe('配置与主题', () => {
    it('应该能够获取配置', () => {
      const componentConfig = component.getConfig();
      
      expect(componentConfig).toEqual(config);
    });

    it('应该能够更新配置', () => {
      const newConfig = { ...config, name: 'Updated Component' };
      
      component.updateConfig(newConfig);
      
      expect(component.getConfig().name).toBe('Updated Component');
    });

    it('应该能够更新主题', async () => {
      await component.init();
      
      const newTheme = { ...theme, primaryColor: '#ff0000' };
      component.updateTheme(newTheme);
      
      expect(component['theme'].primaryColor).toBe('#ff0000');
    });

    it('应该能够应用主题样式', async () => {
      await component.init();
      
      const element = component.getElement();
      const styles = component['getThemeStyles']();
      
      expect(styles['--primary-color']).toBe('#3b82f6');
      expect(styles['--text-color']).toBe('#ffffff');
    });
  });

  describe('平台支持', () => {
    it('应该能够检测移动端平台', () => {
      // 模拟移动端用户代理
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        writable: true
      });
      
      const mobileConfig = { ...config, platforms: ['mobile'] as any };
      const mobileComponent = new TestComponent(player, container, mobileConfig, theme, logger);
      
      expect(mobileComponent['isPlatformSupported']()).toBe(true);
      mobileComponent.destroy();
    });

    it('应该能够检测桌面端平台', () => {
      // 模拟桌面端用户代理
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        writable: true
      });
      
      const desktopConfig = { ...config, platforms: ['desktop'] as any };
      const desktopComponent = new TestComponent(player, container, desktopConfig, theme, logger);
      
      expect(desktopComponent['isPlatformSupported']()).toBe(true);
      desktopComponent.destroy();
    });

    it('应该能够检测TV平台', () => {
      // 模拟TV用户代理
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (SMART-TV; Linux; Tizen 2.4)',
        writable: true
      });
      
      const tvConfig = { ...config, platforms: ['tv'] as any };
      const tvComponent = new TestComponent(player, container, tvConfig, theme, logger);
      
      expect(tvComponent['isPlatformSupported']()).toBe(true);
      tvComponent.destroy();
    });
  });

  describe('事件系统', () => {
    it('应该能够添加事件监听器', async () => {
      await component.init();
      
      const element = component.getElement()!;
      const clickHandler = jest.fn();
      
      component['addEventListener'](element, 'click', clickHandler);
      element.click();
      
      expect(clickHandler).toHaveBeenCalled();
    });

    it('应该能够清理事件监听器', async () => {
      await component.init();
      
      const element = component.getElement()!;
      const clickHandler = jest.fn();
      
      component['addEventListener'](element, 'click', clickHandler);
      component.destroy();
      
      element.click();
      expect(clickHandler).not.toHaveBeenCalled();
    });

    it('应该能够处理Document事件监听器', async () => {
      await component.init();
      
      const documentHandler = jest.fn();
      
      component['addEventListener'](document, 'keydown', documentHandler);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      
      expect(documentHandler).toHaveBeenCalled();
      component.destroy();
    });
  });

  describe('错误处理', () => {
    it('应该能够处理组件错误', async () => {
      await component.init();
      
      const error = new Error('Test error');
      component['handleError'](error);
      
      expect(logger.error).toHaveBeenCalledWith('Component error', error);
    });

    it('应该能够显示错误UI', async () => {
      await component.init();
      
      const error = new Error('Test error');
      component['handleError'](error);
      
      const element = component.getElement();
      expect(element?.innerHTML).toContain('Test Component 组件错误');
    });

    it('应该能够处理无元素的错误', () => {
      const error = new Error('Test error');
      component['handleError'](error);
      
      // 应该不抛出错误
      expect(true).toBe(true);
    });
  });

  describe('无障碍支持', () => {
    it('应该能够设置ARIA标签', async () => {
      const a11yConfig = {
        ...config,
        a11y: {
          ariaLabel: true,
          ariaLive: 'polite' as const
        }
      };
      
      const a11yComponent = new TestComponent(player, container, a11yConfig, theme, logger);
      await a11yComponent.init();
      
      const element = a11yComponent.getElement();
      expect(element?.getAttribute('aria-label')).toBe('Test Component');
      expect(element?.getAttribute('aria-live')).toBe('polite');
      
      a11yComponent.destroy();
    });

    it('应该能够处理无无障碍配置', async () => {
      await component.init();
      
      const element = component.getElement();
      expect(element?.getAttribute('aria-label')).toBeNull();
    });
  });

  describe('主题样式', () => {
    it('应该能够获取主题样式', () => {
      const styles = component['getThemeStyles']();
      
      expect(styles['--primary-color']).toBe('#3b82f6');
      expect(styles['--secondary-color']).toBe('#6c757d');
      expect(styles['--background-color']).toBe('rgba(0, 0, 0, 0.8)');
      expect(styles['--text-color']).toBe('#ffffff');
      expect(styles['--border-radius']).toBe('4px');
      expect(styles['--font-size']).toBe('1rem');
      expect(styles['--spacing']).toBe('16px');
    });

    it('应该能够应用主题到元素', async () => {
      await component.init();
      
      const element = component.getElement();
      const styles = component['getThemeStyles']();
      
      Object.entries(styles).forEach(([property, value]) => {
        expect(element?.style.getPropertyValue(property)).toBe(value);
      });
    });
  });

  describe('边界情况', () => {
    it('应该能够处理空容器', () => {
      const emptyComponent = new TestComponent(player, null as any, config, theme, logger);
      
      expect(() => emptyComponent.init()).not.toThrow();
      emptyComponent.destroy();
    });

    it('应该能够处理空播放器', () => {
      const emptyComponent = new TestComponent(null as any, container, config, theme, logger);
      
      expect(() => emptyComponent.init()).not.toThrow();
      emptyComponent.destroy();
    });

    it('应该能够处理重复销毁', async () => {
      await component.init();
      
      component.destroy();
      component.destroy();
      
      // 应该不抛出错误
      expect(true).toBe(true);
    });

    it('应该能够处理无效状态', async () => {
      await component.init();
      
      component.update(null as any);
      component.update(undefined as any);
      
      // 应该不抛出错误
      expect(true).toBe(true);
    });
  });

  describe('性能测试', () => {
    it('应该能够处理大量状态更新', async () => {
      await component.init();
      
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        component.update({ status: `update-${i}` });
      }
      
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成
    });

    it('应该能够处理大量事件监听器', async () => {
      await component.init();
      
      const element = component.getElement()!;
      const handlers = Array.from({ length: 100 }, () => jest.fn());
      
      const startTime = performance.now();
      
      handlers.forEach(handler => {
        component['addEventListener'](element, 'click', handler);
      });
      
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(50); // 应该在50ms内完成
      
      component.destroy();
    });
  });

  describe('继承测试', () => {
    it('应该能够被子类正确扩展', async () => {
      class ExtendedComponent extends TestComponent {
        protected async createElement(): Promise<void> {
          await super.createElement();
          if (this.element) {
            this.element.classList.add('extended');
          }
        }
      }
      
      const extendedComponent = new ExtendedComponent(player, container, config, theme, logger);
      await extendedComponent.init();
      
      const element = extendedComponent.getElement();
      expect(element?.classList.contains('test-component')).toBe(true);
      expect(element?.classList.contains('extended')).toBe(true);
      
      extendedComponent.destroy();
    });

    it('应该能够重写抽象方法', () => {
      class ConcreteComponent extends BaseComponent {
        protected async createElement(): Promise<void> {
          this.element = document.createElement('span');
          this.element.textContent = 'Concrete';
          this.container.appendChild(this.element);
        }
        
        protected setupEventListeners(): void {
          // 空实现
        }
        
        protected onStateUpdate(state: any): void {
          if (this.element) {
            this.element.textContent = `Concrete - ${state.value || 'default'}`;
          }
        }
      }
      
      const concreteComponent = new ConcreteComponent(player, container, config, theme, logger);
      expect(concreteComponent).toBeDefined();
      concreteComponent.destroy();
    });
  });
});
