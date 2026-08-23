/**
 * Pokémon 3D RPG — Living Wildlife AI Simulation Engine (Pure 3D Immersion)
 * 
 * Drives natural wildlife ecology for overworld Pokémon:
 * - Direct elevation grounding via `TerrainHeightmap.getHeight(x, z)`.
 * - Habitat constraints: Magikarp in stream, Pidgey in airspace, Caterpie/Bulbasaur in forest.
 * - Distance-based real-time 3D player reactions:
 *   - Far (> 10m): autonomous wildlife routine (wandering, grazing, flying, swimming).
 *   - Medium (4–10m): notice player, look toward player.
 *   - Close (< 3m): joyful greetings, curious head tilts, tail wags, cheek sparks, and playful hops.
 * - Multi-joint skeletal animation state bridging (`PokemonSkeletonRig`).
 */

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ActivePokemon } from '../../types/pokemon';
import { getPokemonById } from '../../data/pokemon';
import { TerrainHeightmap } from '../../systems/world/TerrainHeightmap';
import { usePlayerStore } from '../../state/usePlayerStore';
import { distance2D, lerpAngle, randomInRange } from '../../utils/math';
import { PokemonSkeletonRig, WildlifeAnimationState } from './PokemonSkeletonRig';

interface LivingPokemonWildlifeProps {
  pokemon: ActivePokemon;
}

export const LivingPokemonWildlife: React.FC<LivingPokemonWildlifeProps> = ({ pokemon }) => {
  const groupRef = useRef<THREE.Group>(null);
  const species = getPokemonById(pokemon.speciesId);
  const playerPos = usePlayerStore((state) => state.position);

  // Wildlife State Machine
  const [wildlifeState, setWildlifeState] = useState<WildlifeAnimationState>('IDLE');
  const posRef = useRef({ x: pokemon.position[0], z: pokemon.position[2] });
  const targetRef = useRef({ x: pokemon.targetPosition[0], z: pokemon.targetPosition[2] });
  const rotRef = useRef(pokemon.rotation);
  const timerRef = useRef(randomInRange(2.5, 5.0));

  useFrame((_, delta) => {
    if (!groupRef.current || !species) return;

    const px = playerPos[0];
    const pz = playerPos[2];
    const distToPlayer = distance2D(posRef.current.x, posRef.current.z, px, pz);

    // 1. Close-Range Live 3D Interaction (< 3.5m)
    if (distToPlayer < 3.5) {
      const dxPlayer = px - posRef.current.x;
      const dzPlayer = pz - posRef.current.z;
      const angleToPlayer = Math.atan2(dxPlayer, dzPlayer);

      rotRef.current = lerpAngle(rotRef.current, angleToPlayer, 8 * delta);

      if (distToPlayer < 2.0) {
        if (species.id === 'pikachu') {
          if (wildlifeState !== 'PLAY') setWildlifeState('PLAY');
        } else if (species.id === 'pidgey') {
          if (wildlifeState !== 'FLY') setWildlifeState('FLY');
        } else {
          if (wildlifeState !== 'CURIOUS') setWildlifeState('CURIOUS');
        }
      } else {
        if (wildlifeState !== 'OBSERVE') setWildlifeState('OBSERVE');
      }
    } else if (distToPlayer < 8.0) {
      // Medium Range: Notice player and face them
      const dxPlayer = px - posRef.current.x;
      const dzPlayer = pz - posRef.current.z;
      const angleToPlayer = Math.atan2(dxPlayer, dzPlayer);
      rotRef.current = lerpAngle(rotRef.current, angleToPlayer, 4 * delta);

      if (wildlifeState === 'PLAY') setWildlifeState('OBSERVE');
    } else if (wildlifeState === 'OBSERVE' || wildlifeState === 'CURIOUS' || wildlifeState === 'PLAY') {
      setWildlifeState('IDLE');
      timerRef.current = randomInRange(2, 4);
    }

    // 2. Autonomous Wildlife Locomotion
    const isFish = species.id === 'magikarp';
    const isBird = species.id === 'pidgey' || species.id === 'pidgeotto';

    if (wildlifeState === 'IDLE') {
      timerRef.current -= delta;
      if (timerRef.current <= 0) {
        const wanderRadius = isBird ? 8.0 : 4.5;
        const targetX = posRef.current.x + randomInRange(-wanderRadius, wanderRadius);
        const targetZ = posRef.current.z + randomInRange(-wanderRadius, wanderRadius);

        if (TerrainHeightmap.getWalkability(targetX, targetZ)) {
          targetRef.current = { x: targetX, z: targetZ };
          setWildlifeState(isBird ? 'FLY' : isFish ? 'SWIM' : 'WANDER');
        }
      }
    } else if (wildlifeState === 'WANDER' || wildlifeState === 'SWIM' || wildlifeState === 'FLY') {
      const dx = targetRef.current.x - posRef.current.x;
      const dz = targetRef.current.z - posRef.current.z;
      const distToTarget = Math.sqrt(dx * dx + dz * dz);

      if (distToTarget < 0.4) {
        setWildlifeState('IDLE');
        timerRef.current = randomInRange(2.5, 6.0);
      } else {
        const moveSpeed = isBird ? 3.2 : isFish ? 1.4 : 1.2;
        const stepX = (dx / distToTarget) * moveSpeed * delta;
        const stepZ = (dz / distToTarget) * moveSpeed * delta;

        const nextX = posRef.current.x + stepX;
        const nextZ = posRef.current.z + stepZ;

        if (TerrainHeightmap.getWalkability(nextX, nextZ)) {
          posRef.current.x = nextX;
          posRef.current.z = nextZ;
        } else {
          setWildlifeState('IDLE');
          timerRef.current = 1.0;
        }

        const heading = Math.atan2(dx, dz);
        rotRef.current = lerpAngle(rotRef.current, heading, 8 * delta);
      }
    }

    // 3. Physical Elevation Snapping
    let groundY = TerrainHeightmap.getHeight(posRef.current.x, posRef.current.z);

    if (isFish) {
      const waterY = TerrainHeightmap.getWaterLevel(posRef.current.x, posRef.current.z);
      if (waterY !== null) groundY = waterY - 0.15;
    } else if (isBird && wildlifeState === 'FLY') {
      groundY += 1.8; // Airspace flight altitude
    }

    groupRef.current.position.set(posRef.current.x, groundY, posRef.current.z);
    groupRef.current.rotation.y = rotRef.current;
  });

  if (!species) return null;

  return (
    <group ref={groupRef}>
      <PokemonSkeletonRig speciesId={pokemon.speciesId} animationState={wildlifeState} />
    </group>
  );
};
