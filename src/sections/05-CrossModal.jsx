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
      <div className="grid md:grid-cols-12 gap-6 mt-6">
        <div className="md:col-span-9">
          <BrainViewer
            staticSrc="assets/figures/fig_glass_crossmodal.png"
            alt="Glass-brain projection of the 4 cross-modal regions"
            caption="The 4 regions selected by both modalities (saffron). 2D = nilearn projection · 3D = interactive atlas."
            mode="compare"
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
