/**
 * Pokémon 3D RPG — Wild Opponent Battle AI
 * 
 * Selects intelligent and believable moves based on:
 * - Legal moves with PP > 0
 * - Type effectiveness advantages (prefers super-effective moves, avoids immunities)
 * - Move power and natural variety
 */

import { RuntimePokemon } from './types';
import { PokemonSpeciesData } from '../types/pokemon';
import { getTypeEffectiveness } from '../data/pokemon/types';

export function selectOpponentMoveIndex(
  opponent: RuntimePokemon,
  opponentSpecies: PokemonSpeciesData,
  playerPokemon: RuntimePokemon,
  playerSpecies: PokemonSpeciesData
): number {
  const usableMoves = opponent.moves
    .map((rm, idx) => ({ rm, idx }))
    .filter(({ rm }) => rm.currentPp > 0);

  if (usableMoves.length === 0) return 0; // Fallback

  // Score each usable move
  const scoredMoves = usableMoves.map(({ rm, idx }) => {
    const move = rm.move;
    let score = move.power || 20;

    const eff = getTypeEffectiveness(
      move.type,
      playerSpecies.primaryType,
      playerSpecies.secondaryType
    );

    if (eff === 0) {
      score = 0; // Avoid immune moves
    } else if (eff >= 2.0) {
      score *= 2.5; // Prioritize super-effective moves
    } else if (eff <= 0.5) {
      score *= 0.5; // Deprioritize resisted moves
    }

    // Add variety jitter (1.0 to 1.3)
    score *= (1.0 + Math.random() * 0.3);

    return { idx, score };
  });

  // Pick highest scoring move
  scoredMoves.sort((a, b) => b.score - a.score);
  return scoredMoves[0].idx;
}
