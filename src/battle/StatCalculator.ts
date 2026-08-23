/**
 * Pokémon 3D RPG — Canonical Stat Calculation Engine
 * 
 * Sourced from standard core-series Pokémon stat growth formulas.
 * Translates static Base Stats + Level into dynamic Runtime Stats.
 */

import { PokemonStats, PokemonSpeciesData } from '../types/pokemon';

/**
 * Calculates Maximum HP for a Pokémon at a given level.
 * Formula: floor((2 * BaseHP * Level) / 100) + Level + 10
 */
export function calculateHP(baseHp: number, level: number): number {
  if (baseHp === 1) return 1; // Shedinja rule
  return Math.floor((2 * baseHp * level) / 100) + level + 10;
}

/**
 * Calculates any non-HP stat (Attack, Defense, Sp. Atk, Sp. Def, Speed).
 * Formula: floor((2 * BaseStat * Level) / 100) + 5
 */
export function calculateStat(baseStat: number, level: number): number {
  return Math.floor((2 * baseStat * level) / 100) + 5;
}

/**
 * Calculates all 6 runtime stats for a species at a given level.
 */
export function calculateAllStats(baseStats: PokemonStats, level: number): PokemonStats {
  const hp = calculateHP(baseStats.hp, level);
  const attack = calculateStat(baseStats.attack, level);
  const defense = calculateStat(baseStats.defense, level);
  const specialAttack = calculateStat(baseStats.specialAttack, level);
  const specialDefense = calculateStat(baseStats.specialDefense, level);
  const speed = calculateStat(baseStats.speed, level);

  return {
    hp,
    attack,
    defense,
    specialAttack,
    specialDefense,
    speed,
    baseStatTotal: hp + attack + defense + specialAttack + specialDefense + speed,
  };
}
