/**
 * Pokémon 3D RPG — Versioned Save & Migration System
 * 
 * Manages atomic serialization, validation, and safe backward-compatible migration
 * of player party, storage, Pokédex progress, and world coordinates.
 */

import { RuntimePokemon } from '../../battle/types';

export const CURRENT_SAVE_VERSION = 3;
const SAVE_STORAGE_KEY = 'pokemon_3d_rpg_save_v3';

export interface SaveGameData {
  saveVersion: number;
  savedAt: number;
  player: {
    position: [number, number, number];
    rotation: number;
  };
  party: RuntimePokemon[];
  storage: RuntimePokemon[];
  inventory: { id: string; name: string; count: number }[];
  pokedex: {
    seen: string[];
    caught: string[];
  };
  hasChosenStarter: boolean;
}

export class SaveSystem {
  /**
   * Serializes game state safely to LocalStorage.
   */
  public static saveGame(data: Omit<SaveGameData, 'saveVersion' | 'savedAt'>): boolean {
    try {
      const fullPayload: SaveGameData = {
        ...data,
        saveVersion: CURRENT_SAVE_VERSION,
        savedAt: Date.now(),
      };
      localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(fullPayload));
      return true;
    } catch (e) {
      console.error('Failed to save game state:', e);
      return false;
    }
  }

  /**
   * Loads and migrates saved game data from LocalStorage.
   */
  public static loadGame(): SaveGameData | null {
    try {
      const raw = localStorage.getItem(SAVE_STORAGE_KEY);
      if (!raw) {
        // Fallback check for legacy storage key
        const legacyParty = localStorage.getItem('pokemon_party_storage');
        if (legacyParty) {
          const parsed = JSON.parse(legacyParty);
          return SaveSystem.migrateFromLegacy(parsed?.state);
        }
        return null;
      }

      const parsed = JSON.parse(raw);
      return SaveSystem.validateAndMigrate(parsed);
    } catch (e) {
      console.error('Error loading save game:', e);
      return null;
    }
  }

  /**
   * Migrates from earlier version schemas safely without data loss.
   */
  private static validateAndMigrate(save: any): SaveGameData {
    return {
      saveVersion: CURRENT_SAVE_VERSION,
      savedAt: save.savedAt || Date.now(),
      player: {
        position: save.player?.position || [0, 0, 0],
        rotation: save.player?.rotation || 0,
      },
      party: Array.isArray(save.party) ? save.party : [],
      storage: Array.isArray(save.storage) ? save.storage : [],
      inventory: Array.isArray(save.inventory) ? save.inventory : [
        { id: 'poke_ball', name: 'Poké Ball', count: 10 },
        { id: 'great_ball', name: 'Great Ball', count: 5 },
        { id: 'ultra_ball', name: 'Ultra Ball', count: 2 },
        { id: 'potion', name: 'Potion', count: 5 },
      ],
      pokedex: {
        seen: Array.isArray(save.pokedex?.seen) ? save.pokedex.seen : ['pikachu', 'bulbasaur', 'charmander', 'squirtle'],
        caught: Array.isArray(save.pokedex?.caught) ? save.pokedex.caught : [],
      },
      hasChosenStarter: Boolean(save.hasChosenStarter),
    };
  }

  private static migrateFromLegacy(legacyState: any): SaveGameData {
    return {
      saveVersion: CURRENT_SAVE_VERSION,
      savedAt: Date.now(),
      player: { position: [0, 0, 0], rotation: 0 },
      party: legacyState?.party || [],
      storage: legacyState?.storage || [],
      inventory: legacyState?.inventory || [
        { id: 'poke_ball', name: 'Poké Ball', count: 10 },
        { id: 'great_ball', name: 'Great Ball', count: 5 },
        { id: 'ultra_ball', name: 'Ultra Ball', count: 2 },
      ],
      pokedex: {
        seen: legacyState?.pokedexSeen || ['pikachu', 'bulbasaur', 'charmander', 'squirtle'],
        caught: legacyState?.pokedexCaught || [],
      },
      hasChosenStarter: Boolean(legacyState?.hasChosenStarter),
    };
  }

  /**
   * Checks if an existing valid save game exists.
   */
  public static hasSaveGame(): boolean {
    return Boolean(localStorage.getItem(SAVE_STORAGE_KEY) || localStorage.getItem('pokemon_party_storage'));
  }

  /**
   * Removes save game data for a clean fresh game.
   */
  public static clearSave(): void {
    localStorage.removeItem(SAVE_STORAGE_KEY);
    localStorage.removeItem('pokemon_party_storage');
  }
}
