/**
 * Pokémon 3D RPG — Player Party, Inventory & Pokédex Collection Store
 * 
 * Manages the 6-slot active Pokémon party, storage box overflow,
 * inventory items (Poké Balls), Pokédex discovery tracking, and local persistence.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RuntimePokemon } from '../battle/types';
import { createRuntimePokemon } from '../battle/RuntimePokemon';
import { getPokemonById } from '../data/pokemon';

export interface InventoryItem {
  id: string;
  name: string;
  count: number;
}

interface PlayerPartyStore {
  party: RuntimePokemon[];
  storage: RuntimePokemon[];
  pokedexSeen: string[];
  pokedexCaught: string[];
  inventory: InventoryItem[];
  hasChosenStarter: boolean;

  // Actions
  initStarter: (speciesId: string) => void;
  addCapturedPokemon: (pokemon: RuntimePokemon) => { addedToParty: boolean };
  updatePartyPokemon: (updated: RuntimePokemon) => void;
  switchActivePokemon: (index: number) => void;
  markSeen: (speciesId: string) => void;
  consumeItem: (itemId: string) => boolean;
  addItem: (itemId: string, count: number) => void;
  healParty: () => void;
  resetProgress: () => void;
}

export const usePlayerPartyStore = create<PlayerPartyStore>()(
  persist(
    (set, get) => ({
      party: [],
      storage: [],
      pokedexSeen: ['pikachu', 'bulbasaur', 'charmander', 'squirtle'],
      pokedexCaught: [],
      inventory: [
        { id: 'poke_ball', name: 'Poké Ball', count: 10 },
        { id: 'great_ball', name: 'Great Ball', count: 5 },
        { id: 'ultra_ball', name: 'Ultra Ball', count: 2 },
      ],
      hasChosenStarter: false,

      initStarter: (speciesId: string) => {
        const species = getPokemonById(speciesId);
        if (!species) return;

        const starter = createRuntimePokemon(species, 5, false, `starter-${species.id}`);
        set((state) => ({
          party: [starter],
          hasChosenStarter: true,
          pokedexCaught: Array.from(new Set([...state.pokedexCaught, species.id])),
          pokedexSeen: Array.from(new Set([...state.pokedexSeen, species.id])),
        }));
      },

      addCapturedPokemon: (pokemon: RuntimePokemon) => {
        const state = get();
        let addedToParty = false;

        const newPokedexCaught = Array.from(new Set([...state.pokedexCaught, pokemon.speciesId]));
        const newPokedexSeen = Array.from(new Set([...state.pokedexSeen, pokemon.speciesId]));

        if (state.party.length < 6) {
          set({
            party: [...state.party, pokemon],
            pokedexCaught: newPokedexCaught,
            pokedexSeen: newPokedexSeen,
          });
          addedToParty = true;
        } else {
          set({
            storage: [...state.storage, pokemon],
            pokedexCaught: newPokedexCaught,
            pokedexSeen: newPokedexSeen,
          });
          addedToParty = false;
        }

        return { addedToParty };
      },

      updatePartyPokemon: (updated: RuntimePokemon) => {
        set((state) => ({
          party: state.party.map((p) => (p.instanceId === updated.instanceId ? updated : p)),
        }));
      },

      switchActivePokemon: (index: number) => {
        set((state) => {
          if (index < 0 || index >= state.party.length) return state;
          const newParty = [...state.party];
          const [selected] = newParty.splice(index, 1);
          newParty.unshift(selected); // Put at active leader position 0
          return { party: newParty };
        });
      },

      markSeen: (speciesId: string) => {
        set((state) => ({
          pokedexSeen: Array.from(new Set([...state.pokedexSeen, speciesId])),
        }));
      },

      consumeItem: (itemId: string) => {
        const state = get();
        const item = state.inventory.find((i) => i.id === itemId);
        if (!item || item.count <= 0) return false;

        set({
          inventory: state.inventory.map((i) =>
            i.id === itemId ? { ...i, count: Math.max(0, i.count - 1) } : i
          ),
        });
        return true;
      },

      addItem: (itemId: string, count: number) => {
        set((state) => {
          const exists = state.inventory.some((i) => i.id === itemId);
          if (exists) {
            return {
              inventory: state.inventory.map((i) =>
                i.id === itemId ? { ...i, count: i.count + count } : i
              ),
            };
          }
          return {
            inventory: [...state.inventory, { id: itemId, name: itemId, count }],
          };
        });
      },

      healParty: () => {
        set((state) => ({
          party: state.party.map((p) => ({
            ...p,
            currentHp: p.calculatedStats.hp,
            status: 'NONE',
            moves: p.moves.map((m) => ({ ...m, currentPp: m.maxPp })),
          })),
        }));
      },

      resetProgress: () => {
        set({
          party: [],
          storage: [],
          pokedexSeen: ['pikachu', 'bulbasaur', 'charmander', 'squirtle'],
          pokedexCaught: [],
          inventory: [
            { id: 'poke_ball', name: 'Poké Ball', count: 10 },
            { id: 'great_ball', name: 'Great Ball', count: 5 },
            { id: 'ultra_ball', name: 'Ultra Ball', count: 2 },
          ],
          hasChosenStarter: false,
        });
      },
    }),
    {
      name: 'pokemon_party_storage',
    }
  )
);
