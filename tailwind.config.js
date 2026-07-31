/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        space: {
          950: '#000000',
          900: '#0a0a0a',
          800: '#121212',
          700: '#1e1e1e',
          600: '#2a2a2a',
          500: '#3f3f46',
          400: '#71717a',
          300: '#a1a1aa',
          200: '#e4e4e7',
          100: '#fafafa',
        },
      },
      boxShadow: {
        'card': '0 0 0 1px rgba(255, 255, 255, 0.08), 0 4px 20px rgba(0,0,0,0.5)',
        'card-hover': '0 0 0 1px rgba(255, 255, 255, 0.16), 0 8px 30px rgba(0,0,0,0.8)',
      },
    },
  },
  plugins: [],
};
