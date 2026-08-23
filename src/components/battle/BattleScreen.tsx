/**
 * Pokémon 3D RPG — Turn-Based Battle Screen & Controller
 * 
 * Mobile-first battle interface with 3D combat arena, animated HP bars,
 * 4-move selection panel, Poké Ball bag modal, party switcher, and battle log.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Swords, Disc3, Shield, Footprints, ChevronLeft, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { BattleState, BattleAction, TurnExecutionStep, RuntimePokemon } from '../../battle/types';
import { BattleEngine } from '../../battle/BattleEngine';
import { BattleArena3D } from './BattleArena3D';
import { usePlayerPartyStore } from '../../state/usePlayerPartyStore';
import { useGameStore } from '../../state/useGameStore';
import { getPokemonById } from '../../data/pokemon';
import { POKEMON_TYPE_THEMES } from '../../data/pokemon/types';
import { POKE_BALL_DATABASE } from '../../battle/CaptureSystem';
import { evolvePokemon } from '../../systems/progression/EvolutionSystem';
import { ItemSystem } from '../../systems/items/ItemSystem';

interface BattleScreenProps {
  wildPokemonInstance: RuntimePokemon;
  onBattleEnd: (result: 'VICTORY' | 'DEFEAT' | 'CAPTURED' | 'ESCAPED') => void;
}

export const BattleScreen: React.FC<BattleScreenProps> = ({ wildPokemonInstance, onBattleEnd }) => {
  const party = usePlayerPartyStore((state) => state.party);
  const inventory = usePlayerPartyStore((state) => state.inventory);
  const updatePartyPokemon = usePlayerPartyStore((state) => state.updatePartyPokemon);
  const addCapturedPokemon = usePlayerPartyStore((state) => state.addCapturedPokemon);
  const consumeItem = usePlayerPartyStore((state) => state.consumeItem);
  const healParty = usePlayerPartyStore((state) => state.healParty);

  // Active player battler is the first conscious Pokémon in party
  const activeBattler = party.find((p) => p.currentHp > 0) || party[0];

  const [battleState, setBattleState] = useState<BattleState>(() =>
    BattleEngine.createBattleState(activeBattler, wildPokemonInstance, party)
  );

  const [uiView, setUiView] = useState<'ACTION_MENU' | 'MOVE_MENU' | 'BAG_MENU' | 'PARTY_MENU'>('ACTION_MENU');
  const [animatingActor, setAnimatingActor] = useState<'player' | 'opponent' | null>(null);
  const [animatingAction, setAnimatingAction] = useState<'attack' | 'hit' | 'faint' | null>(null);
  const [activeAttackType, setActiveAttackType] = useState<string | null>(null);
  const [currentMessage, setCurrentMessage] = useState<string>(`A wild ${wildPokemonInstance.name} appeared!`);
  const [isProcessingTurn, setIsProcessingTurn] = useState<boolean>(false);
  const [evolutionCandidate, setEvolutionCandidate] = useState<string | null>(null);

  // Current HP animations
  const playerHp = battleState.playerPokemon.currentHp;
  const playerMaxHp = battleState.playerPokemon.calculatedStats.hp;
  const playerHpPercent = Math.max(0, Math.min(100, (playerHp / playerMaxHp) * 100));

  const opponentHp = battleState.opponentPokemon.currentHp;
  const opponentMaxHp = battleState.opponentPokemon.calculatedStats.hp;
  const opponentHpPercent = Math.max(0, Math.min(100, (opponentHp / opponentMaxHp) * 100));

  // Dispatch action to BattleEngine and play animated step sequence
  const handlePlayerAction = async (action: BattleAction) => {
    if (isProcessingTurn) return;
    setIsProcessingTurn(true);
    setUiView('ACTION_MENU');

    // Run item consumption if using an item
    if (action.type === 'ITEM' && action.itemId) {
      if (!action.itemId.includes('ball')) {
        const itemRes = ItemSystem.useItemOnPokemon(action.itemId, battleState.playerPokemon);
        if (itemRes.success) {
          consumeItem(action.itemId);
          setCurrentMessage(itemRes.message);
          updatePartyPokemon(battleState.playerPokemon);
        } else {
          setCurrentMessage(itemRes.message);
          setIsProcessingTurn(false);
          return;
        }
      } else {
        consumeItem(action.itemId);
      }
    }

    const nextState = BattleEngine.resolveTurn(battleState, action);

    // If turn resulted in immediate escape or capture
    if (nextState.phase === 'ESCAPED') {
      setCurrentMessage('Got away safely!');
      setBattleState(nextState);
      setTimeout(() => onBattleEnd('ESCAPED'), 1200);
      return;
    }

    if (nextState.phase === 'CAPTURED') {
      setCurrentMessage(`Gotcha! ${nextState.opponentPokemon.name} was caught!`);
      setBattleState(nextState);
      addCapturedPokemon(nextState.opponentPokemon);
      setTimeout(() => onBattleEnd('CAPTURED'), 1800);
      return;
    }

    // Play sequential turn step animations
    for (const step of nextState.turnSteps) {
      // Announce move
      if (step.moveName) {
        const actorName = step.actor === 'player' ? nextState.playerPokemon.name : `Wild ${nextState.opponentPokemon.name}`;
        setCurrentMessage(`${actorName} used ${step.moveName}!`);
        setAnimatingActor(step.actor);
        setAnimatingAction('attack');
        await new Promise((r) => setTimeout(r, 600));

        // Determine move type for VFX
        const attackerPkmn = step.actor === 'player' ? nextState.playerPokemon : nextState.opponentPokemon;
        const currentMove = attackerPkmn.moves.find((m) => m.move.name === step.moveName);
        setActiveAttackType(currentMove?.move.type || 'Normal');

        // Damage strike & reaction
        if (step.damageResult && !step.damageResult.isMiss && step.damageResult.typeMultiplier > 0) {
          const target = step.actor === 'player' ? 'opponent' : 'player';
          setAnimatingActor(target);
          setAnimatingAction('hit');
          await new Promise((r) => setTimeout(r, 450));

          // Effectiveness message
          if (step.damageResult.typeMultiplier >= 2.0) {
            setCurrentMessage("It's super effective!");
            await new Promise((r) => setTimeout(r, 500));
          } else if (step.damageResult.typeMultiplier <= 0.5) {
            setCurrentMessage("It's not very effective...");
            await new Promise((r) => setTimeout(r, 500));
          }
        } else if (step.damageResult?.isMiss) {
          setCurrentMessage(`${actorName}'s attack missed!`);
          await new Promise((r) => setTimeout(r, 600));
        }

        setAnimatingActor(null);
        setAnimatingAction(null);
        setActiveAttackType(null);
      }

      // Check faint
      if (step.targetFainted) {
        const faintedActor = step.actor === 'player' ? 'opponent' : 'player';
        const faintedName = step.actor === 'player' ? `Wild ${nextState.opponentPokemon.name}` : nextState.playerPokemon.name;
        setCurrentMessage(`${faintedName} fainted!`);
        setAnimatingActor(faintedActor);
        setAnimatingAction('faint');
        await new Promise((r) => setTimeout(r, 800));
      }
    }

    // Update player party store with latest HP and EXP
    updatePartyPokemon(nextState.playerPokemon);
    setBattleState(nextState);

    // End-of-Battle outcomes
    if (nextState.phase === 'VICTORY') {
      setCurrentMessage(`Victory! ${nextState.playerPokemon.name} gained ${nextState.earnedXp} EXP!`);
      if (nextState.didLevelUp) {
        await new Promise((r) => setTimeout(r, 1000));
        setCurrentMessage(`${nextState.playerPokemon.name} grew to Level ${nextState.playerPokemon.level}!`);
      }
      if (nextState.evolutionPendingSpeciesId) {
        setEvolutionCandidate(nextState.evolutionPendingSpeciesId);
      }
      setIsProcessingTurn(false);
      return;
    }

    if (nextState.phase === 'DEFEAT') {
      setCurrentMessage(`Your Pokémon fainted! Returning to camp...`);
      healParty();
      setTimeout(() => onBattleEnd('DEFEAT'), 2000);
      setIsProcessingTurn(false);
      return;
    }

    setIsProcessingTurn(false);
    setCurrentMessage('What will you do?');
  };

  const executeEvolutionFlow = () => {
    if (!evolutionCandidate) return;
    const result = evolvePokemon(battleState.playerPokemon, evolutionCandidate);
    if (result) {
      updatePartyPokemon(result.evolvedPokemon);
      setCurrentMessage(`Congratulations! Your Pokémon evolved into ${result.newSpeciesName}!`);
    }
    setEvolutionCandidate(null);
  };

  const getHpColor = (percent: number) => {
    if (percent > 50) return 'bg-emerald-500 shadow-emerald-500/40';
    if (percent > 20) return 'bg-amber-500 shadow-amber-500/40';
    return 'bg-red-500 shadow-red-500/40';
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-slate-950 select-none overflow-hidden font-sans">
      {/* 3D Battle Arena Scene */}
      <BattleArena3D
        playerPokemon={battleState.playerPokemon}
        opponentPokemon={battleState.opponentPokemon}
        animatingActor={animatingActor}
        animatingAction={animatingAction}
        activeAttackType={activeAttackType}
      />

      {/* TOP HUD: Opponent Status Card */}
      <div className="relative z-10 p-4 max-w-sm w-full self-start">
        <div className="bg-slate-900/90 backdrop-blur-md border border-white/15 rounded-2xl p-3 shadow-2xl space-y-1.5 animate-in slide-in-from-top-2">
          <div className="flex justify-between items-center">
            <span className="font-extrabold text-sm text-white tracking-wide">{battleState.opponentPokemon.name}</span>
            <div className="flex items-center gap-1.5">
              {battleState.opponentPokemon.status && battleState.opponentPokemon.status !== 'NONE' && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {battleState.opponentPokemon.status.slice(0, 3)}
                </span>
              )}
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-white/10 text-slate-300 font-bold">
                Lv. {battleState.opponentPokemon.level}
              </span>
            </div>
          </div>

          {/* Opponent HP Bar */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
              <span>HP</span>
              <span className="font-mono text-slate-200">{opponentHp}/{opponentMaxHp}</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden border border-white/10 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-300 shadow-sm ${getHpColor(opponentHpPercent)}`}
                style={{ width: `${opponentHpPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM HUD: Player Status Card */}
      <div className="relative z-10 p-4 max-w-sm w-full self-end mb-2">
        <div className="bg-slate-900/90 backdrop-blur-md border border-white/15 rounded-2xl p-3 shadow-2xl space-y-1.5 animate-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center">
            <span className="font-extrabold text-sm text-white tracking-wide">{battleState.playerPokemon.name}</span>
            <div className="flex items-center gap-1.5">
              {battleState.playerPokemon.status && battleState.playerPokemon.status !== 'NONE' && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {battleState.playerPokemon.status.slice(0, 3)}
                </span>
              )}
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-white/10 text-emerald-400 font-bold">
                Lv. {battleState.playerPokemon.level}
              </span>
            </div>
          </div>

          {/* Player HP Bar */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
              <span>HP</span>
              <span className="font-mono text-slate-200">{playerHp}/{playerMaxHp}</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden border border-white/10 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-300 shadow-sm ${getHpColor(playerHpPercent)}`}
                style={{ width: `${playerHpPercent}%` }}
              />
            </div>
          </div>

          {/* Player EXP Bar */}
          <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-cyan-400"
              style={{ width: `${Math.min(100, Math.max(5, 100 - (battleState.playerPokemon.experienceToNextLevel / 50) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* BOTTOM CONTROLLER / INTERACTION PANEL */}
      <div className="relative z-20 w-full bg-slate-900/95 border-t border-white/15 p-4 flex flex-col gap-3 backdrop-blur-xl">
        {/* Battle Announcement Banner */}
        <div className="min-h-[44px] bg-slate-950/80 rounded-2xl px-4 py-2.5 border border-white/10 flex items-center justify-between text-left">
          <span className="text-sm font-semibold text-slate-100 tracking-wide">{currentMessage}</span>
          {isProcessingTurn && <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />}
        </div>

        {/* Victory End Screen / Evolution Banner */}
        {battleState.phase === 'VICTORY' && (
          <div className="flex gap-2">
            {evolutionCandidate ? (
              <button
                onClick={executeEvolutionFlow}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 text-slate-950 font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-95 transition"
              >
                <Sparkles className="w-5 h-5 animate-pulse" />
                EVOLVE NOW!
              </button>
            ) : (
              <button
                onClick={() => onBattleEnd('VICTORY')}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-95 transition"
              >
                <CheckCircle2 className="w-5 h-5" />
                RETURN TO OVERWORLD
              </button>
            )}
          </div>
        )}

        {/* Dynamic Action Sub-Menus */}
        {battleState.phase === 'PLAYER_ACTION_SELECT' && (
          <>
            {/* View A: Action Menu (FIGHT / BAG / POKÉMON / RUN) */}
            {uiView === 'ACTION_MENU' && (
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  disabled={isProcessingTurn}
                  onClick={() => setUiView('MOVE_MENU')}
                  className="py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-extrabold text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 active:scale-95 transition disabled:opacity-50"
                >
                  <Swords className="w-4 h-4" />
                  FIGHT
                </button>

                <button
                  disabled={isProcessingTurn}
                  onClick={() => setUiView('BAG_MENU')}
                  className="py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition disabled:opacity-50"
                >
                  <Disc3 className="w-4 h-4" />
                  BAG (BALLS)
                </button>

                <button
                  disabled={isProcessingTurn}
                  onClick={() => setUiView('PARTY_MENU')}
                  className="py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-95 transition disabled:opacity-50"
                >
                  <Shield className="w-4 h-4" />
                  POKÉMON
                </button>

                <button
                  disabled={isProcessingTurn}
                  onClick={() => handlePlayerAction({ type: 'RUN', actor: 'player' })}
                  className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-extrabold text-sm tracking-wider flex items-center justify-center gap-2 border border-white/10 active:scale-95 transition disabled:opacity-50"
                >
                  <Footprints className="w-4 h-4" />
                  RUN
                </button>
              </div>
            )}

            {/* View B: 4-Move Selection Panel */}
            {uiView === 'MOVE_MENU' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <button
                    onClick={() => setUiView('ACTION_MENU')}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white font-semibold"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Back
                  </button>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Select Attack</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {battleState.playerPokemon.moves.map((m, idx) => {
                    const typeTheme = POKEMON_TYPE_THEMES[m.move.type] || POKEMON_TYPE_THEMES.Normal;
                    const outOfPp = m.currentPp <= 0;

                    return (
                      <button
                        key={m.move.id}
                        disabled={outOfPp || isProcessingTurn}
                        onClick={() => handlePlayerAction({ type: 'MOVE', actor: 'player', moveIndex: idx })}
                        className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition active:scale-95 ${
                          outOfPp
                            ? 'bg-slate-900/50 border-white/5 opacity-40 cursor-not-allowed'
                            : 'bg-slate-800/90 hover:bg-slate-750 border-white/15 shadow-md'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-extrabold text-xs text-white leading-tight">{m.move.name}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-gradient-to-r ${typeTheme.badgeGradient} ${typeTheme.textColor}`}>
                            {m.move.type}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                          <span>PWR {m.move.power || '--'}</span>
                          <span className={outOfPp ? 'text-red-400 font-bold' : 'text-slate-300'}>
                            PP {m.currentPp}/{m.maxPp}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* View C: Bag (Poké Balls & Medicine) */}
            {uiView === 'BAG_MENU' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <button
                    onClick={() => setUiView('ACTION_MENU')}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white font-semibold"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Back
                  </button>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Trainer Bag</span>
                </div>

                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {inventory.filter((i) => i.count > 0).map((item) => (
                    <button
                      key={item.id}
                      disabled={item.count <= 0 || isProcessingTurn}
                      onClick={() => handlePlayerAction({ type: 'ITEM', actor: 'player', itemId: item.id })}
                      className={`p-2.5 rounded-2xl border text-center flex flex-col items-center justify-between transition active:scale-95 ${
                        item.count <= 0
                          ? 'bg-slate-900/50 border-white/5 opacity-40 cursor-not-allowed'
                          : item.id.includes('ball')
                          ? 'bg-slate-800/90 hover:bg-slate-700 border-amber-500/30 shadow-md'
                          : 'bg-slate-800/90 hover:bg-slate-700 border-emerald-500/30 shadow-md'
                      }`}
                    >
                      <Disc3 className={`w-6 h-6 mb-1 ${item.id.includes('ball') ? 'text-amber-400' : 'text-emerald-400'}`} />
                      <span className="font-bold text-xs text-white leading-tight mb-0.5">{item.name}</span>
                      <span className="text-[10px] font-mono text-cyan-300">x{item.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* View D: Party Switcher */}
            {uiView === 'PARTY_MENU' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <button
                    onClick={() => setUiView('ACTION_MENU')}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white font-semibold"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Back
                  </button>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Switch Pokémon</span>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {party.map((p, idx) => {
                    const isCurrent = p.instanceId === battleState.playerPokemon.instanceId;
                    const isFainted = p.currentHp <= 0;

                    return (
                      <button
                        key={p.instanceId}
                        disabled={isCurrent || isFainted || isProcessingTurn}
                        onClick={() => handlePlayerAction({ type: 'SWITCH', actor: 'player', switchIndex: idx })}
                        className={`p-2 rounded-xl border text-left flex items-center justify-between transition active:scale-95 ${
                          isCurrent
                            ? 'bg-cyan-950/60 border-cyan-500/40'
                            : isFainted
                            ? 'bg-slate-900/50 border-white/5 opacity-40 cursor-not-allowed'
                            : 'bg-slate-800 hover:bg-slate-700 border-white/10'
                        }`}
                      >
                        <div>
                          <span className="font-bold text-xs text-white block">{p.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Lv. {p.level}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-emerald-400 block">{p.currentHp}/{p.calculatedStats.hp}</span>
                          {isCurrent && <span className="text-[9px] text-cyan-300 font-bold uppercase">Active</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
