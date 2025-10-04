/** @type {import('tailwindcss').Config} */
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

        // Light Theme Colors
        'light-background': '#F5F5F5',
        'light-surface': '#FFFFFF',
        'light-card': '#FFFFFF',
        'light-modal': '#FFFFFF',
        'light-foreground': '#333333',
        'light-foreground-secondary': '#4A5568',
        'light-foreground-muted': '#718096',
        'light-border': '#E2E8F0',
        'light-divider': '#EDF2F7',
        'light-hover': '#F7FAFC',
        'light-pressed': '#EDF2F7',
        'light-selected': '#E6FFFA',
        'light-focus': '#0078D4',

        // Dark Theme Colors
        'dark-background': '#1A202C',
        'dark-surface': '#2D3748',
        'dark-card': '#2D3748',
        'dark-modal': '#2D3748',
        'dark-foreground': '#F7FAFC',
        'dark-foreground-secondary': '#CBD5E0',
        'dark-foreground-muted': '#A0AEC0',
        'dark-border': '#4A5568',
        'dark-divider': '#4A5568',
        'dark-hover': '#4A5568',
        'dark-pressed': '#2D3748',
        'dark-selected': '#234E52',
        'dark-focus': '#40E0D0',

        // Status Indicators
        'status-online': '#48BB78',
        'status-offline': '#E53E3E',
        'status-idle': '#F6AD55',
        'status-unknown': '#718096',

        // Priority Levels
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

      // Keyframe animations
      keyframes: {
        'spin': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 255, 255, 0.6)' },
        },
      },

      // Animation utilities
      animation: {
        'spin': 'spin 1s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography')
  ]
}
