/**
 * Pokémon 3D RPG — Runtime Pokémon Factory & Instance Utilities
 * 
 * Creates isolated, dynamic Pokémon instances separate from static species records.
 * Populates level-appropriate learnset moves with full initial PP.
 */

import { PokemonSpeciesData } from '../types/pokemon';
import { RuntimePokemon, RuntimeMove } from './types';
import { calculateAllStats } from './StatCalculator';

/**
 * Creates a new RuntimePokemon instance from species data at a specific level.
 */
export function createRuntimePokemon(
  species: PokemonSpeciesData,
  level: number,
  isWild: boolean = false,
  customInstanceId?: string
): RuntimePokemon {
  const calculatedStats = calculateAllStats(species.baseStats, level);

  // Filter moves the Pokémon would know up to this level (up to 4 most recent moves)
  const eligibleMoves = species.learnset
    .filter((l) => l.level <= level)
    .map((l) => l.move);

  // Take the last 4 moves learned
  const selectedMoves = eligibleMoves.slice(-4);
  if (selectedMoves.length === 0 && species.learnset.length > 0) {
    selectedMoves.push(species.learnset[0].move);
  }

  const runtimeMoves: RuntimeMove[] = selectedMoves.map((m) => ({
    move: m,
    currentPp: m.pp,
    maxPp: m.pp,
  }));

  // Medium-Fast EXP Curve: Total EXP = Level^3
  const currentExp = Math.pow(level, 3);
  const nextLevelExp = Math.pow(level + 1, 3);

  return {
    instanceId: customInstanceId || `pkmn-inst-${species.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    speciesId: species.id,
    name: species.name,
    level,
    experience: currentExp,
    experienceToNextLevel: nextLevelExp - currentExp,
    currentHp: calculatedStats.hp,
    calculatedStats,
    moves: runtimeMoves,
    status: 'NONE',
    isWild,
  };
}
