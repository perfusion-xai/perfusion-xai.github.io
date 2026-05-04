import GlassBrain from "../components/GlassBrain.jsx";

export default function HeroSection() {
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

        <GlassBrain
          src="assets/figures/fig_glass_networks.png"
          alt="Glass-brain projection of the 30 consensus regions, colored by Yeo-7 network"
          caption="Sagittal L · Coronal · Sagittal R · Axial · 30 consensus regions colored by network"
        />
      </div>
    </section>
  );
}
