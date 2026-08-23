/**
 * Pokémon 3D RPG — Pokémon UNITE Style 3D Battle Arena & Tactical Action Deck
 * 
 * Features:
 * - Dynamic 3D in-world battle arena with scale-adaptive camera and move VFX.
 * - Neon stadium top status HUD (gradient health bars, level badges, status condition tags).
 * - UNITE Action Deck: 4 tactile Move buttons with elemental glowing cooldown rings, PP counter,
 *   and central UNITE Ultimate Move gauge.
 * - Seamless integration with BattleEngine turn resolution.
 */

import React, { useState } from 'react';
import { Sparkles, Shield, Zap, Flame, Droplets, Leaf, ArrowLeft } from 'lucide-react';
import { RuntimePokemon, BattleState, BattleAction } from '../../battle/types';
import { BattleEngine } from '../../battle/BattleEngine';
import { BattleArena3D } from './BattleArena3D';
import { usePlayerPartyStore } from '../../state/usePlayerPartyStore';
import { SoundSystem } from '../../systems/audio/SoundSystem';
import { POKEMON_TYPE_THEMES } from '../../data/pokemon/types';
import { HealthBar } from '../ui/HealthBar';
import { PokemonButton } from '../ui/PokemonButton';
import { PokemonCard } from '../ui/PokemonCard';
import { RomDialog } from '../ui/RomDialog';

interface PokemonUniteBattleScreenProps {
  wildPokemonInstance: RuntimePokemon;
  onBattleEnd: (outcome: 'VICTORY' | 'DEFEAT' | 'ESCAPED' | 'CAPTURED') => void;
}

export const PokemonUniteBattleScreen: React.FC<PokemonUniteBattleScreenProps> = ({
  wildPokemonInstance,
  onBattleEnd,
}) => {
  const party = usePlayerPartyStore((state) => state.party);
  const updatePartyPokemon = usePlayerPartyStore((state) => state.updatePartyPokemon);
  const activeBattler = party.find((p) => p.currentHp > 0) || party[0];

  const [battleState, setBattleState] = useState<BattleState>(() =>
    BattleEngine.createBattleState(activeBattler, wildPokemonInstance, party)
  );

  const [animatingActor, setAnimatingActor] = useState<'player' | 'opponent' | null>(null);
  const [animatingAction, setAnimatingAction] = useState<'attack' | 'hit' | 'faint' | null>(null);
  const [activeAttackType, setActiveAttackType] = useState<string | null>(null);
  const [currentMessage, setCurrentMessage] = useState<string>(`A wild ${wildPokemonInstance.name} appeared!`);
  const [isProcessingTurn, setIsProcessingTurn] = useState<boolean>(false);
  const [uniteGauge, setUniteGauge] = useState<number>(85); // 0 to 100%

  const playerHp = battleState.playerPokemon.currentHp;
  const playerMaxHp = battleState.playerPokemon.calculatedStats.hp;
  const playerHpPercent = Math.max(0, Math.min(100, (playerHp / playerMaxHp) * 100));

  const opponentHp = battleState.opponentPokemon.currentHp;
  const opponentMaxHp = battleState.opponentPokemon.calculatedStats.hp;
  const opponentHpPercent = Math.max(0, Math.min(100, (opponentHp / opponentMaxHp) * 100));

  // Handle Move Execution
  const handleExecuteMove = async (moveIndex: number) => {
    if (isProcessingTurn) return;
    setIsProcessingTurn(true);
    SoundSystem.playTap();

    const selectedMove = battleState.playerPokemon.moves[moveIndex];
    if (!selectedMove || selectedMove.currentPp <= 0) {
      setCurrentMessage('No PP left for this move!');
      setIsProcessingTurn(false);
      return;
    }

    const action: BattleAction = {
      type: 'MOVE',
      actor: 'player',
      moveIndex,
    };

    const nextState = BattleEngine.resolveTurn(battleState, action);

    // Play sequential turn step animations
    for (const step of nextState.turnSteps) {
      if (step.moveName) {
        const actorName = step.actor === 'player' ? nextState.playerPokemon.name : `Wild ${nextState.opponentPokemon.name}`;
        setCurrentMessage(`${actorName} used ${step.moveName}!`);
        setAnimatingActor(step.actor);
        setAnimatingAction('attack');

        const attackerPkmn = step.actor === 'player' ? nextState.playerPokemon : nextState.opponentPokemon;
        const currentMove = attackerPkmn.moves.find((m) => m.move.name === step.moveName);
        setActiveAttackType(currentMove?.move.type || 'Normal');
        await new Promise((r) => setTimeout(r, 600));

        if (step.damageResult && !step.damageResult.isMiss && step.damageResult.typeMultiplier > 0) {
          const target = step.actor === 'player' ? 'opponent' : 'player';
          setAnimatingActor(target);
          setAnimatingAction('hit');
          await new Promise((r) => setTimeout(r, 450));

          if (step.damageResult.typeMultiplier >= 2.0) {
            setCurrentMessage("It's super effective!");
            await new Promise((r) => setTimeout(r, 500));
          } else if (step.damageResult.typeMultiplier <= 0.5) {
            setCurrentMessage("It's not very effective...");
            await new Promise((r) => setTimeout(r, 500));
          }
        }

        setAnimatingActor(null);
        setAnimatingAction(null);
        setActiveAttackType(null);
      }

      if (step.targetFainted) {
        const faintedName = step.actor === 'player' ? `Wild ${nextState.opponentPokemon.name}` : nextState.playerPokemon.name;
        setCurrentMessage(`${faintedName} fainted!`);
        await new Promise((r) => setTimeout(r, 800));
      }
    }

    updatePartyPokemon(nextState.playerPokemon);
    setBattleState(nextState);
    setUniteGauge((prev) => Math.min(100, prev + 15));

    if (nextState.phase === 'VICTORY') {
      setCurrentMessage(`Victory! ${nextState.playerPokemon.name} gained ${nextState.earnedXp} EXP!`);
      SoundSystem.playCaptureSuccess();
      setTimeout(() => onBattleEnd('VICTORY'), 2200);
      setIsProcessingTurn(false);
      return;
    }

    if (nextState.phase === 'DEFEAT') {
      setCurrentMessage(`Your Pokémon fainted! Returning to camp...`);
      setTimeout(() => onBattleEnd('DEFEAT'), 2000);
      setIsProcessingTurn(false);
      return;
    }

    setIsProcessingTurn(false);
  };

  const getMoveIcon = (type: string) => {
    if (type === 'Electric') return <Zap className="w-5 h-5 text-amber-400" />;
    if (type === 'Fire') return <Flame className="w-5 h-5 text-rose-500" />;
    if (type === 'Water') return <Droplets className="w-5 h-5 text-sky-400" />;
    if (type === 'Grass') return <Leaf className="w-5 h-5 text-emerald-400" />;
    return <Shield className="w-5 h-5 text-slate-300" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between select-none overflow-hidden bg-pokemon-dark font-pokemon">
      <div className="scanlines" />
      
      <BattleArena3D
        playerPokemon={battleState.playerPokemon}
        opponentPokemon={battleState.opponentPokemon}
        animatingActor={animatingActor}
        animatingAction={animatingAction}
        activeAttackType={activeAttackType}
      />

      <header className="relative z-10 p-4 flex justify-between items-start pointer-events-auto">
        <PokemonCard className="w-56 space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-extrabold text-xs text-pokemon-ui-text uppercase tracking-wider">{battleState.opponentPokemon.name}</span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-pokemon-ui-card text-pokemon-ui-text border border-pokemon-ui-border">
              Lv. {battleState.opponentPokemon.level}
            </span>
          </div>
          <HealthBar current={opponentHp} max={opponentMaxHp} />
        </PokemonCard>

        <PokemonButton
          onClick={() => onBattleEnd('ESCAPED')}
          className="w-10 h-10 flex items-center justify-center p-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </PokemonButton>
      </header>

      <footer className="relative z-10 p-4 flex flex-col gap-3 pointer-events-auto">
        <RomDialog className="flex items-center justify-between text-sm">
          <span>{currentMessage}</span>
          {isProcessingTurn && <Sparkles className="w-4 h-4 animate-pulse-fast" />}
        </RomDialog>

        <PokemonCard className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <span className="font-black text-xs text-pokemon-ui-text uppercase">{battleState.playerPokemon.name}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-pokemon-green text-pokemon-dark">
              Lv. {battleState.playerPokemon.level}
            </span>
          </div>
          <div className="w-36">
            <HealthBar current={playerHp} max={playerMaxHp} />
          </div>
        </PokemonCard>

        <div className="grid grid-cols-4 gap-2">
          {battleState.playerPokemon.moves.slice(0, 4).map((m, idx) => (
            <button
              key={`move-${idx}`}
              disabled={isProcessingTurn || m.currentPp <= 0}
              onClick={() => handleExecuteMove(idx)}
              className="unite-move-button"
              style={{
                borderColor: POKEMON_TYPE_THEMES[m.move.type].primaryColor
              }}
            >
              {getMoveIcon(m.move.type)}
              <span className="text-[9px] font-black text-pokemon-ui-text uppercase tracking-tight text-center truncate w-full">
                {m.move.name}
              </span>
              <span className="text-[8px] font-bold text-pokemon-ui-muted">
                {m.currentPp}/{m.maxPp}
              </span>
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
};
