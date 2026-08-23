/**
 * Pokémon 3D RPG — Pokémon UNITE 3D Action Battle Stadium
 */

import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../../state/useGameStore';
import { usePlayerPartyStore } from '../../state/usePlayerPartyStore';
import { getPokemonAnimated, getPokemonArtwork } from '../../data/pokemon/images';
import { getPokemonById } from '../../data/pokemon';
import { POKEMON_TYPE_THEMES, getTypeEffectiveness } from '../../data/pokemon/types';
import { POKEMON_SPECIES_DATABASE, POKEMON_SPECIES_LIST } from '../../data/pokemon/species';
import { createRuntimePokemon } from '../../battle/RuntimePokemon';
import { RuntimePokemon } from '../../battle/types';
import {
  Swords,
  Zap,
  Flame,
  Shield,
  ArrowLeft,
  Sparkles,
  Trophy
} from 'lucide-react';

interface DamagePopup {
  id: number;
  text: string;
  isCrit: boolean;
  color: string;
  x: number;
  y: number;
}

function playBattleSound(type: 'hit' | 'move1' | 'unite' | 'victory') {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioCtx.currentTime;

    if (type === 'hit') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.12);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'move1') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.22);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'unite') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.linearRampToValueAtTime(1200, now + 0.4);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'victory') {
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, idx) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g);
        g.connect(audioCtx.destination);
        o.type = 'sine';
        o.frequency.setValueAtTime(freq, now + idx * 0.08);
        g.gain.setValueAtTime(0.25, now + idx * 0.08);
        g.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.3);
        o.start(now + idx * 0.08);
        o.stop(now + idx * 0.08 + 0.3);
      });
    }
  } catch {}
}

export const PokemonUniteBattle3D: React.FC = () => {
  const { activeEncounterPokemon, endEncounter, addStardust, addExp } = useGameStore();
  const { party } = usePlayerPartyStore();

  const playerPokemon: RuntimePokemon = useMemo(() => {
    const alive = party.find((p) => p.currentHp > 0);
    if (alive) return alive;
    const defaultPika = POKEMON_SPECIES_DATABASE.pikachu || POKEMON_SPECIES_LIST[0];
    return createRuntimePokemon(defaultPika, 25, false, 'battle-player-default');
  }, [party]);

  const opponentPokemon: RuntimePokemon = useMemo(() => {
    if (activeEncounterPokemon) return activeEncounterPokemon;
    const defaultChar = POKEMON_SPECIES_DATABASE.charizard || POKEMON_SPECIES_LIST[5];
    return createRuntimePokemon(defaultChar, 25, true, 'battle-opp-default');
  }, [activeEncounterPokemon]);

  const playerSpecies = getPokemonById(playerPokemon.speciesId);
  const oppSpecies = getPokemonById(opponentPokemon.speciesId);

  const playerDex = playerSpecies?.nationalDexNumber || 25;
  const oppDex = oppSpecies?.nationalDexNumber || 6;

  const playerType = playerSpecies?.primaryType || 'Normal';
  const oppType = oppSpecies?.primaryType || 'Normal';

  const [playerHp, setPlayerHp] = useState<number>(playerPokemon.calculatedStats.hp);
  const [opponentHp, setOpponentHp] = useState<number>(opponentPokemon.calculatedStats.hp);
  const [uniteEnergy, setUniteEnergy] = useState<number>(30);
  const [isAttackingPlayer, setIsAttackingPlayer] = useState<boolean>(false);
  const [isAttackingOpponent, setIsAttackingOpponent] = useState<boolean>(false);
  const [screenShake, setScreenShake] = useState<boolean>(false);
  const [damagePopups, setDamagePopups] = useState<DamagePopup[]>([]);
  const [battleOutcome, setBattleOutcome] = useState<'IN_PROGRESS' | 'VICTORY' | 'DEFEAT'>('IN_PROGRESS');

  const [move1Cooldown, setMove1Cooldown] = useState<number>(0);
  const [move2Cooldown, setMove2Cooldown] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMove1Cooldown((prev) => Math.max(0, prev - 0.2));
      setMove2Cooldown((prev) => Math.max(0, prev - 0.2));
    }, 200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (battleOutcome !== 'IN_PROGRESS') return;
    const aiInterval = setInterval(() => {
      if (opponentHp <= 0 || playerHp <= 0) return;

      setIsAttackingOpponent(true);
      playBattleSound('hit');

      const rawDmg = Math.floor(opponentPokemon.calculatedStats.attack * 0.35 + Math.random() * 15);
      setPlayerHp((prev) => {
        const next = Math.max(0, prev - rawDmg);
        if (next === 0) setBattleOutcome('DEFEAT');
        return next;
      });

      triggerDamagePopup(`-${rawDmg}`, false, '#f43f5e', 25, 50);
      setTimeout(() => setIsAttackingOpponent(false), 300);
    }, 2800);

    return () => clearInterval(aiInterval);
  }, [battleOutcome, opponentHp, playerHp, opponentPokemon]);

  const triggerDamagePopup = (text: string, isCrit: boolean, color: string, x: number, y: number) => {
    const id = Date.now() + Math.random();
    setDamagePopups((prev) => [...prev, { id, text, isCrit, color, x, y }]);
    setTimeout(() => {
      setDamagePopups((prev) => prev.filter((p) => p.id !== id));
    }, 900);
  };

  const handleBasicAttack = () => {
    if (battleOutcome !== 'IN_PROGRESS' || opponentHp <= 0) return;
    setIsAttackingPlayer(true);
    playBattleSound('hit');

    const mult = getTypeEffectiveness(playerType, oppType);
    const baseAtk = Math.floor(playerPokemon.calculatedStats.attack * 0.38 + Math.random() * 10);
    const totalDmg = Math.floor(baseAtk * mult);
    const isCrit = Math.random() < 0.15;
    const finalDmg = isCrit ? Math.floor(totalDmg * 1.5) : totalDmg;

    setOpponentHp((prev) => {
      const next = Math.max(0, prev - finalDmg);
      if (next === 0) handleVictory();
      return next;
    });

    setUniteEnergy((prev) => Math.min(100, prev + 12));
    triggerDamagePopup(isCrit ? `CRIT! -${finalDmg}` : `-${finalDmg}`, isCrit, isCrit ? '#f59e0b' : '#ffffff', 75, 45);

    setTimeout(() => setIsAttackingPlayer(false), 250);
  };

  const handleMove1 = () => {
    if (move1Cooldown > 0 || battleOutcome !== 'IN_PROGRESS' || opponentHp <= 0) return;
    setMove1Cooldown(4.0);
    setIsAttackingPlayer(true);
    playBattleSound('move1');

    const mult = getTypeEffectiveness(playerType, oppType);
    const baseAtk = Math.floor(playerPokemon.calculatedStats.specialAttack * 0.65 + Math.random() * 20);
    const totalDmg = Math.floor(baseAtk * mult * 1.5);

    setOpponentHp((prev) => {
      const next = Math.max(0, prev - totalDmg);
      if (next === 0) handleVictory();
      return next;
    });

    setUniteEnergy((prev) => Math.min(100, prev + 25));
    triggerDamagePopup(mult > 1 ? `SUPER EFFECTIVE! -${totalDmg}` : `-${totalDmg}`, true, '#38bdf8', 75, 40);

    setTimeout(() => setIsAttackingPlayer(false), 400);
  };

  const handleMove2 = () => {
    if (move2Cooldown > 0 || battleOutcome !== 'IN_PROGRESS' || opponentHp <= 0) return;
    setMove2Cooldown(5.5);
    setIsAttackingPlayer(true);
    playBattleSound('move1');

    const baseDmg = Math.floor(playerPokemon.calculatedStats.attack * 0.75 + Math.random() * 25);
    setOpponentHp((prev) => {
      const next = Math.max(0, prev - baseDmg);
      if (next === 0) handleVictory();
      return next;
    });

    setUniteEnergy((prev) => Math.min(100, prev + 20));
    triggerDamagePopup(`-${baseDmg}`, false, '#a855f7', 75, 40);
    setTimeout(() => setIsAttackingPlayer(false), 400);
  };

  const handleUniteMove = () => {
    if (uniteEnergy < 100 || battleOutcome !== 'IN_PROGRESS' || opponentHp <= 0) return;
    setUniteEnergy(0);
    setIsAttackingPlayer(true);
    setScreenShake(true);
    playBattleSound('unite');

    const massiveDmg = Math.floor(playerPokemon.calculatedStats.specialAttack * 1.8 + 80);

    setOpponentHp((prev) => {
      const next = Math.max(0, prev - massiveDmg);
      if (next === 0) handleVictory();
      return next;
    });

    triggerDamagePopup(`UNITE ULTIMATE! -${massiveDmg}`, true, '#ec4899', 75, 30);
    confetti({ particleCount: 70, spread: 90, origin: { y: 0.4 } });

    setTimeout(() => {
      setIsAttackingPlayer(false);
      setScreenShake(false);
    }, 600);
  };

  const handleVictory = () => {
    setBattleOutcome('VICTORY');
    playBattleSound('victory');
    addStardust(250);
    addExp(350);
    confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 } });
  };

  const playerTheme = POKEMON_TYPE_THEMES[playerType] || POKEMON_TYPE_THEMES.Normal;
  const oppTheme = POKEMON_TYPE_THEMES[oppType] || POKEMON_TYPE_THEMES.Normal;

  const playerHpPct = Math.round((playerHp / playerPokemon.calculatedStats.hp) * 100);
  const oppHpPct = Math.round((opponentHp / opponentPokemon.calculatedStats.hp) * 100);

  return (
    <div
      className={`w-full h-full min-h-[620px] relative select-none overflow-hidden rounded-3xl border border-slate-800 shadow-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-between p-6 ${
        screenShake ? 'animate-bounce' : ''
      }`}
    >
      {/* Top Stadium Header & Flee */}
      <div className="flex items-center justify-between z-20">
        <button
          onClick={endEncounter}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-white/10 text-xs font-black text-slate-300 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Stadium</span>
        </button>

        <div className="bg-slate-900/90 backdrop-blur-xl px-5 py-2 rounded-2xl border border-white/10 text-center shadow-xl flex items-center gap-2">
          <Swords className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-black text-white uppercase tracking-wider">UNITE Action Stadium</span>
        </div>

        <div className="w-20" />
      </div>

      {/* Main 3D Action Battle Arena */}
      <div className="relative flex-1 flex items-center justify-between px-8 z-10">
        {damagePopups.map((popup) => (
          <div
            key={popup.id}
            className="absolute font-black text-lg drop-shadow-2xl animate-float pointer-events-none z-30"
            style={{
              left: `${popup.x}%`,
              top: `${popup.y}%`,
              color: popup.color,
            }}
          >
            {popup.text}
          </div>
        ))}

        {/* LEFT: Player Pokémon Combatant Card */}
        <div className="flex flex-col items-center gap-3">
          <div className="bg-slate-950/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 w-52 shadow-xl space-y-1.5">
            <div className="flex justify-between items-center text-xs font-black">
              <span className="text-white">{playerPokemon.name}</span>
              <span className="text-emerald-400 font-mono">Lv. {playerPokemon.level}</span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  playerHpPct > 50 ? 'bg-emerald-500' : playerHpPct > 25 ? 'bg-amber-400' : 'bg-rose-500'
                }`}
                style={{ width: `${playerHpPct}%` }}
              />
            </div>
            <div className="text-[10px] text-right text-slate-400 font-mono font-bold">
              {playerHp} / {playerPokemon.calculatedStats.hp} HP
            </div>
          </div>

          <div
            className={`relative flex flex-col items-center transition-transform duration-150 ${
              isAttackingPlayer ? 'translate-x-12 scale-110' : ''
            }`}
          >
            <div
              className="absolute w-28 h-28 rounded-full blur-2xl opacity-40"
              style={{ backgroundColor: playerTheme.primaryColor }}
            />
            <img
              src={getPokemonAnimated(playerDex)}
              alt={playerPokemon.name}
              className="w-48 h-48 object-contain drop-shadow-2xl animate-float"
              onError={(e) => {
                (e.target as HTMLImageElement).src = getPokemonArtwork(playerDex);
              }}
            />
            <div className="w-36 h-6 bg-black/60 rounded-full blur-sm" />
          </div>
        </div>

        {/* VS Center Emblem */}
        <div className="flex flex-col items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-white/20 flex items-center justify-center font-black text-amber-400 text-xs shadow-2xl">
            VS
          </div>
        </div>

        {/* RIGHT: Opponent Pokémon Combatant Card */}
        <div className="flex flex-col items-center gap-3">
          <div className="bg-slate-950/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 w-52 shadow-xl space-y-1.5">
            <div className="flex justify-between items-center text-xs font-black">
              <span className="text-white">{opponentPokemon.name}</span>
              <span className="text-rose-400 font-mono">Lv. {opponentPokemon.level}</span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  oppHpPct > 50 ? 'bg-emerald-500' : oppHpPct > 25 ? 'bg-amber-400' : 'bg-rose-500'
                }`}
                style={{ width: `${oppHpPct}%` }}
              />
            </div>
            <div className="text-[10px] text-right text-slate-400 font-mono font-bold">
              {opponentHp} / {opponentPokemon.calculatedStats.hp} HP
            </div>
          </div>

          <div
            className={`relative flex flex-col items-center transition-transform duration-150 ${
              isAttackingOpponent ? '-translate-x-12 scale-110' : ''
            }`}
          >
            <div
              className="absolute w-28 h-28 rounded-full blur-2xl opacity-40"
              style={{ backgroundColor: oppTheme.primaryColor }}
            />
            <img
              src={getPokemonAnimated(oppDex)}
              alt={opponentPokemon.name}
              className="w-48 h-48 object-contain drop-shadow-2xl animate-float"
              onError={(e) => {
                (e.target as HTMLImageElement).src = getPokemonArtwork(oppDex);
              }}
            />
            <div className="w-36 h-6 bg-black/60 rounded-full blur-sm" />
          </div>
        </div>
      </div>

      {/* Bottom Action Bar Deck */}
      <div className="bg-slate-900/90 backdrop-blur-2xl p-4 rounded-3xl border border-slate-800 shadow-2xl flex flex-wrap items-center justify-between gap-4 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={handleUniteMove}
            disabled={uniteEnergy < 100 || battleOutcome !== 'IN_PROGRESS'}
            className={`w-16 h-16 rounded-full font-black text-xs flex flex-col items-center justify-center border-2 transition-all ${
              uniteEnergy >= 100
                ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white border-white shadow-lg shadow-pink-500/40 animate-pulse scale-105 cursor-pointer'
                : 'bg-slate-950 text-slate-500 border-slate-800 cursor-not-allowed'
            }`}
          >
            <Zap className={`w-5 h-5 ${uniteEnergy >= 100 ? 'fill-current' : ''}`} />
            <span className="text-[10px] uppercase font-mono">{uniteEnergy}%</span>
          </button>
          <div>
            <div className="text-[10px] font-black uppercase text-slate-400">UNITE Ultimate Move</div>
            <div className="text-xs font-black text-pink-400">
              {uniteEnergy >= 100 ? 'READY TO STRIKE!' : 'Charge by Attacking'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleBasicAttack}
            disabled={battleOutcome !== 'IN_PROGRESS'}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-95 text-slate-950 font-black text-xs flex flex-col items-center justify-center shadow-lg shadow-emerald-500/25 transition"
          >
            <Swords className="w-5 h-5 fill-slate-950" />
            <span className="text-[9px] uppercase font-mono mt-0.5">Basic</span>
          </button>

          <button
            onClick={handleMove1}
            disabled={move1Cooldown > 0 || battleOutcome !== 'IN_PROGRESS'}
            className={`w-16 h-16 rounded-2xl font-black text-xs flex flex-col items-center justify-center border transition-all ${
              move1Cooldown > 0
                ? 'bg-slate-950 text-slate-500 border-slate-800 cursor-not-allowed'
                : 'bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-400 text-white border-blue-400/40 shadow-lg shadow-blue-500/25 active:scale-95'
            }`}
          >
            <Flame className="w-5 h-5 fill-current" />
            <span className="text-[9px] uppercase font-mono mt-0.5">
              {move1Cooldown > 0 ? `${move1Cooldown.toFixed(1)}s` : 'Skill 1'}
            </span>
          </button>

          <button
            onClick={handleMove2}
            disabled={move2Cooldown > 0 || battleOutcome !== 'IN_PROGRESS'}
            className={`w-16 h-16 rounded-2xl font-black text-xs flex flex-col items-center justify-center border transition-all ${
              move2Cooldown > 0
                ? 'bg-slate-950 text-slate-500 border-slate-800 cursor-not-allowed'
                : 'bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-400 text-white border-purple-400/40 shadow-lg shadow-purple-500/25 active:scale-95'
            }`}
          >
            <Sparkles className="w-5 h-5 fill-current" />
            <span className="text-[9px] uppercase font-mono mt-0.5">
              {move2Cooldown > 0 ? `${move2Cooldown.toFixed(1)}s` : 'Skill 2'}
            </span>
          </button>
        </div>
      </div>

      {/* Victory / Defeat Modal */}
      {battleOutcome !== 'IN_PROGRESS' && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-center space-y-5 shadow-2xl animate-scale">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto border ${
                battleOutcome === 'VICTORY'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-lg shadow-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
              }`}
            >
              {battleOutcome === 'VICTORY' ? <Trophy className="w-8 h-8" /> : <Shield className="w-8 h-8" />}
            </div>

            <div>
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Match Concluded</span>
              <h3 className="text-3xl font-black text-white">
                {battleOutcome === 'VICTORY' ? 'VICTORY!' : 'DEFEAT'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {battleOutcome === 'VICTORY'
                  ? `Defeated wild ${opponentPokemon.name} in stadium battle!`
                  : `Your ${playerPokemon.name} fainted. Revive your team at a PokéStop.`}
              </p>
            </div>

            {battleOutcome === 'VICTORY' && (
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs font-black">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Stardust</div>
                  <div className="text-purple-300 font-mono">+250</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Trainer EXP</div>
                  <div className="text-emerald-300 font-mono">+350</div>
                </div>
              </div>
            )}

            <button
              onClick={endEncounter}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition-all"
            >
              RETURN TO OVERWORLD
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
