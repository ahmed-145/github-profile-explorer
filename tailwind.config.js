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
          950: '#020409',
          900: '#0d1117',
          800: '#161b22',
          700: '#21262d',
          600: '#30363d',
          500: '#484f58',
          400: '#6e7681',
          300: '#8b949e',
          200: '#c9d1d9',
          100: '#e6edf3',
        },
        accent: {
          purple: '#a78bfa',
          blue: '#60a5fa',
          cyan: '#22d3ee',
          green: '#4ade80',
          pink: '#f472b6',
          orange: '#fb923c',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #0d1117 0%, #1a1040 50%, #0d1117 100%)',
        'card-gradient': 'linear-gradient(145deg, rgba(167,139,250,0.05) 0%, rgba(96,165,250,0.05) 100%)',
        'purple-blue': 'linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)',
        'cyan-blue': 'linear-gradient(135deg, #22d3ee 0%, #60a5fa 100%)',
      },
      boxShadow: {
        'glow-purple': '0 0 20px rgba(167,139,250,0.3)',
        'glow-blue': '0 0 20px rgba(96,165,250,0.3)',
        'glow-cyan': '0 0 20px rgba(34,211,238,0.3)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.6)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'typewriter': 'typewriter 0.05s steps(1) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
