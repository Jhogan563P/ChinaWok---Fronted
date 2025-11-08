import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#D9252C',
        secondary: '#118C4F',
        accent: '#FFC107',
        'dark-text': '#1B1B1B',
        'light-gray': '#F5F5F5'
      },
      fontFamily: {
        sans: ['\"Poppins\"', 'ui-sans-serif', 'system-ui']
      }
    }
  },
  plugins: []
} satisfies Config;
