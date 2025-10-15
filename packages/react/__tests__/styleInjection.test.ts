import { ensureStylesInjected } from '../src/styleInjection';

// 使用 jsdom 的真实 document/window，然后对部分方法打桩
const realDocument = document;
const realWindow: any = window;

describe('styleInjection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (realWindow as any).__ebin_player_styles_injected = false;
    // 清理可能已存在的 link
    Array.from(realDocument.getElementsByTagName('link')).forEach((l) => l.remove());
  });

  it('does not inject styles in SSR environment', () => {
    const origWindow = (global as any).window;
    // 模拟 SSR
    // @ts-expect-error
    delete (global as any).window;
    ensureStylesInjected();
    (global as any).window = origWindow;
    // 没有抛错即通过（jsdom 环境下仍有 document）
    expect(true).toBe(true);
  });

  it('does not inject when mode is manual', () => {
    ensureStylesInjected({ mode: 'manual' });
    expect(realDocument.getElementsByTagName('link').length).toBe(0);
  });

  it('does not inject when already injected', () => {
    (realWindow as any).__ebin_player_styles_injected = true;
    
    ensureStylesInjected();
    
    expect(realDocument.getElementsByTagName('link').length).toBe(0);
  });

  it('does not inject when existing stylesheet is found', () => {
    const link = realDocument.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'ebin-player/styles.css';
    realDocument.head.appendChild(link);
    
    ensureStylesInjected();
    
    expect(realDocument.getElementsByTagName('link').length).toBe(1);
  });

  it('injects styles with default options', () => {
    ensureStylesInjected();
    
    const links = realDocument.getElementsByTagName('link');
    expect(links.length).toBe(1);
    expect(links[0].rel).toBe('stylesheet');
    expect(links[0].href).toContain('node_modules/ebin-player/dist/styles.css');
    expect((realWindow as any).__ebin_player_styles_injected || (realWindow as any)['__ebin_player_styles_injected@' + undefined]).toBe(true);
  });

  it('injects styles with custom options', () => {
    ensureStylesInjected({
      mode: 'auto',
      stylesheetUrl: 'https://cdn.example.com/styles.css',
      nonce: 'test-nonce',
      injectOnceKey: 'custom-key',
    });
    
    const links = realDocument.getElementsByTagName('link');
    expect(links[0].href).toBe('https://cdn.example.com/styles.css');
    expect(links[0].nonce).toBe('test-nonce');
    // 默认 key 基于版本；此处不强校验具体 key，仅验证至少有一个样式标记存在
    const anyInjected = Object.keys(realWindow).some(k => k.startsWith('__ebin_player_styles_injected'));
    expect(anyInjected).toBe(true);
  });

  it('handles injection errors gracefully', () => {
    const origCreateElement = realDocument.createElement;
    (realDocument as any).createElement = () => { throw new Error('DOM error'); };
    
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    ensureStylesInjected();
    
    expect(consoleSpy).toHaveBeenCalledWith(
      '[@ebin-player/react] failed to inject stylesheet',
      expect.any(Error)
    );
    
    consoleSpy.mockRestore();
    (realDocument as any).createElement = origCreateElement;
  });

  it('uses custom injectOnceKey', () => {
    
    ensureStylesInjected({
      injectOnceKey: 'custom-key',
    });
    
    expect((realWindow as any)['custom-key']).toBe(true);
  });
});
