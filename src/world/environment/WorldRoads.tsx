/**
 * Pokémon 3D RPG — Procedural Stylized Roads, Sidewalks, Street Benches & Props
 * 
 * Features:
 * - North-South and East-West asphalt avenues with sidewalk curbs.
 * - Center dashed yellow lane markings and zebra pedestrian crosswalks.
 * - Street props: Modern park benches, traffic light posts, fire hydrants, bollards.
 */

import React from 'react';
import * as THREE from 'three';

export const WorldRoads: React.FC = () => {
  // Street Benches along sidewalks
  const benches = [
    { x: -5.2, z: -14, rot: Math.PI / 2 },
    { x: 5.2, z: -14, rot: -Math.PI / 2 },
    { x: -5.2, z: 14, rot: Math.PI / 2 },
    { x: 5.2, z: 14, rot: -Math.PI / 2 },
    { x: -14, z: -5.2, rot: 0 },
    { x: 14, z: -5.2, rot: 0 },
    { x: -14, z: 5.2, rot: Math.PI },
    { x: 14, z: 5.2, rot: Math.PI },
  ];

  // Traffic Signal Poles at 4 corners of intersection
  const trafficSignals = [
    { x: -5.5, z: -5.5 },
    { x: 5.5, z: -5.5 },
    { x: -5.5, z: 5.5 },
    { x: 5.5, z: 5.5 },
  ];

  // Fire Hydrants (Red stylized props)
  const hydrants = [
    { x: -5.4, z: -9 },
    { x: 5.4, z: 9 },
  ];

  return (
    <group position={[0, 0.01, 0]}>
      {/* 1. MAIN NORTH-SOUTH AVENUE */}
      {/* Asphalt Bed */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8.0, 180]} />
        <meshStandardMaterial color="#1e293b" roughness={0.75} />
      </mesh>
      {/* Left Sidewalk */}
      <mesh position={[-4.8, 0.07, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.14, 180]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.65} />
      </mesh>
      {/* Right Sidewalk */}
      <mesh position={[4.8, 0.07, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.14, 180]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.65} />
      </mesh>

      {/* 2. MAIN EAST-WEST AVENUE */}
      {/* Asphalt Bed */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[180, 8.0]} />
        <meshStandardMaterial color="#1e293b" roughness={0.75} />
      </mesh>
      {/* Top Sidewalk */}
      <mesh position={[0, 0.07, -4.8]} castShadow receiveShadow>
        <boxGeometry args={[180, 0.14, 1.6]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.65} />
      </mesh>
      {/* Bottom Sidewalk */}
      <mesh position={[0, 0.07, 4.8]} castShadow receiveShadow>
        <boxGeometry args={[180, 0.14, 1.6]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.65} />
      </mesh>

      {/* 3. ZEBRA CROSSINGS AT CENTRAL INTERSECTION */}
      {/* North Crossing */}
      <group position={[0, 0.025, -7]}>
        {[-3, -1.8, -0.6, 0.6, 1.8, 3].map((offset, idx) => (
          <mesh key={idx} position={[offset, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.65, 2.2]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}
      </group>

      {/* South Crossing */}
      <group position={[0, 0.025, 7]}>
        {[-3, -1.8, -0.6, 0.6, 1.8, 3].map((offset, idx) => (
          <mesh key={idx} position={[offset, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.65, 2.2]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}
      </group>

      {/* West Crossing */}
      <group position={[-7, 0.025, 0]}>
        {[-3, -1.8, -0.6, 0.6, 1.8, 3].map((offset, idx) => (
          <mesh key={idx} position={[0, 0, offset]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.2, 0.65]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}
      </group>

      {/* East Crossing */}
      <group position={[7, 0.025, 0]}>
        {[-3, -1.8, -0.6, 0.6, 1.8, 3].map((offset, idx) => (
          <mesh key={idx} position={[0, 0, offset]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.2, 0.65]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}
      </group>

      {/* 4. DASHED CENTER LANE MARKINGS */}
      {[-60, -50, -40, -30, -20, -13, 13, 20, 30, 40, 50, 60].map((zPos, idx) => (
        <mesh key={`ns-${idx}`} position={[0, 0.025, zPos]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.22, 4.8]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
      ))}

      {[-60, -50, -40, -30, -20, -13, 13, 20, 30, 40, 50, 60].map((xPos, idx) => (
        <mesh key={`ew-${idx}`} position={[xPos, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[4.8, 0.22]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
      ))}

      {/* 5. STREET PROPS */}
      {/* Modern Benches */}
      {benches.map((b, idx) => (
        <group key={`bench-${idx}`} position={[b.x, 0.14, b.z]} rotation={[0, b.rot, 0]}>
          {/* Wooden Planks */}
          <mesh position={[0, 0.25, 0]} castShadow>
            <boxGeometry args={[1.2, 0.06, 0.45]} />
            <meshStandardMaterial color="#854d0e" roughness={0.7} />
          </mesh>
          {/* Backrest */}
          <mesh position={[0, 0.5, -0.18]} rotation={[0.1, 0, 0]} castShadow>
            <boxGeometry args={[1.2, 0.4, 0.05]} />
            <meshStandardMaterial color="#854d0e" roughness={0.7} />
          </mesh>
          {/* Metal Legs */}
          <mesh position={[-0.5, 0.12, 0]} castShadow>
            <boxGeometry args={[0.08, 0.24, 0.4]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} />
          </mesh>
          <mesh position={[0.5, 0.12, 0]} castShadow>
            <boxGeometry args={[0.08, 0.24, 0.4]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Traffic Signals */}
      {trafficSignals.map((ts, idx) => (
        <group key={`ts-${idx}`} position={[ts.x, 0.14, ts.z]}>
          <mesh position={[0, 1.8, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.09, 3.6, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.6} />
          </mesh>
          {/* Signal Box */}
          <mesh position={[0, 3.4, 0]} castShadow>
            <boxGeometry args={[0.3, 0.8, 0.3]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          {/* Red Light */}
          <mesh position={[0, 3.65, 0.16]}>
            <circleGeometry args={[0.08, 12]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          {/* Amber Light */}
          <mesh position={[0, 3.4, 0.16]}>
            <circleGeometry args={[0.08, 12]} />
            <meshBasicMaterial color="#fbbf24" />
          </mesh>
          {/* Green Light */}
          <mesh position={[0, 3.15, 0.16]}>
            <circleGeometry args={[0.08, 12]} />
            <meshBasicMaterial color="#10b981" />
          </mesh>
        </group>
      ))}

      {/* Fire Hydrants */}
      {hydrants.map((h, idx) => (
        <group key={`hydrant-${idx}`} position={[h.x, 0.14, h.z]}>
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.14, 0.6, 10]} />
            <meshStandardMaterial color="#ef4444" roughness={0.4} metalness={0.5} />
          </mesh>
          <mesh position={[0, 0.6, 0]} castShadow>
            <sphereGeometry args={[0.13, 8, 8]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
        </group>
      ))}
    </group>
  );
};
