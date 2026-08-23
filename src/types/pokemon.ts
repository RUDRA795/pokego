/**
 * Pokémon 3D RPG — Core Pokémon Schema & Type Definitions
 * 
 * Source Hierarchy:
 * - CANONICAL / SOURCE-DERIVED: National Dex Number, Name, Types, 6 Base Stats,
 *   Abilities, Moves, Evolution Triggers, Height, Weight, Dex Entries, Catch Rate, Canonical Habitat.
 * - GAME-DESIGN PARAMETERS: encounterRarity (spawn weighting), aiBehavior,
 *   visualConfig (locomotion, 3D asset URL, scale tuning, dev fallback colors).
 */

// ==========================================
// 1. CANONICAL 18 TYPES & 6 STATS
// ==========================================
export type PokemonType =
  | 'Normal'
  | 'Fire'
  | 'Water'
  | 'Grass'
  | 'Electric'
  | 'Ice'
  | 'Fighting'
  | 'Poison'
  | 'Ground'
  | 'Flying'
  | 'Psychic'
  | 'Bug'
  | 'Rock'
  | 'Ghost'
  | 'Dragon'
  | 'Dark'
  | 'Steel'
  | 'Fairy';

export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
  baseStatTotal: number;
}

export type MoveCategory = 'Physical' | 'Special' | 'Status';

export interface PokemonMove {
  id: string;
  name: string;
  type: PokemonType;
  category: MoveCategory;
  power: number;          // 0 for status moves
  accuracy: number;       // 1 - 100
  pp: number;             // Base Power Points
  priority?: number;      // Turn priority (-7 to +5)
  description: string;
  effectChance?: number;  // % chance of secondary effect
  statusEffect?: 'BURN' | 'PARALYSIS' | 'POISON' | 'BADLY_POISONED' | 'SLEEP' | 'FREEZE';
  statusChance?: number;  // % chance to apply status
  statChanges?: { stat: 'attack' | 'defense' | 'specialAttack' | 'specialDefense' | 'speed' | 'accuracy'; stages: number }[];
  drainPercent?: number;  // % of damage dealt restored to user HP (e.g. Giga Drain 50%)
  recoilPercent?: number; // % of damage dealt taken as recoil (e.g. Take Down 25%)
  criticalHitRatio?: number; // High-crit moves
  target?: 'enemy' | 'user' | 'all';
}

export interface PokemonAbilityRef {
  id: string;
  name: string;
  description: string;
  isHidden?: boolean;
}

// ==========================================
// 2. EVOLUTION & FORMS (Canonical)
// ==========================================
export type EvolutionTrigger =
  | 'level'
  | 'item'
  | 'friendship'
  | 'trade'
  | 'time'
  | 'time_of_day'
  | 'weather'
  | 'location'
  | 'special';

export interface EvolutionBranch {
  targetSpeciesId: string;
  trigger: EvolutionTrigger;
  minLevel?: number;
  item?: string;
  timeOfDay?: 'DAY' | 'NIGHT';
  conditionDescription?: string;
}

export interface PokemonForm {
  formId: string;
  formName: string;
  types: [PokemonType, PokemonType?];
  baseStats: PokemonStats;
  heightMeters: number;
  weightKg: number;
  modelAssetUrl?: string;
}

// ==========================================
// 3. ECOLOGY & BEHAVIOR
// ==========================================
export type CanonicalHabitat =
  | 'Grassland'
  | 'Forest'
  | 'WatersEdge'
  | 'Sea'
  | 'Cave'
  | 'Mountain'
  | 'RoughTerrain'
  | 'Urban'
  | 'Rare';

export type LocomotionType = 'ground_walk' | 'ground_hop' | 'flying' | 'hovering' | 'swimming';

export type AIBehaviorType =
  | 'Curious'
  | 'Timid'
  | 'Calm'
  | 'Aggressive'
  | 'Territorial'
  | 'Passive'
  | 'Nocturnal'
  | 'Aquatic'
  | 'Flying'
  | 'Roaming';

// Game-design encounter tier for spawn engine balancing
export type GameEncounterRarity = 'Common' | 'Uncommon' | 'Rare' | 'VeryRare';

// ==========================================
// 4. MASTER POKÉMON SPECIES RECORD
// ==========================================
export interface PokemonSpeciesData {
  // --- CANONICAL / SOURCE-DERIVED METADATA ---
  nationalDexNumber: number;
  id: string;                      // e.g. 'bulbasaur', 'pikachu'
  name: string;
  speciesCategory: string;         // e.g. "Seed Pokémon", "Mouse Pokémon"
  generation: number;

  primaryType: PokemonType;
  secondaryType?: PokemonType;

  heightMeters: number;
  weightKg: number;
  genderRatio?: { male: number; female: number } | 'Genderless';

  pokedexEntry: string;
  baseStats: PokemonStats;

  abilities: PokemonAbilityRef[];
  hiddenAbility?: PokemonAbilityRef;
  learnset: Array<{
    level: number;
    move: PokemonMove;
  }>;

  evolution?: {
    evolvesFrom?: string;
    evolvesTo?: EvolutionBranch[];
  };

  forms?: PokemonForm[];

  canonicalHabitat: CanonicalHabitat;
  catchRate: number;               // Canonical capture rate (3 - 255)
  baseExp: number;

  // Canonical classification flags
  isStarter?: boolean;
  isLegendary?: boolean;
  isMythical?: boolean;

  // --- GAME-DESIGN SPECIFIC METADATA ---
  encounterRarity: GameEncounterRarity; // Game-design spawn tier
  isIconic?: boolean;                    // Special UI / highlight tag
  aiBehavior: AIBehaviorType;

  visualConfig: {
    locomotion: LocomotionType;
    modelAssetUrl?: string;              // Path to external 3D asset (.glb/.gltf)
    scaleMultiplier: number;             // Visual scaling relative to heightMeters
    yOffset: number;                     // Ground/elevation offset
    primaryColor: string;                // UI theme / dev-safety fallback color
    secondaryColor: string;
    glowColor?: string;
  };
}

// ==========================================
// 5. LIVE OVERWORLD RUNTIME INSTANCE
// ==========================================
export type AIState = 'IDLE' | 'WANDER' | 'DETECTED' | 'APPROACH' | 'FLEE' | 'ENCOUNTER';

export interface ActivePokemon {
  instanceId: string;
  speciesId: string;
  position: [number, number, number];
  targetPosition: [number, number, number];
  rotation: number;
  state: AIState;
  stateTimer: number;
  currentHp: number;
  maxHp: number;
  level: number;
  scale: number;
}
