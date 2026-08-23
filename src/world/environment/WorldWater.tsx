/**
 * Pokémon 3D RPG — Stylized Animated Water Pond & Promenade
 * 
 * Features:
 * - Waterfront lake & canal with subtle animated sine wave ripples.
 * - Translucent cyan water material with soft depth transparency.
 * - Paved promenade stone perimeter.
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const WorldWater: React.FC = () => {
  const waterMeshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (waterMeshRef.current) {
      const mat = waterMeshRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.opacity = 0.82 + Math.sin(t * 1.5) * 0.05;
      }
    }
  });

  return (
    <group position={[28, 0, -28]}>
      {/* Stone Promenade Basin Edge */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[11.5, 13.5, 32]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.6} />
      </mesh>

      {/* Water Surface */}
      <mesh ref={waterMeshRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[12, 32]} />
        <meshStandardMaterial
          color="#06b6d4"
          roughness={0.1}
          metalness={0.2}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Water Lily Pads */}
      {[
        { x: -3, z: 2, scale: 0.8 },
        { x: 4, z: -3, scale: 1.1 },
        { x: 1, z: 5, scale: 0.9 },
        { x: -5, z: -4, scale: 1.0 },
      ].map((pad, idx) => (
        <mesh key={idx} position={[pad.x, 0.04, pad.z]} rotation={[-Math.PI / 2, 0, 0]} scale={pad.scale}>
          <circleGeometry args={[0.7, 16]} />
          <meshStandardMaterial color="#15803d" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
};
