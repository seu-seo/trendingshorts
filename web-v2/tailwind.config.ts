import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0A0A0B',
          darker: '#050507',
        },
        surface: {
          1: '#111114',
          2: '#18181C',
          3: '#25252B',
        },
        border: {
          DEFAULT: '#2A2A30',
          bright: '#3A3A42',
        },
        text: {
          DEFAULT: '#F2F0EB',
          dim: '#8A8A92',
          faint: '#5A5A62',
        },
        accent: {
          lime: '#C8FF57',
          pink: '#FF3D7F',
          blue: '#57C8FF',
          orange: '#FF8657',
          purple: '#C857FF',
        },
        peak: '#FFD700',
        fading: '#6A6A72',
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        body: ['Instrument Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
