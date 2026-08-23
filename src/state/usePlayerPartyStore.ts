/**
 * Pokémon 3D RPG — Player Party, Buddy, Egg & Shadow Purification Store
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RuntimePokemon } from '../battle/types';
import { createRuntimePokemon } from '../battle/RuntimePokemon';
import { getPokemonById } from '../data/pokemon';
import { calculateAllStats } from '../battle/StatCalculator';

export interface InventoryItem {
  id: string;
  name: string;
  count: number;
}

export interface EggItem {
  id: string;
  targetKm: number;
  walkedKm: number;
  isHatched: boolean;
  speciesId?: string;
}

interface PlayerPartyStore {
  party: RuntimePokemon[];
  storage: RuntimePokemon[];
  pokedexSeen: string[];
  pokedexCaught: string[];
  inventory: InventoryItem[];
  hasChosenStarter: boolean;
  buddyInstanceId: string | null;
  buddyHearts: number;
  buddyDistanceKm: number;
  eggs: EggItem[];

  // Actions
  initStarter: (speciesId: string) => void;
  addCapturedPokemon: (pokemon: RuntimePokemon) => { addedToParty: boolean };
  updatePartyPokemon: (updated: RuntimePokemon) => void;
  setBuddy: (instanceId: string) => void;
  feedBuddy: () => void;
  purifyPokemon: (instanceId: string) => boolean;
  addEgg: (targetKm: number) => void;
  progressWalkDistance: (km: number) => { hatchedEggs: EggItem[] };
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
        { id: 'poke_ball', name: 'Poké Ball', count: 20 },
        { id: 'great_ball', name: 'Great Ball', count: 10 },
        { id: 'ultra_ball', name: 'Ultra Ball', count: 5 },
        { id: 'razz_berry', name: 'Razz Berry', count: 10 },
        { id: 'pinap_berry', name: 'Pinap Berry', count: 5 },
        { id: 'nanab_berry', name: 'Nanab Berry', count: 5 },
      ],
      hasChosenStarter: false,
      buddyInstanceId: null,
      buddyHearts: 3,
      buddyDistanceKm: 1.4,
      eggs: [
        { id: 'egg-2km', targetKm: 2.0, walkedKm: 0.8, isHatched: false, speciesId: 'pichu' },
        { id: 'egg-5km', targetKm: 5.0, walkedKm: 2.1, isHatched: false, speciesId: 'riolu' },
        { id: 'egg-10km', targetKm: 10.0, walkedKm: 4.5, isHatched: false, speciesId: 'gible' },
      ],

      initStarter: (speciesId: string) => {
        const species = getPokemonById(speciesId);
        if (!species) return;

        const starter = createRuntimePokemon(species, 5, false, `starter-${species.id}`);
        starter.isBuddy = true;
        set((state) => ({
          party: [starter],
          buddyInstanceId: starter.instanceId,
          pokedexSeen: [...new Set([...state.pokedexSeen, species.id])],
          pokedexCaught: [...new Set([...state.pokedexCaught, species.id])],
          hasChosenStarter: true,
        }));
      },

      addCapturedPokemon: (pokemon: RuntimePokemon) => {
        const state = get();
        let addedToParty = false;

        if (state.party.length < 6) {
          set({
            party: [...state.party, pokemon],
            pokedexCaught: [...new Set([...state.pokedexCaught, pokemon.speciesId])],
            pokedexSeen: [...new Set([...state.pokedexSeen, pokemon.speciesId])],
          });
          addedToParty = true;
        } else {
          set({
            storage: [...state.storage, pokemon],
            pokedexCaught: [...new Set([...state.pokedexCaught, pokemon.speciesId])],
            pokedexSeen: [...new Set([...state.pokedexSeen, pokemon.speciesId])],
          });
        }

        return { addedToParty };
      },

      updatePartyPokemon: (updated: RuntimePokemon) => {
        set((state) => ({
          party: state.party.map((p) => (p.instanceId === updated.instanceId ? updated : p)),
        }));
      },

      setBuddy: (instanceId: string) => {
        set((state) => ({
          buddyInstanceId: instanceId,
          party: state.party.map((p) => ({
            ...p,
            isBuddy: p.instanceId === instanceId,
          })),
        }));
      },

      feedBuddy: () => {
        set((state) => ({
          buddyHearts: Math.min(20, state.buddyHearts + 1),
        }));
      },

      purifyPokemon: (instanceId: string) => {
        const state = get();
        const p = state.party.find((x) => x.instanceId === instanceId);
        if (!p || !p.isShadow) return false;

        const species = getPokemonById(p.speciesId);
        if (!species) return false;

        // Purify: Boost stats, set level 25 if lower, mark isPurified
        const newLevel = Math.max(25, p.level);
        const newStats = calculateAllStats(species.baseStats, newLevel);

        const purified: RuntimePokemon = {
          ...p,
          level: newLevel,
          calculatedStats: newStats,
          currentHp: newStats.hp,
          isShadow: false,
          isPurified: true,
        };

        set({
          party: state.party.map((x) => (x.instanceId === instanceId ? purified : x)),
        });
        return true;
      },

      addEgg: (targetKm: number) => {
        const id = `egg-${Date.now()}`;
        set((state) => ({
          eggs: [...state.eggs, { id, targetKm, walkedKm: 0, isHatched: false }],
        }));
      },

      progressWalkDistance: (km: number) => {
        const state = get();
        const updatedEggs = state.eggs.map((egg) => {
          if (egg.isHatched) return egg;
          const newWalked = egg.walkedKm + km;
          return {
            ...egg,
            walkedKm: newWalked,
            isHatched: newWalked >= egg.targetKm,
          };
        });

        const newlyHatched = updatedEggs.filter((e) => e.isHatched && !state.eggs.find((old) => old.id === e.id)?.isHatched);

        set({
          eggs: updatedEggs,
          buddyDistanceKm: state.buddyDistanceKm + km,
        });

        return { hatchedEggs: newlyHatched };
      },

      consumeItem: (itemId: string) => {
        const current = get().inventory;
        const item = current.find((i) => i.id === itemId);
        if (!item || item.count <= 0) return false;

        set({
          inventory: current.map((i) => (i.id === itemId ? { ...i, count: i.count - 1 } : i)),
        });
        return true;
      },

      addItem: (itemId: string, count: number) => {
        const current = get().inventory;
        const exists = current.find((i) => i.id === itemId);
        if (exists) {
          set({
            inventory: current.map((i) => (i.id === itemId ? { ...i, count: i.count + count } : i)),
          });
        } else {
          set({
            inventory: [...current, { id: itemId, name: itemId, count }],
          });
        }
      },

      healParty: () => {
        set((state) => ({
          party: state.party.map((p) => ({ ...p, currentHp: p.calculatedStats.hp })),
        }));
      },

      resetProgress: () => {
        set({
          party: [],
          storage: [],
          pokedexSeen: [],
          pokedexCaught: [],
          hasChosenStarter: false,
          buddyInstanceId: null,
          buddyHearts: 0,
        });
      },
    }),
    {
      name: 'pokemon_party_store_v4',
    }
  )
);
