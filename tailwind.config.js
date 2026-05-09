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

        // Soft-neumorphic redesign palette (gated by USE_SOFT_DESIGN).
        // Neutrals use CSS vars so dark mode flips them; accents stay fixed at Gemini's exact pastel hues.
        'soft-cream':        'rgb(var(--soft-cream)        / <alpha-value>)',
        'soft-card':         'rgb(var(--soft-card)         / <alpha-value>)',
        'soft-input':        'rgb(var(--soft-input)        / <alpha-value>)',
        'soft-text':         'rgb(var(--soft-text)         / <alpha-value>)',
        'soft-muted':        'rgb(var(--soft-muted)        / <alpha-value>)',
        'soft-border':       'rgb(var(--soft-border)       / <alpha-value>)',
        'soft-mustard':      'rgb(228 191 120 / <alpha-value>)', // #E4BF78 hero card + primary buttons
        'soft-mustard-pale': 'rgb(247 220 111 / <alpha-value>)', // #F7DC6F pill bg / exercises
        'soft-green':        'rgb(102 213 154 / <alpha-value>)', // #66D59A progress bar fill
        'soft-green-pale':   'rgb(163 228 215 / <alpha-value>)', // #A3E4D7 done pill / labs
        'soft-rose':         'rgb(241 148 138 / <alpha-value>)', // #F1948A pending pill / tests
        'soft-blue-pale':    'rgb(174 214 241 / <alpha-value>)', // #AED6F1 materials (Phase 2)
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
        // Soft-neumorphic dual-shadow (Gemini exact spec).
        // Light part flips via CSS var so dark mode doesn't get a bright halo.
        soft:         'var(--soft-shadow)',
        'soft-lg':    'var(--soft-shadow-lg)',
        'soft-pressed': 'var(--soft-shadow-pressed)',
        // Buttons / pills / icon buttons — pronounced drop shadow
        'soft-pill':  '0 6px 14px rgba(0, 0, 0, 0.20), 0 2px 5px rgba(0, 0, 0, 0.10)',
        'soft-pill-hover': '0 10px 22px rgba(0, 0, 0, 0.25), 0 4px 8px rgba(0, 0, 0, 0.13)',
        'soft-inset': 'inset 0 2px 4px rgba(0, 0, 0, 0.10)',
      },
      borderRadius: {
        soft:        '25px', // main cards (Gemini exact)
        'soft-md':   '18px', // topic folders (Gemini exact, Phase 2)
        'soft-pill': '999px',
      },
      rotate: {
        sticker: '11.91deg',
        'sticker-rev': '-11.91deg',
      },
    },
  },
  plugins: [],
};
