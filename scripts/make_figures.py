"""Generate publication-grade nilearn figures for the website.

Outputs go to public/assets/figures/.

Figures:
  fig_glass_networks.png   — glass brain, 30 consensus regions colored by Yeo-7 network
  fig_glass_cohensd.png    — glass brain, 30 consensus regions colored by Cohen's d (diverging)
  fig_glass_crossmodal.png — glass brain, the 4 cross-modal regions
  fig_legend_networks.png  — categorical legend swatches (rendered separately so it's crisp)

Designed to look good on the cream Perfusion Print background.
"""
from pathlib import Path
import json
import numpy as np
import nibabel as nib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.colors import ListedColormap, Normalize, LinearSegmentedColormap
from nilearn import plotting, image

ROOT = Path(__file__).resolve().parent.parent
ATLAS = ROOT.parent / "perfusion-xai" / "resources" / "BN_Atlas_246_2mm.nii.gz"
DATA_DIR = ROOT / "public" / "assets" / "data"
OUT = ROOT / "public" / "assets" / "figures"
OUT.mkdir(parents=True, exist_ok=True)

PAPER = "#FAF7F2"
INK   = "#1A2332"
INK2  = "#5A6478"

NETWORK_COLORS = {
    "Visual":            "#1F77B4",
    "Somatomotor":       "#FF7F0E",
    "Dorsal Attention":  "#2CA02C",
    "Ventral Attention": "#D62728",
    "Limbic":            "#9467BD",
    "Frontoparietal":    "#17BECF",
    "Default":           "#E377C2",
    "SCGM":              "#BCBD22",
}

# Diverging colormap for Cohen's d — cool blue → cream → arterial red
DIV_CMAP = LinearSegmentedColormap.from_list(
    "perfusion_div",
    ["#1E5A8A", "#7AA0BD", "#EAE3D6", "#E5A29D", "#C8312B"],
    N=256,
)


def load_data():
    regions = json.load(open(DATA_DIR / "regions.json"))
    stats = json.load(open(DATA_DIR / "region_stats.json"))
    by_id = {r["id"]: r for r in regions}
    stats_by_id = {s["id"]: s for s in stats}
    return by_id, stats_by_id


def build_label_image(atlas_img, value_by_id, default=0.0):
    """Create a NIfTI image where each voxel of region <id> takes value_by_id[id]."""
    data = atlas_img.get_fdata().astype(np.int32)
    out = np.full(data.shape, default, dtype=np.float32)
    for rid, v in value_by_id.items():
        out[data == rid] = v
    return nib.Nifti1Image(out, atlas_img.affine)


def fig_glass_networks(atlas_img, regions, stats):
    """Categorical glass brain: 30 consensus regions colored by network."""
    # Map network name → integer code (1..N), 0 = background/transparent
    net_to_code = {n: i + 1 for i, n in enumerate(NETWORK_COLORS.keys())}
    value_by_id = {}
    for rid, s in stats.items():
        if not s["in_consensus30"]:
            continue
        net = regions[rid].get("network7") or "Default"
        value_by_id[rid] = float(net_to_code.get(net, len(NETWORK_COLORS)))

    img = build_label_image(atlas_img, value_by_id, default=0.0)

    cmap = ListedColormap(["#00000000"] + list(NETWORK_COLORS.values()))

    fig = plt.figure(figsize=(11, 4), facecolor=PAPER)
    display = plotting.plot_glass_brain(
        img,
        figure=fig,
        display_mode="lyrz",
        colorbar=False,
        cmap=cmap,
        vmin=0,
        vmax=len(NETWORK_COLORS),
        plot_abs=False,
        alpha=0.45,
        black_bg=False,
    )
    fig.savefig(OUT / "fig_glass_networks.png", dpi=200, facecolor=PAPER, bbox_inches="tight")
    plt.close(fig)
    print("wrote fig_glass_networks.png")


def fig_glass_cohensd(atlas_img, regions, stats):
    """Glass brain: 30 consensus regions colored by Cohen's d."""
    value_by_id = {}
    for rid, s in stats.items():
        if not s["in_consensus30"]:
            continue
        value_by_id[rid] = float(s["cohens_d"] or 0.0)

    img = build_label_image(atlas_img, value_by_id, default=0.0)
    arr = img.get_fdata()
    vmax = float(np.nanpercentile(np.abs(arr[arr != 0]), 98)) if (arr != 0).any() else 1.0
    vmax = max(vmax, 0.5)

    fig = plt.figure(figsize=(11, 4), facecolor=PAPER)
    plotting.plot_glass_brain(
        img,
        figure=fig,
        display_mode="lyrz",
        colorbar=True,
        cmap=DIV_CMAP,
        vmin=-vmax,
        vmax=vmax,
        plot_abs=False,
        alpha=0.6,
        black_bg=False,
    )
    fig.savefig(OUT / "fig_glass_cohensd.png", dpi=200, facecolor=PAPER, bbox_inches="tight")
    plt.close(fig)
    print("wrote fig_glass_cohensd.png")


def fig_glass_cbf30(atlas_img, regions, stats):
    """Glass brain: just the 30 CBF consensus regions, single arterial-red color."""
    value_by_id = {rid: 1.0 for rid, s in stats.items() if s.get("in_consensus30")}
    img = build_label_image(atlas_img, value_by_id, default=0.0)
    cmap = ListedColormap(["#00000000", "#C8312B"])
    fig = plt.figure(figsize=(11, 4), facecolor=PAPER)
    plotting.plot_glass_brain(
        img, figure=fig, display_mode="lyrz", colorbar=False,
        cmap=cmap, vmin=0, vmax=1, plot_abs=False, alpha=0.75, black_bg=False,
    )
    fig.savefig(OUT / "fig_glass_cbf30.png", dpi=200, facecolor=PAPER, bbox_inches="tight")
    plt.close(fig)
    print("wrote fig_glass_cbf30.png")


def fig_glass_morph28(atlas_img, regions, stats):
    """Glass brain: just the 28 morphometry biomarkers, single cool-blue color."""
    value_by_id = {rid: 1.0 for rid, s in stats.items() if s.get("in_morph28")}
    img = build_label_image(atlas_img, value_by_id, default=0.0)
    cmap = ListedColormap(["#00000000", "#1E5A8A"])
    fig = plt.figure(figsize=(11, 4), facecolor=PAPER)
    plotting.plot_glass_brain(
        img, figure=fig, display_mode="lyrz", colorbar=False,
        cmap=cmap, vmin=0, vmax=1, plot_abs=False, alpha=0.75, black_bg=False,
    )
    fig.savefig(OUT / "fig_glass_morph28.png", dpi=200, facecolor=PAPER, bbox_inches="tight")
    plt.close(fig)
    print("wrote fig_glass_morph28.png")


def fig_glass_crossmodal(atlas_img, regions, stats):
    """Glass brain: just the 4 cross-modal regions."""
    value_by_id = {}
    for rid, s in stats.items():
        if not s.get("in_crossmodal4"):
            continue
        value_by_id[rid] = 1.0

    img = build_label_image(atlas_img, value_by_id, default=0.0)

    cmap = ListedColormap(["#00000000", "#E89B2C"])

    fig = plt.figure(figsize=(11, 4), facecolor=PAPER)
    plotting.plot_glass_brain(
        img,
        figure=fig,
        display_mode="lyrz",
        colorbar=False,
        cmap=cmap,
        vmin=0,
        vmax=1,
        plot_abs=False,
        alpha=0.85,
        black_bg=False,
    )
    fig.savefig(OUT / "fig_glass_crossmodal.png", dpi=200, facecolor=PAPER, bbox_inches="tight")
    plt.close(fig)
    print("wrote fig_glass_crossmodal.png")


def fig_legend_networks():
    """Standalone categorical legend for network colors."""
    fig, ax = plt.subplots(figsize=(5.5, 3.0), facecolor=PAPER)
    ax.set_facecolor(PAPER)
    ax.axis("off")
    for i, (name, color) in enumerate(NETWORK_COLORS.items()):
        y = 1 - (i + 1) / (len(NETWORK_COLORS) + 1)
        ax.add_patch(plt.Rectangle((0.05, y - 0.025), 0.06, 0.05, color=color, transform=ax.transAxes))
        ax.text(0.16, y, name, transform=ax.transAxes, fontsize=11, color=INK, va="center", family="monospace")
    fig.savefig(OUT / "fig_legend_networks.png", dpi=200, facecolor=PAPER, bbox_inches="tight")
    plt.close(fig)
    print("wrote fig_legend_networks.png")


def main():
    print("Loading atlas:", ATLAS)
    atlas_img = nib.load(str(ATLAS))
    regions, stats = load_data()

    fig_glass_networks(atlas_img, regions, stats)
    fig_glass_cohensd(atlas_img, regions, stats)
    fig_glass_cbf30(atlas_img, regions, stats)
    fig_glass_morph28(atlas_img, regions, stats)
    fig_glass_crossmodal(atlas_img, regions, stats)
    fig_legend_networks()
    print("Done →", OUT)


if __name__ == "__main__":
    main()
