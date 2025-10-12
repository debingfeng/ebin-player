/**
 * PlaybackRatePlugin 单元测试
 */
import { PlaybackRatePlugin } from '../../../src/plugin/built-in/PlaybackRatePlugin';
import { 
  createMockPlayerInstance, 
  createMockLogger, 
  createMockPluginContext,
  createTestContainer,
  cleanupTestContainer,
  waitFor,
  simulateUserInteraction
} from '../../utils';

describe('PlaybackRatePlugin', () => {
  let mockPlayer: any;
  let mockLogger: any;
  let mockContext: any;
  let container: HTMLElement;

  beforeEach(() => {
    container = createTestContainer();
    mockPlayer = createMockPlayerInstance({
      getContainer: jest.fn().mockReturnValue(container),
      getPlaybackRate: jest.fn().mockReturnValue(1),
      setPlaybackRate: jest.fn().mockReturnValue({}),
      on: jest.fn().mockReturnValue(() => {})
    });
    mockLogger = createMockLogger();
    mockContext = createMockPluginContext();
    mockContext.player = mockPlayer;
    mockContext.getConfig = jest.fn().mockReturnValue({
      defaultRate: 1,
      options: [
        { value: 0.25, label: '0.25x' },
        { value: 0.5, label: '0.5x' },
        { value: 0.75, label: '0.75x' },
        { value: 1, label: '1x' },
        { value: 1.25, label: '1.25x' },
        { value: 1.5, label: '1.5x' },
        { value: 1.75, label: '1.75x' },
        { value: 2, label: '2x' }
      ]
    });
  });

  afterEach(() => {
    cleanupTestContainer();
  });

  describe('插件基础功能', () => {
    it('应该能够创建插件实例', () => {
      expect(PlaybackRatePlugin).toBeDefined();
      expect(PlaybackRatePlugin.meta.id).toBe('builtin.playback-rate');
      expect(PlaybackRatePlugin.meta.version).toBe('2.0.0');
    });

    it('应该能够初始化插件', async () => {
      const result = await PlaybackRatePlugin.onInit?.(mockContext);
      
      expect(result).toBeDefined();
      expect(result?.setRate).toBeDefined();
      expect(result?.getOptions).toBeDefined();
    });

    it('应该能够创建UI元素', async () => {
      await PlaybackRatePlugin.onInit?.(mockContext);
      
      const rateContainer = container.querySelector('.ebin-player-playback-rate');
      const select = container.querySelector('select');
      
      expect(rateContainer).toBeDefined();
      expect(select).toBeDefined();
    });

    it('应该能够渲染播放速率选项', async () => {
      await PlaybackRatePlugin.onInit?.(mockContext);
      
      const select = container.querySelector('select') as HTMLSelectElement;
      const options = Array.from(select.options);
      
      expect(options).toHaveLength(8);
      expect(options[0].value).toBe('0.25');
      expect(options[0].textContent).toBe('0.25x');
    });
  });

  describe('配置系统', () => {
    it('应该能够加载默认配置', () => {
      expect(PlaybackRatePlugin.defaultConfig).toBeDefined();
      expect(PlaybackRatePlugin.defaultConfig?.defaultRate).toBe(1);
      expect(PlaybackRatePlugin.defaultConfig?.options).toHaveLength(8);
    });

    it('应该能够验证配置', () => {
      const validConfig = {
        defaultRate: 1.5,
        options: [
          { value: 1, label: '1x' },
          { value: 1.5, label: '1.5x' }
        ]
      };
      
      const result = PlaybackRatePlugin.validateConfig?.(validConfig);
      
      expect(result?.valid).toBe(true);
      expect(result?.errors).toHaveLength(0);
    });

    it('应该能够检测无效配置', () => {
      const invalidConfig = {
        defaultRate: 'invalid',
        options: 'not an array'
      };
      
      const result = PlaybackRatePlugin.validateConfig?.(invalidConfig);
      
      expect(result?.valid).toBe(false);
      expect(result?.errors).toContain('配置不合法: defaultRate 必须为 number, options 必须为 {value,label}[]');
    });

    it('应该能够处理配置更新', async () => {
      await PlaybackRatePlugin.onInit?.(mockContext);
      
      const newConfig = {
        options: [
          { value: 0.5, label: '0.5x' },
          { value: 1, label: '1x' },
          { value: 2, label: '2x' }
        ]
      };
      
      PlaybackRatePlugin.onConfigChange?.(newConfig, mockContext);
      
      const select = container.querySelector('select') as HTMLSelectElement;
      const options = Array.from(select.options);
      
      expect(options).toHaveLength(3);
    });

    it('应该能够处理默认速率更新', async () => {
      await PlaybackRatePlugin.onInit?.(mockContext);
      
      const newConfig = {
        defaultRate: 1.5
      };
      
      PlaybackRatePlugin.onConfigChange?.(newConfig, mockContext);
      
      expect(mockPlayer.setPlaybackRate).toHaveBeenCalledWith(1.5);
    });
  });

  describe('命令系统', () => {
    it('应该能够执行 bump 命令', async () => {
      await PlaybackRatePlugin.onInit?.(mockContext);
      
      const result = PlaybackRatePlugin.commands?.bump?.({}, mockContext);
      
      expect(mockPlayer.getPlaybackRate).toHaveBeenCalled();
      expect(mockPlayer.setPlaybackRate).toHaveBeenCalled();
    });

    it('应该能够限制 bump 命令的最大速率', async () => {
      mockPlayer.getPlaybackRate = jest.fn().mockReturnValue(2.5);
      
      await PlaybackRatePlugin.onInit?.(mockContext);
      
      PlaybackRatePlugin.commands?.bump?.({}, mockContext);
      
      expect(mockPlayer.setPlaybackRate).toHaveBeenCalledWith(3);
    });
  });

  describe('UI集成', () => {
    it('应该能够将控件添加到控制栏', async () => {
      // 创建控制栏
      const controlBar = document.createElement('div');
      controlBar.className = 'ebin-player-control-bar';
      container.appendChild(controlBar);
      
      await PlaybackRatePlugin.onInit?.(mockContext);
      
      const rateContainer = controlBar.querySelector('.ebin-player-playback-rate');
      expect(rateContainer).toBeDefined();
    });

    it('应该能够处理控制栏不存在的情况', async () => {
      await PlaybackRatePlugin.onInit?.(mockContext);
      
      const rateContainer = container.querySelector('.ebin-player-playback-rate');
      expect(rateContainer).toBeDefined();
    });

    it('应该能够处理速率变更事件', async () => {
      await PlaybackRatePlugin.onInit?.(mockContext);
      
      const select = container.querySelector('select') as HTMLSelectElement;
      select.value = '1.5';
      
      const changeEvent = new Event('change');
      select.dispatchEvent(changeEvent);
      
      expect(mockPlayer.setPlaybackRate).toHaveBeenCalledWith(1.5);
    });

    it('应该能够更新UI显示', async () => {
      await PlaybackRatePlugin.onInit?.(mockContext);
      
      // 模拟播放器速率变更事件
      const rateChangeCallback = mockPlayer.on.mock.calls.find(
        call => call[0] === 'ratechange'
      )?.[1];
      
      if (rateChangeCallback) {
        rateChangeCallback();
      }
      
      const select = container.querySelector('select') as HTMLSelectElement;
      expect(select.value).toBe('1');
    });
  });

  describe('服务导出', () => {
    it('应该能够导出 setRate 服务', async () => {
      const result = await PlaybackRatePlugin.onInit?.(mockContext);
      
      expect(result?.setRate).toBeDefined();
      expect(typeof result?.setRate).toBe('function');
    });

    it('应该能够导出 getOptions 服务', async () => {
      const result = await PlaybackRatePlugin.onInit?.(mockContext);
      
      expect(result?.getOptions).toBeDefined();
      expect(typeof result?.getOptions).toBe('function');
    });

    it('应该能够通过 setRate 设置速率', async () => {
      const result = await PlaybackRatePlugin.onInit?.(mockContext);
      
      result?.setRate(1.5);
      
      expect(mockPlayer.setPlaybackRate).toHaveBeenCalledWith(1.5);
    });

    it('应该能够通过 getOptions 获取选项', async () => {
      const result = await PlaybackRatePlugin.onInit?.(mockContext);
      
      const options = result?.getOptions();
      
      expect(options).toHaveLength(8);
      expect(options?.[0]).toEqual({ value: 0.25, label: '0.25x' });
    });

    it('应该能够限制 setRate 的速率范围', async () => {
      const result = await PlaybackRatePlugin.onInit?.(mockContext);
      
      result?.setRate(3.0); // 超出预定义范围
      
      expect(mockContext.logger.warn).toHaveBeenCalledWith('播放速度 3 不在预定义选项中');
      expect(mockPlayer.setPlaybackRate).not.toHaveBeenCalledWith(3.0);
    });
  });

  describe('边界情况', () => {
    it('应该能够处理非法速率值', async () => {
      await PlaybackRatePlugin.onInit?.(mockContext);
      
      const select = container.querySelector('select') as HTMLSelectElement;
      select.value = 'invalid';
      
      const changeEvent = new Event('change');
      select.dispatchEvent(changeEvent);
      
      expect(mockPlayer.setPlaybackRate).toHaveBeenCalledWith(NaN);
    });

    it('应该能够处理超出范围的速率', async () => {
      const result = await PlaybackRatePlugin.onInit?.(mockContext);
      
      result?.setRate(5.0);
      
      expect(mockContext.logger.warn).toHaveBeenCalled();
    });

    it('应该能够处理UI容器不存在', async () => {
      mockPlayer.getContainer = jest.fn().mockReturnValue(null);
      
      await PlaybackRatePlugin.onInit?.(mockContext);
      
      // 应该不抛出错误
      expect(true).toBe(true);
    });

    it('应该能够处理并发速率变更', async () => {
      await PlaybackRatePlugin.onInit?.(mockContext);
      
      const select = container.querySelector('select') as HTMLSelectElement;
      
      // 快速连续变更
      select.value = '1.25';
      select.dispatchEvent(new Event('change'));
      
      select.value = '1.5';
      select.dispatchEvent(new Event('change'));
      
      expect(mockPlayer.setPlaybackRate).toHaveBeenCalledTimes(2);
    });
  });

  describe('插件集成测试', () => {
    it('应该能够与 PluginManager 集成', () => {
      const { PluginManager } = require('../../../src/plugin/PluginManager');
      const pluginManager = new PluginManager(mockPlayer, mockLogger);
      
      pluginManager.use(PlaybackRatePlugin);
      
      expect(pluginManager.hasPlugin('builtin.playback-rate')).toBe(true);
    });

    it('应该能够与播放器核心协同', async () => {
      // 创建控制栏
      const controlBar = document.createElement('div');
      controlBar.className = 'ebin-player-control-bar';
      container.appendChild(controlBar);
      
      await PlaybackRatePlugin.onInit?.(mockContext);
      
      // 模拟播放器状态变化
      mockPlayer.getPlaybackRate = jest.fn().mockReturnValue(1.5);
      
      const rateChangeCallback = mockPlayer.on.mock.calls.find(
        call => call[0] === 'ratechange'
      )?.[1];
      
      if (rateChangeCallback) {
        rateChangeCallback();
      }
      
      const select = container.querySelector('select') as HTMLSelectElement;
      expect(select.value).toBe('1.5');
    });

    it('应该能够处理生命周期完整性', async () => {
      // 初始化
      await PlaybackRatePlugin.onInit?.(mockContext);
      
      // 启动
      PlaybackRatePlugin.onStart?.(mockContext);
      
      // 配置变更
      PlaybackRatePlugin.onConfigChange?.({ defaultRate: 1.5 }, mockContext);
      
      // 销毁
      PlaybackRatePlugin.onDestroy?.(mockContext);
      
      // 验证UI元素被清理
      const rateContainer = container.querySelector('.ebin-player-playback-rate');
      expect(rateContainer).toBeNull();
    });
  });

  describe('错误处理', () => {
    it('应该能够处理初始化错误', async () => {
      mockContext.player.getContainer = jest.fn().mockImplementation(() => {
        throw new Error('Container error');
      });
      
      await expect(PlaybackRatePlugin.onInit?.(mockContext)).rejects.toThrow();
    });

    it('应该能够处理配置验证错误', () => {
      const invalidConfig = null;
      
      const result = PlaybackRatePlugin.validateConfig?.(invalidConfig);
      
      expect(result?.valid).toBe(false);
    });

    it('应该能够处理服务调用错误', async () => {
      const result = await PlaybackRatePlugin.onInit?.(mockContext);
      
      mockPlayer.setPlaybackRate = jest.fn().mockImplementation(() => {
        throw new Error('Set rate error');
      });
      
      // 应该不抛出错误，而是记录警告
      result?.setRate(1.5);
      
      expect(mockContext.logger.warn).toHaveBeenCalled();
    });
  });

  describe('性能测试', () => {
    it('应该能够处理大量选项', async () => {
      const manyOptions = Array.from({ length: 100 }, (_, i) => ({
        value: i * 0.1,
        label: `${i * 0.1}x`
      }));
      
      mockContext.getConfig = jest.fn().mockReturnValue({
        defaultRate: 1,
        options: manyOptions
      });
      
      const startTime = performance.now();
      await PlaybackRatePlugin.onInit?.(mockContext);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成
      
      const select = container.querySelector('select') as HTMLSelectElement;
      expect(select.options.length).toBe(100);
    });

    it('应该能够处理频繁的配置更新', async () => {
      await PlaybackRatePlugin.onInit?.(mockContext);
      
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        PlaybackRatePlugin.onConfigChange?.({ defaultRate: i * 0.1 }, mockContext);
      }
      
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
    });
  });
});
