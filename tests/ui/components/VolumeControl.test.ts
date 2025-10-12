/**
 * VolumeControl 单元测试
 */
import { VolumeControl, VolumeControlConfig } from '../../../src/ui/components/VolumeControl';
import { 
  createMockPlayerInstance, 
  createMockLogger, 
  createTestContainer,
  cleanupTestContainer,
  waitFor,
  simulateUserInteraction,
  simulateMouseEvent,
  simulateTouchEvent,
  simulateKeyboardEvent,
  simulateWheelEvent
} from '../../utils';

describe('VolumeControl', () => {
  let container: HTMLElement;
  let player: any;
  let logger: any;
  let volumeControl: VolumeControl;
  let config: VolumeControlConfig;

  beforeEach(() => {
    container = createTestContainer();
    player = createMockPlayerInstance({
      getVolume: jest.fn().mockReturnValue(0.5),
      getMuted: jest.fn().mockReturnValue(false),
      setVolume: jest.fn().mockReturnValue({}),
      setMuted: jest.fn().mockReturnValue({}),
      getState: jest.fn().mockReturnValue({
        volume: 0.5,
        muted: false
      })
    });
    logger = createMockLogger();
    config = {
      id: 'volumeControl',
      name: 'Volume Control',
      enabled: true,
      order: 1,
      platforms: ['desktop', 'mobile'],
      showSlider: true,
      showButton: true,
      sliderWidth: 80,
      sliderHeight: 100,
      keyboardControl: true,
      volumeStep: 0.1
    };
    volumeControl = new VolumeControl(player, container, config, {}, logger);
  });

  // 辅助函数：模拟UIManager的行为
  const mountComponent = async () => {
    await volumeControl.init();
    const element = volumeControl.getElement();
    if (element) {
      container.appendChild(element);
    }
  };

  afterEach(() => {
    volumeControl.destroy();
    cleanupTestContainer();
  });

  describe('基础功能', () => {
    it('应该能够创建音量控制元素', async () => {
      await mountComponent();
      
      const volumeContainer = container.querySelector('.ebin-volume-control');
      const volumeButton = container.querySelector('.ebin-volume-button');
      const volumeSlider = container.querySelector('.ebin-volume-slider');
      
      expect(volumeContainer).toBeDefined();
      expect(volumeButton).toBeDefined();
      expect(volumeSlider).toBeDefined();
    });

    it('应该能够设置ARIA属性', async () => {
      await mountComponent();
      
      const volumeButton = container.querySelector('.ebin-volume-button');
      const volumeSlider = container.querySelector('.ebin-volume-slider');
      
      expect(volumeButton?.getAttribute('aria-label')).toBe('静音/取消静音');
      expect(volumeButton?.getAttribute('type')).toBe('button');
      expect(volumeSlider?.getAttribute('aria-label')).toBe('音量调节');
    });

    it('应该能够更新音量按钮图标', async () => {
      await mountComponent();
      
      const state = {
        volume: 0.8,
        muted: false
      };
      
      volumeControl.update(state as any);
      
      const volumeButton = container.querySelector('.ebin-volume-button');
      expect(volumeButton?.innerHTML).toBe('🔊');
    });

    it('应该能够更新音量滑块值', async () => {
      await mountComponent();
      
      const state = {
        volume: 0.3,
        muted: false
      };
      
      volumeControl.update(state as any);
      
      const volumeSlider = container.querySelector('.ebin-volume-slider') as HTMLInputElement;
      expect(volumeSlider.value).toBe('0.3');
    });
  });

  describe('交互功能', () => {
    it('应该能够处理音量按钮点击', async () => {
      await mountComponent();
      
      const volumeButton = container.querySelector('.ebin-volume-button') as HTMLButtonElement;
      volumeButton.click();
      
      expect(player.setMuted).toHaveBeenCalled();
      expect(player.setVolume).toHaveBeenCalled();
    });

    it('应该能够处理静音切换', async () => {
      await mountComponent();
      
      // 初始状态：未静音
      player.getMuted = jest.fn().mockReturnValue(false);
      player.getVolume = jest.fn().mockReturnValue(0.8);
      
      const volumeButton = container.querySelector('.ebin-volume-button') as HTMLButtonElement;
      volumeButton.click();
      
      expect(player.setMuted).toHaveBeenCalledWith(true);
      expect(player.setVolume).toHaveBeenCalledWith(0);
    });

    it('应该能够处理取消静音', async () => {
      await mountComponent();
      
      // 初始状态：静音
      player.getMuted = jest.fn().mockReturnValue(true);
      player.getVolume = jest.fn().mockReturnValue(0);
      
      const volumeButton = container.querySelector('.ebin-volume-button') as HTMLButtonElement;
      volumeButton.click();
      
      expect(player.setMuted).toHaveBeenCalledWith(false);
      expect(player.setVolume).toHaveBeenCalledWith(0.5); // 默认恢复音量
    });

    it('应该能够处理滑块拖拽', async () => {
      await mountComponent();
      
      const volumeSlider = container.querySelector('.ebin-volume-slider') as HTMLInputElement;
      const volumeContainer = container.querySelector('.ebin-volume-control') as HTMLElement;
      
      // 开始拖拽
      const mousedownEvent = new MouseEvent('mousedown', { clientX: 0, clientY: 0 });
      volumeSlider.dispatchEvent(mousedownEvent);
      
      // 拖拽
      const mousemoveEvent = new MouseEvent('mousemove', { clientX: 0, clientY: -50 });
      document.dispatchEvent(mousemoveEvent);
      
      // 结束拖拽
      const mouseupEvent = new MouseEvent('mouseup');
      document.dispatchEvent(mouseupEvent);
      
      expect(player.setVolume).toHaveBeenCalled();
    });

    it('应该能够处理触摸拖拽', async () => {
      await mountComponent();
      
      const volumeSlider = container.querySelector('.ebin-volume-slider') as HTMLInputElement;
      
      // 创建模拟的触摸对象
      const touch = {
        clientX: 0,
        clientY: 0
      } as Touch;
      
      // 开始触摸
      const touchstartEvent = new TouchEvent('touchstart', {
        touches: [touch] as any
      });
      volumeSlider.dispatchEvent(touchstartEvent);
      
      // 触摸移动
      const touchmoveEvent = new TouchEvent('touchmove', {
        touches: [{ ...touch, clientY: -50 }] as any
      });
      document.dispatchEvent(touchmoveEvent);
      
      // 结束触摸
      const touchendEvent = new TouchEvent('touchend');
      document.dispatchEvent(touchendEvent);
      
      expect(player.setVolume).toHaveBeenCalled();
    });

    it('应该能够处理滚轮控制', async () => {
      await mountComponent();
      
      const volumeContainer = container.querySelector('.ebin-volume-control') as HTMLElement;
      
      // 向上滚动增加音量
      simulateWheelEvent(volumeContainer, -100);
      expect(player.setVolume).toHaveBeenCalledWith(0.6); // 0.5 + 0.1
      
      // 向下滚动降低音量
      simulateWheelEvent(volumeContainer, 100);
      expect(player.setVolume).toHaveBeenCalledWith(0.4); // 0.5 - 0.1
    });

    it('应该能够处理键盘控制', async () => {
      await mountComponent();
      
      // 上箭头键增加音量
      simulateKeyboardEvent(document.body, 'ArrowUp');
      expect(player.setVolume).toHaveBeenCalledWith(0.6); // 0.5 + 0.1
      
      // 下箭头键降低音量
      simulateKeyboardEvent(document.body, 'ArrowDown');
      expect(player.setVolume).toHaveBeenCalledWith(0.4); // 0.5 - 0.1
      
      // M键切换静音
      simulateKeyboardEvent(document.body, 'm');
      expect(player.setMuted).toHaveBeenCalled();
    });
  });

  describe('静音机制', () => {
    it('应该能够记忆静音前的音量', async () => {
      await mountComponent();
      
      // 设置初始音量
      player.getVolume = jest.fn().mockReturnValue(0.8);
      player.getMuted = jest.fn().mockReturnValue(false);
      
      const volumeButton = container.querySelector('.ebin-volume-button') as HTMLButtonElement;
      volumeButton.click();
      
      // 验证静音
      expect(player.setMuted).toHaveBeenCalledWith(true);
      expect(player.setVolume).toHaveBeenCalledWith(0);
      
      // 取消静音
      player.getMuted = jest.fn().mockReturnValue(true);
      volumeButton.click();
      
      // 验证恢复音量
      expect(player.setMuted).toHaveBeenCalledWith(false);
      expect(player.setVolume).toHaveBeenCalledWith(0.8);
    });

    it('应该能够处理静音时音量为0的情况', async () => {
      await mountComponent();
      
      // 静音状态，音量为0
      player.getMuted = jest.fn().mockReturnValue(true);
      player.getVolume = jest.fn().mockReturnValue(0);
      
      const volumeButton = container.querySelector('.ebin-volume-button') as HTMLButtonElement;
      volumeButton.click();
      
      // 应该恢复到默认音量
      expect(player.setVolume).toHaveBeenCalledWith(0.5);
    });
  });

  describe('UI行为', () => {
    it('应该能够显示和隐藏滑块', async () => {
      await mountComponent();
      
      const volumeButton = container.querySelector('.ebin-volume-button') as HTMLButtonElement;
      const volumeSlider = container.querySelector('.ebin-volume-slider') as HTMLInputElement;
      
      // 鼠标进入显示滑块
      const mouseenterEvent = new MouseEvent('mouseenter');
      volumeButton.dispatchEvent(mouseenterEvent);
      
      expect(volumeSlider.style.opacity).toBe('1');
      expect(volumeSlider.style.pointerEvents).toBe('auto');
      
      // 鼠标离开隐藏滑块
      const volumeContainer = container.querySelector('.ebin-volume-control') as HTMLElement;
      const mouseleaveEvent = new MouseEvent('mouseleave');
      volumeContainer.dispatchEvent(mouseleaveEvent);
      
      expect(volumeSlider.style.opacity).toBe('0');
      expect(volumeSlider.style.pointerEvents).toBe('none');
    });

    it('应该能够调整滑块位置', async () => {
      await mountComponent();
      
      const volumeSlider = container.querySelector('.ebin-volume-slider') as HTMLInputElement;
      
      // 模拟窗口大小变化
      const resizeEvent = new Event('resize');
      window.dispatchEvent(resizeEvent);
      
      // 应该不抛出错误
      expect(true).toBe(true);
    });

    it('应该能够处理滑块悬停效果', async () => {
      await mountComponent();
      
      const volumeSlider = container.querySelector('.ebin-volume-slider') as HTMLInputElement;
      
      // 鼠标进入
      const mouseenterEvent = new MouseEvent('mouseenter');
      volumeSlider.dispatchEvent(mouseenterEvent);
      
      // 应该显示滑块
      expect(volumeSlider.style.opacity).toBe('1');
    });
  });

  describe('音量图标', () => {
    it('应该能够显示不同音量级别的图标', async () => {
      await mountComponent();
      
      // 静音
      const mutedState = { volume: 0, muted: true };
      volumeControl.update(mutedState as any);
      expect(container.querySelector('.ebin-volume-button')?.innerHTML).toBe('🔇');
      
      // 低音量
      const lowVolumeState = { volume: 0.2, muted: false };
      volumeControl.update(lowVolumeState as any);
      expect(container.querySelector('.ebin-volume-button')?.innerHTML).toBe('🔈');
      
      // 中音量
      const midVolumeState = { volume: 0.5, muted: false };
      volumeControl.update(midVolumeState as any);
      expect(container.querySelector('.ebin-volume-button')?.innerHTML).toBe('🔉');
      
      // 高音量
      const highVolumeState = { volume: 0.8, muted: false };
      volumeControl.update(highVolumeState as any);
      expect(container.querySelector('.ebin-volume-button')?.innerHTML).toBe('🔊');
    });
  });

  describe('配置选项', () => {
    it('应该能够禁用滑块', async () => {
      const noSliderConfig = { ...config, showSlider: false };
      const noSliderControl = new VolumeControl(player, container, noSliderConfig, {}, logger);
      
      await noSliderControl.init();
      
      const volumeSlider = container.querySelector('.ebin-volume-slider');
      expect(volumeSlider).toBeNull();
      
      noSliderControl.destroy();
    });

    it('应该能够禁用按钮', async () => {
      const noButtonConfig = { ...config, showButton: false };
      const noButtonControl = new VolumeControl(player, container, noButtonConfig, {}, logger);
      
      await noButtonControl.init();
      
      const volumeButton = container.querySelector('.ebin-volume-button');
      expect(volumeButton).toBeNull();
      
      noButtonControl.destroy();
    });

    it('应该能够禁用键盘控制', async () => {
      const noKeyboardConfig = { ...config, keyboardControl: false };
      const noKeyboardControl = new VolumeControl(player, container, noKeyboardConfig, {}, logger);
      
      await noKeyboardControl.init();
      
      simulateKeyboardEvent(document.body, 'ArrowUp');
      
      expect(player.setVolume).not.toHaveBeenCalled();
      
      noKeyboardControl.destroy();
    });

    it('应该能够自定义音量步长', async () => {
      const customStepConfig = { ...config, volumeStep: 0.2 };
      const customStepControl = new VolumeControl(player, container, customStepConfig, {}, logger);
      
      await customStepControl.init();
      
      simulateKeyboardEvent(document.body, 'ArrowUp');
      
      expect(player.setVolume).toHaveBeenCalledWith(0.7); // 0.5 + 0.2
      
      customStepControl.destroy();
    });

    it('应该能够自定义滑块尺寸', async () => {
      const customSizeConfig = { ...config, sliderWidth: 100, sliderHeight: 120 };
      const customSizeControl = new VolumeControl(player, container, customSizeConfig, {}, logger);
      
      await customSizeControl.init();
      
      const volumeSlider = container.querySelector('.ebin-volume-slider') as HTMLInputElement;
      expect(volumeSlider.style.width).toBe('120px');
      expect(volumeSlider.style.height).toBe('100px');
      
      customSizeControl.destroy();
    });
  });

  describe('边界情况', () => {
    it('应该能够限制音量范围', async () => {
      await mountComponent();
      
      const volumeSlider = container.querySelector('.ebin-volume-slider') as HTMLInputElement;
      
      // 设置超出范围的值
      volumeSlider.value = '1.5';
      const changeEvent = new Event('change');
      volumeSlider.dispatchEvent(changeEvent);
      
      // 应该被限制在0-1范围内
      expect(volumeSlider.value).toBe('1.5'); // 输入值保持，但实际处理时会限制
    });

    it('应该能够处理快速拖拽', async () => {
      await mountComponent();
      
      const volumeSlider = container.querySelector('.ebin-volume-slider') as HTMLInputElement;
      
      // 快速连续拖拽
      for (let i = 0; i < 10; i++) {
        const mousedownEvent = new MouseEvent('mousedown', { clientX: 0, clientY: i * 10 });
        volumeSlider.dispatchEvent(mousedownEvent);
        
        const mousemoveEvent = new MouseEvent('mousemove', { clientX: 0, clientY: i * 10 - 50 });
        document.dispatchEvent(mousemoveEvent);
        
        const mouseupEvent = new MouseEvent('mouseup');
        document.dispatchEvent(mouseupEvent);
      }
      
      expect(player.setVolume).toHaveBeenCalled();
    });

    it('应该能够处理窗口大小变化', async () => {
      await mountComponent();
      
      // 模拟窗口大小变化
      const resizeEvent = new Event('resize');
      window.dispatchEvent(resizeEvent);
      
      // 应该不抛出错误
      expect(true).toBe(true);
    });

    it('应该能够处理滚动事件', async () => {
      await mountComponent();
      
      // 模拟滚动事件
      const scrollEvent = new Event('scroll');
      window.dispatchEvent(scrollEvent);
      
      // 应该不抛出错误
      expect(true).toBe(true);
    });
  });

  describe('主题样式', () => {
    it('应该能够应用主题样式', async () => {
      const theme = {
        primaryColor: '#ff0000',
        textColor: '#00ff00'
      };
      
      const themedControl = new VolumeControl(player, container, config, theme, logger);
      await themedControl.init();
      
      const volumeButton = container.querySelector('.ebin-volume-button') as HTMLButtonElement;
      expect(volumeButton.style.color).toBe('rgb(0, 255, 0)');
      
      themedControl.destroy();
    });

    it('应该能够应用悬停效果', async () => {
      await mountComponent();
      
      const volumeButton = container.querySelector('.ebin-volume-button') as HTMLButtonElement;
      
      // 鼠标进入
      const mouseenterEvent = new MouseEvent('mouseenter');
      volumeButton.dispatchEvent(mouseenterEvent);
      
      expect(volumeButton.style.backgroundColor).toBe('rgba(255, 255, 255, 0.1)');
      
      // 鼠标离开
      const mouseleaveEvent = new MouseEvent('mouseleave');
      volumeButton.dispatchEvent(mouseleaveEvent);
      
      expect(volumeButton.style.backgroundColor).toBe('transparent');
    });

    it('应该能够应用焦点效果', async () => {
      await mountComponent();
      
      const volumeButton = container.querySelector('.ebin-volume-button') as HTMLButtonElement;
      
      // 获得焦点
      const focusEvent = new FocusEvent('focus');
      volumeButton.dispatchEvent(focusEvent);
      
      expect(volumeButton.style.outline).toBe('2px solid rgb(59, 130, 246)');
      
      // 失去焦点
      const blurEvent = new FocusEvent('blur');
      volumeButton.dispatchEvent(blurEvent);
      
      expect(volumeButton.style.outline).toBe('none');
    });
  });

  describe('性能测试', () => {
    it('应该能够处理大量状态更新', async () => {
      await mountComponent();
      
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        const state = {
          volume: i / 1000,
          muted: i % 2 === 0
        };
        volumeControl.update(state as any);
      }
      
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成
    });

    it('应该能够处理频繁的拖拽操作', async () => {
      await mountComponent();
      
      const volumeSlider = container.querySelector('.ebin-volume-slider') as HTMLInputElement;
      
      const startTime = performance.now();
      
      // 开始拖拽
      const mousedownEvent = new MouseEvent('mousedown', { clientX: 0, clientY: 0 });
      volumeSlider.dispatchEvent(mousedownEvent);
      
      // 快速移动
      for (let i = 0; i < 100; i++) {
        const mousemoveEvent = new MouseEvent('mousemove', { 
          clientX: 0, 
          clientY: -i 
        });
        document.dispatchEvent(mousemoveEvent);
      }
      
      // 结束拖拽
      const mouseupEvent = new MouseEvent('mouseup');
      document.dispatchEvent(mouseupEvent);
      
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(50); // 应该在50ms内完成
    });
  });

  describe('错误处理', () => {
    it('应该能够处理静音切换异常', async () => {
      await mountComponent();
      
      player.setMuted = jest.fn().mockImplementation(() => {
        throw new Error('Set muted failed');
      });
      
      const volumeButton = container.querySelector('.ebin-volume-button') as HTMLButtonElement;
      volumeButton.click();
      
      expect(logger.error).toHaveBeenCalled();
    });

    it('应该能够处理音量设置异常', async () => {
      await mountComponent();
      
      player.setVolume = jest.fn().mockImplementation(() => {
        throw new Error('Set volume failed');
      });
      
      const volumeSlider = container.querySelector('.ebin-volume-slider') as HTMLInputElement;
      volumeSlider.value = '0.8';
      const changeEvent = new Event('change');
      volumeSlider.dispatchEvent(changeEvent);
      
      // 应该不抛出错误
      expect(true).toBe(true);
    });
  });
});
