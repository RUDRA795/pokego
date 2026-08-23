/**
 * Pokémon 3D RPG — Item Execution Engine
 * 
 * Sourced from canonical Pokémon item mechanics:
 * Applies potions, revives, status remedies, evolution stones, and Poké Balls to runtime Pokémon.
 */

import { GAME_ITEMS_DATABASE, GameItem } from '../../data/items/items';
import { RuntimePokemon } from '../../battle/types';
import { StatusSystem } from '../../battle/status/StatusSystem';
import { evolvePokemon, checkEvolutionTrigger, EvolutionExecutionResult } from '../progression/EvolutionSystem';

export interface ItemUsageResult {
  success: boolean;
  message: string;
  evolutionResult?: EvolutionExecutionResult | null;
}

export class ItemSystem {
  /**
   * Applies an item to a target Pokémon instance.
   */
  public static useItemOnPokemon(
    itemId: string,
    pokemon: RuntimePokemon
  ): ItemUsageResult {
    const item = GAME_ITEMS_DATABASE[itemId];
    if (!item) {
      return { success: false, message: 'Item not found in database.' };
    }

    // 1. Healing / Revive
    if (item.category === 'HEALING') {
      const maxHp = pokemon.calculatedStats.hp;

      if (item.revivesFainted) {
        if (pokemon.currentHp > 0) {
          return { success: false, message: `${pokemon.name} is not fainted!` };
        }
        const heal = item.healAmount ? Math.min(maxHp, item.healAmount) : Math.floor(maxHp / 2);
        pokemon.currentHp = heal;
        return { success: true, message: `${pokemon.name} was revived and regained ${heal} HP!` };
      }

      if (pokemon.currentHp <= 0) {
        return { success: false, message: `${pokemon.name} is fainted and cannot use potions!` };
      }

      if (pokemon.currentHp >= maxHp) {
        return { success: false, message: `${pokemon.name}'s HP is already full!` };
      }

      const prevHp = pokemon.currentHp;
      pokemon.currentHp = Math.min(maxHp, pokemon.currentHp + (item.healAmount || 0));
      const healed = pokemon.currentHp - prevHp;
      return { success: true, message: `${pokemon.name} recovered ${healed} HP!` };
    }

    // 2. Status Remedy
    if (item.category === 'STATUS_REMEDY') {
      if (!pokemon.status || pokemon.status === 'NONE') {
        return { success: false, message: `${pokemon.name} has no status condition!` };
      }

      if (item.curesStatus === 'ALL' || item.curesStatus === pokemon.status) {
        StatusSystem.cureStatus(pokemon);
        return { success: true, message: `${pokemon.name}'s status returned to normal!` };
      }

      return { success: false, message: `It had no effect on ${pokemon.name}'s ${pokemon.status.toLowerCase()}!` };
    }

    // 3. Evolution Stone
    if (item.category === 'EVOLUTION_STONE' && item.evolutionStoneName) {
      const targetSpeciesId = checkEvolutionTrigger(pokemon, 'item', item.evolutionStoneName);
      if (!targetSpeciesId) {
        return { success: false, message: `${pokemon.name} cannot evolve using ${item.name}!` };
      }

      const evo = evolvePokemon(pokemon, targetSpeciesId);
      if (evo) {
        return {
          success: true,
          message: `Congratulations! ${evo.oldSpeciesName} evolved into ${evo.newSpeciesName}!`,
          evolutionResult: evo,
        };
      }
    }

    return { success: false, message: 'Item cannot be used right now.' };
  }
}
