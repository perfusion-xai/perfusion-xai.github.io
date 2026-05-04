// The core 3D atlas component, used across multiple sections in different modes.
// Loads /assets/meshes/atlas.glb (one GLB containing 246 region meshes named "roi_<id>")
// and renders them with mode-specific colors / transforms.
//
// Modes:
//   "rest"           — all regions warm-grey, slow rotation
//   "shap-explode"   — consensus 30 regions colored by Cohen's d (diverging colormap),
//                      others dim grey; consensus regions slightly enlarged
//   "sex-morph"      — color = divergingColor(d × t), t in [-1, 1] driven by slider
//   "compare"        — CBF-only red, morph-only blue, both saffron, others dim grey

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Text } from "@react-three/drei";
import * as THREE from "three";
import { palette, divergingColor, sequentialColor } from "../lib/theme.js";
import { loadRegionStats, byId } from "../lib/data.js";

const ATLAS_URL = "/assets/meshes/atlas.glb";

export default function BrainnetomeAtlas({
  mode = "rest",
  morph = 0,
  highlight = null,
  onHover,
  className = "h-[520px]",
}) {
  const wrapRef = useRef(null);
  const [isFs, setIsFs] = useState(false);

  const toggleFullscreen = () => {
    if (!wrapRef.current) return;
    if (!document.fullscreenElement) {
      wrapRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  useEffect(() => {
    const onChange = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`relative bg-paper2 border border-ink/10 rounded-md overflow-hidden ${className}`}
    >
      <Canvas
        camera={{ position: [120, 80, 180], fov: 32 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[100, 200, 200]} intensity={0.7} />
        <directionalLight position={[-100, -50, -200]} intensity={0.3} />

        <AtlasMeshes
          mode={mode}
          morph={morph}
          highlight={highlight}
          onHover={onHover}
        />

        <OrientationLabels />

        <OrbitControls
          enablePan={false}
          minDistance={120}
          maxDistance={isFs ? 500 : 360}
          autoRotate={mode === "rest"}
          autoRotateSpeed={0.6}
        />
      </Canvas>

      {/* Top-right: fullscreen toggle */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-3 right-3 z-10 px-2 py-1 bg-paper/90 border border-ink/15 rounded text-xs font-mono uppercase tracking-widest hover:border-female"
        aria-label="Toggle fullscreen"
      >
        {isFs ? "exit ⤢" : "full ⤢"}
      </button>

      {/* Bottom-left: orientation legend */}
      <div className="absolute bottom-3 left-3 z-10 font-mono text-[10px] uppercase tracking-widest text-ink2 bg-paper/85 border border-ink/10 rounded px-2 py-1">
        L / R · A / P · S / I
      </div>
    </div>
  );
}

function AtlasMeshes({ mode, morph, highlight, onHover }) {
  const { scene: rawScene } = useGLTF(ATLAS_URL);
  const [stats, setStats] = useState(null);

  // useGLTF caches and returns the *same* scene instance across all callers.
  // Three.js disallows one Object3D in multiple scenes, so multiple
  // BrainnetomeAtlas instances would steal meshes from each other. Clone the
  // scene + materials so each instance owns its own copy. Geometries can stay
  // shared (they're not mutated, just referenced).
  const scene = useMemo(() => {
    if (!rawScene) return null;
    const cloned = rawScene.clone(true);
    cloned.traverse((obj) => {
      if (obj.isMesh) {
        obj.material = new THREE.MeshStandardMaterial({
          color: BASE_GREY,
          opacity: 0.85,
          transparent: false,
          roughness: 0.6,
          metalness: 0.0,
          side: THREE.DoubleSide,
        });
      }
    });
    // Center this clone (mutating its own position is safe, not the cache).
    const box = new THREE.Box3().setFromObject(cloned);
    const center = new THREE.Vector3();
    box.getCenter(center);
    cloned.position.sub(center);
    return cloned;
  }, [rawScene]);

  useEffect(() => {
    loadRegionStats().then((s) => setStats(byId(s)));
  }, []);

  // Apply per-region material based on mode + stats
  useEffect(() => {
    if (!scene || !stats) return;
    scene.traverse((obj) => {
      if (!obj.isMesh) return;
      const idMatch = obj.name.match(/roi_(\d+)/);
      if (!idMatch) return;
      const id = parseInt(idMatch[1], 10);
      const s = stats.get(id);
      const { color, opacity, scale } = materialFor(mode, s, morph, highlight, id);
      obj.material.color.set(color);
      obj.material.transparent = opacity < 1;
      obj.material.opacity = opacity;
      obj.material.needsUpdate = true;
      obj.scale.setScalar(scale);
      obj.userData.regionId = id;
    });
  }, [scene, stats, mode, morph, highlight]);

  // Pointer events for hover
  const handlePointerMove = (e) => {
    if (!onHover) return;
    e.stopPropagation();
    const id = e.object?.userData?.regionId ?? null;
    onHover(id);
  };
  const handlePointerOut = () => onHover && onHover(null);

  return (
    <group onPointerMove={handlePointerMove} onPointerOut={handlePointerOut}>
      {scene && <primitive object={scene} />}
    </group>
  );
}

// Visible-everywhere base color for non-highlighted regions, so the brain
// SHAPE is always readable against the cream page.
const BASE_GREY = "#B8B0A4";
const BASE_OPACITY = 0.55;

function materialFor(mode, s, morph, highlight, id) {
  const base = { color: BASE_GREY, opacity: BASE_OPACITY, scale: 1 };

  if (highlight === id) {
    return { color: palette.highlight, opacity: 1, scale: 1.05 };
  }
  if (!s) return base;

  if (mode === "rest") {
    return { color: BASE_GREY, opacity: 0.85, scale: 1 };
  }

  if (mode === "shap-explode") {
    if (s.in_consensus30) {
      // CBF sex effects are mostly female-positive — use a sequential
      // (cream → red) scale on |d| so within-30 magnitude differences are
      // actually visible, instead of compressing into a small slice of the
      // diverging map.
      const t = Math.max(0, Math.min(1, (Math.abs(s.cohens_d) - 0.3) / 1.2));
      const expand = 1 + Math.max(0, (s.shap_mean_freq - 289) / 1200);
      return { color: sequentialColor(t), opacity: 0.97, scale: expand };
    }
    return base;
  }

  if (mode === "sex-morph") {
    // Slider t in [-1, 1]: -1 = male-flavored, +1 = female-flavored.
    // Modulate by region's Cohen's d so high-d regions respond more.
    const t = Math.max(-1, Math.min(1, (s.cohens_d || 0) * morph * 0.8));
    return { color: divergingColor(t), opacity: 0.93, scale: 1 };
  }

  if (mode === "compare") {
    if (s.in_crossmodal4) return { color: palette.highlight, opacity: 1, scale: 1.05 };
    if (s.in_consensus30) return { color: palette.female, opacity: 0.88, scale: 1 };
    if (s.in_morph28) return { color: palette.male, opacity: 0.88, scale: 1 };
    return base;
  }

  return base;
}

// Anatomical orientation labels.
// MNI conventions for the Brainnetome atlas: x=L-R (−L/+R), y=P-A (−P/+A), z=I-S (−I/+S).
// After atlas re-centering, world axes match MNI axes.
function OrientationLabels() {
  const D = 100; // distance from origin for the labels
  return (
    <group>
      <OrientText position={[-D, 0, 0]} label="L" />
      <OrientText position={[ D, 0, 0]} label="R" />
      <OrientText position={[0, D + 10, 0]} label="A" />
      <OrientText position={[0, -(D + 10), 0]} label="P" />
      <OrientText position={[0, 0, D + 10]} label="S" />
      <OrientText position={[0, 0, -(D + 10)]} label="I" />
    </group>
  );
}

function OrientText({ position, label }) {
  return (
    <Text
      position={position}
      fontSize={9}
      color={palette.ink2}
      anchorX="center"
      anchorY="middle"
      depthOffset={-1}
    >
      {label}
    </Text>
  );
}

// Pre-load the GLB on mount of the module
useGLTF.preload(ATLAS_URL);
