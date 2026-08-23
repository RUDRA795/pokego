/**
 * Pokémon 3D RPG — Pokémon GO & UNITE Style Overworld HUD
 * 
 * Features:
 * - Trainer Profile Card (bottom-left): Avatar circle, Level badge, Buddy Pokémon portrait & heart meter.
 * - Iconic Central 3D Poké Ball Main Menu (bottom-center) with radial pop-out.
 * - "Nearby Pokémon" Radar Card (bottom-right) showing silhouettes of nearby species.
 * - Dynamic Weather & Time Widget (top-left) with type boost indicators.
 */

import React, { useState } from 'react';
import { Sun, Moon, CloudRain, Cloud, BookOpen, Disc3, Package, Sparkles, X, Heart } from 'lucide-react';
import { useWeatherStore } from '../../state/useWeatherStore';
import { useGameStore } from '../../state/useGameStore';
import { usePlayerPartyStore } from '../../state/usePlayerPartyStore';
import { SoundSystem } from '../../systems/audio/SoundSystem';

interface PokemonGoHUDProps {
  onOpenPokedex: () => void;
  onOpenParty: () => void;
}

export const PokemonGoHUD: React.FC<PokemonGoHUDProps> = ({ onOpenPokedex, onOpenParty }) => {
  const current = useWeatherStore((state) => state.current);
  const time = useWeatherStore((state) => state.time);
  const temperature = useWeatherStore((state) => state.temperature);
  const party = usePlayerPartyStore((state) => state.party);

  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const buddy = party[0]; // Active leader buddy

  return (
    <>
      {/* TOP HEADER: Weather & Time Pill */}
      <header className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-xl border border-white/15 px-3.5 py-1.5 rounded-full shadow-2xl pointer-events-auto">
          {time === 'NIGHT' ? (
            <Moon className="w-4 h-4 text-indigo-400" />
          ) : current === 'SUNNY' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : current === 'RAIN' ? (
            <CloudRain className="w-4 h-4 text-blue-400" />
          ) : (
            <Cloud className="w-4 h-4 text-slate-300" />
          )}
          <span className="text-xs font-black text-white capitalize">{time === 'NIGHT' ? 'Night' : current.toLowerCase()}</span>
          <span className="text-slate-500">•</span>
          <span className="text-xs font-mono font-bold text-slate-300">{temperature}°C</span>
        </div>

        {/* Quick Pokédex Shortcut */}
        <button
          onClick={() => { onOpenPokedex(); SoundSystem.playTap(); }}
          className="w-11 h-11 rounded-full bg-slate-900/85 backdrop-blur-xl border border-white/15 flex items-center justify-center text-emerald-400 shadow-2xl active:scale-95 transition pointer-events-auto"
        >
          <BookOpen className="w-5 h-5" />
        </button>
      </header>

      {/* RADIAL POKÉ BALL MENU OVERLAY */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-xl flex flex-col items-center justify-center pointer-events-auto animate-in fade-in duration-200">
          <div className="relative flex flex-col items-center gap-6">
            {/* Radial Options */}
            <div className="grid grid-cols-2 gap-5">
              {/* Pokémon Party Button */}
              <button
                onClick={() => { setMenuOpen(false); onOpenParty(); SoundSystem.playTap(); }}
                className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-slate-900/90 border border-amber-400/30 text-amber-300 shadow-2xl hover:bg-slate-800 active:scale-95 transition"
              >
                <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-2xl">
                  ⚡
                </div>
                <span className="text-xs font-black uppercase tracking-wider">Pokémon</span>
              </button>

              {/* Pokédex Button */}
              <button
                onClick={() => { setMenuOpen(false); onOpenPokedex(); SoundSystem.playTap(); }}
                className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-slate-900/90 border border-emerald-400/30 text-emerald-300 shadow-2xl hover:bg-slate-800 active:scale-95 transition"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-2xl">
                  📖
                </div>
                <span className="text-xs font-black uppercase tracking-wider">Pokédex</span>
              </button>

              {/* Items / Bag Button */}
              <button
                onClick={() => { setMenuOpen(false); onOpenParty(); SoundSystem.playTap(); }}
                className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-slate-900/90 border border-cyan-400/30 text-cyan-300 shadow-2xl hover:bg-slate-800 active:scale-95 transition"
              >
                <div className="w-14 h-14 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-2xl">
                  🎒
                </div>
                <span className="text-xs font-black uppercase tracking-wider">Items</span>
              </button>

              {/* Battle / Camp Button */}
              <button
                onClick={() => { setMenuOpen(false); SoundSystem.playTap(); }}
                className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-slate-900/90 border border-rose-400/30 text-rose-300 shadow-2xl hover:bg-slate-800 active:scale-95 transition"
              >
                <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-2xl">
                  ⚔️
                </div>
                <span className="text-xs font-black uppercase tracking-wider">Explore</span>
              </button>
            </div>

            {/* Close Radial Button */}
            <button
              onClick={() => { setMenuOpen(false); SoundSystem.playTap(); }}
              className="mt-4 w-14 h-14 rounded-full bg-rose-600/90 border-2 border-white flex items-center justify-center text-white shadow-2xl active:scale-95 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM POKÉMON GO HUD FOOTER */}
      <footer className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between pointer-events-none z-20">
        {/* Bottom-Left: Trainer & Buddy Profile Card */}
        <div
          onClick={() => { onOpenParty(); SoundSystem.playTap(); }}
          className="flex items-center gap-2.5 bg-slate-900/90 backdrop-blur-xl border border-white/20 p-2 rounded-3xl shadow-2xl pointer-events-auto active:scale-95 transition cursor-pointer"
        >
          {/* Trainer Avatar Circle */}
          <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 border-2 border-white flex items-center justify-center shadow-lg">
            <span className="text-lg font-black text-white">🧢</span>
            <div className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black border border-white">
              25
            </div>
          </div>

          {/* Buddy Pokémon Mini Indicator */}
          {buddy && (
            <div className="flex flex-col pr-1">
              <span className="text-xs font-black text-white uppercase tracking-tight">{buddy.name}</span>
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-rose-500 fill-current" />
                <span className="text-[10px] font-bold text-slate-400">Buddy</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom-Center: Iconic Floating Poké Ball Menu Button */}
        <div className="pointer-events-auto">
          <button
            onClick={() => {
              setMenuOpen(!menuOpen);
              SoundSystem.playMenuOpen();
            }}
            aria-label="Open Main Menu"
            className="w-16 h-16 rounded-full bg-gradient-to-t from-red-600 to-rose-500 border-4 border-white shadow-2xl flex items-center justify-center text-white active:scale-90 transition transform hover:scale-105"
          >
            <Disc3 className="w-8 h-8 animate-spin-slow" />
          </button>
        </div>

        {/* Bottom-Right: Nearby Pokémon Radar Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-white/20 px-3 py-2 rounded-3xl shadow-2xl flex items-center gap-2 pointer-events-auto">
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nearby</span>
            <div className="flex items-center gap-1 text-sm mt-0.5">
              <span>⚡</span>
              <span>🍃</span>
              <span>🌊</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
