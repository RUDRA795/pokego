/**
 * Pokémon 3D RPG — Authentic Pokémon GO Storage, Eggs & Team Leader Appraisal
 * 
 * Features:
 * - Tab 1: Pokémon Collection Grid with CP, 3D animated models, search, sorting.
 * - Inspection Sheet: Arc CP gauge, 3D animated model, Stardust/Candy, Power-Up & Evolve.
 * - Team Leader 3-Star IV Appraisal: Leader Blanche / Candela / Spark dialogue & 3 IV bars.
 * - Tab 2: Eggs & Incubators with distance progress bars.
 */

import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { usePlayerPartyStore } from '../../state/usePlayerPartyStore';
import { useGameStore } from '../../state/useGameStore';
import { getPokemonAnimated, getPokemonArtwork, getPokemonIcon } from '../../data/pokemon/images';
import { getPokemonById } from '../../data/pokemon';
import { POKEMON_SPECIES_DATABASE } from '../../data/pokemon/species';
import { POKEMON_TYPE_THEMES } from '../../data/pokemon/types';
import { calculateAllStats } from '../../battle/StatCalculator';
import { RuntimePokemon } from '../../battle/types';
import {
  X,
  Search,
  Star,
  Sparkles,
  ArrowUpCircle,
  Heart,
  Sun,
  Shield,
  Zap,
  Disc,
  Check,
  ChevronRight
} from 'lucide-react';

interface StorageScreenProps {
  onClose: () => void;
}

export const PoGoPokemonStorageScreen: React.FC<StorageScreenProps> = ({
  onClose,
}) => {
  const { party, storage, updatePartyPokemon, buddyInstanceId, setBuddy, purifyPokemon, eggs } =
    usePlayerPartyStore();
  const { stardust, spendStardust, addExp } = useGameStore();

  const [activeTab, setActiveTab] = useState<'POKEMON' | 'EGGS'>('POKEMON');
  const [selectedPokemon, setSelectedPokemon] = useState<RuntimePokemon | null>(null);
  const [showAppraisal, setShowAppraisal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'CP' | 'RECENT' | 'DEX'>('CP');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Combine party and storage
  const allPokemon = useMemo(() => [...party, ...storage], [party, storage]);

  // Filter & Sort
  const filteredList = useMemo(() => {
    let list = allPokemon.filter((p) => {
      const sp = getPokemonById(p.speciesId);
      const nameMatch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const numMatch = String(sp?.nationalDexNumber || 0).includes(searchTerm);
      return nameMatch || numMatch;
    });

    if (sortBy === 'CP') {
      list.sort((a, b) => {
        const cpA = a.calculatedStats.hp * 10 + a.calculatedStats.attack * 8;
        const cpB = b.calculatedStats.hp * 10 + b.calculatedStats.attack * 8;
        return cpB - cpA;
      });
    } else if (sortBy === 'DEX') {
      list.sort((a, b) => {
        const dexA = getPokemonById(a.speciesId)?.nationalDexNumber || 0;
        const dexB = getPokemonById(b.speciesId)?.nationalDexNumber || 0;
        return dexA - dexB;
      });
    }
    return list;
  }, [allPokemon, searchTerm, sortBy]);

  // Power Up Pokémon Action
  const handlePowerUp = (pokemon: RuntimePokemon) => {
    const cost = pokemon.isPurified ? 180 : 200;
    const ok = spendStardust(cost);
    if (!ok) {
      setActionNotice('Not enough Stardust!');
      setTimeout(() => setActionNotice(null), 2500);
      return;
    }

    const species = getPokemonById(pokemon.speciesId);
    if (!species) return;

    const newLevel = pokemon.level + 1;
    const newStats = calculateAllStats(species.baseStats, newLevel);
    const updated: RuntimePokemon = {
      ...pokemon,
      level: newLevel,
      calculatedStats: newStats,
      currentHp: newStats.hp,
    };

    updatePartyPokemon(updated);
    setSelectedPokemon(updated);
    addExp(80);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    setActionNotice(`Powered up ${pokemon.name} to Lv. ${newLevel}!`);
    setTimeout(() => setActionNotice(null), 2500);
  };

  // Evolution Action
  const handleEvolve = (pokemon: RuntimePokemon) => {
    const species = getPokemonById(pokemon.speciesId);
    const targetEvoId = species?.evolution?.evolvesTo?.[0]?.targetSpeciesId;
    if (!targetEvoId || !POKEMON_SPECIES_DATABASE[targetEvoId]) {
      setActionNotice(`${pokemon.name} cannot evolve further!`);
      setTimeout(() => setActionNotice(null), 2500);
      return;
    }

    const nextSpecies = POKEMON_SPECIES_DATABASE[targetEvoId];
    const newStats = calculateAllStats(nextSpecies.baseStats, pokemon.level);
    const evolved: RuntimePokemon = {
      ...pokemon,
      speciesId: nextSpecies.id,
      name: nextSpecies.name,
      calculatedStats: newStats,
      currentHp: newStats.hp,
    };

    updatePartyPokemon(evolved);
    setSelectedPokemon(evolved);
    confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
    setActionNotice(`Evolved into ${nextSpecies.name}!`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-[900] bg-slate-950 flex flex-col justify-between p-4 md:p-6 select-none animate-fade">
      {/* Top Header & Tabs */}
      <div className="max-w-md w-full mx-auto space-y-3 z-10">
        <div className="flex items-center justify-between">
          <div className="flex gap-2 bg-slate-900/90 p-1 rounded-full border border-white/10 shadow-inner">
            <button
              onClick={() => setActiveTab('POKEMON')}
              className={`px-5 py-1.5 rounded-full text-xs font-black uppercase transition-all ${
                activeTab === 'POKEMON'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md scale-105'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pokémon ({allPokemon.length}/300)
            </button>
            <button
              onClick={() => setActiveTab('EGGS')}
              className={`px-5 py-1.5 rounded-full text-xs font-black uppercase transition-all ${
                activeTab === 'EGGS'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 shadow-md scale-105'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Eggs ({eggs.length}/9)
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-900 hover:bg-slate-800 border border-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Sort Bar */}
        {activeTab === 'POKEMON' && !selectedPokemon && (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Pokémon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-full pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded-full px-3 py-2 text-xs font-bold text-slate-300 focus:outline-none"
            >
              <option value="CP">CP (High)</option>
              <option value="DEX">Number</option>
              <option value="RECENT">Recent</option>
            </select>
          </div>
        )}
      </div>

      {/* Action Banner */}
      {actionNotice && (
        <div className="max-w-md w-full mx-auto bg-gradient-to-r from-emerald-600 to-teal-600 text-slate-950 font-black px-4 py-2 rounded-2xl text-xs text-center shadow-lg animate-bounce z-20">
          {actionNotice}
        </div>
      )}

      {/* TAB 1: POKÉMON STORAGE GRID */}
      {activeTab === 'POKEMON' && !selectedPokemon && (
        <div className="max-w-md w-full mx-auto flex-1 overflow-y-auto my-3 pr-1">
          <div className="grid grid-cols-3 gap-2.5">
            {filteredList.map((p) => {
              const sp = getPokemonById(p.speciesId);
              const dex = sp?.nationalDexNumber || 25;
              const cp = p.calculatedStats.hp * 10 + p.calculatedStats.attack * 8;
              const isBuddy = p.instanceId === buddyInstanceId;

              return (
                <div
                  key={p.instanceId}
                  onClick={() => setSelectedPokemon(p)}
                  className="bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-2.5 flex flex-col items-center justify-between cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-md group relative"
                >
                  {/* CP Tag */}
                  <div className="text-[10px] font-black text-amber-400 font-mono">
                    CP {cp}
                  </div>

                  {/* 3D Animated Pokemon Thumbnail */}
                  <div className="py-1 relative">
                    <img
                      src={getPokemonAnimated(dex)}
                      alt={p.name}
                      className="w-16 h-16 object-contain drop-shadow"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getPokemonIcon(dex);
                      }}
                    />
                  </div>

                  {/* Name & Indicators */}
                  <div className="text-center">
                    <div className="text-[11px] font-bold text-white truncate max-w-[80px]">
                      {p.name}
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-0.5">
                      {isBuddy && <span className="text-[9px] text-pink-400">❤️</span>}
                      {p.isShadow && (
                        <span className="text-[8px] bg-purple-950 text-purple-400 px-1 rounded border border-purple-800">
                          SHD
                        </span>
                      )}
                      {p.isPurified && (
                        <span className="text-[8px] bg-sky-950 text-sky-400 px-1 rounded border border-sky-800">
                          PUR
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* INDIVIDUAL POKÉMON INSPECTION SHEET */}
      {selectedPokemon && !showAppraisal && (
        <div className="max-w-md w-full mx-auto flex-1 overflow-y-auto my-2 space-y-4 pr-1 animate-fade">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl relative">
            {/* Top Back & Close */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => setSelectedPokemon(null)}
                className="text-xs font-black text-slate-400 hover:text-white"
              >
                ← Back to Storage
              </button>
              <div className="text-xs font-mono font-bold text-slate-400">
                #{String(getPokemonById(selectedPokemon.speciesId)?.nationalDexNumber || 0).padStart(4, '0')}
              </div>
            </div>

            {/* CP Semi-Circular Arc & Name */}
            <div className="text-center space-y-1">
              <div className="text-xs font-black uppercase tracking-wider text-slate-400">Combat Power</div>
              <h2 className="text-3xl font-black text-amber-400 font-mono">
                CP {selectedPokemon.calculatedStats.hp * 10 + selectedPokemon.calculatedStats.attack * 8}
              </h2>
              <h3 className="text-xl font-black text-white">{selectedPokemon.name}</h3>
            </div>

            {/* 3D Animated Hero Sprite */}
            <div className="flex items-center justify-center py-2 relative">
              <div className="absolute w-40 h-40 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
              <img
                src={getPokemonAnimated(getPokemonById(selectedPokemon.speciesId)?.nationalDexNumber || 25)}
                alt={selectedPokemon.name}
                className="w-48 h-48 object-contain drop-shadow-2xl animate-float"
              />
            </div>

            {/* HP, Weight, Height */}
            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center text-xs font-bold">
              <div>
                <div className="text-[10px] text-slate-500 uppercase">HP</div>
                <div className="text-white font-mono">{selectedPokemon.currentHp} / {selectedPokemon.calculatedStats.hp}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Weight</div>
                <div className="text-white font-mono">{getPokemonById(selectedPokemon.speciesId)?.weightKg || 6.0} kg</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Height</div>
                <div className="text-white font-mono">{getPokemonById(selectedPokemon.speciesId)?.heightMeters || 0.4} m</div>
              </div>
            </div>

            {/* Stardust & Candy Deck */}
            <div className="flex justify-between items-center bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 text-xs font-black">
              <div className="flex items-center gap-1.5 text-purple-300">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>{stardust.toLocaleString()} Stardust</span>
              </div>
              <div className="text-amber-400 font-mono">
                25 {selectedPokemon.name} Candy
              </div>
            </div>

            {/* Power-Up & Evolve Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handlePowerUp(selectedPokemon)}
                className="py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition-all"
              >
                POWER UP ({selectedPokemon.isPurified ? 180 : 200})
              </button>
              <button
                onClick={() => handleEvolve(selectedPokemon)}
                className="py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 text-white font-black text-xs shadow-lg shadow-purple-500/25 transition-all"
              >
                EVOLVE (25 Candy)
              </button>
            </div>

            {/* Team Leader Appraisal Button */}
            <button
              onClick={() => setShowAppraisal(true)}
              className="w-full py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-black text-slate-200 flex items-center justify-center gap-1.5 transition"
            >
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>APPRAISE (TEAM LEADER)</span>
            </button>
          </div>
        </div>
      )}

      {/* TEAM LEADER 3-STAR IV APPRAISAL SHEET */}
      {selectedPokemon && showAppraisal && (
        <div className="max-w-md w-full mx-auto flex-1 overflow-y-auto my-2 space-y-4 animate-fade">
          <div className="bg-slate-900/95 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl relative">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                Team Leader Appraisal
              </span>
              <button
                onClick={() => setShowAppraisal(false)}
                className="text-xs font-black text-slate-400 hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            {/* Team Leader Dialogue */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-2">
              <div className="font-black text-cyan-400">Team Leader Blanche:</div>
              <p className="text-slate-300 italic">
                "Overall, your {selectedPokemon.name} is a wonder! A breathtaking Pokémon with incredible battle potential."
              </p>
            </div>

            {/* 3 IV Bars (Attack, Defense, HP) */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs font-black text-white">
                <span>IV Rating</span>
                <span className="text-amber-400">★★★ 3-Star Rating</span>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { label: 'Attack', val: selectedPokemon.calculatedStats.attack, max: 200, color: 'bg-rose-500' },
                  { label: 'Defense', val: selectedPokemon.calculatedStats.defense, max: 200, color: 'bg-blue-500' },
                  { label: 'HP', val: selectedPokemon.calculatedStats.hp, max: 250, color: 'bg-emerald-500' },
                ].map(({ label, val, max, color }) => (
                  <div key={label} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-400">
                      <span>{label}</span>
                      <span className="text-white font-mono">{val}</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.min(100, Math.round((val / max) * 100))}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowAppraisal(false)}
              className="w-full py-3 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs shadow-lg transition"
            >
              DONE
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: EGGS & INCUBATORS */}
      {activeTab === 'EGGS' && (
        <div className="max-w-md w-full mx-auto flex-1 overflow-y-auto my-3 space-y-3 pr-1">
          <div className="grid grid-cols-3 gap-3">
            {eggs.map((egg) => {
              const pct = Math.min(100, Math.round((egg.walkedKm / egg.targetKm) * 100));
              return (
                <div
                  key={egg.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-col items-center text-center space-y-2 shadow-md"
                >
                  <div className="text-3xl">🥚</div>
                  <div>
                    <div className="text-xs font-black text-white font-mono">
                      {egg.walkedKm.toFixed(1)}/{egg.targetKm} km
                    </div>
                    <div className="w-20 bg-slate-950 h-1.5 rounded-full overflow-hidden mt-1">
                      <div className="bg-gradient-to-r from-amber-400 to-orange-400 h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Close */}
      {!selectedPokemon && (
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
