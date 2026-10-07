/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mbm-primary': '#E6D5B8',
        'mbm-cream': '#F7F1E7',
        'mbm-ivory': '#FBF8F2',
        'mbm-champagne': '#DCC39A',
        'mbm-gold': '#B8944A',
        'mbm-gold-light': '#D4AF37',
        'mbm-gold-dark': '#8E6E2F',
        'mbm-brown': '#3A2A20',
        'mbm-deep': '#241A15',
        'mbm-muted': '#756457',
        'mbm-border': '#D8C6A8',
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
