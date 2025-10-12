import {
  PlayerOptions,
  PlayerState,
  PlayerEventType,
  PlayerEvent,
  PlayerLifecycle,
  UIMode,
  ControlBarConfig,
  PlayerTheme,
  EventPayloadMap,
  PlayerEventBase,
} from "../types";
import { Logger as CoreLogger } from "./Logger";
import type { Logger as LoggerType } from "../types";
import { logMethod } from "./decorators";

/**
 * PlayerCore 类是视频播放器的核心实现类，负责管理视频播放的基本功能、状态和生命周期。
 * 它处理视频元素的创建、事件监听、状态管理，并提供了一系列控制播放的方法。
 */
export class PlayerCore {
  // 视频元素实例
  private videoElement!: HTMLVideoElement;
  // 播放器容器元素
  private container: HTMLElement;
  // 播放器配置选项
  private options: PlayerOptions;
  // 播放器生命周期状态
  private lifecycle: PlayerLifecycle = PlayerLifecycle.INITIALIZING;
  // 事件监听器映射表，存储不同类型事件的回调函数集合
  private eventListeners: Map<
    PlayerEventType,
    Set<(event: PlayerEvent) => void>
  > = new Map();
  // 播放器状态对象
  private state: PlayerState;
  // 标记播放器是否已销毁
  private isDestroyed = false;
  // UI模式（原生、自定义等）
  private uiMode: UIMode;
  // 日志记录器
  private logger: LoggerType;
  // DOM 事件处理器引用，便于销毁时解绑
  private mediaEventHandlers: Map<PlayerEventType, (event: Event) => void> =
    new Map();
  private lifecycleEventHandlers: Array<{
    type: string;
    handler: (event: Event) => void;
  }> = [];
  private fullscreenChangeHandler?: () => void;
  private webkitFullscreenChangeHandler?: () => void;
  private mozFullscreenChangeHandler?: () => void;
  private msFullscreenChangeHandler?: () => void;
  private pipEnterHandler?: () => void;
  private pipLeaveHandler?: () => void;
  // 日志节流时间戳
  private lastDebugAt: Record<string, number> = {};
  private debugThrottleMs = 250;

  /**
   * PlayerCore 构造函数
   * @param container 播放器容器元素
   * @param options 播放器配置选项
   */
  constructor(container: HTMLElement, options: PlayerOptions) {
    this.container = container;
    this.options = options;
    this.state = this.createInitialState();
    this.logger = options?.logger || new CoreLogger("Core");

    // 确定UI模式
    this.uiMode = this.determineUIMode();

    // 初始化视频元素、事件监听器和生命周期管理
    this.initializeVideoElement();
    this.setupEventListeners();
    this.setupLifecycle();
    this.logger.info("initialized");
  }

  /**
   * 初始化视频元素，创建video标签并设置基本属性
   */
  private initializeVideoElement(): void {
    this.logger.debug("initializeVideoElement");
    this.videoElement = document.createElement("video");
    this.videoElement.style.width = "100%";
    this.videoElement.style.height = "100%";
    this.videoElement.style.objectFit = "contain";

    // 设置基础属性
    this.videoElement.src = this.options.src;
    this.videoElement.autoplay = this.options.autoplay || false;
    this.videoElement.muted = this.options.muted || false;
    this.videoElement.volume = this.options.volume || 1;
    this.videoElement.playbackRate = this.options.playbackRate || 1;
    this.videoElement.controls = this.uiMode === UIMode.NATIVE; // 只有原生模式才显示控制条
    this.videoElement.loop = this.options.loop || false;
    this.videoElement.preload = this.options.preload || "metadata";
    this.videoElement.playsInline = this.options.playsInline !== false;

    if (this.options.poster) {
      this.videoElement.poster = this.options.poster;
    }

    if (this.options.crossOrigin) {
      this.videoElement.crossOrigin = this.options.crossOrigin;
    }

    // 设置容器尺寸
    if (this.options.width) {
      this.container.style.width =
        typeof this.options.width === "number"
          ? `${this.options.width}px`
          : this.options.width;
    }

    if (this.options.height) {
      this.container.style.height =
        typeof this.options.height === "number"
          ? `${this.options.height}px`
          : this.options.height;
    }

    this.container.appendChild(this.videoElement);
    this.logger.debug("video element appended");
  }

  /**
   * 设置事件监听器，包括媒体事件、全屏事件和画中画事件
   */
  private setupEventListeners(): void {
    this.logger.debug("setupEventListeners");
    const mediaEvents: PlayerEventType[] = [
      "loadstart",
      "loadedmetadata",
      "loadeddata",
      "canplay",
      "canplaythrough",
      "play",
      "pause",
      "ended",
      "error",
      "timeupdate",
      "volumechange",
      "ratechange",
      "seeking",
      "seeked",
      "waiting",
      "stalled",
      "progress",
      "durationchange",
    ];

    mediaEvents.forEach((eventType) => {
      const handler = (event: Event) => {
        this.handleMediaEvent(eventType, event);
      };
      this.mediaEventHandlers.set(eventType, handler);
      this.videoElement.addEventListener(eventType, handler);
    });

    // 监听全屏变化
    this.fullscreenChangeHandler = () => {
      this.emit("fullscreenchange", { isFullscreen: this.isFullscreen() });
      this.logger.debug("fullscreenchange", {
        isFullscreen: this.isFullscreen(),
      });
    };
    document.addEventListener("fullscreenchange", this.fullscreenChangeHandler);
    // 兼容前缀事件
    this.webkitFullscreenChangeHandler = this.fullscreenChangeHandler;
    this.mozFullscreenChangeHandler = this.fullscreenChangeHandler;
    this.msFullscreenChangeHandler = this.fullscreenChangeHandler;
    (document as any).addEventListener?.(
      "webkitfullscreenchange",
      this.webkitFullscreenChangeHandler,
    );
    (document as any).addEventListener?.(
      "mozfullscreenchange",
      this.mozFullscreenChangeHandler,
    );
    (document as any).addEventListener?.(
      "MSFullscreenChange",
      this.msFullscreenChangeHandler,
    );

    // 监听画中画变化
    this.pipEnterHandler = () => {
      this.emit("enterpictureinpicture", {});
    };
    this.videoElement.addEventListener(
      "enterpictureinpicture",
      this.pipEnterHandler,
    );

    this.pipLeaveHandler = () => {
      this.emit("leavepictureinpicture", {});
    };
    this.videoElement.addEventListener(
      "leavepictureinpicture",
      this.pipLeaveHandler,
    );
  }

  /**
   * 处理媒体事件，更新播放器状态并触发相应的事件
   */
  private handleMediaEvent(eventType: PlayerEventType, event: Event): void {
    this.updateState();
    this.emit(eventType, event);
    if (eventType === "error") {
      this.logger.error("media error", this.videoElement.error);
    } else {
      const now = Date.now();
      const last = this.lastDebugAt[eventType] || 0;
      if (now - last >= this.debugThrottleMs) {
        this.lastDebugAt[eventType] = now;
        this.logger.debug("media event", eventType, {
          currentTime: this.videoElement.currentTime,
          duration: this.videoElement.duration,
          paused: this.videoElement.paused,
        });
      }
    }
  }

  /**
   * 设置生命周期管理，根据不同的事件更新播放器的生命周期状态
   */
  private setupLifecycle(): void {
    const bind = (type: string, handler: (event: Event) => void) => {
      this.lifecycleEventHandlers.push({ type, handler });
      this.videoElement.addEventListener(type, handler);
    };

    bind("loadstart", () => {
      this.setLifecycle(PlayerLifecycle.INITIALIZING);
      this.logger.debug("lifecycle", "INITIALIZING");
    });

    bind("canplay", () => {
      this.setLifecycle(PlayerLifecycle.READY);
      this.logger.debug("lifecycle", "READY");
    });

    bind("play", () => {
      this.setLifecycle(PlayerLifecycle.PLAYING);
      this.logger.debug("lifecycle", "PLAYING");
    });

    bind("pause", () => {
      this.setLifecycle(PlayerLifecycle.PAUSED);
      this.logger.debug("lifecycle", "PAUSED");
    });

    bind("ended", () => {
      this.setLifecycle(PlayerLifecycle.ENDED);
      this.logger.debug("lifecycle", "ENDED");
    });

    bind("error", () => {
      this.setLifecycle(PlayerLifecycle.ERROR);
      this.logger.error("lifecycle", "ERROR", this.videoElement.error);
    });
  }

  /**
   * 创建初始状态
   */
  private createInitialState(): PlayerState {
    return {
      src: this.options.src,
      currentTime: 0,
      duration: 0,
      paused: true,
      muted: this.options.muted || false,
      volume: this.options.volume || 1,
      playbackRate: this.options.playbackRate || 1,
      readyState: 0,
      networkState: 0,
      error: null,
      ended: false,
      loading: false,
      seeking: false,
      videoWidth: 0,
      videoHeight: 0,
      buffered: null,
      seekable: null,
      quality: "auto",
      bitrate: 0,
    };
  }

  /**
   * 更新播放器状态
   */
  private updateState(): void {
    if (this.isDestroyed) return;

    this.state = {
      ...this.state,
      currentTime: this.videoElement.currentTime,
      duration: this.videoElement.duration || 0,
      paused: this.videoElement.paused,
      muted: this.videoElement.muted,
      volume: this.videoElement.volume,
      playbackRate: this.videoElement.playbackRate,
      readyState: this.videoElement.readyState,
      networkState: this.videoElement.networkState,
      error: this.videoElement.error,
      ended: this.videoElement.ended,
      loading: this.videoElement.readyState < 3,
      seeking: this.videoElement.seeking,
      videoWidth: this.videoElement.videoWidth,
      videoHeight: this.videoElement.videoHeight,
      buffered: this.videoElement.buffered,
      seekable: this.videoElement.seekable,
    };
    const now = Date.now();
    const eventType = "state:update";
    const last = this.lastDebugAt[eventType] || 0;
    if (now - last >= this.debugThrottleMs) {
      this.lastDebugAt[eventType] = now;
      this.logger.debug("state updated", {
        currentTime: this.state.currentTime,
        duration: this.state.duration,
        paused: this.state.paused,
      });
    }
  }

  /**
   * 设置生命周期状态
   */
  private setLifecycle(lifecycle: PlayerLifecycle): void {
    this.lifecycle = lifecycle;
    this.emit("lifecyclechange", { lifecycle });
  }

  /**
   * 播放视频
   */
  @logMethod({ includeArgs: false })
  async play(): Promise<void> {
    if (this.isDestroyed) return;

    try {
      this.logger.debug("video.play()");
      await this.videoElement.play();
    } catch (error) {
      console.error("播放失败:", error);
      this.logger.error("play failed", error);
      throw error;
    }
  }

  /**
   * 暂停视频
   */
  @logMethod({ includeArgs: false })
  pause(): void {
    if (this.isDestroyed) return;
    this.logger.debug("video.pause()");
    this.videoElement.pause();
  }

  /**
   * 加载视频
   */
  load(): void {
    if (this.isDestroyed) return;
    this.videoElement.load();
  }

  /**
   * 获取当前时间
   */
  getCurrentTime(): number {
    return this.videoElement.currentTime;
  }

  /**
   * 设置当前时间
   */
  setCurrentTime(time: number): void {
    if (this.isDestroyed) return;
    this.videoElement.currentTime = time;
  }

  /**
   * 获取时长
   */
  getDuration(): number {
    return this.videoElement.duration || 0;
  }

  /**
   * 获取音量
   */
  getVolume(): number {
    return this.videoElement.volume;
  }

  /**
   * 设置音量
   */
  setVolume(volume: number): void {
    if (this.isDestroyed) return;
    this.videoElement.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * 获取静音状态
   */
  getMuted(): boolean {
    return this.videoElement.muted;
  }

  /**
   * 设置静音状态
   */
  setMuted(muted: boolean): void {
    if (this.isDestroyed) return;
    this.videoElement.muted = muted;
  }

  /**
   * 获取播放速度
   */
  getPlaybackRate(): number {
    return this.videoElement.playbackRate;
  }

  /**
   * 设置播放速度
   */
  setPlaybackRate(rate: number): void {
    if (this.isDestroyed) return;
    this.videoElement.playbackRate = rate;
  }

  /**
   * 获取暂停状态
   */
  getPaused(): boolean {
    return this.videoElement.paused;
  }

  /**
   * 获取结束状态
   */
  getEnded(): boolean {
    return this.videoElement.ended;
  }

  /**
   * 获取就绪状态
   */
  getReadyState(): number {
    return this.videoElement.readyState;
  }

  /**
   * 获取网络状态
   */
  getNetworkState(): number {
    return this.videoElement.networkState;
  }

  /**
   * 获取错误信息
   */
  getError(): MediaError | null {
    return this.videoElement.error;
  }

  /**
   * 获取播放器状态
   */
  getState(): PlayerState {
    this.updateState();
    return { ...this.state };
  }

  /**
   * 设置播放器状态
   */
  setState(state: Partial<PlayerState>): void {
    if (this.isDestroyed) return;

    this.state = { ...this.state, ...state };
    this.logger.debug("setState", state);

    // 同步到视频元素
    if (state.volume !== undefined) {
      this.setVolume(state.volume);
    }
    if (state.muted !== undefined) {
      this.setMuted(state.muted);
    }
    if (state.playbackRate !== undefined) {
      this.setPlaybackRate(state.playbackRate);
    }
    if (state.currentTime !== undefined) {
      this.setCurrentTime(state.currentTime);
    }

    // 更新内部状态快照并对外通知
    this.updateState();
    this.emit("statechange", { state: { ...this.state } });
  }

  /**
   * 配置调试日志节流窗口
   */
  setDebugThrottle(ms: number): void {
    if (Number.isFinite(ms) && ms >= 0) {
      this.debugThrottleMs = ms;
    }
  }

  /**
   * 事件监听
   */
  on<T extends PlayerEventType>(
    event: T,
    callback: (event: PlayerEventBase<T>) => void,
  ): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback as any);
    return () => this.off(event, callback as any);
  }

  /**
   * 移除事件监听
   */
  off<T extends PlayerEventType>(
    event: T,
    callback: (event: PlayerEventBase<T>) => void,
  ): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback as any);
    }
  }

  /**
   * 触发事件
   */
  emit<T extends PlayerEventType>(event: T, data?: EventPayloadMap[T]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const playerEvent: PlayerEventBase<T> = {
        type: event,
        target: this as any, // 这里会被PlayerInstance包装
        data,
        timestamp: Date.now(),
      };

      (listeners as Set<(e: PlayerEventBase<T>) => void>).forEach(
        (callback) => {
          try {
            callback(playerEvent);
          } catch (error) {
            console.error(`事件处理器错误 (${event}):`, error);
          }
        },
      );
    }
  }

  /**
   * 获取容器元素
   */
  getContainer(): HTMLElement {
    return this.container;
  }

  /**
   * 获取视频元素
   */
  getVideoElement(): HTMLVideoElement {
    return this.videoElement;
  }

  /**
   * 请求全屏
   */
  async requestFullscreen(): Promise<void> {
    if (this.isDestroyed) return;

    const el: any = this.videoElement as any;
    if (this.videoElement.requestFullscreen) {
      await this.videoElement.requestFullscreen();
      return;
    }
    if (el.webkitRequestFullscreen) {
      await el.webkitRequestFullscreen();
      return;
    }
    if (el.mozRequestFullScreen) {
      await el.mozRequestFullScreen();
      return;
    }
    if (el.msRequestFullscreen) {
      await el.msRequestFullscreen();
      return;
    }
    // iOS Safari 专用的内联视频进入原生全屏
    if (typeof el.webkitEnterFullscreen === "function") {
      el.webkitEnterFullscreen();
      return;
    }
    // 尝试容器全屏作为降级
    const container: any = this.container as any;
    if (this.container.requestFullscreen) {
      await this.container.requestFullscreen();
    } else if (container.webkitRequestFullscreen) {
      await container.webkitRequestFullscreen();
    }
  }

  /**
   * 退出全屏
   */
  async exitFullscreen(): Promise<void> {
    if (this.isDestroyed) return;

    const doc: any = document as any;
    if (document.fullscreenElement && document.exitFullscreen) {
      await document.exitFullscreen();
      return;
    }
    if (doc.webkitFullscreenElement && doc.webkitExitFullscreen) {
      await doc.webkitExitFullscreen();
      return;
    }
    if (doc.mozFullScreenElement && doc.mozCancelFullScreen) {
      await doc.mozCancelFullScreen();
      return;
    }
    if (doc.msFullscreenElement && doc.msExitFullscreen) {
      await doc.msExitFullscreen();
      return;
    }
    // iOS Safari 退出视频原生全屏
    const el: any = this.videoElement as any;
    try {
      if (typeof el.webkitExitFullscreen === "function") {
        el.webkitExitFullscreen();
      }
    } catch (err) {
      this.logger.warn("webkitExitFullscreen failed", err);
    }
  }

  /**
   * 是否全屏
   */
  isFullscreen(): boolean {
    return !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
  }

  /**
   * 请求画中画
   */
  async requestPictureInPicture(): Promise<PictureInPictureWindow> {
    if (this.isDestroyed) throw new Error("播放器已销毁");

    const anyDoc: any = document as any;
    const anyVideo: any = this.videoElement as any;
    if (
      anyVideo.requestPictureInPicture &&
      anyDoc.pictureInPictureEnabled &&
      !anyVideo.disablePictureInPicture
    ) {
      return await anyVideo.requestPictureInPicture();
    }
    throw new Error("浏览器不支持画中画功能");
  }

  /**
   * 退出画中画
   */
  async exitPictureInPicture(): Promise<void> {
    if (this.isDestroyed) return;

    const anyDoc: any = document as any;
    if (anyDoc.pictureInPictureElement && anyDoc.exitPictureInPicture) {
      await anyDoc.exitPictureInPicture();
      return;
    }
    throw new Error("浏览器不支持画中画功能");
  }

  /**
   * 是否画中画
   */
  isPictureInPicture(): boolean {
    return (document as any).pictureInPictureElement === this.videoElement;
  }

  /**
   * 获取生命周期状态
   */
  getLifecycle(): PlayerLifecycle {
    return this.lifecycle;
  }

  /**
   * 确定UI模式
   */
  private determineUIMode(): UIMode {
    // 优先使用新的uiMode配置
    if (this.options.uiMode) {
      return this.options.uiMode;
    }

    // 兼容旧的controls配置
    if (this.options.controls === false) {
      return UIMode.CUSTOM;
    }

    // 默认使用原生UI
    return UIMode.NATIVE;
  }

  /**
   * 初始化UI - 现在由外部UI系统处理
   */
  initializeUI(): void {
    // 根据UI模式初始化相应的UI
    if (this.uiMode === UIMode.CUSTOM) {
      this.initializeCustomUI();
    } else if (this.uiMode === UIMode.NATIVE) {
      this.videoElement.controls = true;
    }
    this.logger.debug("UI initialized", this.uiMode);
  }

  /**
   * 初始化自定义UI
   */
  private initializeCustomUI(): void {
    // 创建控制栏容器
    const controlBar = document.createElement("div");
    controlBar.className = "ebin-player-control-bar";
    controlBar.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(0,0,0,0.7));
      padding: 10px;
      display: flex;
      align-items: center;
      gap: 10px;
      opacity: 0;
      transition: opacity 0.3s;
      z-index: 10;
    `;

    // 播放/暂停按钮
    const playButton = document.createElement("button");
    playButton.innerHTML = "▶";
    playButton.style.cssText = `
      background: none;
      border: none;
      color: white;
      font-size: 16px;
      cursor: pointer;
      padding: 5px;
    `;
    playButton.addEventListener("click", () => {
      if (this.videoElement.paused) {
        this.play();
      } else {
        this.pause();
      }
    });

    // 时间显示
    const timeDisplay = document.createElement("span");
    timeDisplay.className = "ebin-player-time";
    timeDisplay.style.cssText = `
      color: white;
      font-size: 12px;
      min-width: 100px;
    `;

    // 进度条
    const progressBar = document.createElement("div");
    progressBar.className = "ebin-player-progress";
    progressBar.style.cssText = `
      flex: 1;
      height: 4px;
      background: rgba(255,255,255,0.3);
      border-radius: 2px;
      cursor: pointer;
      position: relative;
    `;

    const progressFill = document.createElement("div");
    progressFill.className = "ebin-player-progress-fill";
    progressFill.style.cssText = `
      height: 100%;
      background: #ff6b6b;
      border-radius: 2px;
      width: 0%;
      transition: width 0.1s;
    `;
    progressBar.appendChild(progressFill);

    // 音量控制
    const volumeControl = document.createElement("input");
    volumeControl.type = "range";
    volumeControl.min = "0";
    volumeControl.max = "1";
    volumeControl.step = "0.1";
    volumeControl.value = String(this.videoElement.volume);
    volumeControl.style.cssText = `
      width: 60px;
    `;
    volumeControl.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;
      this.videoElement.volume = parseFloat(target.value);
    });

    // 全屏按钮
    const fullscreenButton = document.createElement("button");
    fullscreenButton.innerHTML = "⛶";
    fullscreenButton.style.cssText = `
      background: none;
      border: none;
      color: white;
      font-size: 16px;
      cursor: pointer;
      padding: 5px;
    `;
    fullscreenButton.addEventListener("click", () => {
      this.requestFullscreen();
    });

    // 组装控制栏
    controlBar.appendChild(playButton);
    controlBar.appendChild(timeDisplay);
    controlBar.appendChild(progressBar);
    controlBar.appendChild(volumeControl);
    controlBar.appendChild(fullscreenButton);

    // 添加到容器
    this.container.appendChild(controlBar);

    // 显示/隐藏控制栏
    const showControls = () => {
      controlBar.style.opacity = "1";
    };
    const hideControls = () => {
      controlBar.style.opacity = "0";
    };

    this.container.addEventListener("mouseenter", showControls);
    this.container.addEventListener("mouseleave", hideControls);

    // 更新播放状态
    const updatePlayButton = () => {
      playButton.innerHTML = this.videoElement.paused ? "▶" : "⏸";
    };

    // 更新时间显示
    const updateTime = () => {
      const current = this.formatTime(this.videoElement.currentTime);
      const duration = this.formatTime(this.videoElement.duration || 0);
      timeDisplay.textContent = `${current} / ${duration}`;
    };

    // 更新进度条
    const updateProgress = () => {
      const progress = this.videoElement.duration
        ? (this.videoElement.currentTime / this.videoElement.duration) * 100
        : 0;
      progressFill.style.width = `${progress}%`;
    };

    // 进度条点击
    progressBar.addEventListener("click", (e) => {
      const rect = progressBar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      this.videoElement.currentTime = percentage * this.videoElement.duration;
    });

    // 绑定事件
    this.videoElement.addEventListener("play", updatePlayButton);
    this.videoElement.addEventListener("pause", updatePlayButton);
    this.videoElement.addEventListener("timeupdate", () => {
      updateTime();
      updateProgress();
    });
    this.videoElement.addEventListener("loadedmetadata", updateTime);

    // 初始状态
    updatePlayButton();
    updateTime();
    updateProgress();
  }

  /**
   * 格式化时间
   */
  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  /**
   * 更新UI模式 - 现在只处理原生模式
   */
  updateUIMode(uiMode: UIMode): void {
    if (this.isDestroyed) return;

    this.uiMode = uiMode;
    this.logger.info("updateUIMode", uiMode);

    // 更新视频元素的controls属性
    this.videoElement.controls = uiMode === UIMode.NATIVE;

    // 其他UI模式现在由外部UI系统处理
    this.logger.debug(
      "UI mode updated, external UI system should handle the change",
    );
  }

  /**
   * 更新UI配置 - 现在由外部UI系统处理
   */
  updateUIConfig(config: ControlBarConfig): void {
    if (this.isDestroyed) return;

    this.options.uiConfig = { ...this.options.uiConfig, ...config };
    this.logger.info("updateUIConfig", config);

    // UI配置更新现在由外部UI系统处理
    this.logger.debug(
      "UI config updated, external UI system should handle the change",
    );
  }

  /**
   * 更新UI主题 - 现在由外部UI系统处理
   */
  updateUITheme(theme: PlayerTheme): void {
    if (this.isDestroyed) return;

    this.options.theme = { ...this.options.theme, ...theme };
    this.logger.info("updateUITheme", theme);

    // UI主题更新现在由外部UI系统处理
    this.logger.debug(
      "UI theme updated, external UI system should handle the change",
    );
  }

  /**
   * 获取当前UI模式
   */
  getUIMode(): UIMode {
    return this.uiMode;
  }

  setDebug(enabled: boolean): void {
    this.logger.setEnabled(enabled);
    // UI调试现在由外部UI系统处理
    this.logger.debug(
      "Debug mode updated, external UI system should handle the change",
    );
  }

  /**
   * 销毁播放器
   */
  destroy(): void {
    if (this.isDestroyed) return;

    this.isDestroyed = true;
    this.setLifecycle(PlayerLifecycle.DESTROYED);

    // UI销毁现在由外部UI系统处理
    this.logger.debug(
      "Player destroyed, external UI system should handle cleanup",
    );

    // 清理自建事件监听器集合
    this.eventListeners.clear();
    // 解绑媒体事件
    this.mediaEventHandlers.forEach((handler, type) => {
      this.videoElement.removeEventListener(type, handler as any);
    });
    this.mediaEventHandlers.clear();
    // 解绑生命周期事件
    this.lifecycleEventHandlers.forEach(({ type, handler }) => {
      this.videoElement.removeEventListener(type, handler);
    });
    this.lifecycleEventHandlers = [];
    // 解绑全屏与画中画事件
    if (this.fullscreenChangeHandler) {
      document.removeEventListener(
        "fullscreenchange",
        this.fullscreenChangeHandler,
      );
      this.fullscreenChangeHandler = undefined;
    }
    if (this.webkitFullscreenChangeHandler) {
      (document as any).removeEventListener?.(
        "webkitfullscreenchange",
        this.webkitFullscreenChangeHandler,
      );
      this.webkitFullscreenChangeHandler = undefined;
    }
    if (this.mozFullscreenChangeHandler) {
      (document as any).removeEventListener?.(
        "mozfullscreenchange",
        this.mozFullscreenChangeHandler,
      );
      this.mozFullscreenChangeHandler = undefined;
    }
    if (this.msFullscreenChangeHandler) {
      (document as any).removeEventListener?.(
        "MSFullscreenChange",
        this.msFullscreenChangeHandler,
      );
      this.msFullscreenChangeHandler = undefined;
    }
    if (this.pipEnterHandler) {
      this.videoElement.removeEventListener(
        "enterpictureinpicture",
        this.pipEnterHandler,
      );
      this.pipEnterHandler = undefined;
    }
    if (this.pipLeaveHandler) {
      this.videoElement.removeEventListener(
        "leavepictureinpicture",
        this.pipLeaveHandler,
      );
      this.pipLeaveHandler = undefined;
    }

    // 移除视频元素
    if (this.videoElement && this.videoElement.parentNode) {
      this.videoElement.parentNode.removeChild(this.videoElement);
    }

    // 清理状态
    this.state = this.createInitialState();
  }

  /**
   * 切换媒体源
   */
  setSource(options: {
    src: string;
    poster?: string;
    autoplay?: boolean;
    preload?: "none" | "metadata" | "auto";
  }): void {
    if (this.isDestroyed) return;
    const { src, poster, autoplay, preload } = options;
    this.options.src = src;
    if (poster !== undefined) this.options.poster = poster;
    if (preload !== undefined) this.options.preload = preload;
    this.videoElement.src = src;
    if (poster !== undefined) this.videoElement.poster = poster || "";
    if (preload !== undefined) this.videoElement.preload = preload;
    // 同步内部状态中的 src，避免外部立即读取到旧值
    this.state = { ...this.state, src };
    // 重置生命周期并加载
    this.setLifecycle(PlayerLifecycle.INITIALIZING);
    if (autoplay) {
      // 尝试自动播放
      this.play().catch((e) => {
        this.logger.warn("autoplay failed on setSource, fallback to load()", e);
        this.videoElement.load();
      });
    } else {
      this.videoElement.load();
    }
  }
}
