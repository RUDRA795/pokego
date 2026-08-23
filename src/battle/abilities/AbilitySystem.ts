/**
 * Pokémon 3D RPG — Canonical Ability System & Event Resolver
 * 
 * Implements passive and trigger-based ability mechanics:
 * Starter pinch abilities (Overgrow, Blaze, Torrent), Absorption (Water Absorb, Volt Absorb, Flash Fire),
 * Contact effects (Static), Entry effects (Intimidate), Weather speed (Swift Swim, Chlorophyll),
 * and Defense (Levitate, Thick Fat, Sturdy).
 */

import { AbilityContext, AbilityEffectResult } from './AbilityTypes';
import { getPokemonById } from '../../data/pokemon';

export class AbilitySystem {
  /**
   * Evaluates ability effects during attacking damage calculation.
   */
  public static evaluateAttackDamage(
    attackerAbilityId: string,
    context: AbilityContext
  ): AbilityEffectResult {
    const hpRatio = context.pokemon.currentHp / context.pokemon.calculatedStats.hp;

    // 1. Overgrow (Grass moves x1.5 when HP <= 1/3)
    if (attackerAbilityId === 'overgrow' && context.moveType === 'Grass' && hpRatio <= 0.33) {
      return { triggered: true, damageMultiplier: 1.5, message: `${context.pokemon.name}'s Overgrow powered up Grass moves!` };
    }

    // 2. Blaze (Fire moves x1.5 when HP <= 1/3)
    if (attackerAbilityId === 'blaze' && context.moveType === 'Fire' && hpRatio <= 0.33) {
      return { triggered: true, damageMultiplier: 1.5, message: `${context.pokemon.name}'s Blaze powered up Fire moves!` };
    }

    // 3. Torrent (Water moves x1.5 when HP <= 1/3)
    if (attackerAbilityId === 'torrent' && context.moveType === 'Water' && hpRatio <= 0.33) {
      return { triggered: true, damageMultiplier: 1.5, message: `${context.pokemon.name}'s Torrent powered up Water moves!` };
    }

    // 4. Adaptability (Increases STAB multiplier)
    if (attackerAbilityId === 'adaptability') {
      return { triggered: true, damageMultiplier: 1.33 };
    }

    return { triggered: false, damageMultiplier: 1.0 };
  }

  /**
   * Evaluates ability defensive immunities and damage reductions.
   */
  public static evaluateDefendDamage(
    defenderAbilityId: string,
    context: AbilityContext
  ): AbilityEffectResult {
    // 1. Levitate (Ground immunity)
    if (defenderAbilityId === 'levitate' && context.moveType === 'Ground') {
      return {
        triggered: true,
        isImmune: true,
        damageMultiplier: 0,
        message: `${context.pokemon.name} levitates on air currents and avoided the Ground attack!`,
      };
    }

    // 2. Flash Fire (Fire immunity)
    if (defenderAbilityId === 'flash_fire' && context.moveType === 'Fire') {
      return {
        triggered: true,
        isImmune: true,
        damageMultiplier: 0,
        message: `${context.pokemon.name}'s Flash Fire absorbed the flames!`,
      };
    }

    // 3. Water Absorb (Water immunity + heal)
    if (defenderAbilityId === 'water_absorb' && context.moveType === 'Water') {
      const healAmount = Math.floor(context.pokemon.calculatedStats.hp * 0.25);
      context.pokemon.currentHp = Math.min(context.pokemon.calculatedStats.hp, context.pokemon.currentHp + healAmount);
      return {
        triggered: true,
        isImmune: true,
        damageMultiplier: 0,
        hpRestored: healAmount,
        message: `${context.pokemon.name}'s Water Absorb restored its HP!`,
      };
    }

    // 4. Volt Absorb (Electric immunity + heal)
    if (defenderAbilityId === 'volt_absorb' && context.moveType === 'Electric') {
      const healAmount = Math.floor(context.pokemon.calculatedStats.hp * 0.25);
      context.pokemon.currentHp = Math.min(context.pokemon.calculatedStats.hp, context.pokemon.currentHp + healAmount);
      return {
        triggered: true,
        isImmune: true,
        damageMultiplier: 0,
        hpRestored: healAmount,
        message: `${context.pokemon.name}'s Volt Absorb restored its HP!`,
      };
    }

    // 5. Thick Fat (Halves Fire and Ice damage)
    if (defenderAbilityId === 'thick_fat' && (context.moveType === 'Fire' || context.moveType === 'Ice')) {
      return {
        triggered: true,
        damageMultiplier: 0.5,
        message: `${context.pokemon.name}'s Thick Fat dampened the attack!`,
      };
    }

    return { triggered: false, damageMultiplier: 1.0 };
  }

  /**
   * Evaluates on-contact counter effects (e.g. Static).
   */
  public static evaluateContactEffect(
    defenderAbilityId: string,
    attacker: AbilityContext['pokemon']
  ): AbilityEffectResult {
    if (defenderAbilityId === 'static' && Math.random() < 0.30) {
      if (attacker.status === 'NONE') {
        attacker.status = 'PARALYSIS';
        return {
          triggered: true,
          statusApplied: 'PARALYSIS',
          message: `${attacker.name} was paralyzed by Static!`,
        };
      }
    }

    return { triggered: false };
  }

  /**
   * Evaluates speed multiplier under active weather conditions (Swift Swim, Chlorophyll).
   */
  public static getPassiveSpeedMultiplier(
    abilityId: string,
    weather: string
  ): number {
    if (abilityId === 'swift_swim' && weather === 'RAIN') return 2.0;
    if (abilityId === 'chlorophyll' && weather === 'SUNNY') return 2.0;
    return 1.0;
  }
}
