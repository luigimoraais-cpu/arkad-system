/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        arkad: {
          red: '#E31E24',
          'red-dark': '#B01519',
          'red-light': '#FF4A50',
          black: '#0A0A0A',
          'gray-dark': '#1A1A1A',
          'gray-mid': '#2A2A2A',
          'gray-light': '#F5F5F5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
