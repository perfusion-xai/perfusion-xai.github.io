# perfusion-xai.github.io

Companion website for **"Data-Driven Identification of Sex Differences in Cerebral Blood Flow Using Arterial Spin Labelling and Explainable Artificial Intelligence."**

Live: https://perfusion-xai.github.io/

## Stack

- Vite + React 18 (JSX)
- Tailwind CSS — Perfusion Print palette (cream paper, slate ink, arterial-red ↔ cool-blue, saffron highlight)
- Static figures: nilearn glass-brain projections (rendered ahead of time via `scripts/make_figures.py`)
- Interactive 3D atlas: React Three Fiber + drei, lazy-loaded only when the user toggles 2D → 3D so the initial bundle stays small (~160 KB)

No TypeScript, no test runner — this is a paper companion site.

## Project layout

```
.
├── index.html
├── package.json
├── public/
│   └── assets/
│       ├── meshes/          # atlas.glb (246 region meshes)
│       ├── data/            # regions.json, region_stats.json, ...
│       ├── figures/         # nilearn glass-brain PNGs (the 2D default)
│       └── nifti/           # CBF + SHAP NIfTI overlays
├── scripts/
│   ├── phase0_preprocess.py # build atlas.glb + regions.json + region_stats.json
│   ├── make_figures.py      # render the nilearn glass-brain PNGs
│   └── requirements.txt
├── src/
│   ├── App.jsx
│   ├── components/
│   │   ├── BrainViewer.jsx        # 2D/3D toggle wrapper (lazy-loads the 3D atlas)
│   │   ├── BrainnetomeAtlas.jsx   # interactive 3D viewer (R3F)
│   │   ├── GlassBrain.jsx         # static <img> figure wrapper
│   │   ├── ReadMore.jsx           # desktop-only collapsible
│   │   └── Section.jsx
│   ├── lib/{theme,data}.js
│   └── sections/00-Hero.jsx … 07-Resources.jsx
└── .github/workflows/deploy.yml
```

## Develop

```bash
npm install
npm run dev          # http://localhost:5173
```

## Generate data assets

The atlas, region metadata, and SHAP overlays are produced from the analysis
repo at `../perfusion-xai/` (clone of `blackpearl006/superCBF`).

```bash
pip install -r scripts/requirements.txt
python scripts/phase0_preprocess.py   # data + atlas.glb (run once)
python scripts/make_figures.py        # nilearn PNGs (re-run when stats change)
```

## Deploy

GitHub Actions builds on push to `main` and deploys to `gh-pages`.

```bash
npm run build
npx gh-pages -d dist -b gh-pages   # manual deploy
```

## License

Code: MIT. Manuscript figures and per-region statistics are derived from the
ISYB cohort and the analysis pipeline at https://github.com/blackpearl006/superCBF.
