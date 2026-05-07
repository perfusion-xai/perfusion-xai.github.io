import Section from "../components/Section.jsx";
import BrainViewer from "../components/BrainViewer.jsx";
import FigureModal from "../components/FigureModal.jsx";
import ReadMore from "../components/ReadMore.jsx";

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

      <ReadMore summary="See the underlying distributions" className="mt-6">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <FigureModal
            src="assets/figures/manuscript/fig4_multiscale.png"
            alt="Multi-scale analysis of sex differences in cerebral perfusion"
            label="Multi-scale figure (global trends + per-region boxplots)"
            caption="Multi-scale analysis of sex differences in cerebral perfusion. (A) Global perfusion patterns: scatter plots of mean CBF vs. age for whole-brain, cortical, and subcortical compartments, with LOWESS smoothers per sex. (B) Local (regional) perfusion at SHAP-identified discriminative regions: box plots of mean CBF in males and females across the 30 consensus sex-discriminative regions (intersection of mean- and median-CBF SHAP analyses; p < 0.05, Bonferroni-corrected; appearing in >289 of 500 LR models). Region labels are colour-coded by lobe."
          />
          <FigureModal
            src="assets/figures/manuscript/gender_mean.png"
            alt="Whole-brain mean CBF, female vs male"
            label="Distribution · mean CBF (F vs M)"
            caption="Whole-brain mean CBF by sex. Welch's t = 9.29, p = 4.43×10⁻¹⁶, Cohen's d = 1.28 (large)."
          />
          <FigureModal
            src="assets/figures/manuscript/gender_median.png"
            alt="Whole-brain median CBF, female vs male"
            label="Distribution · median CBF (F vs M)"
            caption="Whole-brain median CBF by sex. Welch's t = 9.30, p = 4.36×10⁻¹⁶, Cohen's d = 1.28 (large)."
          />
          <FigureModal
            src="assets/figures/manuscript/gender_max.png"
            alt="Whole-brain max CBF, female vs male"
            label="Distribution · max CBF (F vs M)"
            caption="Whole-brain maximum CBF by sex. Student's t = 3.89, p = 1.36×10⁻⁴, Cohen's d = 0.60 (medium)."
          />
        </div>
      </ReadMore>
    </Section>
  );
}
