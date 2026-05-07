import BrainViewer from "../components/BrainViewer.jsx";
import FigureModal from "../components/FigureModal.jsx";

export default function HeroSection() {
  return (
    <section id="hero" className="px-6 pt-10">
      <div className="max-w-wide mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-ink2">
              Ninad Aithal · 2026
            </div>
            <h1 className="text-3xl md:text-5xl tracking-editorial mt-2 max-w-prose">
              A 30-region <span className="text-female">perfusion fingerprint</span> of biological sex.
            </h1>
          </div>
          <div className="font-mono text-xs text-ink2">
            ASL · Brainnetome · SHAP · Grad-CAM
          </div>
        </div>

        <BrainViewer
          staticSrc="assets/figures/fig_glass_networks.png"
          alt="Glass-brain projection of the 30 consensus regions, colored by Yeo-7 network"
          caption="30 consensus regions colored by Yeo-7 network. Switch to 3D for an interactive atlas view."
          mode="shap-explode"
          title="A 30-region perfusion fingerprint of biological sex"
          subtitle="Ninad Aithal · 2026 · ASL · Brainnetome · SHAP"
        />

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          <FigureModal
            src="assets/figures/manuscript/fig1_overview.png"
            alt="End-to-end study framework"
            label="View overall framework (Figure 1)"
            caption="Study Overview. End-to-end framework for data-driven, explainable sex classification from cerebral blood flow."
          />
        </div>
      </div>
    </section>
  );
}
