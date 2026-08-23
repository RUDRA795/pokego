/**
 * Pokémon 3D RPG — Canonical Pokémon Type System & 18x18 Effectiveness Matrix
 * 
 * Sourced directly from official Pokémon battle mechanics.
 * Defines all 18 types, visual theme colors, and the complete interaction chart.
 */

import { PokemonType } from '../../types/pokemon';

export interface TypeVisualTheme {
  primaryColor: string;
  badgeGradient: string;
  borderColor: string;
  textColor: string;
}

export const POKEMON_TYPE_THEMES: Record<PokemonType, TypeVisualTheme> = {
  Normal: {
    primaryColor: '#9fa19f',
    badgeGradient: 'from-stone-400 to-stone-600',
    borderColor: 'border-stone-400/50',
    textColor: 'text-stone-100',
  },
  Fire: {
    primaryColor: '#e62829',
    badgeGradient: 'from-orange-500 to-red-600',
    borderColor: 'border-orange-400/50',
    textColor: 'text-orange-100',
  },
  Water: {
    primaryColor: '#2980ef',
    badgeGradient: 'from-sky-500 to-blue-600',
    borderColor: 'border-sky-400/50',
    textColor: 'text-sky-100',
  },
  Grass: {
    primaryColor: '#3fa129',
    badgeGradient: 'from-emerald-500 to-green-600',
    borderColor: 'border-emerald-400/50',
    textColor: 'text-emerald-100',
  },
  Electric: {
    primaryColor: '#fac000',
    badgeGradient: 'from-amber-400 to-yellow-500',
    borderColor: 'border-yellow-300/50',
    textColor: 'text-amber-950',
  },
  Ice: {
    primaryColor: '#3dcef3',
    badgeGradient: 'from-cyan-300 to-teal-500',
    borderColor: 'border-cyan-300/50',
    textColor: 'text-cyan-950',
  },
  Fighting: {
    primaryColor: '#ff8000',
    badgeGradient: 'from-amber-600 to-red-700',
    borderColor: 'border-amber-500/50',
    textColor: 'text-amber-100',
  },
  Poison: {
    primaryColor: '#9141cb',
    badgeGradient: 'from-purple-500 to-fuchsia-700',
    borderColor: 'border-purple-400/50',
    textColor: 'text-purple-100',
  },
  Ground: {
    primaryColor: '#915121',
    badgeGradient: 'from-amber-700 to-yellow-800',
    borderColor: 'border-amber-600/50',
    textColor: 'text-amber-100',
  },
  Flying: {
    primaryColor: '#81b9ef',
    badgeGradient: 'from-indigo-300 to-sky-500',
    borderColor: 'border-sky-300/50',
    textColor: 'text-sky-950',
  },
  Psychic: {
    primaryColor: '#ef4179',
    badgeGradient: 'from-pink-500 to-rose-600',
    borderColor: 'border-pink-400/50',
    textColor: 'text-pink-100',
  },
  Bug: {
    primaryColor: '#91a119',
    badgeGradient: 'from-lime-500 to-emerald-700',
    borderColor: 'border-lime-400/50',
    textColor: 'text-lime-100',
  },
  Rock: {
    primaryColor: '#afa981',
    badgeGradient: 'from-stone-500 to-amber-700',
    borderColor: 'border-stone-400/50',
    textColor: 'text-stone-100',
  },
  Ghost: {
    primaryColor: '#704170',
    badgeGradient: 'from-purple-800 to-indigo-950',
    borderColor: 'border-purple-500/50',
    textColor: 'text-purple-200',
  },
  Dragon: {
    primaryColor: '#5060e1',
    badgeGradient: 'from-indigo-600 to-purple-800',
    borderColor: 'border-indigo-400/50',
    textColor: 'text-indigo-100',
  },
  Dark: {
    primaryColor: '#50413f',
    badgeGradient: 'from-neutral-800 to-stone-950',
    borderColor: 'border-neutral-600/50',
    textColor: 'text-neutral-200',
  },
  Steel: {
    primaryColor: '#60a1b8',
    badgeGradient: 'from-slate-400 to-cyan-700',
    borderColor: 'border-slate-300/50',
    textColor: 'text-slate-100',
  },
  Fairy: {
    primaryColor: '#ef70ef',
    badgeGradient: 'from-pink-400 to-fuchsia-500',
    borderColor: 'border-pink-300/50',
    textColor: 'text-pink-100',
  },
};

/**
 * Full 18x18 Canonical Type Effectiveness Matrix
 * Matrix format: TYPE_CHART[AttackingType][DefendingType] = Multiplier (0, 0.5, 1, 2)
 */
export const TYPE_CHART: Record<PokemonType, Partial<Record<PokemonType, number>>> = {
  Normal: {
    Rock: 0.5,
    Ghost: 0,
    Steel: 0.5,
  },
  Fire: {
    Fire: 0.5,
    Water: 0.5,
    Grass: 2,
    Ice: 2,
    Bug: 2,
    Rock: 0.5,
    Dragon: 0.5,
    Steel: 2,
  },
  Water: {
    Fire: 2,
    Water: 0.5,
    Grass: 0.5,
    Ground: 2,
    Rock: 2,
    Dragon: 0.5,
  },
  Grass: {
    Fire: 0.5,
    Water: 2,
    Grass: 0.5,
    Poison: 0.5,
    Ground: 2,
    Flying: 0.5,
    Bug: 0.5,
    Rock: 2,
    Dragon: 0.5,
    Steel: 0.5,
  },
  Electric: {
    Water: 2,
    Electric: 0.5,
    Grass: 0.5,
    Ground: 0,
    Flying: 2,
    Dragon: 0.5,
  },
  Ice: {
    Fire: 0.5,
    Water: 0.5,
    Grass: 2,
    Ice: 0.5,
    Ground: 2,
    Flying: 2,
    Dragon: 2,
    Steel: 0.5,
  },
  Fighting: {
    Normal: 2,
    Ice: 2,
    Poison: 0.5,
    Flying: 0.5,
    Psychic: 0.5,
    Bug: 0.5,
    Rock: 2,
    Ghost: 0,
    Dark: 2,
    Steel: 2,
    Fairy: 0.5,
  },
  Poison: {
    Grass: 2,
    Poison: 0.5,
    Ground: 0.5,
    Rock: 0.5,
    Ghost: 0.5,
    Steel: 0,
    Fairy: 2,
  },
  Ground: {
    Fire: 2,
    Electric: 2,
    Grass: 0.5,
    Poison: 2,
    Flying: 0,
    Bug: 0.5,
    Rock: 2,
    Steel: 2,
  },
  Flying: {
    Electric: 0.5,
    Grass: 2,
    Fighting: 2,
    Bug: 2,
    Rock: 0.5,
    Steel: 0.5,
  },
  Psychic: {
    Fighting: 2,
    Poison: 2,
    Psychic: 0.5,
    Dark: 0,
    Steel: 0.5,
  },
  Bug: {
    Fire: 0.5,
    Grass: 2,
    Fighting: 0.5,
    Poison: 0.5,
    Flying: 0.5,
    Psychic: 2,
    Ghost: 0.5,
    Dark: 2,
    Steel: 0.5,
    Fairy: 0.5,
  },
  Rock: {
    Fire: 2,
    Ice: 2,
    Fighting: 0.5,
    Ground: 0.5,
    Flying: 2,
    Bug: 2,
    Steel: 0.5,
  },
  Ghost: {
    Normal: 0,
    Psychic: 2,
    Ghost: 2,
    Dark: 0.5,
  },
  Dragon: {
    Dragon: 2,
    Steel: 0.5,
    Fairy: 0,
  },
  Dark: {
    Fighting: 0.5,
    Psychic: 2,
    Ghost: 2,
    Dark: 0.5,
    Fairy: 0.5,
  },
  Steel: {
    Fire: 0.5,
    Water: 0.5,
    Electric: 0.5,
    Ice: 2,
    Rock: 2,
    Steel: 0.5,
    Fairy: 2,
  },
  Fairy: {
    Fire: 0.5,
    Fighting: 2,
    Poison: 0.5,
    Dragon: 2,
    Dark: 2,
    Steel: 0.5,
  },
};

/**
 * Calculates effectiveness multiplier of an attacking move type against a defending Pokémon.
 * Properly combines dual-typing multipliers (e.g., Grass/Flying defending against Ice = 2.0 * 2.0 = 4.0).
 */
export function getTypeEffectiveness(
  attackType: PokemonType,
  defenderType1: PokemonType,
  defenderType2?: PokemonType
): number {
  const mult1 = TYPE_CHART[attackType]?.[defenderType1] ?? 1.0;
  if (!defenderType2) return mult1;

  const mult2 = TYPE_CHART[attackType]?.[defenderType2] ?? 1.0;
  return mult1 * mult2;
}

/**
 * Checks Same-Type Attack Bonus (STAB)
 */
export function getSTABMultiplier(
  moveType: PokemonType,
  attackerType1: PokemonType,
  attackerType2?: PokemonType
): number {
  if (moveType === attackerType1 || moveType === attackerType2) {
    return 1.5;
  }
  return 1.0;
}
