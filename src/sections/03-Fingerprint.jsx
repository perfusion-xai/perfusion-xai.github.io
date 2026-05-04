import Section from "../components/Section.jsx";
import BrainViewer from "../components/BrainViewer.jsx";
import { networkColors } from "../lib/theme.js";

export default function FingerprintSection() {
  return (
    <Section
      id="fingerprint"
      eyebrow="Result · 1"
      title="The 30 consensus regions."
      lede="SHAP attribution across 500 logistic-regression models — 100 iterations × 5-fold CV — selects 30 atlas regions whose mean CBF most strongly drives sex classification. They concentrate in the frontoparietal control (27%) and default-mode (17%) networks."
    >
      <div className="grid md:grid-cols-12 gap-6 mt-6">
        <div className="md:col-span-9">
          <BrainViewer
            staticSrc="assets/figures/fig_glass_networks.png"
            alt="Glass-brain projection of the 30 consensus regions, colored by Yeo-7 network"
            caption="30 consensus regions colored by Yeo-7 network. 2D = nilearn glass-brain projection · 3D = interactive Brainnetome atlas."
            mode="shap-explode"
            title="The 30 consensus regions"
            subtitle="Result · 1 · colored by Yeo-7 network + SCGM"
          />
        </div>
        <aside className="md:col-span-3 bg-paper2 border border-ink/10 rounded-md p-6">
          <div className="font-mono text-xs uppercase tracking-widest text-ink2 mb-3">
            Network · Yeo-7 + SCGM
          </div>
          <ul className="space-y-1.5 text-xs">
            {Object.entries(networkColors).map(([name, color]) => (
              <li key={name} className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-sm" style={{ background: color }} />
                <span className="text-ink2">{name}</span>
              </li>
            ))}
          </ul>
          <hr className="my-4" />
          <p className="text-xs text-ink2">
            Highlighted voxels are the union of all 30 consensus regions, projected
            through the brain volume from each viewing axis. Generated with
            <code className="font-mono"> nilearn.plotting.plot_glass_brain</code>.
          </p>
        </aside>
      </div>
    </Section>
  );
}
