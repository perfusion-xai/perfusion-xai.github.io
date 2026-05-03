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
  // Diverging colormap stops (cool → paper → warm)
  cbf: ["#1E5A8A", "#7AA0BD", "#FAF7F2", "#E5A29D", "#C8312B"],
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
