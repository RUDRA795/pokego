/**
 * Pokémon 3D RPG — Real-World Stylized 3D Landmarks (Nagpur Geodetic Features)
 * 
 * Features:
 * - Zero Mile Stone Monument (Central historic sandstone obelisk pillar with directional marker).
 * - Deekshabhoomi Great Stupa Dome (Monumental architectural white dome with golden spire).
 * - Sitabuldi Fort Heritage Ramparts (Raised stone battlement walls).
 * - Futala Promenade Waterfront Fountain.
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const WorldLandmarks: React.FC = () => {
  const fountainRef = useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (fountainRef.current) {
      const posAttr = fountainRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const array = posAttr.array as Float32Array;
      for (let i = 0; i < array.length / 3; i++) {
        array[i * 3 + 1] = 0.5 + Math.abs(Math.sin(t * 4 + i * 0.3)) * 1.8;
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* 1. ZERO MILE STONE MONUMENT (Center Historic Plaza) */}
      <group position={[0, 0, 0]}>
        {/* Hexagonal Stone Base */}
        <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[2.4, 2.8, 0.5, 6]} />
          <meshStandardMaterial color="#d4b996" roughness={0.8} />
        </mesh>
        {/* Tier 2 Plinth */}
        <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.5, 1.8, 0.4, 6]} />
          <meshStandardMaterial color="#c2a682" roughness={0.8} />
        </mesh>
        {/* Sandstone Obelisk Pillar */}
        <mesh position={[0, 2.2, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.65, 2.6, 6]} />
          <meshStandardMaterial color="#e5cca6" roughness={0.7} />
        </mesh>
        {/* Pinnacle Cap */}
        <mesh position={[0, 3.7, 0]} castShadow>
          <coneGeometry args={[0.38, 0.6, 6]} />
          <meshStandardMaterial color="#fcd34d" metalness={0.4} roughness={0.3} />
        </mesh>
      </group>

      {/* 2. DEEKSHABHOOMI STUPA (South-West Sacred Monument) */}
      <group position={[-38, 0, 35]}>
        {/* Circular Marble Terrace */}
        <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[9, 10, 1.2, 32]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.4} />
        </mesh>
        {/* Great White Stupa Dome */}
        <mesh position={[0, 4.5, 0]} castShadow>
          <sphereGeometry args={[6.5, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        {/* Golden Harmika & Spire */}
        <mesh position={[0, 11.2, 0]} castShadow>
          <boxGeometry args={[1.6, 0.8, 1.6]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.7} roughness={0.2} />
        </mesh>
        <mesh position={[0, 13.5, 0]} castShadow>
          <coneGeometry args={[0.6, 4, 16]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* 3. SITABULDI FORT BATTLEMENTS (North-West Raised Heritage Wall) */}
      <group position={[-42, 0, -38]}>
        {/* Hilltop Stone Base */}
        <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[16, 3, 10]} />
          <meshStandardMaterial color="#78716c" roughness={0.9} />
        </mesh>
        {/* Crenellated Ramparts */}
        {[-6, -3, 0, 3, 6].map((xOffset, idx) => (
          <mesh key={idx} position={[xOffset, 3.4, 4.6]} castShadow>
            <boxGeometry args={[1.5, 0.8, 0.8]} />
            <meshStandardMaterial color="#57534e" roughness={0.9} />
          </mesh>
        ))}
        {/* Fort Watchtower Spire */}
        <mesh position={[6, 4.5, 0]} castShadow>
          <cylinderGeometry args={[1.8, 2.2, 3.5, 12]} />
          <meshStandardMaterial color="#44403c" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
};
