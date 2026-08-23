/**
 * Pokémon 3D RPG — Canonical Damage Calculation Engine (Gen 6-9 Ruleset)
 * 
 * Implements the core Pokémon damage formula with full integration of:
 * - Physical / Special Category Split
 * - Same-Type Attack Bonus (STAB = 1.5x)
 * - 18x18 Canonical Type Effectiveness (0x, 0.25x, 0.5x, 1x, 2x, 4x)
 * - Critical Hit Multiplier (1.5x)
 * - Random Damage Factor (0.85 to 1.00)
 * - Ability Interactions (Overgrow, Blaze, Torrent, Levitate, Flash Fire, Water/Volt Absorb, Thick Fat)
 * - Weather Multipliers (Sun, Rain)
 * - Burn Physical Attack Penalty (0.5x)
 * - Secondary Status Effects Rollout
 */

import { PokemonMove, PokemonSpeciesData } from '../types/pokemon';
import { RuntimePokemon, DamageCalculationResult } from './types';
import { getTypeEffectiveness, getSTABMultiplier } from '../data/pokemon/types';
import { AbilitySystem } from './abilities/AbilitySystem';
import { BattleWeatherSystem, BattleWeatherType } from './weather/BattleWeatherSystem';

export interface DamageCalculationParams {
  attacker: RuntimePokemon;
  attackerSpecies: PokemonSpeciesData;
  defender: RuntimePokemon;
  defenderSpecies: PokemonSpeciesData;
  move: PokemonMove;
  weather?: BattleWeatherType;
  randomFactorOverride?: number; // For deterministic unit testing
  forceCritical?: boolean;
}

/**
 * Executes full damage evaluation pipeline for a move.
 */
export function calculateDamage(params: DamageCalculationParams): DamageCalculationResult {
  const {
    attacker,
    attackerSpecies,
    defender,
    defenderSpecies,
    move,
    weather = 'CLEAR',
    randomFactorOverride,
    forceCritical,
  } = params;

  // 1. Status Moves deal 0 direct damage
  if (move.category === 'Status' || move.power === 0) {
    return {
      damage: 0,
      isCritical: false,
      typeMultiplier: 1.0,
      isSTAB: false,
      isMiss: false,
    };
  }

  // 2. Accuracy Check
  let effectiveAccuracy = move.accuracy || 100;
  // Rain makes Thunder 100% accurate
  if (weather === 'RAIN' && move.id === 'thunder') {
    effectiveAccuracy = 100;
  }

  if (effectiveAccuracy < 100) {
    const roll = Math.random() * 100;
    if (roll > effectiveAccuracy) {
      return {
        damage: 0,
        isCritical: false,
        typeMultiplier: 1.0,
        isSTAB: false,
        isMiss: true,
      };
    }
  }

  // 3. Ability Defensive Immunities (e.g. Levitate against Ground, Flash Fire against Fire)
  const defenderAbility = defenderSpecies.abilities[0]?.id || '';
  const defAbilityResult = AbilitySystem.evaluateDefendDamage(defenderAbility, {
    pokemon: defender,
    opponent: attacker,
    moveType: move.type,
    moveCategory: move.category,
    weather,
  });

  if (defAbilityResult.isImmune) {
    return {
      damage: 0,
      isCritical: false,
      typeMultiplier: 0,
      isSTAB: false,
      isMiss: false,
    };
  }

  // 4. Canonical Type Effectiveness Check
  const typeMultiplier = getTypeEffectiveness(
    move.type,
    defenderSpecies.primaryType,
    defenderSpecies.secondaryType
  );

  if (typeMultiplier === 0) {
    return {
      damage: 0,
      isCritical: false,
      typeMultiplier: 0,
      isSTAB: false,
      isMiss: false,
    };
  }

  // 5. Determine Attacking & Defending Stats
  let a = attacker.calculatedStats.attack;
  let d = defender.calculatedStats.defense;

  if (move.category === 'Special') {
    a = attacker.calculatedStats.specialAttack;
    d = defender.calculatedStats.specialDefense;
  }

  // Burn halves physical Attack stat
  if (attacker.status === 'BURN' && move.category === 'Physical') {
    a = Math.max(1, Math.floor(a * 0.5));
  }

  // Sandstorm boosts Rock-type Sp. Def by 1.5x
  if (weather === 'SANDSTORM' && (defenderSpecies.primaryType === 'Rock' || defenderSpecies.secondaryType === 'Rock') && move.category === 'Special') {
    d = Math.floor(d * 1.5);
  }

  // Prevent division by zero
  d = Math.max(1, d);

  // 6. Base Damage Formula
  const levelFactor = Math.floor((2 * attacker.level) / 5) + 2;
  const baseDamage = Math.floor((levelFactor * move.power * (a / d)) / 50) + 2;

  // 7. Critical Hit Check (Base 1/16 ~ 6.25% chance, high-crit moves 1/8)
  const critThreshold = move.criticalHitRatio && move.criticalHitRatio > 1 ? 0.125 : 0.0625;
  const isCritical = forceCritical ?? (Math.random() < critThreshold);
  const critMultiplier = isCritical ? 1.5 : 1.0;

  // 8. Same-Type Attack Bonus (STAB = 1.5x)
  const stabMultiplier = getSTABMultiplier(
    move.type,
    attackerSpecies.primaryType,
    attackerSpecies.secondaryType
  );
  const isSTAB = stabMultiplier > 1.0;

  // 9. Attacker Ability Boosts (Overgrow, Blaze, Torrent)
  const attackerAbility = attackerSpecies.abilities[0]?.id || '';
  const atkAbilityResult = AbilitySystem.evaluateAttackDamage(attackerAbility, {
    pokemon: attacker,
    opponent: defender,
    moveType: move.type,
    moveCategory: move.category,
    weather,
  });
  const abilityMultiplier = (atkAbilityResult.damageMultiplier || 1.0) * (defAbilityResult.damageMultiplier || 1.0);

  // 10. Weather Multiplier (Sun boosts Fire / weakens Water; Rain boosts Water / weakens Fire)
  const weatherMultiplier = BattleWeatherSystem.getWeatherDamageMultiplier(weather, move.type);

  // 11. Random Damage Factor (0.85 to 1.00)
  const randomFactor = randomFactorOverride ?? (0.85 + Math.random() * 0.15);

  // 12. Final Damage Multipliers
  let finalDamage = baseDamage * critMultiplier * stabMultiplier * typeMultiplier * abilityMultiplier * weatherMultiplier * randomFactor;
  finalDamage = Math.floor(finalDamage);

  // Damage floor: Any effective hit deals at least 1 damage
  finalDamage = Math.max(1, finalDamage);

  return {
    damage: finalDamage,
    isCritical,
    typeMultiplier,
    isSTAB,
    isMiss: false,
  };
}
