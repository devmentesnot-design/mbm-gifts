/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mbm-burgundy': '#2B0005',
        'mbm-wine': '#450006',
        'mbm-red': '#8F0712',
        'mbm-gold': '#D9A514',
        'mbm-bright-gold': '#F5C542',
        'mbm-cream': '#FFF8ED',
      },
      fontFamily: {
        podium: ['"DM Serif Display"', '"Abril Fatface"', '"Playfair Display"', 'Georgia', 'serif'],
        serif: ['"DM Serif Display"', '"Abril Fatface"', '"Playfair Display"', 'Georgia', 'serif'],
        classy: ['"DM Serif Display"', '"Abril Fatface"', '"Playfair Display"', 'Georgia', 'serif'],
        inter: ['Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
