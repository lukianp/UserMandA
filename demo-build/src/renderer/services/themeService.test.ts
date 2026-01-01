/**
 * ThemeService Tests
 */

import { useThemeStore } from '../store/useThemeStore';

import { ThemeService, THEME_PRESETS, ExportedTheme } from './themeService';

// Mock DOM APIs
const mockMatchMedia = (matches: boolean) => ({
  matches,
  media: '(prefers-color-scheme: dark)',
  onchange: null as any,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
});

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    // Reset store
    useThemeStore.setState({
      mode: 'dark',
      actualMode: 'dark',
      customColors: undefined,
      sidebarCollapsed: false,
      compactMode: false,
    });

    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => mockMatchMedia(true)),
    });

    service = ThemeService.getInstance();
  });

  afterEach(() => {
    service.destroy();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = ThemeService.getInstance();
      const instance2 = ThemeService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Theme Presets', () => {
    it('should have all required presets', () => {
      const presets = service.getPresets();
      expect(presets.length).toBeGreaterThan(0);

      // Check for default presets
      expect(THEME_PRESETS.default_light).toBeDefined();
      expect(THEME_PRESETS.default_dark).toBeDefined();
      expect(THEME_PRESETS.midnight).toBeDefined();
      expect(THEME_PRESETS.cyberpunk).toBeDefined();
    });

    it('should filter presets by mode', () => {
      const lightPresets = service.getPresetsByMode(false);
      const darkPresets = service.getPresetsByMode(true);

      expect(lightPresets.every((p) => !p.isDark)).toBe(true);
      expect(darkPresets.every((p) => p.isDark)).toBe(true);
    });

    it('should get specific preset by ID', () => {
      const preset = service.getPreset('default_dark');
      expect(preset).toBeDefined();
      expect(preset?.id).toBe('default_dark');
      expect(preset?.isDark).toBe(true);
    });

    it('should return undefined for invalid preset ID', () => {
      const preset = service.getPreset('nonexistent');
      expect(preset).toBeUndefined();
    });
  });

  describe('Apply Preset', () => {
    it('should apply dark theme preset', () => {
      service.applyPreset('default_dark', false);

      const state = useThemeStore.getState();
      expect(state.mode).toBe('dark');
      expect(state.customColors).toBeDefined();
      expect(state.customColors?.primary).toBe('#3b82f6');
    });

    it('should apply light theme preset', () => {
      service.applyPreset('default_light', false);

      const state = useThemeStore.getState();
      expect(state.mode).toBe('light');
      expect(state.customColors).toBeDefined();
      expect(state.customColors?.background).toBe('#ffffff');
    });

    it('should throw error for invalid preset', () => {
      expect(() => service.applyPreset('invalid', false)).toThrow();
    });

    it('should apply preset with transition', () => {
      // Mock setTimeout
      jest.useFakeTimers();

      service.applyPreset('midnight', true);

      const state = useThemeStore.getState();
      expect(state.customColors?.primary).toBe('#8b5cf6');

      jest.runAllTimers();
      jest.useRealTimers();
    });
  });

  describe('Custom Themes', () => {
    it('should create custom preset from current colors', () => {
      // Set custom colors
      useThemeStore.getState().setCustomColors({
        primary: '#ff0000',
        secondary: '#00ff00',
        accent: '#0000ff',
        background: '#000000',
        foreground: '#ffffff',
        muted: '#333333',
        border: '#666666',
      });

      const preset = service.createCustomPreset('My Theme', 'Custom theme');

      expect(preset.name).toBe('My Theme');
      expect(preset.description).toBe('Custom theme');
      expect(preset.colors.primary).toBe('#ff0000');
      expect(preset.id).toContain('custom_');
    });

    it('should throw error when creating preset without custom colors', () => {
      useThemeStore.setState({ customColors: undefined });

      expect(() => service.createCustomPreset('Test')).toThrow(
        'No custom colors defined'
      );
    });
  });

  describe('Theme Export/Import', () => {
    beforeEach(() => {
      useThemeStore.getState().setCustomColors({
        primary: '#ff0000',
        secondary: '#00ff00',
        accent: '#0000ff',
        background: '#000000',
        foreground: '#ffffff',
        muted: '#333333',
        border: '#666666',
      });
    });

    it('should export current theme', () => {
      const exported = service.exportTheme('Test Theme');

      expect(exported.version).toBe('1.0.0');
      expect(exported.name).toBe('Test Theme');
      expect(exported.timestamp).toBeDefined();
      expect(exported.preset.colors.primary).toBe('#ff0000');
    });

    it('should import theme', () => {
      const exported: ExportedTheme = {
        version: '1.0.0',
        name: 'Imported',
        timestamp: new Date().toISOString(),
        preset: {
          id: 'imported',
          name: 'Imported',
          isDark: true,
          colors: {
            primary: '#123456',
            secondary: '#234567',
            accent: '#345678',
            background: '#000000',
            foreground: '#ffffff',
            muted: '#111111',
            border: '#222222',
          },
        },
      };

      service.importTheme(exported);

      const state = useThemeStore.getState();
      expect(state.mode).toBe('dark');
      expect(state.customColors?.primary).toBe('#123456');
    });

    it('should throw error for unsupported version', () => {
      const exported: ExportedTheme = {
        version: '2.0.0',
        name: 'Future',
        timestamp: new Date().toISOString(),
        preset: THEME_PRESETS.default_dark,
      };

      expect(() => service.importTheme(exported)).toThrow(
        'Unsupported theme version: 2.0.0'
      );
    });
  });

  describe('Contrast Ratio', () => {
    it('should calculate contrast ratio', () => {
      const ratio = service.getContrastRatio('#000000', '#ffffff');
      expect(ratio).toBeCloseTo(21, 0); // Max contrast
    });

    it('should calculate same color contrast', () => {
      const ratio = service.getContrastRatio('#ff0000', '#ff0000');
      expect(ratio).toBe(1); // No contrast
    });

    it('should calculate intermediate contrast', () => {
      const ratio = service.getContrastRatio('#333333', '#ffffff');
      expect(ratio).toBeGreaterThan(1);
      expect(ratio).toBeLessThan(21);
    });
  });

  describe('Accessibility Validation', () => {
    it('should validate accessible theme', () => {
      const colors = THEME_PRESETS.default_dark.colors;
      const result = service.validateThemeAccessibility(colors);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should detect low contrast warnings', () => {
      const colors = {
        primary: '#888888',
        secondary: '#999999',
        accent: '#aaaaaa',
        background: '#ffffff',
        foreground: '#cccccc', // Low contrast with white
        muted: '#f0f0f0',
        border: '#e0e0e0',
      };

      const result = service.validateThemeAccessibility(colors);

      expect(result.isValid).toBe(false);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Auto-Generated Palette', () => {
    it('should generate dark palette', () => {
      const palette = service.generateAccessiblePalette('#3b82f6', true);

      expect(palette.primary).toBe('#3b82f6');
      expect(palette.background).toBe('#0f172a');
      expect(palette.foreground).toBe('#f1f5f9');
    });

    it('should generate light palette', () => {
      const palette = service.generateAccessiblePalette('#3b82f6', false);

      expect(palette.primary).toBe('#3b82f6');
      expect(palette.background).toBe('#ffffff');
      expect(palette.foreground).toBe('#0f172a');
    });
  });

  describe('Reset to Default', () => {
    it('should reset dark theme to default', () => {
      useThemeStore.setState({ actualMode: 'dark' });
      service.applyPreset('cyberpunk', false);

      service.resetToDefault();

      const state = useThemeStore.getState();
      expect(state.customColors?.primary).toBe('#3b82f6'); // default_dark primary
    });

    it('should reset light theme to default', () => {
      useThemeStore.setState({ actualMode: 'light' });
      service.applyPreset('ocean_light', false);

      service.resetToDefault();

      const state = useThemeStore.getState();
      expect(state.customColors?.primary).toBe('#2563eb'); // default_light primary
    });
  });

  describe('Get Current Colors', () => {
    it('should return current custom colors', () => {
      const testColors = {
        primary: '#test',
        secondary: '#test2',
        accent: '#test3',
        background: '#test4',
        foreground: '#test5',
        muted: '#test6',
        border: '#test7',
      };

      useThemeStore.getState().setCustomColors(testColors);

      const colors = service.getCurrentColors();
      expect(colors).toEqual(testColors);
    });

    it('should return undefined when no custom colors', () => {
      useThemeStore.setState({ customColors: undefined });

      const colors = service.getCurrentColors();
      expect(colors).toBeUndefined();
    });
  });

  describe('Cleanup', () => {
    it('should clean up resources on destroy', () => {
      // Create some style elements
      service.applyPreset('default_dark', false);

      service.destroy();

      // Verify cleanup (style elements should be removed)
      const transitionStyle = document.getElementById('theme-transition');
      const variablesStyle = document.getElementById('theme-css-variables');

      expect(transitionStyle).toBeNull();
      expect(variablesStyle).toBeNull();
    });
  });
});



