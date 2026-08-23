/**
 * Pokémon 3D RPG — Stylized Pokémon World Trees, Bushes & Foliage
 * 
 * Features:
 * - Stylized low-poly trees with fluffy cloud-like foliage canopies.
 * - Procedural wind sway animation reacting to live weather.
 * - Instanced park bushes and sidewalk greenery along avenues.
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WorldVegetationProps {
  windIntensity?: number;
}

export const WorldVegetation: React.FC<WorldVegetationProps> = ({ windIntensity = 1.0 }) => {
  const foliageGroupRef = useRef<THREE.Group>(null);

  const treeLocations = useMemo(() => [
    // Sidewalk Trees North
    { x: -6.2, z: -10, scale: 1.1, color: '#22c55e' },
    { x: 6.2, z: -10, scale: 1.0, color: '#16a34a' },
    { x: -6.2, z: -20, scale: 1.2, color: '#15803d' },
    { x: 6.2, z: -20, scale: 1.15, color: '#22c55e' },

    // Sidewalk Trees South
    { x: -6.2, z: 10, scale: 1.05, color: '#16a34a' },
    { x: 6.2, z: 10, scale: 1.2, color: '#22c55e' },
    { x: -6.2, z: 20, scale: 1.1, color: '#15803d' },
    { x: 6.2, z: 20, scale: 1.0, color: '#16a34a' },

    // East-West Avenue Trees
    { x: -12, z: -6.2, scale: 1.0, color: '#22c55e' },
    { x: -22, z: -6.2, scale: 1.25, color: '#16a34a' },
    { x: 12, z: -6.2, scale: 1.1, color: '#15803d' },
    { x: 22, z: -6.2, scale: 1.15, color: '#22c55e' },

    { x: -12, z: 6.2, scale: 1.2, color: '#16a34a' },
    { x: -22, z: 6.2, scale: 1.05, color: '#22c55e' },
    { x: 12, z: 6.2, scale: 1.1, color: '#15803d' },
    { x: 22, z: 6.2, scale: 1.25, color: '#16a34a' },

    // Park Clusters
    { x: -10, z: -32, scale: 1.3, color: '#22c55e' },
    { x: -15, z: -30, scale: 1.4, color: '#15803d' },
    { x: 10, z: -32, scale: 1.35, color: '#16a34a' },
    { x: 15, z: -30, scale: 1.25, color: '#22c55e' },
  ], []);

  const bushes = useMemo(() => [
    { x: -7.5, z: -4, scale: 0.8 },
    { x: 7.5, z: -4, scale: 0.9 },
    { x: -7.5, z: 4, scale: 0.85 },
    { x: 7.5, z: 4, scale: 0.8 },
    { x: -4, z: -7.5, scale: 0.75 },
    { x: 4, z: -7.5, scale: 0.9 },
    { x: -4, z: 7.5, scale: 0.85 },
    { x: 4, z: 7.5, scale: 0.8 },
  ], []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (foliageGroupRef.current) {
      foliageGroupRef.current.children.forEach((child, idx) => {
        const sway = Math.sin(t * 2.2 + idx * 0.5) * 0.04 * windIntensity;
        child.rotation.z = sway;
        child.rotation.x = Math.cos(t * 1.8 + idx * 0.4) * 0.03 * windIntensity;
      });
    }
  });

  return (
    <group>
      {/* TREES */}
      <group ref={foliageGroupRef}>
        {treeLocations.map((tree, idx) => (
          <group key={idx} position={[tree.x, 0, tree.z]} scale={tree.scale}>
            {/* Trunk */}
            <mesh position={[0, 1.2, 0]} castShadow>
              <cylinderGeometry args={[0.22, 0.32, 2.4, 8]} />
              <meshStandardMaterial color="#78350f" roughness={0.9} />
            </mesh>

            {/* Tree Base Shadow */}
            <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[1.2, 16]} />
              <meshBasicMaterial color="#050811" transparent opacity={0.3} />
            </mesh>

            {/* Foliage Puffs (Stylized Cloud Spheres) */}
            <group position={[0, 2.8, 0]}>
              {/* Center Main Puff */}
              <mesh position={[0, 0.3, 0]} castShadow>
                <sphereGeometry args={[1.25, 10, 10]} />
                <meshStandardMaterial color={tree.color} roughness={0.7} />
              </mesh>
              {/* Top Puff */}
              <mesh position={[0, 0.9, 0]} castShadow>
                <sphereGeometry args={[0.9, 8, 8]} />
                <meshStandardMaterial color={tree.color} roughness={0.7} />
              </mesh>
              {/* Left & Right Puffs */}
              <mesh position={[-0.6, 0.1, 0.2]} castShadow>
                <sphereGeometry args={[0.8, 8, 8]} />
                <meshStandardMaterial color={tree.color} roughness={0.7} />
              </mesh>
              <mesh position={[0.6, 0.1, -0.2]} castShadow>
                <sphereGeometry args={[0.85, 8, 8]} />
                <meshStandardMaterial color={tree.color} roughness={0.7} />
              </mesh>
            </group>
          </group>
        ))}
      </group>

      {/* BUSHES */}
      {bushes.map((bush, idx) => (
        <group key={idx} position={[bush.x, 0, bush.z]} scale={bush.scale}>
          <mesh position={[0, 0.4, 0]} castShadow>
            <sphereGeometry args={[0.6, 8, 8]} />
            <meshStandardMaterial color="#16a34a" roughness={0.8} />
          </mesh>
          <mesh position={[0.3, 0.3, 0.1]} castShadow>
            <sphereGeometry args={[0.45, 8, 8]} />
            <meshStandardMaterial color="#15803d" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
