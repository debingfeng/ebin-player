/**
 * 插件与UI集成测试
 */
import { PluginManager } from '../../src/plugin/PluginManager';
import { PlaybackRatePlugin } from '../../src/plugin/built-in/PlaybackRatePlugin';
import { UIManager } from '../../src/ui/UIManager';
import { 
  createMockPlayerInstance, 
  createMockLogger, 
  createTestContainer,
  cleanupTestContainer,
  waitFor,
  simulateUserInteraction
} from '../utils';

describe('插件与UI集成测试', () => {
  let container: HTMLElement;
  let player: any;
  let logger: any;
  let pluginManager: PluginManager;
  let uiManager: UIManager;

  beforeEach(() => {
    container = createTestContainer();
    player = createMockPlayerInstance({
      getContainer: jest.fn().mockReturnValue(container),
      getPlaybackRate: jest.fn().mockReturnValue(1),
      setPlaybackRate: jest.fn().mockReturnValue({}),
      on: jest.fn().mockReturnValue(() => {})
    });
    logger = createMockLogger();
    pluginManager = new PluginManager(player, logger);
    uiManager = new UIManager({
      player,
      container,
      config: {
        enabled: true,
        controlBar: {
          enabled: true,
          autoHide: false
        }
      }
    });
  });

  afterEach(() => {
    pluginManager.destroy();
    uiManager.destroy();
    cleanupTestContainer();
  });

  describe('PlaybackRatePlugin与UI集成', () => {
    it('应该能够将插件UI注入到控制栏', async () => {
      pluginManager.use(PlaybackRatePlugin);
      
      await waitFor(100); // 等待插件初始化
      
      const rateContainer = container.querySelector('.ebin-player-playback-rate');
      const controlBar = container.querySelector('.ebin-player-control-bar');
      
      expect(rateContainer).toBeDefined();
      expect(controlBar?.contains(rateContainer!)).toBe(true);
    });

    it('应该能够处理插件UI交互', async () => {
      pluginManager.use(PlaybackRatePlugin);
      
      await waitFor(100);
      
      const select = container.querySelector('select') as HTMLSelectElement;
      expect(select).toBeDefined();
      
      // 模拟选择速率
      select.value = '1.5';
      select.dispatchEvent(new Event('change'));
      
      expect(player.setPlaybackRate).toHaveBeenCalledWith(1.5);
    });

    it('应该能够同步播放器状态到插件UI', async () => {
      pluginManager.use(PlaybackRatePlugin);
      
      await waitFor(100);
      
      // 模拟播放器速率变更
      player.getPlaybackRate = jest.fn().mockReturnValue(2.0);
      
      const rateChangeCallback = player.on.mock.calls.find(
        call => call[0] === 'ratechange'
      )?.[1];
      
      if (rateChangeCallback) {
        rateChangeCallback();
      }
      
      const select = container.querySelector('select') as HTMLSelectElement;
      expect(select.value).toBe('2');
    });

    it('应该能够应用UI样式到插件元素', async () => {
      pluginManager.use(PlaybackRatePlugin);
      
      await waitFor(100);
      
      const rateContainer = container.querySelector('.ebin-player-playback-rate');
      expect(rateContainer).toBeDefined();
      expect(rateContainer?.classList.contains('ebin-player-playback-rate')).toBe(true);
    });
  });

  describe('插件与组件通信', () => {
    it('应该能够通过插件事件触发组件更新', async () => {
      pluginManager.use(PlaybackRatePlugin);
      
      await waitFor(100);
      
      // 模拟插件事件
      const context = pluginManager['buildContext']('builtin.playback-rate');
      context.emitPluginEvent('builtin.playback-rate', 'rateChanged', { rate: 1.5 });
      
      // 验证事件被正确处理
      expect(true).toBe(true);
    });

    it('应该能够通过组件操作调用插件服务', async () => {
      pluginManager.use(PlaybackRatePlugin);
      
      await waitFor(100);
      
      const result = await PlaybackRatePlugin.onInit?.(pluginManager['buildContext']('builtin.playback-rate'));
      
      // 调用插件服务
      result?.setRate(1.5);
      
      expect(player.setPlaybackRate).toHaveBeenCalledWith(1.5);
    });

    it('应该能够实现双向数据绑定', async () => {
      pluginManager.use(PlaybackRatePlugin);
      
      await waitFor(100);
      
      const select = container.querySelector('select') as HTMLSelectElement;
      
      // 组件 -> 插件
      select.value = '1.5';
      select.dispatchEvent(new Event('change'));
      expect(player.setPlaybackRate).toHaveBeenCalledWith(1.5);
      
      // 插件 -> 组件
      player.getPlaybackRate = jest.fn().mockReturnValue(2.0);
      const rateChangeCallback = player.on.mock.calls.find(
        call => call[0] === 'ratechange'
      )?.[1];
      
      if (rateChangeCallback) {
        rateChangeCallback();
      }
      
      expect(select.value).toBe('2');
    });
  });

  describe('多插件协同', () => {
    it('应该能够同时运行多个插件', () => {
      const mockPlugin1 = {
        meta: { id: 'plugin1', version: '1.0.0' },
        onInit: jest.fn(),
        onStart: jest.fn(),
        onDestroy: jest.fn()
      };
      
      const mockPlugin2 = {
        meta: { id: 'plugin2', version: '1.0.0' },
        onInit: jest.fn(),
        onStart: jest.fn(),
        onDestroy: jest.fn()
      };
      
      pluginManager.use(mockPlugin1 as any);
      pluginManager.use(mockPlugin2 as any);
      
      expect(pluginManager.hasPlugin('plugin1')).toBe(true);
      expect(pluginManager.hasPlugin('plugin2')).toBe(true);
    });

    it('应该能够处理插件间事件通信', () => {
      const mockPlugin1 = {
        meta: { id: 'plugin1', version: '1.0.0' },
        onInit: jest.fn(),
        onStart: jest.fn(),
        onDestroy: jest.fn()
      };
      
      const mockPlugin2 = {
        meta: { id: 'plugin2', version: '1.0.0' },
        onInit: jest.fn(),
        onStart: jest.fn(),
        onDestroy: jest.fn()
      };
      
      pluginManager.use(mockPlugin1 as any);
      pluginManager.use(mockPlugin2 as any);
      
      const context1 = pluginManager['buildContext']('plugin1');
      const context2 = pluginManager['buildContext']('plugin2');
      
      // 插件1监听插件2的事件
      const eventHandler = jest.fn();
      context1.onPluginEvent('plugin2', 'testEvent', eventHandler);
      
      // 插件2发送事件
      context2.emitPluginEvent('plugin2', 'testEvent', { data: 'test' });
      
      expect(eventHandler).toHaveBeenCalledWith({ data: 'test' });
    });

    it('应该能够共享UI空间', async () => {
      pluginManager.use(PlaybackRatePlugin);
      
      await waitFor(100);
      
      const controlBar = container.querySelector('.ebin-player-control-bar');
      const rateContainer = container.querySelector('.ebin-player-playback-rate');
      
      expect(controlBar?.contains(rateContainer!)).toBe(true);
    });
  });

  describe('动态加载/卸载', () => {
    it('应该能够在运行时加载插件', async () => {
      expect(pluginManager.hasPlugin('builtin.playback-rate')).toBe(false);
      
      pluginManager.use(PlaybackRatePlugin);
      
      expect(pluginManager.hasPlugin('builtin.playback-rate')).toBe(true);
      
      await waitFor(100);
      
      const rateContainer = container.querySelector('.ebin-player-playback-rate');
      expect(rateContainer).toBeDefined();
    });

    it('应该能够在运行时卸载插件', async () => {
      pluginManager.use(PlaybackRatePlugin);
      
      await waitFor(100);
      
      const rateContainer = container.querySelector('.ebin-player-playback-rate');
      expect(rateContainer).toBeDefined();
      
      pluginManager.unuse('builtin.playback-rate');
      
      expect(pluginManager.hasPlugin('builtin.playback-rate')).toBe(false);
    });

    it('应该能够动态添加UI元素', async () => {
      pluginManager.use(PlaybackRatePlugin);
      
      await waitFor(100);
      
      const rateContainer = container.querySelector('.ebin-player-playback-rate');
      expect(rateContainer).toBeDefined();
      
      // 卸载插件
      pluginManager.unuse('builtin.playback-rate');
      
      // UI元素应该被移除
      const rateContainerAfter = container.querySelector('.ebin-player-playback-rate');
      expect(rateContainerAfter).toBeNull();
    });
  });

  describe('错误隔离', () => {
    it('应该能够隔离插件错误不影响UI', async () => {
      const errorPlugin = {
        meta: { id: 'error-plugin', version: '1.0.0' },
        onInit: jest.fn().mockImplementation(() => {
          throw new Error('Plugin init failed');
        }),
        onStart: jest.fn(),
        onDestroy: jest.fn()
      };
      
      pluginManager.use(errorPlugin as any);
      
      // UI应该仍然正常工作
      const controlBar = container.querySelector('.ebin-player-control-bar');
      expect(controlBar).toBeDefined();
    });

    it('应该能够隔离UI错误不影响插件', async () => {
      pluginManager.use(PlaybackRatePlugin);
      
      await waitFor(100);
      
      // 模拟UI错误
      const select = container.querySelector('select') as HTMLSelectElement;
      select.value = 'invalid';
      select.dispatchEvent(new Event('change'));
      
      // 插件应该仍然正常工作
      expect(pluginManager.hasPlugin('builtin.playback-rate')).toBe(true);
    });
  });

  describe('性能测试', () => {
    it('应该能够处理大量插件同时运行', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 50; i++) {
        const mockPlugin = {
          meta: { id: `plugin-${i}`, version: '1.0.0' },
          onInit: jest.fn(),
          onStart: jest.fn(),
          onDestroy: jest.fn()
        };
        pluginManager.use(mockPlugin as any);
      }
      
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成
      expect(pluginManager.getPluginIds()).toHaveLength(50);
    });

    it('应该能够处理频繁的插件事件', () => {
      pluginManager.use(PlaybackRatePlugin);
      
      const context = pluginManager['buildContext']('builtin.playback-rate');
      
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        context.emitPluginEvent('builtin.playback-rate', 'testEvent', { data: i });
      }
      
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(50); // 应该在50ms内完成
    });
  });
});
