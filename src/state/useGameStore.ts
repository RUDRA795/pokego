import { create } from 'zustand';
import { GameScreenState, EncounterData, DebugConfig } from '../types/game';

interface GameStore {
  screen: GameScreenState;
  isPaused: boolean;
  encounter: EncounterData | null;
  lastEncounterTime: number;
  pokemonCount: number;
  debug: DebugConfig;
  resetWorldTrigger: number;

  setScreen: (screen: GameScreenState) => void;
  setPaused: (isPaused: boolean) => void;
  triggerEncounter: (encounter: EncounterData) => void;
  dismissEncounter: () => void;
  setPokemonCount: (count: number) => void;
  toggleDebugOption: (key: keyof DebugConfig) => void;
  triggerResetWorld: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  screen: 'LOADING',
  isPaused: false,
  encounter: null,
  lastEncounterTime: 0,
  pokemonCount: 8,
  debug: {
    showFps: true,
    showCoordinates: true,
    showJoystick: true,
    freeCam: false,
    showColliders: false,
  },
  resetWorldTrigger: 0,

  setScreen: (screen) => set({ screen }),
  
  setPaused: (isPaused) => set({ isPaused }),

  triggerEncounter: (encounter) => {
    set({ encounter, isPaused: true });
  },

  dismissEncounter: () => {
    set({
      encounter: null,
      isPaused: false,
      lastEncounterTime: Date.now(),
    });
  },

  setPokemonCount: (count) => set({ pokemonCount: count }),

  toggleDebugOption: (key) => set((state) => ({
    debug: {
      ...state.debug,
      [key]: !state.debug[key],
    }
  })),

  triggerResetWorld: () => set((state) => ({
    resetWorldTrigger: state.resetWorldTrigger + 1,
    encounter: null,
    isPaused: false,
    lastEncounterTime: Date.now(),
  })),
}));
