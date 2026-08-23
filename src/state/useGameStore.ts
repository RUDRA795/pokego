/**
 * Pokémon 3D RPG — Global Game State & Screen Router Store
 * 
 * Manages game screens (MAP, CAPTURE, BATTLE_UNITE, PARTY, POKEDEX, BAG),
 * active wild encounters, player progression (Stardust, Coins, Level, EXP),
 * and PokéStop state.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RuntimePokemon } from '../battle/types';

export type GameScreen = 'MAP' | 'CAPTURE' | 'BATTLE_UNITE' | 'PARTY' | 'POKEDEX' | 'BAG';

export interface PokeStop {
  id: string;
  name: string;
  x: number;
  z: number;
  lastSpunTime: number; // timestamp
}

interface GameStore {
  screen: GameScreen;
  activeEncounterPokemon: RuntimePokemon | null;
  selectedPartyPokemonId: string | null;
  stardust: number;
  pokeCoins: number;
  playerLevel: number;
  playerExp: number;
  playerExpToNextLevel: number;
  pokeStops: PokeStop[];

  // Actions
  setScreen: (screen: GameScreen) => void;
  startEncounter: (pokemon: RuntimePokemon, screen?: 'CAPTURE' | 'BATTLE_UNITE') => void;
  endEncounter: () => void;
  setSelectedPartyPokemonId: (id: string | null) => void;
  addStardust: (amount: number) => void;
  spendStardust: (amount: number) => boolean;
  addCoins: (amount: number) => void;
  addExp: (amount: number) => void;
  spinPokeStop: (id: string) => { canSpin: boolean; rewards?: { pokeBalls: number; berries: number; stardust: number } };
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      screen: 'MAP',
      activeEncounterPokemon: null,
      selectedPartyPokemonId: null,
      stardust: 5000,
      pokeCoins: 250,
      playerLevel: 12,
      playerExp: 1420,
      playerExpToNextLevel: 3000,
      pokeStops: [
        { id: 'stop-1', name: 'Pallet Town Fountain', x: -15, z: -10, lastSpunTime: 0 },
        { id: 'stop-2', name: 'Viridian Forest Gateway', x: 20, z: -18, lastSpunTime: 0 },
        { id: 'stop-3', name: 'Indigo Plateau Memorial', x: 0, z: 25, lastSpunTime: 0 },
        { id: 'stop-4', name: 'Cerulean Gym Obelisk', x: -28, z: 15, lastSpunTime: 0 },
      ],

      setScreen: (screen) => set({ screen }),

      startEncounter: (pokemon, screen = 'CAPTURE') => {
        set({ activeEncounterPokemon: pokemon, screen });
      },

      endEncounter: () => {
        set({ activeEncounterPokemon: null, screen: 'MAP' });
      },

      setSelectedPartyPokemonId: (id) => set({ selectedPartyPokemonId: id }),

      addStardust: (amount) => set((state) => ({ stardust: state.stardust + amount })),

      spendStardust: (amount) => {
        const current = get().stardust;
        if (current >= amount) {
          set({ stardust: current - amount });
          return true;
        }
        return false;
      },

      addCoins: (amount) => set((state) => ({ pokeCoins: state.pokeCoins + amount })),

      addExp: (amount) => {
        const state = get();
        let newExp = state.playerExp + amount;
        let newLevel = state.playerLevel;
        let nextExp = state.playerExpToNextLevel;

        if (newExp >= nextExp) {
          newExp -= nextExp;
          newLevel += 1;
          nextExp = Math.floor(nextExp * 1.35);
        }

        set({
          playerExp: newExp,
          playerLevel: newLevel,
          playerExpToNextLevel: nextExp,
        });
      },

      spinPokeStop: (id: string) => {
        const now = Date.now();
        const COOLDOWN = 1000 * 60 * 2; // 2 minute cooldown
        const stop = get().pokeStops.find((s) => s.id === id);

        if (!stop || now - stop.lastSpunTime < COOLDOWN) {
          return { canSpin: false };
        }

        // Generate rewards
        const rewards = {
          pokeBalls: Math.floor(Math.random() * 3) + 2,
          berries: Math.floor(Math.random() * 2) + 1,
          stardust: 150,
        };

        // Update stop timestamp and player resources
        set((state) => ({
          pokeStops: state.pokeStops.map((s) => (s.id === id ? { ...s, lastSpunTime: now } : s)),
          stardust: state.stardust + rewards.stardust,
        }));

        get().addExp(50);
        return { canSpin: true, rewards };
      },
    }),
    {
      name: 'pokemon_game_store_v3',
    }
  )
);
