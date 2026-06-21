import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Text',
          'Segoe UI',
          'system-ui',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Cool light surfaces
        base: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
        },
        // Teal corporate accent
        signal: {
          DEFAULT: '#0d9488',
          soft: '#14b8a6',
          dim: 'rgba(13, 148, 136, 0.10)',
        },
      },
    },
  },
}
