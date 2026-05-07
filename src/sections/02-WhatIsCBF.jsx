import Section from "../components/Section.jsx";
import ReadMore from "../components/ReadMore.jsx";
import FigureModal from "../components/FigureModal.jsx";

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

          <ReadMore summary="More on the physics & physiology" className="pt-2">
            <p>
              <span className="font-mono">PCASL</span> (pseudo-continuous ASL) inverts arterial
              blood water below the imaging slab for ~1.5 s, then waits a post-labelling delay
              while the tag travels into the tissue. The resulting label–control difference is
              proportional to perfusion. With a calibration M0 image and the Buxton general kinetic
              model, that difference becomes absolute CBF in physical units —
              <span className="font-mono"> mL/100 g/min</span> — directly comparable across scanners,
              sites, and subjects, without normalisation tricks.
            </p>
            <p>
              The female-elevated baseline is well-replicated: it appears in PET-O15, ASL, and
              phase-contrast MRA, persists across menstrual phases, and is largest in
              association cortex. It tracks neither brain volume nor cerebral blood volume — both
              of which are higher in males — so it is genuinely a flow effect, not a plumbing
              artefact. A vascular-only mechanism (eNOS, oestradiol-modulated vasodilation,
              haematocrit) explains it more cleanly than a metabolic one.
            </p>
            <p>
              ASL also has a temporal sensitivity that BOLD lacks: it sees slow neuromodulatory
              tone, not stimulus-locked oxygenation transients. That is why it is the right modality
              for the question we are asking — <em>at rest, who has more flow where</em> — even
              though BOLD dominates fMRI at large.
            </p>
          </ReadMore>
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

          <ReadMore summary="The morphometry caveat" className="mt-4">
            <p className="text-sm">
              Morphometry-based sex classifiers — using cortical thickness, surface area, and
              subcortical volumes — derive most of their accuracy from global head/brain size.
              When intracranial volume is regressed out, balanced accuracy drops sharply
              (~60–70%). Many headline numbers in the literature do not apply this correction,
              which inflates apparent sex-classification performance.
            </p>
            <p className="text-sm">
              CBF avoids this confound by construction: the unit
              (<span className="font-mono">mL/100 g/min</span>) is normalised by tissue mass.
              That gives perfusion an automatic apples-to-apples advantage when the question is
              about <em>physiology</em>, not anatomy.
            </p>
          </ReadMore>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            <FigureModal
              src="assets/figures/manuscript/age_whole.png"
              alt="Mean CBF vs age, whole brain"
              label="Age trend · whole brain (18–30 y)"
              caption="Whole-brain mean CBF as a function of age, with LOWESS smoothers fit per sex (males: blue; females: red). Females exhibit consistently higher CBF than males across the 18–30 year range."
            />
            <FigureModal
              src="assets/figures/manuscript/age_cortical.png"
              alt="Mean CBF vs age, cortical compartment"
              label="Age trend · cortical"
              caption="Cortical mean CBF as a function of age, LOWESS per sex. Cortical compartments preserve the female-elevated baseline across young adulthood."
            />
            <FigureModal
              src="assets/figures/manuscript/age_subcortical.png"
              alt="Mean CBF vs age, subcortical compartment"
              label="Age trend · subcortical"
              caption="Subcortical mean CBF as a function of age, LOWESS per sex. Effect size is smaller (Cohen's d = 0.82) but the female-elevated pattern still holds."
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
