/**
 * 主题管理器
 * 支持多种主题和动态主题切换
 */
import { ComponentTheme } from '../components/BaseComponent';

export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  animations: {
    duration: {
      fast: number;
      normal: number;
      slow: number;
    };
    easing: {
      linear: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
    };
  };
}

export const DEFAULT_THEMES: Record<string, Theme> = {
  default: {
    id: 'default',
    name: '默认主题',
    colors: {
      primary: '#3b82f6',
      secondary: '#6c757d',
      background: 'rgba(0, 0, 0, 0.8)',
      surface: 'rgba(255, 255, 255, 0.1)',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.7)',
      border: 'rgba(255, 255, 255, 0.2)',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    typography: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
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
      sm: 4,
      md: 8,
      lg: 12,
      full: 9999,
    },
    shadows: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
      md: '0 4px 6px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    },
    animations: {
      duration: {
        fast: 150,
        normal: 300,
        slow: 500,
      },
      easing: {
        linear: 'linear',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  dark: {
    id: 'dark',
    name: '深色主题',
    colors: {
      primary: '#60a5fa',
      secondary: '#9ca3af',
      background: 'rgba(0, 0, 0, 0.9)',
      surface: 'rgba(255, 255, 255, 0.05)',
      text: '#f9fafb',
      textSecondary: 'rgba(249, 250, 251, 0.6)',
      border: 'rgba(255, 255, 255, 0.1)',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
    },
    typography: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
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
      sm: 4,
      md: 8,
      lg: 12,
      full: 9999,
    },
    shadows: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
      md: '0 4px 6px rgba(0, 0, 0, 0.3)',
      lg: '0 10px 15px rgba(0, 0, 0, 0.3)',
    },
    animations: {
      duration: {
        fast: 150,
        normal: 300,
        slow: 500,
      },
      easing: {
        linear: 'linear',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  light: {
    id: 'light',
    name: '浅色主题',
    colors: {
      primary: '#2563eb',
      secondary: '#64748b',
      background: 'rgba(255, 255, 255, 0.95)',
      surface: 'rgba(0, 0, 0, 0.05)',
      text: '#1f2937',
      textSecondary: 'rgba(31, 41, 55, 0.7)',
      border: 'rgba(0, 0, 0, 0.1)',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
    },
    typography: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
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
      sm: 4,
      md: 8,
      lg: 12,
      full: 9999,
    },
    shadows: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px rgba(0, 0, 0, 0.05)',
      lg: '0 10px 15px rgba(0, 0, 0, 0.05)',
    },
    animations: {
      duration: {
        fast: 150,
        normal: 300,
        slow: 500,
      },
      easing: {
        linear: 'linear',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  highContrast: {
    id: 'highContrast',
    name: '高对比度主题',
    colors: {
      primary: '#ffff00',
      secondary: '#ffffff',
      background: '#000000',
      surface: '#333333',
      text: '#ffffff',
      textSecondary: '#cccccc',
      border: '#ffffff',
      success: '#00ff00',
      warning: '#ffaa00',
      error: '#ff0000',
    },
    typography: {
      fontFamily: 'Arial, sans-serif',
      fontSize: {
        xs: '0.875rem',
        sm: '1rem',
        base: '1.125rem',
        lg: '1.25rem',
        xl: '1.5rem',
      },
      fontWeight: {
        normal: 400,
        medium: 600,
        semibold: 700,
        bold: 800,
      },
    },
    spacing: {
      xs: 6,
      sm: 12,
      md: 20,
      lg: 28,
      xl: 36,
    },
    borderRadius: {
      sm: 2,
      md: 4,
      lg: 6,
      full: 9999,
    },
    shadows: {
      sm: '0 0 0 2px #ffffff',
      md: '0 0 0 3px #ffffff',
      lg: '0 0 0 4px #ffffff',
    },
    animations: {
      duration: {
        fast: 0,
        normal: 0,
        slow: 0,
      },
      easing: {
        linear: 'linear',
        easeIn: 'linear',
        easeOut: 'linear',
        easeInOut: 'linear',
      },
    },
  },
};

export class ThemeManager {
  private currentTheme: Theme;
  private themes: Map<string, Theme> = new Map();
  private listeners: Array<(theme: Theme) => void> = [];

  constructor(initialThemeId: string = 'default') {
    // 注册默认主题
    Object.values(DEFAULT_THEMES).forEach(theme => {
      this.themes.set(theme.id, theme);
    });

    this.currentTheme = this.themes.get(initialThemeId) || DEFAULT_THEMES.default;
    this.applyTheme();
  }

  /**
   * 获取当前主题
   */
  getCurrentTheme(): Theme {
    return { ...this.currentTheme };
  }

  /**
   * 设置主题
   */
  setTheme(themeId: string): void {
    const theme = this.themes.get(themeId);
    if (!theme) {
      throw new Error(`Theme not found: ${themeId}`);
    }

    this.currentTheme = theme;
    this.applyTheme();
    this.notifyListeners();
  }

  /**
   * 注册新主题
   */
  registerTheme(theme: Theme): void {
    this.themes.set(theme.id, theme);
  }

  /**
   * 获取所有可用主题
   */
  getAvailableThemes(): Theme[] {
    return Array.from(this.themes.values());
  }

  /**
   * 获取主题的CSS变量
   */
  getThemeCSSVariables(): Record<string, string> {
    const theme = this.currentTheme;
    
    return {
      '--color-primary': theme.colors.primary,
      '--color-secondary': theme.colors.secondary,
      '--color-background': theme.colors.background,
      '--color-surface': theme.colors.surface,
      '--color-text': theme.colors.text,
      '--color-text-secondary': theme.colors.textSecondary,
      '--color-border': theme.colors.border,
      '--color-success': theme.colors.success,
      '--color-warning': theme.colors.warning,
      '--color-error': theme.colors.error,
      
      '--font-family': theme.typography.fontFamily,
      '--font-size-xs': theme.typography.fontSize.xs,
      '--font-size-sm': theme.typography.fontSize.sm,
      '--font-size-base': theme.typography.fontSize.base,
      '--font-size-lg': theme.typography.fontSize.lg,
      '--font-size-xl': theme.typography.fontSize.xl,
      
      '--font-weight-normal': theme.typography.fontWeight.normal.toString(),
      '--font-weight-medium': theme.typography.fontWeight.medium.toString(),
      '--font-weight-semibold': theme.typography.fontWeight.semibold.toString(),
      '--font-weight-bold': theme.typography.fontWeight.bold.toString(),
      
      '--spacing-xs': `${theme.spacing.xs}px`,
      '--spacing-sm': `${theme.spacing.sm}px`,
      '--spacing-md': `${theme.spacing.md}px`,
      '--spacing-lg': `${theme.spacing.lg}px`,
      '--spacing-xl': `${theme.spacing.xl}px`,
      
      '--border-radius-sm': `${theme.borderRadius.sm}px`,
      '--border-radius-md': `${theme.borderRadius.md}px`,
      '--border-radius-lg': `${theme.borderRadius.lg}px`,
      '--border-radius-full': `${theme.borderRadius.full}px`,
      
      '--shadow-sm': theme.shadows.sm,
      '--shadow-md': theme.shadows.md,
      '--shadow-lg': theme.shadows.lg,
      
      '--duration-fast': `${theme.animations.duration.fast}ms`,
      '--duration-normal': `${theme.animations.duration.normal}ms`,
      '--duration-slow': `${theme.animations.duration.slow}ms`,
      
      '--easing-linear': theme.animations.easing.linear,
      '--easing-ease-in': theme.animations.easing.easeIn,
      '--easing-ease-out': theme.animations.easing.easeOut,
      '--easing-ease-in-out': theme.animations.easing.easeInOut,
    };
  }

  /**
   * 将主题转换为组件主题
   */
  toComponentTheme(): ComponentTheme {
    const theme = this.currentTheme;
    
    return {
      primaryColor: theme.colors.primary,
      secondaryColor: theme.colors.secondary,
      backgroundColor: theme.colors.background,
      textColor: theme.colors.text,
      borderRadius: theme.borderRadius.md,
      fontSize: theme.typography.fontSize.base,
      spacing: theme.spacing.md,
    };
  }

  /**
   * 应用主题到文档
   */
  private applyTheme(): void {
    const variables = this.getThemeCSSVariables();
    
    // 应用CSS变量到根元素
    const root = document.documentElement;
    Object.entries(variables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // 添加主题类名
    document.body.className = document.body.className
      .replace(/ebin-theme-\w+/g, '')
      .trim();
    document.body.classList.add(`ebin-theme-${this.currentTheme.id}`);
  }

  /**
   * 监听主题变化
   */
  onThemeChange(listener: (theme: Theme) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index >= 0) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * 通知监听器
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentTheme);
      } catch (error) {
        console.error('Error in theme change listener:', error);
      }
    });
  }

  /**
   * 检测系统主题偏好
   */
  detectSystemTheme(): string {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  /**
   * 监听系统主题变化
   */
  watchSystemTheme(): () => void {
    if (!window.matchMedia) {
      return () => {};
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const themeId = e.matches ? 'dark' : 'light';
      if (this.themes.has(themeId)) {
        this.setTheme(themeId);
      }
    };

    mediaQuery.addEventListener('change', handler);
    
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }
}
