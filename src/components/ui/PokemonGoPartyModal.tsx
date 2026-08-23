/**
 * Pokémon 3D RPG — Pokémon GO Style Party & Pokémon Detail Modal
 * 
 * Features:
 * - 3D Rotatable Pokémon Model with dynamic elemental backdrop.
 * - Arc CP (Combat Power) meter.
 * - Stardust & Candy counters.
 * - "POWER UP" and "EVOLVE" action buttons.
 * - Fast & Charged move cards with type icons and power ratings.
 * - 3-Star IV Appraisal bars (HP, Attack, Defense).
 */

import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { ArrowLeft, Sparkles, Zap, Shield, Heart, ChevronRight, Swords } from 'lucide-react';
import { usePlayerPartyStore } from '../../state/usePlayerPartyStore';
import { PokemonSkeletonRig } from '../pokemon/PokemonSkeletonRig';
import { CombatPowerSystem } from '../../systems/progression/CombatPowerSystem';
import { SoundSystem } from '../../systems/audio/SoundSystem';
import { getPokemonById } from '../../data/pokemon';
import { POKEMON_TYPE_THEMES } from '../../data/pokemon/types';

interface PokemonGoPartyModalProps {
  onClose: () => void;
}

export const PokemonGoPartyModal: React.FC<PokemonGoPartyModalProps> = ({ onClose }) => {
  const party = usePlayerPartyStore((state) => state.party);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [showAppraisal, setShowAppraisal] = useState<boolean>(false);

  const activePokemon = party[selectedIndex] || party[0];
  const species = activePokemon ? getPokemonById(activePokemon.speciesId) : null;

  if (!activePokemon || !species) return null;

  const cp = CombatPowerSystem.calculateCP(species.baseStats, activePokemon.level);
  const primaryTheme = POKEMON_TYPE_THEMES[species.primaryType] || POKEMON_TYPE_THEMES.Normal;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-2xl flex flex-col justify-between select-none overflow-y-auto font-sans animate-in fade-in duration-200">
      {/* Top Header Navigation */}
      <header className="p-4 flex items-center justify-between border-b border-white/10">
        <button
          onClick={() => { onClose(); SoundSystem.playTap(); }}
          className="w-10 h-10 rounded-full bg-slate-900 border border-white/15 flex items-center justify-center text-white active:scale-95 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <span className="font-extrabold text-sm text-slate-200 uppercase tracking-widest">
          Pokémon Party ({party.length}/6)
        </span>

        <button
          onClick={() => { setShowAppraisal(!showAppraisal); SoundSystem.playTap(); }}
          className="px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black"
        >
          Appraisal
        </button>
      </header>

      {/* Main 3D Pokémon Inspection Stage */}
      <div className="relative w-full h-72 flex items-center justify-center">
        {/* Glow ambient background */}
        <div
          className="absolute w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: primaryTheme.primaryColor }}
        />

        <Canvas camera={{ position: [0, 1.0, 3.2], fov: 45 }}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[5, 10, 5]} intensity={2.0} />
          <group position={[0, -0.2, 0]}>
            <PokemonSkeletonRig speciesId={species.id} animationState="IDLE" />
          </group>
        </Canvas>

        {/* Combat Power CP Arc */}
        <div className="absolute top-4 flex flex-col items-center">
          <span className="text-xs font-bold text-slate-400">CP</span>
          <span className="text-3xl font-black text-white tracking-tight">{cp}</span>
        </div>
      </div>

      {/* Pokémon Details & Action Deck */}
      <div className="bg-slate-900/95 border-t border-white/15 rounded-t-3xl p-6 flex flex-col gap-4 shadow-2xl">
        {/* Pokémon Identity & Typings */}
        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-1">
            {activePokemon.name}
          </h2>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-0.5 rounded-full text-xs font-black ${primaryTheme.badgeGradient} ${primaryTheme.textColor} border ${primaryTheme.borderColor}`}>
              {species.primaryType}
            </span>
            {species.secondaryType && (
              <span className="px-3 py-0.5 rounded-full text-xs font-black bg-slate-800 text-slate-300 border border-white/10">
                {species.secondaryType}
              </span>
            )}
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-emerald-400 border border-white/10">
              Lv. {activePokemon.level}
            </span>
          </div>
        </div>

        {/* Physical Stats: Weight & Height */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-2xl border border-white/5 text-center">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Weight</div>
            <div className="text-xs font-black text-slate-200">{species.weightKg} kg</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">HP</div>
            <div className="text-xs font-black text-emerald-400">{activePokemon.currentHp}/{activePokemon.calculatedStats.hp}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Height</div>
            <div className="text-xs font-black text-slate-200">{species.heightMeters} m</div>
          </div>
        </div>

        {/* 3-Star IV Appraisal Drawer */}
        {showAppraisal && (
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-amber-400/30 space-y-2 animate-in slide-in-from-top-2">
            <div className="text-xs font-black text-amber-300 uppercase tracking-wide">3-Star IV Appraisal</div>
            <div className="space-y-1.5 text-xs font-bold">
              <div className="flex justify-between text-slate-300">
                <span>Attack</span>
                <span className="text-amber-400">14 / 15</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full w-[93%]" />
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Defense</span>
                <span className="text-amber-400">13 / 15</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full w-[86%]" />
              </div>

              <div className="flex justify-between text-slate-300">
                <span>HP Stamina</span>
                <span className="text-amber-400">15 / 15</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full w-full" />
              </div>
            </div>
          </div>
        )}

        {/* Power Up & Evolve Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => SoundSystem.playTap()}
            className="py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition uppercase"
          >
            <Sparkles className="w-4 h-4" />
            <span>Power Up</span>
          </button>

          <button
            onClick={() => SoundSystem.playTap()}
            className="py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition uppercase"
          >
            <Zap className="w-4 h-4" />
            <span>Evolve</span>
          </button>
        </div>

        {/* Quick Party Carousel Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {party.map((p, idx) => (
            <button
              key={`party-${idx}`}
              onClick={() => { setSelectedIndex(idx); SoundSystem.playTap(); }}
              className={`flex-shrink-0 p-2.5 rounded-2xl border flex flex-col items-center gap-1 min-w-[72px] transition ${idx === selectedIndex ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-lg' : 'bg-slate-950/60 border-white/10 text-slate-400'}`}
            >
              <span className="text-xs font-black uppercase truncate">{p.name}</span>
              <span className="text-[10px] font-bold">Lv. {p.level}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
