import React, { useState } from 'react';
import { Sun, CloudRain, Cloud, Moon, Pause, Compass, Sparkles, BookOpen } from 'lucide-react';
import { useWeatherStore } from '../../state/useWeatherStore';
import { useGameStore } from '../../state/useGameStore';
import { usePlayerPartyStore } from '../../state/usePlayerPartyStore';
import { WORLD_CONFIG } from '../../data/biomes';
import { PokedexModal } from './PokedexModal';

export const GameHUD: React.FC = () => {
  const current = useWeatherStore((state) => state.current);
  const time = useWeatherStore((state) => state.time);
  const temperature = useWeatherStore((state) => state.temperature);
  const setPaused = useGameStore((state) => state.setPaused);
  const isPaused = useGameStore((state) => state.isPaused);
  const pokemonCount = useGameStore((state) => state.pokemonCount);
  const party = usePlayerPartyStore((state) => state.party);

  const [showPokedex, setShowPokedex] = useState(false);

  const activeLeader = party[0];

  return (
    <>
      <header className="absolute top-0 left-0 right-0 p-4 pointer-events-none flex items-start justify-between z-20">
        {/* Location & Status Card */}
        <div className="flex flex-col gap-1.5 pointer-events-auto">
          <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/10 shadow-lg">
            <Compass className="w-4 h-4 text-emerald-400 animate-spin-slow" />
            <span className="font-bold text-sm tracking-wide text-slate-100">{WORLD_CONFIG.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
              Phase 2
            </span>
          </div>

          {/* Dynamic Weather & Time Pill */}
          <div className="flex items-center gap-2 bg-slate-900/70 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              {time === 'NIGHT' ? (
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
              ) : current === 'SUNNY' ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : current === 'RAIN' ? (
                <CloudRain className="w-3.5 h-3.5 text-blue-400" />
              ) : (
                <Cloud className="w-3.5 h-3.5 text-slate-300" />
              )}
              <span className="font-medium capitalize">{time === 'NIGHT' ? 'Night' : current.toLowerCase()}</span>
            </div>
            <span className="text-slate-500">•</span>
            <span className="font-mono text-slate-200">{temperature}°C</span>
            <span className="text-slate-500">•</span>
            <div className="flex items-center gap-1 text-cyan-300">
              <Sparkles className="w-3 h-3" />
              <span>{pokemonCount} Pokémon</span>
            </div>
          </div>

          {/* Active Partner Pill */}
          {activeLeader && (
            <div className="flex items-center gap-2 bg-slate-900/70 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 text-xs text-slate-300 w-fit">
              <span className="text-emerald-400 font-bold">Partner:</span>
              <span className="font-extrabold text-white">{activeLeader.name}</span>
              <span className="font-mono text-[10px] text-cyan-300">Lv. {activeLeader.level}</span>
            </div>
          )}
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Pokédex Catalog Button */}
          <button
            onClick={() => setShowPokedex(true)}
            aria-label="Open Pokédex"
            className="w-10 h-10 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/15 flex items-center justify-center text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 transition active:scale-95 shadow-lg"
          >
            <BookOpen className="w-5 h-5" />
          </button>

          {/* Pause Button */}
          <button
            onClick={() => setPaused(!isPaused)}
            aria-label="Pause Game"
            className="w-10 h-10 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/15 flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-800 transition active:scale-95 shadow-lg"
          >
            <Pause className="w-5 h-5 fill-current" />
          </button>
        </div>
      </header>

      {/* Pokédex Modal */}
      {showPokedex && <PokedexModal onClose={() => setShowPokedex(false)} />}
    </>
  );
};
