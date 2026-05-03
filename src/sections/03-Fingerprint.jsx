import { useEffect, useState } from "react";
import Section from "../components/Section.jsx";
import BrainnetomeAtlas from "../components/BrainnetomeAtlas.jsx";
import { loadRegions, loadRegionStats, byId } from "../lib/data.js";

export default function FingerprintSection() {
  const [hovered, setHovered] = useState(null);
  const [regions, setRegions] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([loadRegions(), loadRegionStats()]).then(([r, s]) => {
      setRegions(byId(r));
      setStats(byId(s));
    });
  }, []);

  const region = hovered && regions ? regions.get(hovered) : null;
  const stat = hovered && stats ? stats.get(hovered) : null;

  return (
    <Section
      id="fingerprint"
      eyebrow="Result · 1"
      title="The 30 consensus regions."
      lede="SHAP attribution across 500 logistic-regression models — 100 iterations × 5-fold CV — selects 30 atlas regions whose mean CBF most strongly drives sex classification. They concentrate in the frontoparietal control (27%) and default mode (17%) networks."
    >
      <div className="grid md:grid-cols-12 gap-6 mt-6">
        <div className="md:col-span-8">
          <BrainnetomeAtlas mode="shap-explode" onHover={setHovered} className="h-[560px]" />
        </div>
        <aside className="md:col-span-4 bg-paper2 border border-ink/10 rounded-md p-6">
          <div className="font-mono text-xs uppercase tracking-widest text-ink2 mb-3">
            Hover the brain
          </div>
          {region ? (
            <div className="space-y-2 text-sm">
              <div className="font-mono text-base">{region.name}</div>
              <div className="text-ink2">
                {region.gyrus} · {region.lobe} {region.hemi}
              </div>
              <div className="font-mono text-ink2">{region.network7}</div>
              <hr className="my-3" />
              {stat && (
                <ul className="space-y-1 font-mono text-xs">
                  <li>mean CBF (F): <span className="text-female">{stat.mean_F.toFixed(1)}</span></li>
                  <li>mean CBF (M): <span className="text-male">{stat.mean_M.toFixed(1)}</span></li>
                  <li>Cohen's d: {stat.cohens_d.toFixed(2)}</li>
                  <li>SHAP freq (mean): {stat.shap_mean_freq}/500</li>
                  <li>in 30-consensus: {stat.in_consensus30 ? "yes" : "no"}</li>
                </ul>
              )}
            </div>
          ) : (
            <div className="text-sm text-ink2">
              Move your cursor onto the brain. Highlighted regions belong to the
              30-region consensus set; faded regions did not pass the binomial threshold.
            </div>
          )}
        </aside>
      </div>
    </Section>
  );
}
