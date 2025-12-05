/**
 * Theme Store
 *
 * Manages application theme (light/dark mode) and UI preferences.
 * Syncs theme to DOM by toggling 'dark' class on <html> element.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  border: string;
}

interface ThemeState {
  // State
  mode: ThemeMode;
  actualMode: 'light' | 'dark'; // Resolved mode (system preference applied)
  customColors?: Partial<ThemeColors>;
  sidebarCollapsed: boolean;
  compactMode: boolean;

  // Actions
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setCustomColors: (colors: Partial<ThemeColors>) => void;
  resetColors: () => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCompactMode: (compact: boolean) => void;
}

/**
 * Get system theme preference
 */
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Apply theme to DOM
 */
function applyThemeToDOM(mode: 'light' | 'dark') {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  if (mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export const useThemeStore = create<ThemeState>()(
  devtools(
    persist(
      (set, get) => {
        // Listen for system theme changes
        if (typeof window !== 'undefined') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          mediaQuery.addEventListener('change', (e) => {
            const { mode } = get();
            if (mode === 'system') {
              const newActualMode = e.matches ? 'dark' : 'light';
              set({ actualMode: newActualMode });
              applyThemeToDOM(newActualMode);
            }
          });
        }

        return {
          // Initial state
          mode: 'dark',
          actualMode: 'dark',
          customColors: undefined,
          sidebarCollapsed: false,
          compactMode: false,

          // Actions

          /**
           * Set theme mode (light, dark, or system)
           */
          setMode: (mode) => {
            let actualMode: 'light' | 'dark';

            if (mode === 'system') {
              actualMode = getSystemTheme();
            } else {
              actualMode = mode;
            }

            set({ mode, actualMode });
            applyThemeToDOM(actualMode);
          },

          /**
           * Toggle between light and dark mode
           */
          toggleMode: () => {
            const { mode } = get();

            // If in system mode, switch to opposite of current actual mode
            if (mode === 'system') {
              const newMode = get().actualMode === 'dark' ? 'light' : 'dark';
              get().setMode(newMode);
            } else {
              const newMode = mode === 'dark' ? 'light' : 'dark';
              get().setMode(newMode);
            }
          },

          /**
           * Set custom theme colors
           */
          setCustomColors: (colors) => {
            set((state) => ({
              customColors: {
                ...state.customColors,
                ...colors,
              },
            }));
          },

          /**
           * Reset custom colors to default
           */
          resetColors: () => {
            set({ customColors: undefined });
          },

          /**
           * Toggle sidebar collapsed state
           */
          toggleSidebar: () => {
            set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
          },

          /**
           * Set sidebar collapsed state
           */
          setSidebarCollapsed: (collapsed) => {
            set({ sidebarCollapsed: collapsed });
          },

          /**
           * Set compact mode (reduces padding/spacing for dense UIs)
           */
          setCompactMode: (compact) => {
            set({ compactMode: compact });
          },
        };
      },
      {
        name: 'theme-storage',
        // Persist all theme preferences
        partialize: (state) => ({
          mode: state.mode,
          customColors: state.customColors,
          sidebarCollapsed: state.sidebarCollapsed,
          compactMode: state.compactMode,
        }),
        // After hydration, apply theme to DOM
        onRehydrateStorage: () => (state) => {
          if (state) {
            let actualMode: 'light' | 'dark';
            if (state.mode === 'system') {
              actualMode = getSystemTheme();
            } else {
              actualMode = state.mode;
            }
            state.actualMode = actualMode;
            applyThemeToDOM(actualMode);
          }
        },
      }
    ),
    {
      name: 'ThemeStore',
    }
  )
);
