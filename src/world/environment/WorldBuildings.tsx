/**
 * Pokémon 3D RPG — Stylized 3D Pokémon Buildings & City Architecture
 * 
 * Features:
 * - Iconic Pokémon-style structures:
 *   - Pokémon Center (Red pitched roof & Poké Ball emblem).
 *   - PokéMart (Blue sloped roof & storefront).
 *   - Modern Townhouses & Office towers with varied heights and rooftop AC units.
 * - Dynamic illuminated window materials reacting to Night / Dusk lighting.
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';

interface WorldBuildingsProps {
  isNight?: boolean;
}

export const WorldBuildings: React.FC<WorldBuildingsProps> = ({ isNight = false }) => {
  const windowEmissiveColor = isNight ? '#fbbf24' : '#1e293b';
  const windowEmissiveIntensity = isNight ? 1.2 : 0;

  const buildings = useMemo(() => [
    // 1. Pokémon Center (North-West Plaza)
    {
      x: -15,
      z: -14,
      w: 8,
      d: 7,
      h: 4.5,
      roofColor: '#ef4444',
      wallColor: '#f8fafc',
      type: 'POKECENTER',
    },
    // 2. PokéMart (North-East Plaza)
    {
      x: 15,
      z: -14,
      w: 7,
      d: 6,
      h: 4.2,
      roofColor: '#0284c7',
      wallColor: '#f1f5f9',
      type: 'POKEMART',
    },
    // 3. Residential Townhouses (South-West)
    { x: -16, z: 16, w: 6.5, d: 6.5, h: 5.5, roofColor: '#ea580c', wallColor: '#fef3c7', type: 'HOUSE' },
    { x: -25, z: 16, w: 7, d: 6, h: 6.8, roofColor: '#d97706', wallColor: '#ede9fe', type: 'APARTMENT' },
    { x: -16, z: 26, w: 6, d: 7, h: 7.5, roofColor: '#475569', wallColor: '#e2e8f0', type: 'TOWER' },

    // 4. Commercial District (South-East)
    { x: 16, z: 16, w: 7, d: 7, h: 8.5, roofColor: '#334155', wallColor: '#f8fafc', type: 'TOWER' },
    { x: 26, z: 16, w: 7.5, d: 6.5, h: 11, roofColor: '#1e293b', wallColor: '#e0f2fe', type: 'HIGH_RISE' },
    { x: 16, z: 26, w: 6.5, d: 7.5, h: 6.2, roofColor: '#0d9488', wallColor: '#ccfbf1', type: 'OFFICE' },

    // 5. Far North Perimeter Buildings
    { x: -28, z: -25, w: 8, d: 8, h: 9.5, roofColor: '#475569', wallColor: '#e2e8f0', type: 'TOWER' },
    { x: 28, z: -25, w: 8, d: 8, h: 10.5, roofColor: '#334155', wallColor: '#f1f5f9', type: 'TOWER' },
  ], []);

  return (
    <group>
      {buildings.map((b, idx) => (
        <group key={idx} position={[b.x, 0, b.z]}>
          {/* Main Building Body */}
          <mesh position={[0, b.h / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshStandardMaterial color={b.wallColor} roughness={0.7} />
          </mesh>

          {/* Roof Trim / Pitched Roof */}
          {b.type === 'POKECENTER' ? (
            <group position={[0, b.h, 0]}>
              <mesh position={[0, 0.6, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
                <coneGeometry args={[b.w * 0.65, 1.4, 4]} />
                <meshStandardMaterial color={b.roofColor} roughness={0.4} />
              </mesh>
              {/* Poké Ball Sign on Center */}
              <mesh position={[0, 0.4, b.d / 2 + 0.05]}>
                <circleGeometry args={[0.9, 24]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
              <mesh position={[0, 0.4, b.d / 2 + 0.06]}>
                <ringGeometry args={[0.3, 0.85, 24]} />
                <meshBasicMaterial color="#ef4444" />
              </mesh>
            </group>
          ) : b.type === 'POKEMART' ? (
            <group position={[0, b.h, 0]}>
              <mesh position={[0, 0.5, 0]} castShadow>
                <boxGeometry args={[b.w + 0.4, 0.8, b.d + 0.4]} />
                <meshStandardMaterial color={b.roofColor} roughness={0.4} />
              </mesh>
              {/* Storefront Awning */}
              <mesh position={[0, -1.2, b.d / 2 + 0.5]} rotation={[0.4, 0, 0]}>
                <boxGeometry args={[b.w * 0.7, 0.15, 1.2]} />
                <meshStandardMaterial color="#38bdf8" />
              </mesh>
            </group>
          ) : (
            /* Flat Modern Roof with Ledge & AC unit */
            <group position={[0, b.h, 0]}>
              <mesh position={[0, 0.1, 0]} castShadow>
                <boxGeometry args={[b.w + 0.3, 0.25, b.d + 0.3]} />
                <meshStandardMaterial color={b.roofColor} roughness={0.6} />
              </mesh>
              {/* Rooftop Unit */}
              <mesh position={[b.w * 0.2, 0.4, b.d * 0.2]} castShadow>
                <boxGeometry args={[1.2, 0.7, 1.2]} />
                <meshStandardMaterial color="#64748b" />
              </mesh>
            </group>
          )}

          {/* Windows (Illuminated at Night) */}
          <group position={[0, b.h / 2, b.d / 2 + 0.02]}>
            {[-1.5, 0, 1.5].map((wx, wIdx) => (
              <group key={wIdx} position={[wx, 0, 0]}>
                {[-1.2, 0.6].map((wy, wyIdx) => (
                  <mesh key={wyIdx} position={[0, wy, 0]}>
                    <planeGeometry args={[0.9, 1.1]} />
                    <meshStandardMaterial
                      color="#38bdf8"
                      emissive={windowEmissiveColor}
                      emissiveIntensity={windowEmissiveIntensity}
                      roughness={0.2}
                    />
                  </mesh>
                ))}
              </group>
            ))}
          </group>

          {/* Ground Entry Door */}
          <mesh position={[0, 1, b.d / 2 + 0.02]}>
            <planeGeometry args={[1.4, 2]} />
            <meshStandardMaterial color="#0f172a" roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
