/**
 * Pokémon 3D RPG — Canonical Evolution Engine (Multi-Trigger Architecture)
 * 
 * Evaluates triggers across canonical categories:
 * - LEVEL (e.g. Bulbasaur Lv 16 -> Ivysaur)
 * - ITEM (e.g. Pikachu + Thunder Stone -> Raichu, Eevee + Stones -> Vaporeon/Jolteon/Flareon)
 * - FRIENDSHIP (e.g. Golbat -> Crobat)
 * - TRADE (e.g. Haunter -> Gengar, Graveler -> Golem, Onix -> Steelix)
 * - TIME_OF_DAY (e.g. Eevee -> Espeon/Umbreon)
 */

import { RuntimePokemon } from '../../battle/types';
import { getPokemonById } from '../../data/pokemon';
import { calculateAllStats } from '../../battle/StatCalculator';

export type EvolutionTriggerType =
  | 'level'
  | 'item'
  | 'trade'
  | 'friendship'
  | 'time_of_day'
  | 'location';

export interface EvolutionQueryContext {
  trigger: EvolutionTriggerType;
  item?: string;
  timeOfDay?: 'DAY' | 'NIGHT';
  friendship?: number;
}

export interface EvolutionExecutionResult {
  success: boolean;
  oldSpeciesId: string;
  newSpeciesId: string;
  oldSpeciesName: string;
  newSpeciesName: string;
  evolvedPokemon: RuntimePokemon;
}

/**
 * Checks if a Pokémon can evolve based on context criteria.
 */
export function checkEvolutionTrigger(
  pokemon: RuntimePokemon,
  trigger: EvolutionTriggerType,
  itemOrContext?: string | EvolutionQueryContext
): string | null {
  const currentSpecies = getPokemonById(pokemon.speciesId);
  if (!currentSpecies || !currentSpecies.evolution?.evolvesTo) return null;

  const item = typeof itemOrContext === 'string' ? itemOrContext : itemOrContext?.item;
  const timeOfDay = typeof itemOrContext === 'object' ? itemOrContext?.timeOfDay : undefined;

  for (const branch of currentSpecies.evolution.evolvesTo) {
    if (branch.trigger === trigger) {
      if (trigger === 'level' && branch.minLevel && pokemon.level >= branch.minLevel) {
        return branch.targetSpeciesId;
      }
      if (trigger === 'item' && branch.item && item && branch.item.toLowerCase() === item.toLowerCase()) {
        return branch.targetSpeciesId;
      }
      if (trigger === 'friendship') {
        return branch.targetSpeciesId;
      }
      if (trigger === 'trade') {
        return branch.targetSpeciesId;
      }
      if (trigger === 'time_of_day' && timeOfDay && branch.timeOfDay === timeOfDay.toLowerCase()) {
        return branch.targetSpeciesId;
      }
    }
  }

  return null;
}

/**
 * Executes evolutionary transformation on a runtime Pokémon instance.
 */
export function evolvePokemon(
  pokemon: RuntimePokemon,
  targetSpeciesId: string
): EvolutionExecutionResult | null {
  const oldSpecies = getPokemonById(pokemon.speciesId);
  const newSpecies = getPokemonById(targetSpeciesId);

  if (!oldSpecies || !newSpecies) return null;

  const oldHpMax = pokemon.calculatedStats.hp;
  const oldSpeciesName = oldSpecies.name;
  const newSpeciesName = newSpecies.name;

  // Transform species ID and default name
  pokemon.speciesId = newSpecies.id;
  if (!pokemon.nickname || pokemon.nickname === oldSpeciesName) {
    pokemon.name = newSpeciesName;
  }

  // Recalculate stats with new species base stats
  const newStats = calculateAllStats(newSpecies.baseStats, pokemon.level);
  const hpRatio = pokemon.currentHp / Math.max(1, oldHpMax);
  pokemon.calculatedStats = newStats;
  pokemon.currentHp = Math.max(1, Math.floor(newStats.hp * hpRatio));

  // Add any new moves the evolved species knows at this level
  const learnedMoveIds = new Set(pokemon.moves.map((m) => m.move.id));
  const newAvailableMoves = newSpecies.learnset.filter(
    (l) => l.level <= pokemon.level && !learnedMoveIds.has(l.move.id)
  );

  // If party has room for moves (< 4)
  for (const item of newAvailableMoves) {
    if (pokemon.moves.length < 4) {
      pokemon.moves.push({
        move: item.move,
        currentPp: item.move.pp,
        maxPp: item.move.pp,
      });
    }
  }

  return {
    success: true,
    oldSpeciesId: oldSpecies.id,
    newSpeciesId: newSpecies.id,
    oldSpeciesName,
    newSpeciesName,
    evolvedPokemon: pokemon,
  };
}
