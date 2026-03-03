import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#fdf9ee',
          100: '#f9f0d1',
          200: '#f3dfa0',
          300: '#ebc864',
          400: '#e4b23a',
          500: '#d4952a',
          600: '#bc7520',
          700: '#9a561d',
          800: '#7e451f',
          900: '#6a3a1e',
          950: '#3c1e0c',
        },
        floscent: {
          50:  '#fdf8f2',
          100: '#faeee0',
          200: '#f4d9bb',
          300: '#ebbc8c',
          400: '#e09558',
          500: '#d4793a',
          600: '#c5612e',
          700: '#a44b27',
          800: '#843d25',
          900: '#6b3420',
          950: '#3a1a0e',
        },
        dark: {
          50:  '#f6f6f7',
          100: '#e1e2e5',
          200: '#c3c5cb',
          300: '#9da0aa',
          400: '#787b88',
          500: '#5e6172',
          600: '#4b4e5e',
          700: '#3e404e',
          800: '#363843',
          900: '#1c1d23',
          950: '#0f1014',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-luxury': 'linear-gradient(135deg, #0f1014 0%, #1c1d23 50%, #363843 100%)',
        'gradient-gold': 'linear-gradient(135deg, #d4952a 0%, #e4b23a 50%, #d4952a 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-gold': 'pulseGold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGold: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}

export default config
