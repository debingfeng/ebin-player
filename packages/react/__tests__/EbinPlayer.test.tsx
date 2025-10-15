import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EbinPlayer } from '../src/EbinPlayer';

// Mock ebin-player
jest.mock('@ebin-player/core', () => ({
  createPlayer: jest.fn(() => ({
    on: jest.fn(() => () => {}),
    play: jest.fn(),
    pause: jest.fn(),
    getCurrentTime: jest.fn(() => 0),
    getDuration: jest.fn(() => 100),
    getVolume: jest.fn(() => 1),
    getMuted: jest.fn(() => false),
    getPlaybackRate: jest.fn(() => 1),
    isFullscreen: jest.fn(() => false),
    isPictureInPicture: jest.fn(() => false),
    setMuted: jest.fn(),
    setVolume: jest.fn(),
    setPlaybackRate: jest.fn(),
    updateUIConfig: jest.fn(),
    updateUITheme: jest.fn(),
    requestFullscreen: jest.fn(),
    exitFullscreen: jest.fn(),
    requestPictureInPicture: jest.fn(),
    exitPictureInPicture: jest.fn(),
    destroy: jest.fn(),
    use: jest.fn(),
    unuse: jest.fn(),
    getPlugin: jest.fn(),
  })),
  version: '0.0.4',
}));

// Mock styleInjection
jest.mock('../src/styleInjection', () => ({
  ensureStylesInjected: jest.fn(),
}));

describe('EbinPlayer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<EbinPlayer src="test.mp4" />);
    const divs = container.querySelectorAll('div');
    expect(divs.length).toBeGreaterThan(0);
  });

  it('calls createPlayer with correct options', () => {
    const { createPlayer } = require('@ebin-player/core');
    render(<EbinPlayer src="test.mp4" uiMode="advanced" autoplay containerProps={{ 'data-testid': 'c' }} />);
    
    expect(createPlayer).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({ src: 'test.mp4', uiMode: 'advanced', autoplay: true })
    );
  });

  it('handles events correctly', async () => {
    const onPlay = jest.fn();
    const onPause = jest.fn();
    const onTimeUpdate = jest.fn();

    render(
      <EbinPlayer
        src="test.mp4"
        onPlay={onPlay}
        onPause={onPause}
        onTimeUpdate={onTimeUpdate}
      />
    );

    // 模拟事件触发
    const { createPlayer } = require('@ebin-player/core');
    const mockPlayer = createPlayer.mock.results[0].value;
    
    // 模拟 on 方法被调用
    expect(mockPlayer.on).toHaveBeenCalledWith('play', expect.any(Function));
    expect(mockPlayer.on).toHaveBeenCalledWith('pause', expect.any(Function));
    expect(mockPlayer.on).toHaveBeenCalledWith('timeupdate', expect.any(Function));
  });

  it('handles ref correctly', () => {
    const ref = React.createRef();
    render(<EbinPlayer ref={ref} src="test.mp4" />);
    
    expect(ref.current).toBeDefined();
    expect(ref.current?.getInstance).toBeDefined();
  });

  it('applies container props correctly', () => {
    render(
      <EbinPlayer
        src="test.mp4"
        containerClassName="test-class"
        containerStyle={{ backgroundColor: 'red' }}
        containerProps={{ 'data-testid': 'player' }}
      />
    );

    const container = screen.getByTestId('player');
    expect(container).toHaveClass('test-class');
    expect(container).toHaveStyle({ backgroundColor: 'rgb(255, 0, 0)' });
  });

  it('handles styleInjection correctly', () => {
    const { ensureStylesInjected } = require('../src/styleInjection');
    
    render(
      <EbinPlayer
        src="test.mp4"
        styleInjection="auto"
        stylesheetUrl="custom.css"
        nonce="test-nonce"
      />
    );

    expect(ensureStylesInjected).toHaveBeenCalledWith({
      mode: 'auto',
      stylesheetUrl: 'custom.css',
      nonce: 'test-nonce',
      injectOnceKey: undefined,
      packageVersion: '0.0.4',
    });
  });

  it('handles incremental updates', () => {
    const { createPlayer } = require('@ebin-player/core');
    const { rerender } = render(<EbinPlayer src="test.mp4" muted={false} />);
    const mockPlayer = createPlayer.mock.results[0]?.value;
    
    // 更新 muted 属性
    rerender(<EbinPlayer src="test.mp4" muted={true} />);
    
    expect(mockPlayer.setMuted).toHaveBeenCalledWith(true);
  });

  it('handles reinitializeOn correctly', () => {
    const { createPlayer } = require('@ebin-player/core');
    
    const { rerender } = render(
      <EbinPlayer
        src="test1.mp4"
        uiMode="custom"
        reinitializeOn={['src', 'uiMode']}
      />
    );

    // 改变 src 应该重新创建
    rerender(
      <EbinPlayer
        src="test2.mp4"
        uiMode="custom"
        reinitializeOn={['src', 'uiMode']}
      />
    );

    // 应该被调用两次（初始创建 + 重新创建）
    expect(createPlayer).toHaveBeenCalledTimes(2);
  });

  it('cleans up on unmount', () => {
    const { createPlayer } = require('@ebin-player/core');
    const { unmount } = render(<EbinPlayer src="test.mp4" />);
    const mockPlayer = createPlayer.mock.results[0]?.value;
    
    unmount();
    
    expect(mockPlayer.destroy).toHaveBeenCalled();
  });
});
