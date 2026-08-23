/**
 * Pokémon 3D RPG — Deterministic Battle Engine (Phase 3 Advanced)
 * 
 * Manages battle state transitions, turn ordering (Priority + Speed),
 * status conditions (Sleep, Freeze, Paralysis, Burn, Poison), abilities,
 * move effects (drain, recoil, secondary status), fainting, and battle logs.
 */

import { BattleState, BattleAction, TurnExecutionStep, BattleLogEntry, RuntimePokemon } from './types';
import { getPokemonById } from '../data/pokemon';
import { calculateDamage } from './DamageCalculator';
import { selectOpponentMoveIndex } from './BattleAI';
import { attemptCapture } from './CaptureSystem';
import { awardExperience } from '../systems/progression/ExperienceSystem';
import { StatusSystem } from './status/StatusSystem';
import { AbilitySystem } from './abilities/AbilitySystem';
import { BattleWeatherType } from './weather/BattleWeatherSystem';

export class BattleEngine {
  /**
   * Initializes a fresh battle state between a player Pokémon and a wild opponent.
   */
  public static createBattleState(
    playerPokemon: RuntimePokemon,
    opponentPokemon: RuntimePokemon,
    playerParty: RuntimePokemon[],
    weather: BattleWeatherType = 'CLEAR'
  ): BattleState {
    const opponentSpecies = getPokemonById(opponentPokemon.speciesId);
    const initialLog: BattleLogEntry = {
      id: `log-${Date.now()}-0`,
      text: `A wild ${opponentSpecies?.name || opponentPokemon.name} appeared!`,
      type: 'info',
    };

    return {
      id: `battle-${Date.now()}`,
      phase: 'PLAYER_ACTION_SELECT',
      turnNumber: 1,
      playerPokemon,
      opponentPokemon,
      playerParty,
      selectedPlayerAction: null,
      selectedOpponentAction: null,
      currentStepIndex: 0,
      turnSteps: [],
      logs: [initialLog],
      captureShakes: 0,
      isCaptureSuccess: false,
      earnedXp: 0,
      didLevelUp: false,
      evolutionPendingSpeciesId: null,
    };
  }

  /**
   * Resolves a turn when player has selected an action (MOVE, ITEM, RUN, SWITCH).
   */
  public static resolveTurn(
    state: BattleState,
    playerAction: BattleAction,
    weather: BattleWeatherType = 'CLEAR'
  ): BattleState {
    const nextState = { ...state };
    const playerSpecies = getPokemonById(nextState.playerPokemon.speciesId)!;
    const opponentSpecies = getPokemonById(nextState.opponentPokemon.speciesId)!;

    // 1. Determine Opponent Action via AI
    const oppMoveIdx = selectOpponentMoveIndex(
      nextState.opponentPokemon,
      opponentSpecies,
      nextState.playerPokemon,
      playerSpecies
    );

    const opponentAction: BattleAction = {
      type: 'MOVE',
      actor: 'opponent',
      moveIndex: oppMoveIdx,
    };

    nextState.selectedPlayerAction = playerAction;
    nextState.selectedOpponentAction = opponentAction;

    // 2. Handle immediate non-move actions (RUN, ITEM / Ball, SWITCH)
    if (playerAction.type === 'RUN') {
      const pSpeed = nextState.playerPokemon.calculatedStats.speed;
      const oSpeed = nextState.opponentPokemon.calculatedStats.speed;

      // Escape formula
      const escapeVal = Math.floor((pSpeed * 128) / Math.max(1, oSpeed)) + 30;
      const roll = Math.random() * 256;
      const escaped = escapeVal >= 256 || roll < escapeVal;

      if (escaped) {
        nextState.phase = 'ESCAPED';
        nextState.logs.push({
          id: `log-${Date.now()}-run`,
          text: `Got away safely!`,
          type: 'info',
        });
        return nextState;
      } else {
        nextState.logs.push({
          id: `log-${Date.now()}-norun`,
          text: `Can't escape!`,
          type: 'info',
        });
      }
    }

    if (playerAction.type === 'ITEM' && playerAction.itemId?.includes('ball')) {
      const captureResult = attemptCapture(nextState.opponentPokemon, opponentSpecies, playerAction.itemId);
      nextState.captureShakes = captureResult.shakes;
      nextState.isCaptureSuccess = captureResult.isSuccess;

      if (captureResult.isSuccess) {
        nextState.phase = 'CAPTURED';
        nextState.opponentPokemon.isWild = false;
        nextState.opponentPokemon.capturedAt = Date.now();
        nextState.logs.push({
          id: `log-${Date.now()}-catch`,
          text: `Gotcha! ${opponentSpecies.name} was caught!`,
          type: 'capture',
        });
        return nextState;
      } else {
        nextState.logs.push({
          id: `log-${Date.now()}-break`,
          text: `Oh no! The Pokémon broke free!`,
          type: 'info',
        });
      }
    }

    if (playerAction.type === 'SWITCH' && playerAction.switchIndex !== undefined) {
      const targetPkmn = nextState.playerParty[playerAction.switchIndex];
      if (targetPkmn && targetPkmn.currentHp > 0) {
        nextState.playerPokemon = targetPkmn;
        nextState.logs.push({
          id: `log-${Date.now()}-switch`,
          text: `Go! ${targetPkmn.name}!`,
          type: 'info',
        });
      }
    }

    // 3. Determine Execution Order for Moves
    const turnSteps: TurnExecutionStep[] = [];

    const playerMove = playerAction.type === 'MOVE' && playerAction.moveIndex !== undefined
      ? nextState.playerPokemon.moves[playerAction.moveIndex]?.move
      : null;

    const opponentMove = nextState.opponentPokemon.moves[oppMoveIdx]?.move;

    const pPriority = playerAction.type === 'MOVE' ? (playerMove?.priority || 0) : 6;
    const oPriority = opponentMove?.priority || 0;

    let playerGoesFirst = true;
    if (pPriority > oPriority) {
      playerGoesFirst = true;
    } else if (oPriority > pPriority) {
      playerGoesFirst = false;
    } else {
      // Speed tie-break with weather speed boosts (Swift Swim / Chlorophyll)
      const pSpeedBoost = AbilitySystem.getPassiveSpeedMultiplier(playerSpecies.abilities[0]?.id || '', weather);
      const oSpeedBoost = AbilitySystem.getPassiveSpeedMultiplier(opponentSpecies.abilities[0]?.id || '', weather);

      let pSpeed = nextState.playerPokemon.calculatedStats.speed * pSpeedBoost;
      let oSpeed = nextState.opponentPokemon.calculatedStats.speed * oSpeedBoost;

      // Paralysis speed reduction
      if (nextState.playerPokemon.status === 'PARALYSIS') pSpeed *= 0.5;
      if (nextState.opponentPokemon.status === 'PARALYSIS') oSpeed *= 0.5;

      playerGoesFirst = pSpeed >= oSpeed;
    }

    const firstActor = playerGoesFirst ? 'player' : 'opponent';
    const secondActor = playerGoesFirst ? 'opponent' : 'player';

    // Step A: First Attacker
    const step1 = BattleEngine.executeSingleAction(
      firstActor === 'player' ? playerAction : opponentAction,
      firstActor,
      nextState,
      weather
    );
    turnSteps.push(step1);

    // Step B: Second Attacker (only if target didn't faint)
    if (!step1.targetFainted && (secondActor === 'player' ? playerAction.type === 'MOVE' : true)) {
      const step2 = BattleEngine.executeSingleAction(
        secondActor === 'player' ? playerAction : opponentAction,
        secondActor,
        nextState,
        weather
      );
      turnSteps.push(step2);
    }

    // Step C: End-of-Turn Status Residual Damage (Burn, Poison)
    if (nextState.playerPokemon.currentHp > 0) {
      const pBurn = StatusSystem.processEndOfTurnDamage(nextState.playerPokemon);
      if (pBurn.message) {
        nextState.logs.push({ id: `log-${Date.now()}-peot`, text: pBurn.message, type: 'status' });
      }
    }
    if (nextState.opponentPokemon.currentHp > 0) {
      const oBurn = StatusSystem.processEndOfTurnDamage(nextState.opponentPokemon);
      if (oBurn.message) {
        nextState.logs.push({ id: `log-${Date.now()}-oeot`, text: oBurn.message, type: 'status' });
      }
    }

    nextState.turnSteps = turnSteps;
    nextState.turnNumber++;
    if (nextState.phase !== 'VICTORY' && nextState.phase !== 'DEFEAT' && nextState.phase !== 'CAPTURED' && nextState.phase !== 'ESCAPED') {
      nextState.phase = 'EXECUTE_TURN';
    }

    return nextState;
  }

  /**
   * Executes a single battle action (dealing damage, reducing HP, creating logs).
   */
  private static executeSingleAction(
    action: BattleAction,
    actor: 'player' | 'opponent',
    state: BattleState,
    weather: BattleWeatherType = 'CLEAR'
  ): TurnExecutionStep {
    const attacker = actor === 'player' ? state.playerPokemon : state.opponentPokemon;
    const defender = actor === 'player' ? state.opponentPokemon : state.playerPokemon;

    const attackerSpecies = getPokemonById(attacker.speciesId)!;
    const defenderSpecies = getPokemonById(defender.speciesId)!;

    const step: TurnExecutionStep = {
      actor,
      action,
      logMessages: [],
    };

    if (action.type !== 'MOVE' || action.moveIndex === undefined) {
      return step;
    }

    const runtimeMove = attacker.moves[action.moveIndex];
    if (!runtimeMove) return step;

    const attackerName = actor === 'player' ? attacker.name : `Wild ${attacker.name}`;

    // 1. Status Movement Check (Freeze / Sleep / Full Paralysis)
    const statusCheck = StatusSystem.checkCanMove(attacker);
    if (statusCheck.message) {
      step.logMessages.push(statusCheck.message);
    }
    if (!statusCheck.canMove) {
      return step;
    }

    // 2. Deduct PP
    runtimeMove.currentPp = Math.max(0, runtimeMove.currentPp - 1);
    step.moveName = runtimeMove.move.name;

    step.logMessages.push(`${attackerName} used ${runtimeMove.move.name}!`);

    // 3. Calculate Damage
    const result = calculateDamage({
      attacker,
      attackerSpecies,
      defender,
      defenderSpecies,
      move: runtimeMove.move,
      weather,
    });
    step.damageResult = result;

    if (result.isMiss) {
      step.logMessages.push(`${attackerName}'s attack missed!`);
      return step;
    }

    if (result.typeMultiplier === 0) {
      step.logMessages.push(`It doesn't affect ${defender.name}...`);
      return step;
    }

    // 4. Apply Damage
    defender.currentHp = Math.max(0, defender.currentHp - result.damage);

    if (result.isCritical) {
      step.logMessages.push(`A critical hit!`);
    }

    if (result.typeMultiplier >= 2.0) {
      step.logMessages.push(`It's super effective!`);
    } else if (result.typeMultiplier <= 0.5) {
      step.logMessages.push(`It's not very effective...`);
    }

    const defenderName = actor === 'player' ? `Wild ${defender.name}` : defender.name;
    step.logMessages.push(`${defenderName} took ${result.damage} damage!`);

    // 5. Drain Effect (e.g. Giga Drain 50%)
    if (runtimeMove.move.drainPercent && result.damage > 0) {
      const healAmount = Math.max(1, Math.floor((result.damage * runtimeMove.move.drainPercent) / 100));
      attacker.currentHp = Math.min(attacker.calculatedStats.hp, attacker.currentHp + healAmount);
      step.logMessages.push(`${attackerName} restored ${healAmount} HP!`);
    }

    // 6. Recoil Effect (e.g. Take Down 25%)
    if (runtimeMove.move.recoilPercent && result.damage > 0) {
      const recoilDamage = Math.max(1, Math.floor((result.damage * runtimeMove.move.recoilPercent) / 100));
      attacker.currentHp = Math.max(0, attacker.currentHp - recoilDamage);
      step.logMessages.push(`${attackerName} was damaged by recoil!`);
    }

    // 7. Secondary Status Application (e.g. Flamethrower 10% Burn, Thunder Shock 10% Paralysis)
    if (runtimeMove.move.statusEffect && defender.currentHp > 0) {
      const statusChance = runtimeMove.move.statusChance || 10;
      if (Math.random() * 100 < statusChance) {
        const applied = StatusSystem.applyStatus(defender, runtimeMove.move.statusEffect);
        if (applied.applied && applied.message) {
          step.logMessages.push(applied.message);
        }
      }
    }

    // 8. Contact Ability Check (e.g. Static)
    if (runtimeMove.move.category === 'Physical' && defender.currentHp > 0) {
      const defAbilityId = defenderSpecies.abilities[0]?.id || '';
      const contactResult = AbilitySystem.evaluateContactEffect(defAbilityId, attacker);
      if (contactResult.triggered && contactResult.message) {
        step.logMessages.push(contactResult.message);
      }
    }

    // 9. Check Fainting
    if (defender.currentHp === 0) {
      step.targetFainted = true;
      step.logMessages.push(`${defenderName} fainted!`);

      if (actor === 'player') {
        // Player defeated opponent -> Award XP
        state.phase = 'VICTORY';
        const expYield = Math.max(10, Math.floor(((defenderSpecies.baseExp || 64) * defender.level) / 7));
        state.earnedXp = expYield;

        const levelResult = awardExperience(attacker, expYield);
        step.logMessages.push(`${attacker.name} gained ${expYield} EXP. Points!`);

        if (levelResult.didLevelUp) {
          state.didLevelUp = true;
          step.logMessages.push(`${attacker.name} grew to Lv. ${levelResult.newLevel}!`);
          if (levelResult.evolutionCandidateId) {
            state.evolutionPendingSpeciesId = levelResult.evolutionCandidateId;
          }
        }
      } else {
        // Player Pokémon fainted
        state.phase = 'DEFEAT';
      }
    }

    return step;
  }
}
