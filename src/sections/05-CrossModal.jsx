import Section from "../components/Section.jsx";
import BrainViewer from "../components/BrainViewer.jsx";

export default function CrossModalSection() {
  return (
    <Section
      id="crossmodal"
      eyebrow="Result · 3"
      title="CBF and morphometry barely agree."
      lede="The 30 CBF biomarkers and 28 FreeSurfer morphometry biomarkers share only 4 regions (Jaccard 0.074). Perfusion and structure encode complementary aspects of sex-related brain organization."
    >
      {/* Side-by-side: CBF map · Morphometry map */}
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <BrainViewer
          staticSrc="assets/figures/fig_glass_cbf30.png"
          alt="30 CBF biomarker regions"
          caption="CBF · 30 regions"
          mode="shap-explode"
          title="CBF biomarkers"
          subtitle="Result · 3a · 30 regions selected by SHAP on mean CBF"
        />
        <BrainViewer
          staticSrc="assets/figures/fig_glass_morph28.png"
          alt="28 morphometry biomarker regions"
          caption="Morphometry · 28 regions"
          mode="compare"
          title="Morphometry biomarkers"
          subtitle="Result · 3b · 28 regions selected by SHAP on FreeSurfer cortical features"
        />
      </div>

      {/* Intersection: the 4 cross-modal hits */}
      <div className="grid md:grid-cols-12 gap-6 mt-4">
        <div className="md:col-span-9">
          <BrainViewer
            staticSrc="assets/figures/fig_glass_crossmodal.png"
            alt="The 4 cross-modal regions"
            caption="Intersection · the 4 regions selected by both modalities (saffron)"
            mode="compare"
            title="CBF ∩ morphometry"
            subtitle="Result · 3 · 4 cross-modal regions · Jaccard 0.074"
          />
        </div>
        <aside className="md:col-span-3 bg-paper2 border border-ink/10 rounded-md p-6 text-sm space-y-3">
          <div className="font-mono text-xs uppercase tracking-widest text-ink2">
            The 4 cross-modal hits
          </div>
          <ul className="font-mono text-xs space-y-1">
            <li><span className="text-highlight">A7r_L</span> — rostral SPL (left)</li>
            <li><span className="text-highlight">A39rd_L</span> — angular gyrus (left)</li>
            <li><span className="text-highlight">A39rd_R</span> — angular gyrus (right)</li>
            <li><span className="text-highlight">cLinG_R</span> — caudal lingual gyrus (right)</li>
          </ul>
          <hr />
          <ul className="space-y-1 text-xs">
            <li>CBF biomarkers: <span className="font-mono">30</span></li>
            <li>Morphometry biomarkers: <span className="font-mono">28</span></li>
            <li>Intersection: <span className="font-mono text-highlight">4</span></li>
            <li>Jaccard index: <span className="font-mono">0.074</span></li>
          </ul>
        </aside>
      </div>
    </Section>
  );
}
