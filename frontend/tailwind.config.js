// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          energy: {
            primary: '#10B981',    // Green for renewable energy
            secondary: '#F59E0B',   // Amber for solar
            accent: '#3B82F6',      // Blue for technology
            danger: '#EF4444',      // Red for deficits
            dark: '#1F2937',        // Dark gray
          }
        },
        animation: {
          'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          'bounce-slow': 'bounce 2s infinite',
        }
      },
    },
    plugins: [],
  }