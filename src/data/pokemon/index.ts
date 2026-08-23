/**
 * Pokémon 3D RPG — Central Pokémon Data Registry
 * 
 * Provides unified, typed accessors to Pokémon species data, moves,
 * type effectiveness, and ecological spawn weighting algorithms.
 */

import { PokemonSpeciesData, CanonicalHabitat } from '../../types/pokemon';
import { WeatherType, TimeOfDay } from '../../types/weather';
import { POKEMON_SPECIES_DATABASE, POKEMON_SPECIES_LIST } from './species';
import { POKEMON_MOVES } from './moves';
import { POKEMON_TYPE_THEMES, TYPE_CHART, getTypeEffectiveness, getSTABMultiplier } from './types';

export interface WorldSpawnContext {
  biomeName: string;
  timeOfDay: TimeOfDay;
  weather: WeatherType;
  isNearWater: boolean;
  isNearTrees: boolean;
  isNearRocks: boolean;
}

export interface WeightedSpawnCandidate {
  species: PokemonSpeciesData;
  finalWeight: number;
}

// ==========================================
// 1. DATA ACCESSORS
// ==========================================

export function getPokemonById(id: string): PokemonSpeciesData | undefined {
  return POKEMON_SPECIES_DATABASE[id.toLowerCase()];
}

export function getPokemonByDexNumber(dexNumber: number): PokemonSpeciesData | undefined {
  return POKEMON_SPECIES_LIST.find((p) => p.nationalDexNumber === dexNumber);
}

export function getAllPokemon(): PokemonSpeciesData[] {
  return POKEMON_SPECIES_LIST;
}

export function getPokemonByHabitat(habitat: CanonicalHabitat): PokemonSpeciesData[] {
  return POKEMON_SPECIES_LIST.filter((p) => p.canonicalHabitat === habitat);
}

// ==========================================
// 2. SPAWN INTELLIGENCE ENGINE
// ==========================================

const RARITY_BASE_WEIGHTS: Record<PokemonSpeciesData['encounterRarity'], number> = {
  Common: 100,
  Uncommon: 45,
  Rare: 15,
  VeryRare: 4,
};

/**
 * Calculates weighted spawn candidate pool by combining:
 * - SOURCE DATA: Canonical habitat, diurnal/nocturnal nature, species typing
 * - GAME DESIGN: Local collider proximity (water/trees/rocks), active weather, day/night cycle
 */
export function calculateSpawnCandidates(context: WorldSpawnContext): WeightedSpawnCandidate[] {
  const candidates: WeightedSpawnCandidate[] = [];

  for (const species of POKEMON_SPECIES_LIST) {
    let weight = RARITY_BASE_WEIGHTS[species.encounterRarity] || 50;

    // 1. Water / Pond Proximity Multiplier (GAME DESIGN)
    if (context.isNearWater) {
      if (species.canonicalHabitat === 'WatersEdge' || species.primaryType === 'Water' || species.secondaryType === 'Water') {
        weight *= 4.0; // Huge boost near water
      } else {
        weight *= 0.3; // Terrestrial Pokémon less likely in water
      }
    } else {
      if (species.visualConfig.locomotion === 'swimming') {
        weight = 0; // Pure swimmers cannot spawn on dry land
      }
    }

    // 2. Tree / Forest Proximity Multiplier (GAME DESIGN)
    if (context.isNearTrees) {
      if (species.canonicalHabitat === 'Forest' || species.primaryType === 'Bug' || species.primaryType === 'Grass') {
        weight *= 2.5;
      }
    }

    // 3. Rock / Boulder Proximity Multiplier (GAME DESIGN)
    if (context.isNearRocks) {
      if (species.canonicalHabitat === 'Mountain' || species.canonicalHabitat === 'Cave' || species.primaryType === 'Rock' || species.primaryType === 'Ground') {
        weight *= 2.5;
      }
    }

    // 4. Time of Day Multipliers (SOURCE LORE + GAME DESIGN)
    if (context.timeOfDay === 'NIGHT') {
      if (species.id === 'zubat' || species.id === 'gastly' || species.id === 'oddish') {
        weight *= 4.0; // Nocturnal species peak at night
      } else if (species.id === 'pidgey' || species.id === 'caterpie' || species.id === 'charmander') {
        weight *= 0.2; // Diurnal species rare at night
      }
    } else {
      // DAY
      if (species.id === 'zubat' || species.id === 'gastly') {
        weight *= 0.15; // Nocturnal species hide during day
      } else if (species.id === 'pidgey' || species.id === 'pikachu' || species.id === 'bulbasaur') {
        weight *= 1.8;
      }
    }

    // 5. Weather Multipliers (SOURCE MECHANICS + GAME DESIGN)
    if (context.weather === 'RAIN') {
      if (species.primaryType === 'Water' || species.secondaryType === 'Water') {
        weight *= 2.5;
      } else if (species.primaryType === 'Fire') {
        weight *= 0.3; // Fire Pokémon avoid rain
      }
    } else if (context.weather === 'SUNNY') {
      if (species.primaryType === 'Fire' || species.primaryType === 'Grass') {
        weight *= 2.0;
      }
    }

    if (weight > 0) {
      candidates.push({ species, finalWeight: weight });
    }
  }

  return candidates;
}

// Re-export type and move assets
export {
  POKEMON_SPECIES_DATABASE,
  POKEMON_SPECIES_LIST,
  POKEMON_MOVES,
  POKEMON_TYPE_THEMES,
  TYPE_CHART,
  getTypeEffectiveness,
  getSTABMultiplier,
};
