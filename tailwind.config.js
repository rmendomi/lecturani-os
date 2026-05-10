/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2D6A4F',
          light: '#40916C',
          dark: '#1B4332',
        },
        accent: {
          DEFAULT: '#74C69D',
          light: '#95D5B2',
          dark: '#52B788',
        },
        warm: '#FFF8F0',
        danger: '#E63946',
        child: '#4895EF',
        current: '#FFE066',
        surface: '#FFFFFF',
        neutral: {
          50: '#FAFAF8',
          100: '#F5F5F0',
          200: '#E8E8E0',
          300: '#D4D4C8',
          400: '#ABABAB',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        }
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        reading: ['Nunito', 'Georgia', 'serif'],
      },
      fontSize: {
        'reading-sm': ['1.125rem', { lineHeight: '1.75rem' }],
        'reading-md': ['1.375rem', { lineHeight: '2rem' }],
        'reading-lg': ['1.625rem', { lineHeight: '2.25rem' }],
        'reading-xl': ['2rem', { lineHeight: '2.75rem' }],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'warm': '0 4px 24px rgba(45, 106, 79, 0.12)',
        'card': '0 2px 16px rgba(0, 0, 0, 0.08)',
        'button': '0 4px 12px rgba(45, 106, 79, 0.25)',
      },
      animation: {
        'pulse-soft': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounce 1.5s infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
