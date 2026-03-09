import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Avenir Next"', '"Segoe UI"', 'sans-serif'],
      },
      colors: {
        ink: '#111827',
        sand: '#f5efe1',
        sage: '#b6c8b4',
        ember: '#f97316',
      },
      boxShadow: {
        panel: '0 24px 70px rgba(17, 24, 39, 0.12)',
      },
    },
  },
}
