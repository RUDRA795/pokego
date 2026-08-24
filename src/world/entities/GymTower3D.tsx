/**
 * Pokémon 3D RPG — 3D Gym Arena Monument Tower & Stadium Architecture
 * 
 * Features:
 * - Monumental 3D stadium spire with tiered pillars and metallic finishes.
 * - Multi-ring rotating summit energy crown with skyward light beacon pillar.
 * - Team-themed glowing lighting (Mystic Blue, Valor Red, Instinct Yellow, or Rocket Purple).
 * - Boss Pokémon preview & interaction trigger.
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { NagpurHotspot } from '../../state/useRealWorldStore';

interface GymTower3DProps {
  hotspot: NagpurHotspot;
  worldPosition: [number, number, number];
  trainerPosition: [number, number, number];
  onSelect: (hotspot: NagpurHotspot) => void;
}

export const GymTower3D: React.FC<GymTower3DProps> = ({
  hotspot,
  worldPosition,
  trainerPosition,
  onSelect,
}) => {
  const beaconRef = useRef<THREE.Mesh>(null);
  const ringGroupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  const dx = trainerPosition[0] - worldPosition[0];
  const dz = trainerPosition[2] - worldPosition[2];
  const distance = Math.sqrt(dx * dx + dz * dz);
  const isInRange = distance < 14;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ringGroupRef.current) {
      ringGroupRef.current.rotation.y = t * 1.5;
    }
    if (beaconRef.current) {
      const mat = beaconRef.current.material as THREE.MeshBasicMaterial;
      if (mat) mat.opacity = 0.45 + Math.sin(t * 3) * 0.15;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y = -t * 1.2;
    }
  });

  const isRocket = Boolean(hotspot.isRocketInvaded);
  const gymColor = isRocket ? '#9333ea' : '#3b82f6';
  const glowColor = isRocket ? '#c084fc' : '#60a5fa';

  return (
    <group position={worldPosition}>
      {/* Ground Shadow */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.2, 32]} />
        <meshBasicMaterial color="#050811" transparent opacity={0.7} />
      </mesh>

      {/* Proximity Interaction Ground Ring */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.0, 3.25, 36]} />
        <meshBasicMaterial color={glowColor} transparent opacity={isInRange ? 0.8 : 0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Arena Spire Base Tier 1 (Heavy Octagonal Foundation) */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.2, 2.8, 1.0, 8]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* 4 Outer Stadium Buttress Pillars */}
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, idx) => (
        <mesh
          key={idx}
          position={[Math.cos(angle) * 2.2, 1.6, Math.sin(angle) * 2.2]}
          castShadow
        >
          <boxGeometry args={[0.5, 2.4, 0.5]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}

      {/* Arena Spire Base Tier 2 */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[1.5, 1.9, 1.2, 12]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Glowing Energy Core Column */}
      <mesh ref={coreRef} position={[0, 3.4, 0]} castShadow>
        <cylinderGeometry args={[0.75, 1.0, 2.6, 12]} />
        <meshStandardMaterial color={gymColor} roughness={0.2} metalness={0.8} emissive={gymColor} emissiveIntensity={0.4} />
      </mesh>

      {/* Summit Rotating Energy Crown */}
      <group ref={ringGroupRef} position={[0, 5.0, 0]}>
        <mesh>
          <torusGeometry args={[1.6, 0.09, 12, 36]} />
          <meshBasicMaterial color={glowColor} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.25, 0.07, 12, 36]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* Floating Shield Crystals */}
        {[0, Math.PI * 0.66, Math.PI * 1.33].map((ang, idx) => (
          <mesh key={idx} position={[Math.cos(ang) * 1.3, 0, Math.sin(ang) * 1.3]}>
            <octahedronGeometry args={[0.25, 0]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}
      </group>

      {/* Vertical Light Beacon Column */}
      <mesh ref={beaconRef} position={[0, 11, 0]}>
        <cylinderGeometry args={[0.4, 0.7, 14, 16]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>

      {/* Interactive Title Billboard */}
      <Html position={[0, 6.2, 0]} center distanceFactor={12} zIndexRange={[150, 0]}>
        <div
          onClick={() => onSelect(hotspot)}
          className="cursor-pointer group flex flex-col items-center select-none transition-transform hover:scale-115 active:scale-95"
        >
          <div
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase text-white shadow-2xl flex items-center gap-1.5 border border-white/25 whitespace-nowrap ${
              isRocket
                ? 'bg-gradient-to-r from-purple-700 via-pink-700 to-black animate-pulse shadow-purple-900/60'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 shadow-indigo-900/60'
            }`}
          >
            <span>{isRocket ? '☠️ ROCKET GYM' : '⚔️ BATTLE GYM'}</span>
            <span className="font-bold">· {hotspot.name}</span>
          </div>

          {hotspot.bossSpeciesId && (
            <div className="bg-slate-950/90 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-amber-400/60 text-[9px] font-black text-amber-300 shadow-xl mt-1 flex items-center gap-1">
              <span>👑 Boss: {hotspot.bossSpeciesId.toUpperCase()}</span>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
};
