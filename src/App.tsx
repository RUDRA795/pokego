/**
 * Pokémon Game Engine — Core Main Entry
 * 
 * Exposes and executes the core engine systems:
 * - BattleEngine & Turn Resolver
 * - DamageCalculator & 18x18 Type Matrix
 * - StatCalculator & Canonical Growth Rates
 * - Canonical Species Database & Movesets
 * - Party Management & Persistence (SaveSystem v3)
 */

import React, { useState } from 'react';
import { POKEMON_SPECIES_LIST, POKEMON_SPECIES_DATABASE } from './data/pokemon/species';
import { POKEMON_MOVES } from './data/pokemon/moves';
import { calculateDamage } from './battle/DamageCalculator';
import { createRuntimePokemon } from './battle/RuntimePokemon';
import { TYPE_CHART, getTypeEffectiveness } from './data/pokemon/types';
import { PokemonType } from './types/pokemon';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'species' | 'battle' | 'matrix' | 'save'>('species');
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>('pikachu');

  const species = POKEMON_SPECIES_DATABASE[selectedSpeciesId] || POKEMON_SPECIES_LIST[0];

  // Quick Battle Engine Test State
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
          <p className="text-xs text-slate-400">Pure Canonical Engine & Data Architecture (v3.0.0)</p>
        </div>
        <div className="flex gap-2">
          {(['species', 'battle', 'matrix', 'save'] as const).map((tab) => (
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

      {/* Main Content Areas */}
      {activeTab === 'species' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Species List */}
          <div className="bg-slate-900 border border-slate-800 rounded p-4 max-h-[70vh] overflow-y-auto space-y-1">
            <h2 className="text-xs font-bold text-slate-400 uppercase mb-3">Database ({POKEMON_SPECIES_LIST.length} Species)</h2>
            {POKEMON_SPECIES_LIST.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSpeciesId(s.id)}
                className={`w-full text-left px-3 py-2 rounded text-xs flex items-center justify-between transition ${
                  selectedSpeciesId === s.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>#{String(s.nationalDexNumber).padStart(3, '0')} {s.name}</span>
                <span className="text-[10px] text-slate-500">{s.primaryType}</span>
              </button>
            ))}
          </div>

          {/* Species Details */}
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs text-slate-500">#{String(species.nationalDexNumber).padStart(3, '0')}</span>
                <h2 className="text-2xl font-bold text-white">{species.name}</h2>
                <p className="text-xs text-slate-400 italic">{species.speciesCategory}</p>
              </div>
              <div className="flex gap-2">
                <span className="px-2.5 py-1 rounded bg-slate-800 text-xs font-bold text-emerald-400 border border-slate-700">
                  {species.primaryType}
                </span>
                {species.secondaryType && (
                  <span className="px-2.5 py-1 rounded bg-slate-800 text-xs font-bold text-cyan-400 border border-slate-700">
                    {species.secondaryType}
                  </span>
                )}
              </div>
            </div>

            {/* Base Stats */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Base Stats (BST: {species.baseStats.baseStatTotal})</h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                {Object.entries(species.baseStats).map(([key, val]) => {
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

            {/* Lore & Physical Details */}
            <div className="bg-slate-950 p-4 rounded border border-slate-800 text-xs space-y-2">
              <p className="text-slate-300">"{species.pokedexEntry}"</p>
              <div className="flex gap-6 text-[11px] text-slate-400 pt-2 border-t border-slate-900">
                <span>Height: <b className="text-slate-200">{species.heightMeters}m</b></span>
                <span>Weight: <b className="text-slate-200">{species.weightKg}kg</b></span>
                <span>Catch Rate: <b className="text-slate-200">{species.catchRate}</b></span>
                <span>Habitat: <b className="text-slate-200">{species.canonicalHabitat}</b></span>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {activeTab === 'save' && (
        <div className="bg-slate-900 border border-slate-800 rounded p-6 space-y-4 text-xs">
          <h2 className="text-sm font-bold text-white uppercase">Save System Persistence Engine (v3)</h2>
          <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
            <p className="text-slate-300">Schema Version: <b className="text-emerald-400">3.0.0</b></p>
            <p className="text-slate-300">Storage Driver: <b className="text-cyan-400">LocalStorage + IndexedDB / SQLite</b></p>
            <p className="text-slate-300">Supported Entities: <b className="text-slate-200">Party, Storage Box (1-8), Inventory, Pokédex Seen/Caught, Player State</b></p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
