/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ckc: {
          black: '#0A0A0A',
          surface: '#141414',
          elevated: '#1C1C1C',
          white: '#FFFFFF',
          muted: '#A3A3A3',
          dim: '#737373',
          gold: '#C9A84C',
          'gold-light': '#E2C878',
          'gold-dim': '#8A7340',
        },
        slate: {
          DEFAULT: '#1E293B',
          dark: '#0F172A',
          mid: '#334155',
        },
        sky: {
          DEFAULT: '#0EA5E9',
          dim: '#0284C7',
          bright: '#38BDF8',
        },
        admin: '#64748B',
        cloud: {
          DEFAULT: '#F8FAFC',
          dim: '#E2E8F0',
        },
      },
      backgroundImage: {
        'ckc-header': 'linear-gradient(180deg, #FFFFFF 0%, #C0C0C0 100%)',
        'ckc-gold': 'linear-gradient(180deg, #E2C878 0%, #C9A84C 100%)',
        'ckc-surface': 'linear-gradient(180deg, #1C1C1C 0%, #0A0A0A 100%)',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.06em',
      },
    },
  },
  plugins: [],
};