/**
 * Pokémon 3D RPG — 3D Gym Arena Monument Tower
 * 
 * Features:
 * - Monumental 3D arena spire with team color / Team GO Rocket styling.
 * - Rotating summit beacon ring with vertical light pillar.
 * - Boss Pokémon preview & interaction trigger.
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { NagpurHotspot } from '../../state/useRealWorldStore';
import { getPokemonIcon } from '../../data/pokemon/images';

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
  const ringRef = useRef<THREE.Group>(null);

  const dx = trainerPosition[0] - worldPosition[0];
  const dz = trainerPosition[2] - worldPosition[2];
  const distance = Math.sqrt(dx * dx + dz * dz);
  const isInRange = distance < 12;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ringRef.current) {
      ringRef.current.rotation.y = t * 1.5;
    }
    if (beaconRef.current) {
      const mat = beaconRef.current.material as THREE.MeshBasicMaterial;
      if (mat) mat.opacity = 0.45 + Math.sin(t * 3) * 0.15;
    }
  });

  const isRocket = Boolean(hotspot.isRocketInvaded);
  const gymColor = isRocket ? '#9333ea' : '#3b82f6';
  const glowColor = isRocket ? '#c084fc' : '#60a5fa';

  return (
    <group position={worldPosition}>
      {/* Ground Shadow */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.2, 24]} />
        <meshBasicMaterial color="#050811" transparent opacity={0.65} />
      </mesh>

      {/* Arena Spire Base Tier 1 */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.8, 2.2, 0.8, 16]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Arena Spire Base Tier 2 */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[1.2, 1.6, 0.9, 16]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Glowing Energy Core Pillar */}
      <mesh position={[0, 2.8, 0]} castShadow>
        <cylinderGeometry args={[0.65, 0.9, 2.4, 12]} />
        <meshStandardMaterial color={gymColor} roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Summit Rotating Rings */}
      <group ref={ringRef} position={[0, 4.2, 0]}>
        <mesh>
          <torusGeometry args={[1.4, 0.08, 12, 32]} />
          <meshBasicMaterial color={glowColor} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.1, 0.06, 12, 32]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Vertical Light Beacon Column */}
      <mesh ref={beaconRef} position={[0, 9, 0]}>
        <cylinderGeometry args={[0.35, 0.6, 10, 12]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>

      {/* Interactive Title Billboard */}
      <Html position={[0, 5.2, 0]} center distanceFactor={12} zIndexRange={[150, 0]}>
        <div
          onClick={() => onSelect(hotspot)}
          className="cursor-pointer group flex flex-col items-center select-none transition-transform hover:scale-115 active:scale-95"
        >
          <div
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase text-white shadow-2xl flex items-center gap-1.5 border border-white/20 whitespace-nowrap ${
              isRocket
                ? 'bg-gradient-to-r from-purple-700 via-pink-700 to-black animate-pulse'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600'
            }`}
          >
            <span>{isRocket ? '☠️ ROCKET GYM' : '⚔️ BATTLE GYM'}</span>
            <span className="font-bold">· {hotspot.name}</span>
          </div>

          {hotspot.bossSpeciesId && (
            <div className="bg-slate-950/90 backdrop-blur-md px-2 py-0.5 rounded-full border border-amber-400/50 text-[9px] font-black text-amber-300 shadow-xl mt-1 flex items-center gap-1">
              <span>👑 Boss: {hotspot.bossSpeciesId.toUpperCase()}</span>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
};
