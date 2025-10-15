export type StyleInjectionMode = 'auto' | 'manual';

export interface StyleInjectionOptions {
  mode?: StyleInjectionMode;
  stylesheetUrl?: string;
  nonce?: string;
  injectOnceKey?: string;
  packageVersion?: string;
}

const DEFAULT_STYLESHEET = 'node_modules/ebin-player/dist/styles.css';

function getDefaultKey(version?: string) {
  const v = version ? `@${version}` : '';
  return `__ebin_player_styles_injected${v}`;
}

export function ensureStylesInjected(options: StyleInjectionOptions = {}) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const { mode = 'auto', stylesheetUrl, nonce, injectOnceKey, packageVersion } = options;
  if (mode !== 'auto') return;

  const key = injectOnceKey || getDefaultKey(packageVersion);
  if ((window as any)[key]) return;

  const href = stylesheetUrl || DEFAULT_STYLESHEET;

  // Avoid duplicate link elements by href
  const existing = Array.from(document.getElementsByTagName('link')).some(
    (l) => l.rel === 'stylesheet' && (l as HTMLLinkElement).href.includes('ebin-player')
  );
  if (existing) {
    (window as any)[key] = true;
    return;
  }

  try {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    if (nonce) link.nonce = nonce;
    document.head.appendChild(link);
    (window as any)[key] = true;
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[@ebin-player/react] failed to inject stylesheet', e);
    }
  }
}


