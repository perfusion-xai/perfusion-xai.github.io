// Hero variant A: a single brain that rotates slowly with the 30 consensus
// regions glowing in arterial red. The default, conservative hero.

import BrainnetomeAtlas from "./BrainnetomeAtlas.jsx";

export default function HeroRotating() {
  return (
    <div className="h-[70vh] min-h-[480px]">
      <BrainnetomeAtlas mode="shap-explode" className="h-full" />
    </div>
  );
}
