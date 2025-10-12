/**
 * PlayerCore 单元测试
 */
import { PlayerCore } from '../../src/core/PlayerCore';
import { PlayerOptions, UIMode } from '../../src/types';
import { createTestContainer, cleanupTestContainer, createDefaultPlayerOptions, createMockLogger } from '../utils';

describe('PlayerCore', () => {
  let container: HTMLElement;
  let options: PlayerOptions;
  let playerCore: PlayerCore;

  beforeEach(() => {
    container = createTestContainer();
    options = createDefaultPlayerOptions();
    playerCore = new PlayerCore(container, options);
  });

  afterEach(() => {
    playerCore.destroy();
    cleanupTestContainer();
  });

  describe('构造函数和初始化', () => {
    it('应该正确初始化播放器核心', () => {
      expect(playerCore).toBeDefined();
      expect(playerCore.getContainer()).toBe(container);
    });

    it('应该创建视频元素', () => {
      const videoElement = playerCore.getVideoElement();
      expect(videoElement).toBeDefined();
      expect(videoElement.tagName).toBe('VIDEO');
    });

    it('应该设置视频元素属性', () => {
      const videoElement = playerCore.getVideoElement();
      expect(videoElement.src).toBe(options.src);
      expect(videoElement.muted).toBe(options.muted);
      expect(videoElement.volume).toBe(options.volume);
      expect(videoElement.playbackRate).toBe(options.playbackRate);
    });
  });

  describe('播放控制', () => {
    it('应该能够播放视频', async () => {
      const playSpy = jest.spyOn(playerCore.getVideoElement(), 'play');
      await playerCore.play();
      expect(playSpy).toHaveBeenCalled();
    });

    it('应该能够暂停视频', () => {
      const pauseSpy = jest.spyOn(playerCore.getVideoElement(), 'pause');
      playerCore.pause();
      expect(pauseSpy).toHaveBeenCalled();
    });

    it('应该能够加载视频', () => {
      const loadSpy = jest.spyOn(playerCore.getVideoElement(), 'load');
      playerCore.load();
      expect(loadSpy).toHaveBeenCalled();
    });
  });

  describe('属性访问', () => {
    it('应该能够获取当前时间', () => {
      const currentTime = playerCore.getCurrentTime();
      expect(typeof currentTime).toBe('number');
      expect(currentTime).toBeGreaterThanOrEqual(0);
    });

    it('应该能够设置当前时间', () => {
      const newTime = 30;
      playerCore.setCurrentTime(newTime);
      expect(playerCore.getCurrentTime()).toBe(newTime);
    });

    it('应该能够获取和设置音量', () => {
      const newVolume = 0.5;
      playerCore.setVolume(newVolume);
      expect(playerCore.getVolume()).toBe(newVolume);
    });

    it('应该能够获取和设置静音状态', () => {
      playerCore.setMuted(true);
      expect(playerCore.getMuted()).toBe(true);
      
      playerCore.setMuted(false);
      expect(playerCore.getMuted()).toBe(false);
    });

    it('应该能够获取和设置播放速度', () => {
      const newRate = 1.5;
      playerCore.setPlaybackRate(newRate);
      expect(playerCore.getPlaybackRate()).toBe(newRate);
    });
  });

  describe('状态管理', () => {
    it('应该能够获取播放器状态', () => {
      const state = playerCore.getState();
      expect(state).toBeDefined();
      expect(state.src).toBe(options.src);
      expect(typeof state.currentTime).toBe('number');
      expect(typeof state.duration).toBe('number');
      expect(typeof state.paused).toBe('boolean');
    });

    it('应该能够更新播放器状态', () => {
      const newState = { currentTime: 60, volume: 0.3 };
      playerCore.setState(newState);
      
      const state = playerCore.getState();
      expect(state.currentTime).toBe(60);
      expect(state.volume).toBe(0.3);
    });
  });

  describe('UI模式', () => {
    it('应该能够获取UI模式', () => {
      const uiMode = playerCore.getUIMode();
      expect([UIMode.NATIVE, UIMode.CUSTOM, UIMode.NONE]).toContain(uiMode);
    });

    it('应该能够更新UI模式', () => {
      playerCore.updateUIMode(UIMode.NATIVE);
      expect(playerCore.getUIMode()).toBe(UIMode.NATIVE);
      
      playerCore.updateUIMode(UIMode.CUSTOM);
      expect(playerCore.getUIMode()).toBe(UIMode.CUSTOM);
    });
  });

  describe('全屏控制', () => {
    it('应该能够请求全屏', async () => {
      const requestFullscreenSpy = jest.spyOn(playerCore.getVideoElement(), 'requestFullscreen');
      await playerCore.requestFullscreen();
      expect(requestFullscreenSpy).toHaveBeenCalled();
    });

    it('应该能够退出全屏', async () => {
      // 模拟document.exitFullscreen方法
      Object.defineProperty(document, 'exitFullscreen', {
        value: jest.fn().mockResolvedValue(undefined),
        writable: true
      });
      
      // 模拟全屏状态
      Object.defineProperty(document, 'fullscreenElement', {
        value: playerCore.getVideoElement(),
        writable: true
      });
      
      await playerCore.exitFullscreen();
      expect((document as any).exitFullscreen).toHaveBeenCalled();
    });

    it('应该能够检查全屏状态', () => {
      const isFullscreen = playerCore.isFullscreen();
      expect(typeof isFullscreen).toBe('boolean');
    });
  });

  describe('画中画', () => {
    beforeEach(() => {
      // 模拟画中画API
      const mockPictureInPictureWindow = {};
      Object.defineProperty(playerCore.getVideoElement(), 'requestPictureInPicture', {
        value: jest.fn().mockResolvedValue(mockPictureInPictureWindow),
        writable: true
      });
      
      Object.defineProperty(document, 'pictureInPictureEnabled', {
        value: true,
        writable: true
      });
      
      Object.defineProperty(playerCore.getVideoElement(), 'disablePictureInPicture', {
        value: false,
        writable: true
      });
      
      Object.defineProperty(document, 'pictureInPictureElement', {
        value: null,
        writable: true
      });
      
      Object.defineProperty(document, 'exitPictureInPicture', {
        value: jest.fn().mockResolvedValue(undefined),
        writable: true
      });
    });

    it('应该能够请求画中画', async () => {
      const requestPipSpy = jest.spyOn(playerCore.getVideoElement(), 'requestPictureInPicture');
      await playerCore.requestPictureInPicture();
      expect(requestPipSpy).toHaveBeenCalled();
    });

    it('应该能够退出画中画', async () => {
      // 模拟画中画状态
      Object.defineProperty(document, 'pictureInPictureElement', {
        value: playerCore.getVideoElement(),
        writable: true
      });
      
      const exitPipSpy = jest.spyOn(document, 'exitPictureInPicture');
      await playerCore.exitPictureInPicture();
      expect(exitPipSpy).toHaveBeenCalled();
    });

    it('应该能够检查画中画状态', () => {
      const isPip = playerCore.isPictureInPicture();
      expect(typeof isPip).toBe('boolean');
    });
  });

  describe('事件系统', () => {
    it('应该能够监听事件', () => {
      const callback = jest.fn();
      const unsubscribe = playerCore.on('play', callback);
      
      expect(typeof unsubscribe).toBe('function');
      
      // 模拟播放事件
      const videoElement = playerCore.getVideoElement();
      videoElement.dispatchEvent(new Event('play'));
      
      expect(callback).toHaveBeenCalled();
    });

    it('应该能够取消事件监听', () => {
      const callback = jest.fn();
      const unsubscribe = playerCore.on('play', callback);
      
      unsubscribe();
      
      // 模拟播放事件
      const videoElement = playerCore.getVideoElement();
      videoElement.dispatchEvent(new Event('play'));
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('应该能够触发事件', () => {
      const callback = jest.fn();
      playerCore.on('customEvent', callback);
      
      playerCore.emit('customEvent', { data: 'test' });
      
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'customEvent',
          data: { data: 'test' }
        })
      );
    });
  });

  describe('销毁', () => {
    it('应该能够正确销毁播放器', () => {
      const videoElement = playerCore.getVideoElement();
      const removeChildSpy = jest.spyOn(videoElement.parentNode!, 'removeChild');
      
      playerCore.destroy();
      
      // 验证视频元素被移除
      expect(removeChildSpy).toHaveBeenCalledWith(videoElement);
    });

    it('销毁后应该标记为已销毁', () => {
      // 通过尝试调用需要检查销毁状态的方法来验证
      playerCore.destroy();
      
      // 销毁后调用play应该不会执行
      const playSpy = jest.spyOn(playerCore.getVideoElement(), 'play');
      playerCore.play();
      expect(playSpy).not.toHaveBeenCalled();
    });
  });
});
