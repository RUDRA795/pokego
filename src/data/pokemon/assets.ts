/**
 * Pokémon 3D RPG — Canonical 3D Asset Registry & Validation Engine
 * 
 * Manages 3D model paths, mesh configurations, scale multipliers, ground offsets,
 * animation channel mappings, and runtime asset validation for all Pokémon species.
 */

import { POKEMON_SPECIES_DATABASE } from './species';

export type AssetReadiness = 'READY' | 'FALLBACK' | 'MISSING';

export type FallbackMeshType =
  | 'quadruped'
  | 'biped'
  | 'winged_bird'
  | 'winged_bat'
  | 'serpentine'
  | 'fish'
  | 'turtle'
  | 'spectral_orb'
  | 'rock_golem';

export interface PokemonAssetDefinition {
  speciesId: string;
  nationalDexNumber: number;
  modelUrl: string;
  textureUrls?: string[];
  scale: number;
  groundOffset: number;
  rotationOffset?: [number, number, number];
  readiness: AssetReadiness;
  fallbackMeshType: FallbackMeshType;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  emissiveColor?: string;
  emissiveIntensity?: number;
  hasFlameTail?: boolean;
  hasLightningTail?: boolean;
  hasBackPlant?: boolean;
  hasShell?: boolean;
  hasWings?: boolean;
  hasFluffyMane?: boolean;
  hasSegmentedSpine?: boolean;
  hasGhostAura?: boolean;
}

export const POKEMON_ASSET_REGISTRY: Record<string, PokemonAssetDefinition> = {
  bulbasaur: {
    speciesId: 'bulbasaur',
    nationalDexNumber: 1,
    modelUrl: '/models/pokemon/bulbasaur.glb',
    scale: 0.9,
    groundOffset: 0.0,
    readiness: 'FALLBACK',
    fallbackMeshType: 'quadruped',
    primaryColor: '#52b788',
    secondaryColor: '#2d6a4f',
    accentColor: '#e04060',
    hasBackPlant: true,
  },
  ivysaur: {
    speciesId: 'ivysaur',
    nationalDexNumber: 2,
    modelUrl: '/models/pokemon/ivysaur.glb',
    scale: 1.1,
    groundOffset: 0.0,
    readiness: 'FALLBACK',
    fallbackMeshType: 'quadruped',
    primaryColor: '#40916c',
    secondaryColor: '#1b4332',
    accentColor: '#f43f5e',
    hasBackPlant: true,
  },
  venusaur: {
    speciesId: 'venusaur',
    nationalDexNumber: 3,
    modelUrl: '/models/pokemon/venusaur.glb',
    scale: 1.5,
    groundOffset: 0.0,
    readiness: 'FALLBACK',
    fallbackMeshType: 'quadruped',
    primaryColor: '#2d6a4f',
    secondaryColor: '#1b4332',
    accentColor: '#fb7185',
    hasBackPlant: true,
  },
  charmander: {
    speciesId: 'charmander',
    nationalDexNumber: 4,
    modelUrl: '/models/pokemon/charmander.glb',
    scale: 0.85,
    groundOffset: 0.0,
    readiness: 'FALLBACK',
    fallbackMeshType: 'biped',
    primaryColor: '#ea580c',
    secondaryColor: '#fed7aa',
    accentColor: '#facc15',
    hasFlameTail: true,
  },
  charmeleon: {
    speciesId: 'charmeleon',
    nationalDexNumber: 5,
    modelUrl: '/models/pokemon/charmeleon.glb',
    scale: 1.1,
    groundOffset: 0.0,
    readiness: 'FALLBACK',
    fallbackMeshType: 'biped',
    primaryColor: '#dc2626',
    secondaryColor: '#fecaca',
    accentColor: '#f59e0b',
    hasFlameTail: true,
  },
  charizard: {
    speciesId: 'charizard',
    nationalDexNumber: 6,
    modelUrl: '/models/pokemon/charizard.glb',
    scale: 1.6,
    groundOffset: 0.6,
    readiness: 'FALLBACK',
    fallbackMeshType: 'biped',
    primaryColor: '#ea580c',
    secondaryColor: '#38bdf8',
    accentColor: '#facc15',
    hasFlameTail: true,
    hasWings: true,
  },
  squirtle: {
    speciesId: 'squirtle',
    nationalDexNumber: 7,
    modelUrl: '/models/pokemon/squirtle.glb',
    scale: 0.8,
    groundOffset: 0.0,
    readiness: 'FALLBACK',
    fallbackMeshType: 'turtle',
    primaryColor: '#38bdf8',
    secondaryColor: '#78350f',
    accentColor: '#fef08a',
    hasShell: true,
  },
  wartortle: {
    speciesId: 'wartortle',
    nationalDexNumber: 8,
    modelUrl: '/models/pokemon/wartortle.glb',
    scale: 1.05,
    groundOffset: 0.0,
    readiness: 'FALLBACK',
    fallbackMeshType: 'turtle',
    primaryColor: '#0284c7',
    secondaryColor: '#451a03',
    accentColor: '#e0f2fe',
    hasShell: true,
  },
  blastoise: {
    speciesId: 'blastoise',
    nationalDexNumber: 9,
    modelUrl: '/models/pokemon/blastoise.glb',
    scale: 1.45,
    groundOffset: 0.0,
    readiness: 'FALLBACK',
    fallbackMeshType: 'turtle',
    primaryColor: '#0369a1',
    secondaryColor: '#713f12',
    accentColor: '#94a3b8',
    hasShell: true,
  },
  caterpie: {
    speciesId: 'caterpie',
    nationalDexNumber: 10,
    modelUrl: '/models/pokemon/caterpie.glb',
    scale: 0.55,
    groundOffset: 0.0,
    readiness: 'FALLBACK',
    fallbackMeshType: 'serpentine',
    primaryColor: '#84cc16',
    secondaryColor: '#facc15',
    accentColor: '#ef4444',
  },
  metapod: {
    speciesId: 'metapod',
    nationalDexNumber: 11,
    modelUrl: '/models/pokemon/metapod.glb',
    scale: 0.75,
    groundOffset: 0.0,
    readiness: 'FALLBACK',
    fallbackMeshType: 'quadruped',
    primaryColor: '#65a30d',
    secondaryColor: '#4d7c0f',
  },
  butterfree: {
    speciesId: 'butterfree',
    nationalDexNumber: 12,
    modelUrl: '/models/pokemon/butterfree.glb',
    scale: 1.0,
    groundOffset: 1.1,
    readiness: 'FALLBACK',
    fallbackMeshType: 'winged_bird',
    primaryColor: '#6366f1',
    secondaryColor: '#f8fafc',
    accentColor: '#f43f5e',
    hasWings: true,
  },
  pidgey: {
    speciesId: 'pidgey',
    nationalDexNumber: 16,
    modelUrl: '/models/pokemon/pidgey.glb',
    scale: 0.65,
    groundOffset: 0.8,
    readiness: 'FALLBACK',
    fallbackMeshType: 'winged_bird',
    primaryColor: '#a8715a',
    secondaryColor: '#fef3c7',
    accentColor: '#1e293b',
    hasWings: true,
  },
  pidgeotto: {
    speciesId: 'pidgeotto',
    nationalDexNumber: 17,
    modelUrl: '/models/pokemon/pidgeotto.glb',
    scale: 1.1,
    groundOffset: 1.1,
    readiness: 'FALLBACK',
    fallbackMeshType: 'winged_bird',
    primaryColor: '#92400e',
    secondaryColor: '#fed7aa',
    accentColor: '#ef4444',
    hasWings: true,
  },
  pidgeot: {
    speciesId: 'pidgeot',
    nationalDexNumber: 18,
    modelUrl: '/models/pokemon/pidgeot.glb',
    scale: 1.4,
    groundOffset: 1.3,
    readiness: 'FALLBACK',
    fallbackMeshType: 'winged_bird',
    primaryColor: '#b45309',
    secondaryColor: '#fef08a',
    accentColor: '#dc2626',
    hasWings: true,
  },
  pikachu: {
    speciesId: 'pikachu',
    nationalDexNumber: 25,
    modelUrl: '/models/pokemon/pikachu.glb',
    scale: 0.75,
    groundOffset: 0.0,
    readiness: 'FALLBACK',
    fallbackMeshType: 'biped',
    primaryColor: '#facc15',
    secondaryColor: '#78350f',
    accentColor: '#ef4444',
    hasLightningTail: true,
  },
  raichu: {
    speciesId: 'raichu',
    nationalDexNumber: 26,
    modelUrl: '/models/pokemon/raichu.glb',
    scale: 1.0,
    groundOffset: 0.0,
    readiness: 'FALLBACK',
    fallbackMeshType: 'biped',
    primaryColor: '#f97316',
    secondaryColor: '#fef08a',
    accentColor: '#7c2d12',
    hasLightningTail: true,
  },
  zubat: {
    speciesId: 'zubat',
    nationalDexNumber: 41,
    modelUrl: '/models/pokemon/zubat.glb',
    scale: 0.7,
    groundOffset: 1.2,
    readiness: 'FALLBACK',
    fallbackMeshType: 'winged_bat',
    primaryColor: '#3b82f6',
    secondaryColor: '#a855f7',
    hasWings: true,
  },
  golbat: {
    speciesId: 'golbat',
    nationalDexNumber: 42,
    modelUrl: '/models/pokemon/golbat.glb',
    scale: 1.2,
    groundOffset: 1.3,
    readiness: 'FALLBACK',
    fallbackMeshType: 'winged_bat',
    primaryColor: '#2563eb',
    secondaryColor: '#9333ea',
    hasWings: true,
  },
  oddish: {
    speciesId: 'oddish',
    nationalDexNumber: 43,
    modelUrl: '/models/pokemon/oddish.glb',
    scale: 0.65,
    groundOffset: 0.0,
    readiness: 'FALLBACK',
    fallbackMeshType: 'biped',
    primaryColor: '#1d4ed8',
    secondaryColor: '#22c55e',
    accentColor: '#ef4444',
    hasBackPlant: true,
  },
  gloom: {
    speciesId: 'gloom',
    nationalDexNumber: 44,
    modelUrl: '/models/pokemon/gloom.glb',
    scale: 0.9,
    groundOffset: 0.0,
    readiness: 'FALLBACK',
    fallbackMeshType: 'biped',
    primaryColor: '#1e40af',
    secondaryColor: '#ea580c',
    accentColor: '#facc15',
    hasBackPlant: true,
  },
  vileplume: {
    speciesId: 'vileplume',
    nationalDexNumber: 45,
    modelUrl: '/models/pokemon/vileplume.glb',
    scale: 1.2,
    groundOffset: 0.0,
    readiness: 'FALLBACK',
    fallbackMeshType: 'biped',
    primaryColor: '#1e3a8a',
    secondaryColor: '#dc2626',
    accentColor: '#fef08a',
    hasBackPlant: true,
  },
  psyduck: {
    speciesId: 'psyduck',
    nationalDexNumber: 54,
    modelUrl: '/models/pokemon/psyduck.glb',
    scale: 0.85,
    groundOffset: 0.0,
    readiness: 'FALLBACK',
    fallbackMeshType: 'biped',
    primaryColor: '#facc15',
    secondaryColor: '#fed7aa',
    accentColor: '#1e293b',
  },
  golduck: {
    speciesId: 'golduck',
    nationalDexNumber: 55,
    modelUrl: '/models/pokemon/golduck.glb',
    scale: 1.3,
    groundOffset: 0.0,
    readiness: 'FALLBACK',
    fallbackMeshType: 'biped',
    primaryColor: '#0284c7',
    secondaryColor: '#fde047',
    accentColor: '#ef4444',
  },
  growlithe: {
    speciesId: 'growlithe',
    nationalDexNumber: 58,
    modelUrl: '/models/pokemon/growlithe.glb',
    scale: 0.85,
    groundOffset: 0.0,
    readiness: 'FALLBACK',
    fallbackMeshType: 'quadruped',
    primaryColor: '#f97316',
    secondaryColor: '#fef3c7',
    accentColor: '#1e293b',
  },
  arcanine: {
    speciesId: 'arcanine',
    nationalDexNumber: 59,
    modelUrl: '/models/pokemon/arcanine.glb',
    scale: 1.5,
    groundOffset: 0.0,
    readiness: 'FALLBACK',
    fallbackMeshType: 'quadruped',
    primaryColor: '#ea580c',
    secondaryColor: '#fffbeb',
    accentColor: '#1e293b',
    hasFluffyMane: true,
  },
  poliwag: {
    speciesId: 'poliwag',
    nationalDexNumber: 60,
    modelUrl: '/models/pokemon/poliwag.glb',
    scale: 0.7,
    groundOffset: 0.0,
    readiness: 'FALLBACK',
    fallbackMeshType: 'biped',
    primaryColor: '#2563eb',
    secondaryColor: '#f8fafc',
    accentColor: '#0284c7',
  },
  poliwhirl: {
    speciesId: 'poliwhirl',
    nationalDexNumber: 61,
    modelUrl: '/models/pokemon/poliwhirl.glb',
    scale: 1.0,
    groundOffset: 0.0,
    readiness: 'FALLBACK',
    fallbackMeshType: 'biped',
    primaryColor: '#1d4ed8',
    secondaryColor: '#f8fafc',
  },
  poliwrath: {
    speciesId: 'poliwrath',
    nationalDexNumber: 62,
    modelUrl: '/models/pokemon/poliwrath.glb',
    scale: 1.3,
    groundOffset: 0.0,
    readiness: 'FALLBACK',
    fallbackMeshType: 'biped',
    primaryColor: '#1e40af',
    secondaryColor: '#f8fafc',
  },
  geodude: {
    speciesId: 'geodude',
    nationalDexNumber: 74,
    modelUrl: '/models/pokemon/geodude.glb',
    scale: 0.75,
    groundOffset: 0.35,
    readiness: 'FALLBACK',
    fallbackMeshType: 'rock_golem',
    primaryColor: '#78716c',
    secondaryColor: '#a8a29e',
  },
  graveler: {
    speciesId: 'graveler',
    nationalDexNumber: 75,
    modelUrl: '/models/pokemon/graveler.glb',
    scale: 1.1,
    groundOffset: 0.0,
    readiness: 'FALLBACK',
    fallbackMeshType: 'rock_golem',
    primaryColor: '#78716c',
    secondaryColor: '#57534e',
  },
  golem: {
    speciesId: 'golem',
    nationalDexNumber: 76,
    modelUrl: '/models/pokemon/golem.glb',
    scale: 1.4,
    groundOffset: 0.0,
    readiness: 'FALLBACK',
    fallbackMeshType: 'turtle',
    primaryColor: '#78716c',
    secondaryColor: '#a8a29e',
    hasShell: true,
  },
  gastly: {
    speciesId: 'gastly',
    nationalDexNumber: 92,
    modelUrl: '/models/pokemon/gastly.glb',
    scale: 0.85,
    groundOffset: 0.8,
    readiness: 'FALLBACK',
    fallbackMeshType: 'spectral_orb',
    primaryColor: '#1e1b4b',
    secondaryColor: '#7c3aed',
    accentColor: '#f8fafc',
    hasGhostAura: true,
  },
  haunter: {
    speciesId: 'haunter',
    nationalDexNumber: 93,
    modelUrl: '/models/pokemon/haunter.glb',
    scale: 1.15,
    groundOffset: 1.0,
    readiness: 'FALLBACK',
    fallbackMeshType: 'spectral_orb',
    primaryColor: '#312e81',
    secondaryColor: '#6d28d9',
    accentColor: '#f8fafc',
    hasGhostAura: true,
  },
  gengar: {
    speciesId: 'gengar',
    nationalDexNumber: 94,
    modelUrl: '/models/pokemon/gengar.glb',
    scale: 1.3,
    groundOffset: 0.0,
    readiness: 'FALLBACK',
    fallbackMeshType: 'biped',
    primaryColor: '#4c1d95',
    secondaryColor: '#ef4444',
    hasGhostAura: true,
  },
  onix: {
    speciesId: 'onix',
    nationalDexNumber: 95,
    modelUrl: '/models/pokemon/onix.glb',
    scale: 2.0,
    groundOffset: 0.0,
    readiness: 'FALLBACK',
    fallbackMeshType: 'serpentine',
    primaryColor: '#78716c',
    secondaryColor: '#57534e',
    hasSegmentedSpine: true,
  },
  magikarp: {
    speciesId: 'magikarp',
    nationalDexNumber: 129,
    modelUrl: '/models/pokemon/magikarp.glb',
    scale: 0.85,
    groundOffset: 0.0,
    readiness: 'FALLBACK',
    fallbackMeshType: 'fish',
    primaryColor: '#ef4444',
    secondaryColor: '#facc15',
    accentColor: '#f8fafc',
  },
  gyarados: {
    speciesId: 'gyarados',
    nationalDexNumber: 130,
    modelUrl: '/models/pokemon/gyarados.glb',
    scale: 2.2,
    groundOffset: 0.4,
    readiness: 'FALLBACK',
    fallbackMeshType: 'serpentine',
    primaryColor: '#0284c7',
    secondaryColor: '#fef08a',
    accentColor: '#ef4444',
    hasSegmentedSpine: true,
  },
  eevee: {
    speciesId: 'eevee',
    nationalDexNumber: 133,
    modelUrl: '/models/pokemon/eevee.glb',
    scale: 0.75,
    groundOffset: 0.0,
    readiness: 'FALLBACK',
    fallbackMeshType: 'quadruped',
    primaryColor: '#92400e',
    secondaryColor: '#fef3c7',
    hasFluffyMane: true,
  },
  vaporeon: {
    speciesId: 'vaporeon',
    nationalDexNumber: 134,
    modelUrl: '/models/pokemon/vaporeon.glb',
    scale: 1.0,
    groundOffset: 0.0,
    readiness: 'FALLBACK',
    fallbackMeshType: 'quadruped',
    primaryColor: '#0284c7',
    secondaryColor: '#38bdf8',
    accentColor: '#fef08a',
    hasFluffyMane: true,
  },
  jolteon: {
    speciesId: 'jolteon',
    nationalDexNumber: 135,
    modelUrl: '/models/pokemon/jolteon.glb',
    scale: 1.0,
    groundOffset: 0.0,
    readiness: 'FALLBACK',
    fallbackMeshType: 'quadruped',
    primaryColor: '#facc15',
    secondaryColor: '#f8fafc',
    hasFluffyMane: true,
  },
  flareon: {
    speciesId: 'flareon',
    nationalDexNumber: 136,
    modelUrl: '/models/pokemon/flareon.glb',
    scale: 1.0,
    groundOffset: 0.0,
    readiness: 'FALLBACK',
    fallbackMeshType: 'quadruped',
    primaryColor: '#ea580c',
    secondaryColor: '#fef08a',
    hasFluffyMane: true,
  },
  snorlax: {
    speciesId: 'snorlax',
    nationalDexNumber: 143,
    modelUrl: '/models/pokemon/snorlax.glb',
    scale: 1.7,
    groundOffset: 0.0,
    readiness: 'FALLBACK',
    fallbackMeshType: 'biped',
    primaryColor: '#1e3a8a',
    secondaryColor: '#fef3c7',
  },
  dratini: {
    speciesId: 'dratini',
    nationalDexNumber: 147,
    modelUrl: '/models/pokemon/dratini.glb',
    scale: 0.85,
    groundOffset: 0.0,
    readiness: 'FALLBACK',
    fallbackMeshType: 'serpentine',
    primaryColor: '#60a5fa',
    secondaryColor: '#f8fafc',
  },
  dragonair: {
    speciesId: 'dragonair',
    nationalDexNumber: 148,
    modelUrl: '/models/pokemon/dragonair.glb',
    scale: 1.3,
    groundOffset: 0.0,
    readiness: 'FALLBACK',
    fallbackMeshType: 'serpentine',
    primaryColor: '#3b82f6',
    secondaryColor: '#f8fafc',
    accentColor: '#38bdf8',
  },
  dragonite: {
    speciesId: 'dragonite',
    nationalDexNumber: 149,
    modelUrl: '/models/pokemon/dragonite.glb',
    scale: 1.7,
    groundOffset: 0.8,
    readiness: 'FALLBACK',
    fallbackMeshType: 'biped',
    primaryColor: '#f59e0b',
    secondaryColor: '#4ade80',
    hasWings: true,
  },
  mewtwo: {
    speciesId: 'mewtwo',
    nationalDexNumber: 150,
    modelUrl: '/models/pokemon/mewtwo.glb',
    scale: 1.6,
    groundOffset: 0.5,
    readiness: 'FALLBACK',
    fallbackMeshType: 'biped',
    primaryColor: '#e2e8f0',
    secondaryColor: '#7c3aed',
    hasGhostAura: true,
  },
  mew: {
    speciesId: 'mew',
    nationalDexNumber: 151,
    modelUrl: '/models/pokemon/mew.glb',
    scale: 0.65,
    groundOffset: 0.9,
    readiness: 'FALLBACK',
    fallbackMeshType: 'biped',
    primaryColor: '#f472b6',
    secondaryColor: '#fbcfe8',
    accentColor: '#38bdf8',
    hasGhostAura: true,
  },
  lucario: {
    speciesId: 'lucario',
    nationalDexNumber: 448,
    modelUrl: '/models/pokemon/lucario.glb',
    scale: 1.2,
    groundOffset: 0.0,
    readiness: 'FALLBACK',
    fallbackMeshType: 'biped',
    primaryColor: '#0284c7',
    secondaryColor: '#1e293b',
    accentColor: '#fef08a',
  },
  garchomp: {
    speciesId: 'garchomp',
    nationalDexNumber: 445,
    modelUrl: '/models/pokemon/garchomp.glb',
    scale: 1.6,
    groundOffset: 0.0,
    readiness: 'FALLBACK',
    fallbackMeshType: 'biped',
    primaryColor: '#1e40af',
    secondaryColor: '#dc2626',
    accentColor: '#facc15',
    hasWings: true,
  },
  rayquaza: {
    speciesId: 'rayquaza',
    nationalDexNumber: 384,
    modelUrl: '/models/pokemon/rayquaza.glb',
    scale: 2.3,
    groundOffset: 1.8,
    readiness: 'FALLBACK',
    fallbackMeshType: 'serpentine',
    primaryColor: '#15803d',
    secondaryColor: '#facc15',
    accentColor: '#dc2626',
    hasSegmentedSpine: true,
  },
};

/**
 * Returns the asset definition for a Pokémon species, or creates a standard fallback.
 */
export function getPokemonAsset(speciesId: string): PokemonAssetDefinition {
  if (POKEMON_ASSET_REGISTRY[speciesId]) {
    return POKEMON_ASSET_REGISTRY[speciesId];
  }

  const species = POKEMON_SPECIES_DATABASE[speciesId];
  const primaryColor = species?.visualConfig?.primaryColor || '#78c850';
  const secondaryColor = species?.visualConfig?.secondaryColor || '#ffffff';
  const scale = species ? Math.max(0.6, Math.min(2.2, species.heightMeters * 0.9)) : 1.0;

  return {
    speciesId,
    nationalDexNumber: species?.nationalDexNumber || 0,
    modelUrl: `/models/pokemon/${speciesId}.glb`,
    scale,
    groundOffset: species?.visualConfig?.yOffset || 0.0,
    readiness: 'FALLBACK',
    fallbackMeshType: 'quadruped',
    primaryColor,
    secondaryColor,
  };
}

export interface AssetValidationReport {
  totalRegistered: number;
  readyCount: number;
  fallbackCount: number;
  missingCount: number;
  warnings: string[];
}

/**
 * Validates asset registry integrity at development time.
 */
export function validatePokemonAssets(): AssetValidationReport {
  const warnings: string[] = [];
  const entries = Object.values(POKEMON_ASSET_REGISTRY);

  let readyCount = 0;
  let fallbackCount = 0;
  let missingCount = 0;

  for (const entry of entries) {
    if (entry.readiness === 'READY') readyCount++;
    else if (entry.readiness === 'FALLBACK') fallbackCount++;
    else missingCount++;

    if (!POKEMON_SPECIES_DATABASE[entry.speciesId]) {
      warnings.push(`Asset registered for unknown speciesId: ${entry.speciesId}`);
    }

    if (entry.scale <= 0 || entry.scale > 5) {
      warnings.push(`Abnormal scale (${entry.scale}) for species: ${entry.speciesId}`);
    }
  }

  return {
    totalRegistered: entries.length,
    readyCount,
    fallbackCount,
    missingCount,
    warnings,
  };
}
