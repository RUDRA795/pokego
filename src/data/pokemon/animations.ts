/**
 * Pokémon 3D RPG — Species Animation Profiles
 * 
 * Configures procedural and skeletal animation mappings per Pokémon species:
 * - Breathing and idle pacing
 * - Stride gait and bounce frequency
 * - Wing flap cycles
 * - Ear twitches, tail wags, flame flickers, and body undulation
 * - Battle lunge, hit recoil, and faint arcs
 */

export interface AnimationPacing {
  frequency: number;
  amplitude: number;
}

export interface PokemonAnimationProfile {
  speciesId: string;
  idle: AnimationPacing;
  walk: AnimationPacing;
  run: AnimationPacing;
  attackDuration: number;
  hitDuration: number;
  faintDuration: number;
  specialProps: {
    earTwitch?: boolean;
    tailFlameFlicker?: boolean;
    tailWag?: boolean;
    wingFlapSpeed?: number;
    bulbPulse?: boolean;
    waterBubble?: boolean;
    eyeGlow?: boolean;
    segmentedBodyCurl?: boolean;
    auraShimmer?: boolean;
    shellRetreat?: boolean;
    hoppingGait?: boolean;
  };
}

export const POKEMON_ANIMATION_PROFILES: Record<string, PokemonAnimationProfile> = {
  bulbasaur: {
    speciesId: 'bulbasaur',
    idle: { frequency: 1.8, amplitude: 0.03 },
    walk: { frequency: 6.0, amplitude: 0.08 },
    run: { frequency: 9.0, amplitude: 0.14 },
    attackDuration: 0.55,
    hitDuration: 0.4,
    faintDuration: 0.8,
    specialProps: { bulbPulse: true, tailWag: false },
  },
  charmander: {
    speciesId: 'charmander',
    idle: { frequency: 2.2, amplitude: 0.04 },
    walk: { frequency: 7.5, amplitude: 0.1 },
    run: { frequency: 11.0, amplitude: 0.16 },
    attackDuration: 0.5,
    hitDuration: 0.4,
    faintDuration: 0.8,
    specialProps: { tailFlameFlicker: true, tailWag: true },
  },
  squirtle: {
    speciesId: 'squirtle',
    idle: { frequency: 2.0, amplitude: 0.04 },
    walk: { frequency: 6.5, amplitude: 0.09 },
    run: { frequency: 9.5, amplitude: 0.14 },
    attackDuration: 0.5,
    hitDuration: 0.45,
    faintDuration: 0.8,
    specialProps: { shellRetreat: true, waterBubble: true },
  },
  pikachu: {
    speciesId: 'pikachu',
    idle: { frequency: 3.0, amplitude: 0.05 },
    walk: { frequency: 9.0, amplitude: 0.18 },
    run: { frequency: 13.0, amplitude: 0.28 },
    attackDuration: 0.45,
    hitDuration: 0.35,
    faintDuration: 0.75,
    specialProps: { earTwitch: true, tailWag: true, hoppingGait: true },
  },
  pidgey: {
    speciesId: 'pidgey',
    idle: { frequency: 3.5, amplitude: 0.12 },
    walk: { frequency: 8.0, amplitude: 0.08 },
    run: { frequency: 14.0, amplitude: 0.15 },
    attackDuration: 0.45,
    hitDuration: 0.4,
    faintDuration: 0.75,
    specialProps: { wingFlapSpeed: 16.0 },
  },
  zubat: {
    speciesId: 'zubat',
    idle: { frequency: 4.5, amplitude: 0.18 },
    walk: { frequency: 12.0, amplitude: 0.2 },
    run: { frequency: 18.0, amplitude: 0.25 },
    attackDuration: 0.4,
    hitDuration: 0.35,
    faintDuration: 0.7,
    specialProps: { wingFlapSpeed: 22.0 },
  },
  gastly: {
    speciesId: 'gastly',
    idle: { frequency: 2.5, amplitude: 0.15 },
    walk: { frequency: 4.5, amplitude: 0.2 },
    run: { frequency: 7.0, amplitude: 0.25 },
    attackDuration: 0.5,
    hitDuration: 0.4,
    faintDuration: 0.9,
    specialProps: { auraShimmer: true, eyeGlow: true },
  },
  onix: {
    speciesId: 'onix',
    idle: { frequency: 1.2, amplitude: 0.04 },
    walk: { frequency: 4.0, amplitude: 0.06 },
    run: { frequency: 6.0, amplitude: 0.1 },
    attackDuration: 0.7,
    hitDuration: 0.5,
    faintDuration: 1.1,
    specialProps: { segmentedBodyCurl: true },
  },
  magikarp: {
    speciesId: 'magikarp',
    idle: { frequency: 4.0, amplitude: 0.1 },
    walk: { frequency: 8.0, amplitude: 0.15 },
    run: { frequency: 12.0, amplitude: 0.25 },
    attackDuration: 0.4,
    hitDuration: 0.3,
    faintDuration: 0.7,
    specialProps: { waterBubble: true },
  },
  eevee: {
    speciesId: 'eevee',
    idle: { frequency: 2.4, amplitude: 0.04 },
    walk: { frequency: 7.5, amplitude: 0.12 },
    run: { frequency: 11.5, amplitude: 0.2 },
    attackDuration: 0.45,
    hitDuration: 0.4,
    faintDuration: 0.8,
    specialProps: { earTwitch: true, tailWag: true },
  },
};

/**
 * Returns the animation profile for a species or creates a standard baseline.
 */
export function getPokemonAnimationProfile(speciesId: string): PokemonAnimationProfile {
  if (POKEMON_ANIMATION_PROFILES[speciesId]) {
    return POKEMON_ANIMATION_PROFILES[speciesId];
  }

  return {
    speciesId,
    idle: { frequency: 2.0, amplitude: 0.04 },
    walk: { frequency: 7.0, amplitude: 0.1 },
    run: { frequency: 10.5, amplitude: 0.16 },
    attackDuration: 0.5,
    hitDuration: 0.4,
    faintDuration: 0.8,
    specialProps: {},
  };
}
