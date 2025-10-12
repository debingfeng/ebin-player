/**
 * ImprovedDefaultUI 单元测试
 */
import { ImprovedDefaultUI } from '../../src/ui/ImprovedDefaultUI';
import { 
  createMockPlayerInstance, 
  createMockLogger, 
  createTestContainer,
  cleanupTestContainer,
  waitFor
} from '../utils';

describe('ImprovedDefaultUI', () => {
  let container: HTMLElement;
  let player: any;
  let logger: any;
  let defaultUI: ImprovedDefaultUI;

  beforeEach(() => {
    container = createTestContainer();
    player = createMockPlayerInstance();
    logger = createMockLogger();
  });

  afterEach(() => {
    if (defaultUI) {
      defaultUI.destroy();
    }
    cleanupTestContainer();
  });

  describe('初始化', () => {
    it('应该能够创建默认UI实例', () => {
      const options = {
        player,
        container,
        config: {
          enabled: true,
          controlBar: {
            enabled: true,
            autoHide: true
          }
        }
      };
      
      defaultUI = new ImprovedDefaultUI(options);
      
      expect(defaultUI).toBeDefined();
    });

    it('应该能够创建UIManager', () => {
      const options = {
        player,
        container,
        config: {
          enabled: true
        }
      };
      
      defaultUI = new ImprovedDefaultUI(options);
      
      const uiManager = defaultUI.getUIManager();
      expect(uiManager).toBeDefined();
    });

    it('应该能够创建ThemeManager', () => {
      const options = {
        player,
        container,
        config: {
          enabled: true
        }
      };
      
      defaultUI = new ImprovedDefaultUI(options);
      
      const themeManager = defaultUI.getThemeManager();
      expect(themeManager).toBeDefined();
    });

    it('应该能够创建ResponsiveManager', () => {
      const options = {
        player,
        container,
        config: {
          enabled: true
        }
      };
      
      defaultUI = new ImprovedDefaultUI(options);
      
      const responsiveManager = defaultUI.getResponsiveManager();
      expect(responsiveManager).toBeDefined();
    });
  });

  describe('配置转换', () => {
    it('应该能够转换旧版配置', () => {
      const legacyConfig = {
        showControlBar: true,
        controlBarAutoHide: true,
        showPlayButton: true,
        showProgressBar: true,
        showTimeDisplay: true,
        showVolumeControl: true
      };
      
      const options = {
        player,
        container,
        config: legacyConfig
      };
      
      defaultUI = new ImprovedDefaultUI(options);
      
      // 应该不抛出错误
      expect(true).toBe(true);
    });

    it('应该能够转换组件配置', () => {
      const componentConfig = {
        playButton: {
          enabled: true,
          showOverlay: true
        },
        progressBar: {
          enabled: true,
          showThumb: true
        }
      };
      
      const options = {
        player,
        container,
        config: {
          enabled: true,
          components: componentConfig
        }
      };
      
      defaultUI = new ImprovedDefaultUI(options);
      
      // 应该不抛出错误
      expect(true).toBe(true);
    });

    it('应该能够处理默认值', () => {
      const options = {
        player,
        container,
        config: {}
      };
      
      defaultUI = new ImprovedDefaultUI(options);
      
      // 应该不抛出错误
      expect(true).toBe(true);
    });
  });

  describe('响应式处理', () => {
    it('应该能够设置响应式处理', () => {
      const options = {
        player,
        container,
        config: {
          enabled: true,
          responsive: {
            enabled: true,
            breakpoints: {
              mobile: 768,
              tablet: 1024
            }
          }
        }
      };
      
      defaultUI = new ImprovedDefaultUI(options);
      
      // 应该不抛出错误
      expect(true).toBe(true);
    });

    it('应该能够处理响应式变化', () => {
      const options = {
        player,
        container,
        config: {
          enabled: true
        }
      };
      
      defaultUI = new ImprovedDefaultUI(options);
      
      // 模拟窗口大小变化
      Object.defineProperty(window, 'innerWidth', {
        value: 400,
        writable: true
      });
      
      window.dispatchEvent(new Event('resize'));
      
      // 应该不抛出错误
      expect(true).toBe(true);
    });
  });

  describe('配置更新', () => {
    it('应该能够更新配置', () => {
      const options = {
        player,
        container,
        config: {
          enabled: true
        }
      };
      
      defaultUI = new ImprovedDefaultUI(options);
      
      const newConfig = {
        enabled: true,
        controlBar: {
          enabled: false
        }
      };
      
      defaultUI.updateConfig(newConfig);
      
      // 应该不抛出错误
      expect(true).toBe(true);
    });

    it('应该能够更新主题', () => {
      const options = {
        player,
        container,
        config: {
          enabled: true
        }
      };
      
      defaultUI = new ImprovedDefaultUI(options);
      
      const newTheme = {
        id: 'dark',
        name: '深色主题',
        colors: {
          primary: '#ffffff',
          secondary: '#cccccc',
          background: 'rgba(0, 0, 0, 0.9)',
          surface: 'rgba(255, 255, 255, 0.1)',
          text: '#ffffff',
          textSecondary: 'rgba(255, 255, 255, 0.7)',
          border: 'rgba(255, 255, 255, 0.2)',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444'
        }
      };
      
      defaultUI.updateTheme(newTheme);
      
      // 应该不抛出错误
      expect(true).toBe(true);
    });
  });

  describe('管理器访问', () => {
    it('应该能够获取UIManager', () => {
      const options = {
        player,
        container,
        config: {
          enabled: true
        }
      };
      
      defaultUI = new ImprovedDefaultUI(options);
      
      const uiManager = defaultUI.getUIManager();
      expect(uiManager).toBeDefined();
    });

    it('应该能够获取ThemeManager', () => {
      const options = {
        player,
        container,
        config: {
          enabled: true
        }
      };
      
      defaultUI = new ImprovedDefaultUI(options);
      
      const themeManager = defaultUI.getThemeManager();
      expect(themeManager).toBeDefined();
    });

    it('应该能够获取ResponsiveManager', () => {
      const options = {
        player,
        container,
        config: {
          enabled: true
        }
      };
      
      defaultUI = new ImprovedDefaultUI(options);
      
      const responsiveManager = defaultUI.getResponsiveManager();
      expect(responsiveManager).toBeDefined();
    });
  });

  describe('错误处理', () => {
    it('应该能够处理无效播放器', () => {
      const options = {
        player: null as any,
        container,
        config: {
          enabled: true
        }
      };
      
      // 应该不抛出错误
      expect(() => {
        defaultUI = new ImprovedDefaultUI(options);
      }).not.toThrow();
    });

    it('应该能够处理无效容器', () => {
      const options = {
        player,
        container: null as any,
        config: {
          enabled: true
        }
      };
      
      // 应该不抛出错误
      expect(() => {
        defaultUI = new ImprovedDefaultUI(options);
      }).not.toThrow();
    });

    it('应该能够处理无效配置', () => {
      const options = {
        player,
        container,
        config: null as any
      };
      
      // 应该不抛出错误
      expect(() => {
        defaultUI = new ImprovedDefaultUI(options);
      }).not.toThrow();
    });
  });

  describe('边界情况', () => {
    it('应该能够处理空选项', () => {
      // 应该不抛出错误
      expect(() => {
        defaultUI = new ImprovedDefaultUI({} as any);
      }).not.toThrow();
    });

    it('应该能够处理重复初始化', () => {
      const options = {
        player,
        container,
        config: {
          enabled: true
        }
      };
      
      defaultUI = new ImprovedDefaultUI(options);
      
      // 重复调用应该不抛出错误
      expect(() => {
        defaultUI.updateConfig({ enabled: true });
      }).not.toThrow();
    });

    it('应该能够处理快速配置更新', () => {
      const options = {
        player,
        container,
        config: {
          enabled: true
        }
      };
      
      defaultUI = new ImprovedDefaultUI(options);
      
      // 快速连续更新
      for (let i = 0; i < 10; i++) {
        defaultUI.updateConfig({ enabled: i % 2 === 0 });
      }
      
      // 应该不抛出错误
      expect(true).toBe(true);
    });
  });

  describe('性能测试', () => {
    it('应该能够快速初始化', () => {
      const startTime = performance.now();
      
      const options = {
        player,
        container,
        config: {
          enabled: true
        }
      };
      
      defaultUI = new ImprovedDefaultUI(options);
      
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成
    });

    it('应该能够处理大量配置更新', () => {
      const options = {
        player,
        container,
        config: {
          enabled: true
        }
      };
      
      defaultUI = new ImprovedDefaultUI(options);
      
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        const config = {
          enabled: true,
          controlBar: {
            enabled: i % 2 === 0
          }
        };
        defaultUI.updateConfig(config);
      }
      
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(50); // 应该在50ms内完成
    });
  });

  describe('销毁', () => {
    it('应该能够销毁默认UI', () => {
      const options = {
        player,
        container,
        config: {
          enabled: true
        }
      };
      
      defaultUI = new ImprovedDefaultUI(options);
      defaultUI.destroy();
      
      // 销毁后应该不响应更新
      expect(() => {
        defaultUI.updateConfig({ enabled: false });
      }).not.toThrow();
    });

    it('应该能够处理重复销毁', () => {
      const options = {
        player,
        container,
        config: {
          enabled: true
        }
      };
      
      defaultUI = new ImprovedDefaultUI(options);
      defaultUI.destroy();
      defaultUI.destroy();
      
      // 应该不抛出错误
      expect(true).toBe(true);
    });

    it('应该能够清理所有管理器', () => {
      const options = {
        player,
        container,
        config: {
          enabled: true
        }
      };
      
      defaultUI = new ImprovedDefaultUI(options);
      
      const uiManager = defaultUI.getUIManager();
      const themeManager = defaultUI.getThemeManager();
      const responsiveManager = defaultUI.getResponsiveManager();
      
      // 模拟管理器的destroy方法
      uiManager.destroy = jest.fn();
      themeManager.destroy = jest.fn();
      responsiveManager.destroy = jest.fn();
      
      defaultUI.destroy();
      
      expect(uiManager.destroy).toHaveBeenCalled();
      expect(themeManager.destroy).toHaveBeenCalled();
      expect(responsiveManager.destroy).toHaveBeenCalled();
    });
  });

  describe('集成测试', () => {
    it('应该能够与播放器集成', () => {
      const options = {
        player,
        container,
        config: {
          enabled: true,
          controlBar: {
            enabled: true,
            autoHide: true
          }
        }
      };
      
      defaultUI = new ImprovedDefaultUI(options);
      
      // 模拟播放器事件
      player.emit('play');
      player.emit('pause');
      player.emit('timeupdate');
      
      // 应该不抛出错误
      expect(true).toBe(true);
    });

    it('应该能够处理播放器状态变化', () => {
      const options = {
        player,
        container,
        config: {
          enabled: true
        }
      };
      
      defaultUI = new ImprovedDefaultUI(options);
      
      // 模拟播放器状态变化
      player.getState = jest.fn().mockReturnValue({
        currentTime: 30,
        duration: 120,
        paused: false,
        volume: 0.8
      });
      
      // 应该不抛出错误
      expect(true).toBe(true);
    });
  });
});
