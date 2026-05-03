"""
Phase 0 — Preprocess analysis outputs into web-ready assets.

Reads from the sibling analysis repo (paths below) and writes into
public/assets/{meshes,data,nifti}/ inside this website repo.

Run from the website repo root:
    python scripts/phase0_preprocess.py

Outputs (committed; small, immutable per analysis):
    public/assets/meshes/atlas.glb              # all 246 regions, instanced by region_id
    public/assets/data/regions.json             # atlas metadata (id, name, lobe, hemi, network, MNI centroid)
    public/assets/data/region_stats.json        # per-region stats: mean_F/mean_M/SD/d/SHAP/membership
    public/assets/data/crossmodal_arcs.json     # the 4 cross-modal arcs (start MNI, end MNI)
    public/assets/data/classification.json      # per-fold metrics for the 8 models
    public/assets/nifti/cbf_female.nii.gz       # group-mean CBF map, female (for Niivue/volumetric)
    public/assets/nifti/cbf_male.nii.gz
    public/assets/nifti/shap_mean.nii.gz        # pre-rendered SHAP brain plots
    public/assets/nifti/shap_median.nii.gz
    public/assets/nifti/shap_morph.nii.gz
"""

from __future__ import annotations

import gzip
import json
import shutil
from pathlib import Path

import nibabel as nib
import numpy as np
import pandas as pd
from scipy import stats
from skimage import measure
import trimesh


# --- Paths ---------------------------------------------------------------

HERE = Path(__file__).resolve().parent
WEB_ROOT = HERE.parent
ANALYSIS_ROOT = WEB_ROOT.parent / "perfusion-xai"
PERFUSION_ROOT = WEB_ROOT.parent
BOX_ROOT = Path(
    "/Users/ninad/Library/CloudStorage/Box-Box/2025 Perfusion"
)

# Inputs
ATLAS_NII = ANALYSIS_ROOT / "resources" / "BN_Atlas_246_2mm.nii.gz"  # 2mm: lighter meshes
ATLAS_META_CSV = ANALYSIS_ROOT / "resources" / "brainnetome_updated.csv"
SHAP_MEAN_CSV = ANALYSIS_ROOT / "resources" / "SHAP_Summary" / "mean.csv"
SHAP_MEDIAN_CSV = ANALYSIS_ROOT / "resources" / "SHAP_Summary" / "median.csv"
SHAP_MAX_CSV = ANALYSIS_ROOT / "resources" / "SHAP_Summary" / "max.csv"
SHAP_MORPH_CSV = ANALYSIS_ROOT / "resources" / "SHAP_Summary" / "morph_sum.csv"
SHAP_MEAN_NII = ANALYSIS_ROOT / "resources" / "SHAP_brainplot" / "mean.nii.gz"
SHAP_MEDIAN_NII = ANALYSIS_ROOT / "resources" / "SHAP_brainplot" / "median.nii.gz"
SHAP_MORPH_NII = ANALYSIS_ROOT / "resources" / "SHAP_brainplot" / "morph.nii.gz"
CBF_FEMALE_NII = BOX_ROOT / "brainplot_nii" / "CBF_female.nii"
CBF_MALE_NII = BOX_ROOT / "brainplot_nii" / "CBF_male.nii"

# Per-subject ROI CBF (for SD → Cohen's d)
ROI_CBF_CSV = PERFUSION_ROOT / "Data" / "BrainnetomeROIs" / "isyb_nonlin_brainnetome.csv"
# Analysis-repo's labels file already has UniqueScanID as 'sub-XXXX' matching
# the ROI CSV's index. The /Data/Labels version has only numeric SubjectIDs.
LABELS_CSV = ANALYSIS_ROOT / "metadata" / "isyb.csv"

# Per-fold metrics
CBF_STATMODEL_CSV = ANALYSIS_ROOT / "resources" / "CBF_statmodel.csv"

# Outputs
OUT_MESH = WEB_ROOT / "public" / "assets" / "meshes"
OUT_DATA = WEB_ROOT / "public" / "assets" / "data"
OUT_NII = WEB_ROOT / "public" / "assets" / "nifti"


# --- Helpers -------------------------------------------------------------

def parse_shap_csv(path: Path) -> dict[int, int]:
    """SHAP summary CSVs have 2 lines: row1=ROI ids, row2=frequency out of 500."""
    with open(path) as f:
        ids = [int(x) for x in f.readline().strip().split(",")]
        freqs = [int(x) for x in f.readline().strip().split(",")]
    return dict(zip(ids, freqs))


def load_atlas_metadata() -> pd.DataFrame:
    df = pd.read_csv(ATLAS_META_CSV)
    # Normalize column names; brainnetome_updated has many — pick what we need
    keep = {
        "index": "id",
        "name": "name",
        "Label": "label",
        "lobe": "lobe",
        "hemi_x": "hemi",
        "gyrus.full": "gyrus",
        "subregion.full": "subregion",
        "Yeo_7network": "network7",
        "Our_7network": "our_network7",
        "x.mni": "x",
        "y.mni": "y",
        "z.mni": "z",
    }
    df = df[list(keep.keys())].rename(columns=keep)
    df["id"] = df["id"].astype(int)
    return df.sort_values("id").reset_index(drop=True)


def cohens_d(a: np.ndarray, b: np.ndarray) -> float:
    """Pooled-SD Cohen's d (a − b)."""
    na, nb = len(a), len(b)
    sa, sb = np.var(a, ddof=1), np.var(b, ddof=1)
    pooled = np.sqrt(((na - 1) * sa + (nb - 1) * sb) / (na + nb - 2))
    return float((np.mean(a) - np.mean(b)) / pooled) if pooled > 0 else 0.0


# --- Step 1: meshes per region -----------------------------------------

def extract_meshes(target_faces_per_region: int = 1500) -> dict[int, dict]:
    """
    Run marching cubes per atlas label, decimate, write a single GLB
    with one node per region. Returns {region_id: {centroid_voxel, n_voxels}}.
    """
    OUT_MESH.mkdir(parents=True, exist_ok=True)
    img = nib.load(ATLAS_NII)
    data = np.asanyarray(img.dataobj)
    affine = img.affine
    region_ids = sorted(int(v) for v in np.unique(data) if v > 0)
    print(f"Found {len(region_ids)} unique non-zero labels in atlas")

    geometries = []
    region_summary: dict[int, dict] = {}
    for rid in region_ids:
        mask = (data == rid).astype(np.uint8)
        if mask.sum() < 5:
            continue
        # Pad so isosurfaces close on the edges
        padded = np.pad(mask, 1, mode="constant")
        try:
            verts, faces, normals, _ = measure.marching_cubes(
                padded, level=0.5, allow_degenerate=False
            )
        except (ValueError, RuntimeError):
            continue
        verts -= 1.0  # undo pad

        # Voxel → world (MNI mm)
        verts_h = np.c_[verts, np.ones(len(verts))]
        verts_world = (affine @ verts_h.T).T[:, :3]

        mesh = trimesh.Trimesh(vertices=verts_world, faces=faces, process=True)
        # Decimate
        if len(mesh.faces) > target_faces_per_region:
            try:
                mesh = mesh.simplify_quadric_decimation(target_faces_per_region)
            except Exception:
                pass

        # Smooth lightly for nicer look
        try:
            mesh = trimesh.smoothing.filter_taubin(mesh, lamb=0.5, nu=-0.53, iterations=5)
        except Exception:
            pass

        # Tag the mesh node by region id so the GLB can be filtered in JS
        mesh.metadata["region_id"] = int(rid)
        geometries.append((rid, mesh))
        region_summary[rid] = {
            "n_voxels": int(mask.sum()),
            "n_faces": int(len(mesh.faces)),
            "centroid_world": mesh.centroid.tolist(),
        }

    # Write one combined GLB. Each region as a separate scene-graph node
    # so the JS side can address regions by name "roi_<id>".
    scene = trimesh.Scene()
    for rid, mesh in geometries:
        scene.add_geometry(mesh, node_name=f"roi_{rid:03d}")
    out = OUT_MESH / "atlas.glb"
    scene.export(out)
    print(f"Wrote {out} ({out.stat().st_size / 1024 / 1024:.1f} MB, "
          f"{len(geometries)} regions, "
          f"{sum(s['n_faces'] for s in region_summary.values())} total faces)")
    return region_summary


# --- Step 2: stats per region ------------------------------------------

def compute_stats(meta: pd.DataFrame) -> pd.DataFrame:
    """
    Per-region: mean_F, mean_M, SD_F, SD_M, t, p, Cohen's d, SHAP frequencies.
    """
    # Per-subject ROI CBF + sex labels
    roi_df = pd.read_csv(ROI_CBF_CSV, index_col=0)
    labels = pd.read_csv(LABELS_CSV)

    # Match subjects via UniqueScanID (which is already 'sub-XXXX' in the
    # analysis-repo labels file). Fall back to SubjectID if missing.
    if "UniqueScanID" in labels.columns:
        subj_to_sex = dict(zip(labels["UniqueScanID"].astype(str), labels["Gender"]))
    else:
        subj_to_sex = {
            f"sub-{int(row['SubjectID']):04d}": row["Gender"]
            for _, row in labels.iterrows()
        }
    matched = roi_df.index.isin(subj_to_sex)
    if matched.sum() == 0:
        print(f"WARN: no subject overlap between ROI CSV and labels.")
        print(f"  ROI sample IDs: {list(roi_df.index[:3])}")
        print(f"  Label sample IDs: {list(subj_to_sex.keys())[:3]}")
    roi_df = roi_df[matched]
    sex = roi_df.index.map(subj_to_sex)

    f_mask = sex == "F"
    m_mask = sex == "M"
    print(f"Cohort matched: {f_mask.sum()}F / {m_mask.sum()}M")

    # Compute per-ROI
    rows = []
    for col in roi_df.columns:
        try:
            rid = int(col)
        except ValueError:
            continue
        f_vals = roi_df.loc[f_mask, col].dropna().values
        m_vals = roi_df.loc[m_mask, col].dropna().values
        if len(f_vals) < 5 or len(m_vals) < 5:
            continue
        t, p = stats.ttest_ind(f_vals, m_vals, equal_var=False)
        d = cohens_d(f_vals, m_vals)
        rows.append({
            "id": rid,
            "mean_F": float(np.mean(f_vals)),
            "mean_M": float(np.mean(m_vals)),
            "sd_F": float(np.std(f_vals, ddof=1)),
            "sd_M": float(np.std(m_vals, ddof=1)),
            "t": float(t),
            "p": float(p),
            "cohens_d": d,
        })
    stats_df = pd.DataFrame(rows)

    # SHAP frequencies (out of 500)
    shap_mean = parse_shap_csv(SHAP_MEAN_CSV)
    shap_median = parse_shap_csv(SHAP_MEDIAN_CSV)
    shap_max = parse_shap_csv(SHAP_MAX_CSV)
    shap_morph = parse_shap_csv(SHAP_MORPH_CSV)

    stats_df["shap_mean_freq"] = stats_df["id"].map(shap_mean).fillna(0).astype(int)
    stats_df["shap_median_freq"] = stats_df["id"].map(shap_median).fillna(0).astype(int)
    stats_df["shap_max_freq"] = stats_df["id"].map(shap_max).fillna(0).astype(int)
    stats_df["shap_morph_freq"] = stats_df["id"].map(shap_morph).fillna(0).astype(int)

    # Membership flags
    consensus_30 = set(shap_mean) & set(shap_median)
    crossmodal_4 = consensus_30 & set(shap_morph)
    morph_28 = set(shap_morph)

    stats_df["in_consensus30"] = stats_df["id"].isin(consensus_30)
    stats_df["in_crossmodal4"] = stats_df["id"].isin(crossmodal_4)
    stats_df["in_morph28"] = stats_df["id"].isin(morph_28)

    print(f"Consensus-30: {sorted(consensus_30)}")
    print(f"Cross-modal-4: {sorted(crossmodal_4)}")
    print(f"Morph-28: {len(morph_28)}")

    return stats_df


# --- Step 3: write JSON manifests --------------------------------------

def write_manifests(meta: pd.DataFrame, stats_df: pd.DataFrame) -> None:
    OUT_DATA.mkdir(parents=True, exist_ok=True)

    # Atlas metadata
    regions = []
    for _, row in meta.iterrows():
        regions.append({
            "id": int(row["id"]),
            "name": row["name"],
            "label": str(row.get("label", row["name"])),
            "lobe": row.get("lobe", ""),
            "hemi": row.get("hemi", ""),
            "gyrus": row.get("gyrus", ""),
            "subregion": row.get("subregion", ""),
            "network7": row.get("network7", ""),
            "mni": [float(row["x"]), float(row["y"]), float(row["z"])],
        })
    (OUT_DATA / "regions.json").write_text(json.dumps(regions, indent=1))
    print(f"Wrote regions.json ({len(regions)} entries)")

    # Per-region stats
    stats_records = stats_df.to_dict(orient="records")
    (OUT_DATA / "region_stats.json").write_text(json.dumps(stats_records, indent=1))
    print(f"Wrote region_stats.json ({len(stats_records)} entries)")

    # Cross-modal arcs (start ↔ end MNI for the 4 hits)
    arcs = []
    crossmodal_ids = stats_df.loc[stats_df["in_crossmodal4"], "id"].tolist()
    meta_lookup = {int(r["id"]): r for _, r in meta.iterrows()}
    # Pair each cross-modal region with its homologue (or with itself if no pair).
    # The arcs visualize CBF-side ↔ morph-side for the SAME region across the
    # split brain — so endpoints are the same MNI coord on either hemisphere
    # of a duplicated brain. The renderer translates them into local space.
    for rid in crossmodal_ids:
        r = meta_lookup[rid]
        arcs.append({
            "id": int(rid),
            "name": r["name"],
            "mni": [float(r["x"]), float(r["y"]), float(r["z"])],
        })
    (OUT_DATA / "crossmodal_arcs.json").write_text(json.dumps(arcs, indent=1))
    print(f"Wrote crossmodal_arcs.json ({len(arcs)} arcs)")

    # Classification metrics
    if CBF_STATMODEL_CSV.exists():
        cls = pd.read_csv(CBF_STATMODEL_CSV)
        cls_records = cls.to_dict(orient="records")
        (OUT_DATA / "classification.json").write_text(json.dumps(cls_records, indent=1))
        print(f"Wrote classification.json ({len(cls_records)} fold-rows)")


# --- Step 4: copy NIfTI overlays --------------------------------------

def copy_niftis() -> None:
    OUT_NII.mkdir(parents=True, exist_ok=True)
    pairs = [
        (CBF_FEMALE_NII, "cbf_female.nii.gz"),
        (CBF_MALE_NII, "cbf_male.nii.gz"),
        (SHAP_MEAN_NII, "shap_mean.nii.gz"),
        (SHAP_MEDIAN_NII, "shap_median.nii.gz"),
        (SHAP_MORPH_NII, "shap_morph.nii.gz"),
    ]
    for src, name in pairs:
        if not src.exists():
            print(f"  skip (not found): {src}")
            continue
        dst = OUT_NII / name
        # CBF NIfTIs in Box are uncompressed; gzip them for web bandwidth
        if src.suffix == ".nii":
            with open(src, "rb") as fin, gzip.open(dst, "wb") as fout:
                shutil.copyfileobj(fin, fout)
        else:
            shutil.copyfile(src, dst)
        print(f"  {name}: {dst.stat().st_size / 1024:.0f} KB")


# --- Main --------------------------------------------------------------

def main():
    # Sanity check inputs exist
    required = [
        ATLAS_NII,
        ATLAS_META_CSV,
        SHAP_MEAN_CSV,
        SHAP_MEDIAN_CSV,
        SHAP_MORPH_CSV,
        ROI_CBF_CSV,
        LABELS_CSV,
    ]
    missing = [p for p in required if not p.exists()]
    if missing:
        print("Missing required inputs:")
        for p in missing:
            print(f"  {p}")
        raise SystemExit(1)

    print("== Step 1: extract meshes ==")
    extract_meshes(target_faces_per_region=1500)

    print("\n== Step 2: load metadata + compute stats ==")
    meta = load_atlas_metadata()
    stats_df = compute_stats(meta)

    print("\n== Step 3: write JSON manifests ==")
    write_manifests(meta, stats_df)

    print("\n== Step 4: copy NIfTI overlays ==")
    copy_niftis()

    print("\nDone. Assets in public/assets/.")


if __name__ == "__main__":
    main()
