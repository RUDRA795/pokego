import React from 'react';
import { Swords, Disc3, Footprints, ShieldAlert } from 'lucide-react';
import { useGameStore } from '../../state/useGameStore';
import { usePlayerPartyStore } from '../../state/usePlayerPartyStore';
import { POKEMON_TYPE_THEMES } from '../../data/pokemon/types';
import { PokemonType } from '../../types/pokemon';

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
  const dexNum = `#${String(pokemonSpecies.nationalDexNumber).padStart(4, '0')}`;
  const description = pokemonSpecies.pokedexEntry;
  const level = pokemon.level;
  const currentHp = pokemon.currentHp;
  const maxHp = pokemon.maxHp;

  const primaryType: PokemonType = pokemonSpecies.primaryType;
  const secondaryType: PokemonType | undefined = pokemonSpecies.secondaryType;

  const primaryTheme = POKEMON_TYPE_THEMES[primaryType] || POKEMON_TYPE_THEMES.Normal;
  const secondaryTheme = secondaryType ? POKEMON_TYPE_THEMES[secondaryType] : undefined;

  const stats = pokemonSpecies.baseStats;

  const handleStartBattle = () => {
    // Ensure player has a starter in party if party is empty
    if (party.length === 0) {
      initStarter('pikachu');
    }
    setScreen('BATTLE');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-slate-900/95 border border-white/20 shadow-2xl p-6 flex flex-col items-center text-center">
        {/* Glow ambient halo */}
        <div
          className="absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: primaryTheme.primaryColor }}
        />

        {/* Top Encounter Tag & Dex Number */}
        <div className="w-full flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold tracking-wider uppercase">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Wild Pokémon</span>
          </div>
          <span className="font-mono text-xs font-bold text-slate-400 px-2.5 py-0.5 rounded-full bg-slate-800 border border-white/5">
            {dexNum}
          </span>
        </div>

        {/* Pokémon Name & Species Category */}
        <h2 className="text-2xl font-black tracking-tight text-white uppercase mb-0.5">
          {name}
        </h2>
        <p className="text-xs text-slate-400 mb-3 font-medium">{category}</p>

        {/* Elemental Type Badges & Level Pill */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`px-3 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r ${primaryTheme.badgeGradient} ${primaryTheme.textColor} border ${primaryTheme.borderColor} shadow`}>
            {primaryType}
          </span>

          {secondaryType && secondaryTheme && (
            <span className={`px-3 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r ${secondaryTheme.badgeGradient} ${secondaryTheme.textColor} border ${secondaryTheme.borderColor} shadow`}>
              {secondaryType}
            </span>
          )}

          <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
            Lv. {level}
          </span>
        </div>

        {/* Stats Preview Card (6 Stats Breakdown) */}
        <div className="w-full bg-slate-950/60 rounded-2xl p-3.5 border border-white/5 mb-5 text-left">
          <p className="text-xs text-slate-300 leading-relaxed mb-3 italic">
            "{description}"
          </p>

          <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
            <div className="bg-slate-900/80 rounded-xl p-1.5 border border-white/5">
              <div className="text-slate-400 text-[9px] font-semibold uppercase">HP</div>
              <div className="text-emerald-400 font-bold">{currentHp}/{maxHp}</div>
            </div>
            <div className="bg-slate-900/80 rounded-xl p-1.5 border border-white/5">
              <div className="text-slate-400 text-[9px] font-semibold uppercase">Attack</div>
              <div className="text-amber-400 font-bold">{stats.attack}</div>
            </div>
            <div className="bg-slate-900/80 rounded-xl p-1.5 border border-white/5">
              <div className="text-slate-400 text-[9px] font-semibold uppercase">Defense</div>
              <div className="text-sky-400 font-bold">{stats.defense}</div>
            </div>
            <div className="bg-slate-900/80 rounded-xl p-1.5 border border-white/5">
              <div className="text-slate-400 text-[9px] font-semibold uppercase">Sp. Atk</div>
              <div className="text-purple-400 font-bold">{stats.specialAttack}</div>
            </div>
            <div className="bg-slate-900/80 rounded-xl p-1.5 border border-white/5">
              <div className="text-slate-400 text-[9px] font-semibold uppercase">Sp. Def</div>
              <div className="text-indigo-400 font-bold">{stats.specialDefense}</div>
            </div>
            <div className="bg-slate-900/80 rounded-xl p-1.5 border border-white/5">
              <div className="text-slate-400 text-[9px] font-semibold uppercase">Speed</div>
              <div className="text-cyan-400 font-bold">{stats.speed}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full grid grid-cols-1 gap-2.5">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleStartBattle}
              className="py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition"
            >
              <Disc3 className="w-4 h-4" />
              CAPTURE
            </button>

            <button
              onClick={handleStartBattle}
              className="py-3 px-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 active:scale-95 transition"
            >
              <Swords className="w-4 h-4" />
              BATTLE
            </button>
          </div>

          <button
            onClick={dismissEncounter}
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
