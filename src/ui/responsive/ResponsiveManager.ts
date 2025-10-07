/**
 * 响应式管理器
 * 处理不同屏幕尺寸下的UI适配
 */
import { UIConfig, LayoutConfig } from '../config/UIConfig';

export interface BreakpointConfig {
  mobile: number;
  tablet: number;
  desktop: number;
  large: number;
}

export interface ResponsiveState {
  screenType: 'mobile' | 'tablet' | 'desktop' | 'large';
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  isTouch: boolean;
  pixelRatio: number;
}

export const DEFAULT_BREAKPOINTS: BreakpointConfig = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  large: 1440,
};

export class ResponsiveManager {
  private breakpoints: BreakpointConfig;
  private currentState: ResponsiveState;
  private listeners: Array<(state: ResponsiveState) => void> = [];
  private resizeObserver: ResizeObserver | null = null;
  private mediaQueryLists: MediaQueryList[] = [];

  constructor(breakpoints: Partial<BreakpointConfig> = {}) {
    this.breakpoints = { ...DEFAULT_BREAKPOINTS, ...breakpoints };
    this.currentState = this.detectCurrentState();
    this.setupMediaQueries();
  }

  /**
   * 获取当前响应式状态
   */
  getCurrentState(): ResponsiveState {
    return { ...this.currentState };
  }

  /**
   * 获取当前屏幕类型
   */
  getCurrentScreenType(): ResponsiveState['screenType'] {
    return this.currentState.screenType;
  }

  /**
   * 检查是否为移动设备
   */
  isMobile(): boolean {
    return this.currentState.screenType === 'mobile';
  }

  /**
   * 检查是否为平板设备
   */
  isTablet(): boolean {
    return this.currentState.screenType === 'tablet';
  }

  /**
   * 检查是否为桌面设备
   */
  isDesktop(): boolean {
    return this.currentState.screenType === 'desktop' || this.currentState.screenType === 'large';
  }

  /**
   * 检查是否为触摸设备
   */
  isTouchDevice(): boolean {
    return this.currentState.isTouch;
  }

  /**
   * 获取适合当前屏幕的布局配置
   */
  getLayoutForScreen(layouts: Record<string, LayoutConfig>): LayoutConfig {
    const screenType = this.currentState.screenType;
    return layouts[screenType] || layouts.desktop || layouts.mobile;
  }

  /**
   * 获取适合当前屏幕的组件可见性配置
   */
  getVisibleComponentsForScreen(visibility: Record<string, string[]>): string[] {
    const screenType = this.currentState.screenType;
    return visibility[screenType] || visibility.desktop || visibility.mobile;
  }

  /**
   * 计算响应式间距
   */
  getResponsiveSpacing(baseSpacing: number): number {
    const { screenType, width } = this.currentState;
    
    switch (screenType) {
      case 'mobile':
        return Math.max(4, baseSpacing * 0.75);
      case 'tablet':
        return Math.max(6, baseSpacing * 0.875);
      case 'desktop':
        return baseSpacing;
      case 'large':
        return Math.min(32, baseSpacing * 1.25);
      default:
        return baseSpacing;
    }
  }

  /**
   * 计算响应式字体大小
   */
  getResponsiveFontSize(baseSize: number): number {
    const { screenType, width } = this.currentState;
    
    // 基于屏幕宽度和类型的字体缩放
    const scaleFactor = this.getFontScaleFactor();
    return Math.max(12, Math.round(baseSize * scaleFactor));
  }

  /**
   * 获取字体缩放因子
   */
  private getFontScaleFactor(): number {
    const { screenType, width } = this.currentState;
    
    switch (screenType) {
      case 'mobile':
        return width < 360 ? 0.875 : 0.9;
      case 'tablet':
        return 0.95;
      case 'desktop':
        return 1.0;
      case 'large':
        return 1.1;
      default:
        return 1.0;
    }
  }

  /**
   * 检查是否应该显示某个组件
   */
  shouldShowComponent(componentId: string, config: UIConfig): boolean {
    const visibleComponents = this.getVisibleComponentsForScreen(config.responsive.componentVisibility);
    return visibleComponents.includes(componentId);
  }

  /**
   * 获取适合当前屏幕的组件配置
   */
  getComponentConfigForScreen(componentId: string, config: UIConfig): any {
    const screenType = this.currentState.screenType;
    
    // 根据屏幕类型调整组件配置
    switch (componentId) {
      case 'progressBar':
        return {
          showThumb: !this.isMobile(),
          clickToSeek: true,
          keyboardSeek: !this.isMobile(),
        };
      case 'volumeControl':
        return {
          showSlider: !this.isMobile(),
          showButton: true,
          sliderWidth: this.isMobile() ? 60 : 80,
        };
      case 'timeDisplay':
        return {
          format: this.isMobile() ? 'current' : 'current/total',
          showMilliseconds: false,
        };
      case 'playButton':
        return {
          showOverlay: true,
          overlaySize: this.isMobile() ? 60 : 80,
          iconSize: this.isMobile() ? 24 : 30,
        };
      default:
        return {};
    }
  }

  /**
   * 监听响应式状态变化
   */
  onStateChange(listener: (state: ResponsiveState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index >= 0) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * 开始监听窗口大小变化
   */
  startWatching(element: HTMLElement): void {
    // 使用ResizeObserver监听元素大小变化
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateState();
      });
      this.resizeObserver.observe(element);
    }

    // 监听窗口大小变化
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('orientationchange', this.handleOrientationChange);
  }

  /**
   * 停止监听
   */
  stopWatching(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('orientationchange', this.handleOrientationChange);
  }

  /**
   * 检测当前状态
   */
  private detectCurrentState(): ResponsiveState {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isTouch = this.detectTouchDevice();
    const pixelRatio = window.devicePixelRatio || 1;

    return {
      screenType: this.getScreenType(width),
      width,
      height,
      orientation: width > height ? 'landscape' : 'portrait',
      isTouch,
      pixelRatio,
    };
  }

  /**
   * 获取屏幕类型
   */
  private getScreenType(width: number): ResponsiveState['screenType'] {
    if (width < this.breakpoints.mobile) return 'mobile';
    if (width < this.breakpoints.tablet) return 'tablet';
    if (width < this.breakpoints.desktop) return 'desktop';
    return 'large';
  }

  /**
   * 检测触摸设备
   */
  private detectTouchDevice(): boolean {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0
    );
  }

  /**
   * 设置媒体查询监听
   */
  private setupMediaQueries(): void {
    if (!window.matchMedia) return;

    const queries = [
      `(max-width: ${this.breakpoints.mobile - 1}px)`,
      `(min-width: ${this.breakpoints.mobile}px) and (max-width: ${this.breakpoints.tablet - 1}px)`,
      `(min-width: ${this.breakpoints.tablet}px) and (max-width: ${this.breakpoints.desktop - 1}px)`,
      `(min-width: ${this.breakpoints.desktop}px)`,
    ];

    queries.forEach(query => {
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener('change', this.handleMediaQueryChange);
      this.mediaQueryLists.push(mediaQueryList);
    });
  }

  /**
   * 处理窗口大小变化
   */
  private handleResize = (): void => {
    this.updateState();
  };

  /**
   * 处理方向变化
   */
  private handleOrientationChange = (): void => {
    // 延迟更新，等待方向变化完成
    setTimeout(() => {
      this.updateState();
    }, 100);
  };

  /**
   * 处理媒体查询变化
   */
  private handleMediaQueryChange = (): void => {
    this.updateState();
  };

  /**
   * 更新状态
   */
  private updateState(): void {
    const newState = this.detectCurrentState();
    const hasChanged = this.hasStateChanged(newState);
    
    if (hasChanged) {
      this.currentState = newState;
      this.notifyListeners();
    }
  }

  /**
   * 检查状态是否发生变化
   */
  private hasStateChanged(newState: ResponsiveState): boolean {
    return (
      this.currentState.screenType !== newState.screenType ||
      this.currentState.orientation !== newState.orientation ||
      Math.abs(this.currentState.width - newState.width) > 10 ||
      Math.abs(this.currentState.height - newState.height) > 10
    );
  }

  /**
   * 通知监听器
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentState);
      } catch (error) {
        console.error('Error in responsive state listener:', error);
      }
    });
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.stopWatching();
    
    this.mediaQueryLists.forEach(mediaQueryList => {
      mediaQueryList.removeEventListener('change', this.handleMediaQueryChange);
    });
    this.mediaQueryLists = [];
    
    this.listeners = [];
  }
}
