import { useState } from "react";
import Section from "../components/Section.jsx";
import BrainnetomeAtlas from "../components/BrainnetomeAtlas.jsx";

export default function SexMorphSection() {
  const [t, setT] = useState(0); // -1 (male) ↔ +1 (female)

  return (
    <Section
      id="morph"
      eyebrow="Result · 2"
      title="The discriminative pattern, made tangible."
      lede="Drag the slider. Each region is colored by its Cohen's d for the female–male contrast, weighted by your slider position. Regions that genuinely differ between sexes light up; regions that don't stay paper-coloured."
    >
      <div className="grid md:grid-cols-12 gap-6 mt-6">
        <div className="md:col-span-8">
          <BrainnetomeAtlas mode="sex-morph" morph={t} className="h-[520px]" />
        </div>
        <aside className="md:col-span-4 bg-paper2 border border-ink/10 rounded-md p-6">
          <div className="font-mono text-xs uppercase tracking-widest text-ink2 mb-3">
            Morph
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-male">M</span>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.01"
              value={t}
              onChange={(e) => setT(parseFloat(e.target.value))}
              className="flex-1 accent-female"
              aria-label="Sex morph slider"
            />
            <span className="font-mono text-female">F</span>
          </div>
          <div className="text-sm mt-4 text-ink2">
            <p>
              Morph value: <span className="font-mono">{t.toFixed(2)}</span>
            </p>
            <p className="mt-3">
              Whole-brain mean Cohen's <em>d</em> = <span className="font-mono text-female">1.28</span> (large).
              Cortical mean = <span className="font-mono">1.30</span>; subcortical = <span className="font-mono">0.82</span>.
            </p>
          </div>
        </aside>
      </div>
    </Section>
  );
}
