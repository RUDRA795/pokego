/**
 * Pokémon 3D RPG — Canonical Ability System Types
 */

import { PokemonType } from '../../types/pokemon';
import { RuntimePokemon } from '../types';

export type AbilityTrigger =
  | 'ON_ENTRY'
  | 'ON_DAMAGE_CALC_ATTACK'
  | 'ON_DAMAGE_CALC_DEFEND'
  | 'ON_HIT_RECEIVED'
  | 'END_OF_TURN'
  | 'PASSIVE_SPEED';

export interface AbilityContext {
  pokemon: RuntimePokemon;
  opponent?: RuntimePokemon;
  moveType?: PokemonType;
  moveCategory?: 'Physical' | 'Special' | 'Status';
  weather?: string;
  isContact?: boolean;
}

export interface AbilityEffectResult {
  triggered: boolean;
  damageMultiplier?: number;
  isImmune?: boolean;
  hpRestored?: number;
  statusApplied?: 'PARALYSIS' | 'BURN' | 'POISON' | 'SLEEP' | 'FREEZE';
  statChange?: { stat: 'attack' | 'defense' | 'speed'; stages: number };
  message?: string;
}
