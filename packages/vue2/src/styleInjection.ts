export type StyleInjectionMode = 'auto' | 'manual';

export interface StyleInjectionOptions {
  mode?: StyleInjectionMode;
  stylesheetUrl?: string;
  nonce?: string;
  injectOnceKey?: string;
  packageVersion?: string;
}

const INJECTED_KEY = '__ebin_player_styles_injected__';
const DEFAULT_STYLESHEET_URL = 'https://unpkg.com/@ebin-player/core/dist/styles.css';

export function ensureStylesInjected(options: StyleInjectionOptions = {}): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const {
    mode = 'auto',
    stylesheetUrl = DEFAULT_STYLESHEET_URL,
    nonce,
    injectOnceKey = INJECTED_KEY,
  } = options;

  if (mode === 'manual') {
    return;
  }

  // Check if already injected
  if ((window as any)[injectOnceKey]) {
    return;
  }

  try {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = stylesheetUrl;
    
    if (nonce) {
      link.setAttribute('nonce', nonce);
    }

    // Add to head
    document.head.appendChild(link);

    // Mark as injected
    (window as any)[injectOnceKey] = true;

    console.log(`[EbinPlayer Vue2] Styles injected from: ${stylesheetUrl}`);
  } catch (error) {
    console.warn('[EbinPlayer Vue2] Failed to inject styles:', error);
  }
}
