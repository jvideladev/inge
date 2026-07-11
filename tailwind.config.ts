import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          blue:  '#2563EB',
          teal:  '#0D9488',
          purple:'#7C3AED',
          orange:'#D97706',
          red:   '#DC2626',
          green: '#16A34A',
        }
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] }
    }
  },
  plugins: []
}
export default config
