/**
 * 改进版默认UI组件
 * 基于组件化架构，解决原有问题
 */
import {
  PlayerInstance,
  PlayerState,
  ControlBarConfig,
  PlayerTheme,
  Logger,
} from "../types";
import { UIManager, UIManagerOptions } from "./UIManager";
import { UIConfig } from "./config/UIConfig";
import { ThemeManager } from "./theme/ThemeManager";
import { ResponsiveManager } from "./responsive/ResponsiveManager";

export class ImprovedDefaultUI {
  name = "improvedDefaultUI";
  private player: PlayerInstance;
  private container: HTMLElement;
  private uiManager: UIManager;
  private themeManager: ThemeManager;
  private responsiveManager: ResponsiveManager;
  private logger: Logger;
  private isDestroyed = false;

  constructor(
    player: PlayerInstance,
    container: HTMLElement,
    config: ControlBarConfig = {},
    theme: PlayerTheme = {},
  ) {
    this.player = player;
    this.container = container;
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
        debug: (...args: any[]) =>
          console.debug("UI:ImprovedDefault:", ...args),
        info: (...args: any[]) => console.info("UI:ImprovedDefault:", ...args),
        warn: (...args: any[]) => console.warn("UI:ImprovedDefault:", ...args),
        error: (...args: any[]) =>
          console.error("UI:ImprovedDefault:", ...args),
      };
    }

    // 初始化主题管理器
    this.themeManager = new ThemeManager();

    // 初始化响应式管理器
    this.responsiveManager = new ResponsiveManager();

    // 转换配置格式
    const uiConfig = this.convertLegacyConfig(config, theme);

    // 初始化UI管理器
    const uiManagerOptions: UIManagerOptions = {
      player: this.player,
      container: this.container,
      config: uiConfig,
      theme: this.themeManager.toComponentTheme(),
    };

    this.uiManager = new UIManager(uiManagerOptions);

    // 设置响应式监听
    this.setupResponsiveHandling();

    this.logger.debug("ImprovedDefaultUI initialized");
  }

  /**
   * 转换旧版配置到新版配置格式
   */
  private convertLegacyConfig(
    config: ControlBarConfig,
    theme: PlayerTheme,
  ): Partial<UIConfig> {
    return {
      enabled: true,
      theme: "default",
      controlBar: {
        enabled: true,
        autoHide: true,
        autoHideDelay: 3000,
        position: "bottom",
        height: theme.controlBarHeight || 50,
        backgroundColor: theme.backgroundColor || "rgba(0, 0, 0, 0.8)",
        backdropFilter: true,
      },
      playOverlay: {
        enabled: true,
        size: 80,
        iconSize: 30,
        backgroundColor: theme.backgroundColor || "rgba(0, 0, 0, 0.8)",
        autoHide: true,
        autoHideDelay: 2000,
      },
      loadingIndicator: {
        enabled: true,
        type: "spinner",
        size: 48,
        color: theme.textColor || "#ffffff",
      },
      accessibility: {
        enabled: false,
        highContrast: false,
        largeButtons: false,
        noAutoHide: false,
        keyboardNavigation: true,
        screenReaderSupport: true,
      },
      animations: {
        enabled: true,
        duration: 300,
        easing: "ease-in-out",
        reduceMotion: false,
      },
      components: this.convertComponentConfig(config),
    };
  }

  /**
   * 转换组件配置
   */
  private convertComponentConfig(config: ControlBarConfig): any[] {
    const components = [];
    let order = 1;

    // 播放按钮
    if (config.playButton !== false) {
      components.push({
        id: "playButton",
        name: "播放按钮",
        enabled: true,
        order: order++,
        platforms: ["mobile", "desktop", "tv"],
        showOverlay: true,
        overlaySize: 80,
        iconSize: 30,
        a11y: {
          keyboard: "Space / Enter",
          ariaLabel: true,
        },
      });
    }

    // 进度条
    if (config.progressBar !== false) {
      components.push({
        id: "progressBar",
        name: "进度条",
        enabled: true,
        order: order++,
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
      });
    }

    // 时间显示
    if (config.timeDisplay !== false) {
      components.push({
        id: "timeDisplay",
        name: "时间显示",
        enabled: true,
        order: order++,
        platforms: ["mobile", "desktop", "tv"],
        format: "current/total",
        showMilliseconds: false,
        updateInterval: 1000,
        a11y: {
          ariaLive: "polite",
        },
      });
    }

    // 音量控制
    if (config.volumeControl !== false) {
      components.push({
        id: "volumeControl",
        name: "音量控制",
        enabled: true,
        order: order++,
        platforms: ["desktop", "tv"],
        showSlider: true,
        showButton: true,
        sliderWidth: 80,
        keyboardControl: true,
        volumeStep: 0.1,
        a11y: {
          keyboard: "Up / Down arrows",
          ariaLabel: true,
        },
      });
    }

    // 播放速度控制
    if (config.playbackRateControl) {
      components.push({
        id: "playbackRate",
        name: "播放速度",
        enabled: true,
        order: order++,
        platforms: ["desktop", "mobile"],
        a11y: {
          keyboard: "Shift + < / >",
          ariaLabel: true,
        },
      });
    }

    // 全屏按钮
    if (config.fullscreenButton !== false) {
      components.push({
        id: "fullscreenButton",
        name: "全屏按钮",
        enabled: true,
        order: order++,
        platforms: ["mobile", "desktop", "tv"],
        a11y: {
          keyboard: "F key",
          ariaLabel: true,
        },
      });
    }

    // 自定义按钮
    if (config.customButtons && config.customButtons.length > 0) {
      config.customButtons.forEach((button, index) => {
        components.push({
          id: `customButton_${index}`,
          name: `自定义按钮 ${index + 1}`,
          enabled: true,
          order: order++,
          platforms: ["mobile", "desktop", "tv"],
          customButton: button,
          a11y: {
            ariaLabel: true,
          },
        });
      });
    }

    return components;
  }

  /**
   * 设置响应式处理
   */
  private setupResponsiveHandling(): void {
    // 监听响应式状态变化
    this.responsiveManager.onStateChange((state) => {
      this.logger.debug("Responsive state changed", state);
      this.handleResponsiveChange(state);
    });

    // 开始监听容器大小变化
    this.responsiveManager.startWatching(this.container);
  }

  /**
   * 处理响应式变化
   */
  private handleResponsiveChange(state: any): void {
    // 更新组件可见性
    this.uiManager.updateConfig({
      responsive: {
        breakpoints: {
          mobile: 768,
          tablet: 1024,
          desktop: 1200,
        },
        layouts: {
          mobile: {
            type: "flex",
            direction: "column",
            gap: "0.5rem",
            padding: "0.5rem",
          },
          tablet: {
            type: "flex",
            direction: "row",
            gap: "0.75rem",
            padding: "0.75rem",
          },
          desktop: {
            type: "flex",
            direction: "row",
            gap: "1rem",
            padding: "1rem",
          },
        },
        componentVisibility: {
          mobile: [
            "playButton",
            "progressBar",
            "timeDisplay",
            "volumeButton",
            "fullscreenButton",
          ],
          tablet: [
            "playButton",
            "progressBar",
            "timeDisplay",
            "volumeControl",
            "fullscreenButton",
          ],
          desktop: [
            "playButton",
            "progressBar",
            "timeDisplay",
            "volumeControl",
            "playbackRate",
            "fullscreenButton",
          ],
        },
      },
    });
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<ControlBarConfig>): void {
    this.logger.debug("Updating config", config);

    const uiConfig = this.convertLegacyConfig(config, {});

    // 确保components配置被包含在更新中
    const updates: Partial<UIConfig> = {
      ...uiConfig,
      components: uiConfig.components || [],
    };

    this.uiManager.updateConfig(updates);
  }

  /**
   * 更新主题
   */
  updateTheme(theme: Partial<PlayerTheme>): void {
    this.logger.debug("Updating theme", theme);

    // 更新主题管理器
    if (
      theme.primaryColor ||
      theme.secondaryColor ||
      theme.backgroundColor ||
      theme.textColor
    ) {
      // 创建自定义主题
      const customTheme = {
        id: "custom",
        name: "自定义主题",
        colors: {
          primary: theme.primaryColor || "#3b82f6",
          secondary: theme.secondaryColor || "#6c757d",
          background: theme.backgroundColor || "rgba(0, 0, 0, 0.8)",
          surface: "rgba(255, 255, 255, 0.1)",
          text: theme.textColor || "#ffffff",
          textSecondary: "rgba(255, 255, 255, 0.7)",
          border: "rgba(255, 255, 255, 0.2)",
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
        },
        typography: {
          fontFamily:
            theme.fontFamily || "system-ui, -apple-system, sans-serif",
          fontSize: {
            xs: "0.75rem",
            sm: "0.875rem",
            base: "1rem",
            lg: "1.125rem",
            xl: "1.25rem",
          },
          fontWeight: {
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
          },
        },
        spacing: {
          xs: 4,
          sm: 8,
          md: 16,
          lg: 24,
          xl: 32,
        },
        borderRadius: {
          sm: theme.borderRadius || 4,
          md: (theme.borderRadius || 4) * 1.5,
          lg: (theme.borderRadius || 4) * 2,
          full: 9999,
        },
        shadows: {
          sm: "0 1px 2px rgba(0, 0, 0, 0.1)",
          md: "0 4px 6px rgba(0, 0, 0, 0.1)",
          lg: "0 10px 15px rgba(0, 0, 0, 0.1)",
        },
        animations: {
          duration: {
            fast: 150,
            normal: 300,
            slow: 500,
          },
          easing: {
            linear: "linear",
            easeIn: "cubic-bezier(0.4, 0, 1, 1)",
            easeOut: "cubic-bezier(0, 0, 0.2, 1)",
            easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
          },
        },
      };

      this.themeManager.registerTheme(customTheme);
      this.themeManager.setTheme("custom");
    }

    // 更新UI管理器的主题
    this.uiManager.updateTheme(this.themeManager.toComponentTheme());
  }

  /**
   * 获取UI管理器实例
   */
  getUIManager(): UIManager {
    return this.uiManager;
  }

  /**
   * 获取主题管理器实例
   */
  getThemeManager(): ThemeManager {
    return this.themeManager;
  }

  /**
   * 获取响应式管理器实例
   */
  getResponsiveManager(): ResponsiveManager {
    return this.responsiveManager;
  }

  /**
   * 销毁UI
   */
  destroy(): void {
    if (this.isDestroyed) return;

    this.logger.debug("Destroying ImprovedDefaultUI");
    this.isDestroyed = true;

    // 销毁各个管理器
    this.uiManager.destroy();
    this.responsiveManager.destroy();

    this.logger.debug("ImprovedDefaultUI destroyed");
  }
}
