/**
 * Pokémon Game Engine — Full National Pokédex 1–1025 Console
 * 
 * Features:
 * - Complete 1,025 Canonical Pokémon dataset (Gens 1–9: Kanto to Paldea)
 * - Official High-Res Artwork & Pokémon HOME 3D Model Renders
 * - Real-time Search & Generation / Region Filters
 * - BattleEngine Turn Simulator & 18x18 Type Matrix
 * - Multi-driver Save System (v3.0.0)
 */

import React, { useState, useMemo } from 'react';
import nationalDexList from './data/pokemon/national_dex_1025.json';
import { POKEMON_SPECIES_DATABASE } from './data/pokemon/species';
import { POKEMON_MOVES } from './data/pokemon/moves';
import { calculateDamage } from './battle/DamageCalculator';
import { createRuntimePokemon } from './battle/RuntimePokemon';
import { getTypeEffectiveness } from './data/pokemon/types';
import { getPokemonArtwork, getPokemonHome3D, getPokemonIcon } from './data/pokemon/images';
import { PokemonType } from './types/pokemon';

interface DexEntry {
  dex: number;
  id: string;
  name: string;
  artworkUrl: string;
  homeUrl: string;
  iconUrl: string;
}

const REGIONS = [
  { name: 'All (1–1025)', min: 1, max: 1025 },
  { name: 'Kanto (1–151)', min: 1, max: 151 },
  { name: 'Johto (152–251)', min: 152, max: 251 },
  { name: 'Hoenn (252–386)', min: 252, max: 386 },
  { name: 'Sinnoh (387–493)', min: 387, max: 493 },
  { name: 'Unova (494–649)', min: 494, max: 649 },
  { name: 'Kalos (650–721)', min: 650, max: 721 },
  { name: 'Alola (722–809)', min: 722, max: 809 },
  { name: 'Galar (810–905)', min: 810, max: 905 },
  { name: 'Paldea (906–1025)', min: 906, max: 1025 },
];

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pokedex' | 'battle' | 'matrix' | 'save'>('pokedex');
  const [selectedDex, setSelectedDex] = useState<number>(25); // Default Pikachu #25
  const [imageMode, setImageMode] = useState<'artwork' | 'home3d'>('artwork');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<number>(0);

  const dexItems = nationalDexList as DexEntry[];

  // Filtered List
  const filteredPokemon = useMemo(() => {
    const region = REGIONS[selectedRegion];
    return dexItems.filter((p) => {
      const inRegion = p.dex >= region.min && p.dex <= region.max;
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || String(p.dex).includes(searchTerm);
      return inRegion && matchesSearch;
    });
  }, [dexItems, selectedRegion, searchTerm]);

  const currentEntry = dexItems.find((p) => p.dex === selectedDex) || dexItems[24];
  const detailedSpecies = POKEMON_SPECIES_DATABASE[currentEntry.id];

  // Battle Simulator State
  const [battleLogs, setBattleLogs] = useState<string[]>([]);
  const runBattleSimulation = () => {
    const pika = createRuntimePokemon(POKEMON_SPECIES_DATABASE.pikachu, 25, false);
    const squirtle = createRuntimePokemon(POKEMON_SPECIES_DATABASE.squirtle, 25, true);

    const logs: string[] = [];
    logs.push(`[Battle Init] ${pika.name} (Lv. ${pika.level}, HP: ${pika.currentHp}) vs Wild ${squirtle.name} (Lv. ${squirtle.level}, HP: ${squirtle.currentHp})`);

    const dmg = calculateDamage({
      attacker: pika,
      attackerSpecies: POKEMON_SPECIES_DATABASE.pikachu,
      defender: squirtle,
      defenderSpecies: POKEMON_SPECIES_DATABASE.squirtle,
      move: POKEMON_MOVES.thunderbolt,
    });

    logs.push(`[Turn 1] ${pika.name} used Thunderbolt! Deals ${dmg.damage} damage (Multiplier: ${dmg.typeMultiplier}x, Critical: ${dmg.isCritical}, STAB: ${dmg.isSTAB})`);
    squirtle.currentHp = Math.max(0, squirtle.currentHp - dmg.damage);
    logs.push(`[Result] Wild ${squirtle.name} HP: ${squirtle.currentHp}/${squirtle.calculatedStats.hp}`);
    if (squirtle.currentHp === 0) logs.push(`[Outcome] Wild ${squirtle.name} fainted! ${pika.name} gained 180 EXP.`);

    setBattleLogs(logs);
  };

  const allTypes: PokemonType[] = [
    'Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice',
    'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug',
    'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-mono p-6">
      {/* Header */}
      <header className="border-b border-slate-800 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-emerald-400">POKÉMON CORE ENGINE</h1>
          <p className="text-xs text-slate-400">Complete National Pokédex (1–1025) & Canonical Real Asset Database</p>
        </div>
        <div className="flex gap-2">
          {(['pokedex', 'battle', 'matrix', 'save'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition ${
                activeTab === tab
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* 1. FULL NATIONAL POKÉDEX (1-1025) */}
      {activeTab === 'pokedex' && (
        <div className="space-y-4">
          {/* Search & Region Filter Bar */}
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="Search by Name or #Number (e.g. Rayquaza, #384)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 flex-1"
            />
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {REGIONS.map((r, idx) => (
                <button
                  key={r.name}
                  onClick={() => setSelectedRegion(idx)}
                  className={`px-3 py-1.5 rounded text-[11px] font-bold whitespace-nowrap transition ${
                    selectedRegion === idx
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {r.name}
                </button>
              ))}
            </div>
          </div>

          {/* Main Grid: Sidebar + Detailed Inspection Stage */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* List of Pokemon */}
            <div className="bg-slate-900 border border-slate-800 rounded p-4 max-h-[75vh] overflow-y-auto space-y-1">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase mb-3">
                <span>Pokédex</span>
                <span className="text-emerald-400">{filteredPokemon.length} Results</span>
              </div>
              {filteredPokemon.map((p) => (
                <button
                  key={`dex-${p.dex}`}
                  onClick={() => setSelectedDex(p.dex)}
                  className={`w-full text-left px-3 py-2 rounded text-xs flex items-center justify-between transition ${
                    selectedDex === p.dex
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={getPokemonIcon(p.dex)}
                      alt={p.name}
                      className="w-7 h-7 object-contain"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                    <span>#{String(p.dex).padStart(4, '0')} {p.name}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Detailed Inspection Stage */}
            <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs text-slate-500">National Pokédex #{String(currentEntry.dex).padStart(4, '0')}</span>
                  <h2 className="text-2xl font-bold text-white">{currentEntry.name}</h2>
                  {detailedSpecies && <p className="text-xs text-slate-400 italic">{detailedSpecies.speciesCategory}</p>}
                </div>
                {detailedSpecies && (
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-slate-800 text-xs font-bold text-emerald-400 border border-slate-700">
                      {detailedSpecies.primaryType}
                    </span>
                    {detailedSpecies.secondaryType && (
                      <span className="px-2.5 py-1 rounded bg-slate-800 text-xs font-bold text-cyan-400 border border-slate-700">
                        {detailedSpecies.secondaryType}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Real Official Image / HOME 3D Render Presentation */}
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center relative min-h-[280px]">
                {/* Image Switcher Toggle */}
                <div className="absolute top-3 right-3 flex gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setImageMode('artwork')}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition ${imageMode === 'artwork' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                  >
                    Official Artwork
                  </button>
                  <button
                    onClick={() => setImageMode('home3d')}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition ${imageMode === 'home3d' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                  >
                    HOME 3D Render
                  </button>
                </div>

                {/* Real Image */}
                <img
                  src={imageMode === 'artwork' ? getPokemonArtwork(currentEntry.dex) : getPokemonHome3D(currentEntry.dex)}
                  alt={currentEntry.name}
                  className="w-56 h-56 object-contain drop-shadow-2xl transition-transform hover:scale-105 duration-300"
                />
              </div>

              {/* Base Stats & Lore if available in local species DB */}
              {detailedSpecies ? (
                <>
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Base Stats (BST: {detailedSpecies.baseStats.baseStatTotal})</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                      {Object.entries(detailedSpecies.baseStats).map(([key, val]) => {
                        if (key === 'baseStatTotal') return null;
                        return (
                          <div key={key} className="bg-slate-950 p-2 rounded border border-slate-800">
                            <div className="text-[10px] text-slate-500 uppercase">{key}</div>
                            <div className="text-sm font-bold text-white">{val}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded border border-slate-800 text-xs space-y-2">
                    <p className="text-slate-300">"{detailedSpecies.pokedexEntry}"</p>
                    <div className="flex gap-6 text-[11px] text-slate-400 pt-2 border-t border-slate-900">
                      <span>Height: <b className="text-slate-200">{detailedSpecies.heightMeters}m</b></span>
                      <span>Weight: <b className="text-slate-200">{detailedSpecies.weightKg}kg</b></span>
                      <span>Catch Rate: <b className="text-slate-200">{detailedSpecies.catchRate}</b></span>
                      <span>Habitat: <b className="text-slate-200">{detailedSpecies.canonicalHabitat}</b></span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-slate-950 p-4 rounded border border-slate-800 text-xs text-slate-400">
                  <p>Canonical Pokédex Entry #{String(currentEntry.dex).padStart(4, '0')} — Official high-resolution asset cached and ready.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. BATTLE SIMULATOR */}
      {activeTab === 'battle' && (
        <div className="bg-slate-900 border border-slate-800 rounded p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase">Deterministic Battle Engine Simulator</h2>
            <button
              onClick={runBattleSimulation}
              className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
            >
              RUN SIMULATION TURN
            </button>
          </div>

          <div className="bg-slate-950 rounded p-4 border border-slate-800 min-h-[240px] text-xs space-y-1.5">
            {battleLogs.length === 0 ? (
              <p className="text-slate-500 italic">Click "RUN SIMULATION TURN" to test battle turn execution...</p>
            ) : (
              battleLogs.map((log, idx) => (
                <div key={idx} className="text-slate-300 font-mono">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. 18x18 TYPE MATRIX */}
      {activeTab === 'matrix' && (
        <div className="bg-slate-900 border border-slate-800 rounded p-6 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase">Canonical 18x18 Type Effectiveness Matrix</h2>
          <div className="overflow-x-auto max-h-[65vh]">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="p-2">Attacking \ Defending</th>
                  {allTypes.map((t) => (
                    <th key={t} className="p-1.5 text-center text-[10px] uppercase font-mono">{t.slice(0, 3)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allTypes.map((atk) => (
                  <tr key={atk} className="border-b border-slate-900 hover:bg-slate-800/50">
                    <td className="p-2 font-bold text-slate-200 text-xs">{atk}</td>
                    {allTypes.map((def) => {
                      const mult = getTypeEffectiveness(atk, def);
                      let color = 'text-slate-500';
                      if (mult === 2) color = 'text-emerald-400 font-bold bg-emerald-950/30';
                      if (mult === 0.5) color = 'text-rose-400 font-bold bg-rose-950/30';
                      if (mult === 0) color = 'text-slate-700 bg-slate-950 font-bold';
                      return (
                        <td key={def} className={`p-1.5 text-center text-[11px] ${color}`}>
                          {mult === 0 ? '0' : mult === 0.5 ? '½' : mult === 2 ? '2' : '1'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. SAVE PERSISTENCE */}
      {activeTab === 'save' && (
        <div className="bg-slate-900 border border-slate-800 rounded p-6 space-y-4 text-xs">
          <h2 className="text-sm font-bold text-white uppercase">Save System Persistence Engine (v3)</h2>
          <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
            <p className="text-slate-300">Schema Version: <b className="text-emerald-400">3.0.0</b></p>
            <p className="text-slate-300">Storage Driver: <b className="text-cyan-400">LocalStorage + IndexedDB / SQLite</b></p>
            <p className="text-slate-300">Supported Entities: <b className="text-slate-200">Party, Storage Box (1-8), Inventory, Pokédex Seen/Caught (1-1025), Player State</b></p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
