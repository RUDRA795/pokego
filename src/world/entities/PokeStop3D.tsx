/**
 * Pokémon 3D RPG — 3D PokéStop Landmark with Rotating Photo Disc & Energy Rings
 * 
 * Features:
 * - 3D futuristic pedestal base with metallic blue finish.
 * - Rotating vertical 3D Photo Disc with cyan holographic energy rings.
 * - Proximity detection (expands into interactive ready state when trainer approaches).
 * - Tap to open the existing authentic PokéStop spinning Photo Disc screen.
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { NagpurHotspot } from '../../state/useRealWorldStore';

interface PokeStop3DProps {
  hotspot: NagpurHotspot;
  worldPosition: [number, number, number];
  trainerPosition: [number, number, number];
  onSelect: (hotspot: NagpurHotspot) => void;
}

export const PokeStop3D: React.FC<PokeStop3DProps> = ({
  hotspot,
  worldPosition,
  trainerPosition,
  onSelect,
}) => {
  const discRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const dx = trainerPosition[0] - worldPosition[0];
  const dz = trainerPosition[2] - worldPosition[2];
  const distance = Math.sqrt(dx * dx + dz * dz);
  const isInRange = distance < 10;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (discRef.current) {
      discRef.current.rotation.y = t * 1.2;
      discRef.current.position.y = 1.6 + Math.sin(t * 2) * 0.08;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = -t * 0.8;
      const s = 1 + Math.sin(t * 3) * 0.08;
      ringRef.current.scale.set(s, s, 1);
    }
  });

  const isRocket = Boolean(hotspot.isRocketInvaded);
  const primaryColor = isRocket ? '#ef4444' : '#0284c7';
  const glowColor = isRocket ? '#f43f5e' : '#38bdf8';

  return (
    <group position={worldPosition}>
      {/* Base Contact Shadow */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.9, 20]} />
        <meshBasicMaterial color="#050811" transparent opacity={0.6} />
      </mesh>

      {/* Base Pedestal Post */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.35, 1.2, 12]} />
        <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.6} />
      </mesh>

      {/* Proximity Interaction Ground Ring */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.35, 32]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={isInRange ? 0.8 : 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Floating 3D Rotating Photo Disc */}
      <group ref={discRef} position={[0, 1.6, 0]}>
        {/* Core Blue Disc */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.65, 0.65, 0.12, 24]} />
          <meshStandardMaterial color={primaryColor} roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Outer Orbiting Energy Ring */}
        <mesh ref={ringRef}>
          <torusGeometry args={[0.85, 0.04, 12, 32]} />
          <meshBasicMaterial color={glowColor} />
        </mesh>

        {/* Inner Symbol Cube */}
        <mesh>
          <boxGeometry args={[0.25, 0.25, 0.25]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Interactive Title Billboard */}
      <Html position={[0, 2.6, 0]} center distanceFactor={11} zIndexRange={[150, 0]}>
        <div
          onClick={() => onSelect(hotspot)}
          className="cursor-pointer group flex flex-col items-center select-none transition-transform hover:scale-115 active:scale-95"
        >
          <div
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase text-white shadow-2xl flex items-center gap-1 border border-white/20 whitespace-nowrap ${
              isRocket
                ? 'bg-gradient-to-r from-red-600 via-rose-700 to-black animate-pulse'
                : 'bg-gradient-to-r from-blue-600 to-cyan-500'
            }`}
          >
            <span>{isRocket ? '💀 ROCKET' : '🔷 POKÉSTOP'}</span>
            <span className="font-bold">· {hotspot.name}</span>
          </div>
        </div>
      </Html>
    </group>
  );
};
