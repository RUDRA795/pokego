/**
 * Pokémon 3D RPG — Canonical Capture Engine & Poké Ball System
 * 
 * Implements the official capture probability formula:
 * a = floor((3 * MaxHP - 2 * CurrentHP) * CatchRate * BallMultiplier / (3 * MaxHP)) * StatusBonus
 * b = floor(65536 * (a / 255)^0.25)
 */

import { RuntimePokemon, StatusCondition } from './types';
import { PokemonSpeciesData } from '../types/pokemon';

export interface PokeBallItem {
  id: string;
  name: string;
  catchMultiplier: number;
  description: string;
}

export const POKE_BALL_DATABASE: Record<string, PokeBallItem> = {
  poke_ball: {
    id: 'poke_ball',
    name: 'Poké Ball',
    catchMultiplier: 1.0,
    description: 'A device for catching wild Pokémon. It is thrown like a ball at the target.',
  },
  great_ball: {
    id: 'great_ball',
    name: 'Great Ball',
    catchMultiplier: 1.5,
    description: 'A good, high-performance Poké Ball with a higher catch rate than a standard Poké Ball.',
  },
  ultra_ball: {
    id: 'ultra_ball',
    name: 'Ultra Ball',
    catchMultiplier: 2.0,
    description: 'An ultra-high-performance Poké Ball with a higher catch rate than a Great Ball.',
  },
  master_ball: {
    id: 'master_ball',
    name: 'Master Ball',
    catchMultiplier: 255.0,
    description: 'The best Poké Ball that captures any wild Pokémon without fail.',
  },
};

export interface CaptureAttemptResult {
  isSuccess: boolean;
  shakes: number; // 0 to 3 shakes before break, or 3 shakes + click for success
  captureRateVal: number;
}

/**
 * Evaluates whether a capture attempt succeeds and calculates ball shakes.
 */
export function attemptCapture(
  wildPokemon: RuntimePokemon,
  wildSpecies: PokemonSpeciesData,
  ballId: string = 'poke_ball'
): CaptureAttemptResult {
  const ball = POKE_BALL_DATABASE[ballId] || POKE_BALL_DATABASE.poke_ball;

  // Master Ball rule: Guaranteed capture without checks
  if (ballId === 'master_ball') {
    return {
      isSuccess: true,
      shakes: 3,
      captureRateVal: 255,
    };
  }

  const maxHp = wildPokemon.calculatedStats.hp;
  const currentHp = Math.max(1, wildPokemon.currentHp);
  const catchRate = wildSpecies.catchRate || 45;

  // Status Bonus
  let statusBonus = 1.0;
  if (wildPokemon.status === 'SLEEP' || wildPokemon.status === 'FREEZE') {
    statusBonus = 2.0;
  } else if (wildPokemon.status === 'PARALYSIS' || wildPokemon.status === 'POISON' || wildPokemon.status === 'BURN') {
    statusBonus = 1.5;
  }

  // Modified Catch Rate Value (a)
  const hpFactor = Math.floor((3 * maxHp - 2 * currentHp) / (3 * maxHp));
  let a = Math.floor(hpFactor * catchRate * ball.catchMultiplier * statusBonus);
  a = Math.max(1, Math.min(255, a));

  // Guaranteed capture if a >= 255
  if (a >= 255) {
    return {
      isSuccess: true,
      shakes: 3,
      captureRateVal: a,
    };
  }

  // Shake probability threshold (b)
  const b = Math.floor(65536 * Math.pow(a / 255, 0.25));

  // Perform 4 shake checks
  let shakes = 0;
  for (let i = 0; i < 4; i++) {
    const roll = Math.floor(Math.random() * 65536);
    if (roll < b) {
      shakes++;
    } else {
      break;
    }
  }

  const isSuccess = shakes >= 4;

  return {
    isSuccess,
    shakes: Math.min(3, shakes),
    captureRateVal: a,
  };
}
