/**
 * Pokémon 3D RPG — Authentic Pokémon GO Trainer Profile & Buddy Sheet
 */

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../../state/useGameStore';
import { usePlayerPartyStore } from '../../state/usePlayerPartyStore';
import { getPokemonAnimated, getPokemonIcon } from '../../data/pokemon/images';
import { getPokemonById } from '../../data/pokemon';
import { X, Sparkles, Star, Heart, Trophy, MapPin, Footprints, Shield } from 'lucide-react';

interface TrainerProfileModalProps {
  onClose: () => void;
}

export const PoGoTrainerProfileModal: React.FC<TrainerProfileModalProps> = ({
  onClose,
}) => {
  const { playerLevel, playerExp, playerExpToNextLevel, stardust, pokeCoins } = useGameStore();
  const { party, buddyInstanceId, buddyHearts, buddyDistanceKm, feedBuddy, pokedexCaught } =
    usePlayerPartyStore();

  const [team, setTeam] = useState<'MYSTIC' | 'VALOR' | 'INSTINCT'>('MYSTIC');

  const activeBuddy = party.find((p) => p.instanceId === buddyInstanceId) || party[0];
  const buddyDex = activeBuddy ? (getPokemonById(activeBuddy.speciesId)?.nationalDexNumber || 25) : 25;
  const expPct = Math.min(100, Math.round((playerExp / playerExpToNextLevel) * 100));

  return (
    <div className="fixed inset-0 z-[900] bg-slate-950/90 backdrop-blur-2xl flex flex-col justify-between p-4 md:p-6 select-none animate-fade">
      {/* Top Bar */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between z-10">
        <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
          Trainer Profile
        </span>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-slate-900 hover:bg-slate-800 border border-white/20 text-white flex items-center justify-center transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Profile Body */}
      <div className="max-w-md w-full mx-auto flex-1 overflow-y-auto my-3 space-y-4 pr-1">
        {/* Trainer Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl relative overflow-hidden">
          {/* Team Emblem Badge */}
          <div className="flex justify-center gap-2">
            {[
              { id: 'MYSTIC', label: 'Team Mystic 💙', color: 'from-blue-600 to-cyan-500' },
              { id: 'VALOR', label: 'Team Valor ❤️', color: 'from-red-600 to-rose-500' },
              { id: 'INSTINCT', label: 'Team Instinct 💛', color: 'from-amber-400 to-yellow-500' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTeam(t.id as any);
                  confetti({ particleCount: 30, spread: 40 });
                }}
                className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${
                  team === t.id
                    ? `bg-gradient-to-r ${t.color} text-white shadow-md scale-105`
                    : 'bg-slate-950 text-slate-500 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Level Badge */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-slate-950 font-black text-2xl shadow-xl">
              {playerLevel}
            </div>
            <h2 className="text-2xl font-black text-white mt-2">Trainer Ash</h2>
            <div className="w-48 bg-slate-950 h-2 rounded-full overflow-hidden mt-2 border border-slate-800">
              <div
                className="bg-emerald-400 h-full rounded-full"
                style={{ width: `${expPct}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1 font-bold">
              {playerExp} / {playerExpToNextLevel} Total EXP
            </div>
          </div>

          {/* Stardust & Coins */}
          <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs font-black">
            <div className="flex items-center justify-center gap-1.5 text-purple-300">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>{stardust.toLocaleString()} Stardust</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-amber-300">
              <Star className="w-4 h-4 text-amber-400" />
              <span>{pokeCoins} Coins</span>
            </div>
          </div>
        </div>

        {/* Active Buddy Companion Card */}
        {activeBuddy && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase text-pink-400 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 fill-pink-400" /> Buddy Companion
              </span>
              <span className="text-xs font-mono font-bold text-pink-300">
                {buddyDistanceKm.toFixed(1)} km Walked Together
              </span>
            </div>

            <div className="flex items-center gap-4 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <img
                src={getPokemonAnimated(buddyDex)}
                alt={activeBuddy.name}
                className="w-20 h-20 object-contain drop-shadow"
              />
              <div className="space-y-1">
                <h4 className="text-lg font-black text-white">{activeBuddy.name}</h4>
                <div className="text-xs text-amber-400 font-mono font-bold">
                  CP {activeBuddy.calculatedStats.hp * 10 + activeBuddy.calculatedStats.attack * 8}
                </div>
                <div className="text-[11px] text-pink-400 flex items-center gap-1 font-bold">
                  <span>Affection:</span>
                  <span>{'❤️'.repeat(Math.min(5, buddyHearts))}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                feedBuddy();
                confetti({ particleCount: 35, spread: 50 });
              }}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 text-white font-black text-xs shadow-lg flex items-center justify-center gap-1.5 transition"
            >
              <Heart className="w-4 h-4 fill-current" />
              <span>FEED BERRY (PLAY TOGETHER)</span>
            </button>
          </div>
        )}

        {/* Badges & Statistics Grid */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
          <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider">
            Trainer Medals & Stats
          </h3>

          <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
              <Trophy className="w-5 h-5 text-amber-400 mx-auto" />
              <div className="text-white font-mono font-black">{pokedexCaught.length}</div>
              <div className="text-[9px] text-slate-400 uppercase">Caught</div>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
              <MapPin className="w-5 h-5 text-cyan-400 mx-auto" />
              <div className="text-white font-mono font-black">12</div>
              <div className="text-[9px] text-slate-400 uppercase">PokéStops</div>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
              <Footprints className="w-5 h-5 text-emerald-400 mx-auto" />
              <div className="text-white font-mono font-black">{buddyDistanceKm.toFixed(1)} km</div>
              <div className="text-[9px] text-slate-400 uppercase">Distance</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Close */}
      <div className="max-w-md w-full mx-auto flex justify-center pt-2">
        <button
          onClick={onClose}
          className="w-12 h-12 rounded-full bg-slate-900 hover:bg-slate-800 border border-white/20 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
