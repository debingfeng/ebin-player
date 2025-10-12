/**
 * 时间显示组件
 */
import {
  BaseComponent,
  ComponentConfig,
  ComponentTheme,
} from "./BaseComponent";
import { PlayerInstance, PlayerState, Logger } from "../../types";

export interface TimeDisplayConfig extends ComponentConfig {
  format?: "current/total" | "current" | "total" | "remaining";
  showMilliseconds?: boolean;
  updateInterval?: number;
}

export class TimeDisplay extends BaseComponent {
  private currentTimeElement: HTMLElement | null = null;
  private totalTimeElement: HTMLElement | null = null;
  private separatorElement: HTMLElement | null = null;
  private updateTimer: number | null = null;

  constructor(
    player: PlayerInstance,
    container: HTMLElement,
    config: TimeDisplayConfig,
    theme: ComponentTheme = {},
    logger: Logger,
  ) {
    super(player, container, config, theme, logger);
  }

  protected async createElement(): Promise<void> {
    const config = this.config as TimeDisplayConfig;

    // 创建时间显示容器
    this.element = document.createElement("div");
    this.element.className = "ebin-time-display";
    this.element.setAttribute("aria-live", "polite");

    // 根据格式创建不同的显示元素
    switch (config.format) {
      case "current":
        this.createCurrentTimeOnly();
        break;
      case "total":
        this.createTotalTimeOnly();
        break;
      case "remaining":
        this.createRemainingTime();
        break;
      case "current/total":
      default:
        this.createCurrentAndTotal();
        break;
    }

    this.applyTheme();
    this.startUpdateTimer();
  }

  private createCurrentTimeOnly(): void {
    this.currentTimeElement = document.createElement("span");
    this.currentTimeElement.className = "ebin-current-time";
    this.element!.appendChild(this.currentTimeElement);
  }

  private createTotalTimeOnly(): void {
    this.totalTimeElement = document.createElement("span");
    this.totalTimeElement.className = "ebin-total-time";
    this.element!.appendChild(this.totalTimeElement);
  }

  private createRemainingTime(): void {
    this.currentTimeElement = document.createElement("span");
    this.currentTimeElement.className = "ebin-remaining-time";
    this.currentTimeElement.textContent = "-00:00";
    this.element!.appendChild(this.currentTimeElement);
  }

  private createCurrentAndTotal(): void {
    this.currentTimeElement = document.createElement("span");
    this.currentTimeElement.className = "ebin-current-time";
    this.element!.appendChild(this.currentTimeElement);

    this.separatorElement = document.createElement("span");
    this.separatorElement.className = "ebin-time-separator";
    this.separatorElement.textContent = " / ";
    this.element!.appendChild(this.separatorElement);

    this.totalTimeElement = document.createElement("span");
    this.totalTimeElement.className = "ebin-total-time";
    this.element!.appendChild(this.totalTimeElement);
  }

  protected setupEventListeners(): void {
    // 时间显示通常不需要事件监听器
    // 但可以添加点击切换格式的功能
    if (this.element) {
      this.addEventListener(this.element, "click", () => {
        this.cycleFormat();
      });
    }
  }

  private cycleFormat(): void {
    const config = this.config as TimeDisplayConfig;
    const formats: Array<TimeDisplayConfig["format"]> = [
      "current/total",
      "current",
      "remaining",
    ];
    const currentIndex = formats.indexOf(config.format || "current/total");
    const nextIndex = (currentIndex + 1) % formats.length;

    config.format = formats[nextIndex];
    this.logger.debug("Time display format changed", { format: config.format });

    // 重新创建显示元素
    this.recreateDisplay();
  }

  private recreateDisplay(): void {
    if (!this.element) return;

    // 清理现有元素
    this.element.innerHTML = "";
    this.currentTimeElement = null;
    this.totalTimeElement = null;
    this.separatorElement = null;

    // 重新创建
    const config = this.config as TimeDisplayConfig;
    switch (config.format) {
      case "current":
        this.createCurrentTimeOnly();
        break;
      case "total":
        this.createTotalTimeOnly();
        break;
      case "remaining":
        this.createRemainingTime();
        break;
      case "current/total":
      default:
        this.createCurrentAndTotal();
        break;
    }
  }

  protected onStateUpdate(state: PlayerState): void {
    const config = this.config as TimeDisplayConfig;

    // 更新当前时间
    if (this.currentTimeElement) {
      if (config.format === "remaining") {
        const remaining = Math.max(0, state.duration - state.currentTime);
        this.currentTimeElement.textContent = `-${this.formatTime(remaining, config.showMilliseconds)}`;
      } else {
        this.currentTimeElement.textContent = this.formatTime(
          state.currentTime,
          config.showMilliseconds,
        );
      }
    }

    // 更新总时间
    if (this.totalTimeElement) {
      this.totalTimeElement.textContent = this.formatTime(
        state.duration,
        config.showMilliseconds,
      );
    }
  }

  private formatTime(seconds: number, showMilliseconds = false): string {
    if (!isFinite(seconds) || isNaN(seconds)) {
      return "00:00";
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    if (hours > 0) {
      const timeStr = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
      return showMilliseconds
        ? `${timeStr}.${ms.toString().padStart(3, "0")}`
        : timeStr;
    } else {
      const timeStr = `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
      return showMilliseconds
        ? `${timeStr}.${ms.toString().padStart(3, "0")}`
        : timeStr;
    }
  }

  private startUpdateTimer(): void {
    const config = this.config as TimeDisplayConfig;
    const interval = config.updateInterval || 1000; // 默认1秒更新一次

    this.updateTimer = window.setInterval(() => {
      if (!this.isDestroyed) {
        const state = this.player.getState();
        this.onStateUpdate(state);
      }
    }, interval);
  }

  private stopUpdateTimer(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  protected getThemeStyles(): Record<string, string> {
    return {
      ...super.getThemeStyles(),
      "--time-font-size": "0.75rem",
      "--time-font-family": "ui-monospace, monospace",
    };
  }

  protected applyTheme(): void {
    if (!this.element) return;

    const styles = this.getThemeStyles();

    this.element.style.cssText = `
      color: var(--text-color, #ffffff);
      font-size: var(--time-font-size, 0.75rem);
      font-family: var(--time-font-family, ui-monospace, monospace);
      white-space: nowrap;
      margin-left: 0.75rem;
      cursor: pointer;
      user-select: none;
      transition: opacity 0.2s ease-in-out;
    `;

    // 悬停效果
    this.element.addEventListener("mouseenter", () => {
      this.element!.style.opacity = "0.8";
    });

    this.element.addEventListener("mouseleave", () => {
      this.element!.style.opacity = "1";
    });

    // 为子元素应用样式
    if (this.currentTimeElement) {
      this.currentTimeElement.style.cssText = `
        color: inherit;
        font-size: inherit;
        font-family: inherit;
      `;
    }

    if (this.totalTimeElement) {
      this.totalTimeElement.style.cssText = `
        color: inherit;
        font-size: inherit;
        font-family: inherit;
        opacity: 0.8;
      `;
    }

    if (this.separatorElement) {
      this.separatorElement.style.cssText = `
        color: inherit;
        font-size: inherit;
        font-family: inherit;
        opacity: 0.6;
        margin: 0 0.25rem;
      `;
    }
  }

  destroy(): void {
    this.stopUpdateTimer();
    super.destroy();
  }
}
