import type { Config } from 'tailwindcss'
import PrimeUI from 'tailwindcss-primeui'

export default <Partial<Config>>{
  darkMode: 'class',
  plugins: [PrimeUI],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      },
      colors: {
        ink: '#1d1918',
        sand: '#f5efe6',
        haze: '#fffdfa',
        brass: '#d97706',
        fog: '#f4ede4',
        night: '#0f1116',
        success: '#10b981',
        warn: '#f59e0b',
        danger: '#ef4444',
      },
      boxShadow: {
        panel: '0 24px 80px rgba(108, 78, 27, 0.12)',
        glow: '0 18px 60px rgba(245, 158, 11, 0.24)',
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
      },
    },
  },
}
