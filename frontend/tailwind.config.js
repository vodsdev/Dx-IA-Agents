/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dx: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#10b981',
          dark: '#0f172a',
          darker: '#1e293b',
          light: '#e2e8f0',
          muted: '#94a3b8',
        },
        agent: {
          processor: '#3b82f6',
          analyzer: '#8b5cf6',
          executor: '#10b981',
          coordinator: '#f59e0b',
          validator: '#ef4444',
          designer: '#ec4899',
          security: '#f97316',
          devops: '#06b6d4',
          'data-scientist': '#a855f7',
          qa: '#14b8a6',
        },
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(99, 102, 241, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};