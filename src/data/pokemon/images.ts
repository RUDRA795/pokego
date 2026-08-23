/**
 * Pokémon Game Engine — Official Pokémon Imagery & 3D Render Accessor
 * 
 * Provides typed, local-first asset URLs with online CDN fallbacks:
 * - High-Resolution Official Artwork (475x475 PNG)
 * - High-Resolution Pokémon HOME 3D Models / Renders (PNG)
 * - Pokémon Showdown 3D Animated Sprites (GIF)
 * - Standard Pokédex Pixel Icons (PNG)
 */

import { getPokemonById } from './index';

export function getPokemonArtwork(speciesIdOrDex: string | number): string {
  if (typeof speciesIdOrDex === 'number') {
    return `/assets/pokemon/artwork/${speciesIdOrDex}.png`;
  }
  const species = getPokemonById(speciesIdOrDex);
  const dex = species?.nationalDexNumber || 25;
  return `/assets/pokemon/artwork/${speciesIdOrDex}.png`;
}

export function getPokemonHome3D(speciesIdOrDex: string | number): string {
  if (typeof speciesIdOrDex === 'number') {
    return `/assets/pokemon/home/${speciesIdOrDex}.png`;
  }
  return `/assets/pokemon/home/${speciesIdOrDex}.png`;
}

export function getPokemonShowdown(speciesIdOrDex: string | number): string {
  return `/assets/pokemon/showdown/${speciesIdOrDex}.gif`;
}

export function getPokemonIcon(speciesIdOrDex: string | number): string {
  return `/assets/pokemon/icons/${speciesIdOrDex}.png`;
}

/**
 * Returns online high-res CDN URL if local asset is not available
 */
export function getPokemonOnlineArtwork(dexNumber: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${dexNumber}.png`;
}

export function getPokemonOnlineHome3D(dexNumber: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${dexNumber}.png`;
}
