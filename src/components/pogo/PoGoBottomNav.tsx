/**
 * Pokémon 3D RPG — Authentic Pokémon GO Bottom HUD
 * 
 * Layout:
 * - Left: Trainer Profile Pill (Level, Avatar, Buddy status)
 * - Center: Floating Poké Ball Action Button (opens Radial Menu)
 * - Right: Nearby Pokémon Radar Drawer (silhouettes of nearby wild spawns)
 */

import React from 'react';
import { useGameStore } from '../../state/useGameStore';
import { usePlayerPartyStore } from '../../state/usePlayerPartyStore';
import { useRealWorldStore } from '../../state/useRealWorldStore';
import { getPokemonIcon } from '../../data/pokemon/images';
import { getPokemonById } from '../../data/pokemon';
import { Heart, Compass, Sparkles } from 'lucide-react';

interface BottomNavProps {
  onOpenMenu: () => void;
  onOpenTrainerProfile: () => void;
  onOpenNearby: () => void;
}

export const PoGoBottomNav: React.FC<BottomNavProps> = ({
  onOpenMenu,
  onOpenTrainerProfile,
  onOpenNearby,
}) => {
  const { playerLevel, playerExp, playerExpToNextLevel } = useGameStore();
  const { party, buddyInstanceId, buddyHearts } = usePlayerPartyStore();
  const { spawns } = useRealWorldStore();

  const activeBuddy = party.find((p) => p.instanceId === buddyInstanceId) || party[0];
  const buddySpecies = activeBuddy ? getPokemonById(activeBuddy.speciesId) : null;
  const buddyDex = buddySpecies?.nationalDexNumber || 25;

  const nearbySpawns = spawns.slice(0, 3);
  const expPct = Math.min(100, Math.round((playerExp / playerExpToNextLevel) * 100));

  return (
    <div className="absolute bottom-5 left-4 right-4 z-[500] flex items-end justify-between pointer-events-none select-none">
      {/* LEFT: Trainer Profile & Buddy Pill */}
      <button
        onClick={onOpenTrainerProfile}
        className="pointer-events-auto flex items-center gap-2.5 bg-slate-900/90 hover:bg-slate-800 backdrop-blur-2xl px-3 py-2 rounded-full border border-white/20 shadow-[0_10px_25px_rgba(0,0,0,0.6)] transition-all hover:scale-105 active:scale-95 group"
      >
        {/* Buddy Thumbnail */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md flex items-center justify-center">
            <img
              src={getPokemonIcon(buddyDex)}
              alt="Buddy"
              className="w-8 h-8 object-contain"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-pink-500 text-white rounded-full p-0.5 text-[8px] font-black border border-white flex items-center justify-center w-4 h-4 shadow">
            ❤️
          </div>
        </div>

        {/* Trainer Level & EXP Bar */}
        <div className="text-left pr-1">
          <div className="text-[11px] font-black text-white flex items-center gap-1.5">
            <span className="bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded text-[10px] font-black">
              Lv.{playerLevel}
            </span>
            <span className="text-slate-300 font-medium">Trainer</span>
          </div>
          <div className="w-20 bg-slate-950 h-1.5 rounded-full overflow-hidden mt-1 border border-white/10">
            <div
              className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-300"
              style={{ width: `${expPct}%` }}
            />
          </div>
        </div>
      </button>

      {/* CENTER: Floating Poké Ball Main Menu Button */}
      <button
        onClick={onOpenMenu}
        className="pointer-events-auto -translate-y-2 w-16 h-16 rounded-full bg-gradient-to-b from-red-500 via-red-500 to-white border-4 border-slate-950 shadow-[0_15px_30px_rgba(0,0,0,0.8)] flex items-center justify-center transition-transform hover:scale-115 active:scale-90 group cursor-pointer"
        title="Main Menu"
      >
        <div className="w-6 h-6 rounded-full bg-white border-2 border-slate-950 flex items-center justify-center shadow-inner group-hover:rotate-180 transition-transform duration-500">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-950 group-hover:bg-red-500 transition-colors" />
        </div>
      </button>

      {/* RIGHT: Nearby Pokémon Radar Pill */}
      <button
        onClick={onOpenNearby}
        className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 backdrop-blur-2xl px-3.5 py-2.5 rounded-full border border-white/20 shadow-[0_10px_25px_rgba(0,0,0,0.6)] transition-all hover:scale-105 active:scale-95 group"
      >
        <div className="flex -space-x-2 overflow-hidden">
          {nearbySpawns.length > 0 ? (
            nearbySpawns.map((s, idx) => (
              <div
                key={s.uid || idx}
                className="w-7 h-7 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center p-0.5 shadow-sm"
              >
                <img
                  src={getPokemonIcon(s.dex)}
                  alt={s.name}
                  className="w-6 h-6 object-contain filter contrast-125 brightness-90"
                />
              </div>
            ))
          ) : (
            <Compass className="w-5 h-5 text-slate-400" />
          )}
        </div>
        <div className="text-[10px] font-black text-slate-300 uppercase tracking-wider pl-1">
          Nearby
        </div>
      </button>
    </div>
  );
};
