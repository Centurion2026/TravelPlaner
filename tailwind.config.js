/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      colors: {
        ink: {
          900: '#0b1020',
          800: '#111733',
          700: '#1a2247',
        },
        accent: {
          400: '#f59e0b',
          500: '#ef6b1f',
        }
      }
    }
  },
  plugins: []
}
