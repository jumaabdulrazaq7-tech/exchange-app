import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}','./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2530F8',
          50: '#ECEEFF', 100: '#D9DDFF', 200: '#B3BBFF',
          300: '#8D99FF', 400: '#6777FF', 500: '#2530F8',
          600: '#1C25D9', 700: '#141AB9', 800: '#0D1199', 900: '#070B7A',
        },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      boxShadow: { 'glow': '0 0 20px rgba(37, 48, 248, 0.15)' }
    },
  },
  plugins: [],
};
export default config;