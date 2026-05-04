import { useState } from "react";

// Desktop-only collapsible. On mobile (<md) the children are always shown,
// because the small-screen reading flow already wants the full text inline.
export default function ReadMore({ summary = "Read more", children, className = "" }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={className}>
      {/* mobile: always expanded (no toggle clutter) */}
      <div className="md:hidden space-y-4">{children}</div>

      {/* desktop: collapsible */}
      <div className="hidden md:block">
        {open && <div className="space-y-4 mb-3">{children}</div>}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="font-mono text-xs uppercase tracking-widest text-ink2 hover:text-female border-b border-ink/15 hover:border-female pb-0.5"
        >
          {open ? "− show less" : `+ ${summary}`}
        </button>
      </div>
    </div>
  );
}
