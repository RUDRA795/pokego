/**
 * Pokémon 3D RPG — Ecological Pokémon Spawner Engine
 * 
 * Dynamically determines active overworld Pokémon by evaluating:
 * - Island Biome & Anchor points (Pond, Forest, Rocks, Grassland)
 * - Active Weather (SUNNY, CLOUDY, RAIN)
 * - Time of Day (DAY, NIGHT)
 * - Ecological suitability and rarity weighting
 */

import React, { useMemo } from 'react';
import { WORLD_CONFIG } from '../../data/biomes';
import { getPokemonById, calculateSpawnCandidates } from '../../data/pokemon';
import { ActivePokemon } from '../../types/pokemon';
import { useGameStore } from '../../state/useGameStore';
import { useWeatherStore } from '../../state/useWeatherStore';
import { RoamingPokemon } from './RoamingPokemon';

export const PokemonSpawner: React.FC = () => {
  const resetTrigger = useGameStore((state) => state.resetWorldTrigger);
  const weather = useWeatherStore((state) => state.current);
  const timeOfDay = useWeatherStore((state) => state.time);

  // Generate dynamic active Pokémon instances based on environment state
  const activePokemonList: ActivePokemon[] = useMemo(() => {
    return WORLD_CONFIG.initialSpawns.map((anchor, index) => {
      // Evaluate environmental context for this anchor position
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

      // Filter candidates matching the anchor's general ecological niche
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

      // Level scaling: Starters/Commons Lv. 3-6, Rare Lv. 5-8
      const baseLevel = selectedSpecies.encounterRarity === 'Rare' || selectedSpecies.encounterRarity === 'VeryRare'
        ? 5 + Math.floor(Math.random() * 4)
        : 3 + Math.floor(Math.random() * 3);

      return {
        instanceId: `pkmn-${selectedSpecies.id}-${index}-${resetTrigger}-${timeOfDay}`,
        speciesId: selectedSpecies.id,
        position: [...anchor.position] as [number, number, number],
        targetPosition: [
          anchor.position[0] + (Math.random() * 4 - 2),
          0,
          anchor.position[2] + (Math.random() * 4 - 2),
        ],
        rotation: Math.random() * Math.PI * 2,
        state: 'IDLE',
        stateTimer: 2 + Math.random() * 2,
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
        <RoamingPokemon key={pokemon.instanceId} pokemon={pokemon} />
      ))}
    </group>
  );
};
