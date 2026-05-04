import HeroSection from "./sections/00-Hero.jsx";
import TldrSection from "./sections/01-TLDR.jsx";
import WhatIsCbf from "./sections/02-WhatIsCBF.jsx";
import FingerprintSection from "./sections/03-Fingerprint.jsx";
import SexMorphSection from "./sections/04-SexMorph.jsx";
import CrossModalSection from "./sections/05-CrossModal.jsx";
import MethodsSection from "./sections/06-Methods.jsx";
import ResourcesSection from "./sections/07-Resources.jsx";

export default function App() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <TldrSection />
      <WhatIsCbf />
      <FingerprintSection />
      <SexMorphSection />
      <CrossModalSection />
      <MethodsSection />
      <ResourcesSection />
      <Footer />
    </main>
  );
}

function Footer() {
  return (
    <footer className="border-t border-ink/15 mt-24 py-10">
      <div className="max-w-wide mx-auto px-6 text-sm text-ink2 flex flex-wrap gap-6 justify-between">
        <div>
          Aithal · Sinha · Babu — Indian Institute of Science, Bengaluru
        </div>
        <div className="font-mono">
          <a href="#" className="hover:text-female">arXiv</a>
          {" · "}
          <a href="https://github.com/blackpearl006/superCBF" className="hover:text-female">code</a>
          {" · "}
          <a href="https://www.scidb.cn/en/detail?dataSetId=826407529641672704" className="hover:text-female">data (ISYB)</a>
        </div>
      </div>
    </footer>
  );
}
