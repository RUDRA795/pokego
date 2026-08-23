import { create } from 'zustand';
import { InputVector, PlayerStats } from '../types/player';

interface PlayerStore {
  position: [number, number, number];
  rotation: number;
  isMoving: boolean;
  speed: number;
  input: InputVector;
  stats: PlayerStats;

  setInput: (input: InputVector) => void;
  setPosition: (position: [number, number, number]) => void;
  setRotation: (rotation: number) => void;
  setIsMoving: (isMoving: boolean) => void;
  resetPosition: () => void;
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  position: [0, 0, 0],
  rotation: 0,
  isMoving: false,
  speed: 6.5,
  input: { x: 0, y: 0 },
  stats: {
    level: 1,
    xp: 0,
    stamina: 100,
    maxStamina: 100,
  },

  setInput: (input) => set({ input }),
  setPosition: (position) => set({ position }),
  setRotation: (rotation) => set({ rotation }),
  setIsMoving: (isMoving) => set({ isMoving }),
  resetPosition: () => set({ position: [0, 0, 0], rotation: 0, isMoving: false, input: { x: 0, y: 0 } }),
}));
