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
  if (typeof window === "undefined") return { position: [200, 140, 320], fov: 30 };
  const w = window.innerWidth;
  if (w < 640) return { position: [240, 170, 400], fov: 34 };
  if (w < 1024) return { position: [220, 155, 360], fov: 32 };
  return { position: [200, 140, 320], fov: 30 };
}

export default function BrainnetomeAtlas({
  mode = "rest",
  morph = 0,
  highlight = null,
  onHover,
  className = "h-[520px]",
  label = null,
  sublabel = null,
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
    if (id != null && wrapRef.current) {
      const rect = wrapRef.current.getBoundingClientRect();
      setTooltipPos({ x: x - rect.left, y: y - rect.top });
    }
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
      className={`relative bg-white border border-ink/10 rounded-md overflow-hidden ${className}`}
    >
      <Canvas
        camera={camInit}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={["#ffffff"]} />
        <ambientLight intensity={0.85} />
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
          maxDistance={isFs ? 800 : 600}
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

      {/* Top-left: section label, only when fullscreen so non-FS views stay clean */}
      {isFs && (label || sublabel) && (
        <div className="absolute top-3 left-3 z-10 bg-paper/90 border border-ink/15 rounded px-3 py-2 max-w-md">
          {label && (
            <div className="text-ink text-sm tracking-editorial">{label}</div>
          )}
          {sublabel && (
            <div className="font-mono text-[10px] uppercase tracking-widest text-ink2 mt-0.5">
              {sublabel}
            </div>
          )}
        </div>
      )}

      {/* Top-right: fullscreen toggle */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-3 right-3 z-10 px-2 py-1 bg-paper/90 border border-ink/15 rounded text-xs font-mono uppercase tracking-widest hover:border-female"
        aria-label="Toggle fullscreen"
      >
        {isFs ? "exit ⤢" : "full ⤢"}
      </button>

      {/* Top-center: drag hint (shown briefly via CSS hover-only is excessive — just always show) */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 font-mono text-[10px] uppercase tracking-widest text-ink2 bg-paper/85 border border-ink/10 rounded px-2 py-1 pointer-events-none">
        drag to rotate · scroll to zoom · click axis to snap{isFs ? " · Esc to exit" : ""}
      </div>

      {/* Bottom-left: orientation legend */}
      <div className="absolute bottom-3 left-3 z-10 font-mono text-[10px] uppercase tracking-widest text-ink2 bg-paper/85 border border-ink/10 rounded px-2 py-1">
        L · R · A · P · S · I
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
            <div className="text-ink2 mt-1 space-y-0.5">
              <div>d = {hoveredStat.cohens_d.toFixed(2)} · p = {hoveredStat.p < 0.001 ? "<0.001" : hoveredStat.p.toFixed(3)}</div>
              {hoveredStat.shap_mean_freq > 0 ? (
                <div>
                  <span className={hoveredStat.in_consensus30 ? "text-female" : ""}>
                    SHAP {hoveredStat.shap_mean_freq}/500
                  </span>
                  {hoveredStat.in_consensus30 && " · consensus"}
                  {hoveredStat.in_crossmodal4 && " · cross-modal"}
                </div>
              ) : (
                <div className="text-ink2/70">not in consensus 30</div>
              )}
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
        // FrontSide + depthWrite=true: only the nearest fragment per pixel
        // passes the depth test, so 246 overlapping translucent meshes can't
        // accumulate alpha into a dark mud. Fragment alpha blends once,
        // against the cream paper. This is the standard "glass brain" idiom.
        obj.material = new THREE.MeshStandardMaterial({
          color: SHELL_COLOR,
          roughness: 0.55,
          metalness: 0.0,
          side: THREE.FrontSide,
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
      obj.material.depthWrite = true; // always — depth-test prevents stacking
      // Highlighted regions draw on top of the shell so deep regions
      // (subcortical, limbic) aren't hidden behind cortical glass.
      obj.material.depthTest = !spec.alwaysOnTop;
      obj.material.needsUpdate = true;
      obj.userData.regionId = id;
      obj.renderOrder = spec.alwaysOnTop ? 2 : 0;
      obj.scale.setScalar(spec.scale ?? 1);
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

// Light warm grey for the translucent "glass brain" shell. Visible against
// cream paper without dominating, leaves headroom for saturated overlays.
// Light cool grey at 30% alpha against pure white → reads as ~70% white shell.
const SHELL_COLOR = "#C8CCD2";
const SHELL_OPACITY = 0.30;

function materialFor(mode, s, m, morph, highlight, id) {
  const shell = { color: SHELL_COLOR, opacity: SHELL_OPACITY, scale: 1 };

  if (highlight === id) {
    return { color: palette.highlight, opacity: 1, scale: 1.06, alwaysOnTop: true };
  }
  if (!s) return shell;

  if (mode === "rest") {
    return shell;
  }

  if (mode === "shap-explode") {
    if (s.in_consensus30) {
      const net = m?.network7 || "Default";
      return {
        color: networkColors[net] || palette.female,
        opacity: 1,
        scale: 1.02,
        alwaysOnTop: true,
      };
    }
    return shell;
  }

  if (mode === "sex-morph") {
    const t = Math.max(-1, Math.min(1, (s.cohens_d || 0) * morph * 0.8));
    return { color: divergingColor(t), opacity: 1, scale: 1, alwaysOnTop: false };
  }

  if (mode === "compare") {
    if (s.in_crossmodal4)
      return { color: palette.highlight, opacity: 1, scale: 1.06, alwaysOnTop: true };
    if (s.in_consensus30)
      return { color: palette.female, opacity: 1, scale: 1.02, alwaysOnTop: true };
    if (s.in_morph28)
      return { color: palette.male, opacity: 1, scale: 1.02, alwaysOnTop: true };
    return shell;
  }

  return shell;
}

// Anatomical orientation labels in 3D world space.
// Brainnetome MNI: x = L(−)→R(+), y = P(−)→A(+), z = I(−)→S(+).
function OrientationLabels() {
  const D = 120;
  return (
    <group>
      <OrientText position={[-D, 0, 0]} label="L" />
      <OrientText position={[ D, 0, 0]} label="R" />
      <OrientText position={[0, D, 0]} label="A" />
      <OrientText position={[0, -D, 0]} label="P" />
      <OrientText position={[0, 0, D]} label="S" />
      <OrientText position={[0, 0, -D]} label="I" />
    </group>
  );
}

function OrientText({ position, label }) {
  return (
    <Text
      position={position}
      fontSize={20}
      fontWeight={700}
      color={palette.ink}
      outlineWidth={0.6}
      outlineColor="#ffffff"
      anchorX="center"
      anchorY="middle"
      depthTest={false}
      renderOrder={3}
    >
      {label}
    </Text>
  );
}

useGLTF.preload(ATLAS_URL);
