// Hero variant B: the 30 consensus ROIs floating freely in 3D space, gently
// magnetic-attracted to the cursor. A faint ghost-brain in the background
// provides anatomical context. Hovering a fingerprint shows its name + lobe.

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Float, Html } from "@react-three/drei";
import * as THREE from "three";
import { palette, divergingColor } from "../lib/theme.js";
import { loadRegionStats, loadRegions, byId } from "../lib/data.js";

const ATLAS_URL = "/assets/meshes/atlas.glb";

export default function HeroFingerprints() {
  return (
    <div className="h-[70vh] min-h-[480px] relative bg-paper2 border border-ink/10 rounded-md overflow-hidden">
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
      <div className="absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-widest text-ink2 bg-paper/85 border border-ink/10 rounded px-2 py-1">
        30 consensus regions · cursor-magnetic · hover for name
      </div>
    </div>
  );
}

function Fingerprints() {
  const { scene } = useGLTF(ATLAS_URL);
  const [stats, setStats] = useState(null);
  const [meta, setMeta] = useState(null);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    Promise.all([loadRegionStats(), loadRegions()]).then(([s, r]) => {
      setStats(byId(s));
      setMeta(byId(r));
    });
  }, []);

  // Pluck the 30 consensus meshes out of the GLB scene, plus the rest as a
  // single faint ghost-brain mesh group for context.
  const { items, ghostMeshes } = useMemo(() => {
    if (!scene || !stats) return { items: [], ghostMeshes: [] };
    const items = [];
    const ghostMeshes = [];
    let i = 0;
    scene.traverse((obj) => {
      if (!obj.isMesh) return;
      const m = obj.name.match(/roi_(\d+)/);
      if (!m) return;
      const id = parseInt(m[1], 10);
      const s = stats.get(id);
      if (s?.in_consensus30) {
        // Distribute on a horizontal ring with some vertical jitter
        const angle = (i / 30) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        i += 1;
        const r = 95 + Math.random() * 25;
        const y = (Math.random() - 0.5) * 70;
        items.push({
          id,
          geometry: obj.geometry,
          anchor: new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r),
          d: s.cohens_d || 0,
        });
      } else {
        ghostMeshes.push(obj.geometry);
      }
    });
    return { items, ghostMeshes };
  }, [scene, stats]);

  const hoveredMeta = hovered && meta ? meta.get(hovered) : null;
  const hoveredStat = hovered && stats ? stats.get(hovered) : null;

  return (
    <>
      {/* Ghost brain for anatomical reference */}
      <GhostBrain meshes={ghostMeshes} />

      {/* The 30 floating fingerprints */}
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

      {/* HUD: hovered region info, anchored to top-left in screen space via Html */}
      {hoveredMeta && (
        <Html fullscreen>
          <div className="absolute top-3 left-3 bg-paper/95 border border-ink/15 rounded px-3 py-2 font-mono text-xs">
            <div className="text-female text-[13px]">{hoveredMeta.name}</div>
            <div className="text-ink2">{hoveredMeta.gyrus}</div>
            <div className="text-ink2">
              {hoveredMeta.lobe} {hoveredMeta.hemi} · {hoveredMeta.network7}
            </div>
            {hoveredStat && (
              <div className="text-ink2 mt-1">
                d = {hoveredStat.cohens_d.toFixed(2)} · SHAP {hoveredStat.shap_mean_freq}/500
              </div>
            )}
          </div>
        </Html>
      )}
    </>
  );
}

function GhostBrain({ meshes }) {
  const groupRef = useRef();
  // Centering offset — derived once from the union of meshes.
  const offset = useMemo(() => {
    if (!meshes.length) return new THREE.Vector3();
    const box = new THREE.Box3();
    for (const g of meshes) {
      g.computeBoundingBox?.();
      if (g.boundingBox) box.union(g.boundingBox);
    }
    const c = new THREE.Vector3();
    box.getCenter(c);
    return c;
  }, [meshes]);

  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.y += 0.0008;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {meshes.map((g, i) => (
        <mesh key={i} geometry={g} position={[-offset.x, -offset.y, -offset.z]}>
          <meshStandardMaterial
            color={BASE_GREY}
            transparent
            opacity={0.12}
            depthWrite={false}
          />
        </mesh>
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

    meshRef.current.rotation.y += 0.003;
    meshRef.current.rotation.x += 0.001;
  });

  // Color by Cohen's d so the variant carries effect-size info.
  const t = Math.max(-1, Math.min(1, item.d / 1.5));
  const baseColor = divergingColor(t);

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
          color={hovered ? palette.highlight : baseColor}
          roughness={0.55}
          metalness={0}
        />
      </mesh>
    </Float>
  );
}

const BASE_GREY = "#B8B0A4";

useGLTF.preload(ATLAS_URL);
