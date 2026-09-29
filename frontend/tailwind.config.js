/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        trinetra: {
          dark: '#1F2937',
          purple: '#4B2E83',
          orange: '#F7941D',
          green: '#159A74',
          blue: '#3F7FBF',
          teal: '#2997A8',
          bg: '#F8FAFC',
          'bg-blue': '#EAF3FB',
          'bg-green': '#EDF7ED',
          'bg-purple': '#F3EEF9',
          'bg-orange': '#FFF4E6',
        }
      }
    },
  },
  plugins: [],
}
