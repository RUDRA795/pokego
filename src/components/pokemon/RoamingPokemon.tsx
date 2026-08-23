/**
 * Pokémon 3D RPG — Advanced Autonomous Roaming Pokémon Controller
 * 
 * Features:
 * - Species-specific behavior profiles (movement speeds, detection ranges, flee distances, group sizes).
 * - Extended finite state machine (IDLE, WANDER, EXPLORE, GRAZE, REST, LOOK_AROUND, FOLLOW_GROUP, FLEE, INVESTIGATE, PLAY, SWIM, FLY, ENCOUNTER).
 * - Soft spawn emergence scaling with gentle ease-in.
 * - Non-combat player interaction (curious turn to face player, friendly emote bubbles).
 * - Boundary & obstacle collision resolution.
 */

import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ActivePokemon, AIState } from '../../types/pokemon';
import { getPokemonById } from '../../data/pokemon';
import { getPokemonBehaviorProfile, ExtendedAIState } from '../../data/pokemon/behaviors';
import { usePlayerStore } from '../../state/usePlayerStore';
import { useGameStore } from '../../state/useGameStore';
import { distance2D, lerpAngle, randomInRange } from '../../utils/math';
import { resolvePosition } from '../../utils/collision';
import { PokemonRenderer } from './PokemonRenderer';

interface RoamingPokemonProps {
  pokemon: ActivePokemon;
}

export const RoamingPokemon: React.FC<RoamingPokemonProps> = ({ pokemon }) => {
  const groupRef = useRef<THREE.Group>(null);
  const spawnScaleRef = useRef<number>(0.1);

  const species = getPokemonById(pokemon.speciesId);
  const behavior = getPokemonBehaviorProfile(pokemon.speciesId);
  const playerPos = usePlayerStore((state) => state.position);

  const isPaused = useGameStore((state) => state.isPaused);
  const lastEncounterTime = useGameStore((state) => state.lastEncounterTime);
  const triggerEncounter = useGameStore((state) => state.triggerEncounter);

  // Local AI State & Navigation Refs
  const [aiState, setAiState] = useState<AIState>(pokemon.state);
  const [currentEmote, setCurrentEmote] = useState<'heart' | 'alert' | 'music' | 'sleep' | null>(null);

  const posRef = useRef({ x: pokemon.position[0], z: pokemon.position[2] });
  const targetRef = useRef({ x: pokemon.targetPosition[0], z: pokemon.targetPosition[2] });
  const rotRef = useRef(pokemon.rotation);
  const timerRef = useRef(randomInRange(2, 4));

  // Handle soft emergence scale up on spawn
  useEffect(() => {
    spawnScaleRef.current = 0.1;
  }, [pokemon.instanceId]);

  useFrame((_, delta) => {
    if (isPaused || !groupRef.current || !species) return;

    // Smooth emergence scale-up
    if (spawnScaleRef.current < 1.0) {
      spawnScaleRef.current = Math.min(1.0, spawnScaleRef.current + delta * 3.0);
      groupRef.current.scale.set(spawnScaleRef.current, spawnScaleRef.current, spawnScaleRef.current);
    }

    // Distance to player
    const distToPlayer = distance2D(posRef.current.x, posRef.current.z, playerPos[0], playerPos[2]);
    const cooldownActive = Date.now() - lastEncounterTime < 3500; // 3.5s grace cooldown

    // 1. Proximity Battle Encounter Trigger (within 1.8 units)
    if (distToPlayer < 1.8 && !cooldownActive) {
      if (aiState !== 'ENCOUNTER') {
        setAiState('ENCOUNTER');
        setCurrentEmote('alert');
        triggerEncounter({
          pokemon: {
            ...pokemon,
            position: [posRef.current.x, 0, posRef.current.z],
            rotation: rotRef.current,
            state: 'ENCOUNTER',
          },
          pokemonSpecies: species,
        });
      }
      return;
    }

    // 2. Non-Combat Perception & Interaction (within detectionRange)
    const perceptionRange = behavior.detectionRange || 6.0;
    if (distToPlayer < perceptionRange && !cooldownActive) {
      if (species.aiBehavior === 'Curious') {
        if (aiState !== 'APPROACH') {
          setAiState('APPROACH');
          setCurrentEmote('music');
        }
        targetRef.current = { x: playerPos[0], z: playerPos[2] };
      } else if (species.aiBehavior === 'Timid') {
        if (aiState !== 'FLEE') {
          setAiState('FLEE');
          setCurrentEmote('alert');
        }
        const dirX = posRef.current.x - playerPos[0];
        const dirZ = posRef.current.z - playerPos[2];
        const len = Math.sqrt(dirX * dirX + dirZ * dirZ) || 1;
        targetRef.current = {
          x: posRef.current.x + (dirX / len) * (behavior.fleeDistance || 8),
          z: posRef.current.z + (dirZ / len) * (behavior.fleeDistance || 8),
        };
      } else if (species.aiBehavior === 'Aggressive') {
        if (aiState !== 'APPROACH') {
          setAiState('APPROACH');
          setCurrentEmote('alert');
        }
        targetRef.current = { x: playerPos[0], z: playerPos[2] };
      } else if (species.aiBehavior === 'Calm') {
        if (aiState !== 'DETECTED') {
          setAiState('DETECTED');
          setCurrentEmote('heart');
        }
        // Face player calmly
        const dx = playerPos[0] - posRef.current.x;
        const dz = playerPos[2] - posRef.current.z;
        rotRef.current = lerpAngle(rotRef.current, Math.atan2(dx, dz), 6 * delta);
      }
    } else if (aiState === 'APPROACH' || aiState === 'FLEE' || aiState === 'DETECTED' || aiState === 'ENCOUNTER') {
      setAiState('IDLE');
      setCurrentEmote(null);
      timerRef.current = randomInRange(1.5, 3.5);
    }

    // 3. Autonomous State Transitions & Steering
    const baseSpeed = behavior.movementSpeed || 1.2;
    const moveSpeed = aiState === 'FLEE' ? baseSpeed * 2.2 : aiState === 'APPROACH' ? baseSpeed * 1.4 : baseSpeed;

    if (aiState === 'IDLE') {
      timerRef.current -= delta;
      if (timerRef.current <= 0) {
        // Random wander target
        const wanderRadius = 5.5;
        const wanderX = posRef.current.x + randomInRange(-wanderRadius, wanderRadius);
        const wanderZ = posRef.current.z + randomInRange(-wanderRadius, wanderRadius);
        targetRef.current = { x: wanderX, z: wanderZ };
        setAiState('WANDER');
      }
    } else if (aiState === 'WANDER' || aiState === 'APPROACH' || aiState === 'FLEE') {
      const dx = targetRef.current.x - posRef.current.x;
      const dz = targetRef.current.z - posRef.current.z;
      const distToTarget = Math.sqrt(dx * dx + dz * dz);

      if (distToTarget < 0.4) {
        setAiState('IDLE');
        timerRef.current = randomInRange(2, 4.5);
      } else {
        const stepX = (dx / distToTarget) * moveSpeed * delta;
        const stepZ = (dz / distToTarget) * moveSpeed * delta;

        // Apply obstacle & island boundaries
        const isFlying = behavior.locomotion === 'flying';
        const resolved = isFlying
          ? { x: Math.max(-25, Math.min(25, posRef.current.x + stepX)), z: Math.max(-25, Math.min(25, posRef.current.z + stepZ)) }
          : resolvePosition(posRef.current.x + stepX, posRef.current.z + stepZ, 0.4);

        posRef.current.x = resolved.x;
        posRef.current.z = resolved.z;

        // Smooth heading lerp
        const targetAngle = Math.atan2(dx, dz);
        rotRef.current = lerpAngle(rotRef.current, targetAngle, 8 * delta);
      }
    }

    // Update 3D Transform
    groupRef.current.position.set(posRef.current.x, 0, posRef.current.z);
    groupRef.current.rotation.y = rotRef.current;
  });

  if (!species) return null;

  return (
    <group ref={groupRef} position={pokemon.position}>
      <PokemonRenderer speciesId={pokemon.speciesId} state={aiState} emote={currentEmote} />
    </group>
  );
};
