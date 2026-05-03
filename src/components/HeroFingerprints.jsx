// Hero variant B (the wild card): the 30 consensus ROIs floating freely
// in 3D space, gently magnetic-attracted to the cursor.
//
// Medium-effort version: floating + cursor attraction + label tooltip on hover.
// (The high-effort version would also materialize a ghost brain when a region
// is hovered, snapping the region back into anatomical position. Skipped here.)

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Float, Html } from "@react-three/drei";
import * as THREE from "three";
import { palette } from "../lib/theme.js";
import { loadRegionStats, byId } from "../lib/data.js";

const ATLAS_URL = "/assets/meshes/atlas.glb";

export default function HeroFingerprints() {
  return (
    <div className="h-[70vh] min-h-[480px] relative bg-paper2 border border-ink/10 rounded-md">
      <Canvas
        camera={{ position: [0, 0, 280], fov: 30 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[100, 200, 200]} intensity={0.6} />
        <Suspense fallback={null}>
          <Fingerprints />
        </Suspense>
      </Canvas>
    </div>
  );
}

function Fingerprints() {
  const { scene } = useGLTF(ATLAS_URL);
  const [stats, setStats] = useState(null);
  const [hovered, setHovered] = useState(null);
  useEffect(() => {
    loadRegionStats().then((s) => setStats(byId(s)));
  }, []);

  // Pluck the 30 consensus meshes out of the scene; assign each a random anchor in 3D space.
  const items = useMemo(() => {
    if (!scene || !stats) return [];
    const out = [];
    scene.traverse((obj) => {
      if (!obj.isMesh) return;
      const m = obj.name.match(/roi_(\d+)/);
      if (!m) return;
      const id = parseInt(m[1], 10);
      const s = stats.get(id);
      if (!s?.in_consensus30) return;
      const angle = Math.random() * Math.PI * 2;
      const r = 80 + Math.random() * 40;
      const y = (Math.random() - 0.5) * 80;
      out.push({
        id,
        geometry: obj.geometry,
        anchor: new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r),
      });
    });
    return out;
  }, [scene, stats]);

  return (
    <group>
      {items.map((item) => (
        <Fingerprint
          key={item.id}
          item={item}
          hovered={hovered === item.id}
          setHovered={setHovered}
        />
      ))}
    </group>
  );
}

function Fingerprint({ item, hovered, setHovered }) {
  const meshRef = useRef();
  const { mouse, viewport } = useThree();

  useFrame(() => {
    if (!meshRef.current) return;
    // Magnetic attraction: cursor pulls the region toward it inversely with distance.
    const cursorWorld = new THREE.Vector3(
      (mouse.x * viewport.width) / 2,
      (mouse.y * viewport.height) / 2,
      0
    );
    const target = item.anchor.clone();
    const toCursor = cursorWorld.clone().sub(target);
    const dist = toCursor.length();
    const pull = THREE.MathUtils.clamp(40 / (dist + 20), 0, 0.5);
    target.add(toCursor.multiplyScalar(pull));
    meshRef.current.position.lerp(target, 0.06);

    // Slow drift
    meshRef.current.rotation.y += 0.003;
    meshRef.current.rotation.x += 0.001;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh
        ref={meshRef}
        geometry={item.geometry}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(item.id);
        }}
        onPointerOut={() => setHovered(null)}
      >
        <meshStandardMaterial
          color={hovered ? palette.highlight : palette.female}
          roughness={0.55}
          metalness={0}
        />
        {hovered && (
          <Html distanceFactor={120} position={[0, 12, 0]} className="pointer-events-none">
            <div className="px-2 py-1 bg-paper border border-ink/20 rounded font-mono text-xs">
              ROI {item.id}
            </div>
          </Html>
        )}
      </mesh>
    </Float>
  );
}

useGLTF.preload(ATLAS_URL);
