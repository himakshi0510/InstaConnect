/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Midnight Aurora Theme - Dark Mode (Default)
        base: '#080808',
        card: '#111111',
        elevated: '#1A1A1A',
        input: '#1E1E1E',
        'border-subtle': '#2A2A2A',
        'border-strong': '#3A3A3A',
        'text-primary': '#F5F5F5',
        'text-secondary': '#A0A0A0',
        'text-muted': '#555555',

        // Midnight Aurora Theme - Light Mode
        'light-base': '#FAFAFA',
        'light-card': '#FFFFFF',
        'light-elevated': '#F0F0F0',
        'light-border-subtle': '#E8E8E8',
        'light-border-strong': '#D0D0D0',
        'light-text-primary': '#0A0A0A',
        'light-text-secondary': '#6B6B6B',
        'light-text-muted': '#AAAAAA',

        // Accent Solids
        'accent-purple': '#A855F7',
        'accent-indigo': '#6366F1',
        'accent-cyan': '#06B6D4',
        'accent-like': '#F43F5E',
        'accent-success': '#10B981',
        'accent-warning': '#F59E0B',
      },
      backgroundImage: {
        'gradient-aurora': 'linear-gradient(135deg, #A855F7, #6366F1, #06B6D4)',
        'gradient-primary': 'linear-gradient(135deg, #A855F7, #06B6D4)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        heartBurst: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.35)' }
        }
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite linear',
        heartBurst: 'heartBurst 300ms cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }
    },
  },
  plugins: [],
};
