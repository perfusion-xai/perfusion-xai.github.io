import Section from "../components/Section.jsx";
import BrainViewer from "../components/BrainViewer.jsx";
import FigureModal from "../components/FigureModal.jsx";
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

      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <FigureCard
          src="assets/figures/manuscript/biomarkers_mean.png"
          label="Biomarkers · mean CBF"
          caption="Surface visualisation of regions identified as sex-discriminative biomarkers using mean CBF. Warmer colours indicate stronger SHAP contributions (33 significant regions before consensus intersection)."
        />
        <FigureCard
          src="assets/figures/manuscript/biomarkers_median.png"
          label="Biomarkers · median CBF"
          caption="Surface visualisation of regions identified as sex-discriminative biomarkers using median CBF. 37 regions reach significance; 30 are shared with the mean-CBF set (J = 0.75, r = 0.84)."
        />
        <FigureCard
          src="assets/figures/manuscript/biomarkers_max.png"
          label="Biomarkers · max CBF"
          caption="Surface visualisation of biomarker regions identified using maximum CBF. 40 significant regions, with reduced concordance to central-tendency summaries but competitive classification (BAcc 0.85 ± 0.06)."
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        <FigureModal
          src="assets/figures/manuscript/fig3_xai.png"
          alt="SHAP-based xAI pipeline"
          label="View SHAP pipeline (Figure 3)"
          caption="Explainable AI pipeline for identifying sex-discriminative cerebral perfusion biomarkers. SHAP-based model interpretation across 100 iterations of 5-fold cross-validation on 215 subjects (95 M, 150 F). For each of the 500 trained logistic-regression models, SHAP values quantify the contribution of each region's CBF. Regions ranked in the top 20% of SHAP importance are aggregated across models into a frequency map; binomial testing with Bonferroni correction selects regions appearing in >289 of 500 models (p < 0.05, corrected) as significant ROIs."
        />
      </div>
    </Section>
  );
}

function FigureCard({ src, label, caption }) {
  return (
    <div className="bg-paper2 border border-ink/10 rounded-md p-3">
      <img src={src} alt={label} className="w-full h-auto rounded-sm" />
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="font-mono text-xs uppercase tracking-widest text-ink2">
          {label}
        </div>
        <FigureModal src={src} alt={label} label="enlarge" caption={caption} />
      </div>
    </div>
  );
}
