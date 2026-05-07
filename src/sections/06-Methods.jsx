import Section from "../components/Section.jsx";
import FigureModal from "../components/FigureModal.jsx";

export default function MethodsSection() {
  return (
    <Section
      id="methods"
      eyebrow="Methods · in brief"
      title="Pipeline."
      lede="One paragraph for the time-pressed reader; the manuscript has the rest."
    >
      <ol className="grid md:grid-cols-2 gap-6 mt-6 max-w-wide">
        <Step n="1" title="Cohort">
          <p>
            215 healthy young adults from the public ISYB cohort (150 F / 95 M, 18–30 y, 3T GE MR750).
            Pre-QC n = 251; QC removed motion / acquisition outliers, yielding 215 (150 F / 95 M).
          </p>
        </Step>
        <Step n="2" title="ASL → CBF → atlas">
          <p>
            PCASL (1.875 × 1.875 × 3 mm), Oxford ASL toolbox quantification. Brainnetome atlas (246
            regions) registered through T1w into ASL-native space. Mean / median / max CBF extracted
            per region per subject.
          </p>
          <FigureModal
            className="mt-3"
            src="assets/figures/manuscript/fig2_prepro.png"
            alt="Multi-step CBF registration pipeline"
            label="View pipeline (Figure 2)"
            caption="Multi-step registration pipeline for atlas-based CBF quantification. (A) Forward transformation: ASL images registered to skull-stripped T1w using asl_reg; T1w linearly registered to 1 mm MNI152 space using FLIRT (12 DoF). (B) Inverse transformation for atlas mapping: the Brainnetome Atlas is transformed from MNI152 to subject-specific T1w space via convert_xfm, then to ASL space using the T1w-to-ASL matrix. (C) Final atlas alignment in ASL space (sagittal, coronal, axial) enabling voxel-level ROI matching."
          />
        </Step>
        <Step n="3" title="Classifiers">
          <p>
            Seven classical classifiers (LR, RF, XGB, LightGBM, SVM-lin, SVM-RBF, kNN) on regional
            CBF and on 666 FreeSurfer morphometry features. Plus a 2.1M-parameter 3D Simple Fully
            Convolutional Network on whole-brain CBF. Stratified 5-fold CV.
          </p>
          <FigureModal
            className="mt-3"
            src="assets/figures/manuscript/figS_sfcn.png"
            alt="SFCN-CBF deep network architecture"
            label="View SFCN-CBF architecture"
            caption="SFCN-CBF deep learning architecture. Modified Simple Fully Convolutional Network for voxel-wise sex classification from 3D CBF maps: three 3D conv layers (64, 128, 64 filters; kernel size 3) with max pooling, a 1×1×1 convolution, and global average pooling, totalling ~2.1 M trainable parameters."
          />
        </Step>
        <Step n="4" title="Explainability">
          <p>
            SHAP LinearExplainer across 500 logistic-regression models (100 iterations × 5 folds).
            A region is selected if it appears in the top 20% of SHAP importance more often than the
            binomial threshold (p &lt; 0.05, Bonferroni-corrected for 246 ROIs). Grad-CAM via Captum
            for the 3D CNN.
          </p>
          <FigureModal
            className="mt-3"
            src="assets/figures/manuscript/fig3_xai.png"
            alt="SHAP-based xAI pipeline"
            label="View xAI pipeline (Figure 3)"
            caption="Explainable AI pipeline for identifying sex-discriminative cerebral perfusion biomarkers. SHAP-based interpretation across 100 iterations of 5-fold CV on 215 subjects. Per-model top-20% SHAP regions are aggregated into a frequency map; binomial testing with Bonferroni correction selects regions in >289 of 500 models (p < 0.05) as significant ROIs."
          />
        </Step>
      </ol>
    </Section>
  );
}

function Step({ n, title, children }) {
  return (
    <li className="bg-paper2 border border-ink/10 rounded-md p-6">
      <div className="font-mono text-xs uppercase tracking-widest text-ink2">
        Step {n}
      </div>
      <h3 className="text-lg mt-2 mb-3">{title}</h3>
      <div className="text-sm leading-snug max-w-prose space-y-2">{children}</div>
    </li>
  );
}
