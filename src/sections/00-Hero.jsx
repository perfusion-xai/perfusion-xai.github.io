import HeroRotating from "../components/HeroRotating.jsx";
import HeroFingerprints from "../components/HeroFingerprints.jsx";

export default function HeroSection({ variant = "ab" }) {
  return (
    <section id="hero" className="px-6 pt-10">
      <div className="max-w-wide mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-ink2">
              Aithal · Sinha · Babu — IISc · 2026
            </div>
            <h1 className="text-3xl md:text-5xl tracking-editorial mt-2 max-w-prose">
              A 30-region <span className="text-female">perfusion fingerprint</span> of biological sex.
            </h1>
          </div>
          <div className="font-mono text-xs text-ink2">
            ASL · Brainnetome · SHAP · Grad-CAM
          </div>
        </div>

        {variant === "ab" ? (
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-ink2 mb-1">
                Variant A — rotating
              </div>
              <HeroRotating />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-ink2 mb-1">
                Variant B — fingerprints
              </div>
              <HeroFingerprints />
            </div>
          </div>
        ) : variant === "fingerprints" ? (
          <HeroFingerprints />
        ) : (
          <HeroRotating />
        )}
      </div>
    </section>
  );
}
