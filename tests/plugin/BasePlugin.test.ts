/**
 * BasePlugin 单元测试
 */
import { BasePlugin } from '../../src/plugin/BasePlugin';
import { createMockPluginContext } from '../utils';

describe('BasePlugin', () => {
  let mockContext: any;

  beforeEach(() => {
    mockContext = createMockPluginContext();
  });

  describe('插件基础功能', () => {
    it('应该能够创建插件实例', () => {
      class TestPlugin extends BasePlugin {
        meta = {
          id: 'test-plugin',
          version: '1.0.0',
          displayName: 'Test Plugin'
        };
      }

      const plugin = new TestPlugin();
      expect(plugin).toBeDefined();
      expect(plugin.meta.id).toBe('test-plugin');
    });

    it('应该能够初始化插件', async () => {
      class TestPlugin extends BasePlugin {
        meta = {
          id: 'test-plugin',
          version: '1.0.0',
          displayName: 'Test Plugin'
        };

        async onInit(ctx) {
          return { testMethod: () => 'test' };
        }
      }

      const plugin = new TestPlugin();
      const result = await plugin.onInit?.(mockContext);
      
      expect(result).toBeDefined();
      expect(result?.testMethod).toBeDefined();
    });

    it('应该能够处理插件生命周期', async () => {
      class TestPlugin extends BasePlugin {
        meta = {
          id: 'test-plugin',
          version: '1.0.0',
          displayName: 'Test Plugin'
        };

        async onStart(ctx) {
          // 插件启动逻辑
        }

        async onDestroy(ctx) {
          // 插件销毁逻辑
        }
      }

      const plugin = new TestPlugin();
      
      await plugin.onStart?.(mockContext);
      await plugin.onDestroy?.(mockContext);
      
      expect(plugin).toBeDefined();
    });
  });

  describe('插件元数据', () => {
    it('应该验证必需的元数据字段', () => {
      class TestPlugin extends BasePlugin {
        meta = {
          id: 'test-plugin',
          version: '1.0.0'
        };
      }

      const plugin = new TestPlugin();
      expect(plugin.meta.id).toBe('test-plugin');
      expect(plugin.meta.version).toBe('1.0.0');
    });

    it('应该支持可选的元数据字段', () => {
      class TestPlugin extends BasePlugin {
        meta = {
          id: 'test-plugin',
          version: '1.0.0',
          displayName: 'Test Plugin',
          description: 'A test plugin',
          capabilities: ['ui:inject'],
          permissions: ['player:control']
        };
      }

      const plugin = new TestPlugin();
      expect(plugin.meta.displayName).toBe('Test Plugin');
      expect(plugin.meta.capabilities).toContain('ui:inject');
    });
  });

  describe('插件配置', () => {
    it('应该支持默认配置', () => {
      class TestPlugin extends BasePlugin {
        meta = {
          id: 'test-plugin',
          version: '1.0.0'
        };

        defaultConfig = {
          enabled: true,
          setting: 'default'
        };
      }

      const plugin = new TestPlugin();
      expect(plugin.defaultConfig).toBeDefined();
      expect(plugin.defaultConfig?.enabled).toBe(true);
    });

    it('应该支持配置验证', () => {
      class TestPlugin extends BasePlugin {
        meta = {
          id: 'test-plugin',
          version: '1.0.0'
        };

        validateConfig(config: unknown) {
          if (typeof config === 'object' && config !== null) {
            return { valid: true };
          }
          return { valid: false, errors: ['Invalid config'] };
        }
      }

      const plugin = new TestPlugin();
      const validResult = plugin.validateConfig?.({ test: true });
      const invalidResult = plugin.validateConfig?.('invalid');

      expect(validResult?.valid).toBe(true);
      expect(invalidResult?.valid).toBe(false);
    });
  });

  describe('插件命令', () => {
    it('应该支持命令系统', () => {
      class TestPlugin extends BasePlugin {
        meta = {
          id: 'test-plugin',
          version: '1.0.0'
        };

        commands = {
          testCommand: (args: unknown, ctx: any) => {
            return { result: 'test' };
          }
        };
      }

      const plugin = new TestPlugin();
      expect(plugin.commands).toBeDefined();
      expect(plugin.commands?.testCommand).toBeDefined();
    });
  });

  describe('资源管理', () => {
    it('应该能够管理 disposers', () => {
      class TestPlugin extends BasePlugin {
        meta = {
          id: 'test-plugin',
          version: '1.0.0'
        };

        async onInit(ctx) {
          // 添加清理器
          this.addDisposer(() => {
            console.log('Cleanup 1');
          });
          this.addDisposer(() => {
            console.log('Cleanup 2');
          });
        }
      }

      const plugin = new TestPlugin();
      const mockContext = createMockPluginContext();
      
      plugin.onInit?.(mockContext);
      plugin.onDestroy?.(mockContext);
      
      expect(plugin).toBeDefined();
    });

    it('应该能够自动清理事件监听器', () => {
      class TestPlugin extends BasePlugin {
        meta = {
          id: 'test-plugin',
          version: '1.0.0'
        };

        async onInit(ctx) {
          // 添加事件监听器
          this.on('test-event', () => {});
          this.onAny(() => {});
        }
      }

      const plugin = new TestPlugin();
      const mockContext = createMockPluginContext();
      
      plugin.onInit?.(mockContext);
      plugin.onDestroy?.(mockContext);
      
      expect(plugin).toBeDefined();
    });

    it('应该能够注册和获取服务', () => {
      class TestPlugin extends BasePlugin {
        meta = {
          id: 'test-plugin',
          version: '1.0.0'
        };

        async onInit(ctx) {
          this.registerService('testService', { value: 'test' });
        }

        getTestService() {
          return this.getService('testService');
        }
      }

      const plugin = new TestPlugin();
      const mockContext = createMockPluginContext();
      
      plugin.onInit?.(mockContext);
      
      expect(plugin.getTestService()).toBeDefined();
    });
  });

  describe('辅助方法', () => {
    it('应该能够监听全局事件', () => {
      class TestPlugin extends BasePlugin {
        meta = {
          id: 'test-plugin',
          version: '1.0.0'
        };

        async onInit(ctx) {
          this.onAny((event) => {
            console.log('Global event:', event);
          });
        }
      }

      const plugin = new TestPlugin();
      const mockContext = createMockPluginContext();
      
      plugin.onInit?.(mockContext);
      
      expect(mockContext.onAnyPlayerEvent).toHaveBeenCalled();
    });

    it('应该能够监听特定事件', () => {
      class TestPlugin extends BasePlugin {
        meta = {
          id: 'test-plugin',
          version: '1.0.0'
        };

        async onInit(ctx) {
          this.on('play', (event) => {
            console.log('Play event:', event);
          });
        }
      }

      const plugin = new TestPlugin();
      const mockContext = createMockPluginContext();
      
      plugin.onInit?.(mockContext);
      
      expect(mockContext.on).toHaveBeenCalledWith('play', expect.any(Function));
    });

    it('应该能够注册清理器', () => {
      class TestPlugin extends BasePlugin {
        meta = {
          id: 'test-plugin',
          version: '1.0.0'
        };

        async onInit(ctx) {
          const cleanup = () => console.log('Cleanup');
          this.addDisposer(cleanup);
        }
      }

      const plugin = new TestPlugin();
      const mockContext = createMockPluginContext();
      
      plugin.onInit?.(mockContext);
      
      expect(plugin).toBeDefined();
    });
  });

  describe('继承场景', () => {
    it('应该能够被子类扩展', () => {
      class BaseTestPlugin extends BasePlugin {
        meta = {
          id: 'base-test-plugin',
          version: '1.0.0'
        };

        async onInit(ctx) {
          this.registerService('baseService', { base: 'value' });
        }
      }

      class ExtendedTestPlugin extends BaseTestPlugin {
        meta = {
          id: 'extended-test-plugin',
          version: '2.0.0'
        };

        async onInit(ctx) {
          await super.onInit(ctx);
          this.registerService('extendedService', { extended: 'value' });
        }
      }

      const plugin = new ExtendedTestPlugin();
      const mockContext = createMockPluginContext();
      
      plugin.onInit?.(mockContext);
      
      expect(plugin.meta.id).toBe('extended-test-plugin');
      expect(plugin.meta.version).toBe('2.0.0');
    });

    it('应该能够实现抽象方法', () => {
      class ConcreteTestPlugin extends BasePlugin {
        meta = {
          id: 'concrete-test-plugin',
          version: '1.0.0'
        };

        async onInit(ctx) {
          // 实现抽象方法
          return { concrete: 'implementation' };
        }
      }

      const plugin = new ConcreteTestPlugin();
      expect(plugin).toBeDefined();
    });

    it('应该能够调用生命周期钩子链', async () => {
      class TestPlugin extends BasePlugin {
        meta = {
          id: 'test-plugin',
          version: '1.0.0'
        };

        onInitCalled = false;
        onStartCalled = false;
        onDestroyCalled = false;

        async onInit(ctx) {
          this.onInitCalled = true;
        }

        async onStart(ctx) {
          this.onStartCalled = true;
        }

        async onDestroy(ctx) {
          this.onDestroyCalled = true;
        }
      }

      const plugin = new TestPlugin();
      const mockContext = createMockPluginContext();
      
      await plugin.onInit?.(mockContext);
      plugin.onStart?.(mockContext);
      plugin.onDestroy?.(mockContext);
      
      expect(plugin.onInitCalled).toBe(true);
      expect(plugin.onStartCalled).toBe(true);
      expect(plugin.onDestroyCalled).toBe(true);
    });
  });

  describe('错误处理', () => {
    it('应该能够处理 onInit 异常', async () => {
      class TestPlugin extends BasePlugin {
        meta = {
          id: 'test-plugin',
          version: '1.0.0'
        };

        async onInit(ctx) {
          throw new Error('Init failed');
        }
      }

      const plugin = new TestPlugin();
      const mockContext = createMockPluginContext();
      
      await expect(plugin.onInit?.(mockContext)).rejects.toThrow('Init failed');
    });

    it('应该能够处理 onStart 异常', () => {
      class TestPlugin extends BasePlugin {
        meta = {
          id: 'test-plugin',
          version: '1.0.0'
        };

        onStart(ctx) {
          throw new Error('Start failed');
        }
      }

      const plugin = new TestPlugin();
      const mockContext = createMockPluginContext();
      
      expect(() => plugin.onStart?.(mockContext)).toThrow('Start failed');
    });

    it('应该能够处理 onDestroy 异常', () => {
      class TestPlugin extends BasePlugin {
        meta = {
          id: 'test-plugin',
          version: '1.0.0'
        };

        onDestroy(ctx) {
          throw new Error('Destroy failed');
        }
      }

      const plugin = new TestPlugin();
      const mockContext = createMockPluginContext();
      
      expect(() => plugin.onDestroy?.(mockContext)).toThrow('Destroy failed');
    });

    it('应该能够处理清理器异常', () => {
      class TestPlugin extends BasePlugin {
        meta = {
          id: 'test-plugin',
          version: '1.0.0'
        };

        async onInit(ctx) {
          this.addDisposer(() => {
            throw new Error('Cleanup failed');
          });
        }
      }

      const plugin = new TestPlugin();
      const mockContext = createMockPluginContext();
      
      plugin.onInit?.(mockContext);
      
      // 应该不抛出错误，而是静默处理
      expect(() => plugin.onDestroy?.(mockContext)).not.toThrow();
    });
  });

  describe('配置变更', () => {
    it('应该能够处理配置变更', () => {
      class TestPlugin extends BasePlugin {
        meta = {
          id: 'test-plugin',
          version: '1.0.0'
        };

        configChanged = false;

        onConfigChange(newConfig, ctx) {
          this.configChanged = true;
        }
      }

      const plugin = new TestPlugin();
      const mockContext = createMockPluginContext();
      
      plugin.onConfigChange?.({ newSetting: 'value' }, mockContext);
      
      expect(plugin.configChanged).toBe(true);
    });
  });
});
