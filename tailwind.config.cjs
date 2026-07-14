// tailwind.config.js
module.exports = {
  content: [
    "./src/pages/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/app/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-bg-elevated)',
        primary: 'var(--color-primary)',
        primaryDark: 'var(--color-primary-dark)',
        primaryBg: 'var(--color-primary-bg)',
        border: 'var(--color-border)',
        muted: 'var(--color-text-muted)',
        textInverse: 'var(--color-text-inverse)',
        danger: 'var(--color-danger)',
        dangerBg: 'var(--color-danger-bg)',
        warning: 'var(--color-warning)',
        warningBg: 'var(--color-warning-bg)',
        success: 'var(--color-success)',
        successBg: 'var(--color-success-bg)',
        accent: 'var(--color-accent)',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        ui: ['var(--font-ui)'],
      },
      letterSpacing: {
        tightest: '-0.03em',
      },
      animation: {
        'in': 'in 0.3s ease-out',
        'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'zoom-in': 'zoom-in 0.3s ease-out',
      },
      keyframes: {
        in: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'slide-in-from-bottom': {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        'zoom-in': {
          '0%': { transform: 'scale(0.95)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
      },
      screens: {
        'xs': '475px',
        '3xl': '1920px',
      },
    },
  },
  plugins: [],
};