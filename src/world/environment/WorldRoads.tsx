/**
 * Pokémon 3D RPG — Procedural Stylized Roads, Sidewalks & Crossings
 * 
 * Features:
 * - North-South and East-West asphalt avenues with sidewalk curbs.
 * - Center dashed lane markings and zebra pedestrian crosswalks.
 * - Paved stone walkways connecting city landmarks and PokéStops.
 */

import React from 'react';
import * as THREE from 'three';

export const WorldRoads: React.FC = () => {
  return (
    <group position={[0, 0.01, 0]}>
      {/* 1. MAIN NORTH-SOUTH AVENUE */}
      {/* Asphalt Bed */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[7.5, 160]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>
      {/* Left Sidewalk */}
      <mesh position={[-4.5, 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.12, 160]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
      </mesh>
      {/* Right Sidewalk */}
      <mesh position={[4.5, 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.12, 160]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
      </mesh>

      {/* 2. MAIN EAST-WEST AVENUE */}
      {/* Asphalt Bed */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[160, 7.5]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>
      {/* Top Sidewalk */}
      <mesh position={[0, 0.06, -4.5]} castShadow receiveShadow>
        <boxGeometry args={[160, 0.12, 1.5]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
      </mesh>
      {/* Bottom Sidewalk */}
      <mesh position={[0, 0.06, 4.5]} castShadow receiveShadow>
        <boxGeometry args={[160, 0.12, 1.5]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
      </mesh>

      {/* 3. ZEBRA CROSSINGS AT CENTRAL INTERSECTION */}
      {/* North Crossing */}
      <group position={[0, 0.025, -6.5]}>
        {[-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((offset, idx) => (
          <mesh key={idx} position={[offset, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.55, 2]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}
      </group>

      {/* South Crossing */}
      <group position={[0, 0.025, 6.5]}>
        {[-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((offset, idx) => (
          <mesh key={idx} position={[offset, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.55, 2]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}
      </group>

      {/* West Crossing */}
      <group position={[-6.5, 0.025, 0]}>
        {[-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((offset, idx) => (
          <mesh key={idx} position={[0, 0, offset]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2, 0.55]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}
      </group>

      {/* East Crossing */}
      <group position={[6.5, 0.025, 0]}>
        {[-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((offset, idx) => (
          <mesh key={idx} position={[0, 0, offset]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2, 0.55]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}
      </group>

      {/* 4. DASHED CENTER LANE MARKINGS */}
      {/* North / South Dashes */}
      {[-50, -40, -30, -20, -12, 12, 20, 30, 40, 50].map((zPos, idx) => (
        <mesh key={`ns-${idx}`} position={[0, 0.025, zPos]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.2, 4.5]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
      ))}

      {/* East / West Dashes */}
      {[-50, -40, -30, -20, -12, 12, 20, 30, 40, 50].map((xPos, idx) => (
        <mesh key={`ew-${idx}`} position={[xPos, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[4.5, 0.2]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
      ))}
    </group>
  );
};
