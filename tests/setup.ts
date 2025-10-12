/**
 * Jest 测试环境设置文件
 */
import '@testing-library/jest-dom';

// 模拟 window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// 模拟 ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// 模拟 IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// 模拟 requestAnimationFrame
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0));
global.cancelAnimationFrame = jest.fn(id => clearTimeout(id));

// 模拟 HTMLVideoElement 的一些方法
HTMLVideoElement.prototype.play = jest.fn().mockResolvedValue(undefined);
HTMLVideoElement.prototype.pause = jest.fn();
HTMLVideoElement.prototype.load = jest.fn();
HTMLVideoElement.prototype.requestFullscreen = jest.fn().mockResolvedValue(undefined);
HTMLVideoElement.prototype.exitFullscreen = jest.fn().mockResolvedValue(undefined);
HTMLVideoElement.prototype.requestPictureInPicture = jest.fn().mockResolvedValue({} as PictureInPictureWindow);
HTMLVideoElement.prototype.exitPictureInPicture = jest.fn().mockResolvedValue(undefined);

// 模拟 console 方法以避免测试中的噪音
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// 清理 DOM
afterEach(() => {
  document.body.innerHTML = '';
});
