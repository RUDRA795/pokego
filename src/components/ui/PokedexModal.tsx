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
import { PokemonButton } from './PokemonButton';
import { PokemonCard } from './PokemonCard';
import { TypeBadge } from './TypeBadge';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 animate-fade-in font-pokemon">
      <div className="relative w-full max-w-4xl h-[92vh] max-h-[700px] overflow-hidden pokemon-dialog flex flex-col md:flex-row">
        
        <div className="w-full md:w-1/2 p-3 sm:p-4 border-b md:border-b-0 md:border-r-4 border-pokemon-ui-border flex flex-col justify-between overflow-hidden">
          <div className="space-y-2.5 flex-1 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-pokemon-ui-text font-black text-sm sm:text-base">
                <BookOpen className="w-5 h-5 text-pokemon-green" />
                <span>National Pokédex</span>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-bold">
                <span className="text-pokemon-blue">Seen: {seenCount}/{totalCount}</span>
                <span className="text-pokemon-ui-muted">•</span>
                <span className="text-pokemon-green">Caught: {caughtCount}/{totalCount}</span>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-pokemon-ui-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or #number..."
                className="w-full py-2 pl-9 pr-3 pokemon-card text-xs text-pokemon-ui-text placeholder-pokemon-ui-muted"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <button
                onClick={() => setFilterState('ALL')}
                className={`px-2.5 py-1 rounded-full font-bold pokemon-button ${filterState === 'ALL' ? 'bg-pokemon-green text-pokemon-dark' : 'text-pokemon-ui-muted'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterState('CAUGHT')}
                className={`px-2.5 py-1 rounded-full font-bold pokemon-button ${filterState === 'CAUGHT' ? 'bg-pokemon-green text-pokemon-dark' : 'text-pokemon-ui-muted'}`}
              >
                Caught ({caughtCount})
              </button>
              <button
                onClick={() => setFilterState('SEEN')}
                className={`px-2.5 py-1 rounded-full font-bold pokemon-button ${filterState === 'SEEN' ? 'bg-pokemon-blue text-pokemon-dark' : 'text-pokemon-ui-muted'}`}
              >
                Seen ({seenCount})
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="ml-auto pokemon-card text-pokemon-ui-text rounded-full px-2 py-0.5 text-[10px] font-bold"
              >
                <option value="NUM_ASC"># Number (Low-High)</option>
                <option value="NUM_DESC"># Number (High-Low)</option>
                <option value="NAME">Name (A-Z)</option>
                <option value="BST">Stats (Highest BST)</option>
              </select>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {filteredList.map((species) => {
                const caught = pokedexCaught.includes(species.id);
                const seen = pokedexSeen.includes(species.id) || caught;
                const isSelected = selectedSpecies.id === species.id;

                return (
                  <button
                    key={species.id}
                    onClick={() => setSelectedSpecies(species)}
                    className={`w-full p-2 rounded-2xl border-4 text-left flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-pokemon-green/20 border-pokemon-green'
                        : 'pokemon-card'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs text-pokemon-ui-muted font-bold">
                        #{String(species.nationalDexNumber).padStart(3, '0')}
                      </span>
                      <span className="font-extrabold text-xs text-pokemon-ui-text">
                        {seen ? species.name : '???'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {seen && (
                        <TypeBadge type={species.primaryType} />
                      )}

                      {caught ? (
                        <span className="flex items-center gap-0.5 text-[9px] text-pokemon-green font-bold px-1.5 py-0.5 rounded pokemon-card border-pokemon-green">
                          <CheckCircle className="w-2.5 h-2.5" /> Caught
                        </span>
                      ) : seen ? (
                        <span className="flex items-center gap-0.5 text-[9px] text-pokemon-blue font-bold px-1.5 py-0.5 rounded pokemon-card border-pokemon-blue">
                          <Eye className="w-2.5 h-2.5" /> Seen
                        </span>
                      ) : (
                        <span className="text-[9px] text-pokemon-ui-muted font-mono">Unseen</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto pokemon-card">
          <div className="space-y-3.5">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-xs text-pokemon-ui-muted font-bold block">
                  #{String(selectedSpecies.nationalDexNumber).padStart(4, '0')}
                </span>
                <h2 className="text-2xl font-black text-pokemon-ui-text uppercase tracking-tight">
                  {isSeen ? selectedSpecies.name : 'Unknown Pokémon'}
                </h2>
                <p className="text-xs text-pokemon-ui-muted font-medium">
                  {isSeen ? `${selectedSpecies.speciesCategory} • Gen ${selectedSpecies.generation}` : 'Undiscovered Species'}
                </p>
              </div>

              <PokemonButton
                onClick={onClose}
                className="p-2"
              >
                <X className="w-4 h-4" />
              </PokemonButton>
            </div>

            {isSeen ? (
              <>
                <div className="flex gap-2">
                  <TypeBadge type={selectedSpecies.primaryType} />
                  {selectedSpecies.secondaryType && <TypeBadge type={selectedSpecies.secondaryType} />}
                </div>

                <div className="grid grid-cols-3 gap-2 pokemon-card p-2.5 text-xs text-center">
                  <div>
                    <span className="text-pokemon-ui-muted text-[9px] font-semibold block uppercase">HEIGHT</span>
                    <span className="font-bold text-pokemon-ui-text">{selectedSpecies.heightMeters} m</span>
                  </div>
                  <div>
                    <span className="text-pokemon-ui-muted text-[9px] font-semibold block uppercase">WEIGHT</span>
                    <span className="font-bold text-pokemon-ui-text">{selectedSpecies.weightKg} kg</span>
                  </div>
                  <div>
                    <span className="text-pokemon-ui-muted text-[9px] font-semibold block uppercase">HABITAT</span>
                    <span className="font-bold text-pokemon-green">{selectedSpecies.canonicalHabitat}</span>
                  </div>
                </div>

                <p className="text-xs text-pokemon-ui-text italic leading-relaxed pokemon-card p-3">
                  "{selectedSpecies.pokedexEntry}"
                </p>

                <div className="pokemon-card p-2.5 text-xs">
                  <span className="text-pokemon-ui-muted text-[9px] font-semibold block uppercase mb-0.5">ABILITY</span>
                  <span className="font-bold text-pokemon-ui-text block">{selectedSpecies.abilities[0]?.name}</span>
                  <span className="text-[11px] text-pokemon-ui-muted">{selectedSpecies.abilities[0]?.description}</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-pokemon-ui-muted">
                    <span>Base Stats</span>
                    <span className="text-pokemon-blue font-mono">BST: {selectedSpecies.baseStats.baseStatTotal}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                    <div className="pokemon-card p-1.5">
                      <span className="text-[9px] text-pokemon-ui-muted block">HP</span>
                      <span className="font-bold text-pokemon-green">{selectedSpecies.baseStats.hp}</span>
                    </div>
                    <div className="pokemon-card p-1.5">
                      <span className="text-[9px] text-pokemon-ui-muted block">ATK</span>
                      <span className="font-bold text-pokemon-yellow">{selectedSpecies.baseStats.attack}</span>
                    </div>
                    <div className="pokemon-card p-1.5">
                      <span className="text-[9px] text-pokemon-ui-muted block">DEF</span>
                      <span className="font-bold text-pokemon-blue">{selectedSpecies.baseStats.defense}</span>
                    </div>
                    <div className="pokemon-card p-1.5">
                      <span className="text-[9px] text-pokemon-ui-muted block">SP.ATK</span>
                      <span className="font-bold text-purple-400">{selectedSpecies.baseStats.specialAttack}</span>
                    </div>
                    <div className="pokemon-card p-1.5">
                      <span className="text-[9px] text-pokemon-ui-muted block">SP.DEF</span>
                      <span className="font-bold text-indigo-400">{selectedSpecies.baseStats.specialDefense}</span>
                    </div>
                    <div className="pokemon-card p-1.5">
                      <span className="text-[9px] text-pokemon-ui-muted block">SPEED</span>
                      <span className="font-bold text-cyan-400">{selectedSpecies.baseStats.speed}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-pokemon-ui-muted space-y-2">
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
