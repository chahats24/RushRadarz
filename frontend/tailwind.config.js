/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sunrise: {
          50: '#fff7f3',
          100: '#ffece6',
          200: '#ffd0bf',
          300: '#ffb397',
          400: '#ff946a',
          500: '#ff7a59',
          600: '#ff5f40',
          700: '#ff4126',
          800: '#e73a23',
          900: '#bf2f1b'
        },
        lagoon: {
          DEFAULT: '#14b8a6'
        },
        aurora: {
          DEFAULT: '#7c3aed'
        }
      },
      backgroundImage: {
        'sunrise-aurora': 'linear-gradient(90deg,#ff7a59 0%, #ffb86b 50%, #7c3aed 100%)'
      }
    },
  },
  plugins: [],
}