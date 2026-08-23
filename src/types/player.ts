export interface InputVector {
  x: number; // -1 to 1 (left to right)
  y: number; // -1 to 1 (backward to forward)
}

export interface PlayerStats {
  level: number;
  xp: number;
  stamina: number;
  maxStamina: number;
}

export interface PlayerState {
  position: [number, number, number];
  rotation: number;
  isMoving: boolean;
  speed: number;
  stats: PlayerStats;
}
