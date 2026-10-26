/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blinkit: {
          yellow: '#f7cb44',
          yellowDark: '#e3b426',
          green: '#0c831f',
          greenDark: '#086317',
          greenLight: '#e9f7ea',
          grayBg: '#f4f6fb',
          dark: '#1c1c1c',
          muted: '#666666'
        },
        bb: {
          green: '#84c225',
          red: '#d83a3a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

