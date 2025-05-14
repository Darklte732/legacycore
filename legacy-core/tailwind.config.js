/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Custom theme extensions if needed
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(20px)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        'shimmer-slide': {
          '0%': { transform: 'translateX(-100%) translateY(-100%)' },
          '30%': { transform: 'translateX(100%) translateY(100%)' },
          '100%': { transform: 'translateX(100%) translateY(100%)' },
        },
        'spin-around': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
        slideIn: 'slideIn 0.3s ease-out',
        pulse: 'pulse 1.5s ease-in-out infinite',
        'shimmer-slide': 'shimmer-slide var(--speed, 3s) ease-in-out infinite',
        'spin-around': 'spin-around calc(var(--speed, 3s) * 3) linear infinite',
      },
    },
  },
  plugins: [],
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [],
}
