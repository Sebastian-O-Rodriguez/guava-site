/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        background: '#FEFEFE',    // Light, clean canvas with subtle warmth (60%)
        text: '#2C2828',          // Deep matte charcoal (30%)
        accent: '#39FF14',        // Bold neon green - cyberpunk and futuristic (10%)
        'accent-two': '#187B43',  // Deep green for text highlighting
        secondary: '#343A34',     // Light slate (currently same as text)
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'], // Good for code snippets if needed
      },
      fontSize: {
        'display': 'clamp(3.5rem, 10vw, 5.5rem)',
        'h1': '3rem',
        'h2': '2rem',
        'h3': '1.5rem',
        'large': '1.25rem',
        'body': '1rem',
        'small': '0.875rem',
      },
      lineHeight: {
        'tight': '1.1',
        'heading': '1.2',
        'normal': '1.5',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '16px',
        'xl': '24px',
      },
      spacing: {
        'xs': 'clamp(0.5rem, 1vw, 0.75rem)',
        'sm': 'clamp(0.75rem, 2vw, 1rem)',
        'md': 'clamp(1rem, 3vw, 1.5rem)',
        'lg': 'clamp(1.5rem, 4vw, 2rem)',
        'xl': 'clamp(2rem, 6vw, 3rem)',
        '2xl': 'clamp(3rem, 8vw, 4rem)',
      }
    },
  },
  plugins: [],
}