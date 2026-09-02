/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Warm off-white canvas (replaces pure white)
        background: '#F6F7F4',
        text: '#2C2828',
        secondary: '#343A34',
        muted: '#6B6F6A',
        // Text selection — pale blue background, dark slate text
        selection: '#BFDDF5',
        'selection-text': '#16212A',
        // Brand dark green — the single brand accent
        brand: {
          DEFAULT: '#187B43',
          50: '#EBF7EF',
          100: '#D2EDDC',
          200: '#A4DABD',
          300: '#70C49A',
          400: '#3DA371',
          500: '#187B43',
          600: '#126637',
          700: '#0F522D',
          800: '#0C3E23',
          900: '#082B19',
        },
        // Legacy aliases kept for existing components; both resolve to brand green
        accent: '#187B43',
        'accent-two': '#187B43',
        // Section-progression texture bands
        'texture-1': '#F6F7F4',
        'texture-2': '#ECEFEA',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        display: [
          'clamp(3rem, 8vw, 5.25rem)',
          { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '800' },
        ],
        h1: [
          'clamp(2.25rem, 5vw, 3.5rem)',
          { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' },
        ],
        h2: [
          'clamp(1.75rem, 3.5vw, 2.5rem)',
          { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '700' },
        ],
        h3: [
          'clamp(1.25rem, 2.5vw, 1.5rem)',
          { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' },
        ],
        large: ['1.25rem', { lineHeight: '1.5' }],
        body: ['1rem', { lineHeight: '1.6' }],
        small: ['0.875rem', { lineHeight: '1.5' }],
      },
      lineHeight: {
        tight: '1.1',
        heading: '1.2',
        normal: '1.5',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '16px',
        xl: '24px',
      },
      spacing: {
        xs: 'clamp(0.5rem, 1vw, 0.75rem)',
        sm: 'clamp(0.75rem, 2vw, 1rem)',
        md: 'clamp(1rem, 3vw, 1.5rem)',
        lg: 'clamp(1.5rem, 4vw, 2rem)',
        xl: 'clamp(2rem, 6vw, 3rem)',
        '2xl': 'clamp(3rem, 8vw, 4rem)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '250ms',
        slow: '400ms',
        slower: '600ms',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
        'in-out-sine': 'cubic-bezier(0.45, 0, 0.55, 1)',
      },
    },
  },
  plugins: [],
}