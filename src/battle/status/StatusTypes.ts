/**
 * Pokémon 3D RPG — Status Condition Types
 * 
 * Standard Modern Pokémon Core (Gen 6-9) Status Specifications.
 */

export type PrimaryStatus =
  | 'NONE'
  | 'BURN'
  | 'PARALYSIS'
  | 'POISON'
  | 'BADLY_POISONED'
  | 'SLEEP'
  | 'FREEZE';

export type VolatileStatus =
  | 'CONFUSION'
  | 'FLINCH'
  | 'INFATUATION'
  | 'LEECH_SEED';

export interface StatusState {
  primary: PrimaryStatus;
  turnsActive: number;
  sleepTurnsRemaining?: number;
  toxicCounter?: number;
  volatiles?: VolatileStatus[];
}

export interface StatusTurnResult {
  canMove: boolean;
  damageTaken: number;
  statusCured: boolean;
  message?: string;
}
