// A consistent <section> wrapper for the editorial sections.
// Headings are right-aligned in a small left column to give a Nature-paper feel.

export default function Section({ id, eyebrow, title, lede, children, full }) {
  return (
    <section id={id} className="px-6 py-20 md:py-28 border-t border-ink/10">
      <div className={full ? "max-w-wide mx-auto" : "max-w-wide mx-auto"}>
        <div className="grid md:grid-cols-12 gap-8 mb-10">
          <div className="md:col-span-3">
            {eyebrow && (
              <div className="font-mono text-xs uppercase tracking-widest text-ink2 mb-2">
                {eyebrow}
              </div>
            )}
            <h2 className="text-2xl md:text-3xl tracking-editorial">{title}</h2>
          </div>
          {lede && (
            <div className="md:col-span-9 max-w-prose">
              <p className="text-lg leading-snug text-ink">{lede}</p>
            </div>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
