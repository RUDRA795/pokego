/**
 * Pokémon 3D RPG — Authentic Pokémon GO Pokédex Screen
 */

import React, { useState, useMemo } from 'react';
import nationalDexList from '../../data/pokemon/national_dex_1025.json';
import { POKEMON_SPECIES_DATABASE } from '../../data/pokemon/species';
import { getPokemonAnimated, getPokemonAnimatedShiny, getPokemonArtwork, getPokemonIcon } from '../../data/pokemon/images';
import { POKEMON_TYPE_THEMES } from '../../data/pokemon/types';
import { usePlayerPartyStore } from '../../state/usePlayerPartyStore';
import { X, Search, Sparkles, Star, ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';

interface PokedexScreenProps {
  onClose: () => void;
}

export const PoGoPokedexScreen: React.FC<PokedexScreenProps> = ({
  onClose,
}) => {
  const { pokedexSeen, pokedexCaught } = usePlayerPartyStore();

  const [selectedDex, setSelectedDex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isShiny, setIsShiny] = useState<boolean>(false);
  const [rotationAngle, setRotationAngle] = useState<number>(0);

  const dexItems = nationalDexList as any[];

  const filtered = useMemo(() => {
    return dexItems.filter((p) => {
      return (
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(p.dex).includes(searchTerm)
      );
    });
  }, [dexItems, searchTerm]);

  const currentEntry = selectedDex ? dexItems.find((p) => p.dex === selectedDex) : null;
  const detailedSpecies = currentEntry ? POKEMON_SPECIES_DATABASE[currentEntry.id] : null;

  return (
    <div className="fixed inset-0 z-[900] bg-slate-950 flex flex-col justify-between p-4 md:p-6 select-none animate-fade">
      {/* Header with Seen/Caught Counters */}
      <div className="max-w-md w-full mx-auto space-y-3 z-10">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-rose-400 tracking-wider">
              National Pokédex
            </span>
            <div className="flex items-center gap-3 text-xs font-black text-white">
              <span>Seen: <b className="text-emerald-400">{pokedexSeen.length}</b></span>
              <span className="text-slate-600">•</span>
              <span>Caught: <b className="text-cyan-400">{pokedexCaught.length}</b></span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-900 hover:bg-slate-800 border border-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        {!selectedDex && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search 1,025 Pokémon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-full pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>
        )}
      </div>

      {/* POKÉDEX GRID */}
      {!selectedDex && (
        <div className="max-w-md w-full mx-auto flex-1 overflow-y-auto my-3 pr-1">
          <div className="grid grid-cols-4 gap-2">
            {filtered.map((p) => {
              const isSeen = true; // Full unlocked dex
              return (
                <div
                  key={p.dex}
                  onClick={() => setSelectedDex(p.dex)}
                  className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/50 rounded-2xl p-2 flex flex-col items-center justify-between cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-md group"
                >
                  <span className="text-[9px] font-mono text-slate-500">
                    #{String(p.dex).padStart(4, '0')}
                  </span>
                  <img
                    src={getPokemonIcon(p.dex)}
                    alt={p.name}
                    className="w-12 h-12 object-contain drop-shadow my-1"
                  />
                  <span className="text-[10px] font-bold text-white truncate max-w-[70px]">
                    {p.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* POKÉDEX ENTRY INSPECTION SHEET */}
      {selectedDex && currentEntry && (
        <div className="max-w-md w-full mx-auto flex-1 overflow-y-auto my-2 space-y-4 pr-1 animate-fade">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl relative">
            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  setSelectedDex(null);
                  setIsShiny(false);
                }}
                className="text-xs font-black text-slate-400 hover:text-white"
              >
                ← Back to Pokédex
              </button>
              <div className="text-xs font-mono font-bold text-rose-400">
                #{String(currentEntry.dex).padStart(4, '0')}
              </div>
            </div>

            {/* Name & Shiny Switcher */}
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-3xl font-black text-white">{currentEntry.name}</h2>
                <button
                  onClick={() => setIsShiny(!isShiny)}
                  className={`p-1.5 rounded-full border text-xs transition ${
                    isShiny
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                  title="Toggle Shiny"
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
              {detailedSpecies && (
                <p className="text-xs text-slate-400 italic">{detailedSpecies.speciesCategory}</p>
              )}
            </div>

            {/* 3D Animated Hero Preview */}
            <div className="flex flex-col items-center justify-center py-2 relative">
              <div className="absolute w-44 h-44 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />
              <img
                src={
                  isShiny
                    ? getPokemonAnimatedShiny(currentEntry.dex)
                    : getPokemonAnimated(currentEntry.dex)
                }
                alt={currentEntry.name}
                className="w-48 h-48 object-contain drop-shadow-2xl animate-float"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getPokemonArtwork(currentEntry.dex);
                }}
              />
            </div>

            {/* Type Badges */}
            {detailedSpecies && (
              <div className="flex items-center justify-center gap-2">
                <span
                  className="px-3.5 py-1 rounded-xl text-xs font-black uppercase text-white shadow-md"
                  style={{
                    backgroundColor:
                      POKEMON_TYPE_THEMES[detailedSpecies.primaryType]?.primaryColor || '#10b981',
                  }}
                >
                  {detailedSpecies.primaryType}
                </span>
                {detailedSpecies.secondaryType && (
                  <span
                    className="px-3.5 py-1 rounded-xl text-xs font-black uppercase text-white shadow-md"
                    style={{
                      backgroundColor:
                        POKEMON_TYPE_THEMES[detailedSpecies.secondaryType]?.primaryColor || '#0284c7',
                    }}
                  >
                    {detailedSpecies.secondaryType}
                  </span>
                )}
              </div>
            )}

            {/* Lore Entry */}
            {detailedSpecies && (
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs space-y-2">
                <p className="text-slate-300 italic">"{detailedSpecies.pokedexEntry}"</p>
                <div className="flex justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-900">
                  <span>Height: <b className="text-white">{detailedSpecies.heightMeters} m</b></span>
                  <span>Weight: <b className="text-white">{detailedSpecies.weightKg} kg</b></span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Close */}
      {!selectedDex && (
        <div className="max-w-md w-full mx-auto flex justify-center pt-2">
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-slate-900 hover:bg-slate-800 border border-white/20 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
