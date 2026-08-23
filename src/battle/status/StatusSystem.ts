/**
 * Pokémon 3D RPG — Advanced Status Condition System
 * 
 * Sourced from Modern Core Series (Gen 6-9) Battle Ruleset:
 * - BURN: Halves physical Attack stat; inflicts 1/16 max HP damage at end of turn.
 * - POISON: Inflicts 1/8 max HP damage at end of turn.
 * - BADLY_POISONED (Toxic): Inflicts escalating damage (N / 16 max HP each turn).
 * - PARALYSIS: Halves Speed stat; 25% chance of being fully paralyzed and unable to move.
 * - SLEEP: Lasts 1 to 3 turns; unable to act until wake-up.
 * - FREEZE: Unable to act; 20% chance to thaw each turn before moving.
 */

import { PrimaryStatus, StatusTurnResult } from './StatusTypes';
import { RuntimePokemon } from '../types';

export class StatusSystem {
  /**
   * Applies a primary status condition to a Pokémon if it currently has none.
   */
  public static applyStatus(
    pokemon: RuntimePokemon,
    status: PrimaryStatus
  ): { applied: boolean; message?: string } {
    if (pokemon.status && pokemon.status !== 'NONE') {
      return { applied: false, message: `${pokemon.name} is already afflicted by a status condition!` };
    }

    pokemon.status = status;
    pokemon.statusTurns = 0;

    let message = '';
    switch (status) {
      case 'BURN':
        message = `${pokemon.name} was burned!`;
        break;
      case 'PARALYSIS':
        message = `${pokemon.name} is paralyzed! It may be unable to move!`;
        break;
      case 'POISON':
        message = `${pokemon.name} was poisoned!`;
        break;
      case 'BADLY_POISONED':
        message = `${pokemon.name} was badly poisoned!`;
        break;
      case 'SLEEP':
        message = `${pokemon.name} fell asleep!`;
        break;
      case 'FREEZE':
        message = `${pokemon.name} was frozen solid!`;
        break;
      default:
        break;
    }

    return { applied: true, message };
  }

  /**
   * Evaluates if a status condition prevents the Pokémon from taking an action this turn.
   */
  public static checkCanMove(pokemon: RuntimePokemon): StatusTurnResult {
    const status = pokemon.status;

    if (!status || status === 'NONE') {
      return { canMove: true, damageTaken: 0, statusCured: false };
    }

    pokemon.statusTurns = (pokemon.statusTurns || 0) + 1;

    // 1. FREEZE Check (20% chance to thaw out)
    if (status === 'FREEZE') {
      if (Math.random() < 0.20) {
        pokemon.status = 'NONE';
        pokemon.statusTurns = 0;
        return {
          canMove: true,
          damageTaken: 0,
          statusCured: true,
          message: `${pokemon.name} thawed out!`,
        };
      }
      return {
        canMove: false,
        damageTaken: 0,
        statusCured: false,
        message: `${pokemon.name} is frozen solid and cannot move!`,
      };
    }

    // 2. SLEEP Check (Wakes up after 1-3 turns)
    if (status === 'SLEEP') {
      const maxSleepTurns = 3;
      if (pokemon.statusTurns >= maxSleepTurns || (pokemon.statusTurns > 1 && Math.random() < 0.33)) {
        pokemon.status = 'NONE';
        pokemon.statusTurns = 0;
        return {
          canMove: true,
          damageTaken: 0,
          statusCured: true,
          message: `${pokemon.name} woke up!`,
        };
      }
      return {
        canMove: false,
        damageTaken: 0,
        statusCured: false,
        message: `${pokemon.name} is fast asleep!`,
      };
    }

    // 3. PARALYSIS Check (25% chance fully paralyzed)
    if (status === 'PARALYSIS') {
      if (Math.random() < 0.25) {
        return {
          canMove: false,
          damageTaken: 0,
          statusCured: false,
          message: `${pokemon.name} is paralyzed! It can't move!`,
        };
      }
    }

    return { canMove: true, damageTaken: 0, statusCured: false };
  }

  /**
   * Applies end-of-turn status residual damage (Burn, Poison, Toxic).
   */
  public static processEndOfTurnDamage(pokemon: RuntimePokemon): { damage: number; message?: string } {
    const maxHp = pokemon.calculatedStats.hp;
    const status = pokemon.status;

    if (!status || status === 'NONE' || pokemon.currentHp <= 0) {
      return { damage: 0 };
    }

    let damage = 0;
    let message = '';

    if (status === 'BURN') {
      // 1/16 max HP
      damage = Math.max(1, Math.floor(maxHp / 16));
      pokemon.currentHp = Math.max(0, pokemon.currentHp - damage);
      message = `${pokemon.name} is hurt by its burn! (-${damage} HP)`;
    } else if (status === 'POISON') {
      // 1/8 max HP
      damage = Math.max(1, Math.floor(maxHp / 8));
      pokemon.currentHp = Math.max(0, pokemon.currentHp - damage);
      message = `${pokemon.name} is hurt by poison! (-${damage} HP)`;
    } else if (status === 'BADLY_POISONED') {
      // Escalating N / 16 max HP
      const turnCounter = Math.min(15, pokemon.statusTurns || 1);
      damage = Math.max(1, Math.floor((maxHp * turnCounter) / 16));
      pokemon.currentHp = Math.max(0, pokemon.currentHp - damage);
      message = `${pokemon.name} is hurt by poison! (-${damage} HP)`;
    }

    return { damage, message };
  }

  /**
   * Cures all primary and volatile status conditions.
   */
  public static cureStatus(pokemon: RuntimePokemon): string {
    const prev = pokemon.status;
    pokemon.status = 'NONE';
    pokemon.statusTurns = 0;
    return prev !== 'NONE' ? `${pokemon.name}'s status returned to normal!` : '';
  }
}
