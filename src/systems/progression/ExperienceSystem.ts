/**
 * Pokémon 3D RPG — Experience & Leveling System
 * 
 * Sourced from canonical Pokémon core game experience growth models.
 * Calculates defeated Pokémon XP yield, level progression, and stat recalculations.
 */

import { PokemonSpeciesData } from '../../types/pokemon';
import { RuntimePokemon } from '../../battle/types';
import { calculateAllStats } from '../../battle/StatCalculator';
import { getPokemonById } from '../../data/pokemon';

export interface LevelUpResult {
  didLevelUp: boolean;
  newLevel: number;
  oldStats: RuntimePokemon['calculatedStats'];
  newStats: RuntimePokemon['calculatedStats'];
  evolutionCandidateId: string | null;
}

/**
 * Calculates XP earned by defeating an opponent Pokémon.
 * Formula: floor((BaseExp * OpponentLevel) / 7)
 */
export function calculateExpYield(opponentSpecies: PokemonSpeciesData, opponentLevel: number): number {
  const baseExp = opponentSpecies.baseExp || 64;
  return Math.max(1, Math.floor((baseExp * opponentLevel) / 7));
}

/**
 * Total cumulative EXP required to reach a specific level (Medium-Fast: Level^3).
 */
export function getExpForLevel(level: number): number {
  return Math.pow(level, 3);
}

/**
 * Awards experience to a Pokémon and processes potential level-ups and evolution checks.
 */
export function awardExperience(pokemon: RuntimePokemon, expGained: number): LevelUpResult {
  const species = getPokemonById(pokemon.speciesId);
  if (!species) {
    return {
      didLevelUp: false,
      newLevel: pokemon.level,
      oldStats: pokemon.calculatedStats,
      newStats: pokemon.calculatedStats,
      evolutionCandidateId: null,
    };
  }

  const oldStats = { ...pokemon.calculatedStats };
  pokemon.experience += expGained;

  let didLevelUp = false;
  let currentLevel = pokemon.level;

  // Max Level 100
  while (currentLevel < 100) {
    const requiredExp = getExpForLevel(currentLevel + 1);
    if (pokemon.experience >= requiredExp) {
      currentLevel++;
      didLevelUp = true;
    } else {
      break;
    }
  }

  let evolutionCandidateId: string | null = null;

  if (didLevelUp) {
    pokemon.level = currentLevel;
    const nextLevelReq = getExpForLevel(currentLevel + 1);
    pokemon.experienceToNextLevel = Math.max(0, nextLevelReq - pokemon.experience);

    // Recalculate stats
    const newStats = calculateAllStats(species.baseStats, currentLevel);
    const hpDelta = newStats.hp - oldStats.hp;
    pokemon.currentHp = Math.min(newStats.hp, pokemon.currentHp + Math.max(0, hpDelta));
    pokemon.calculatedStats = newStats;

    // Check level-based evolution
    if (species.evolution?.evolvesTo) {
      for (const branch of species.evolution.evolvesTo) {
        if (branch.trigger === 'level' && branch.minLevel && currentLevel >= branch.minLevel) {
          evolutionCandidateId = branch.targetSpeciesId;
          break;
        }
      }
    }

    return {
      didLevelUp: true,
      newLevel: currentLevel,
      oldStats,
      newStats,
      evolutionCandidateId,
    };
  }

  const nextLevelReq = getExpForLevel(currentLevel + 1);
  pokemon.experienceToNextLevel = Math.max(0, nextLevelReq - pokemon.experience);

  return {
    didLevelUp: false,
    newLevel: currentLevel,
    oldStats,
    newStats: oldStats,
    evolutionCandidateId: null,
  };
}
