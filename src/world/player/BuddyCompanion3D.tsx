/**
 * Pokémon 3D RPG — 3D Buddy Companion Pokémon with Spring Following Physics
 * 
 * Features:
 * - Natural spring-following locomotion behind & beside the trainer.
 * - Dynamic distance damping (speeds up when far, settles smoothly when close).
 * - Animated 3D model/sprite billboard with ground contact blob shadow.
 * - Affection heart status pill floating above head.
 * - Gentle idle hopping and interaction reactions.
 */

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { RuntimePokemon } from '../../battle/types';
import { getPokemonById } from '../../data/pokemon';
import { getPokemonAnimated, getPokemonIcon } from '../../data/pokemon/images';

interface BuddyCompanion3DProps {
  buddy: RuntimePokemon | null;
  trainerPosition: [number, number, number];
  trainerHeading: number;
  trainerIsMoving: boolean;
  buddyHearts: number;
  onFeed?: () => void;
}

export const BuddyCompanion3D: React.FC<BuddyCompanion3DProps> = ({
  buddy,
  trainerPosition,
  trainerHeading,
  trainerIsMoving,
  buddyHearts,
  onFeed,
}) => {
  if (!buddy) return null;

  const species = getPokemonById(buddy.speciesId);
  const dex = species?.nationalDexNumber || 25;

  const buddyPosRef = useRef<THREE.Vector3>(
    new THREE.Vector3(trainerPosition[0] - 1.2, 0, trainerPosition[2] + 0.8)
  );
  const velocityRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const groupRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const hopYRef = useRef<number>(0);
  const [isHappy, setIsHappy] = useState<boolean>(false);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // 1. Calculate desired companion target offset (to the left-rear of trainer)
    const targetOffsetDistance = 1.4;
    const offsetAngle = trainerHeading + Math.PI * 0.75; // Behind-left
    const desiredX = trainerPosition[0] + Math.sin(offsetAngle) * targetOffsetDistance;
    const desiredZ = trainerPosition[2] + Math.cos(offsetAngle) * targetOffsetDistance;
    const desiredTarget = new THREE.Vector3(desiredX, 0, desiredZ);

    // 2. Spring-damping following physics
    const toTarget = new THREE.Vector3().subVectors(desiredTarget, buddyPosRef.current);
    const dist = toTarget.length();

    // If extremely far (e.g. teleport/GPS jump), snap close
    if (dist > 15) {
      buddyPosRef.current.set(desiredX, 0, desiredZ);
      velocityRef.current.set(0, 0, 0);
    } else {
      const springStrength = dist > 2 ? 14 : 7;
      const damping = 0.78;

      const acceleration = toTarget.multiplyScalar(springStrength);
      velocityRef.current.add(acceleration.multiplyScalar(delta));
      velocityRef.current.multiplyScalar(damping);

      buddyPosRef.current.add(velocityRef.current.clone().multiplyScalar(delta));
    }

    // 3. Vertical hop animation when walking
    const isBuddyWalking = velocityRef.current.length() > 0.3 || trainerIsMoving;
    if (isBuddyWalking) {
      const t = state.clock.getElapsedTime() * 9;
      hopYRef.current = Math.abs(Math.sin(t)) * 0.12;
    } else {
      const t = state.clock.getElapsedTime() * 2.5;
      hopYRef.current = Math.sin(t) * 0.03;
    }

    groupRef.current.position.set(
      buddyPosRef.current.x,
      hopYRef.current,
      buddyPosRef.current.z
    );

    // 4. Shadow scaling with hop
    if (shadowRef.current) {
      const s = 0.85 - (hopYRef.current * 0.8);
      shadowRef.current.scale.set(s, s, 1);
    }
  });

  const handleTap = () => {
    setIsHappy(true);
    if (onFeed) onFeed();
    setTimeout(() => setIsHappy(false), 2000);
  };

  return (
    <group ref={groupRef}>
      {/* Contact Blob Shadow on Ground */}
      <mesh ref={shadowRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.35, 20]} />
        <meshBasicMaterial color="#050811" transparent opacity={0.5} />
      </mesh>

      {/* 3D Billboard Sprite / Entity with HTML UI */}
      <Html position={[0, 0.55, 0]} center distanceFactor={9} zIndexRange={[100, 0]}>
        <div
          onClick={handleTap}
          className="cursor-pointer group flex flex-col items-center select-none transition-transform active:scale-95"
        >
          {/* Buddy Affection Badge */}
          <div className="bg-slate-950/90 backdrop-blur-md px-2 py-0.5 rounded-full border border-pink-500/60 text-[9px] font-black text-pink-300 shadow-xl mb-1 flex items-center gap-1">
            <span className="text-rose-400">❤️</span>
            <span>{buddyHearts} Hearts</span>
            {isHappy && <span className="text-amber-300 animate-bounce">✨ Happy!</span>}
          </div>

          {/* Animated Pokémon Model */}
          <img
            src={getPokemonAnimated(dex)}
            alt={buddy.name}
            className="w-16 h-16 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] filter transition hover:scale-110"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = getPokemonIcon(dex);
            }}
          />
        </div>
      </Html>
    </group>
  );
};
