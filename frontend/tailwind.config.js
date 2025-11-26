/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // This points Tailwind to your source files for scanning classes
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core dark background color
        'dark-void': '#0C0C0D', // Very dark grey/black
        // Primary text/accent color (like lead/muted grey)
        'lead-light': '#D1D5DB', 
        // Secondary text/border color
        'gunmetal': '#4B5563', 
        // Accent/Error color (for a touch of terror)
        'blood-red': '#A32C2C', 
      },
    },
  },
  plugins: [],
}