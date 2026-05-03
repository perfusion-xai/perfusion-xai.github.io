import Section from "../components/Section.jsx";

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
          215 healthy young adults from the public ISYB cohort (150 F / 95 M, 18–36 y, 3T GE MR750).
          Pre-QC n = 251; 36 excluded for motion or acquisition issues.
        </Step>
        <Step n="2" title="ASL → CBF → atlas">
          PCASL (1.875 × 1.875 × 3 mm), Oxford ASL toolbox quantification. Brainnetome atlas (246
          regions) registered through T1w into ASL-native space. Mean / median / max CBF extracted
          per region per subject.
        </Step>
        <Step n="3" title="Classifiers">
          Seven classical classifiers (LR, RF, XGB, LightGBM, SVM-lin, SVM-RBF, kNN) on regional
          CBF and on 666 FreeSurfer morphometry features. Plus a 2.1M-parameter 3D Simple Fully
          Convolutional Network on whole-brain CBF. Stratified 5-fold CV.
        </Step>
        <Step n="4" title="Explainability">
          SHAP LinearExplainer across 500 logistic-regression models (100 iterations × 5 folds).
          A region is selected if it appears in the top 20% of SHAP importance more often than the
          binomial threshold (p &lt; 0.05, Bonferroni-corrected for 246 ROIs). Grad-CAM via Captum
          for the 3D CNN.
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
      <p className="text-sm leading-snug max-w-prose">{children}</p>
    </li>
  );
}
