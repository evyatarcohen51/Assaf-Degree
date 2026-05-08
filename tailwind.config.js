/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Got Schooled palette — neutral colors use CSS variables so dark mode flips them automatically
        ink:   'rgb(var(--c-ink)   / <alpha-value>)',
        cream: 'rgb(var(--c-cream) / <alpha-value>)',
        dot:   'rgb(var(--c-dot)   / <alpha-value>)',
        paper: 'rgb(var(--c-paper) / <alpha-value>)',
        smoke: 'rgb(var(--c-smoke) / <alpha-value>)',
        red: '#C53B3A',
        green: '#0C9367',
        orange: '#F07633',
        yellow: '#F1B333',
        blue: '#0080FF',
        purple: '#6758A5',
        // Pastel variants used for the year-color stripes in SidebarTree.
        'blue-light': '#A5D2FF',
        'green-light': '#AAD9CA',
        'yellow-light': '#FAE4B8',
        'red-light': '#EBBABA',
        'orange-light': '#FACFB8',
      },
      fontFamily: {
        display: ['"Heebo"', 'system-ui', 'sans-serif'],
        body: ['"Heebo"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-red': '0 0 12px 2px rgba(197, 59, 58, 0.7)',
        'glow-yellow': '0 0 12px 2px rgba(241, 179, 51, 0.7)',
        'glow-green': '0 0 12px 2px rgba(12, 147, 103, 0.7)',
        'glow-orange': '0 0 12px 2px rgba(240, 118, 51, 0.7)',
        sticker: '4px 4px 0 0 var(--shadow-ink)',
        'sticker-lg': '6px 6px 0 0 var(--shadow-ink)',
      },
      rotate: {
        sticker: '11.91deg',
        'sticker-rev': '-11.91deg',
      },
    },
  },
  plugins: [],
};
