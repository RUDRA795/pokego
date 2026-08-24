/**
 * Pokémon 3D RPG — 3D Wild Pokémon World Entity with Reactive AI, Type Ground Aura & CP Billboard
 * 
 * Features:
 * - True 3D spatial presence with ground contact shadow and elemental typing ground ring.
 * - Reactive wandering AI: walks naturally, pauses, and turns toward player with `!` alert bubble.
 * - Dynamic 3D Billboard CP nameplate with typing badge, weather boost indicator, and star level.
 * - Tap to smoothly trigger 3D Curveball Capture Encounter.
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
  const typeAuraRef = useRef<THREE.Mesh>(null);

  // Wandering AI state
  const originPos = useMemo(() => new THREE.Vector2(worldPosition[0], worldPosition[2]), [worldPosition]);
  const currentLocalPos = useRef<THREE.Vector2>(new THREE.Vector2(worldPosition[0], worldPosition[2]));
  const targetWanderPos = useRef<THREE.Vector2>(new THREE.Vector2(worldPosition[0], worldPosition[2]));
  const nextWanderTime = useRef<number>(0);
  const isWalking = useRef<boolean>(false);
  const hopYRef = useRef<number>(0);

  const theme = (POKEMON_TYPE_THEMES as any)[spawn.primaryType] || POKEMON_TYPE_THEMES.Normal;
  const typeColor = theme.primaryColor || '#10b981';

  const [isNoticingPlayer, setIsNoticingPlayer] = useState<boolean>(false);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const now = state.clock.getElapsedTime();

    // 1. Check distance to trainer
    const dx = trainerPosition[0] - currentLocalPos.current.x;
    const dz = trainerPosition[2] - currentLocalPos.current.y;
    const distToTrainer = Math.sqrt(dx * dx + dz * dz);
    const isTrainerNear = distToTrainer < 8.0;

    if (isTrainerNear !== isNoticingPlayer) {
      setIsNoticingPlayer(isTrainerNear);
    }

    // 2. Wander Behavior Logic
    if (isTrainerNear) {
      // Pause wander and face player
      isWalking.current = false;
      hopYRef.current = Math.abs(Math.sin(now * 3.5)) * 0.06;
    } else {
      if (now > nextWanderTime.current) {
        if (Math.random() < 0.6) {
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * 2.4;
          targetWanderPos.current.set(originPos.x + Math.cos(angle) * r, originPos.y + Math.sin(angle) * r);
          isWalking.current = true;
        } else {
          isWalking.current = false;
        }
        nextWanderTime.current = now + 2.5 + Math.random() * 4;
      }

      if (isWalking.current) {
        const step = delta * 0.95;
        currentLocalPos.current.lerp(targetWanderPos.current, step);
        hopYRef.current = Math.abs(Math.sin(now * 8)) * 0.09;
      } else {
        hopYRef.current = Math.sin(now * 2.2) * 0.025;
      }
    }

    groupRef.current.position.set(currentLocalPos.current.x, hopYRef.current, currentLocalPos.current.y);

    // 3. Shadow scaling & Type Aura rotation
    if (shadowRef.current) {
      const s = 0.9 - hopYRef.current * 0.8;
      shadowRef.current.scale.set(s, s, 1);
    }
    if (typeAuraRef.current) {
      typeAuraRef.current.rotation.z = now * 1.5;
    }
  });

  const distToPlayer = Math.sqrt(
    Math.pow(trainerPosition[0] - worldPosition[0], 2) +
    Math.pow(trainerPosition[2] - worldPosition[2], 2)
  );

  const isInRange = distToPlayer < 10;

  return (
    <group ref={groupRef} position={worldPosition}>
      {/* Contact Blob Shadow */}
      <mesh ref={shadowRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.48, 24]} />
        <meshBasicMaterial color="#050811" transparent opacity={0.6} />
      </mesh>

      {/* Type-Colored Ground Energy Ring */}
      <mesh ref={typeAuraRef} position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.52, 0.68, 24]} />
        <meshBasicMaterial color={typeColor} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>

      {/* Proximity Pulsing Radar Circle if within capture distance */}
      {isInRange && (
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.75, 0.9, 28]} />
          <meshBasicMaterial
            color={typeColor}
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* 3D Animated Pokemon Sprite & CP Billboard */}
      <Html position={[0, 0.82, 0]} center distanceFactor={10} zIndexRange={[200, 0]}>
        <div
          onClick={() => onSelect(spawn)}
          className="cursor-pointer group flex flex-col items-center select-none transition-transform hover:scale-125 active:scale-95"
        >
          {/* Reaction Alert Exclamation Bubble when trainer approaches */}
          {isNoticingPlayer && (
            <div className="animate-bounce mb-0.5 px-2.5 py-0.5 bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-[11px] rounded-full shadow-2xl border border-white flex items-center gap-1">
              <span>!</span>
              <span className="text-[8px] uppercase tracking-wider font-extrabold">Wild</span>
            </div>
          )}

          {/* CP Nameplate Badge */}
          <div className="bg-slate-950/95 backdrop-blur-md px-3 py-0.5 rounded-full border border-white/20 text-[10px] font-black text-amber-300 shadow-2xl mb-1 flex items-center gap-1.5">
            {spawn.isWeatherBoosted && <span className="text-amber-400">☀️</span>}
            <span className="font-mono font-bold">CP {spawn.cp}</span>
            <span
              className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase text-white shadow-sm"
              style={{ backgroundColor: typeColor }}
            >
              {spawn.primaryType}
            </span>
          </div>

          {/* Weather Boost Energy Glow Halo */}
          <div className="relative flex items-center justify-center">
            {spawn.isWeatherBoosted && (
              <div
                className="absolute w-16 h-16 rounded-full blur-md opacity-70 animate-pulse pointer-events-none"
                style={{ backgroundColor: typeColor }}
              />
            )}

            {/* 3D Animated Model / Sprite */}
            <img
              src={getPokemonAnimated(spawn.dex)}
              alt={spawn.name}
              className="w-16 h-16 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)] filter transition duration-200"
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
