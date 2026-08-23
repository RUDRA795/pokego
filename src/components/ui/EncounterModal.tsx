/**
 * Pokémon 3D RPG — Pokémon GO Style Encounter Action Card
 * 
 * Features:
 * - Glassmorphic high-production card with authentic typing badges and lore.
 * - Options to enter Pokémon GO Swipe Capture Mode or UNITE 3D Battle Arena.
 */

import React from 'react';
import { Swords, Disc3, Footprints, ShieldAlert } from 'lucide-react';
import { useGameStore } from '../../state/useGameStore';
import { usePlayerPartyStore } from '../../state/usePlayerPartyStore';
import { POKEMON_TYPE_THEMES } from '../../data/pokemon/types';
import { PokemonType } from '../../types/pokemon';
import { CombatPowerSystem } from '../../systems/progression/CombatPowerSystem';
import { SoundSystem } from '../../systems/audio/SoundSystem';

export const EncounterModal: React.FC = () => {
  const encounter = useGameStore((state) => state.encounter);
  const dismissEncounter = useGameStore((state) => state.dismissEncounter);
  const setScreen = useGameStore((state) => state.setScreen);

  const party = usePlayerPartyStore((state) => state.party);
  const initStarter = usePlayerPartyStore((state) => state.initStarter);
  const markSeen = usePlayerPartyStore((state) => state.markSeen);

  if (!encounter) return null;

  const { pokemon, pokemonSpecies } = encounter;
  markSeen(pokemonSpecies.id);

  const name = pokemonSpecies.name;
  const category = pokemonSpecies.speciesCategory;
  const dexNum = `#${String(pokemonSpecies.nationalDexNumber).padStart(3, '0')}`;
  const description = pokemonSpecies.pokedexEntry;
  const level = pokemon.level;

  const primaryType: PokemonType = pokemonSpecies.primaryType;
  const secondaryType: PokemonType | undefined = pokemonSpecies.secondaryType;

  const primaryTheme = POKEMON_TYPE_THEMES[primaryType] || POKEMON_TYPE_THEMES.Normal;
  const secondaryTheme = secondaryType ? POKEMON_TYPE_THEMES[secondaryType] : undefined;

  const cp = CombatPowerSystem.calculateCP(pokemonSpecies.baseStats, level);

  const handleStartCapture = () => {
    SoundSystem.playTap();
    setScreen('CAPTURE');
  };

  const handleStartBattle = () => {
    SoundSystem.playTap();
    if (party.length === 0) {
      initStarter('pikachu');
    }
    setScreen('BATTLE');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-slate-900/95 border border-white/20 shadow-2xl p-6 flex flex-col items-center text-center">
        {/* Glow ambient halo */}
        <div
          className="absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: primaryTheme.primaryColor }}
        />

        {/* Top Encounter Tag & Dex Number */}
        <div className="w-full flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-black tracking-wider uppercase">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Wild Pokémon</span>
          </div>
          <span className="font-mono text-xs font-bold text-slate-400 px-2.5 py-0.5 rounded-full bg-slate-800 border border-white/5">
            {dexNum}
          </span>
        </div>

        {/* Combat Power CP Pill */}
        <div className="px-3.5 py-0.5 rounded-full bg-slate-950 border border-white/10 text-xs font-black text-amber-400 mb-2">
          CP {cp}
        </div>

        {/* Pokémon Name & Species Category */}
        <h2 className="text-2xl font-black tracking-tight text-white uppercase mb-0.5">
          {name}
        </h2>
        <p className="text-xs text-slate-400 mb-3 font-medium">{category}</p>

        {/* Elemental Type Badges & Level Pill */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`px-3 py-0.5 rounded-full text-xs font-black bg-gradient-to-r ${primaryTheme.badgeGradient} ${primaryTheme.textColor} border ${primaryTheme.borderColor} shadow`}>
            {primaryType}
          </span>

          {secondaryType && secondaryTheme && (
            <span className={`px-3 py-0.5 rounded-full text-xs font-black bg-gradient-to-r ${secondaryTheme.badgeGradient} ${secondaryTheme.textColor} border ${secondaryTheme.borderColor} shadow`}>
              {secondaryType}
            </span>
          )}

          <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
            Lv. {level}
          </span>
        </div>

        {/* Description Lore Card */}
        <div className="w-full bg-slate-950/70 rounded-2xl p-3 border border-white/5 mb-5 text-left">
          <p className="text-xs text-slate-300 leading-relaxed italic">
            "{description}"
          </p>
        </div>

        {/* Action Buttons: GO Capture vs UNITE Battle */}
        <div className="w-full grid grid-cols-1 gap-2.5">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleStartCapture}
              className="py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition uppercase"
            >
              <Disc3 className="w-4 h-4" />
              GO CATCH
            </button>

            <button
              onClick={handleStartBattle}
              className="py-3 px-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-xs tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 active:scale-95 transition uppercase"
            >
              <Swords className="w-4 h-4" />
              UNITE BATTLE
            </button>
          </div>

          <button
            onClick={() => { dismissEncounter(); SoundSystem.playTap(); }}
            className="w-full py-2.5 px-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 hover:text-white font-bold text-xs tracking-wider flex items-center justify-center gap-1.5 border border-white/10 active:scale-95 transition"
          >
            <Footprints className="w-4 h-4 text-slate-400" />
            RUN AWAY
          </button>
        </div>
      </div>
    </div>
  );
};
