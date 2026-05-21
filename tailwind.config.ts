import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    extend: {
      colors: {
        emerald: {
          400: '#34d399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        dark: {
          50:  '#f8faf9',
          100: '#e8eee9',
          200: '#c2d0c4',
          300: '#9bb09e',
          400: '#6a8a6e',
          500: '#4a6a4e',
          600: '#2d4a30',
          700: '#1e3320',
          800: '#121f13',
          900: '#0b130c',
          950: '#060908',
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
