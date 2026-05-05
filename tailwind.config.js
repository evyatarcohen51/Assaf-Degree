/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Got Schooled palette — inspired by allthingswtf.com
        ink: '#2A2A2A',           // primary text + borders
        cream: '#FFF6EA',         // page background (under dot pattern)
        dot: '#F0EADF',           // dot color in page background
        paper: '#F0EADF',         // secondary surface (legacy alias for dot)
        smoke: '#E8E5E0',         // card / box surface — light gray
        red: '#C53B3A',
        green: '#0C9367',
        orange: '#F07633',
        yellow: '#F1B333',
        blue: '#0080FF',
        purple: '#6758A5',
      },
      fontFamily: {
        display: ['"Heebo"', 'system-ui', 'sans-serif'],
        body: ['"Heebo"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-red': '0 0 12px 2px rgba(197, 59, 58, 0.7)',
        'glow-yellow': '0 0 12px 2px rgba(241, 179, 51, 0.7)',
        'glow-green': '0 0 12px 2px rgba(12, 147, 103, 0.7)',
        sticker: '4px 4px 0 0 #2A2A2A',
        'sticker-lg': '6px 6px 0 0 #2A2A2A',
      },
      rotate: {
        sticker: '11.91deg',
        'sticker-rev': '-11.91deg',
      },
    },
  },
  plugins: [],
};
