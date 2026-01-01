/**
 * Comprehensive Theme System
 *
 * Provides light, dark, high contrast, and color blind accessible themes
 */

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface Theme {
  name: string;
  colors: {
    primary: ColorScale;
    secondary: ColorScale;
    success: ColorScale;
    warning: ColorScale;
    error: ColorScale;
    neutral: ColorScale;
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
      overlay: string;
    };
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      disabled: string;
      inverse: string;
    };
    border: {
      light: string;
      medium: string;
      heavy: string;
      focus: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  typography: {
    fontFamily: {
      primary: string;
      mono: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    inner: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  animation: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      linear: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
    };
  };
  zIndex: {
    dropdown: number;
    modal: number;
    popover: number;
    tooltip: number;
    notification: number;
  };
}

// Light Theme
export const lightTheme: Theme = {
  name: 'Light',
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    secondary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    warning: {
      50: '#fefce8',
      100: '#fef9c3',
      200: '#fef08a',
      300: '#fde047',
      400: '#facc15',
      500: '#eab308',
      600: '#ca8a04',
      700: '#a16207',
      800: '#854d0e',
      900: '#713f12',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
    background: {
      primary: '#ffffff',
      secondary: '#f9fafb',
      tertiary: '#f3f4f6',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    text: {
      primary: '#111827',
      secondary: '#6b7280',
      tertiary: '#9ca3af',
      disabled: '#d1d5db',
      inverse: '#ffffff',
    },
    border: {
      light: '#e5e7eb',
      medium: '#d1d5db',
      heavy: '#9ca3af',
      focus: '#3b82f6',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  typography: {
    fontFamily: {
      primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"JetBrains Mono", "SF Mono", Consolas, monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },
  borderRadius: {
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  zIndex: {
    dropdown: 100,
    modal: 200,
    popover: 300,
    tooltip: 400,
    notification: 500,
  },
};

// Dark Theme
export const darkTheme: Theme = {
  ...lightTheme,
  name: 'Dark',
  colors: {
    ...lightTheme.colors,
    background: {
      primary: '#0f172a',
      secondary: '#1e293b',
      tertiary: '#334155',
      overlay: 'rgba(0, 0, 0, 0.75)',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#cbd5e1',
      tertiary: '#94a3b8',
      disabled: '#475569',
      inverse: '#0f172a',
    },
    border: {
      light: '#334155',
      medium: '#475569',
      heavy: '#64748b',
      focus: '#60a5fa',
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.25)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.26)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.25)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.24)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.26)',
  },
};

// High Contrast Theme (WCAG AAA Compliant)
export const highContrastTheme: Theme = {
  ...lightTheme,
  name: 'High Contrast',
  colors: {
    primary: {
      50: '#ffffff',
      100: '#ffffff',
      200: '#ffffff',
      300: '#000000',
      400: '#000000',
      500: '#000000',
      600: '#000000',
      700: '#000000',
      800: '#000000',
      900: '#000000',
    },
    secondary: {
      50: '#ffffff',
      100: '#ffffff',
      200: '#ffffff',
      300: '#000000',
      400: '#000000',
      500: '#000000',
      600: '#000000',
      700: '#000000',
      800: '#000000',
      900: '#000000',
    },
    success: {
      50: '#ffffff',
      100: '#e6ffe6',
      200: '#b3ffb3',
      300: '#00cc00',
      400: '#00aa00',
      500: '#008800',
      600: '#006600',
      700: '#004400',
      800: '#002200',
      900: '#000000',
    },
    warning: {
      50: '#ffffff',
      100: '#fff9e6',
      200: '#ffeb99',
      300: '#ffcc00',
      400: '#ff9900',
      500: '#ff6600',
      600: '#cc5200',
      700: '#993d00',
      800: '#662900',
      900: '#000000',
    },
    error: {
      50: '#ffffff',
      100: '#ffe6e6',
      200: '#ffb3b3',
      300: '#ff0000',
      400: '#dd0000',
      500: '#bb0000',
      600: '#990000',
      700: '#770000',
      800: '#550000',
      900: '#000000',
    },
    neutral: {
      50: '#ffffff',
      100: '#f0f0f0',
      200: '#d0d0d0',
      300: '#b0b0b0',
      400: '#808080',
      500: '#505050',
      600: '#303030',
      700: '#202020',
      800: '#101010',
      900: '#000000',
    },
    background: {
      primary: '#ffffff',
      secondary: '#f0f0f0',
      tertiary: '#e0e0e0',
      overlay: 'rgba(0, 0, 0, 0.8)',
    },
    text: {
      primary: '#000000',
      secondary: '#000000',
      tertiary: '#303030',
      disabled: '#808080',
      inverse: '#ffffff',
    },
    border: {
      light: '#808080',
      medium: '#000000',
      heavy: '#000000',
      focus: '#0000ff',
    },
  },
};

// Color Blind Accessible Theme (Deuteranopia/Protanopia friendly)
export const colorBlindTheme: Theme = {
  ...lightTheme,
  name: 'Color Blind Accessible',
  colors: {
    ...lightTheme.colors,
    primary: {
      50: '#e6f3ff',
      100: '#cce6ff',
      200: '#99ccff',
      300: '#66b3ff',
      400: '#3399ff',
      500: '#0080ff',
      600: '#0066cc',
      700: '#004d99',
      800: '#003366',
      900: '#001a33',
    },
    success: {
      50: '#e6f7ff',
      100: '#b3e5ff',
      200: '#80d4ff',
      300: '#4dc2ff',
      400: '#1ab0ff',
      500: '#0099e6',
      600: '#007ab3',
      700: '#005c80',
      800: '#003d4d',
      900: '#001f1a',
    },
    warning: {
      50: '#fff9e6',
      100: '#fff3cc',
      200: '#ffe699',
      300: '#ffda66',
      400: '#ffcd33',
      500: '#ffc100',
      600: '#cc9a00',
      700: '#997300',
      800: '#664d00',
      900: '#332600',
    },
    error: {
      50: '#fff5e6',
      100: '#ffebcc',
      200: '#ffd699',
      300: '#ffc266',
      400: '#ffad33',
      500: '#ff9900',
      600: '#cc7a00',
      700: '#995c00',
      800: '#663d00',
      900: '#331f00',
    },
  },
};

// Theme utilities
export const getTheme = (themeName: string): Theme => {
  switch (themeName) {
    case 'dark':
      return darkTheme;
    case 'highContrast':
      return highContrastTheme;
    case 'colorBlind':
      return colorBlindTheme;
    default:
      return lightTheme;
  }
};

export const applyTheme = (theme: Theme): void => {
  const root = document.documentElement;

  // Apply CSS variables
  Object.entries(theme.colors).forEach(([colorKey, colorValue]) => {
    if (typeof colorValue === 'object' && !Array.isArray(colorValue)) {
      Object.entries(colorValue).forEach(([shade, value]) => {
        root.style.setProperty(`--color-${colorKey}-${shade}`, value);
      });
    }
  });

  // Apply spacing
  Object.entries(theme.spacing).forEach(([key, value]) => {
    root.style.setProperty(`--spacing-${key}`, value);
  });

  // Apply shadows
  Object.entries(theme.shadows).forEach(([key, value]) => {
    root.style.setProperty(`--shadow-${key}`, value);
  });

  // Apply border radius
  Object.entries(theme.borderRadius).forEach(([key, value]) => {
    root.style.setProperty(`--radius-${key}`, value);
  });

  // Apply dark mode class if needed
  if (theme.name === 'Dark' || theme.name === 'High Contrast') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

