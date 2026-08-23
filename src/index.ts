/**
 * Pokémon Game Engine — Core Library Entry Point
 */

// 1. Battle Domain
export * from './battle/BattleEngine';
export * from './battle/DamageCalculator';
export * from './battle/StatCalculator';
export * from './battle/RuntimePokemon';
export * from './battle/CaptureSystem';
export * from './battle/BattleAI';
export * from './battle/types';
export * from './battle/abilities/AbilitySystem';
export * from './battle/status/StatusSystem';
export * from './battle/weather/BattleWeatherSystem';

// 2. Canonical Data
export * from './data/pokemon/species';
export * from './data/pokemon/moves';
export * from './data/pokemon/types';
export * from './data/pokemon/index';
export * from './data/biomes';

// 3. Core Systems
export * from './systems/save/SaveSystem';
export * from './systems/progression/CombatPowerSystem';
export * from './systems/progression/ExperienceSystem';
export * from './systems/pokemon/SpeciesScaleSystem';
export * from './systems/world/TerrainHeightmap';

// 4. Types & State Stores
export * from './types/pokemon';
export * from './types/game';
export * from './state/usePlayerPartyStore';
export * from './state/usePlayerStore';
export * from './state/useGameStore';
export * from './state/useWeatherStore';
