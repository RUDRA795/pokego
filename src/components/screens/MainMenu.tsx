import React, { useState } from 'react';
import { Play, Sparkles, Gamepad2, Info, Flame, Droplets, Leaf, Zap, Check } from 'lucide-react';
import { useGameStore } from '../../state/useGameStore';
import { usePlayerPartyStore } from '../../state/usePlayerPartyStore';
import { POKEMON_SPECIES_DATABASE } from '../../data/pokemon';
import { POKEMON_TYPE_THEMES } from '../../data/pokemon/types';
import { PokemonType } from '../../types/pokemon';

export const MainMenu: React.FC = () => {
  const setScreen = useGameStore((state) => state.setScreen);
  const party = usePlayerPartyStore((state) => state.party);
  const initStarter = usePlayerPartyStore((state) => state.initStarter);
  const hasChosenStarter = usePlayerPartyStore((state) => state.hasChosenStarter);

  const [selectedStarterId, setSelectedStarterId] = useState<string>('pikachu');
  const [showInfo, setShowInfo] = useState(false);

  // Showcase starters & iconic test Pokémon
  const starterIds = ['bulbasaur', 'charmander', 'squirtle', 'pikachu'];
  const starters = starterIds
    .map((id) => POKEMON_SPECIES_DATABASE[id])
    .filter(Boolean);

  const getElementIcon = (type: PokemonType) => {
    switch (type) {
      case 'Fire': return <Flame className="w-3.5 h-3.5 text-orange-400" />;
      case 'Water': return <Droplets className="w-3.5 h-3.5 text-sky-400" />;
      case 'Grass': return <Leaf className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Electric': return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      default: return <Sparkles className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  const handleStartGame = () => {
    if (!hasChosenStarter || party.length === 0) {
      initStarter(selectedStarterId);
    }
    setScreen('PLAYING');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 select-none overflow-y-auto font-sans">
      {/* Background Grid */}
      <div className="absolute inset-0 retro-grid opacity-25 pointer-events-none" />

      {/* Top Header */}
      <div className="w-full flex justify-between items-center max-w-md pt-2">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/60 border border-white/10 text-xs font-semibold text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Pokémon Engine v0.3.0</span>
        </div>

        <button
          onClick={() => setShowInfo(!showInfo)}
          aria-label="Game Info"
          className="p-2 rounded-full bg-slate-800/60 hover:bg-slate-700/60 border border-white/10 text-slate-300 hover:text-white transition"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Center Branding & Pokémon Showcase */}
      <div className="w-full max-w-md flex flex-col items-center my-auto py-6">
        {/* Glowing Title Card */}
        <div className="relative mb-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-amber-300 uppercase drop-shadow-lg">
            Pokémon RPG
          </h1>
          <p className="text-xs sm:text-sm font-semibold tracking-widest text-slate-400 uppercase mt-1">
            Mobile 3D Exploration & Battle
          </p>
        </div>

        {/* Choose Starter Section */}
        <div className="w-full mb-3 text-left flex justify-between items-center px-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {hasChosenStarter ? 'Active Starter' : 'Choose Your Starter'}
          </span>
          {hasChosenStarter && (
            <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
              Selected
            </span>
          )}
        </div>

        {/* 4 Iconic Starters Showcase Cards */}
        <div className="w-full grid grid-cols-4 gap-2 mb-8">
          {starters.map((pokemon) => {
            const theme = POKEMON_TYPE_THEMES[pokemon.primaryType];
            const isSelected = selectedStarterId === pokemon.id;

            return (
              <button
                key={pokemon.id}
                onClick={() => setSelectedStarterId(pokemon.id)}
                className={`p-2.5 rounded-2xl border flex flex-col items-center text-center shadow-lg transition active:scale-95 ${
                  isSelected
                    ? 'bg-slate-800 border-cyan-400 shadow-cyan-500/20'
                    : 'bg-slate-900/80 hover:bg-slate-850 border-white/10'
                }`}
              >
                <div
                  className="w-10 h-10 rounded-xl mb-1.5 flex items-center justify-center border border-white/10"
                  style={{ backgroundColor: `${theme.primaryColor}25` }}
                >
                  {getElementIcon(pokemon.primaryType)}
                </div>
                <span className="font-bold text-[11px] text-white leading-tight mb-0.5">{pokemon.name}</span>
                <span className="text-[9px] text-slate-400 font-medium">#{String(pokemon.nationalDexNumber).padStart(3, '0')}</span>
              </button>
            );
          })}
        </div>

        {/* Play Action Button */}
        <button
          onClick={handleStartGame}
          className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-lg tracking-wider uppercase flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/25 active:scale-95 transition"
        >
          <Play className="w-6 h-6 fill-current" />
          <span>{hasChosenStarter ? 'Continue Adventure' : 'Start Adventure'}</span>
        </button>
      </div>

      {/* Info / Controls Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-white/20 p-5 shadow-2xl text-left space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 font-bold text-white text-base">
                <Gamepad2 className="w-5 h-5 text-emerald-400" />
                <span>Controls & Pokédex Guide</span>
              </div>
              <button
                onClick={() => setShowInfo(false)}
                className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                <span className="font-bold text-slate-100 block">Controls:</span>
                <p>• <span className="font-mono text-cyan-300">WASD / Arrow Keys</span> or <span className="font-semibold text-emerald-300">Virtual Joystick</span> to move</p>
                <p>• <span className="font-mono text-cyan-300">P / Esc</span> to pause game</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                <span className="font-bold text-slate-100 block">Combat & Capture:</span>
                <p>• Approach wild Pokémon to battle and use level-appropriate attacks.</p>
                <p>• Throw Poké Balls to capture weakened wild Pokémon for your party!</p>
                <p>• Gain XP from victories to level up and trigger evolutionary growth.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Details */}
      <footer className="w-full max-w-md text-center py-2 text-[11px] text-slate-500 font-medium">
        Mobile 3D Pokémon Engine • Turn-Based Combat & Collection
      </footer>
    </div>
  );
};
