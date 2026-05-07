import { useEffect, useState } from "react";

// Click-to-open lightbox for manuscript figures.
// Renders a mono-uppercase trigger button; on click opens a full-size image
// modal with a caption block. ESC and backdrop click both close.
export default function FigureModal({
  src,
  alt = "",
  caption,
  label = "View figure",
  className = "",
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={
          "font-mono text-xs uppercase tracking-widest text-ink2 hover:text-female border-b border-ink/15 hover:border-female pb-0.5 " +
          className
        }
      >
        + {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-ink/80 flex items-start justify-center overflow-y-auto p-4 md:p-8"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-paper max-w-5xl w-full rounded-md border border-ink/15 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-ink/10">
              <div className="font-mono text-xs uppercase tracking-widest text-ink2">
                {label}
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="font-mono text-sm text-ink2 hover:text-female"
              >
                ✕ close
              </button>
            </div>
            <div className="p-5">
              <img src={src} alt={alt} className="w-full h-auto rounded-sm" />
              {caption && (
                <div className="mt-4 text-sm text-ink2 leading-snug max-w-prose">
                  {caption}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
