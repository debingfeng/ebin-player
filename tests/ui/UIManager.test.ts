/**
 * UIManager 单元测试
 */
import { UIManager, UIManagerOptions } from '../../src/ui/UIManager';
import { 
  createMockPlayerInstance, 
  createMockLogger, 
  createTestContainer,
  cleanupTestContainer,
  waitFor
} from '../utils';

describe('UIManager', () => {
  let container: HTMLElement;
  let player: any;
  let logger: any;
  let uiManager: UIManager;
  let options: UIManagerOptions;

  beforeEach(() => {
    container = createTestContainer();
    player = createMockPlayerInstance();
    logger = createMockLogger();
    options = {
      player,
      container,
      config: {
        enabled: true,
        controlBar: {
          enabled: true,
          autoHide: true,
          autoHideDelay: 3000
        }
      }
    };
    uiManager = new UIManager(options);
  });

  afterEach(() => {
    uiManager.destroy();
    cleanupTestContainer();
  });

  describe('初始化', () => {
    it('应该能够初始化UI管理器', () => {
      expect(uiManager).toBeDefined();
    });

    it('应该能够设置容器样式', () => {
      expect(container.classList.contains('ebin-player')).toBe(true);
    });

    it('应该能够创建控制栏', () => {
      const controlBar = container.querySelector('.ebin-player-control-bar');
      expect(controlBar).toBeDefined();
    });

    it('应该能够创建播放覆盖层', () => {
      const playOverlay = container.querySelector('.ebin-play-overlay');
      expect(playOverlay).toBeDefined();
    });

    it('应该能够创建加载指示器', () => {
      const loadingIndicator = container.querySelector('.ebin-loading-indicator');
      expect(loadingIndicator).toBeDefined();
    });
  });

  describe('组件管理', () => {
    it('应该能够注册组件', () => {
      const mockComponent = {
        init: jest.fn().mockResolvedValue(undefined),
        update: jest.fn(),
        destroy: jest.fn(),
        getElement: jest.fn().mockReturnValue(document.createElement('div'))
      };

      uiManager.registerComponent('test-component', mockComponent as any);
      
      expect(uiManager.getComponent('test-component')).toBe(mockComponent);
    });

    it('应该能够注销组件', () => {
      const mockComponent = {
        init: jest.fn().mockResolvedValue(undefined),
        update: jest.fn(),
        destroy: jest.fn(),
        getElement: jest.fn().mockReturnValue(document.createElement('div'))
      };

      uiManager.registerComponent('test-component', mockComponent as any);
      uiManager.unregisterComponent('test-component');
      
      expect(uiManager.getComponent('test-component')).toBeUndefined();
    });

    it('应该能够获取所有组件', () => {
      const components = uiManager.getAllComponents();
      expect(Array.isArray(components)).toBe(true);
    });
  });

  describe('控制栏', () => {
    it('应该能够显示控制栏', () => {
      uiManager.showControlBar();
      
      const controlBar = container.querySelector('.ebin-player-control-bar');
      expect(controlBar?.classList.contains('visible')).toBe(true);
    });

    it('应该能够隐藏控制栏', () => {
      uiManager.hideControlBar();
      
      const controlBar = container.querySelector('.ebin-player-control-bar');
      expect(controlBar?.classList.contains('visible')).toBe(false);
    });

    it('应该能够切换控制栏显示状态', () => {
      uiManager.toggleControlBar();
      
      const controlBar = container.querySelector('.ebin-player-control-bar');
      expect(controlBar?.classList.contains('visible')).toBe(true);
      
      uiManager.toggleControlBar();
      expect(controlBar?.classList.contains('visible')).toBe(false);
    });
  });

  describe('播放覆盖层', () => {
    it('应该能够显示播放覆盖层', () => {
      uiManager.showPlayOverlay();
      
      const playOverlay = container.querySelector('.ebin-play-overlay');
      expect(playOverlay?.classList.contains('visible')).toBe(true);
    });

    it('应该能够隐藏播放覆盖层', () => {
      uiManager.hidePlayOverlay();
      
      const playOverlay = container.querySelector('.ebin-play-overlay');
      expect(playOverlay?.classList.contains('visible')).toBe(false);
    });
  });

  describe('加载指示器', () => {
    it('应该能够显示加载指示器', () => {
      uiManager.showLoadingIndicator();
      
      const loadingIndicator = container.querySelector('.ebin-loading-indicator');
      expect(loadingIndicator?.classList.contains('visible')).toBe(true);
    });

    it('应该能够隐藏加载指示器', () => {
      uiManager.hideLoadingIndicator();
      
      const loadingIndicator = container.querySelector('.ebin-loading-indicator');
      expect(loadingIndicator?.classList.contains('visible')).toBe(false);
    });
  });

  describe('状态更新', () => {
    it('应该能够更新所有组件状态', () => {
      const mockComponent = {
        init: jest.fn().mockResolvedValue(undefined),
        update: jest.fn(),
        destroy: jest.fn(),
        getElement: jest.fn().mockReturnValue(document.createElement('div'))
      };

      uiManager.registerComponent('test-component', mockComponent as any);
      
      const state = { currentTime: 30, duration: 120 };
      uiManager.updateState(state as any);
      
      expect(mockComponent.update).toHaveBeenCalledWith(state);
    });
  });

  describe('配置更新', () => {
    it('应该能够更新配置', () => {
      const newConfig = {
        controlBar: {
          enabled: false
        }
      };
      
      uiManager.updateConfig(newConfig);
      
      // 应该不抛出错误
      expect(true).toBe(true);
    });

    it('应该能够更新主题', () => {
      const newTheme = {
        primaryColor: '#ff0000',
        textColor: '#00ff00'
      };
      
      uiManager.updateTheme(newTheme);
      
      // 应该不抛出错误
      expect(true).toBe(true);
    });
  });

  describe('销毁', () => {
    it('应该能够销毁UI管理器', () => {
      const mockComponent = {
        init: jest.fn().mockResolvedValue(undefined),
        update: jest.fn(),
        destroy: jest.fn(),
        getElement: jest.fn().mockReturnValue(document.createElement('div'))
      };

      uiManager.registerComponent('test-component', mockComponent as any);
      uiManager.destroy();
      
      expect(mockComponent.destroy).toHaveBeenCalled();
    });

    it('应该能够处理销毁时的异常', () => {
      const mockComponent = {
        init: jest.fn().mockResolvedValue(undefined),
        update: jest.fn(),
        destroy: jest.fn().mockImplementation(() => {
          throw new Error('Destroy failed');
        }),
        getElement: jest.fn().mockReturnValue(document.createElement('div'))
      };

      uiManager.registerComponent('test-component', mockComponent as any);
      
      // 应该不抛出错误
      expect(() => uiManager.destroy()).not.toThrow();
    });
  });

  describe('错误处理', () => {
    it('应该能够处理初始化异常', () => {
      const invalidOptions = {
        player: null as any,
        container: null as any
      };
      
      // 应该不抛出错误
      expect(() => new UIManager(invalidOptions)).not.toThrow();
    });

    it('应该能够处理组件注册异常', () => {
      // 应该不抛出错误
      expect(() => uiManager.registerComponent('test', null as any)).not.toThrow();
    });
  });
});
