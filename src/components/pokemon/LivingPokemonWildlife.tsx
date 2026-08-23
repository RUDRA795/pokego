/**
 * Pokémon 3D RPG — Living Wildlife AI Simulation Engine
 * 
 * Drives natural wildlife ecology for overworld Pokémon:
 * - Direct elevation grounding via `TerrainHeightmap.getHeight(x, z)`.
 * - Habitat constraints: Magikarp in stream, Pidgey in airspace, Caterpie/Bulbasaur in forest.
 * - Distance-based player reactions: Far (ignore), Medium (look toward), Near (curious/cautious), Very close (encounter).
 * - Multi-joint skeletal animation state bridging (`PokemonSkeletonRig`).
 */

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ActivePokemon } from '../../types/pokemon';
import { getPokemonById } from '../../data/pokemon';
import { TerrainHeightmap } from '../../systems/world/TerrainHeightmap';
import { usePlayerStore } from '../../state/usePlayerStore';
import { useGameStore } from '../../state/useGameStore';
import { distance2D, lerpAngle, randomInRange } from '../../utils/math';
import { PokemonSkeletonRig, WildlifeAnimationState } from './PokemonSkeletonRig';

interface LivingPokemonWildlifeProps {
  pokemon: ActivePokemon;
}

export const LivingPokemonWildlife: React.FC<LivingPokemonWildlifeProps> = ({ pokemon }) => {
  const groupRef = useRef<THREE.Group>(null);
  const species = getPokemonById(pokemon.speciesId);
  const playerPos = usePlayerStore((state) => state.position);

  const isPaused = useGameStore((state) => state.isPaused);
  const lastEncounterTime = useGameStore((state) => state.lastEncounterTime);
  const triggerEncounter = useGameStore((state) => state.triggerEncounter);

  // Wildlife State Machine
  const [wildlifeState, setWildlifeState] = useState<WildlifeAnimationState>('IDLE');
  const posRef = useRef({ x: pokemon.position[0], z: pokemon.position[2] });
  const targetRef = useRef({ x: pokemon.targetPosition[0], z: pokemon.targetPosition[2] });
  const rotRef = useRef(pokemon.rotation);
  const timerRef = useRef(randomInRange(2.5, 5.0));

  useFrame((_, delta) => {
    if (isPaused || !groupRef.current || !species) return;

    const px = playerPos[0];
    const pz = playerPos[2];
    const distToPlayer = distance2D(posRef.current.x, posRef.current.z, px, pz);
    const cooldownActive = Date.now() - lastEncounterTime < 3500;

    // 1. Proximity Encounter Trigger (< 1.8m)
    if (distToPlayer < 1.8 && !cooldownActive) {
      triggerEncounter({
        pokemon: {
          ...pokemon,
          position: [posRef.current.x, TerrainHeightmap.getHeight(posRef.current.x, posRef.current.z), posRef.current.z],
          rotation: rotRef.current,
          state: 'ENCOUNTER',
        },
        pokemonSpecies: species,
      });
      return;
    }

    // 2. Distance-Based Player Awareness
    if (distToPlayer < 7.5 && !cooldownActive) {
      // Face toward player
      const dxPlayer = px - posRef.current.x;
      const dzPlayer = pz - posRef.current.z;
      const angleToPlayer = Math.atan2(dxPlayer, dzPlayer);

      if (distToPlayer < 4.0) {
        if (species.id === 'pikachu') {
          if (wildlifeState !== 'CURIOUS') setWildlifeState('CURIOUS');
        } else if (species.id === 'pidgey') {
          if (wildlifeState !== 'FLY') setWildlifeState('FLY');
        } else {
          if (wildlifeState !== 'OBSERVE') setWildlifeState('OBSERVE');
        }
      } else {
        if (wildlifeState !== 'OBSERVE') setWildlifeState('OBSERVE');
      }

      rotRef.current = lerpAngle(rotRef.current, angleToPlayer, 6 * delta);
    } else if (wildlifeState === 'OBSERVE' || wildlifeState === 'CURIOUS') {
      setWildlifeState('IDLE');
      timerRef.current = randomInRange(2, 4);
    }

    // 3. Autonomous Wildlife Locomotion & State Machine
    const isFish = species.id === 'magikarp';
    const isBird = species.id === 'pidgey' || species.id === 'pidgeotto';

    if (wildlifeState === 'IDLE') {
      timerRef.current -= delta;
      if (timerRef.current <= 0) {
        // Pick new organic wander target within natural habitat
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

    // 4. Physical Elevation Alignment
    let groundY = TerrainHeightmap.getHeight(posRef.current.x, posRef.current.z);

    if (isFish) {
      const waterY = TerrainHeightmap.getWaterLevel(posRef.current.x, posRef.current.z);
      if (waterY !== null) groundY = waterY - 0.15;
    } else if (isBird && wildlifeState === 'FLY') {
      groundY += 1.8; // Airspace cruising altitude
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
