import Section from "../components/Section.jsx";

const LINKS = [
  {
    title: "DATA-DRIVEN IDENTIFICATION OF SEX DIFFERENCES IN CEREBRAL BLOOD FLOW USING ARTERIAL SPIN LABELLING AND EXPLAINABLE ARTIFICIAL INTELLIGENCE",
    sub: "biorxiv",
    href: "https://doi.org/10.64898/2026.07.05.736642",
    note: "DOI: https://doi.org/10.64898/2026.07.05.736642",
  },
  {
    title: "Code",
    sub: "github.com/blackpearl006/perfusion-xai",
    href: "https://github.com/blackpearl006/perfusion-xai",
    note: "Analysis scripts, models, SHAP outputs",
  },
  {
    title: "Data",
    sub: "ISYB on Science Data Bank",
    href: "https://www.scidb.cn/en/detail?dataSetId=826407529641672704",
    note: "215 healthy young Chinese Han adults · public access",
  },
  {
    title: "Atlas",
    sub: "Brainnetome 246",
    href: "https://atlas.brainnetome.org/",
    note: "Connectivity-derived parcellation, Fan et al. 2016",
  },
];

export default function Resources() {
  return (
    <Section
      id="resources"
      eyebrow="Resources"
      title="Code, data, paper."
      lede="Everything used to produce this site is public. Each artifact below is independently citable."
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {LINKS.map((l) => (
          <a
            key={l.title}
            href={l.href}
            className="block bg-paper2 border border-ink/10 hover:border-female rounded-md p-5 transition-colors"
          >
            <div className="font-mono text-xs uppercase tracking-widest text-ink2">
              {l.title}
            </div>
            <div className="font-mono text-sm mt-2 break-all">{l.sub}</div>
            <div className="text-sm text-ink2 mt-3">{l.note}</div>
          </a>
        ))}
      </div>
    </Section>
  );
}
