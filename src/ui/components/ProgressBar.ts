/**
 * 进度条组件
 */
import {
  BaseComponent,
  ComponentConfig,
  ComponentTheme,
} from "./BaseComponent";
import { PlayerInstance, PlayerState, Logger } from "../../types";

export interface ProgressBarConfig extends ComponentConfig {
  showThumb?: boolean;
  showBuffered?: boolean;
  clickToSeek?: boolean;
  keyboardSeek?: boolean;
  seekStep?: number;
}

export class ProgressBar extends BaseComponent {
  private progressContainer: HTMLElement | null = null;
  private progressBar: HTMLElement | null = null;
  private progressThumb: HTMLElement | null = null;
  private bufferedBar: HTMLElement | null = null;
  private isDragging = false;
  private dragStartX = 0;
  private dragStartTime = 0;
  private currentDragX = 0;

  constructor(
    player: PlayerInstance,
    container: HTMLElement,
    config: ProgressBarConfig,
    theme: ComponentTheme = {},
    logger: Logger,
  ) {
    super(player, container, config, theme, logger);
  }

  protected async createElement(): Promise<void> {
    const config = this.config as ProgressBarConfig;

    // 创建进度条容器
    this.progressContainer = document.createElement("div");
    this.progressContainer.className = "ebin-progress-container";
    this.progressContainer.setAttribute("role", "slider");
    this.progressContainer.setAttribute("aria-label", "播放进度");
    this.progressContainer.setAttribute("tabindex", "0");
    this.progressContainer.setAttribute("aria-valuemin", "0");
    this.progressContainer.setAttribute("aria-valuemax", "100");

    // 创建缓冲进度条
    if (config.showBuffered) {
      this.bufferedBar = document.createElement("div");
      this.bufferedBar.className = "ebin-buffered-bar";
      this.progressContainer.appendChild(this.bufferedBar);
    }

    // 创建播放进度条
    this.progressBar = document.createElement("div");
    this.progressBar.className = "ebin-progress-bar";
    this.progressContainer.appendChild(this.progressBar);

    // 创建拖拽点
    if (config.showThumb) {
      this.progressThumb = document.createElement("div");
      this.progressThumb.className = "ebin-progress-thumb";
      this.progressContainer.appendChild(this.progressThumb);
    }

    this.applyTheme();
    this.element = this.progressContainer;
  }

  protected setupEventListeners(): void {
    if (!this.progressContainer) return;

    const config = this.config as ProgressBarConfig;

    // 点击跳转
    if (config.clickToSeek) {
      this.addEventListener(this.progressContainer, "click", (e) => {
        this.handleSeek(e as MouseEvent);
      });
    }

    // 拖拽功能
    if (this.progressThumb) {
      this.addEventListener(this.progressThumb, "mousedown", (e) => {
        this.startDrag(e as MouseEvent);
      });

      this.addEventListener(document, "mousemove", (e) => {
        if (this.isDragging) {
          this.handleDrag(e as MouseEvent);
        }
      });

      this.addEventListener(document, "mouseup", () => {
        if (this.isDragging) {
          this.endDrag();
        }
      });

      // 触摸支持
      this.addEventListener(this.progressThumb, "touchstart", (e) => {
        const touchEvent = e as TouchEvent;
        this.startDrag(touchEvent.touches[0]);
      });

      this.addEventListener(document, "touchmove", (e) => {
        if (this.isDragging) {
          const touchEvent = e as TouchEvent;
          touchEvent.preventDefault();
          this.handleDrag(touchEvent.touches[0]);
        }
      });

      this.addEventListener(document, "touchend", () => {
        if (this.isDragging) {
          this.endDrag();
        }
      });
    }

    // 键盘控制
    if (config.keyboardSeek) {
      this.addEventListener(this.progressContainer, "keydown", (e) => {
        this.handleKeyboardSeek(e as KeyboardEvent);
      });
    }

    // 悬停显示拖拽点
    this.addEventListener(this.progressContainer, "mouseenter", () => {
      if (this.progressThumb && !this.isDragging) {
        this.progressThumb.style.opacity = "1";
        this.progressThumb.style.pointerEvents = "auto";
        this.logger.debug("Progress thumb shown on hover");
      }
    });

    this.addEventListener(this.progressContainer, "mouseleave", () => {
      if (this.progressThumb && !this.isDragging) {
        this.progressThumb.style.opacity = "0";
        this.progressThumb.style.pointerEvents = "none";
        this.logger.debug("Progress thumb hidden on leave");
      }
    });
  }

  private handleSeek(e: MouseEvent): void {
    if (!this.progressContainer) return;

    const rect = this.progressContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const duration = this.player.getDuration();
    const newTime = percentage * duration;

    this.logger.debug("Seeking to", { newTime, percentage });
    this.player.setCurrentTime(newTime);
  }

  private startDrag(e: MouseEvent | Touch): void {
    this.isDragging = true;
    this.dragStartX = e.clientX;
    this.currentDragX = e.clientX;
    this.dragStartTime = this.player.getCurrentTime();

    if (this.progressThumb) {
      this.progressThumb.style.opacity = "1";
      this.progressThumb.style.pointerEvents = "auto";
    }

    this.logger.debug("Start dragging");
  }

  private handleDrag(e: MouseEvent | Touch): void {
    if (!this.progressContainer || !this.isDragging) return;

    const rect = this.progressContainer.getBoundingClientRect();
    const dragX = e.clientX - rect.left;
    this.currentDragX = e.clientX; // 更新当前拖拽位置
    const percentage = Math.max(0, Math.min(1, dragX / rect.width));
    const duration = this.player.getDuration();
    const newTime = percentage * duration;

    // 更新进度条显示
    this.updateProgressDisplay(percentage);

    // 实时预览（不实际跳转）
    this.logger.debug("Dragging to", { newTime, percentage });
  }

  private endDrag(): void {
    if (!this.progressContainer || !this.isDragging) return;

    this.isDragging = false;

    // 获取当前拖拽位置
    const rect = this.progressContainer.getBoundingClientRect();
    const currentX = this.currentDragX - rect.left;
    const percentage = Math.max(0, Math.min(1, currentX / rect.width));
    const duration = this.player.getDuration();
    const newTime = percentage * duration;

    this.logger.debug("End dragging, seeking to", { newTime });
    this.player.setCurrentTime(newTime);

    if (this.progressThumb) {
      this.progressThumb.style.opacity = "0";
      this.progressThumb.style.pointerEvents = "none";
    }
  }

  private handleKeyboardSeek(e: KeyboardEvent): void {
    const config = this.config as ProgressBarConfig;
    const seekStep = config.seekStep || 5;
    const currentTime = this.player.getCurrentTime();
    const duration = this.player.getDuration();

    let newTime = currentTime;

    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        newTime = Math.max(0, currentTime - seekStep);
        break;
      case "ArrowRight":
        e.preventDefault();
        newTime = Math.min(duration, currentTime + seekStep);
        break;
      case "Home":
        e.preventDefault();
        newTime = 0;
        break;
      case "End":
        e.preventDefault();
        newTime = duration;
        break;
      default:
        return;
    }

    this.logger.debug("Keyboard seek", { from: currentTime, to: newTime });
    this.player.setCurrentTime(newTime);
  }

  protected onStateUpdate(state: PlayerState): void {
    if (!this.progressContainer || !this.progressBar) return;

    const percentage =
      state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

    // 更新播放进度
    this.updateProgressDisplay(percentage / 100);

    // 更新缓冲进度
    if (this.bufferedBar && state.buffered) {
      this.updateBufferedDisplay(state.buffered, state.duration);
    }

    // 更新ARIA属性
    this.progressContainer.setAttribute("aria-valuenow", percentage.toString());
  }

  private updateProgressDisplay(percentage: number): void {
    if (!this.progressBar) return;

    const clampedPercentage = Math.max(0, Math.min(100, percentage * 100));
    this.progressBar.style.width = `${clampedPercentage}%`;

    // 更新拖拽点位置
    if (this.progressThumb) {
      this.progressThumb.style.left = `${clampedPercentage}%`;
    }
  }

  private updateBufferedDisplay(buffered: TimeRanges, duration: number): void {
    if (!this.bufferedBar || !buffered.length) return;

    let bufferedEnd = 0;
    for (let i = 0; i < buffered.length; i++) {
      bufferedEnd = Math.max(bufferedEnd, buffered.end(i));
    }

    const bufferedPercentage = (bufferedEnd / duration) * 100;
    this.bufferedBar.style.width = `${Math.min(100, bufferedPercentage)}%`;
  }

  protected getThemeStyles(): Record<string, string> {
    return {
      ...super.getThemeStyles(),
      "--progress-height": "0.25rem",
      "--thumb-size": "0.75rem",
      "--thumb-offset": "-0.375rem",
    };
  }

  protected applyTheme(): void {
    if (!this.progressContainer) return;

    const styles = this.getThemeStyles();

    this.progressContainer.style.cssText = `
      flex: 1;
      height: var(--progress-height, 0.25rem);
      background-color: rgba(255, 255, 255, 0.3);
      border-radius: 9999px;
      margin-left: 0.75rem;
      margin-right: 0.75rem;
      position: relative;
      cursor: pointer;
      outline: none;
    `;

    if (this.bufferedBar) {
      this.bufferedBar.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 9999px;
        transition: width 0.1s ease-out;
      `;
    }

    if (this.progressBar) {
      this.progressBar.style.cssText = `
        height: 100%;
        background-color: var(--primary-color, #3b82f6);
        border-radius: 9999px;
        transition: width 0.1s ease-out;
        position: relative;
        z-index: 1;
      `;
    }

    if (this.progressThumb) {
      this.progressThumb.style.cssText = `
        position: absolute;
        top: 50%;
        left: 0%;
        width: var(--thumb-size, 0.75rem);
        height: var(--thumb-size, 0.75rem);
        background-color: #ffffff;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        opacity: 0;
        transition: opacity 0.2s ease-in-out;
        z-index: 2;
        cursor: grab;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        pointer-events: none;
      `;

      this.progressThumb.addEventListener("mousedown", () => {
        this.progressThumb!.style.cursor = "grabbing";
      });

      this.addEventListener(document, "mouseup", () => {
        if (this.progressThumb) {
          this.progressThumb.style.cursor = "grab";
        }
      });
    }

    // 焦点样式
    this.progressContainer.addEventListener("focus", () => {
      this.progressContainer!.style.outline =
        "2px solid var(--primary-color, #3b82f6)";
      this.progressContainer!.style.outlineOffset = "2px";
    });

    this.progressContainer.addEventListener("blur", () => {
      this.progressContainer!.style.outline = "none";
    });

    this.element = this.progressContainer;
  }
}
