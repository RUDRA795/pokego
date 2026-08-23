/**
 * Pokémon 3D RPG — World Biomes & Ecological Spawning Configuration
 * 
 * Defines the 7 ecological world zones:
 * - MEADOW (Central open grass, normal & basic spawns)
 * - FOREST (North-West tree grove, Bug & Grass spawns)
 * - POND / LAKE (North-East water basin, Water spawns)
 * - ROCKY AREA (East mountain ridge, Rock & Ground spawns)
 * - CAVE ENTRANCE (South-West cavern mouth, Ghost & Poison spawns)
 * - HIGH GROUND (South-East cliff plateau, Flying & Dragon spawns)
 * - NIGHT AREA (Active during night cycle for nocturnal Pokémon)
 */

export interface WorldBoundary {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface ObstacleCollider {
  x: number;
  z: number;
  radius: number;
  type: 'tree' | 'rock' | 'water' | 'fence';
}

export type BiomeZoneType =
  | 'MEADOW'
  | 'FOREST'
  | 'POND_LAKE'
  | 'ROCKY_AREA'
  | 'CAVE_ENTRANCE'
  | 'HIGH_GROUND'
  | 'NIGHT_AREA';

export interface EcologicalZone {
  id: BiomeZoneType;
  name: string;
  center: [number, number];
  radius: number;
  primaryHabitats: ('Grassland' | 'Forest' | 'WatersEdge' | 'Mountain' | 'Cave' | 'Urban')[];
  boostedTypes: string[];
  ambientColor: string;
}

export interface SpawnAnchor {
  speciesId: string;
  position: [number, number, number];
  preferredHabitat: 'Grassland' | 'Forest' | 'WatersEdge' | 'Mountain' | 'Cave';
  zoneId?: BiomeZoneType;
}

export const ECOLOGICAL_ZONES: Record<BiomeZoneType, EcologicalZone> = {
  MEADOW: {
    id: 'MEADOW',
    name: 'Emerald Meadow',
    center: [0, 0],
    radius: 10,
    primaryHabitats: ['Grassland', 'Urban'],
    boostedTypes: ['Normal', 'Electric', 'Fairy'],
    ambientColor: '#22c55e',
  },
  FOREST: {
    id: 'FOREST',
    name: 'Whispering Woods',
    center: [-14, -10],
    radius: 9,
    primaryHabitats: ['Forest', 'Grassland'],
    boostedTypes: ['Grass', 'Bug', 'Flying'],
    ambientColor: '#16a34a',
  },
  POND_LAKE: {
    id: 'POND_LAKE',
    name: 'Azure Lake',
    center: [8, -8],
    radius: 8,
    primaryHabitats: ['WatersEdge'],
    boostedTypes: ['Water', 'Ice'],
    ambientColor: '#0284c7',
  },
  ROCKY_AREA: {
    id: 'ROCKY_AREA',
    name: 'Granite Crags',
    center: [14, 8],
    radius: 8,
    primaryHabitats: ['Mountain'],
    boostedTypes: ['Rock', 'Ground', 'Fire'],
    ambientColor: '#ea580c',
  },
  CAVE_ENTRANCE: {
    id: 'CAVE_ENTRANCE',
    name: 'Shadow Cavern',
    center: [-16, 12],
    radius: 8,
    primaryHabitats: ['Cave', 'Mountain'],
    boostedTypes: ['Ghost', 'Poison', 'Dark'],
    ambientColor: '#7c3aed',
  },
  HIGH_GROUND: {
    id: 'HIGH_GROUND',
    name: 'Windswept Plateau',
    center: [12, -16],
    radius: 8,
    primaryHabitats: ['Mountain', 'Grassland'],
    boostedTypes: ['Flying', 'Dragon', 'Steel'],
    ambientColor: '#38bdf8',
  },
  NIGHT_AREA: {
    id: 'NIGHT_AREA',
    name: 'Moonlit Sanctuary',
    center: [0, 14],
    radius: 12,
    primaryHabitats: ['Cave', 'Forest'],
    boostedTypes: ['Ghost', 'Dark', 'Psychic'],
    ambientColor: '#6366f1',
  },
};

export const WORLD_CONFIG = {
  name: 'Verdant Clearing',
  size: 60, // 60x60 playable island
  boundary: {
    minX: -26,
    maxX: 26,
    minZ: -26,
    maxZ: 26,
  } as WorldBoundary,
  spawnRadius: 22,
  pond: {
    x: 8,
    z: -8,
    radiusX: 7,
    radiusZ: 5,
  },
  obstacles: [
    // Trees
    { x: -12, z: -10, radius: 1.5, type: 'tree' },
    { x: -16, z: -8, radius: 1.5, type: 'tree' },
    { x: -14, z: 12, radius: 1.5, type: 'tree' },
    { x: -18, z: 15, radius: 1.5, type: 'tree' },
    { x: 14, z: 14, radius: 1.5, type: 'tree' },
    { x: 18, z: 10, radius: 1.5, type: 'tree' },
    { x: 5, z: 18, radius: 1.5, type: 'tree' },
    { x: -6, z: -18, radius: 1.5, type: 'tree' },

    // Boulders / Rocks
    { x: -8, z: 6, radius: 1.8, type: 'rock' },
    { x: 12, z: -2, radius: 2.0, type: 'rock' },
    { x: -5, z: 15, radius: 1.6, type: 'rock' },
    { x: 16, z: -16, radius: 2.2, type: 'rock' },
    { x: -20, z: -2, radius: 2.0, type: 'rock' },

    // Pond center boundary
    { x: 8, z: -8, radius: 5.5, type: 'water' },
  ] as ObstacleCollider[],

  // Canonical Pokémon spawn anchors distributed across the 7 ecological biomes
  initialSpawns: [
    // Forest / Whispering Woods
    { speciesId: 'bulbasaur', position: [-14, 0, -8] as [number, number, number], preferredHabitat: 'Forest', zoneId: 'FOREST' },
    { speciesId: 'caterpie', position: [-12, 0, -12] as [number, number, number], preferredHabitat: 'Forest', zoneId: 'FOREST' },

    // Azure Lake / WatersEdge
    { speciesId: 'squirtle', position: [7, 0, -6] as [number, number, number], preferredHabitat: 'WatersEdge', zoneId: 'POND_LAKE' },
    { speciesId: 'poliwag', position: [10, 0, -9] as [number, number, number], preferredHabitat: 'WatersEdge', zoneId: 'POND_LAKE' },
    { speciesId: 'magikarp', position: [8, 0, -8] as [number, number, number], preferredHabitat: 'WatersEdge', zoneId: 'POND_LAKE' },

    // Granite Crags / Mountain
    { speciesId: 'charmander', position: [14, 0, 6] as [number, number, number], preferredHabitat: 'Mountain', zoneId: 'ROCKY_AREA' },
    { speciesId: 'geodude', position: [16, 0, 10] as [number, number, number], preferredHabitat: 'Mountain', zoneId: 'ROCKY_AREA' },

    // Shadow Cavern
    { speciesId: 'gastly', position: [-16, 0, 14] as [number, number, number], preferredHabitat: 'Cave', zoneId: 'CAVE_ENTRANCE' },
    { speciesId: 'zubat', position: [-14, 0, 10] as [number, number, number], preferredHabitat: 'Cave', zoneId: 'CAVE_ENTRANCE' },

    // Emerald Meadow
    { speciesId: 'pikachu', position: [-2, 0, -2] as [number, number, number], preferredHabitat: 'Grassland', zoneId: 'MEADOW' },
    { speciesId: 'eevee', position: [2, 0, 2] as [number, number, number], preferredHabitat: 'Grassland', zoneId: 'MEADOW' },
    { speciesId: 'pidgey', position: [-2, 0, 8] as [number, number, number], preferredHabitat: 'Grassland', zoneId: 'MEADOW' },
  ] as SpawnAnchor[]
};
