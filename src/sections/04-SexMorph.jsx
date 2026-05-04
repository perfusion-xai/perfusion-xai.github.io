import Section from "../components/Section.jsx";
import BrainViewer from "../components/BrainViewer.jsx";

export default function SexMorphSection() {
  return (
    <Section
      id="morph"
      eyebrow="Result · 2"
      title="Effect size, mapped."
      lede="Each voxel of every consensus region is colored by its Cohen's d for the female–male contrast. Whole-brain mean d = 1.28 (large); cortical mean = 1.30; subcortical = 0.82. Red voxels are female-elevated; blue voxels are male-elevated."
    >
      <div className="grid md:grid-cols-12 gap-6 mt-6">
        <div className="md:col-span-9">
          <BrainViewer
            staticSrc="assets/figures/fig_glass_cohensd.png"
            alt="Glass-brain projection of Cohen's d for the 30 consensus regions"
            caption="Cohen's d (female − male) · diverging colormap. 2D = nilearn projection · 3D = interactive atlas."
            mode="sex-morph"
            morph={1}
            title="Effect size, mapped"
            subtitle="Result · 2 · Cohen's d (female − male) · whole-brain mean d = 1.28"
          />
        </div>
        <aside className="md:col-span-3 bg-paper2 border border-ink/10 rounded-md p-6 text-sm">
          <div className="font-mono text-xs uppercase tracking-widest text-ink2 mb-3">
            Effect-size summary
          </div>
          <ul className="space-y-2 text-sm">
            <li>Whole brain: <span className="font-mono text-female">d = 1.28</span></li>
            <li>Cortical: <span className="font-mono">d = 1.30</span></li>
            <li>Subcortical: <span className="font-mono">d = 0.82</span></li>
          </ul>
          <hr className="my-4" />
          <p className="text-xs text-ink2">
            All consensus regions show female-elevated CBF; the diverging colormap
            emphasises magnitude differences within that one-sided pattern.
          </p>
        </aside>
      </div>
    </Section>
  );
}
