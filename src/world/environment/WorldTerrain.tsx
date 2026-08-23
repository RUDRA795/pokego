/**
 * Pokémon 3D RPG — Stylized Pokémon Overworld Terrain & Tall Grass Engine
 * 
 * Features:
 * - Stylized multi-toned lush grass ground with soft grid accents.
 * - Dirt trails & pedestrian park pathways.
 * - Interactive rustling tall grass tufts with procedural wind sway.
 * - Distant perimeter hills for depth and horizon framing.
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const WorldTerrain: React.FC = () => {
  const tallGrassGroupRef = useRef<THREE.Group>(null);

  // Generate deterministic tall grass patch clusters
  const tallGrassTufts = useMemo(() => {
    const tufts: { x: number; z: number; scale: number; rot: number }[] = [];
    const clusters = [
      { cx: 8, cz: 8, count: 18, radius: 4 },
      { cx: -12, cz: 6, count: 22, radius: 5 },
      { cx: 14, cz: -14, count: 20, radius: 4.5 },
      { cx: -10, cz: -10, count: 16, radius: 3.5 },
      { cx: 22, cz: 4, count: 25, radius: 6 },
    ];

    clusters.forEach((c) => {
      for (let i = 0; i < c.count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * c.radius;
        tufts.push({
          x: c.cx + Math.cos(angle) * r,
          z: c.cz + Math.sin(angle) * r,
          scale: 0.7 + Math.random() * 0.5,
          rot: Math.random() * Math.PI,
        });
      }
    });
    return tufts;
  }, []);

  // Flower spots
  const flowers = useMemo(() => {
    const list: { x: number; z: number; color: string }[] = [];
    const colors = ['#f43f5e', '#fbbf24', '#a855f7', '#38bdf8', '#ffffff'];
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 3 + Math.random() * 25;
      list.push({
        x: Math.cos(angle) * dist,
        z: Math.sin(angle) * dist,
        color: colors[i % colors.length],
      });
    }
    return list;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (tallGrassGroupRef.current) {
      tallGrassGroupRef.current.children.forEach((child, idx) => {
        const sway = Math.sin(t * 3.5 + idx * 0.4) * 0.15;
        child.rotation.z = sway;
      });
    }
  });

  return (
    <group>
      {/* 1. Main Stylized Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[200, 200, 32, 32]} />
        <meshStandardMaterial color="#4ade80" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* 2. Soft Park Pathways & Ground Detail Patches */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} receiveShadow>
        <ringGeometry args={[16, 26, 32]} />
        <meshStandardMaterial color="#86efac" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]} receiveShadow>
        <ringGeometry args={[34, 46, 32]} />
        <meshStandardMaterial color="#22c55e" roughness={0.95} />
      </mesh>

      {/* 3. Park Dirt / Stone Circular Plaza */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
        <circleGeometry args={[4.5, 32]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.7} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <ringGeometry args={[4.4, 4.6, 32]} />
        <meshBasicMaterial color="#94a3b8" />
      </mesh>

      {/* 4. Tall Grass Tufts (Wild Pokémon Habitats) */}
      <group ref={tallGrassGroupRef}>
        {tallGrassTufts.map((tuft, idx) => (
          <group key={idx} position={[tuft.x, 0, tuft.z]} rotation={[0, tuft.rot, 0]} scale={tuft.scale}>
            {/* Blade 1 */}
            <mesh position={[0, 0.35, 0]} rotation={[0, 0, 0.1]} castShadow>
              <coneGeometry args={[0.08, 0.7, 5]} />
              <meshStandardMaterial color="#16a34a" roughness={0.6} />
            </mesh>
            {/* Blade 2 */}
            <mesh position={[-0.1, 0.3, 0.05]} rotation={[0.1, 0, -0.2]} castShadow>
              <coneGeometry args={[0.07, 0.6, 5]} />
              <meshStandardMaterial color="#22c55e" roughness={0.6} />
            </mesh>
            {/* Blade 3 */}
            <mesh position={[0.1, 0.25, -0.05]} rotation={[-0.1, 0, 0.25]} castShadow>
              <coneGeometry args={[0.06, 0.5, 5]} />
              <meshStandardMaterial color="#15803d" roughness={0.6} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 5. Wild Flower Dots */}
      {flowers.map((f, idx) => (
        <group key={idx} position={[f.x, 0.05, f.z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.12, 6]} />
            <meshBasicMaterial color={f.color} />
          </mesh>
          <mesh position={[0, 0.01, 0]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
        </group>
      ))}

      {/* 6. Distant Perimeter Rolling Hills */}
      <group position={[0, -2, 0]}>
        <mesh position={[0, 8, -80]} castShadow>
          <sphereGeometry args={[45, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#22c55e" roughness={0.9} />
        </mesh>
        <mesh position={[-75, 6, 0]} castShadow>
          <sphereGeometry args={[40, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#16a34a" roughness={0.9} />
        </mesh>
        <mesh position={[75, 7, 10]} castShadow>
          <sphereGeometry args={[42, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#15803d" roughness={0.9} />
        </mesh>
        <mesh position={[0, 9, 85]} castShadow>
          <sphereGeometry args={[48, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#16a34a" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
};
