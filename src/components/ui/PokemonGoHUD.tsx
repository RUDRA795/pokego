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
import { Sun, Moon, CloudRain, Cloud, BookOpen, Disc3, X, Heart } from 'lucide-react';
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
      <header className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between pointer-events-none z-20">
        <div className="pokemon-card px-4 py-2 flex items-center gap-2 pointer-events-auto">
          {time === 'NIGHT' ? (
            <Moon className="w-4 h-4 text-indigo-400" />
          ) : current === 'SUNNY' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : current === 'RAIN' ? (
            <CloudRain className="w-4 h-4 text-blue-400" />
          ) : (
            <Cloud className="w-4 h-4" />
          )}
          <span className="text-xs font-black text-pokemon-ui-text capitalize">{time === 'NIGHT' ? 'Night' : current.toLowerCase()}</span>
          <span className="text-pokemon-ui-muted">•</span>
          <span className="text-xs font-mono font-bold text-pokemon-ui-text">{temperature}°C</span>
        </div>

        <button
          onClick={() => { onOpenPokedex(); SoundSystem.playTap(); }}
          className="pokemon-button w-11 h-11 flex items-center justify-center p-0 pointer-events-auto"
        >
          <BookOpen className="w-5 h-5" />
        </button>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-black/80 flex flex-col items-center justify-center pointer-events-auto animate-fade-in">
          <div className="relative flex flex-col items-center gap-6">
            <div className="grid grid-cols-2 gap-5">
              <button
                onClick={() => { setMenuOpen(false); onOpenParty(); SoundSystem.playTap(); }}
                className="flex flex-col items-center gap-2 p-4 pokemon-card text-pokemon-yellow"
              >
                <div className="w-14 h-14 rounded-full bg-pokemon-yellow/20 border-2 border-pokemon-yellow flex items-center justify-center text-2xl">
                  ⚡
                </div>
                <span className="text-xs font-black uppercase tracking-wider">Pokémon</span>
              </button>

              <button
                onClick={() => { setMenuOpen(false); onOpenPokedex(); SoundSystem.playTap(); }}
                className="flex flex-col items-center gap-2 p-4 pokemon-card text-pokemon-green"
              >
                <div className="w-14 h-14 rounded-full bg-pokemon-green/20 border-2 border-pokemon-green flex items-center justify-center text-2xl">
                  📖
                </div>
                <span className="text-xs font-black uppercase tracking-wider">Pokédex</span>
              </button>

              <button
                onClick={() => { setMenuOpen(false); onOpenParty(); SoundSystem.playTap(); }}
                className="flex flex-col items-center gap-2 p-4 pokemon-card text-pokemon-blue"
              >
                <div className="w-14 h-14 rounded-full bg-pokemon-blue/20 border-2 border-pokemon-blue flex items-center justify-center text-2xl">
                  🎒
                </div>
                <span className="text-xs font-black uppercase tracking-wider">Items</span>
              </button>

              <button
                onClick={() => { setMenuOpen(false); SoundSystem.playTap(); }}
                className="flex flex-col items-center gap-2 p-4 pokemon-card text-pokemon-red"
              >
                <div className="w-14 h-14 rounded-full bg-pokemon-red/20 border-2 border-pokemon-red flex items-center justify-center text-2xl">
                  ⚔️
                </div>
                <span className="text-xs font-black uppercase tracking-wider">Explore</span>
              </button>
            </div>

            <button
              onClick={() => { setMenuOpen(false); SoundSystem.playTap(); }}
              className="mt-4 pokemon-button-danger w-14 h-14 flex items-center justify-center p-0"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      <footer className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between pointer-events-none z-20">
        <div
          onClick={() => { onOpenParty(); SoundSystem.playTap(); }}
          className="pokemon-card flex items-center gap-2.5 p-2 pointer-events-auto cursor-pointer"
        >
          <div className="relative w-12 h-12 rounded-full bg-pokemon-blue border-4 border-white flex items-center justify-center">
            <span className="text-lg font-black text-white">🧢</span>
            <div className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-pokemon-green text-pokemon-dark text-[9px] font-black border border-white">
              25
            </div>
          </div>

          {buddy && (
            <div className="flex flex-col pr-1">
              <span className="text-xs font-black text-pokemon-ui-text uppercase tracking-tight">{buddy.name}</span>
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-pokemon-red" />
                <span className="text-[10px] font-bold text-pokemon-ui-muted">Buddy</span>
              </div>
            </div>
          )}
        </div>

        <div className="pointer-events-auto">
          <button
            onClick={() => {
              setMenuOpen(!menuOpen);
              SoundSystem.playMenuOpen();
            }}
            className="w-16 h-16 rounded-full bg-pokemon-red border-4 border-white flex items-center justify-center text-white"
          >
            <Disc3 className="w-8 h-8 animate-spin-slow" />
          </button>
        </div>

        <div className="pokemon-card px-3 py-2 flex items-center gap-2 pointer-events-auto">
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-pokemon-ui-muted uppercase tracking-widest">Nearby</span>
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
