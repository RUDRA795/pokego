/**
 * Pokémon 3D RPG — Battle Weather System
 * 
 * Sourced from canonical Pokémon weather mechanics:
 * - Harsh Sunlight / SUNNY: Fire-type moves x1.5, Water-type moves x0.5.
 * - Rain / RAIN: Water-type moves x1.5, Fire-type moves x0.5.
 * - Sandstorm: Boosts Rock-type Special Defense by 1.5x.
 */

import { PokemonType } from '../../types/pokemon';

export type BattleWeatherType = 'CLEAR' | 'SUNNY' | 'RAIN' | 'SANDSTORM' | 'SNOW';

export class BattleWeatherSystem {
  /**
   * Calculates move damage multiplier under the current battle weather.
   */
  public static getWeatherDamageMultiplier(
    weather: BattleWeatherType,
    moveType: PokemonType
  ): number {
    if (weather === 'SUNNY') {
      if (moveType === 'Fire') return 1.5;
      if (moveType === 'Water') return 0.5;
    }

    if (weather === 'RAIN') {
      if (moveType === 'Water') return 1.5;
      if (moveType === 'Fire') return 0.5;
    }

    return 1.0;
  }

  /**
   * Calculates defensive stat bonuses under weather (e.g. Rock Sp. Def in Sandstorm).
   */
  public static getWeatherDefenseMultiplier(
    weather: BattleWeatherType,
    defenderTypes: PokemonType[]
  ): number {
    if (weather === 'SANDSTORM' && defenderTypes.includes('Rock')) {
      return 1.5;
    }
    return 1.0;
  }
}
