/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./layouts/**/*.html",
    "./content/**/*.md",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'fluid-sm': 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)',
        'fluid-base': 'clamp(1rem, 0.875rem + 0.5vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 1rem + 0.5vw, 1.5rem)',
        'fluid-xl': 'clamp(1.5rem, 1.25rem + 1vw, 2.5rem)',
        'fluid-2xl': 'clamp(2rem, 1.5rem + 2vw, 4rem)',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            '--tw-prose-body': theme('colors.stone.700'),
            '--tw-prose-headings': theme('colors.stone.900'),
            '--tw-prose-links': theme('colors.amber.700'),
            '--tw-prose-bold': theme('colors.stone.900'),
            '--tw-prose-counters': theme('colors.stone.500'),
            '--tw-prose-bullets': theme('colors.stone.400'),
            '--tw-prose-hr': theme('colors.stone.200'),
            '--tw-prose-quotes': theme('colors.stone.900'),
            '--tw-prose-quote-borders': theme('colors.stone.200'),
            '--tw-prose-captions': theme('colors.stone.500'),
            '--tw-prose-code': theme('colors.stone.900'),
            '--tw-prose-pre-code': theme('colors.stone.200'),
            '--tw-prose-pre-bg': theme('colors.stone.800'),
            '--tw-prose-th-borders': theme('colors.stone.300'),
            '--tw-prose-td-borders': theme('colors.stone.200'),
            code: {
              backgroundColor: theme('colors.stone.200'),
              padding: '0.25rem 0.375rem',
              borderRadius: '0.25rem',
              fontWeight: '400',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            'a:hover': {
              color: theme('colors.amber.600'),
            },
          },
        },
        invert: {
          css: {
            '--tw-prose-body': theme('colors.stone.300'),
            '--tw-prose-headings': theme('colors.stone.100'),
            '--tw-prose-links': theme('colors.amber.400'),
            '--tw-prose-bold': theme('colors.stone.100'),
            '--tw-prose-counters': theme('colors.slate.400'),
            '--tw-prose-bullets': theme('colors.slate.500'),
            '--tw-prose-hr': theme('colors.slate.700'),
            '--tw-prose-quotes': theme('colors.stone.100'),
            '--tw-prose-quote-borders': theme('colors.slate.700'),
            '--tw-prose-captions': theme('colors.slate.400'),
            '--tw-prose-code': theme('colors.stone.100'),
            '--tw-prose-pre-code': theme('colors.stone.300'),
            '--tw-prose-pre-bg': theme('colors.slate.800'),
            '--tw-prose-th-borders': theme('colors.slate.600'),
            '--tw-prose-td-borders': theme('colors.slate.700'),
            code: {
              backgroundColor: theme('colors.slate.800'),
            },
            'a:hover': {
              color: theme('colors.amber.300'),
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
