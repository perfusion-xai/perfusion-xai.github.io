/** @type {import('tailwindcss').Config} */

// Perfusion Print palette — see WEBSITE_PLAN.md §2 (Option A).
// CBF colormap as the brand: warm cream paper, slate ink, arterial-red
// for female-elevated, cool-blue for male-elevated, saffron for highlight.
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FAF7F2",        // warm cream background
        paper2: "#F0EDE5",       // cards / sidebars
        ink: "#1A2332",          // primary text
        ink2: "#5A6478",         // muted text
        rule: "#2A3245",         // hairlines
        female: "#C8312B",       // arterial red
        male: "#1E5A8A",         // cool blue
        highlight: "#E89B2C",    // saffron
        // Diverging colormap stops (matching the data colormap)
        cbf: {
          50: "#1E5A8A",
          25: "#7AA0BD",
          0:  "#FAF7F2",
          neg25: "#E5A29D",
          neg50: "#C8312B",
        },
      },
      fontFamily: {
        // Loaded via Google Fonts in index.html
        sans: ['"Sora"', "system-ui", "sans-serif"],
        serif: ['"Newsreader"', "Georgia", "serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      letterSpacing: {
        editorial: "-0.015em",
      },
      maxWidth: {
        prose: "62ch",
        wide: "76rem",
      },
    },
  },
  plugins: [],
};
