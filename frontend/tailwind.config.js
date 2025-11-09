/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Background
        bg: '#0b1220',
        surface: '#0f1629',
        subtle: '#0c1324',
        // Primary
        primary: '#12b3ff',
        'primary-600': '#0ea5e9',
        'primary-700': '#0284c7',
        // Accent & Status
        accent: '#16f2b3',
        danger: '#ef4444',
        warning: '#f59e0b',
        success: '#22c55e',
        // Borders
        border: '#1e2a44',
        line: '#1a2340',
        // Text
        text: '#e2e8f0',
        'text-dim': '#9aa7bf',
        // Legacy phishing colors
        'phish-email': '#6366f1',
        'phish-sms': '#14b8a6',
        'phish-voice': '#f97316',
        'phish-generic': '#8b5cf6',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      letterSpacing: {
        tight: '-0.02em',
      },
      borderRadius: {
        sm: '0.625rem',  // 10px
        md: '0.75rem',   // 12px
        lg: '1rem',      // 16px
        xl: '1.25rem',   // 20px
        '2xl': '1.5rem', // 24px
      },
      boxShadow: {
        'glow': '0 0 20px rgba(18, 179, 255, 0.15)',
        'glow-accent': '0 0 20px rgba(22, 242, 179, 0.15)',
      },
      zIndex: {
        'background': '0',
        'particles': '1',
        'base': '10',
        'elevated': '20',
        'dropdown': '30',
        'modal': '9999',
        'tooltip': '10000',
      },
      transitionDuration: {
        'fast': '160ms',
        'base': '200ms',
        'slow': '300ms',
      },
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}

