/**
 * Pokémon 3D RPG — Pokémon GO & UNITE Party Roster, Buddy, Egg & Shadow Purification
 */

import React, { useState } from 'react';
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
  Sparkles,
  Zap,
  Flame,
  Star,
  ArrowUpCircle,
  Activity,
  Heart,
  Shield,
  Gauge,
  CheckCircle,
  RefreshCw,
  Sun,
  Disc
} from 'lucide-react';

export const PokemonPartyRoster: React.FC = () => {
  const { party, storage, updatePartyPokemon, healParty, buddyInstanceId, setBuddy, purifyPokemon, eggs } = usePlayerPartyStore();
  const { stardust, spendStardust, addExp } = useGameStore();

  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [evolutionCinematic, setEvolutionCinematic] = useState<boolean>(false);
  const [purificationCinematic, setPurificationCinematic] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const selectedPokemon: RuntimePokemon | undefined = party[selectedIndex] || party[0];

  // Power Up Pokémon Action
  const handlePowerUp = () => {
    if (!selectedPokemon) return;
    const COST = selectedPokemon.isPurified ? 180 : 200; // 10% discount for purified!
    const ok = spendStardust(COST);
    if (!ok) {
      setActionNotice('Not enough Stardust! Spin PokéStops or win battles.');
      setTimeout(() => setActionNotice(null), 2500);
      return;
    }

    const species = getPokemonById(selectedPokemon.speciesId);
    if (!species) return;

    const newLevel = selectedPokemon.level + 1;
    const newStats = calculateAllStats(species.baseStats, newLevel);

    const updated: RuntimePokemon = {
      ...selectedPokemon,
      level: newLevel,
      calculatedStats: newStats,
      currentHp: newStats.hp,
    };

    updatePartyPokemon(updated);
    addExp(80);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    setActionNotice(`Powered up ${selectedPokemon.name} to Lv. ${updated.level}!`);
    setTimeout(() => setActionNotice(null), 2500);
  };

  // Evolution Action
  const handleEvolve = () => {
    if (!selectedPokemon) return;
    const species = getPokemonById(selectedPokemon.speciesId);
    const targetEvoId = species?.evolution?.evolvesTo?.[0]?.targetSpeciesId;

    if (!targetEvoId || !POKEMON_SPECIES_DATABASE[targetEvoId]) {
      setActionNotice(`${selectedPokemon.name} cannot evolve further!`);
      setTimeout(() => setActionNotice(null), 2500);
      return;
    }

    const nextSpecies = POKEMON_SPECIES_DATABASE[targetEvoId];

    setEvolutionCinematic(true);
    confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });

    setTimeout(() => {
      const newStats = calculateAllStats(nextSpecies.baseStats, selectedPokemon.level);
      const evolved: RuntimePokemon = {
        ...selectedPokemon,
        speciesId: nextSpecies.id,
        name: nextSpecies.name,
        calculatedStats: newStats,
        currentHp: newStats.hp,
      };

      updatePartyPokemon(evolved);
      setEvolutionCinematic(false);
      setActionNotice(`Congratulations! Your Pokémon evolved into ${nextSpecies.name}!`);
      setTimeout(() => setActionNotice(null), 3500);
    }, 2000);
  };

  // Purify Shadow Pokémon Action
  const handlePurify = () => {
    if (!selectedPokemon || !selectedPokemon.isShadow) return;
    setPurificationCinematic(true);
    confetti({ particleCount: 120, spread: 90, colors: ['#ffffff', '#38bdf8', '#fbbf24'] });

    setTimeout(() => {
      purifyPokemon(selectedPokemon.instanceId);
      setPurificationCinematic(false);
      setActionNotice(`Purified ${selectedPokemon.name}! Stats and Level boosted, 10% Stardust discount unlocked.`);
      setTimeout(() => setActionNotice(null), 3500);
    }, 2000);
  };

  if (!selectedPokemon) {
    return (
      <div className="p-12 text-center text-slate-400 bg-slate-900/80 rounded-3xl border border-slate-800">
        <p className="text-lg font-bold">Your active Pokémon Party is empty.</p>
        <p className="text-xs text-slate-500 mt-1">Explore the 3D Map to catch wild Pokémon!</p>
      </div>
    );
  }

  const currentSpecies = getPokemonById(selectedPokemon.speciesId);
  const dexNumber = currentSpecies?.nationalDexNumber || 25;
  const primaryType = currentSpecies?.primaryType || 'Normal';
  const theme = POKEMON_TYPE_THEMES[primaryType] || POKEMON_TYPE_THEMES.Normal;
  const canEvolve = Boolean(currentSpecies?.evolution?.evolvesTo?.[0]);
  const isBuddy = selectedPokemon.instanceId === buddyInstanceId;
  const isShadow = Boolean(selectedPokemon.isShadow);
  const isPurified = Boolean(selectedPokemon.isPurified);
  const estimatedCP = Math.floor(selectedPokemon.calculatedStats.hp * 10 + selectedPokemon.calculatedStats.attack * 8);

  return (
    <div className="w-full space-y-6">
      {actionNotice && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-slate-950 font-black px-5 py-2.5 rounded-2xl text-xs text-center shadow-xl animate-bounce">
          {actionNotice}
        </div>
      )}

      {/* Main Grid: Party Cards Sidebar + Selected Pokémon Power-Up Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 6-Slot Party List & Egg Incubator */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 space-y-3 shadow-2xl">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider">Active Battle Party</h3>
              <button
                onClick={() => {
                  healParty();
                  setActionNotice('All Party Pokémon healed to 100% HP!');
                  setTimeout(() => setActionNotice(null), 2500);
                }}
                className="px-3 py-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 rounded-xl text-[11px] font-black border border-emerald-500/40 transition"
              >
                Heal Party
              </button>
            </div>

            <div className="space-y-2">
              {party.map((p, idx) => {
                const isSelected = selectedIndex === idx;
                const sp = getPokemonById(p.speciesId);
                const pType = sp?.primaryType || 'Normal';
                const pTheme = POKEMON_TYPE_THEMES[pType] || POKEMON_TYPE_THEMES.Normal;
                const hpPct = Math.round((p.currentHp / p.calculatedStats.hp) * 100);

                return (
                  <div
                    key={p.instanceId || `party-${idx}`}
                    onClick={() => setSelectedIndex(idx)}
                    className={`p-3.5 rounded-2xl cursor-pointer border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/10 scale-[1.02]'
                        : 'bg-slate-950/80 border-slate-800 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={getPokemonIcon(sp?.nationalDexNumber || 25)}
                        alt={p.name}
                        className="w-10 h-10 object-contain drop-shadow"
                      />
                      <div>
                        <div className="text-xs font-black text-white flex items-center gap-1.5">
                          <span>{p.name}</span>
                          {p.instanceId === buddyInstanceId && (
                            <span className="text-[10px] text-pink-400">❤️ Buddy</span>
                          )}
                          {p.isShadow && (
                            <span className="text-[9px] bg-purple-950 text-purple-400 px-1.5 py-0.2 rounded border border-purple-800">
                              SHADOW
                            </span>
                          )}
                          {p.isPurified && (
                            <span className="text-[9px] bg-sky-950 text-sky-400 px-1.5 py-0.2 rounded border border-sky-800">
                              PURIFIED
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-amber-400 font-mono font-bold">
                          CP {Math.floor(p.calculatedStats.hp * 10 + p.calculatedStats.attack * 8)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <span
                        className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase text-white"
                        style={{ backgroundColor: pTheme.primaryColor }}
                      >
                        {pType}
                      </span>
                      <div className="w-16 bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${hpPct > 50 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                          style={{ width: `${hpPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Egg Incubator Card */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 space-y-3 shadow-2xl">
            <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
              <Disc className="w-4 h-4 text-emerald-400" />
              <span>Egg Incubators (Walk on Map)</span>
            </h3>

            <div className="space-y-2.5">
              {eggs.map((egg) => {
                const pct = Math.min(100, Math.round((egg.walkedKm / egg.targetKm) * 100));
                return (
                  <div key={egg.id} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs space-y-1.5">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-300 font-mono">{egg.targetKm} km Egg</span>
                      <span className="text-amber-400 font-mono">{egg.walkedKm.toFixed(1)} / {egg.targetKm} km</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Selected Pokémon Details, Purification, Buddy & Power-Up */}
        <div className="lg:col-span-8 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl relative overflow-hidden">
          <div
            className="absolute -top-16 -right-16 w-60 h-60 rounded-full blur-[100px] opacity-25 pointer-events-none"
            style={{ backgroundColor: theme.primaryColor }}
          />

          {evolutionCinematic && (
            <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center space-y-4 animate-pulse">
              <Sparkles className="w-16 h-16 text-amber-400 animate-spin" />
              <h2 className="text-3xl font-black text-white">What? {selectedPokemon.name} is evolving!</h2>
              <p className="text-xs text-amber-300">Energy condensing into next canonical form...</p>
            </div>
          )}

          {purificationCinematic && (
            <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center space-y-4 animate-pulse">
              <Sun className="w-16 h-16 text-sky-400 animate-spin" />
              <h2 className="text-3xl font-black text-white">Purifying Shadow Aura...</h2>
              <p className="text-xs text-sky-300">Opening the heart door, boosting stats!</p>
            </div>
          )}

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-4 border-b border-slate-800">
            <div className="space-y-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-xs font-mono font-bold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  #{String(dexNumber).padStart(4, '0')}
                </span>
                <span className="text-xs font-black uppercase text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-800/40">
                  Lv. {selectedPokemon.level}
                </span>
                {isShadow && (
                  <span className="text-xs font-black uppercase text-purple-400 bg-purple-950/80 px-2.5 py-1 rounded-lg border border-purple-800">
                    Shadow
                  </span>
                )}
                {isPurified && (
                  <span className="text-xs font-black uppercase text-sky-400 bg-sky-950/80 px-2.5 py-1 rounded-lg border border-sky-800">
                    Purified
                  </span>
                )}
              </div>
              <h2 className="text-3xl font-black text-white">{selectedPokemon.name}</h2>
              <div className="text-xl font-black text-amber-400 flex items-center justify-center md:justify-start gap-1">
                <span>CP {estimatedCP}</span>
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div
                className="absolute w-36 h-36 rounded-full blur-2xl opacity-40"
                style={{ backgroundColor: theme.primaryColor }}
              />
              <img
                src={getPokemonAnimated(dexNumber)}
                alt={selectedPokemon.name}
                className="w-44 h-44 object-contain drop-shadow-2xl animate-float"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getPokemonArtwork(dexNumber);
                }}
              />
            </div>
          </div>

          {/* Action Row: Buddy & Purification */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setBuddy(selectedPokemon.instanceId);
                setActionNotice(`Set ${selectedPokemon.name} as your active Companion Buddy on the Real Map!`);
                setTimeout(() => setActionNotice(null), 2500);
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 border transition-all ${
                isBuddy
                  ? 'bg-pink-500 text-white border-pink-400 shadow-lg shadow-pink-500/25'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              <Heart className={`w-4 h-4 ${isBuddy ? 'fill-current' : ''}`} />
              <span>{isBuddy ? 'Active Buddy Companion' : 'Set as Companion Buddy'}</span>
            </button>

            {isShadow && (
              <button
                onClick={handlePurify}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-sky-500/25 transition-all"
              >
                <Sun className="w-4 h-4" />
                <span>PURIFY SHADOW POKÉMON</span>
              </button>
            )}
          </div>

          {/* Stats Power Gauges */}
          <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs font-black text-slate-300">
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Base Stat Performance</span>
              </span>
              <span className="text-amber-400 font-mono">★★★ Rating</span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              {[
                { label: 'Attack', val: selectedPokemon.calculatedStats.attack, max: 200, color: 'bg-rose-500' },
                { label: 'Defense', val: selectedPokemon.calculatedStats.defense, max: 200, color: 'bg-blue-500' },
                { label: 'HP Stamina', val: selectedPokemon.calculatedStats.hp, max: 250, color: 'bg-emerald-500' },
              ].map(({ label, val, max, color }) => (
                <div key={label} className="bg-slate-900 p-2.5 rounded-xl border border-slate-800/80 space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>{label}</span>
                    <span className="text-white font-mono">{val}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.min(100, Math.round((val / max) * 100))}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Power Up & Evolve Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={handlePowerUp}
              className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-black text-xs flex items-center justify-between shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <div className="flex items-center gap-2">
                <ArrowUpCircle className="w-5 h-5" />
                <span className="uppercase tracking-wider">POWER UP</span>
              </div>
              <div className="text-[11px] font-mono font-bold bg-slate-950/20 px-2 py-0.5 rounded-md">
                {isPurified ? '180 Stardust (10% OFF)' : '200 Stardust'}
              </div>
            </button>

            <button
              onClick={handleEvolve}
              disabled={!canEvolve}
              className={`p-4 rounded-2xl font-black text-xs flex items-center justify-between transition-all ${
                canEvolve
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 text-white shadow-lg shadow-purple-500/20 active:scale-95'
                  : 'bg-slate-950 text-slate-500 border border-slate-800 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span className="uppercase tracking-wider">EVOLVE</span>
              </div>
              <div className="text-[11px] font-mono font-bold">
                {canEvolve ? 'Ready' : 'Max Stage'}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
