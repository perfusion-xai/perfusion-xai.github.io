// The core 3D atlas component, used across multiple sections in different modes.
// Loads /assets/meshes/atlas.glb (one GLB containing 246 region meshes named "roi_<id>")
// and renders them with mode-specific colors / transforms.
//
// Modes:
//   "rest"           — all regions warm-grey, slow rotation
//   "shap-explode"   — consensus 30 regions colored by Yeo-7 network (categorical),
//                      others rendered as a translucent "glass brain"
//   "sex-morph"      — color = divergingColor(d × t), t in [-1, 1] driven by slider
//   "compare"        — CBF-only red, morph-only blue, both saffron, others glass

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Text,
  GizmoHelper,
  GizmoViewport,
} from "@react-three/drei";
import * as THREE from "three";
import { palette, divergingColor, networkColors } from "../lib/theme.js";
import { loadRegionStats, loadRegions, byId } from "../lib/data.js";

const ATLAS_URL = "/assets/meshes/atlas.glb";

// Pick a camera distance that works on phones too (so L/R extremes are visible).
function initialCamera() {
  if (typeof window === "undefined") return { position: [120, 80, 180], fov: 32 };
  const w = window.innerWidth;
  if (w < 640) return { position: [140, 100, 240], fov: 38 };
  if (w < 1024) return { position: [130, 90, 210], fov: 34 };
  return { position: [120, 80, 180], fov: 32 };
}

export default function BrainnetomeAtlas({
  mode = "rest",
  morph = 0,
  highlight = null,
  onHover,
  className = "h-[520px]",
}) {
  const wrapRef = useRef(null);
  const [isFs, setIsFs] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [meta, setMeta] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([loadRegions(), loadRegionStats()]).then(([r, s]) => {
      setMeta(byId(r));
      setStats(byId(s));
    });
  }, []);

  const handleHover = (id, x, y) => {
    setHoveredId(id);
    if (id != null) setTooltipPos({ x, y });
    if (onHover) onHover(id);
  };

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

  const camInit = useMemo(initialCamera, []);
  const hoveredMeta = hoveredId != null && meta ? meta.get(hoveredId) : null;
  const hoveredStat = hoveredId != null && stats ? stats.get(hoveredId) : null;

  return (
    <div
      ref={wrapRef}
      className={`relative bg-paper2 border border-ink/10 rounded-md overflow-hidden ${className}`}
    >
      <Canvas
        camera={camInit}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.75} />
        <directionalLight position={[100, 200, 200]} intensity={0.7} />
        <directionalLight position={[-100, -50, -200]} intensity={0.3} />

        <AtlasMeshes
          mode={mode}
          morph={morph}
          highlight={highlight}
          onHover={handleHover}
        />

        <OrientationLabels />

        <OrbitControls
          enablePan={false}
          minDistance={120}
          maxDistance={isFs ? 600 : 480}
          autoRotate={mode === "rest"}
          autoRotateSpeed={0.6}
        />

        {/* Click-to-snap orientation gizmo (bottom-right of canvas) */}
        <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
          <GizmoViewport
            axisColors={[palette.female, "#2E8B57", palette.male]}
            labelColor={palette.paper}
          />
        </GizmoHelper>
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
        L / R · A / P · S / I  ·  click axes to snap 90°
      </div>

      {/* Hover tooltip */}
      {hoveredMeta && (
        <div
          className="pointer-events-none absolute z-20 bg-paper/95 border border-ink/15 rounded px-3 py-2 font-mono text-xs shadow-md"
          style={{
            left: Math.min(tooltipPos.x + 14, (wrapRef.current?.clientWidth || 600) - 240),
            top: Math.min(tooltipPos.y + 14, (wrapRef.current?.clientHeight || 400) - 100),
            maxWidth: 240,
          }}
        >
          <div className="text-female text-[13px]">{hoveredMeta.name}</div>
          <div className="text-ink2">{hoveredMeta.gyrus}</div>
          <div className="text-ink2">
            {hoveredMeta.lobe} · {hoveredMeta.hemi} · {hoveredMeta.network7}
          </div>
          {hoveredStat && (
            <div className="text-ink2 mt-1">
              d = {hoveredStat.cohens_d.toFixed(2)} · SHAP {hoveredStat.shap_mean_freq}/500
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AtlasMeshes({ mode, morph, highlight, onHover }) {
  const { scene: rawScene } = useGLTF(ATLAS_URL);
  const [stats, setStats] = useState(null);
  const [meta, setMeta] = useState(null);

  // useGLTF caches and returns the *same* scene Object3D across all callers.
  // Three.js disallows one Object3D in multiple scenes, so multiple
  // BrainnetomeAtlas instances would steal meshes from each other. Clone the
  // scene + materials so each instance owns its own copy.
  const scene = useMemo(() => {
    if (!rawScene) return null;
    const cloned = rawScene.clone(true);
    cloned.traverse((obj) => {
      if (obj.isMesh) {
        obj.material = new THREE.MeshStandardMaterial({
          color: BASE_GREY,
          roughness: 0.6,
          metalness: 0.0,
          side: THREE.DoubleSide,
        });
      }
    });
    const box = new THREE.Box3().setFromObject(cloned);
    const center = new THREE.Vector3();
    box.getCenter(center);
    cloned.position.sub(center);
    return cloned;
  }, [rawScene]);

  useEffect(() => {
    Promise.all([loadRegionStats(), loadRegions()]).then(([s, r]) => {
      setStats(byId(s));
      setMeta(byId(r));
    });
  }, []);

  // Apply per-region material based on mode + stats + meta
  useEffect(() => {
    if (!scene || !stats || !meta) return;
    scene.traverse((obj) => {
      if (!obj.isMesh) return;
      const idMatch = obj.name.match(/roi_(\d+)/);
      if (!idMatch) return;
      const id = parseInt(idMatch[1], 10);
      const s = stats.get(id);
      const m = meta.get(id);
      const spec = materialFor(mode, s, m, morph, highlight, id);
      obj.material.color.set(spec.color);
      obj.material.transparent = spec.opacity < 1;
      obj.material.opacity = spec.opacity;
      obj.material.depthWrite = spec.opacity >= 0.5; // glass = no depthWrite
      obj.material.needsUpdate = true;
      obj.userData.regionId = id;
      obj.renderOrder = spec.opacity >= 0.5 ? 1 : 0;
    });
  }, [scene, stats, meta, mode, morph, highlight]);

  const handlePointerMove = (e) => {
    if (!onHover) return;
    e.stopPropagation();
    const id = e.object?.userData?.regionId ?? null;
    onHover(id, e.clientX ?? e.nativeEvent?.clientX ?? 0, e.clientY ?? e.nativeEvent?.clientY ?? 0);
  };
  const handlePointerOut = () => onHover && onHover(null, 0, 0);

  return (
    <group onPointerMove={handlePointerMove} onPointerOut={handlePointerOut}>
      {scene && <primitive object={scene} />}
    </group>
  );
}

const BASE_GREY = "#B8B0A4";
const GLASS_OPACITY = 0.12;

function materialFor(mode, s, m, morph, highlight, id) {
  // "Glass brain" default — translucent, no depthWrite, so highlighted regions
  // pop against a faint full-shape silhouette.
  const glass = { color: BASE_GREY, opacity: GLASS_OPACITY };

  if (highlight === id) {
    return { color: palette.highlight, opacity: 1 };
  }
  if (!s) return glass;

  if (mode === "rest") {
    return { color: BASE_GREY, opacity: 0.85 };
  }

  if (mode === "shap-explode") {
    if (s.in_consensus30) {
      const net = m?.network7 || "Default";
      return { color: networkColors[net] || palette.female, opacity: 0.97 };
    }
    return glass;
  }

  if (mode === "sex-morph") {
    const t = Math.max(-1, Math.min(1, (s.cohens_d || 0) * morph * 0.8));
    return { color: divergingColor(t), opacity: 0.93 };
  }

  if (mode === "compare") {
    if (s.in_crossmodal4) return { color: palette.highlight, opacity: 1 };
    if (s.in_consensus30) return { color: palette.female, opacity: 0.92 };
    if (s.in_morph28) return { color: palette.male, opacity: 0.92 };
    return glass;
  }

  return glass;
}

// Anatomical orientation labels in 3D world space.
// Brainnetome MNI: x = L(−)→R(+), y = P(−)→A(+), z = I(−)→S(+).
function OrientationLabels() {
  const D = 100;
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

useGLTF.preload(ATLAS_URL);
