import { ActivePokemon, PokemonSpeciesData } from './pokemon';

export type GameScreenState = 'LOADING' | 'MENU' | 'PLAYING' | 'BATTLE';

export interface EncounterData {
  pokemon: ActivePokemon;
  pokemonSpecies: PokemonSpeciesData;
}

export interface DebugConfig {
  showFps: boolean;
  showCoordinates: boolean;
  showJoystick: boolean;
  freeCam: boolean;
  showColliders: boolean;
}
