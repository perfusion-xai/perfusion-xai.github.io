import Section from "../components/Section.jsx";

const STATS = [
  { value: "0.91", label: "balanced accuracy", sub: "mean CBF · logistic regression · 5-fold CV" },
  { value: "0.95", label: "ROC-AUC", sub: "outperforming morphometry's 0.88" },
  { value: "30", label: "consensus regions", sub: "frontoparietal control + default mode dominant" },
];

export default function TLDR() {
  return (
    <Section
      id="tldr"
      eyebrow="TL;DR"
      title="In one breath."
      lede="Cerebral blood flow classifies biological sex in 215 healthy young adults at 91% balanced accuracy, matching a 2.1M-parameter 3D CNN with simple logistic regression on 246 atlas regions. Explainable AI converges on 30 regions concentrated in association-cortex networks — and they barely overlap with structural-MRI sex differences."
    >
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        {STATS.map((s) => (
          <div key={s.label} className="bg-paper2 border border-ink/10 rounded-md p-6">
            <div className="num text-5xl text-female">{s.value}</div>
            <div className="font-mono text-xs uppercase tracking-widest text-ink2 mt-3">
              {s.label}
            </div>
            <div className="text-sm mt-2">{s.sub}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}
