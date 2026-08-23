/**
 * Pokémon 3D RPG — Canonical Species Scale & Dimension Engine
 * 
 * Maps canonical Pokédex metric dimensions (height in meters, weight in kg)
 * to physical in-world 3D scale ratios so that a tiny Caterpie (0.3m) actually feels tiny,
 * a Pikachu (0.4m) reaches the player's knee, a Bulbasaur (0.7m) reaches the waist,
 * and a massive Onix (8.8m) commands the entire screen.
 */

import { getPokemonById } from '../../data/pokemon';

export interface SpeciesScaleData {
  speciesId: string;
  heightMeters: number;
  weightKg: number;
  inWorldScale: number;
  colliderRadius: number;
  cameraFramingDistance: number;
  shadowRadius: number;
}

export class SpeciesScaleSystem {
  // Baseline: 1.0 in-world unit = 1.0 meter
  public static getScaleData(speciesId: string): SpeciesScaleData {
    const species = getPokemonById(speciesId);
    const height = species?.heightMeters || 1.0;
    const weight = species?.weightKg || 10.0;

    // In-world scale: calibrated to canonical metric proportions
    let inWorldScale = height;
    if (speciesId === 'onix') inWorldScale = 4.8; // Calibrated for gameplay arena while remaining massive

    const colliderRadius = Math.max(0.3, inWorldScale * 0.45);
    const cameraFramingDistance = Math.max(4.5, 3.2 + inWorldScale * 1.2);
    const shadowRadius = Math.max(0.25, inWorldScale * 0.4);

    return {
      speciesId,
      heightMeters: height,
      weightKg: weight,
      inWorldScale,
      colliderRadius,
      cameraFramingDistance,
      shadowRadius,
    };
  }
}
