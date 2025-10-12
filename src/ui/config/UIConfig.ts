/**
 * UI配置系统
 * 支持灵活的组件配置和布局管理
 */
import { ComponentConfig } from "../components/BaseComponent";

export interface LayoutConfig {
  type: "flex" | "grid" | "absolute";
  direction?: "row" | "column";
  wrap?: "nowrap" | "wrap" | "wrap-reverse";
  justify?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "space-evenly";
  align?: "flex-start" | "flex-end" | "center" | "baseline" | "stretch";
  gap?: number | string;
  padding?: number | string;
  margin?: number | string;
}

export interface ResponsiveConfig {
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  layouts: {
    mobile: LayoutConfig;
    tablet: LayoutConfig;
    desktop: LayoutConfig;
  };
  componentVisibility: {
    mobile: string[];
    tablet: string[];
    desktop: string[];
  };
}

export interface UIConfig {
  // 基础配置
  enabled: boolean;
  theme: string;
  layout: LayoutConfig;
  responsive: ResponsiveConfig;

  // 组件配置
  components: ComponentConfig[];

  // 控制栏配置
  controlBar: {
    enabled: boolean;
    autoHide: boolean;
    autoHideDelay: number;
    position: "bottom" | "top";
    height: number;
    backgroundColor: string;
    backdropFilter: boolean;
  };

  // 播放覆盖层配置
  playOverlay: {
    enabled: boolean;
    size: number;
    iconSize: number;
    backgroundColor: string;
    autoHide: boolean;
    autoHideDelay: number;
  };

  // 加载指示器配置
  loadingIndicator: {
    enabled: boolean;
    type: "spinner" | "dots" | "pulse";
    size: number;
    color: string;
  };

  // 无障碍配置
  accessibility: {
    enabled: boolean;
    highContrast: boolean;
    largeButtons: boolean;
    noAutoHide: boolean;
    keyboardNavigation: boolean;
    screenReaderSupport: boolean;
  };

  // 动画配置
  animations: {
    enabled: boolean;
    duration: number;
    easing: string;
    reduceMotion: boolean;
  };
}

export const DEFAULT_UI_CONFIG: UIConfig = {
  enabled: true,
  theme: "default",
  layout: {
    type: "flex",
    direction: "row",
    justify: "space-between",
    align: "center",
    gap: "0.75rem",
    padding: "0.75rem",
  },
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
  components: [],
  controlBar: {
    enabled: true,
    autoHide: true,
    autoHideDelay: 3000,
    position: "bottom",
    height: 50,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    backdropFilter: true,
  },
  playOverlay: {
    enabled: true,
    size: 80,
    iconSize: 30,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    autoHide: true,
    autoHideDelay: 2000,
  },
  loadingIndicator: {
    enabled: true,
    type: "spinner",
    size: 48,
    color: "#ffffff",
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
};

export class UIConfigManager {
  private config: UIConfig;
  private listeners: Array<(config: UIConfig) => void> = [];

  constructor(initialConfig: Partial<UIConfig> = {}) {
    this.config = this.mergeConfig(DEFAULT_UI_CONFIG, initialConfig);
  }

  /**
   * 获取当前配置
   */
  getConfig(): UIConfig {
    return { ...this.config };
  }

  /**
   * 更新配置
   */
  updateConfig(updates: Partial<UIConfig>): void {
    this.config = this.mergeConfig(this.config, updates);
    this.notifyListeners();
  }

  /**
   * 更新组件配置
   */
  updateComponentConfig(
    componentId: string,
    updates: Partial<ComponentConfig>,
  ): void {
    const componentIndex = this.config.components.findIndex(
      (c) => c.id === componentId,
    );
    if (componentIndex >= 0) {
      this.config.components[componentIndex] = {
        ...this.config.components[componentIndex],
        ...updates,
      };
      this.notifyListeners();
    }
  }

  /**
   * 添加组件配置
   */
  addComponent(componentConfig: ComponentConfig): void {
    const existingIndex = this.config.components.findIndex(
      (c) => c.id === componentConfig.id,
    );
    if (existingIndex >= 0) {
      this.config.components[existingIndex] = componentConfig;
    } else {
      this.config.components.push(componentConfig);
    }
    this.notifyListeners();
  }

  /**
   * 移除组件配置
   */
  removeComponent(componentId: string): void {
    this.config.components = this.config.components.filter(
      (c) => c.id !== componentId,
    );
    this.notifyListeners();
  }

  /**
   * 获取当前屏幕尺寸类型
   */
  getCurrentScreenType(): "mobile" | "tablet" | "desktop" {
    const width = window.innerWidth;
    const { breakpoints } = this.config.responsive;

    if (width < breakpoints.mobile) return "mobile";
    if (width < breakpoints.tablet) return "tablet";
    return "desktop";
  }

  /**
   * 获取当前布局配置
   */
  getCurrentLayoutConfig(): LayoutConfig {
    const screenType = this.getCurrentScreenType();
    return this.config.responsive.layouts[screenType];
  }

  /**
   * 获取当前可见组件列表
   */
  getVisibleComponents(): string[] {
    const screenType = this.getCurrentScreenType();
    return this.config.responsive.componentVisibility[screenType];
  }

  /**
   * 检查组件是否应该显示
   */
  isComponentVisible(componentId: string): boolean {
    const visibleComponents = this.getVisibleComponents();
    return visibleComponents.includes(componentId);
  }

  /**
   * 获取组件配置
   */
  getComponentConfig(componentId: string): ComponentConfig | undefined {
    return this.config.components.find((c) => c.id === componentId);
  }

  /**
   * 监听配置变化
   */
  onConfigChange(listener: (config: UIConfig) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index >= 0) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * 深度合并配置
   */
  private mergeConfig(target: UIConfig, source: Partial<UIConfig>): UIConfig {
    const result = { ...target } as Record<string, unknown>;

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        const value = source[key as keyof UIConfig];
        if (value && typeof value === "object" && !Array.isArray(value)) {
          const targetValue = target[key as keyof UIConfig] as Record<
            string,
            unknown
          >;
          const sourceValue = value as Record<string, unknown>;
          result[key] = {
            ...targetValue,
            ...sourceValue,
          };
        } else {
          result[key] = value;
        }
      }
    }

    return result as unknown as UIConfig;
  }

  /**
   * 通知监听器
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.config);
      } catch (error) {
        console.error("Error in config change listener:", error);
      }
    });
  }
}
