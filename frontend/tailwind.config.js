/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#2a4d69',
          DEFAULT: '#1a3a5a', // Dark Blue
          dark: '#0e1a2b',
        },
        secondary: {
          light: '#ffb347',
          DEFAULT: '#f97316', // Orange accent
          dark: '#c2410c',
        },
        dark: {
          light: '#374151',
          DEFAULT: '#111827', // Black/Dark Gray
          dark: '#030712',
        }
      },
      backgroundImage: {
        'hero-pattern': "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')",
      }
    },
  },
  plugins: [],
}
