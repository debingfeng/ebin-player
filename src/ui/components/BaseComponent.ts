/**
 * UI组件基类
 * 提供统一的组件生命周期管理和错误处理
 */
import { PlayerInstance, PlayerState, Logger } from "../../types";

export interface ComponentConfig {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
  platforms: ("mobile" | "desktop" | "tv")[];
  a11y?: {
    keyboard?: string;
    ariaLabel?: boolean;
    ariaLive?: "polite" | "assertive" | "off";
    essentialFor?: string;
  };
  // ProgressBar specific options
  showThumb?: boolean;
  showBuffered?: boolean;
  clickToSeek?: boolean;
  keyboardSeek?: boolean;
  seekStep?: number;
  // PlayButton specific options
  showOverlay?: boolean;
  overlaySize?: number;
  iconSize?: number;
}

export interface ComponentTheme {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: number;
  fontSize?: string;
  spacing?: number;
}

/**
 * 组件基类，提供所有组件共有的基础功能
 * 包括初始化、主题管理、事件处理、错误处理等
 */
export abstract class BaseComponent {
  // 播放器实例
  protected player: PlayerInstance;
  // 组件容器元素
  protected container: HTMLElement;
  // 组件配置
  protected config: ComponentConfig;
  // 组件主题
  protected theme: ComponentTheme;
  // 日志记录器
  protected logger: Logger;
  // 组件DOM元素
  protected element: HTMLElement | null = null;
  // 组件是否已销毁
  protected isDestroyed = false;
  // 事件监听器列表
  protected eventListeners: Array<{
    element: HTMLElement;
    event: string;
    handler: EventListener;
  }> = [];

  constructor(
    player: PlayerInstance,
    container: HTMLElement,
    config: ComponentConfig,
    theme: ComponentTheme = {},
    logger: Logger,
  ) {
    this.player = player;
    this.container = container;
    this.config = config;
    this.theme = theme;
    this.logger = logger.child(`Component:${config.name}`);
  }

  /**
   * 初始化组件
   */
  async init(): Promise<void> {
    try {
      this.logger.debug("Initializing component", { config: this.config });

      if (!this.config.enabled) {
        this.logger.debug("Component disabled, skipping initialization");
        return;
      }

      // 检查平台支持
      if (!this.isPlatformSupported()) {
        this.logger.debug("Platform not supported, skipping initialization");
        return;
      }

      await this.createElement();
      this.setupEventListeners();
      this.setupAccessibility();

      this.logger.debug("Component initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize component", error);
      this.handleError(error);
    }
  }

  /**
   * 创建组件元素
   */
  protected abstract createElement(): Promise<void>;

  /**
   * 设置事件监听器
   */
  protected abstract setupEventListeners(): void;

  /**
   * 设置无障碍功能
   */
  protected setupAccessibility(): void {
    if (!this.element) return;

    if (this.config.a11y?.ariaLabel) {
      this.element.setAttribute("aria-label", this.config.name);
    }

    if (this.config.a11y?.ariaLive) {
      this.element.setAttribute("aria-live", this.config.a11y.ariaLive);
    }
  }

  /**
   * 更新组件状态
   */
  update(state: PlayerState): void {
    if (this.isDestroyed || !this.element || !this.config.enabled) return;

    try {
      this.onStateUpdate(state);
    } catch (error) {
      this.logger.error("Failed to update component state", error);
      this.handleError(error);
    }
  }

  /**
   * 状态更新处理
   */
  protected abstract onStateUpdate(state: PlayerState): void;

  /**
   * 检查平台支持
   */
  protected isPlatformSupported(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile =
      /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent,
      );
    const isTV = /tv|smart-tv|smarttv|appletv|roku|chromecast/i.test(userAgent);

    const currentPlatform = isMobile ? "mobile" : isTV ? "tv" : "desktop";
    return this.config.platforms.includes(currentPlatform as any);
  }

  /**
   * 添加事件监听器
   */
  protected addEventListener(
    element: HTMLElement | Document,
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions,
  ): void {
    element.addEventListener(event, handler, options);
    // 只对 HTMLElement 类型的事件监听器进行跟踪
    if (element instanceof HTMLElement) {
      this.eventListeners.push({ element, event, handler });
    }
  }

  /**
   * 错误处理
   */
  protected handleError(error: unknown): void {
    this.logger.error("Component error", error);

    // 创建错误提示元素
    if (this.element) {
      this.element.innerHTML = `
        <div class="ebin-component-error" style="
          color: #ff6b6b;
          font-size: 0.75rem;
          padding: 0.25rem;
          text-align: center;
          background: rgba(255, 107, 107, 0.1);
          border-radius: 0.25rem;
        ">
          ${this.config.name} 组件错误
        </div>
      `;
    }
  }

  /**
   * 获取组件元素
   */
  getElement(): HTMLElement | null {
    return this.element;
  }

  /**
   * 获取组件配置
   */
  getConfig(): ComponentConfig {
    return { ...this.config };
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<ComponentConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logger.debug("Config updated", { config: this.config });
  }

  /**
   * 更新主题
   */
  updateTheme(newTheme: Partial<ComponentTheme>): void {
    this.theme = { ...this.theme, ...newTheme };
    this.applyTheme();
    this.logger.debug("Theme updated", { theme: this.theme });
  }

  /**
   * 应用主题
   */
  protected applyTheme(): void {
    if (!this.element) return;

    const styles = this.getThemeStyles();
    Object.entries(styles).forEach(([property, value]) => {
      if (value) {
        this.element!.style.setProperty(property, value);
      }
    });
  }

  /**
   * 获取主题样式
   */
  protected getThemeStyles(): Record<string, string> {
    return {
      "--primary-color": this.theme.primaryColor || "#3b82f6",
      "--secondary-color": this.theme.secondaryColor || "#6c757d",
      "--background-color": this.theme.backgroundColor || "rgba(0, 0, 0, 0.8)",
      "--text-color": this.theme.textColor || "#ffffff",
      "--border-radius": `${this.theme.borderRadius || 4}px`,
      "--font-size": this.theme.fontSize || "0.875rem",
      "--spacing": `${this.theme.spacing || 8}px`,
    };
  }

  /**
   * 销毁组件
   */
  destroy(): void {
    if (this.isDestroyed) return;

    this.logger.debug("Destroying component");
    this.isDestroyed = true;

    // 清理事件监听器
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];

    // 清理元素
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }

    this.element = null;
  }
}
