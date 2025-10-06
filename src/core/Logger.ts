export class Logger {
  private namespace: string;
  private enabled: boolean;

  constructor(namespace: string, enabled: boolean = false) {
    this.namespace = namespace;
    this.enabled = enabled;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  child(suffix: string): Logger {
    return new Logger(`${this.namespace}:${suffix}`, this.enabled);
  }

  debug(...args: any[]): void {
    if (!this.enabled) return;
    // eslint-disable-next-line no-console
    console.debug('[EbinPlayer]', `[${this.namespace}]`, ...args);
  }

  info(...args: any[]): void {
    if (!this.enabled) return;
    // eslint-disable-next-line no-console
    console.info('[EbinPlayer]', `[${this.namespace}]`, ...args);
  }

  warn(...args: any[]): void {
    if (!this.enabled) return;
    // eslint-disable-next-line no-console
    console.warn('[EbinPlayer]', `[${this.namespace}]`, ...args);
  }

  error(...args: any[]): void {
    // 错误日志即使在关闭调试时也输出
    // eslint-disable-next-line no-console
    console.error('[EbinPlayer]', `[${this.namespace}]`, ...args);
  }
}


