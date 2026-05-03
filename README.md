# perfusion-xai.github.io

Companion website for **"Data-Driven Identification of Sex Differences in Cerebral Blood Flow Using Arterial Spin Labelling and Explainable Artificial Intelligence."**

Live: https://perfusion-xai.github.io/

## Stack

- Vite + React 18 (JSX)
- Tailwind CSS — Perfusion Print palette (cream paper, slate ink, arterial-red ↔ cool-blue, saffron highlight)
- React Three Fiber + drei for the interactive 3D Brainnetome atlas
- No TypeScript, no test runner, no Storybook — this is a paper companion site, kept deliberately minimal

## Project layout

```
.
├── index.html
├── package.json
├── public/
│   └── assets/
│       ├── meshes/          # atlas.glb (246 region meshes, generated)
│       ├── data/            # regions.json, region_stats.json, ...
│       └── nifti/           # CBF + SHAP NIfTI overlays
├── scripts/
│   ├── phase0_preprocess.py # generate everything in public/assets/
│   └── requirements.txt
├── src/
│   ├── App.jsx
│   ├── components/
│   │   ├── BrainnetomeAtlas.jsx
│   │   ├── HeroRotating.jsx
│   │   ├── HeroFingerprints.jsx
│   │   └── Section.jsx
│   ├── lib/
│   │   ├── theme.js
│   │   └── data.js
│   └── sections/00-Hero.jsx … 07-Resources.jsx
└── .github/workflows/deploy.yml
```

## Develop

```bash
npm install
npm run dev          # http://localhost:5173
```

## Generate data assets (Phase 0)

The 3D atlas, region metadata, and SHAP overlays are produced from the
analysis repo at `../perfusion-xai/` (clone of `blackpearl006/superCBF`)
plus group-mean NIfTIs from `~/Library/CloudStorage/Box-Box/2025 Perfusion`.

Run once before `npm run dev`:

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r scripts/requirements.txt
python scripts/phase0_preprocess.py
```

Outputs land in `public/assets/`. Re-run only when the analysis changes.

## Deploy

GitHub Actions builds on push to `main` and deploys to the `gh-pages` branch.
Local manual deploy:

```bash
npm run build
npx gh-pages -d dist -b gh-pages
```

## Hero variant switch

`src/App.jsx` has `const HERO_VARIANT = "ab"`. During development "ab" shows
both heroes (rotating brain + 30 fingerprints) side-by-side. Before deploy,
change to `"rotating"` or `"fingerprints"` to ship just one.

## License

Code: MIT. Manuscript figures and per-region statistics are derived from the
ISYB cohort and the analysis pipeline at https://github.com/blackpearl006/superCBF.
