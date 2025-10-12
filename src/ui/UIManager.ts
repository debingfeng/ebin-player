/**
 * UI管理器
 * 统一管理所有UI组件的创建、更新和销毁
 */
import { PlayerInstance, PlayerState, Logger } from "../types";
import {
  BaseComponent,
  ComponentConfig,
  ComponentTheme,
} from "./components/BaseComponent";
import { UIConfig, UIConfigManager } from "./config/UIConfig";
import { PlayButton, PlayButtonConfig } from "./components/PlayButton";
import { ProgressBar, ProgressBarConfig } from "./components/ProgressBar";
import { VolumeControl, VolumeControlConfig } from "./components/VolumeControl";
import { TimeDisplay, TimeDisplayConfig } from "./components/TimeDisplay";

export interface UIManagerOptions {
  player: PlayerInstance;
  container: HTMLElement;
  config?: Partial<UIConfig>;
  theme?: ComponentTheme;
}

export class UIManager {
  private player: PlayerInstance;
  private container: HTMLElement;
  private configManager: UIConfigManager;
  private theme: ComponentTheme;
  private logger: Logger;
  private components: Map<string, BaseComponent> = new Map();
  private controlBar: HTMLElement | null = null;
  private playOverlay: HTMLElement | null = null;
  private loadingIndicator: HTMLElement | null = null;
  private isDestroyed = false;
  private autoHideTimer: number | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor(options: UIManagerOptions) {
    this.player = options.player;
    this.container = options.container;
    this.configManager = new UIConfigManager(options.config);
    this.theme = options.theme || {};

    // 从PlayerInstance获取Logger实例
    const playerLogger = this.player.getLogger ? this.player.getLogger() : null;
    if (
      playerLogger &&
      typeof playerLogger === "object" &&
      "setEnabled" in playerLogger
    ) {
      this.logger = playerLogger;
    } else {
      // 如果PlayerInstance没有提供Logger或返回的是Console，使用console
      this.logger = {
        setEnabled: () => {},
        child: (suffix: string) => this.logger,
        debug: (...args: any[]) => console.debug(...args),
        info: (...args: any[]) => console.info(...args),
        warn: (...args: any[]) => console.warn(...args),
        error: (...args: any[]) => console.error(...args),
      };
    }

    this.init();
  }

  private async init(): Promise<void> {
    try {
      this.logger.debug("Initializing UI Manager");

      // 设置容器样式
      this.setupContainer();

      // 创建基础UI元素
      this.createControlBar();
      this.createPlayOverlay();
      this.createLoadingIndicator();

      // 注册默认组件
      this.registerDefaultComponents();

      // 创建组件
      await this.createComponents();

      // 设置事件监听器
      this.setupEventListeners();

      // 设置响应式监听
      this.setupResponsiveListener();

      // 监听配置变化
      this.configManager.onConfigChange((config) => {
        this.handleConfigChange(config);
      });

      this.logger.debug("UI Manager initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize UI Manager", error);
      throw error;
    }
  }

  private setupContainer(): void {
    this.container.className = "ebin-player";
    this.container.style.cssText = `
      position: relative;
      width: 100%;
      height: 100%;
      background-color: #000000;
      font-family: system-ui, -apple-system, sans-serif;
      overflow: hidden;
    `;
  }

  private createControlBar(): void {
    const config = this.configManager.getConfig();

    this.controlBar = document.createElement("div");
    this.controlBar.className = "ebin-control-bar";
    this.controlBar.style.cssText = `
      position: absolute;
      ${config.controlBar.position}: 0;
      left: 0;
      right: 0;
      height: ${config.controlBar.height}px;
      background-color: ${config.controlBar.backgroundColor};
      ${config.controlBar.backdropFilter ? "backdrop-filter: blur(4px);" : ""}
      display: flex;
      align-items: center;
      padding: 0 0.75rem;
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
      z-index: 10;
    `;

    this.container.appendChild(this.controlBar);
  }

  private createPlayOverlay(): void {
    const config = this.configManager.getConfig();

    if (!config.playOverlay.enabled) return;

    this.playOverlay = document.createElement("div");
    this.playOverlay.className = "ebin-play-overlay";
    this.playOverlay.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: ${config.playOverlay.size}px;
      height: ${config.playOverlay.size}px;
      background-color: ${config.playOverlay.backgroundColor};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
      z-index: 50;
    `;

    const playIcon = document.createElement("div");
    playIcon.className = "ebin-play-overlay-icon";
    playIcon.innerHTML = "▶";
    playIcon.style.cssText = `
      color: #ffffff;
      font-size: ${config.playOverlay.iconSize}px;
      margin-left: 4px;
    `;

    this.playOverlay.appendChild(playIcon);
    this.container.appendChild(this.playOverlay);
  }

  private createLoadingIndicator(): void {
    const config = this.configManager.getConfig();

    if (!config.loadingIndicator.enabled) return;

    this.loadingIndicator = document.createElement("div");
    this.loadingIndicator.className = "ebin-loading-indicator";
    this.loadingIndicator.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: ${config.loadingIndicator.size}px;
      height: ${config.loadingIndicator.size}px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top: 4px solid ${config.loadingIndicator.color};
      border-radius: 50%;
      animation: spin 1s linear infinite;
      display: none;
      z-index: 40;
    `;

    this.container.appendChild(this.loadingIndicator);
  }

  private registerDefaultComponents(): void {
    const defaultComponents: ComponentConfig[] = [
      {
        id: "playButton",
        name: "播放按钮",
        enabled: true,
        order: 1,
        platforms: ["mobile", "desktop", "tv"],
        a11y: {
          keyboard: "Space / Enter",
          ariaLabel: true,
        },
      },
      {
        id: "progressBar",
        name: "进度条",
        enabled: true,
        order: 2,
        platforms: ["mobile", "desktop", "tv"],
        showThumb: true,
        showBuffered: true,
        clickToSeek: true,
        keyboardSeek: true,
        seekStep: 5,
        a11y: {
          keyboard: "Arrow keys to seek",
          ariaLabel: true,
        },
      },
      {
        id: "timeDisplay",
        name: "时间显示",
        enabled: true,
        order: 3,
        platforms: ["mobile", "desktop", "tv"],
        a11y: {
          ariaLive: "polite",
        },
      },
      {
        id: "volumeControl",
        name: "音量控制",
        enabled: true,
        order: 4,
        platforms: ["desktop", "tv"],
        a11y: {
          keyboard: "Up / Down arrows",
          ariaLabel: true,
        },
      },
      {
        id: "fullscreenButton",
        name: "全屏按钮",
        enabled: true,
        order: 5,
        platforms: ["mobile", "desktop", "tv"],
        a11y: {
          keyboard: "F key",
          ariaLabel: true,
        },
      },
    ];

    defaultComponents.forEach((componentConfig) => {
      this.configManager.addComponent(componentConfig);
    });
  }

  private async createComponents(): Promise<void> {
    const config = this.configManager.getConfig();
    const visibleComponents = this.configManager.getVisibleComponents();

    // 按顺序创建组件
    const sortedComponents = config.components
      .filter((component) => visibleComponents.includes(component.id))
      .sort((a, b) => a.order - b.order);

    for (const componentConfig of sortedComponents) {
      try {
        await this.createComponent(componentConfig);
      } catch (error) {
        this.logger.error(
          `Failed to create component ${componentConfig.id}`,
          error,
        );
      }
    }
  }

  private async createComponent(
    componentConfig: ComponentConfig,
  ): Promise<void> {
    let component: BaseComponent;

    switch (componentConfig.id) {
      case "playButton":
        component = new PlayButton(
          this.player,
          this.controlBar!,
          componentConfig as PlayButtonConfig,
          this.theme,
          this.logger,
        );
        break;
      case "progressBar":
        component = new ProgressBar(
          this.player,
          this.controlBar!,
          componentConfig as ProgressBarConfig,
          this.theme,
          this.logger,
        );
        break;
      case "timeDisplay":
        component = new TimeDisplay(
          this.player,
          this.controlBar!,
          componentConfig as TimeDisplayConfig,
          this.theme,
          this.logger,
        );
        break;
      case "volumeControl":
        component = new VolumeControl(
          this.player,
          this.controlBar!,
          componentConfig as VolumeControlConfig,
          this.theme,
          this.logger,
        );
        break;
      default:
        this.logger.warn(`Unknown component type: ${componentConfig.id}`);
        return;
    }

    await component.init();
    this.components.set(componentConfig.id, component);

    // 将组件元素添加到控制栏
    const element = component.getElement();
    if (element && this.controlBar) {
      this.controlBar.appendChild(element);
    }
  }

  private setupEventListeners(): void {
    // 鼠标悬停控制栏显示/隐藏
    this.container.addEventListener("mouseenter", () => {
      this.showControlBar();
    });

    this.container.addEventListener("mouseleave", () => {
      this.hideControlBar();
    });

    // 播放器状态变化
    this.player.on("timeupdate", () => {
      this.updateComponents();
    });

    this.player.on("play", () => {
      this.updateComponents();
    });

    this.player.on("pause", () => {
      this.updateComponents();
    });

    this.player.on("volumechange", () => {
      this.updateComponents();
    });

    // 播放覆盖层点击
    if (this.playOverlay) {
      this.playOverlay.addEventListener("click", () => {
        this.togglePlayPause();
      });
    }
  }

  private setupResponsiveListener(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.handleResize();
    });

    this.resizeObserver.observe(this.container);
  }

  private handleResize(): void {
    // 重新计算组件可见性
    this.updateComponentVisibility();
  }

  private updateComponentVisibility(): void {
    const visibleComponents = this.configManager.getVisibleComponents();

    this.components.forEach((component, componentId) => {
      const shouldBeVisible = visibleComponents.includes(componentId);
      const element = component.getElement();

      if (element) {
        element.style.display = shouldBeVisible ? "block" : "none";
      }
    });
  }

  private handleConfigChange(config: UIConfig): void {
    this.logger.debug("Config changed, updating UI");

    // 更新控制栏样式
    if (this.controlBar) {
      this.controlBar.style.height = `${config.controlBar.height}px`;
      this.controlBar.style.backgroundColor = config.controlBar.backgroundColor;
    }

    // 更新组件
    this.updateComponents();
  }

  private updateComponents(): void {
    if (this.isDestroyed) return;

    const state = this.player.getState();

    this.components.forEach((component) => {
      component.update(state);
    });
  }

  private togglePlayPause(): void {
    try {
      if (this.player.getPaused()) {
        this.player.play();
      } else {
        this.player.pause();
      }
    } catch (error) {
      this.logger.error("Failed to toggle play/pause", error);
    }
  }

  private showControlBar(): void {
    if (!this.controlBar) return;

    const config = this.configManager.getConfig();

    this.controlBar.style.opacity = "1";

    if (config.controlBar.autoHide) {
      this.clearAutoHideTimer();
      this.autoHideTimer = window.setTimeout(() => {
        this.hideControlBar();
      }, config.controlBar.autoHideDelay);
    }
  }

  private hideControlBar(): void {
    if (!this.controlBar) return;

    const config = this.configManager.getConfig();

    if (!config.controlBar.autoHide) return;

    this.controlBar.style.opacity = "0";
    this.clearAutoHideTimer();
  }

  private clearAutoHideTimer(): void {
    if (this.autoHideTimer) {
      clearTimeout(this.autoHideTimer);
      this.autoHideTimer = null;
    }
  }

  /**
   * 更新配置
   */
  updateConfig(updates: Partial<UIConfig>): void {
    this.configManager.updateConfig(updates);

    // 如果更新了组件配置，需要重新创建组件
    if (updates.components) {
      this.recreateComponents();
    }
  }

  /**
   * 重新创建组件
   */
  private async recreateComponents(): Promise<void> {
    try {
      this.logger.debug("Recreating components");

      // 销毁现有组件
      this.components.forEach((component) => {
        component.destroy();
      });
      this.components.clear();

      // 清空控制栏
      if (this.controlBar) {
        this.controlBar.innerHTML = "";
      }

      // 重新创建组件
      await this.createComponents();

      this.logger.debug("Components recreated successfully");
    } catch (error) {
      this.logger.error("Failed to recreate components", error);
    }
  }

  /**
   * 更新主题
   */
  updateTheme(theme: Partial<ComponentTheme>): void {
    this.theme = { ...this.theme, ...theme };

    this.components.forEach((component) => {
      component.updateTheme(this.theme);
    });
  }

  /**
   * 添加组件
   */
  async addComponent(componentConfig: ComponentConfig): Promise<void> {
    this.configManager.addComponent(componentConfig);
    await this.createComponent(componentConfig);
  }

  /**
   * 移除组件
   */
  removeComponent(componentId: string): void {
    const component = this.components.get(componentId);
    if (component) {
      component.destroy();
      this.components.delete(componentId);
    }

    this.configManager.removeComponent(componentId);
  }

  /**
   * 获取组件
   */
  getComponent(componentId: string): BaseComponent | undefined {
    return this.components.get(componentId);
  }

  /**
   * 显示加载指示器
   */
  showLoading(): void {
    if (this.loadingIndicator) {
      this.loadingIndicator.style.display = "block";
    }
  }

  /**
   * 隐藏加载指示器
   */
  hideLoading(): void {
    if (this.loadingIndicator) {
      this.loadingIndicator.style.display = "none";
    }
  }

  /**
   * 销毁UI管理器
   */
  destroy(): void {
    if (this.isDestroyed) return;

    this.logger.debug("Destroying UI Manager");
    this.isDestroyed = true;

    // 清理定时器
    this.clearAutoHideTimer();

    // 清理ResizeObserver
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    // 销毁所有组件
    this.components.forEach((component) => {
      component.destroy();
    });
    this.components.clear();

    // 清理UI元素
    if (this.controlBar && this.controlBar.parentNode) {
      this.controlBar.parentNode.removeChild(this.controlBar);
    }

    if (this.playOverlay && this.playOverlay.parentNode) {
      this.playOverlay.parentNode.removeChild(this.playOverlay);
    }

    if (this.loadingIndicator && this.loadingIndicator.parentNode) {
      this.loadingIndicator.parentNode.removeChild(this.loadingIndicator);
    }

    this.controlBar = null;
    this.playOverlay = null;
    this.loadingIndicator = null;
  }
}
