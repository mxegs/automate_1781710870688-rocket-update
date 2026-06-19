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