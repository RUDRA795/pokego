/**
 * Pokémon 3D RPG — Canonical Species Behavior Profiles
 * 
 * Sourced directly from Pokédex & Pokémon Wiki ecological biology:
 * Defines locomotion styles, biome affinities, day/night cycles, weather preferences,
 * movement speeds, detection ranges, flee mechanics, and group flocking sizes.
 */

import { BiomeZoneType } from '../biomes';
import { LocomotionType, AIBehaviorType } from '../../types/pokemon';
import { getPokemonById } from './index';

export type ExtendedAIState =
  | 'IDLE'
  | 'WANDER'
  | 'EXPLORE'
  | 'GRAZE'
  | 'REST'
  | 'LOOK_AROUND'
  | 'FOLLOW_GROUP'
  | 'FLEE'
  | 'INVESTIGATE'
  | 'PLAY'
  | 'SWIM'
  | 'FLY'
  | 'DETECTED'
  | 'APPROACH'
  | 'ENCOUNTER';

export interface PokemonBehaviorProfile {
  speciesId: string;
  locomotion: LocomotionType;
  preferredBiomes: BiomeZoneType[];
  preferredTime: 'DAY' | 'NIGHT' | 'ANY';
  preferredWeather: ('CLEAR' | 'SUNNY' | 'RAIN' | 'SANDSTORM')[];
  movementSpeed: number;
  detectionRange: number;
  fleeDistance: number;
  socialGroupSize: { min: number; max: number };
  allowedStates: ExtendedAIState[];
  idleBehaviors: ('graze' | 'look_around' | 'rest' | 'sleep' | 'play' | 'splash' | 'perch')[];
  fleeBehavior: 'run' | 'fly_away' | 'dive' | 'burrow';
}

export const POKEMON_BEHAVIOR_PROFILES: Record<string, PokemonBehaviorProfile> = {
  bulbasaur: {
    speciesId: 'bulbasaur',
    locomotion: 'ground_walk',
    preferredBiomes: ['FOREST', 'MEADOW'],
    preferredTime: 'DAY',
    preferredWeather: ['CLEAR', 'SUNNY', 'RAIN'],
    movementSpeed: 1.0,
    detectionRange: 6.0,
    fleeDistance: 7.0,
    socialGroupSize: { min: 1, max: 2 },
    allowedStates: ['IDLE', 'WANDER', 'GRAZE', 'REST', 'LOOK_AROUND', 'INVESTIGATE', 'ENCOUNTER'],
    idleBehaviors: ['graze', 'look_around', 'rest'],
    fleeBehavior: 'run',
  },
  charmander: {
    speciesId: 'charmander',
    locomotion: 'ground_walk',
    preferredBiomes: ['ROCKY_AREA', 'HIGH_GROUND'],
    preferredTime: 'DAY',
    preferredWeather: ['CLEAR', 'SUNNY'],
    movementSpeed: 1.25,
    detectionRange: 7.0,
    fleeDistance: 8.0,
    socialGroupSize: { min: 1, max: 2 },
    allowedStates: ['IDLE', 'WANDER', 'EXPLORE', 'LOOK_AROUND', 'INVESTIGATE', 'ENCOUNTER'],
    idleBehaviors: ['look_around', 'play'],
    fleeBehavior: 'run',
  },
  squirtle: {
    speciesId: 'squirtle',
    locomotion: 'swimming',
    preferredBiomes: ['POND_LAKE'],
    preferredTime: 'ANY',
    preferredWeather: ['CLEAR', 'RAIN'],
    movementSpeed: 1.1,
    detectionRange: 6.5,
    fleeDistance: 7.5,
    socialGroupSize: { min: 1, max: 3 },
    allowedStates: ['IDLE', 'WANDER', 'SWIM', 'PLAY', 'REST', 'ENCOUNTER'],
    idleBehaviors: ['splash', 'look_around', 'rest'],
    fleeBehavior: 'dive',
  },
  caterpie: {
    speciesId: 'caterpie',
    locomotion: 'ground_walk',
    preferredBiomes: ['FOREST', 'MEADOW'],
    preferredTime: 'DAY',
    preferredWeather: ['CLEAR', 'SUNNY', 'RAIN'],
    movementSpeed: 0.65,
    detectionRange: 4.5,
    fleeDistance: 5.0,
    socialGroupSize: { min: 1, max: 3 },
    allowedStates: ['IDLE', 'WANDER', 'GRAZE', 'REST', 'FLEE', 'ENCOUNTER'],
    idleBehaviors: ['graze', 'rest'],
    fleeBehavior: 'run',
  },
  pidgey: {
    speciesId: 'pidgey',
    locomotion: 'flying',
    preferredBiomes: ['MEADOW', 'FOREST', 'HIGH_GROUND'],
    preferredTime: 'DAY',
    preferredWeather: ['CLEAR', 'SUNNY'],
    movementSpeed: 1.8,
    detectionRange: 8.0,
    fleeDistance: 10.0,
    socialGroupSize: { min: 2, max: 4 }, // Social flocking
    allowedStates: ['IDLE', 'WANDER', 'FLY', 'GRAZE', 'FOLLOW_GROUP', 'FLEE', 'ENCOUNTER'],
    idleBehaviors: ['perch', 'look_around', 'graze'],
    fleeBehavior: 'fly_away',
  },
  pikachu: {
    speciesId: 'pikachu',
    locomotion: 'ground_hop',
    preferredBiomes: ['MEADOW', 'FOREST'],
    preferredTime: 'ANY',
    preferredWeather: ['CLEAR', 'SUNNY', 'RAIN'],
    movementSpeed: 1.5,
    detectionRange: 7.0,
    fleeDistance: 8.0,
    socialGroupSize: { min: 1, max: 2 },
    allowedStates: ['IDLE', 'WANDER', 'EXPLORE', 'PLAY', 'LOOK_AROUND', 'INVESTIGATE', 'ENCOUNTER'],
    idleBehaviors: ['play', 'look_around', 'rest'],
    fleeBehavior: 'run',
  },
  zubat: {
    speciesId: 'zubat',
    locomotion: 'flying',
    preferredBiomes: ['CAVE_ENTRANCE', 'NIGHT_AREA'],
    preferredTime: 'NIGHT',
    preferredWeather: ['CLEAR', 'RAIN'],
    movementSpeed: 1.6,
    detectionRange: 7.5,
    fleeDistance: 9.0,
    socialGroupSize: { min: 2, max: 5 }, // Cave colonies
    allowedStates: ['IDLE', 'WANDER', 'FLY', 'FOLLOW_GROUP', 'INVESTIGATE', 'ENCOUNTER'],
    idleBehaviors: ['perch', 'look_around'],
    fleeBehavior: 'fly_away',
  },
  oddish: {
    speciesId: 'oddish',
    locomotion: 'ground_hop',
    preferredBiomes: ['MEADOW', 'FOREST', 'NIGHT_AREA'],
    preferredTime: 'NIGHT',
    preferredWeather: ['CLEAR', 'RAIN'],
    movementSpeed: 0.8,
    detectionRange: 5.5,
    fleeDistance: 6.0,
    socialGroupSize: { min: 1, max: 3 },
    allowedStates: ['IDLE', 'WANDER', 'REST', 'GRAZE', 'ENCOUNTER'],
    idleBehaviors: ['graze', 'rest', 'sleep'],
    fleeBehavior: 'burrow',
  },
  psyduck: {
    speciesId: 'psyduck',
    locomotion: 'swimming',
    preferredBiomes: ['POND_LAKE'],
    preferredTime: 'ANY',
    preferredWeather: ['CLEAR', 'RAIN'],
    movementSpeed: 0.9,
    detectionRange: 5.0,
    fleeDistance: 6.5,
    socialGroupSize: { min: 1, max: 2 },
    allowedStates: ['IDLE', 'WANDER', 'SWIM', 'LOOK_AROUND', 'REST', 'ENCOUNTER'],
    idleBehaviors: ['look_around', 'rest', 'splash'],
    fleeBehavior: 'dive',
  },
  poliwag: {
    speciesId: 'poliwag',
    locomotion: 'swimming',
    preferredBiomes: ['POND_LAKE'],
    preferredTime: 'ANY',
    preferredWeather: ['CLEAR', 'RAIN'],
    movementSpeed: 1.2,
    detectionRange: 6.0,
    fleeDistance: 7.0,
    socialGroupSize: { min: 2, max: 4 },
    allowedStates: ['IDLE', 'WANDER', 'SWIM', 'PLAY', 'FOLLOW_GROUP', 'ENCOUNTER'],
    idleBehaviors: ['splash', 'play'],
    fleeBehavior: 'dive',
  },
  geodude: {
    speciesId: 'geodude',
    locomotion: 'hovering',
    preferredBiomes: ['ROCKY_AREA', 'CAVE_ENTRANCE'],
    preferredTime: 'ANY',
    preferredWeather: ['CLEAR', 'SUNNY', 'SANDSTORM'],
    movementSpeed: 0.85,
    detectionRange: 5.0,
    fleeDistance: 6.0,
    socialGroupSize: { min: 1, max: 3 },
    allowedStates: ['IDLE', 'WANDER', 'REST', 'LOOK_AROUND', 'ENCOUNTER'],
    idleBehaviors: ['rest', 'look_around'],
    fleeBehavior: 'run',
  },
  gastly: {
    speciesId: 'gastly',
    locomotion: 'hovering',
    preferredBiomes: ['CAVE_ENTRANCE', 'NIGHT_AREA'],
    preferredTime: 'NIGHT',
    preferredWeather: ['CLEAR', 'RAIN'],
    movementSpeed: 1.4,
    detectionRange: 7.5,
    fleeDistance: 8.0,
    socialGroupSize: { min: 1, max: 2 },
    allowedStates: ['IDLE', 'WANDER', 'FLY', 'INVESTIGATE', 'PLAY', 'ENCOUNTER'],
    idleBehaviors: ['look_around', 'play'],
    fleeBehavior: 'fly_away',
  },
  onix: {
    speciesId: 'onix',
    locomotion: 'ground_walk',
    preferredBiomes: ['CAVE_ENTRANCE', 'ROCKY_AREA'],
    preferredTime: 'ANY',
    preferredWeather: ['CLEAR', 'SANDSTORM'],
    movementSpeed: 0.9,
    detectionRange: 8.0,
    fleeDistance: 10.0,
    socialGroupSize: { min: 1, max: 1 },
    allowedStates: ['IDLE', 'WANDER', 'REST', 'LOOK_AROUND', 'ENCOUNTER'],
    idleBehaviors: ['rest', 'look_around'],
    fleeBehavior: 'burrow',
  },
  magikarp: {
    speciesId: 'magikarp',
    locomotion: 'swimming',
    preferredBiomes: ['POND_LAKE'],
    preferredTime: 'ANY',
    preferredWeather: ['CLEAR', 'RAIN'],
    movementSpeed: 0.9,
    detectionRange: 4.5,
    fleeDistance: 6.0,
    socialGroupSize: { min: 2, max: 5 }, // Schools of fish
    allowedStates: ['IDLE', 'WANDER', 'SWIM', 'PLAY', 'FOLLOW_GROUP', 'ENCOUNTER'],
    idleBehaviors: ['splash', 'play'],
    fleeBehavior: 'dive',
  },
  eevee: {
    speciesId: 'eevee',
    locomotion: 'ground_walk',
    preferredBiomes: ['MEADOW', 'FOREST'],
    preferredTime: 'DAY',
    preferredWeather: ['CLEAR', 'SUNNY'],
    movementSpeed: 1.3,
    detectionRange: 7.0,
    fleeDistance: 8.0,
    socialGroupSize: { min: 1, max: 2 },
    allowedStates: ['IDLE', 'WANDER', 'EXPLORE', 'PLAY', 'LOOK_AROUND', 'INVESTIGATE', 'ENCOUNTER'],
    idleBehaviors: ['play', 'look_around', 'rest'],
    fleeBehavior: 'run',
  },
};

/**
 * Returns the behavior profile for a species, or synthesizes a canonical fallback.
 */
export function getPokemonBehaviorProfile(speciesId: string): PokemonBehaviorProfile {
  if (POKEMON_BEHAVIOR_PROFILES[speciesId]) {
    return POKEMON_BEHAVIOR_PROFILES[speciesId];
  }

  const species = getPokemonById(speciesId);
  const locomotion = species?.visualConfig?.locomotion || 'ground_walk';
  const habitat = species?.canonicalHabitat;

  let preferredBiomes: BiomeZoneType[] = ['MEADOW'];
  if (habitat === 'WatersEdge' || habitat === 'Sea') preferredBiomes = ['POND_LAKE'];
  else if (habitat === 'Forest') preferredBiomes = ['FOREST'];
  else if (habitat === 'Mountain') preferredBiomes = ['ROCKY_AREA', 'HIGH_GROUND'];
  else if (habitat === 'Cave') preferredBiomes = ['CAVE_ENTRANCE', 'NIGHT_AREA'];

  const isNocturnal = species?.aiBehavior === 'Nocturnal';

  return {
    speciesId,
    locomotion,
    preferredBiomes,
    preferredTime: isNocturnal ? 'NIGHT' : 'ANY',
    preferredWeather: ['CLEAR', 'SUNNY', 'RAIN'],
    movementSpeed: 1.1,
    detectionRange: 6.0,
    fleeDistance: 7.5,
    socialGroupSize: { min: 1, max: 2 },
    allowedStates: ['IDLE', 'WANDER', 'REST', 'LOOK_AROUND', 'ENCOUNTER'],
    idleBehaviors: ['look_around', 'rest'],
    fleeBehavior: locomotion === 'flying' ? 'fly_away' : locomotion === 'swimming' ? 'dive' : 'run',
  };
}
