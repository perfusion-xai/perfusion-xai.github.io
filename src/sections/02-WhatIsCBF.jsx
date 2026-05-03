import Section from "../components/Section.jsx";

export default function WhatIsCBF() {
  return (
    <Section
      id="cbf"
      eyebrow="Background · 30 seconds"
      title="What is CBF, and why ASL?"
      lede="Cerebral blood flow (CBF) is the volume of blood delivered per 100 grams of brain tissue per minute. Arterial spin labelling (ASL) measures it non-invasively by magnetically tagging arterial water and tracking its arrival in tissue."
    >
      <div className="grid md:grid-cols-12 gap-6 mt-6">
        <div className="md:col-span-7 max-w-prose space-y-4 text-base">
          <p>
            Healthy adults sit at <span className="font-mono">45–60 mL/100 g/min</span>. Females
            consistently run higher than males by roughly 10–15% across the lifespan, and the
            difference is driven by vascular tone — not metabolic demand — through estrogen-mediated
            nitric-oxide vasodilation.
          </p>
          <p>
            ASL is the only modality that yields absolute CBF in physical units without
            radioactive tracers or contrast agents. Unlike structural MRI, it is intrinsically
            independent of head size — so sex effects in CBF cannot be a body-volume artefact.
          </p>
        </div>
        <div className="md:col-span-5 bg-paper2 border border-ink/10 rounded-md p-6 text-sm">
          <div className="font-mono text-xs uppercase tracking-widest text-ink2 mb-3">
            Why this matters here
          </div>
          <p>
            Structural-MRI sex classifiers reach 80%+ on raw data but collapse to ~60% once
            intracranial-volume effects are properly removed. CBF is size-invariant, so its
            sex-discriminative signal is structurally distinct from morphometry — and that's
            what the rest of this site shows.
          </p>
        </div>
      </div>
    </Section>
  );
}
