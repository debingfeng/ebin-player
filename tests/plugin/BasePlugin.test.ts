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
});
