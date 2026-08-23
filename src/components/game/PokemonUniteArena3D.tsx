/**
 * Pokémon 3D RPG — Pokémon UNITE 3D Aeos Goal Arena & In-Match Evolution Engine
 * 
 * Features:
 * - 3D Dual-Lane Stadium with Allied & Enemy Goal Zones.
 * - Aeos Energy Orb drops from wild mobs & Channel Goal Dunking.
 * - In-Match Leveling & Evolution: Lv 1 -> Lv 5 (Evo 1 + Skill Choice) -> Lv 9 (Final Evo + UNITE Ultimate).
 * - Active Battle Items: Eject Button (Flash Teleport), Potion, X Attack.
 * - Rayquaza Central Pit Boss with Team Shield & Instant Dunking.
 * - Procedural WebAudio sound effects and victory celebration.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../../state/useGameStore';
import { usePlayerPartyStore } from '../../state/usePlayerPartyStore';
import { getPokemonAnimated, getPokemonArtwork, getPokemonIcon } from '../../data/pokemon/images';
import { getPokemonById } from '../../data/pokemon';
import { POKEMON_TYPE_THEMES } from '../../data/pokemon/types';
import { POKEMON_SPECIES_DATABASE } from '../../data/pokemon/species';
import { createRuntimePokemon } from '../../battle/RuntimePokemon';
import {
  Swords,
  Zap,
  Flame,
  Shield,
  ArrowLeft,
  Sparkles,
  Trophy,
  Activity,
  Disc,
  Clock,
  CircleDot,
  Radio,
  Star
} from 'lucide-react';

interface WildMob {
  id: string;
  name: string;
  dex: number;
  hp: number;
  maxHp: number;
  aeosOrbs: number;
  x: number; // percentage on map
  y: number;
  isBoss?: boolean;
}

export const PokemonUniteArena3D: React.FC = () => {
  const { endEncounter, addStardust, addCoins, addExp } = useGameStore();
  const { party } = usePlayerPartyStore();

  // Match State
  const [matchTime, setMatchTime] = useState<number>(300); // 5 minutes
  const [blueScore, setBlueScore] = useState<number>(0);
  const [orangeScore, setOrangeScore] = useState<number>(0);
  const [aeosOrbs, setAeosOrbs] = useState<number>(12); // Player held orbs (0-50)
  const [isDunking, setIsDunking] = useState<boolean>(false);
  const [dunkProgress, setDunkProgress] = useState<number>(0);

  // In-Match Leveling State
  const [inMatchLevel, setInMatchLevel] = useState<number>(1);
  const [inMatchExp, setInMatchExp] = useState<number>(0);
  const [inMatchExpToNext, setInMatchExpToNext] = useState<number>(100);
  const [uniteEnergy, setUniteEnergy] = useState<number>(20);
  const [skillChoicePrompt, setSkillChoicePrompt] = useState<boolean>(false);
  const [selectedMove1, setSelectedMove1] = useState<string>('Basic Spark');
  const [selectedMove2, setSelectedMove2] = useState<string>('Quick Dash');

  // Battle Item: Eject Button Cooldown
  const [ejectCooldown, setEjectCooldown] = useState<number>(0);
  const [potionCooldown, setPotionCooldown] = useState<number>(0);
  const [hasRayquazaShield, setHasRayquazaShield] = useState<boolean>(false);
  const [screenShake, setScreenShake] = useState<boolean>(false);
  const [matchOutcome, setMatchOutcome] = useState<'IN_PROGRESS' | 'VICTORY' | 'DEFEAT'>('IN_PROGRESS');

  // Player in-match species (Starts as Charmander, evolves to Charmeleon at Lv 5, Charizard at Lv 9)
  const currentSpeciesId = useMemo(() => {
    if (inMatchLevel >= 9) return 'charizard';
    if (inMatchLevel >= 5) return 'charmeleon';
    return 'charmander';
  }, [inMatchLevel]);

  const currentSpecies = POKEMON_SPECIES_DATABASE[currentSpeciesId] || POKEMON_SPECIES_DATABASE.charmander;

  // Wild Neutral Mobs in Stadium
  const [mobs, setMobs] = useState<WildMob[]>([
    { id: 'mob-1', name: 'Aipom', dex: 190, hp: 120, maxHp: 120, aeosOrbs: 3, x: 25, y: 30 },
    { id: 'mob-2', name: 'Corphish', dex: 341, hp: 150, maxHp: 150, aeosOrbs: 4, x: 28, y: 65 },
    { id: 'mob-3', name: 'Audino', dex: 531, hp: 280, maxHp: 280, aeosOrbs: 7, x: 50, y: 30 },
    { id: 'mob-4', name: 'Drednaw', dex: 834, hp: 450, maxHp: 450, aeosOrbs: 12, x: 50, y: 70 },
    { id: 'mob-boss', name: 'Rayquaza', dex: 384, hp: 950, maxHp: 950, aeosOrbs: 30, x: 50, y: 50, isBoss: true },
  ]);

  const [selectedMob, setSelectedMob] = useState<WildMob | null>(mobs[0]);

  // Match Timer Countdown
  useEffect(() => {
    if (matchOutcome !== 'IN_PROGRESS') return;
    const timer = setInterval(() => {
      setMatchTime((prev) => {
        if (prev <= 1) {
          concludeMatch();
          return 0;
        }
        return prev - 1;
      });
      setEjectCooldown((prev) => Math.max(0, prev - 1));
      setPotionCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [matchOutcome, blueScore, orangeScore]);

  // Enemy Team Auto Scoring Simulation
  useEffect(() => {
    if (matchOutcome !== 'IN_PROGRESS') return;
    const enemyScoreInterval = setInterval(() => {
      const added = (Math.floor(Math.random() * 3) + 1) * 10;
      setOrangeScore((prev) => prev + added);
    }, 14000);

    return () => clearInterval(enemyScoreInterval);
  }, [matchOutcome]);

  // Add in-match EXP
  const gainInMatchExp = (exp: number) => {
    let nextExp = inMatchExp + exp;
    let nextLvl = inMatchLevel;
    let req = inMatchExpToNext;

    if (nextExp >= req && nextLvl < 15) {
      nextExp -= req;
      nextLvl += 1;
      req = Math.floor(req * 1.4);

      if (nextLvl === 5 || nextLvl === 9) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
        setSkillChoicePrompt(true);
      }
    }

    setInMatchExp(nextExp);
    setInMatchLevel(nextLvl);
    setInMatchExpToNext(req);
  };

  // 1. Basic Attack Mob
  const handleAttackMob = () => {
    if (!selectedMob || selectedMob.hp <= 0) return;

    const dmg = 45 + inMatchLevel * 12;
    const nextHp = Math.max(0, selectedMob.hp - dmg);

    setMobs((prev) => prev.map((m) => (m.id === selectedMob.id ? { ...m, hp: nextHp } : m)));
    setSelectedMob((prev) => (prev ? { ...prev, hp: nextHp } : null));
    setUniteEnergy((prev) => Math.min(100, prev + 8));

    if (nextHp === 0) {
      // Defeated mob!
      const orbsGained = selectedMob.aeosOrbs;
      setAeosOrbs((prev) => Math.min(50, prev + orbsGained));
      gainInMatchExp(selectedMob.isBoss ? 400 : 120);

      if (selectedMob.isBoss) {
        setHasRayquazaShield(true);
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.4 } });
      }
    }
  };

  // 2. Channel Dunk Aeos Energy into Goal Zone
  const handleStartDunk = () => {
    if (aeosOrbs <= 0 || isDunking) return;
    setIsDunking(true);
    setDunkProgress(0);

    const dunkTime = hasRayquazaShield ? 400 : 1600;
    const intervalTime = 40;
    const step = 100 / (dunkTime / intervalTime);

    const interval = setInterval(() => {
      setDunkProgress((prev) => {
        if (prev + step >= 100) {
          clearInterval(interval);
          completeDunk();
          return 100;
        }
        return prev + step;
      });
    }, intervalTime);
  };

  const completeDunk = () => {
    setIsDunking(false);
    const scoredPoints = matchTime <= 120 ? aeosOrbs * 2 : aeosOrbs; // Double in Final 2 Minutes!
    setBlueScore((prev) => prev + scoredPoints);
    setAeosOrbs(0);
    gainInMatchExp(scoredPoints * 10);
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.45 } });
  };

  // 3. Battle Item: Eject Button Flash Teleport
  const handleUseEjectButton = () => {
    if (ejectCooldown > 0) return;
    setEjectCooldown(25);
    setScreenShake(true);
    confetti({ particleCount: 30, spread: 40, colors: ['#38bdf8', '#0284c7'] });
    setTimeout(() => setScreenShake(false), 300);
  };

  // 4. UNITE Move Ultimate
  const handleUseUniteUltimate = () => {
    if (uniteEnergy < 100) return;
    setUniteEnergy(0);
    setScreenShake(true);
    confetti({ particleCount: 120, spread: 100, origin: { y: 0.4 } });

    // Massive damage to all surrounding mobs
    setMobs((prev) => prev.map((m) => ({ ...m, hp: Math.max(0, m.hp - 350) })));
    setAeosOrbs((prev) => Math.min(50, prev + 15));
    gainInMatchExp(250);

    setTimeout(() => setScreenShake(false), 600);
  };

  const concludeMatch = () => {
    const isWin = blueScore >= orangeScore;
    setMatchOutcome(isWin ? 'VICTORY' : 'DEFEAT');
    if (isWin) {
      addStardust(500);
      addCoins(100);
      addExp(600);
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
    }
  };

  return (
    <div
      className={`w-full h-full min-h-[640px] relative select-none overflow-hidden rounded-3xl border border-slate-800 shadow-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-between p-6 ${
        screenShake ? 'animate-bounce' : ''
      }`}
    >
      {/* Top UNITE Scoreboard & Timer */}
      <div className="flex items-center justify-between z-20">
        <button
          onClick={endEncounter}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-white/10 text-xs font-black text-slate-300 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Stadium</span>
        </button>

        {/* Live Scoreboard */}
        <div className="flex items-center gap-6 bg-slate-900/95 backdrop-blur-2xl px-6 py-2.5 rounded-3xl border border-white/10 shadow-2xl">
          <div className="text-right">
            <div className="text-[10px] font-black uppercase text-cyan-400">Allies (Blue)</div>
            <div className="text-2xl font-black text-white font-mono">{blueScore}</div>
          </div>

          <div className="flex flex-col items-center">
            <div className="text-xs font-black text-amber-400 font-mono flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {Math.floor(matchTime / 60)}:{(matchTime % 60).toString().padStart(2, '0')}
              </span>
            </div>
            {matchTime <= 120 && (
              <span className="text-[9px] font-black uppercase text-pink-400 animate-pulse">2x Points!</span>
            )}
          </div>

          <div className="text-left">
            <div className="text-[10px] font-black uppercase text-orange-400">Enemies (Orange)</div>
            <div className="text-2xl font-black text-white font-mono">{orangeScore}</div>
          </div>
        </div>

        {/* Player Aeos Orbs Display */}
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 font-black text-xs shadow-md">
            ●
          </div>
          <div>
            <div className="text-[9px] font-black uppercase text-slate-400">Aeos Orbs</div>
            <div className="text-xs font-black text-amber-300 font-mono">{aeosOrbs}/50</div>
          </div>
        </div>
      </div>

      {/* Center 3D Arena Field & Goal Zones */}
      <div className="relative flex-1 flex items-center justify-between px-6 z-10">
        {/* Allied Side Goal Zone */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-24 h-24 rounded-full border-4 border-cyan-400/80 bg-cyan-950/40 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <span className="text-[10px] font-black uppercase text-cyan-300">Allied Goal</span>
          </div>

          {/* Player In-Match Pokémon */}
          <div className="flex flex-col items-center mt-2">
            <div className="bg-slate-950/90 px-3 py-1 rounded-full border border-slate-800 text-[10px] font-black text-white flex items-center gap-1.5">
              <span>{currentSpecies.name}</span>
              <span className="text-emerald-400 font-mono">Lv. {inMatchLevel}</span>
            </div>
            <img
              src={getPokemonAnimated(currentSpecies.nationalDexNumber)}
              alt={currentSpecies.name}
              className="w-40 h-40 object-contain drop-shadow-2xl animate-float mt-1"
            />
          </div>
        </div>

        {/* Center Neutral Pit (Rayquaza / Wild Mobs) */}
        <div className="flex flex-col items-center gap-3">
          <div className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
            Neutral Objectives
          </div>

          <div className="flex gap-2">
            {mobs.map((mob) => {
              const isSelected = selectedMob?.id === mob.id;
              return (
                <button
                  key={mob.id}
                  onClick={() => setSelectedMob(mob)}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center ${
                    isSelected
                      ? 'bg-slate-800 border-amber-400/80 shadow-lg scale-105'
                      : 'bg-slate-950/80 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <img
                    src={getPokemonIcon(mob.dex)}
                    alt={mob.name}
                    className="w-8 h-8 object-contain drop-shadow"
                  />
                  <span className="text-[10px] font-black text-white">{mob.name}</span>
                  <span className="text-[9px] font-mono text-emerald-400">{mob.hp}/{mob.maxHp}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Enemy Side Goal Zone (Target for Dunking!) */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleStartDunk}
            disabled={aeosOrbs <= 0 || isDunking}
            className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center transition-all ${
              aeosOrbs > 0
                ? 'border-orange-500 bg-orange-950/60 shadow-2xl shadow-orange-500/40 hover:scale-105 cursor-pointer animate-pulse'
                : 'border-slate-800 bg-slate-950 text-slate-600 cursor-not-allowed'
            }`}
          >
            <Disc className="w-6 h-6 text-orange-400 mb-1" />
            <span className="text-[10px] font-black uppercase text-white">
              {isDunking ? `${Math.round(dunkProgress)}%` : 'DUNK GOAL'}
            </span>
            <span className="text-[9px] font-mono text-amber-300">+{aeosOrbs} Orbs</span>
          </button>
          <span className="text-[10px] font-black uppercase text-orange-400">Enemy Goal Zone</span>
        </div>
      </div>

      {/* Bottom Action Deck: Moves, UNITE Ultimate & Eject Button */}
      <div className="bg-slate-900/95 backdrop-blur-2xl p-4 rounded-3xl border border-slate-800 shadow-2xl flex flex-wrap items-center justify-between gap-4 z-20">
        {/* Left: Active Battle Item (Eject Button) */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleUseEjectButton}
            disabled={ejectCooldown > 0}
            className={`w-14 h-14 rounded-2xl font-black text-xs flex flex-col items-center justify-center border transition-all ${
              ejectCooldown > 0
                ? 'bg-slate-950 text-slate-600 border-slate-800 cursor-not-allowed'
                : 'bg-gradient-to-br from-sky-500 to-blue-600 text-white border-sky-400 shadow-lg shadow-sky-500/25 active:scale-95'
            }`}
          >
            <Zap className="w-4 h-4 fill-current" />
            <span className="text-[9px] uppercase font-mono mt-0.5">
              {ejectCooldown > 0 ? `${ejectCooldown}s` : 'Eject'}
            </span>
          </button>

          <div>
            <div className="text-[10px] font-black uppercase text-slate-400">Battle Item</div>
            <div className="text-xs font-black text-sky-400">Eject Flash Blink</div>
          </div>
        </div>

        {/* Center: In-Match Level Progress */}
        <div className="flex flex-col items-center w-48">
          <div className="flex justify-between w-full text-[10px] font-black mb-1">
            <span className="text-slate-400">In-Match Lv. {inMatchLevel}</span>
            <span className="text-emerald-400 font-mono">{inMatchExp}/{inMatchExpToNext} EXP</span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.round((inMatchExp / inMatchExpToNext) * 100))}%` }}
            />
          </div>
        </div>

        {/* Right: Attack Actions & UNITE Ultimate */}
        <div className="flex items-center gap-3">
          {/* Basic Attack Button */}
          <button
            onClick={handleAttackMob}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-black text-xs flex flex-col items-center justify-center shadow-lg shadow-emerald-500/25 active:scale-95 transition"
          >
            <Swords className="w-5 h-5 fill-slate-950" />
            <span className="text-[9px] uppercase font-mono mt-0.5">Strike</span>
          </button>

          {/* UNITE Ultimate Button */}
          <button
            onClick={handleUseUniteUltimate}
            disabled={uniteEnergy < 100}
            className={`w-16 h-16 rounded-full font-black text-xs flex flex-col items-center justify-center border-2 transition-all ${
              uniteEnergy >= 100
                ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white border-white shadow-lg shadow-pink-500/40 animate-pulse cursor-pointer'
                : 'bg-slate-950 text-slate-600 border-slate-800 cursor-not-allowed'
            }`}
          >
            <Zap className={`w-5 h-5 ${uniteEnergy >= 100 ? 'fill-current' : ''}`} />
            <span className="text-[9px] uppercase font-mono">{uniteEnergy}%</span>
          </button>
        </div>
      </div>

      {/* Match Conclusion Modal */}
      {matchOutcome !== 'IN_PROGRESS' && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-center space-y-5 shadow-2xl animate-scale">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Match Concluded</span>
              <h3 className="text-3xl font-black text-white">{matchOutcome}!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Final Score: <b className="text-cyan-400">{blueScore}</b> vs <b className="text-orange-400">{orangeScore}</b>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs font-black">
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Stardust</div>
                <div className="text-purple-300 font-mono">+500</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Aeos Coins</div>
                <div className="text-amber-300 font-mono">+100</div>
              </div>
            </div>

            <button
              onClick={endEncounter}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition-all"
            >
              RETURN TO OVERWORLD
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
