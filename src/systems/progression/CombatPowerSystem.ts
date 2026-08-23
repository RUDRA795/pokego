/**
 * Pokémon 3D RPG — Pokémon GO Style Combat Power (CP) & Throw Rating Engine
 * 
 * Provides:
 * - Combat Power (CP) calculation based on canonical base stats, level multiplier (CPM), and IVs.
 * - Throw rating detection: Nice, Great, Excellent, Curveball throw modifiers.
 */

import { PokemonStats } from '../../types/pokemon';

export interface ThrowRatingResult {
  rating: 'EXCELLENT' | 'GREAT' | 'NICE' | 'NORMAL';
  text: string;
  catchMultiplier: number;
  bonusXp: number;
  isCurveball: boolean;
}

export class CombatPowerSystem {
  /**
   * Calculates Pokémon GO style Combat Power (CP) rating.
   */
  public static calculateCP(baseStats: PokemonStats, level: number, ivTotal = 30): number {
    const cpm = 0.094 * Math.sqrt(level * 10); // Calibrated level multiplier
    const attack = baseStats.attack + (ivTotal / 3);
    const defense = baseStats.defense + (ivTotal / 3);
    const hp = baseStats.hp + (ivTotal / 3);

    const rawCp = (attack * Math.sqrt(defense) * Math.sqrt(hp) * Math.pow(cpm, 2)) / 10;
    return Math.max(10, Math.floor(rawCp));
  }

  /**
   * Evaluates throw quality based on target ring diameter and spin.
   * @param ringScale Target ring radius (0.1 to 1.0)
   * @param isCurveball Whether the throw had curveball spin
   */
  public static evaluateThrow(ringScale: number, isCurveball = false): ThrowRatingResult {
    let rating: 'EXCELLENT' | 'GREAT' | 'NICE' | 'NORMAL' = 'NORMAL';
    let text = '';
    let multiplier = 1.0;
    let xp = 100;

    if (ringScale <= 0.35) {
      rating = 'EXCELLENT';
      text = 'Excellent Throw!';
      multiplier = 1.7;
      xp += 100;
    } else if (ringScale <= 0.7) {
      rating = 'GREAT';
      text = 'Great Throw!';
      multiplier = 1.35;
      xp += 50;
    } else if (ringScale < 0.95) {
      rating = 'NICE';
      text = 'Nice Throw!';
      multiplier = 1.15;
      xp += 20;
    }

    if (isCurveball) {
      multiplier *= 1.7;
      xp += 10;
      text = text ? `${text} (Curveball)` : 'Curveball Throw!';
    }

    return {
      rating,
      text: text || 'Nice!',
      catchMultiplier: multiplier,
      bonusXp: xp,
      isCurveball,
    };
  }
}
