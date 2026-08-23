/**
 * Pokémon 3D RPG — Ecological Wildlife Spawner Engine
 * 
 * Spawns living wildlife onto the Forest Valley terrain:
 * - Positions grounded dynamically using `TerrainHeightmap.getHeight(x, z)`.
 * - Sourced by ecological niche: stream water for Magikarp, forest floor for Bulbasaur/Caterpie,
 *   open meadow for Pikachu, and airspace for Pidgey.
 */

import React, { useMemo } from 'react';
import { WORLD_CONFIG } from '../../data/biomes';
import { getPokemonById, calculateSpawnCandidates } from '../../data/pokemon';
import { ActivePokemon } from '../../types/pokemon';
import { useGameStore } from '../../state/useGameStore';
import { useWeatherStore } from '../../state/useWeatherStore';
import { TerrainHeightmap } from '../../systems/world/TerrainHeightmap';
import { LivingPokemonWildlife } from './LivingPokemonWildlife';

export const PokemonSpawner: React.FC = () => {
  const resetTrigger = useGameStore((state) => state.resetWorldTrigger);
  const weather = useWeatherStore((state) => state.current);
  const timeOfDay = useWeatherStore((state) => state.time);

  // Generate dynamic active Pokémon instances based on environment state
  const activePokemonList: ActivePokemon[] = useMemo(() => {
    return WORLD_CONFIG.initialSpawns.map((anchor, index) => {
      // Ecological niche context
      const isNearWater = anchor.preferredHabitat === 'WatersEdge';
      const isNearTrees = anchor.preferredHabitat === 'Forest';
      const isNearRocks = anchor.preferredHabitat === 'Mountain' || anchor.preferredHabitat === 'Cave';

      const candidates = calculateSpawnCandidates({
        biomeName: WORLD_CONFIG.name,
        timeOfDay,
        weather,
        isNearWater,
        isNearTrees,
        isNearRocks,
      });

      let nicheCandidates = candidates.filter((c) => {
        if (isNearWater) return c.species.canonicalHabitat === 'WatersEdge' || c.species.primaryType === 'Water';
        if (isNearTrees) return c.species.canonicalHabitat === 'Forest' || c.species.primaryType === 'Grass' || c.species.primaryType === 'Bug' || c.species.id === 'pikachu';
        if (isNearRocks) return c.species.canonicalHabitat === 'Mountain' || c.species.canonicalHabitat === 'Cave' || c.species.primaryType === 'Rock' || c.species.primaryType === 'Ground' || c.species.primaryType === 'Fire';
        return true;
      });

      if (nicheCandidates.length === 0) {
        nicheCandidates = candidates;
      }

      // Weighted random selection
      const totalWeight = nicheCandidates.reduce((sum, c) => sum + c.finalWeight, 0);
      let randomVal = Math.random() * totalWeight;
      let selectedSpecies = getPokemonById(anchor.speciesId) || nicheCandidates[0].species;

      for (const candidate of nicheCandidates) {
        randomVal -= candidate.finalWeight;
        if (randomVal <= 0) {
          selectedSpecies = candidate.species;
          break;
        }
      }

      const posX = anchor.position[0];
      const posZ = anchor.position[2];
      const posY = TerrainHeightmap.getHeight(posX, posZ);

      const baseLevel = selectedSpecies.encounterRarity === 'Rare' || selectedSpecies.encounterRarity === 'VeryRare'
        ? 5 + Math.floor(Math.random() * 4)
        : 3 + Math.floor(Math.random() * 3);

      return {
        instanceId: `pkmn-${selectedSpecies.id}-${index}-${resetTrigger}-${timeOfDay}`,
        speciesId: selectedSpecies.id,
        position: [posX, posY, posZ] as [number, number, number],
        targetPosition: [
          posX + (Math.random() * 6 - 3),
          posY,
          posZ + (Math.random() * 6 - 3),
        ],
        rotation: Math.random() * Math.PI * 2,
        state: 'IDLE',
        stateTimer: 3 + Math.random() * 3,
        currentHp: selectedSpecies.baseStats.hp,
        maxHp: selectedSpecies.baseStats.hp,
        level: baseLevel,
        scale: 1,
      };
    });
  }, [resetTrigger, timeOfDay, weather]);

  return (
    <group>
      {activePokemonList.map((pokemon) => (
        <LivingPokemonWildlife key={pokemon.instanceId} pokemon={pokemon} />
      ))}
    </group>
  );
};
