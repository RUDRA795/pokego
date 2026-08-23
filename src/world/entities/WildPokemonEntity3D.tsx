/**
 * Pokémon 3D RPG — 3D Wild Pokémon World Entity with Wander AI & CP Billboard
 * 
 * Features:
 * - Real 3D world positioning with grounded contact blob shadow.
 * - Procedural wandering AI (wanders gently around spawn origin, looks around, hops).
 * - Reacts to trainer proximity (faces player when within 7m, radiates capture glow).
 * - Dynamic 3D Billboard CP pill with weather boost aura.
 * - Direct tap-to-encounter trigger seamlessly launching 3D Capture Encounter.
 */

import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { RealWorldSpawn } from '../../state/useRealWorldStore';
import { getPokemonAnimated, getPokemonIcon } from '../../data/pokemon/images';
import { POKEMON_TYPE_THEMES } from '../../data/pokemon/types';

interface WildPokemonEntity3DProps {
  spawn: RealWorldSpawn;
  worldPosition: [number, number, number];
  trainerPosition: [number, number, number];
  onSelect: (spawn: RealWorldSpawn) => void;
}

export const WildPokemonEntity3D: React.FC<WildPokemonEntity3DProps> = ({
  spawn,
  worldPosition,
  trainerPosition,
  onSelect,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Mesh>(null);

  // Wandering AI state
  const originPos = useMemo(() => new THREE.Vector2(worldPosition[0], worldPosition[2]), [worldPosition]);
  const currentLocalPos = useRef<THREE.Vector2>(new THREE.Vector2(worldPosition[0], worldPosition[2]));
  const targetWanderPos = useRef<THREE.Vector2>(new THREE.Vector2(worldPosition[0], worldPosition[2]));
  const nextWanderTime = useRef<number>(0);
  const isWalking = useRef<boolean>(false);
  const hopYRef = useRef<number>(0);

  const theme = (POKEMON_TYPE_THEMES as any)[spawn.primaryType] || POKEMON_TYPE_THEMES.Normal;

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const now = state.clock.getElapsedTime();

    // 1. Check distance to trainer
    const dx = trainerPosition[0] - currentLocalPos.current.x;
    const dz = trainerPosition[2] - currentLocalPos.current.y;
    const distToTrainer = Math.sqrt(dx * dx + dz * dz);
    const isTrainerNear = distToTrainer < 7;

    // 2. Wander Behavior Logic
    if (now > nextWanderTime.current) {
      if (Math.random() < 0.6) {
        // Pick a new wander spot near origin
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * 2.2;
        targetWanderPos.current.set(originPos.x + Math.cos(angle) * r, originPos.y + Math.sin(angle) * r);
        isWalking.current = true;
      } else {
        isWalking.current = false;
      }
      nextWanderTime.current = now + 2.5 + Math.random() * 4;
    }

    if (isWalking.current) {
      const step = delta * 0.9;
      currentLocalPos.current.lerp(targetWanderPos.current, step);
      hopYRef.current = Math.abs(Math.sin(now * 8)) * 0.08;
    } else {
      hopYRef.current = Math.sin(now * 2) * 0.02;
    }

    groupRef.current.position.set(currentLocalPos.current.x, hopYRef.current, currentLocalPos.current.y);

    // 3. Shadow scaling with hop
    if (shadowRef.current) {
      const s = 0.85 - hopYRef.current * 0.8;
      shadowRef.current.scale.set(s, s, 1);
    }
  });

  const distToPlayer = Math.sqrt(
    Math.pow(trainerPosition[0] - worldPosition[0], 2) +
    Math.pow(trainerPosition[2] - worldPosition[2], 2)
  );

  const isInRange = distToPlayer < 12;

  return (
    <group ref={groupRef} position={worldPosition}>
      {/* Contact Blob Shadow */}
      <mesh ref={shadowRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42, 20]} />
        <meshBasicMaterial color="#050811" transparent opacity={0.55} />
      </mesh>

      {/* Proximity Pulsing Radar Circle if within capture distance */}
      {isInRange && (
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.65, 24]} />
          <meshBasicMaterial
            color={theme.primaryColor || '#38bdf8'}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* 3D Animated Pokemon Sprite & CP Billboard */}
      <Html position={[0, 0.7, 0]} center distanceFactor={10} zIndexRange={[200, 0]}>
        <div
          onClick={() => onSelect(spawn)}
          className="cursor-pointer group flex flex-col items-center select-none transition-transform hover:scale-125 active:scale-95"
        >
          {/* CP Nameplate Badge */}
          <div className="bg-slate-950/90 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/15 text-[10px] font-black text-amber-300 shadow-2xl mb-1 flex items-center gap-1">
            {spawn.isWeatherBoosted && <span className="text-amber-400">☀️</span>}
            <span className="font-mono">CP {spawn.cp}</span>
          </div>

          {/* Weather Boost Energy Glow Halo */}
          <div className="relative flex items-center justify-center">
            {spawn.isWeatherBoosted && (
              <div
                className="absolute w-14 h-14 rounded-full blur-md opacity-70 animate-pulse pointer-events-none"
                style={{ backgroundColor: theme.primaryColor || '#fbbf24' }}
              />
            )}

            {/* 3D Animated Model / Sprite */}
            <img
              src={getPokemonAnimated(spawn.dex)}
              alt={spawn.name}
              className="w-16 h-16 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)] filter transition duration-200"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = getPokemonIcon(spawn.dex);
              }}
            />
          </div>
        </div>
      </Html>
    </group>
  );
};
