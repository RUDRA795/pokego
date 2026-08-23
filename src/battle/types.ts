/**
 * Pokémon 3D RPG — Battle Domain Types & Data Contracts
 * 
 * Defines all interfaces for the deterministic turn-based Pokémon battle engine,
 * state machine phases, actions, turn orders, logs, and runtime instances.
 */

import { PokemonType, PokemonStats, PokemonMove } from '../types/pokemon';

// ==========================================
// 1. RUNTIME POKÉMON INSTANCE
// ==========================================

export type StatusCondition = 'NONE' | 'BURN' | 'FREEZE' | 'PARALYSIS' | 'POISON' | 'BADLY_POISONED' | 'SLEEP';

export interface RuntimeMove {
  move: PokemonMove;
  currentPp: number;
  maxPp: number;
}

export interface RuntimePokemon {
  instanceId: string;
  speciesId: string;
  name: string;
  nickname?: string;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  currentHp: number;
  calculatedStats: PokemonStats;
  moves: RuntimeMove[];
  status: StatusCondition;
  statusTurns?: number;
  isWild: boolean;
  capturedAt?: number;
  isShadow?: boolean;
  isPurified?: boolean;
  isBuddy?: boolean;
}

// ==========================================
// 2. BATTLE STATE & PHASES
// ==========================================

export type BattlePhase =
  | 'INTRO'
  | 'PLAYER_ACTION_SELECT'
  | 'MOVE_SELECT'
  | 'ITEM_SELECT'
  | 'SWITCH_SELECT'
  | 'EXECUTE_TURN'
  | 'ANIMATING'
  | 'CHECK_FAINT'
  | 'CAPTURE_ATTEMPT'
  | 'VICTORY'
  | 'DEFEAT'
  | 'ESCAPED'
  | 'CAPTURED';

export type BattleActionType = 'MOVE' | 'ITEM' | 'SWITCH' | 'RUN';

export interface BattleAction {
  type: BattleActionType;
  actor: 'player' | 'opponent';
  moveIndex?: number;
  itemId?: string;
  switchIndex?: number;
}

export interface BattleLogEntry {
  id: string;
  text: string;
  type?: 'info' | 'damage' | 'effective' | 'crit' | 'faint' | 'capture' | 'status' | 'xp';
}

// ==========================================
// 3. DAMAGE & TURN RESULTS
// ==========================================

export interface DamageCalculationResult {
  damage: number;
  isCritical: boolean;
  typeMultiplier: number;
  isSTAB: boolean;
  isMiss: boolean;
}

export interface TurnExecutionStep {
  actor: 'player' | 'opponent';
  action: BattleAction;
  moveName?: string;
  damageResult?: DamageCalculationResult;
  targetFainted?: boolean;
  logMessages: string[];
}

export interface BattleState {
  id: string;
  phase: BattlePhase;
  turnNumber: number;
  playerPokemon: RuntimePokemon;
  opponentPokemon: RuntimePokemon;
  playerParty: RuntimePokemon[];
  selectedPlayerAction: BattleAction | null;
  selectedOpponentAction: BattleAction | null;
  currentStepIndex: number;
  turnSteps: TurnExecutionStep[];
  logs: BattleLogEntry[];
  captureShakes: number;
  isCaptureSuccess: boolean;
  earnedXp: number;
  didLevelUp: boolean;
  evolutionPendingSpeciesId: string | null;
}
