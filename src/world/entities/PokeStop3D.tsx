/**
 * Pokémon 3D RPG — 3D PokéStop Landmark with Rotating Hologram Disc & Energy Rings
 * 
 * Features:
 * - 3D futuristic pedestal base with metallic blue finish and glowing circuit trim.
 * - Rotating vertical 3D Photo Disc with cyan holographic gimbal energy rings.
 * - Floating crystal energy core with ambient loot sparkle particles.
 * - Proximity detection and tap-to-spin interaction.
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
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const crystalRef = useRef<THREE.Mesh>(null);

  const dx = trainerPosition[0] - worldPosition[0];
  const dz = trainerPosition[2] - worldPosition[2];
  const distance = Math.sqrt(dx * dx + dz * dz);
  const isInRange = distance < 10;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (discRef.current) {
      discRef.current.rotation.y = t * 1.4;
      discRef.current.position.y = 1.7 + Math.sin(t * 2.2) * 0.09;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = -t * 1.1;
      const s = 1 + Math.sin(t * 3) * 0.06;
      ring1Ref.current.scale.set(s, s, 1);
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = t * 0.9;
    }
    if (crystalRef.current) {
      crystalRef.current.rotation.y = -t * 2;
    }
  });

  const isRocket = Boolean(hotspot.isRocketInvaded);
  const primaryColor = isRocket ? '#ef4444' : '#0284c7';
  const glowColor = isRocket ? '#f43f5e' : '#38bdf8';

  return (
    <group position={worldPosition}>
      {/* Base Contact Shadow */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.1, 24]} />
        <meshBasicMaterial color="#050811" transparent opacity={0.65} />
      </mesh>

      {/* Futuristic Tiered Pedestal Base */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.45, 0.7, 12]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.28, 0.8, 12]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.8} />
      </mesh>

      {/* Proximity Interaction Ground Ring */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.3, 1.48, 36]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={isInRange ? 0.85 : 0.35}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Floating 3D Rotating Photo Disc & Gimbal Rings */}
      <group ref={discRef} position={[0, 1.7, 0]}>
        {/* Core Blue Disc */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.7, 0.7, 0.14, 32]} />
          <meshStandardMaterial color={primaryColor} roughness={0.2} metalness={0.8} />
        </mesh>

        {/* Outer Orbiting Gimbal Ring 1 */}
        <mesh ref={ring1Ref}>
          <torusGeometry args={[0.92, 0.045, 12, 36]} />
          <meshBasicMaterial color={glowColor} />
        </mesh>

        {/* Outer Orbiting Gimbal Ring 2 */}
        <mesh ref={ring2Ref} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.82, 0.035, 12, 36]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Inner Glowing Crystal Core */}
        <mesh ref={crystalRef}>
          <octahedronGeometry args={[0.28, 0]} />
          <meshStandardMaterial color={glowColor} roughness={0.1} emissive={glowColor} emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* Interactive Title Billboard */}
      <Html position={[0, 2.8, 0]} center distanceFactor={11} zIndexRange={[150, 0]}>
        <div
          onClick={() => onSelect(hotspot)}
          className="cursor-pointer group flex flex-col items-center select-none transition-transform hover:scale-115 active:scale-95"
        >
          <div
            className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase text-white shadow-2xl flex items-center gap-1.5 border border-white/25 whitespace-nowrap ${
              isRocket
                ? 'bg-gradient-to-r from-red-600 via-rose-700 to-black animate-pulse shadow-rose-900/50'
                : 'bg-gradient-to-r from-blue-600 to-cyan-500 shadow-cyan-900/50'
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
