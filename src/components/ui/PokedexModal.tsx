/**
 * Pokémon 3D RPG — Upgraded National Pokédex & Collection Catalog
 * 
 * Features:
 * - Full regional & type filtering (Kanto, Johto, Hoenn, Sinnoh & 18 types)
 * - Live search & sorting (Dex Number, Name, BST, Height, Weight)
 * - Discovery progress counters (Seen: X/Total, Caught: Y/Total)
 * - Detailed species cards with types, biology, base stats, and Pokédex entries.
 */

import React, { useState, useMemo } from 'react';
import { BookOpen, X, CheckCircle, Eye, Search, ArrowUpDown, Filter, Sparkles } from 'lucide-react';
import { POKEMON_SPECIES_LIST } from '../../data/pokemon';
import { POKEMON_TYPE_THEMES } from '../../data/pokemon/types';
import { usePlayerPartyStore } from '../../state/usePlayerPartyStore';
import { PokemonSpeciesData, PokemonType } from '../../types/pokemon';

interface PokedexModalProps {
  onClose: () => void;
}

export const PokedexModal: React.FC<PokedexModalProps> = ({ onClose }) => {
  const pokedexSeen = usePlayerPartyStore((state) => state.pokedexSeen);
  const pokedexCaught = usePlayerPartyStore((state) => state.pokedexCaught);

  const [selectedSpecies, setSelectedSpecies] = useState<PokemonSpeciesData>(POKEMON_SPECIES_LIST[0]);
  const [filterState, setFilterState] = useState<'ALL' | 'CAUGHT' | 'SEEN'>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<number | 'ALL'>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'NUM_ASC' | 'NUM_DESC' | 'NAME' | 'BST'>('NUM_ASC');

  // Filtered & Sorted Pokémon list
  const filteredList = useMemo(() => {
    return POKEMON_SPECIES_LIST.filter((species) => {
      const isCaught = pokedexCaught.includes(species.id);
      const isSeen = pokedexSeen.includes(species.id) || isCaught;

      // Status filter
      if (filterState === 'CAUGHT' && !isCaught) return false;
      if (filterState === 'SEEN' && !isSeen) return false;

      // Region filter
      if (selectedRegion !== 'ALL' && species.generation !== selectedRegion) return false;

      // Type filter
      if (selectedType !== 'ALL' && species.primaryType !== selectedType && species.secondaryType !== selectedType) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = species.name.toLowerCase().includes(query);
        const matchesNum = String(species.nationalDexNumber).includes(query);
        if (!matchesName && !matchesNum) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'NUM_ASC') return a.nationalDexNumber - b.nationalDexNumber;
      if (sortBy === 'NUM_DESC') return b.nationalDexNumber - a.nationalDexNumber;
      if (sortBy === 'NAME') return a.name.localeCompare(b.name);
      if (sortBy === 'BST') return (b.baseStats.baseStatTotal || 0) - (a.baseStats.baseStatTotal || 0);
      return 0;
    });
  }, [filterState, selectedRegion, selectedType, searchQuery, sortBy, pokedexCaught, pokedexSeen]);

  const totalCount = POKEMON_SPECIES_LIST.length;
  const caughtCount = pokedexCaught.length;
  const seenCount = pokedexSeen.length;

  const isCaught = pokedexCaught.includes(selectedSpecies.id);
  const isSeen = pokedexSeen.includes(selectedSpecies.id) || isCaught;

  const primaryTheme = POKEMON_TYPE_THEMES[selectedSpecies.primaryType] || POKEMON_TYPE_THEMES.Normal;
  const secondaryTheme = selectedSpecies.secondaryType ? POKEMON_TYPE_THEMES[selectedSpecies.secondaryType] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-4xl h-[92vh] max-h-[700px] overflow-hidden rounded-3xl bg-slate-900 border border-white/20 shadow-2xl flex flex-col md:flex-row">
        
        {/* LEFT COLUMN: Search, Filters & Pokémon Grid */}
        <div className="w-full md:w-1/2 p-3 sm:p-4 border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between overflow-hidden">
          <div className="space-y-2.5 flex-1 flex flex-col overflow-hidden">
            {/* Header & Progress Stats */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-white font-black text-sm sm:text-base">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <span>National Pokédex</span>
              </div>

              {/* Discovery Stats Bar */}
              <div className="flex items-center gap-2 text-[11px] font-bold">
                <span className="text-cyan-400">Seen: {seenCount}/{totalCount}</span>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-400">Caught: {caughtCount}/{totalCount}</span>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or #number..."
                className="w-full py-2 pl-9 pr-3 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            {/* Filter Pills & Sort Selectors */}
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <button
                onClick={() => setFilterState('ALL')}
                className={`px-2.5 py-1 rounded-full font-bold transition ${filterState === 'ALL' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterState('CAUGHT')}
                className={`px-2.5 py-1 rounded-full font-bold transition ${filterState === 'CAUGHT' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}
              >
                Caught ({caughtCount})
              </button>
              <button
                onClick={() => setFilterState('SEEN')}
                className={`px-2.5 py-1 rounded-full font-bold transition ${filterState === 'SEEN' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}
              >
                Seen ({seenCount})
              </button>

              {/* Sort By Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="ml-auto bg-slate-800 text-slate-300 rounded-full px-2 py-0.5 border border-white/10 text-[10px] font-bold focus:outline-none"
              >
                <option value="NUM_ASC"># Number (Low-High)</option>
                <option value="NUM_DESC"># Number (High-Low)</option>
                <option value="NAME">Name (A-Z)</option>
                <option value="BST">Stats (Highest BST)</option>
              </select>
            </div>

            {/* Scrollable Pokémon List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {filteredList.map((species) => {
                const caught = pokedexCaught.includes(species.id);
                const seen = pokedexSeen.includes(species.id) || caught;
                const isSelected = selectedSpecies.id === species.id;

                return (
                  <button
                    key={species.id}
                    onClick={() => setSelectedSpecies(species)}
                    className={`w-full p-2 rounded-2xl border text-left flex items-center justify-between transition active:scale-95 ${
                      isSelected
                        ? 'bg-emerald-950/50 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                        : 'bg-slate-950/50 hover:bg-slate-800/80 border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs text-slate-400 font-bold">
                        #{String(species.nationalDexNumber).padStart(3, '0')}
                      </span>
                      <span className="font-extrabold text-xs text-white">
                        {seen ? species.name : '???'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {seen && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-slate-800 text-slate-300">
                          {species.primaryType}
                        </span>
                      )}

                      {caught ? (
                        <span className="flex items-center gap-0.5 text-[9px] text-emerald-400 font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                          <CheckCircle className="w-2.5 h-2.5" /> Caught
                        </span>
                      ) : seen ? (
                        <span className="flex items-center gap-0.5 text-[9px] text-cyan-400 font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                          <Eye className="w-2.5 h-2.5" /> Seen
                        </span>
                      ) : (
                        <span className="text-[9px] text-slate-500 font-mono">Unseen</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Detail Info Card */}
        <div className="w-full md:w-1/2 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto bg-slate-950/75">
          <div className="space-y-3.5">
            {/* Top Bar with Close Button */}
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-xs text-slate-400 font-bold block">
                  #{String(selectedSpecies.nationalDexNumber).padStart(4, '0')}
                </span>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                  {isSeen ? selectedSpecies.name : 'Unknown Pokémon'}
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  {isSeen ? `${selectedSpecies.speciesCategory} • Gen ${selectedSpecies.generation}` : 'Undiscovered Species'}
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isSeen ? (
              <>
                {/* Typing Badges */}
                <div className="flex gap-2">
                  <span className={`px-3 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r ${primaryTheme.badgeGradient} ${primaryTheme.textColor}`}>
                    {selectedSpecies.primaryType}
                  </span>
                  {selectedSpecies.secondaryType && secondaryTheme && (
                    <span className={`px-3 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r ${secondaryTheme.badgeGradient} ${secondaryTheme.textColor}`}>
                      {selectedSpecies.secondaryType}
                    </span>
                  )}
                </div>

                {/* Biology & Habitat Metrics */}
                <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-2.5 rounded-2xl border border-white/5 text-xs text-center">
                  <div>
                    <span className="text-slate-400 text-[9px] font-semibold block uppercase">HEIGHT</span>
                    <span className="font-bold text-slate-200">{selectedSpecies.heightMeters} m</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[9px] font-semibold block uppercase">WEIGHT</span>
                    <span className="font-bold text-slate-200">{selectedSpecies.weightKg} kg</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[9px] font-semibold block uppercase">HABITAT</span>
                    <span className="font-bold text-emerald-400">{selectedSpecies.canonicalHabitat}</span>
                  </div>
                </div>

                {/* Pokédex Entry */}
                <p className="text-xs text-slate-300 italic leading-relaxed bg-slate-900/50 p-3 rounded-2xl border border-white/5">
                  "{selectedSpecies.pokedexEntry}"
                </p>

                {/* Ability Details */}
                <div className="bg-slate-900/80 p-2.5 rounded-2xl border border-white/5 text-xs">
                  <span className="text-slate-400 text-[9px] font-semibold block uppercase mb-0.5">ABILITY</span>
                  <span className="font-bold text-white block">{selectedSpecies.abilities[0]?.name}</span>
                  <span className="text-[11px] text-slate-300">{selectedSpecies.abilities[0]?.description}</span>
                </div>

                {/* Base Stats Breakdown */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span>Base Stats</span>
                    <span className="text-cyan-300 font-mono">BST: {selectedSpecies.baseStats.baseStatTotal}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                    <div className="bg-slate-900 p-1.5 rounded-xl border border-white/5">
                      <span className="text-[9px] text-slate-400 block">HP</span>
                      <span className="font-bold text-emerald-400">{selectedSpecies.baseStats.hp}</span>
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded-xl border border-white/5">
                      <span className="text-[9px] text-slate-400 block">ATK</span>
                      <span className="font-bold text-amber-400">{selectedSpecies.baseStats.attack}</span>
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded-xl border border-white/5">
                      <span className="text-[9px] text-slate-400 block">DEF</span>
                      <span className="font-bold text-sky-400">{selectedSpecies.baseStats.defense}</span>
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded-xl border border-white/5">
                      <span className="text-[9px] text-slate-400 block">SP.ATK</span>
                      <span className="font-bold text-purple-400">{selectedSpecies.baseStats.specialAttack}</span>
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded-xl border border-white/5">
                      <span className="text-[9px] text-slate-400 block">SP.DEF</span>
                      <span className="font-bold text-indigo-400">{selectedSpecies.baseStats.specialDefense}</span>
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded-xl border border-white/5">
                      <span className="text-[9px] text-slate-400 block">SPEED</span>
                      <span className="font-bold text-cyan-400">{selectedSpecies.baseStats.speed}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <Sparkles className="w-8 h-8 mx-auto opacity-30" />
                <p className="text-xs font-semibold">Encounter this Pokémon in the wild to reveal its Pokédex entry and statistics.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
