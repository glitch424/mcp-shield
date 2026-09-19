/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0F172A',
        card: '#111827',
        accent: '#F97316',
        allowed: '#22C55E',
        warning: '#EAB308',
        blocked: '#EF4444',
      }
    },
  },
  plugins: [],
}
