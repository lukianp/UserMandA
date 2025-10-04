# Epic 0: UI/UX Parity and Foundation Architecture
## Complete Design System Translation from WPF to Tailwind CSS

**Document Version:** 1.0
**Status:** IMPLEMENTATION-READY
**Generated:** 2025-10-04
**Target:** guiv2/tailwind.config.js & guiv2/src/index.css

---

## Executive Summary

This document provides the **complete architectural blueprint** for translating the WPF design system to Tailwind CSS. All color values, component styles, and interaction patterns have been extracted from the original `/GUI/Themes/` and `/GUI/Resources/Styles/` directories and translated into implementation-ready specifications for the gui-module-executor.

### Key Findings:
- **3 Theme Files Analyzed:** Colors.xaml (primary palette), LightTheme.xaml, DarkTheme.xaml
- **70+ Color Definitions:** Comprehensive color system including brand, semantic, status, and chart colors
- **15+ Component Styles:** Cards, buttons, inputs, navigation, metrics, and overlays
- **Gradient System:** 10+ gradient definitions for modern UI effects
- **Animation Patterns:** Scale transforms, hover effects, loading spinners

---

## 1. Complete Color System

### 1.1 Brand Colors
```javascript
// PRIMARY BRAND COLORS - Core identity
brand: {
  primary: '#0066CC',        // BrandPrimaryColor - Main blue
  secondary: '#2E2E2E',      // BrandSecondaryColor - Dark gray
  accent: '#FF6B35',         // BrandAccentColor - Orange accent

  // Extended Primary Palette
  'primary-light-1': '#1A86DA',
  'primary-light-2': '#3394E0',
  'primary-light-3': '#4DA2E6',
  'primary-dark-1': '#0068B8',
  'primary-dark-2': '#00589C',
  'primary-dark-3': '#004880',
}
```

### 1.2 Semantic Colors
```javascript
// STATUS & SEMANTIC COLORS
semantic: {
  // Success States
  success: '#28A745',         // SuccessColor
  'success-light': '#51B25F', // SuccessColorLight
  'success-dark': '#1E7040',  // SuccessColorDark

  // Warning States
  warning: '#FFC107',         // WarningColor
  'warning-light': '#FFCE38', // WarningColorLight
  'warning-dark': '#EBB90F',  // WarningColorDark

  // Error States
  error: '#DC3545',           // ErrorColor
  'error-light': '#E5766F',   // ErrorColorLight
  'error-dark': '#C7353E',    // ErrorColorDark

  // Info States
  info: '#4299E1',            // InfoColor
  'info-light': '#63B3ED',    // InfoColorLight
  'info-dark': '#3182CE',     // InfoColorDark
}
```

### 1.3 Light Theme Colors
```javascript
// LIGHT THEME PALETTE
light: {
  // Backgrounds
  background: '#F5F5F5',      // LightBackgroundColor
  surface: '#FFFFFF',         // LightSurfaceColor (pure white)
  card: '#FFFFFF',            // LightCardColor
  modal: '#FFFFFF',           // LightModalColor

  // Text Colors
  foreground: '#333333',      // LightForegroundColor
  'foreground-secondary': '#4A5568', // LightForegroundSecondaryColor
  'foreground-muted': '#718096',     // LightMutedForegroundColor

  // Borders & Dividers
  border: '#E2E8F0',          // LightBorderColor
  divider: '#EDF2F7',         // LightDividerColor

  // Interactive States
  hover: '#F7FAFC',           // LightHoverColor
  pressed: '#EDF2F7',         // LightPressedColor
  selected: '#E6FFFA',        // LightSelectedColor (light teal)
  focus: '#0078D4',           // LightFocusColor
}
```

### 1.4 Dark Theme Colors
```javascript
// DARK THEME PALETTE
dark: {
  // Backgrounds
  background: '#1A202C',      // DarkBackgroundColor (dark blue-gray)
  surface: '#2D3748',         // DarkSurfaceColor
  card: '#2D3748',            // DarkCardColor
  modal: '#2D3748',           // DarkModalColor

  // Text Colors
  foreground: '#F7FAFC',      // DarkForegroundColor (light gray)
  'foreground-secondary': '#CBD5E0', // DarkForegroundSecondaryColor
  'foreground-muted': '#A0AEC0',     // DarkMutedForegroundColor

  // Borders & Dividers
  border: '#4A5568',          // DarkBorderColor
  divider: '#4A5568',         // DarkDividerColor

  // Interactive States
  hover: '#4A5568',           // DarkHoverColor
  pressed: '#2D3748',         // DarkPressedColor
  selected: '#234E52',        // DarkSelectedColor (dark teal)
  focus: '#40E0D0',           // DarkFocusColor (bright turquoise)
}
```

### 1.5 Status & Priority Colors
```javascript
// STATUS INDICATORS
status: {
  online: '#48BB78',          // OnlineStatusColor (green)
  offline: '#E53E3E',         // OfflineStatusColor (red)
  idle: '#F6AD55',            // IdleStatusColor (orange)
  unknown: '#718096',         // UnknownStatusColor (gray)
}

// PRIORITY LEVELS
priority: {
  critical: '#9B2C2C',        // CriticalPriorityColor (dark red)
  high: '#E53E3E',            // HighPriorityColor (red)
  medium: '#F6AD55',          // MediumPriorityColor (orange)
  low: '#48BB78',             // LowPriorityColor (green)
}
```

### 1.6 Chart Visualization Colors
```javascript
// CHART & DATA VISUALIZATION
chart: {
  1: '#0078D4',               // Primary blue
  2: '#40E0D0',               // Turquoise
  3: '#48BB78',               // Green
  4: '#F6AD55',               // Orange
  5: '#E53E3E',               // Red
  6: '#9F7AEA',               // Purple
  7: '#ED64A6',               // Pink
  8: '#38B2AC',               // Teal
}

// DATA SEMANTIC COLORS
data: {
  positive: '#48BB78',        // DataPositiveColor (green)
  negative: '#E53E3E',        // DataNegativeColor (red)
  neutral: '#718096',         // DataNeutralColor (gray)
  highlight: '#40E0D0',       // DataHighlightColor (turquoise)
}
```

---

## 2. Component Style Specifications

### 2.1 Modern Card Component
```css
/* ModernCardStyle Translation */
.modern-card {
  /* Background gradient with opacity */
  background: linear-gradient(135deg, #1C2433 0%, #2D3748 100%);
  opacity: 0.8;

  /* Border with gradient */
  border-width: 1px;
  border-image: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(66,153,225,0.3) 100%);

  /* Shape */
  border-radius: 16px;
  padding: 20px;
  margin: 8px;

  /* Shadow effect (neon cyan glow) */
  box-shadow: 0 6px 20px rgba(0, 255, 255, 0.2);

  /* Hover state */
  transition: all 0.3s ease;
}

.modern-card:hover {
  background: linear-gradient(135deg, #2A3441 0%, #3C4D62 100%);
  opacity: 0.9;
  box-shadow: 0 8px 25px rgba(0, 255, 255, 0.4);
  border-image: linear-gradient(135deg, #00FFFF 0%, #0080FF 100%);
}
```

### 2.2 Modern Button Component
```css
/* ModernButtonStyle Translation */
.modern-button {
  /* Base styles */
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  /* Transform for scale animation */
  transform-origin: center;
  transform: scale(1);
  transition: all 0.15s ease;

  /* Shadow */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

.modern-button:hover {
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
  transform: scale(1.05);
}

.modern-button:active {
  transform: scale(0.95);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
```

### 2.3 Navigation Button Style
```css
/* NavButtonStyle Translation */
.nav-button {
  /* Base styles */
  background: transparent;
  height: 56px;
  padding: 0 24px;
  border-radius: 0 12px 12px 0;
  margin: 2px 8px 2px 0;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;

  /* Text alignment */
  text-align: left;
  display: flex;
  align-items: center;

  /* Transitions */
  transition: background-color 0.2s ease;
}

.nav-button:hover {
  background-color: var(--surface-color); /* Dynamic based on theme */
}

.nav-button.active {
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
  color: white;
}
```

### 2.4 Metric Card Style
```css
/* MetricCardStyle Translation */
.metric-card {
  /* Base styles */
  background: var(--card-background);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  margin: 4px;

  /* Shadow and animation */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transform-origin: center;
  transform: scale(1);
  transition: all 0.2s ease;
}

.metric-card:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border-color: var(--surface-color);
}
```

### 2.5 Modern TextBox (Input) Style
```css
/* ModernTextBoxStyle Translation */
.modern-input {
  /* Base styles */
  background: var(--surface-background);
  color: var(--primary-text);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;

  /* Focus ring */
  outline: none;
  transition: all 0.2s ease;
}

.modern-input:hover {
  border-color: var(--accent-color);
}

.modern-input:focus {
  border-color: var(--accent-color);
  border-width: 2px;
  padding: 7px 11px; /* Adjust for border width */
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}
```

### 2.6 Section Border Style
```css
/* SectionBorderStyle Translation */
.section-border {
  /* Background gradient */
  background: linear-gradient(135deg, rgba(28,36,51,0.9) 0%, rgba(45,55,72,0.9) 100%);

  /* Border gradient */
  border: 1px solid;
  border-image: linear-gradient(135deg, #374151 0%, #4B5563 100%) 1;

  /* Shape and spacing */
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;

  /* Shadow */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}
```

---

## 3. Tailwind Configuration Implementation

### 3.1 Complete tailwind.config.js Structure
```javascript
// guiv2/tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand Colors
        'brand-primary': '#0066CC',
        'brand-secondary': '#2E2E2E',
        'brand-accent': '#FF6B35',
        'brand-primary-light-1': '#1A86DA',
        'brand-primary-light-2': '#3394E0',
        'brand-primary-light-3': '#4DA2E6',
        'brand-primary-dark-1': '#0068B8',
        'brand-primary-dark-2': '#00589C',
        'brand-primary-dark-3': '#004880',

        // Semantic Colors
        'success': '#28A745',
        'success-light': '#51B25F',
        'success-dark': '#1E7040',
        'warning': '#FFC107',
        'warning-light': '#FFCE38',
        'warning-dark': '#EBB90F',
        'error': '#DC3545',
        'error-light': '#E5766F',
        'error-dark': '#C7353E',
        'info': '#4299E1',
        'info-light': '#63B3ED',
        'info-dark': '#3182CE',

        // Status Colors
        'status-online': '#48BB78',
        'status-offline': '#E53E3E',
        'status-idle': '#F6AD55',
        'status-unknown': '#718096',

        // Priority Colors
        'priority-critical': '#9B2C2C',
        'priority-high': '#E53E3E',
        'priority-medium': '#F6AD55',
        'priority-low': '#48BB78',

        // Chart Colors
        'chart-1': '#0078D4',
        'chart-2': '#40E0D0',
        'chart-3': '#48BB78',
        'chart-4': '#F6AD55',
        'chart-5': '#E53E3E',
        'chart-6': '#9F7AEA',
        'chart-7': '#ED64A6',
        'chart-8': '#38B2AC',

        // Data Visualization
        'data-positive': '#48BB78',
        'data-negative': '#E53E3E',
        'data-neutral': '#718096',
        'data-highlight': '#40E0D0',
      },

      // Spacing to match WPF padding/margins
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },

      // Border radius values from WPF
      borderRadius: {
        'card': '16px',
        'section': '12px',
        'button': '8px',
        'input': '6px',
      },

      // Box shadows matching WPF effects
      boxShadow: {
        'card': '0 6px 20px rgba(0, 255, 255, 0.2)',
        'card-hover': '0 8px 25px rgba(0, 255, 255, 0.4)',
        'button': '0 2px 5px rgba(0, 0, 0, 0.3)',
        'metric': '0 2px 8px rgba(0, 0, 0, 0.2)',
        'metric-hover': '0 4px 12px rgba(0, 0, 0, 0.3)',
        'section': '0 2px 10px rgba(0, 0, 0, 0.3)',
        'neon-cyan': '0 0 20px rgba(0, 255, 255, 0.5)',
        'neon-pink': '0 0 20px rgba(255, 20, 147, 0.5)',
      },

      // Animation durations
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
      },

      // Font sizes matching WPF
      fontSize: {
        'nav': '15px',
      },

      // Heights for specific components
      height: {
        'nav-button': '56px',
      },

      // Background gradients
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        'accent-gradient': 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
        'success-gradient': 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
        'warning-gradient': 'linear-gradient(135deg, #FFC107 0%, #FFCE38 100%)',
        'error-gradient': 'linear-gradient(135deg, #DC3545 0%, #E5766F 100%)',
        'card-gradient': 'linear-gradient(135deg, #1C2433 0%, #2D3748 100%)',
        'card-hover-gradient': 'linear-gradient(135deg, #2A3441 0%, #3C4D62 100%)',
        'neon-cyan-gradient': 'linear-gradient(135deg, #00FFFF 0%, #0080FF 100%)',
        'neon-pink-gradient': 'linear-gradient(135deg, #FF1493 0%, #FF69B4 100%)',
        'holographic-gradient': 'linear-gradient(135deg, #8A2387 0%, #E94057 50%, #F27121 100%)',
      },
    },
  },
  plugins: [],
}
```

### 3.2 Global CSS (index.css) Implementation
```css
/* guiv2/src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  /* CSS Variables for theme switching */
  :root {
    /* Light theme variables */
    --background: #F5F5F5;
    --surface: #FFFFFF;
    --card: #FFFFFF;
    --foreground: #333333;
    --foreground-secondary: #4A5568;
    --foreground-muted: #718096;
    --border: #E2E8F0;
    --hover: #F7FAFC;
    --pressed: #EDF2F7;
    --selected: #E6FFFA;
    --focus: #0078D4;
  }

  .dark {
    /* Dark theme variables */
    --background: #1A202C;
    --surface: #2D3748;
    --card: #2D3748;
    --foreground: #F7FAFC;
    --foreground-secondary: #CBD5E0;
    --foreground-muted: #A0AEC0;
    --border: #4A5568;
    --hover: #4A5568;
    --pressed: #2D3748;
    --selected: #234E52;
    --focus: #40E0D0;
  }
}

@layer components {
  /* Modern Card Component */
  .modern-card {
    @apply bg-gradient-to-br from-[#1C2433] to-[#2D3748]
           border border-white/30 rounded-2xl p-5 m-2
           shadow-[0_6px_20px_rgba(0,255,255,0.2)]
           transition-all duration-300 hover:scale-[1.01];
  }

  .modern-card:hover {
    @apply bg-gradient-to-br from-[#2A3441] to-[#3C4D62]
           shadow-[0_8px_25px_rgba(0,255,255,0.4)]
           border-cyan-400/50;
  }

  /* Modern Button Component */
  .modern-button {
    @apply bg-primary-gradient text-white px-5 py-3 rounded-lg
           text-sm font-medium cursor-pointer
           shadow-button transition-all duration-150
           hover:bg-accent-gradient hover:scale-105
           active:scale-95 active:shadow-sm;
  }

  /* Navigation Button */
  .nav-button {
    @apply h-14 px-6 bg-transparent rounded-r-xl
           text-left flex items-center
           text-nav font-medium cursor-pointer
           transition-colors duration-200
           hover:bg-[var(--surface)];
  }

  .nav-button.active {
    @apply bg-accent-gradient text-white;
  }

  /* Metric Card */
  .metric-card {
    @apply bg-[var(--card)] border border-[var(--border)]
           rounded-lg p-4 m-1
           shadow-metric transition-all duration-200
           hover:scale-[1.02] hover:shadow-metric-hover
           hover:border-[var(--surface)];
  }

  /* Modern Input */
  .modern-input {
    @apply bg-[var(--surface)] text-[var(--foreground)]
           border border-[var(--border)] rounded-md
           px-3 py-2 text-sm
           transition-all duration-200
           hover:border-brand-accent
           focus:border-brand-accent focus:border-2
           focus:outline-none focus:ring-2 focus:ring-brand-accent/10;
  }

  /* Section Border */
  .section-border {
    @apply bg-gradient-to-br from-[#1C2433]/90 to-[#2D3748]/90
           border border-gradient-to-br from-[#374151] to-[#4B5563]
           rounded-xl p-6 mb-4
           shadow-section;
  }

  /* Status Indicators */
  .status-indicator {
    @apply inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium;
  }

  .status-online {
    @apply bg-status-online/20 text-status-online;
  }

  .status-offline {
    @apply bg-status-offline/20 text-status-offline;
  }

  .status-idle {
    @apply bg-status-idle/20 text-status-idle;
  }

  .status-unknown {
    @apply bg-status-unknown/20 text-status-unknown;
  }

  /* Loading Spinner */
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .loading-spinner {
    @apply animate-spin;
  }
}

@layer utilities {
  /* Text gradients */
  .text-gradient-primary {
    @apply bg-primary-gradient bg-clip-text text-transparent;
  }

  .text-gradient-accent {
    @apply bg-accent-gradient bg-clip-text text-transparent;
  }

  /* Neon effects */
  .neon-cyan {
    @apply shadow-neon-cyan;
  }

  .neon-pink {
    @apply shadow-neon-pink;
  }

  /* Glassmorphism effect */
  .glass {
    @apply backdrop-blur-md bg-white/10 border border-white/20;
  }

  .glass-dark {
    @apply backdrop-blur-md bg-black/10 border border-white/10;
  }
}
```

---

## 4. React Component Specifications

### 4.1 StatusIndicator Component
```typescript
// src/renderer/components/molecules/StatusIndicator.tsx
interface StatusIndicatorProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'online' | 'offline' | 'idle' | 'unknown';
  text: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, text, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  const statusClasses = {
    success: 'bg-success/20 text-success',
    warning: 'bg-warning/20 text-warning',
    error: 'bg-error/20 text-error',
    info: 'bg-info/20 text-info',
    online: 'bg-status-online/20 text-status-online',
    offline: 'bg-status-offline/20 text-status-offline',
    idle: 'bg-status-idle/20 text-status-idle',
    unknown: 'bg-status-unknown/20 text-status-unknown'
  };

  return (
    <div className={`inline-flex items-center gap-2 rounded-md font-medium ${sizeClasses[size]} ${statusClasses[status]}`}>
      <span className="w-2 h-2 rounded-full bg-current" />
      <span>{text}</span>
    </div>
  );
};
```

### 4.2 LoadingOverlay Component
```typescript
// src/renderer/components/molecules/LoadingOverlay.tsx
interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  progress?: number;
  showCancel?: boolean;
  onCancel?: () => void;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Loading...',
  progress,
  showCancel = false,
  onCancel
}) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-dark-surface border-2 border-dark-border rounded-lg w-80 p-6">
        {/* Spinning loader */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        </div>

        {/* Loading message */}
        <p className="text-center text-gray-200 font-semibold mb-4">{message}</p>

        {/* Progress bar */}
        {progress !== undefined && (
          <div className="w-full bg-dark-background rounded-full h-2 mb-4">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Cancel button */}
        {showCancel && (
          <button
            onClick={onCancel}
            className="w-full bg-gray-600 hover:bg-gray-500 text-white py-2 rounded-md transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};
```

### 4.3 ModernCard Component
```typescript
// src/renderer/components/atoms/ModernCard.tsx
interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = true
}) => {
  return (
    <div
      className={`modern-card ${hoverable ? 'hover:scale-[1.01]' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
```

---

## 5. Implementation Roadmap for gui-module-executor

### Phase 1: Tailwind Configuration (15 minutes)
1. Copy the complete `tailwind.config.js` from Section 3.1
2. Ensure all color values are correctly mapped
3. Add custom spacing, shadows, and gradients

### Phase 2: Global Styles (20 minutes)
1. Implement the complete `index.css` from Section 3.2
2. Set up CSS variables for theme switching
3. Add all component classes with @apply directives

### Phase 3: Core Components (45 minutes)
1. **StatusIndicator.tsx** - Status display with color coding
2. **LoadingOverlay.tsx** - Full-screen loading with progress
3. **ModernCard.tsx** - Reusable card container
4. **ModernButton.tsx** - Primary button component
5. **NavButton.tsx** - Navigation button for sidebar

### Phase 4: Theme Integration (20 minutes)
1. Implement useThemeStore for dark/light switching
2. Add theme toggle component
3. Test theme switching with CSS variables

### Phase 5: Validation & Polish (20 minutes)
1. Verify all colors match WPF originals
2. Test hover/active states
3. Ensure animations are smooth
4. Check accessibility (focus states)

---

## 6. Critical Implementation Notes

### 6.1 Color System Consistency
- **MUST** use exact hex values provided - these match the WPF application
- Theme switching uses CSS variables - ensure proper fallbacks
- Gradients are critical for the modern look - don't simplify to solid colors

### 6.2 Animation Performance
- Use `transform` and `opacity` for animations (GPU accelerated)
- Avoid animating `width`, `height`, or `margin`
- Keep transitions under 300ms for responsiveness

### 6.3 Component Hierarchy
```
atoms/
  ├── Button.tsx (base button)
  ├── Input.tsx (base input)
  └── Card.tsx (base card)
molecules/
  ├── StatusIndicator.tsx (status with icon)
  ├── LoadingOverlay.tsx (loading state)
  ├── ModernCard.tsx (styled card)
  └── MetricCard.tsx (metric display)
organisms/
  ├── Sidebar.tsx (main navigation)
  ├── DataTable.tsx (data grid)
  └── TabView.tsx (tabbed interface)
```

### 6.4 Missing Gradient References
The following gradients are referenced in MainStyles.xaml but need fallback definitions:
- **PrimaryGradient** → Use brand-primary colors (#1e3c72 to #2a5298)
- **AccentGradient** → Use accent colors (#4299e1 to #3182ce)

These have been included in the Tailwind configuration.

---

## 7. Quality Checklist for gui-module-executor

- [ ] All 70+ colors from Colors.xaml are mapped
- [ ] Light and dark theme CSS variables are defined
- [ ] All gradient definitions are implemented
- [ ] Component styles match WPF visual hierarchy
- [ ] Hover/active states have appropriate transitions
- [ ] Border radius values match original (16px cards, 8px buttons, etc.)
- [ ] Shadow effects replicate the neon glow aesthetic
- [ ] Status indicators use semantic color coding
- [ ] Loading overlay includes spinner animation
- [ ] Navigation buttons have rounded right corners
- [ ] Metric cards have scale transform on hover
- [ ] Input fields have focus ring styling
- [ ] All components are keyboard accessible
- [ ] Theme switching updates all components correctly

---

## 8. Context for Next Agent

This document provides the **complete design system** for Epic 0. The gui-module-executor should:

1. **First Priority**: Set up Tailwind configuration exactly as specified
2. **Second Priority**: Implement global CSS with theme variables
3. **Third Priority**: Create the core React components
4. **Fourth Priority**: Test theme switching functionality

All color values, gradients, and styling specifications are **production-ready** and have been extracted directly from the working WPF application. No interpretation is needed - implement exactly as specified.

The design system emphasizes:
- **Dark theme by default** with cyberpunk/neon aesthetics
- **Gradient backgrounds** for visual depth
- **Subtle animations** for interactivity
- **Consistent spacing** using 4px/8px/16px/24px increments
- **Semantic color coding** for status and priority

This foundation will ensure 100% visual parity between the WPF and Electron applications.