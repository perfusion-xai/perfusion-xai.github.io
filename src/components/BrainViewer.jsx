// Toggleable brain figure: nilearn static PNG (default, fast) ↔ interactive 3D atlas.
// The 3D component (and three.js / R3F / drei) is lazy-loaded only when the user
// switches to "3D", so the initial bundle stays small.
//
// After the page loads, a shared coordinator (lib/brainViewerWarmup.js)
// preloads the heavy 3D chunk in the background and then signals each viewer
// in source order. While a viewer is "ready" but still showing the static
// view, its 3D toggle pulses red so the reader notices it's now an option.

import { lazy, Suspense, useEffect, useState } from "react";
import { registerViewerReady } from "../lib/brainViewerWarmup.js";

const BrainnetomeAtlas = lazy(() => import("./BrainnetomeAtlas.jsx"));

export default function BrainViewer({
  staticSrc,
  alt,
  caption,
  mode = "shap-explode",
  morph = 1,
  className = "",
  title = null,
  subtitle = null,
}) {
  const [view, setView] = useState("static");
  const [ready, setReady] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const off = registerViewerReady(() => {
      setReady(true);
      setPulse(true);
      // Stop the pulse after a few cycles so it's an attention-grab, not a
      // permanent distraction.
      setTimeout(() => setPulse(false), 5200);
    });
    return off;
  }, []);

  // Once the user actually opens 3D, drop the pulse immediately.
  useEffect(() => {
    if (view === "3d") setPulse(false);
  }, [view]);

  const threeDClass = [
    "px-2.5 py-1 uppercase tracking-widest border-l border-ink/15",
    view === "3d" ? "bg-ink text-paper" : "bg-paper text-ink2 hover:text-ink",
    pulse && view !== "3d" ? "brainviewer-3d-ready" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <figure className={`bg-paper2 border border-ink/10 rounded-md overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-ink/10 bg-paper">
        <div className="font-mono text-[10px] uppercase tracking-widest text-ink2">
          {view === "static"
            ? ready
              ? "Glass-brain · static · 3D ready →"
              : "Glass-brain · static"
            : "Atlas · interactive 3D"}
        </div>
        <div role="tablist" className="inline-flex rounded border border-ink/15 overflow-hidden text-[11px] font-mono">
          <button
            role="tab"
            aria-selected={view === "static"}
            onClick={() => setView("static")}
            className={`px-2.5 py-1 uppercase tracking-widest ${
              view === "static" ? "bg-ink text-paper" : "bg-paper text-ink2 hover:text-ink"
            }`}
          >
            2D
          </button>
          <button
            role="tab"
            aria-selected={view === "3d"}
            onClick={() => setView("3d")}
            title={ready ? "Interactive 3D atlas — ready" : "Load interactive 3D atlas"}
            className={threeDClass}
          >
            3D
          </button>
        </div>
      </div>

      {view === "static" ? (
        <img src={staticSrc} alt={alt} className="w-full h-auto block" loading="lazy" />
      ) : (
        <Suspense
          fallback={
            <div className="h-[520px] flex items-center justify-center bg-white text-ink2 font-mono text-xs">
              loading 3D atlas…
            </div>
          }
        >
          <BrainnetomeAtlas mode={mode} morph={morph} className="h-[520px]" label={title} sublabel={subtitle} />
        </Suspense>
      )}

      {caption && (
        <figcaption className="px-4 py-3 text-xs font-mono text-ink2 border-t border-ink/10">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
