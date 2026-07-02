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
          card: '#1A1A1A',
          block: '#1E1E1E',
          surface: '#141414',
          elevated: '#1C1C1C',
          white: '#FFFFFF',
          muted: '#666666',
          dim: '#737373',
          gold: '#C5A073',
          'gold-button': '#D9B985',
          'gold-light': '#D4BC94',
          'gold-dim': '#8A7340',
        },
        slate: {
          DEFAULT: '#1A1A1A',
          dark: '#0A0A0A',
          mid: '#1E1E1E',
        },
        sky: {
          DEFAULT: '#C5A073',
          dim: '#8A7340',
          bright: '#D4BC94',
        },
        admin: '#666666',
        cloud: {
          DEFAULT: '#FFFFFF',
          dim: '#E5E5E5',
        },
      },
      backgroundImage: {
        'ckc-header': 'linear-gradient(180deg, #FFFFFF 0%, #C0C0C0 100%)',
        'ckc-gold': 'linear-gradient(180deg, #D4BC94 0%, #C5A073 100%)',
        'ckc-surface': 'linear-gradient(180deg, #1C1C1C 0%, #0A0A0A 100%)',
        'ckc-life-fade': 'linear-gradient(180deg, #FFFFFF 0%, #E8E8E8 40%, #1A1A1A 100%)',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      letterSpacing: {
        tightest: '-0.06em',
      },
      maxWidth: {
        life: '430px',
      },
    },
  },
  plugins: [],
};
