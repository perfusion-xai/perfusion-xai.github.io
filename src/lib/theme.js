// Perfusion Print palette — single source of truth for JS code.
// Tailwind colors are wired separately in tailwind.config.js — keep in sync.

export const palette = {
  paper: "#FAF7F2",
  paper2: "#F0EDE5",
  ink: "#1A2332",
  ink2: "#5A6478",
  rule: "#2A3245",
  female: "#C8312B",
  male: "#1E5A8A",
  highlight: "#E89B2C",
  // Diverging colormap stops (cool → warm grey → warm).
  // Middle stop is a warm neutral grey, NOT paper, so t≈0 regions are
  // still visible against the page background.
  cbf: ["#1E5A8A", "#7AA0BD", "#B8B0A4", "#E5A29D", "#C8312B"],
};

// Map a value in [-1, +1] to a hex color along the diverging colormap.
// + = female-elevated (warm/red), - = male-elevated (cool/blue), 0 = paper.
export function divergingColor(t) {
  const stops = palette.cbf;
  const x = Math.max(-1, Math.min(1, t));
  const idx = (x + 1) / 2 * (stops.length - 1);
  const i = Math.floor(idx);
  const f = idx - i;
  if (i >= stops.length - 1) return stops[stops.length - 1];
  return mixHex(stops[i], stops[i + 1], f);
}

// Categorical palette for Yeo-7 networks + SCGM (subcortical grey matter).
// Tab10-flavored but slightly desaturated to fit the Perfusion Print page.
export const networkColors = {
  "Visual":            "#3A6FA8",
  "Somatomotor":       "#E89B2C",
  "Dorsal Attention":  "#2E8B57",
  "Ventral Attention": "#C8312B",
  "Limbic":            "#8E5BA8",
  "Frontoparietal":    "#8B5A3C",
  "Default":           "#D17BA8",
  "SCGM":              "#5A6478",
};

// Sequential map from cream → arterial red, for one-sided magnitudes
// (e.g., |Cohen's d| or SHAP frequency). t in [0, 1].
const SEQUENTIAL_STOPS = ["#F4EAD9", "#E8B19A", "#D86A56", "#C8312B", "#8E1D17"];
export function sequentialColor(t) {
  const x = Math.max(0, Math.min(1, t));
  const idx = x * (SEQUENTIAL_STOPS.length - 1);
  const i = Math.floor(idx);
  const f = idx - i;
  if (i >= SEQUENTIAL_STOPS.length - 1) return SEQUENTIAL_STOPS[SEQUENTIAL_STOPS.length - 1];
  return mixHex(SEQUENTIAL_STOPS[i], SEQUENTIAL_STOPS[i + 1], f);
}

function mixHex(a, b, t) {
  const ar = parseInt(a.slice(1, 3), 16),
        ag = parseInt(a.slice(3, 5), 16),
        ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16),
        bg = parseInt(b.slice(3, 5), 16),
        bb = parseInt(b.slice(5, 7), 16);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `#${[r, g, bl].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}
