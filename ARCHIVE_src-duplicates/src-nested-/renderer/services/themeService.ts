/**
 * Enhanced Theme Service
 *
 * Advanced theme management with presets, CSS variables, transitions,
 * and theme import/export capabilities.
 */

import { useThemeStore, ThemeColors } from '../store/useThemeStore';

export interface ThemePreset {
  id: string;
  name: string;
  description?: string;
  colors: ThemeColors;
  isDark: boolean;
}

export interface ThemeTransitionOptions {
  duration?: number; // milliseconds
  easing?: string;
  properties?: string[];
}

export interface ExportedTheme {
  version: string;
  name: string;
  timestamp: string;
  preset: ThemePreset;
}

/**
 * Built-in theme presets
 */
export const THEME_PRESETS: Record<string, ThemePreset> = {
  // Light themes
  default_light: {
    id: 'default_light',
    name: 'Default Light',
    description: 'Clean and professional light theme',
    isDark: false,
    colors: {
      primary: '#2563eb',
      secondary: '#64748b',
      accent: '#3b82f6',
      background: '#ffffff',
      foreground: '#0f172a',
      muted: '#f1f5f9',
      border: '#e2e8f0',
    },
  },
  ocean_light: {
    id: 'ocean_light',
    name: 'Ocean Light',
    description: 'Cool blue tones for reduced eye strain',
    isDark: false,
    colors: {
      primary: '#0891b2',
      secondary: '#06b6d4',
      accent: '#14b8a6',
      background: '#f0fdfa',
      foreground: '#134e4a',
      muted: '#ccfbf1',
      border: '#99f6e4',
    },
  },
  warm_light: {
    id: 'warm_light',
    name: 'Warm Light',
    description: 'Warm tones for a cozy feel',
    isDark: false,
    colors: {
      primary: '#ea580c',
      secondary: '#f97316',
      accent: '#fb923c',
      background: '#fffbeb',
      foreground: '#78350f',
      muted: '#fed7aa',
      border: '#fdba74',
    },
  },

  // Dark themes
  default_dark: {
    id: 'default_dark',
    name: 'Default Dark',
    description: 'Standard dark theme',
    isDark: true,
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#60a5fa',
      background: '#0f172a',
      foreground: '#f1f5f9',
      muted: '#1e293b',
      border: '#334155',
    },
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    description: 'Deep dark theme for late-night work',
    isDark: true,
    colors: {
      primary: '#8b5cf6',
      secondary: '#a78bfa',
      accent: '#c4b5fd',
      background: '#0c0a09',
      foreground: '#fafaf9',
      muted: '#1c1917',
      border: '#292524',
    },
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Neon-inspired dark theme',
    isDark: true,
    colors: {
      primary: '#ec4899',
      secondary: '#f472b6',
      accent: '#06b6d4',
      background: '#18181b',
      foreground: '#fafafa',
      muted: '#27272a',
      border: '#3f3f46',
    },
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    description: 'Natural green dark theme',
    isDark: true,
    colors: {
      primary: '#10b981',
      secondary: '#34d399',
      accent: '#6ee7b7',
      background: '#064e3b',
      foreground: '#ecfdf5',
      muted: '#065f46',
      border: '#047857',
    },
  },
};

/**
 * Enhanced Theme Service
 */
export class ThemeService {
  private static instance: ThemeService;
  private transitionStyleElement?: HTMLStyleElement;
  private cssVariablesStyleElement?: HTMLStyleElement;

  private constructor() {
    this.initializeCSSVariables();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }
    return ThemeService.instance;
  }

  /**
   * Initialize CSS variables style element
   */
  private initializeCSSVariables(): void {
    if (typeof document === 'undefined') return;

    this.cssVariablesStyleElement = document.createElement('style');
    this.cssVariablesStyleElement.id = 'theme-css-variables';
    document.head.appendChild(this.cssVariablesStyleElement);

    // Apply initial CSS variables from current theme
    this.updateCSSVariables();
  }

  /**
   * Update CSS variables based on current theme colors
   */
  private updateCSSVariables(): void {
    if (!this.cssVariablesStyleElement) return;

    const { customColors } = useThemeStore.getState();
    const colors = customColors || {};

    const cssVars = Object.entries(colors)
      .map(([key, value]) => `  --theme-${key}: ${value};`)
      .join('\n');

    this.cssVariablesStyleElement.textContent = `:root {\n${cssVars}\n}`;
  }

  /**
   * Get all available theme presets
   */
  getPresets(): ThemePreset[] {
    return Object.values(THEME_PRESETS);
  }

  /**
   * Get presets filtered by light/dark mode
   */
  getPresetsByMode(isDark: boolean): ThemePreset[] {
    return this.getPresets().filter(preset => preset.isDark === isDark);
  }

  /**
   * Get a specific preset by ID
   */
  getPreset(id: string): ThemePreset | undefined {
    return THEME_PRESETS[id];
  }

  /**
   * Apply a theme preset
   */
  applyPreset(presetId: string, withTransition = true): void {
    const preset = this.getPreset(presetId);
    if (!preset) {
      throw new Error(`Theme preset "${presetId}" not found`);
    }

    // Apply transition effect
    if (withTransition) {
      this.applyThemeTransition({
        duration: 300,
        easing: 'ease-in-out',
        properties: ['background-color', 'color', 'border-color'],
      });
    }

    // Update theme store
    const { setMode, setCustomColors } = useThemeStore.getState();
    setMode(preset.isDark ? 'dark' : 'light');
    setCustomColors(preset.colors);

    // Update CSS variables
    this.updateCSSVariables();
  }

  /**
   * Apply smooth theme transition
   */
  applyThemeTransition(options: ThemeTransitionOptions = {}): void {
    if (typeof document === 'undefined') return;

    const {
      duration = 300,
      easing = 'ease-in-out',
      properties = ['background-color', 'color', 'border-color'],
    } = options;

    // Create or update transition style
    if (!this.transitionStyleElement) {
      this.transitionStyleElement = document.createElement('style');
      this.transitionStyleElement.id = 'theme-transition';
      document.head.appendChild(this.transitionStyleElement);
    }

    const transitionValue = properties
      .map(prop => `${prop} ${duration}ms ${easing}`)
      .join(', ');

    this.transitionStyleElement.textContent = `
      * {
        transition: ${transitionValue} !important;
      }
    `;

    // Remove transition after duration
    setTimeout(() => {
      if (this.transitionStyleElement) {
        this.transitionStyleElement.textContent = '';
      }
    }, duration + 50);
  }

  /**
   * Create custom theme from current colors
   */
  createCustomPreset(name: string, description?: string): ThemePreset {
    const { customColors, actualMode } = useThemeStore.getState();

    if (!customColors) {
      throw new Error('No custom colors defined');
    }

    // Generate unique ID
    const id = `custom_${Date.now()}`;

    return {
      id,
      name,
      description,
      isDark: actualMode === 'dark',
      colors: customColors as ThemeColors,
    };
  }

  /**
   * Export current theme as JSON
   */
  exportTheme(name: string): ExportedTheme {
    const preset = this.createCustomPreset(name, 'Exported theme');

    return {
      version: '1.0.0',
      name,
      timestamp: new Date().toISOString(),
      preset,
    };
  }

  /**
   * Export theme and download as JSON file
   */
  downloadTheme(name: string): void {
    const exportedTheme = this.exportTheme(name);
    const json = JSON.stringify(exportedTheme, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Import theme from exported JSON
   */
  importTheme(exportedTheme: ExportedTheme): void {
    // Validate version
    if (exportedTheme.version !== '1.0.0') {
      throw new Error(`Unsupported theme version: ${exportedTheme.version}`);
    }

    // Apply the imported preset
    const { preset } = exportedTheme;
    const { setMode, setCustomColors } = useThemeStore.getState();

    setMode(preset.isDark ? 'dark' : 'light');
    setCustomColors(preset.colors);
    this.updateCSSVariables();
  }

  /**
   * Import theme from file
   */
  async importThemeFromFile(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const json = e.target?.result as string;
          const exportedTheme = JSON.parse(json) as ExportedTheme;
          this.importTheme(exportedTheme);
          resolve();
        } catch (error) {
          reject(new Error(`Failed to parse theme file: ${error}`));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read theme file'));
      reader.readAsText(file);
    });
  }

  /**
   * Get contrast ratio between two colors
   */
  getContrastRatio(color1: string, color2: string): number {
    const getLuminance = (color: string): number => {
      // Simple hex to RGB conversion (supports #RRGGBB format)
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;

      const [rs, gs, bs] = [r, g, b].map((c) =>
        c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      );

      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Validate theme accessibility
   */
  validateThemeAccessibility(colors: ThemeColors): {
    isValid: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];

    // Check primary/background contrast (WCAG AA requires 4.5:1 for normal text)
    const primaryBgContrast = this.getContrastRatio(colors.primary, colors.background);
    if (primaryBgContrast < 4.5) {
      warnings.push(
        `Primary color contrast ratio (${primaryBgContrast.toFixed(2)}:1) is below WCAG AA standard (4.5:1)`
      );
    }

    // Check foreground/background contrast
    const fgBgContrast = this.getContrastRatio(colors.foreground, colors.background);
    if (fgBgContrast < 4.5) {
      warnings.push(
        `Foreground/background contrast ratio (${fgBgContrast.toFixed(2)}:1) is below WCAG AA standard (4.5:1)`
      );
    }

    // Check accent/background contrast
    const accentBgContrast = this.getContrastRatio(colors.accent, colors.background);
    if (accentBgContrast < 3) {
      warnings.push(
        `Accent color contrast ratio (${accentBgContrast.toFixed(2)}:1) may be too low for some UI elements`
      );
    }

    return {
      isValid: warnings.length === 0,
      warnings,
    };
  }

  /**
   * Auto-generate accessible color palette from base color
   */
  generateAccessiblePalette(baseColor: string, isDark: boolean): ThemeColors {
    // This is a simplified version - production would use a proper color library
    const adjustBrightness = (color: string, amount: number): string => {
      const hex = color.replace('#', '');
      const num = parseInt(hex, 16);
      const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + amount));
      const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
      const b = Math.max(0, Math.min(255, (num & 0xff) + amount));

      return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
    };

    if (isDark) {
      return {
        primary: baseColor,
        secondary: adjustBrightness(baseColor, -30),
        accent: adjustBrightness(baseColor, 30),
        background: '#0f172a',
        foreground: '#f1f5f9',
        muted: '#1e293b',
        border: '#334155',
      };
    } else {
      return {
        primary: baseColor,
        secondary: adjustBrightness(baseColor, 30),
        accent: adjustBrightness(baseColor, -30),
        background: '#ffffff',
        foreground: '#0f172a',
        muted: '#f1f5f9',
        border: '#e2e8f0',
      };
    }
  }

  /**
   * Schedule theme change (e.g., for auto dark mode at sunset)
   */
  scheduleThemeChange(hour: number, minute: number, presetId: string): void {
    const now = new Date();
    const scheduledTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hour,
      minute,
      0
    );

    // If time has passed today, schedule for tomorrow
    if (scheduledTime < now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeout = scheduledTime.getTime() - now.getTime();

    setTimeout(() => {
      this.applyPreset(presetId, true);

      // Schedule again for next day
      this.scheduleThemeChange(hour, minute, presetId);
    }, timeout);
  }

  /**
   * Reset to default theme
   */
  resetToDefault(): void {
    const { actualMode } = useThemeStore.getState();
    const defaultPreset = actualMode === 'dark' ? 'default_dark' : 'default_light';
    this.applyPreset(defaultPreset, true);
  }

  /**
   * Get current theme colors
   */
  getCurrentColors(): Partial<ThemeColors> | undefined {
    return useThemeStore.getState().customColors;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.transitionStyleElement) {
      this.transitionStyleElement.remove();
      this.transitionStyleElement = undefined;
    }

    if (this.cssVariablesStyleElement) {
      this.cssVariablesStyleElement.remove();
      this.cssVariablesStyleElement = undefined;
    }
  }
}

/**
 * Export singleton instance
 */
export const themeService = ThemeService.getInstance();
