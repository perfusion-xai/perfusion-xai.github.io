import Section from "../components/Section.jsx";
import BrainnetomeAtlas from "../components/BrainnetomeAtlas.jsx";

export default function CrossModalSection() {
  return (
    <Section
      id="crossmodal"
      eyebrow="Result · 3"
      title="CBF and morphometry barely agree."
      lede="The 30 CBF biomarkers and 28 FreeSurfer-morphometry biomarkers share only 4 regions (Jaccard 0.074). Perfusion and structure encode complementary aspects of sex-related brain organization."
    >
      <div className="grid md:grid-cols-12 gap-6 mt-6">
        <div className="md:col-span-8">
          <BrainnetomeAtlas mode="compare" className="h-[520px]" />
        </div>
        <aside className="md:col-span-4 bg-paper2 border border-ink/10 rounded-md p-6 text-sm space-y-3">
          <div className="font-mono text-xs uppercase tracking-widest text-ink2">
            Legend
          </div>
          <Legend color="bg-female" label="CBF-only (26 regions)" />
          <Legend color="bg-male" label="Morph-only (24 regions)" />
          <Legend color="bg-highlight" label="Both modalities (4 regions)" />

          <hr />
          <div className="font-mono text-xs uppercase tracking-widest text-ink2">
            The 4 cross-modal hits
          </div>
          <ul className="font-mono text-xs space-y-1">
            <li><span className="text-highlight">A7r_L</span> — rostral SPL (left)</li>
            <li><span className="text-highlight">A39rd_L</span> — angular gyrus (left)</li>
            <li><span className="text-highlight">A39rd_R</span> — angular gyrus (right)</li>
            <li><span className="text-highlight">cLinG_R</span> — caudal lingual gyrus (right)</li>
          </ul>
          <p className="text-ink2">
            Three of four are parietal-association regions; the fourth is a primary visual region.
          </p>
        </aside>
      </div>
    </Section>
  );
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`inline-block w-4 h-4 rounded-sm ${color}`} />
      <span>{label}</span>
    </div>
  );
}
