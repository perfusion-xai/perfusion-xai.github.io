// The core 3D atlas component, used across multiple sections in different modes.
// Loads /assets/meshes/atlas.glb (one GLB containing 246 region meshes named "roi_<id>")
// and renders them with mode-specific colors / transforms.
//
// Modes:
//   "rest"           — all regions warm-grey, slow rotation
//   "shap-explode"   — consensus 30 regions translated outward by |SHAP|, others wireframe
//   "sex-morph"      — color = divergingColor(d × t), t in [-1, 1] driven by slider
//   "compare"        — left half = CBF SHAP, right half = morphometry SHAP, with cross-modal arcs

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { palette, divergingColor } from "../lib/theme.js";
import { loadRegionStats, byId } from "../lib/data.js";

const ATLAS_URL = "/assets/meshes/atlas.glb";

export default function BrainnetomeAtlas({
  mode = "rest",
  morph = 0,             // sex-morph: -1 (male) ↔ +1 (female)
  highlight = null,      // optional region id to spotlight
  onHover,               // (regionId | null) => void
  className = "h-[520px]",
}) {
  return (
    <div className={`relative bg-paper2 border border-ink/10 rounded-md ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 220], fov: 35 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.65} />
        <directionalLight position={[100, 200, 200]} intensity={0.7} />
        <directionalLight position={[-100, -50, -200]} intensity={0.25} />

        <AtlasMeshes
          mode={mode}
          morph={morph}
          highlight={highlight}
          onHover={onHover}
        />

        <OrbitControls
          enablePan={false}
          minDistance={120}
          maxDistance={360}
          autoRotate={mode === "rest"}
          autoRotateSpeed={0.6}
        />
      </Canvas>
    </div>
  );
}

function AtlasMeshes({ mode, morph, highlight, onHover }) {
  const { scene } = useGLTF(ATLAS_URL);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadRegionStats().then((s) => setStats(byId(s)));
  }, []);

  const groupRef = useRef();
  // Center the atlas at world origin so MNI coords don't push everything off
  useEffect(() => {
    if (!scene) return;
    const box = new THREE.Box3().setFromObject(scene);
    const center = new THREE.Vector3();
    box.getCenter(center);
    scene.position.sub(center);
  }, [scene]);

  // Apply per-region material based on mode + stats
  useEffect(() => {
    if (!scene || !stats) return;
    scene.traverse((obj) => {
      if (!obj.isMesh) return;
      const idMatch = obj.name.match(/roi_(\d+)/);
      if (!idMatch) return;
      const id = parseInt(idMatch[1], 10);
      const s = stats.get(id);
      const { color, opacity, wireframe, scale } = materialFor(mode, s, morph, highlight, id);

      obj.material = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.55,
        metalness: 0.0,
        transparent: opacity < 1,
        opacity,
        wireframe,
        side: THREE.DoubleSide,
      });
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
    <group
      ref={groupRef}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
    >
      {scene && <primitive object={scene} />}
    </group>
  );
}

function materialFor(mode, s, morph, highlight, id) {
  const baseGrey = "#B8B0A4";
  const base = { color: baseGrey, opacity: 0.85, wireframe: false, scale: 1 };
  if (!s) return base;

  if (mode === "rest") {
    return base;
  }

  if (mode === "shap-explode") {
    if (s.in_consensus30) {
      return {
        color: palette.female,
        opacity: 0.95,
        wireframe: false,
        scale: 1 + (s.shap_mean_freq - 289) / 800, // gentle expansion for higher SHAP
      };
    }
    return { color: palette.ink2, opacity: 0.18, wireframe: true, scale: 1 };
  }

  if (mode === "sex-morph") {
    // morph in [-1, 1]: -1 = male-flavored, +1 = female-flavored
    // Shade by Cohen's d × morph so positions of the slider drive coloring.
    const t = Math.max(-1, Math.min(1, (s.cohens_d || 0) * morph));
    return {
      color: divergingColor(t),
      opacity: 0.92,
      wireframe: false,
      scale: 1,
    };
  }

  if (mode === "compare") {
    if (s.in_crossmodal4) {
      return { color: palette.highlight, opacity: 1, wireframe: false, scale: 1.05 };
    }
    if (s.in_consensus30) return { color: palette.female, opacity: 0.85, wireframe: false, scale: 1 };
    if (s.in_morph28) return { color: palette.male, opacity: 0.85, wireframe: false, scale: 1 };
    return { color: palette.ink2, opacity: 0.15, wireframe: true, scale: 1 };
  }

  return base;
}

// Pre-load the GLB on mount of the module
useGLTF.preload(ATLAS_URL);
