/**
 * Pokémon 3D RPG — Pokémon GO "Oh?" Egg Hatching Cinematic Sequence
 * 
 * Features:
 * - Authentic 4-phase "Oh?" sequence:
 *   1. "Oh?" text intro with ambient focus glow.
 *   2. Bouncing egg with progressive shell cracks and intense white light flares.
 *   3. Starburst explosion with confetti & triumph chime.
 *   4. Reveal of hatched baby/rare Pokémon with CP, stats, and Party registration.
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { getPokemonAnimated, getPokemonArtwork } from '../../data/pokemon/images';
import { getPokemonById } from '../../data/pokemon';
import { POKEMON_SPECIES_DATABASE, POKEMON_SPECIES_LIST } from '../../data/pokemon/species';
import { createRuntimePokemon } from '../../battle/RuntimePokemon';
import { usePlayerPartyStore } from '../../state/usePlayerPartyStore';
import { useGameStore } from '../../state/useGameStore';
import { Sparkles, Star, CheckCircle, Disc } from 'lucide-react';

interface EggHatchingProps {
  targetKm: number;
  speciesId?: string;
  onComplete: () => void;
}

export const EggHatchingCinematic: React.FC<EggHatchingProps> = ({
  targetKm,
  speciesId = 'riolu',
  onComplete,
}) => {
  const { addCapturedPokemon } = usePlayerPartyStore();
  const { addStardust, addExp } = useGameStore();

  const [phase, setPhase] = useState<'OH_TEXT' | 'CRACK_1' | 'CRACK_2' | 'CRACK_3' | 'REVEAL'>('OH_TEXT');

  const species = getPokemonById(speciesId) || POKEMON_SPECIES_DATABASE.riolu || POKEMON_SPECIES_LIST[0];
  const hatchedPokemon = createRuntimePokemon(species, 20, false);
  const estimatedCP = Math.floor(hatchedPokemon.calculatedStats.hp * 10 + hatchedPokemon.calculatedStats.attack * 8);

  useEffect(() => {
    // Phase 1 -> Crack 1
    const t1 = setTimeout(() => setPhase('CRACK_1'), 1600);
    // Crack 1 -> Crack 2
    const t2 = setTimeout(() => setPhase('CRACK_2'), 3000);
    // Crack 2 -> Crack 3
    const t3 = setTimeout(() => setPhase('CRACK_3'), 4200);
    // Crack 3 -> Reveal!
    const t4 = setTimeout(() => {
      setPhase('REVEAL');
      addCapturedPokemon(hatchedPokemon);
      addStardust(1000);
      addExp(500);
      confetti({
        particleCount: 160,
        spread: 100,
        origin: { y: 0.45 },
        colors: ['#38bdf8', '#fbbf24', '#f43f5e', '#ffffff'],
      });
    }, 5400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  // Egg shell pattern colors based on km
  const eggColor =
    targetKm === 10
      ? 'from-purple-400 via-purple-500 to-indigo-700'
      : targetKm === 5
      ? 'from-amber-300 via-amber-400 to-orange-500'
      : 'from-emerald-300 via-emerald-400 to-teal-600';

  return (
    <div className="fixed inset-0 z-[1000] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 select-none animate-fade">
      {/* Background Radial Light Glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-cyan-500/20 blur-[140px] pointer-events-none" />

      {/* PHASE 1: "Oh?" Intro Text */}
      {phase === 'OH_TEXT' && (
        <div className="text-center space-y-3 animate-bounce">
          <h1 className="text-5xl font-black text-white tracking-widest font-mono">Oh?</h1>
          <p className="text-sm text-cyan-300 font-bold tracking-wider uppercase">
            An egg is hatching!
          </p>
        </div>
      )}

      {/* PHASE 2 & 3: Cracking Egg with Light Flares */}
      {phase !== 'OH_TEXT' && phase !== 'REVEAL' && (
        <div className="relative flex flex-col items-center justify-center">
          {/* Glowing Aura */}
          <div className="absolute w-64 h-64 rounded-full bg-white/30 blur-3xl animate-pulse" />

          {/* Shaking & Cracking Egg */}
          <div
            className={`w-40 h-52 rounded-[50%/60%_60%_40%_40%] bg-gradient-to-b ${eggColor} border-4 border-white shadow-[0_0_50px_rgba(255,255,255,0.6)] flex items-center justify-center relative transition-transform duration-200 ${
              phase === 'CRACK_1'
                ? 'rotate-6 translate-x-2'
                : phase === 'CRACK_2'
                ? '-rotate-6 -translate-x-2 scale-105'
                : 'rotate-12 scale-110 animate-ping'
            }`}
          >
            {/* Spots on egg */}
            <div className="absolute top-8 left-6 w-8 h-8 rounded-full bg-white/40" />
            <div className="absolute bottom-12 right-6 w-10 h-10 rounded-full bg-white/40" />
            <div className="absolute top-20 right-8 w-6 h-6 rounded-full bg-white/40" />

            {/* Crack lines */}
            {phase === 'CRACK_2' && (
              <div className="w-16 h-1 bg-white shadow-[0_0_15px_#fff] rotate-45" />
            )}
            {phase === 'CRACK_3' && (
              <div className="w-24 h-2 bg-white shadow-[0_0_25px_#fff] -rotate-12 animate-pulse" />
            )}
          </div>

          <div className="w-36 h-6 bg-black/60 rounded-full blur-md mt-6" />

          <div className="text-xs font-mono font-black text-cyan-300 mt-6 tracking-widest animate-pulse uppercase">
            {phase === 'CRACK_1' && 'Cracking...'}
            {phase === 'CRACK_2' && 'Light breaking through...'}
            {phase === 'CRACK_3' && 'Hatching now!'}
          </div>
        </div>
      )}

      {/* PHASE 4: Reveal Hatched Pokémon */}
      {phase === 'REVEAL' && (
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl animate-scale relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
            <Sparkles className="w-6 h-6" />
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
              {targetKm}km Egg Hatched!
            </span>
            <h2 className="text-3xl font-black text-white mt-1">{species.name}</h2>
            <div className="text-sm font-black text-amber-400 font-mono mt-0.5">
              CP {estimatedCP} ★★★
            </div>
          </div>

          {/* 3D Animated Pokemon Preview */}
          <div className="flex items-center justify-center py-2 relative">
            <div className="absolute w-40 h-40 rounded-full bg-cyan-500/20 blur-2xl animate-pulse" />
            <img
              src={getPokemonAnimated(species.nationalDexNumber)}
              alt={species.name}
              className="w-48 h-48 object-contain drop-shadow-2xl animate-float relative z-10"
              onError={(e) => {
                (e.target as HTMLImageElement).src = getPokemonArtwork(species.nationalDexNumber);
              }}
            />
          </div>

          {/* Rewards Grid */}
          <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs font-black">
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Stardust Bonus</div>
              <div className="text-purple-300 font-mono">+1,000</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Trainer EXP</div>
              <div className="text-emerald-300 font-mono">+500</div>
            </div>
          </div>

          <button
            onClick={onComplete}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition-all"
          >
            CONTINUE TO OVERWORLD
          </button>
        </div>
      )}
    </div>
  );
};
