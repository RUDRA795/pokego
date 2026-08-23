/**
 * Pokémon Game Engine — Official Pokémon Imagery, 3D Models & Animation Accessors
 * 
 * Sourced directly from local high-resolution assets covering all 1,025 canonical Pokémon:
 * - Authentic 3D Animated Battle Model Animations (GIF)
 * - Shiny 3D Animated Battle Model Animations (GIF)
 * - High-Resolution Pokémon HOME 3D Models / Renders (PNG)
 * - High-Resolution Official Artwork (475x475 PNG)
 * - Pokédex Standard Pixel Icons (PNG)
 */

import { getPokemonById } from './index';

export function getPokemonAnimated(speciesIdOrDex: string | number): string {
  if (typeof speciesIdOrDex === 'number') {
    return `/assets/pokemon/animated/${speciesIdOrDex}.gif`;
  }
  const species = getPokemonById(speciesIdOrDex);
  const dex = species?.nationalDexNumber || 25;
  return `/assets/pokemon/animated/${dex}.gif`;
}

export function getPokemonAnimatedShiny(speciesIdOrDex: string | number): string {
  if (typeof speciesIdOrDex === 'number') {
    return `/assets/pokemon/animated_shiny/${speciesIdOrDex}.gif`;
  }
  const species = getPokemonById(speciesIdOrDex);
  const dex = species?.nationalDexNumber || 25;
  return `/assets/pokemon/animated_shiny/${dex}.gif`;
}

export function getPokemonArtwork(speciesIdOrDex: string | number): string {
  if (typeof speciesIdOrDex === 'number') {
    return `/assets/pokemon/artwork/${speciesIdOrDex}.png`;
  }
  const species = getPokemonById(speciesIdOrDex);
  const dex = species?.nationalDexNumber || 25;
  return `/assets/pokemon/artwork/${dex}.png`;
}

export function getPokemonHome3D(speciesIdOrDex: string | number): string {
  if (typeof speciesIdOrDex === 'number') {
    return `/assets/pokemon/home/${speciesIdOrDex}.png`;
  }
  const species = getPokemonById(speciesIdOrDex);
  const dex = species?.nationalDexNumber || 25;
  return `/assets/pokemon/home/${dex}.png`;
}

export function getPokemonIcon(speciesIdOrDex: string | number): string {
  if (typeof speciesIdOrDex === 'number') {
    return `/assets/pokemon/icons/${speciesIdOrDex}.png`;
  }
  const species = getPokemonById(speciesIdOrDex);
  const dex = species?.nationalDexNumber || 25;
  return `/assets/pokemon/icons/${dex}.png`;
}
