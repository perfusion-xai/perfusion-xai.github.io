// Hero variant B: the 30 consensus ROIs as small floating "fingerprints"
// positioned at their actual MNI centroid coordinates, slowly rotating as a
// constellation. Hover shows region info. Color = |Cohen's d| (sequential).
//
// This deliberately does NOT load the GLB scene — it only needs centroids +
// stats, so it can't break on shared-cache / parent-conflict issues like the
// earlier version. Each region is rendered as a small icosahedron sized by
// SHAP frequency.

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Html, Text } from "@react-three/drei";
import * as THREE from "three";
import { palette, sequentialColor } from "../lib/theme.js";
import { loadRegionStats, loadRegions, byId } from "../lib/data.js";

export default function HeroFingerprints() {
  return (
    <div className="h-[70vh] min-h-[480px] relative bg-paper2 border border-ink/10 rounded-md overflow-hidden">
      <Canvas
        camera={{ position: [120, 80, 180], fov: 32 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.75} />
        <directionalLight position={[100, 200, 200]} intensity={0.6} />
        <directionalLight position={[-100, -50, -200]} intensity={0.3} />
        <Suspense fallback={null}>
          <Constellation />
        </Suspense>
        <OrientationLabels />
      </Canvas>
      <div className="absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-widest text-ink2 bg-paper/85 border border-ink/10 rounded px-2 py-1">
        30 consensus regions · MNI positions · hover for name
      </div>
      <div className="absolute bottom-3 right-3 font-mono text-[10px] uppercase tracking-widest text-ink2 bg-paper/85 border border-ink/10 rounded px-2 py-1">
        L / R · A / P · S / I
      </div>
    </div>
  );
}

function Constellation() {
  const [stats, setStats] = useState(null);
  const [meta, setMeta] = useState(null);
  const [hovered, setHovered] = useState(null);
  const groupRef = useRef();

  useEffect(() => {
    Promise.all([loadRegionStats(), loadRegions()]).then(([s, r]) => {
      setStats(byId(s));
      setMeta(byId(r));
    });
  }, []);

  const items = useMemo(() => {
    if (!stats || !meta) return [];
    const out = [];
    for (const [id, s] of stats) {
      if (!s.in_consensus30) continue;
      const m = meta.get(id);
      if (!m || !m.mni) continue;
      out.push({
        id,
        pos: m.mni,
        d: s.cohens_d || 0,
        freq: s.shap_mean_freq || 0,
        name: m.name,
        gyrus: m.gyrus,
        lobe: m.lobe,
        hemi: m.hemi,
        network: m.network7,
      });
    }
    return out;
  }, [stats, meta]);

  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.y += 0.0015;
  });

  const hoveredItem = items.find((it) => it.id === hovered);

  return (
    <>
      <group ref={groupRef}>
        {items.map((item) => (
          <Node
            key={item.id}
            item={item}
            hovered={hovered === item.id}
            setHovered={setHovered}
          />
        ))}
        {/* Faint wireframe ellipsoid as anatomical "skull" reference */}
        <mesh>
          <sphereGeometry args={[78, 24, 16]} />
          <meshBasicMaterial color={palette.ink2} wireframe transparent opacity={0.06} />
        </mesh>
      </group>

      {hoveredItem && (
        <Html fullscreen>
          <div className="absolute top-3 left-3 bg-paper/95 border border-ink/15 rounded px-3 py-2 font-mono text-xs pointer-events-none">
            <div className="text-female text-[13px]">{hoveredItem.name}</div>
            <div className="text-ink2">{hoveredItem.gyrus}</div>
            <div className="text-ink2">
              {hoveredItem.lobe} · {hoveredItem.hemi} · {hoveredItem.network}
            </div>
            <div className="text-ink2 mt-1">
              d = {hoveredItem.d.toFixed(2)} · SHAP {hoveredItem.freq}/500
            </div>
          </div>
        </Html>
      )}
    </>
  );
}

function Node({ item, hovered, setHovered }) {
  // |d| → color sequential; SHAP freq → size (within sane bounds)
  const t = Math.max(0, Math.min(1, (Math.abs(item.d) - 0.3) / 1.2));
  const size = 3.5 + Math.min(4, item.freq / 120);

  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.4}>
      <mesh
        position={item.pos}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(item.id);
        }}
        onPointerOut={() => setHovered(null)}
        scale={hovered ? 1.4 : 1}
      >
        <icosahedronGeometry args={[size, 1]} />
        <meshStandardMaterial
          color={hovered ? palette.highlight : sequentialColor(t)}
          roughness={0.5}
          metalness={0.05}
        />
      </mesh>
    </Float>
  );
}

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
