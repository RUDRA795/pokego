import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useGameStore } from '../../state/useGameStore';

export const LoadingScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const setScreen = useGameStore((state) => state.setScreen);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setScreen('MENU'), 400);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 10;
      });
    }, 120);

    return () => clearInterval(timer);
  }, [setScreen]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 select-none">
      {/* Background retro grid */}
      <div className="absolute inset-0 retro-grid opacity-30 pointer-events-none" />

      {/* Center animated emblem */}
      <div className="relative mb-8 flex items-center justify-center">
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-cyan-500 via-emerald-500 to-amber-500 p-0.5 shadow-2xl shadow-cyan-500/30 animate-float">
          <div className="w-full h-full rounded-3xl bg-slate-950 flex flex-col items-center justify-center border border-white/10">
            <Sparkles className="w-12 h-12 text-emerald-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Game Title */}
      <h1 className="text-3xl sm:text-4xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-blue-400 uppercase mb-2">
        Pokémon RPG
      </h1>
      <p className="text-xs sm:text-sm text-slate-400 font-semibold tracking-widest uppercase mb-8">
        Mobile 3D Exploration & Collection
      </p>

      {/* Progress Bar Container */}
      <div className="w-full max-w-xs space-y-2">
        <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden border border-white/10 p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-150 shadow-sm shadow-cyan-400"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] font-mono text-slate-400">
          <span>Loading Pokédex Engine...</span>
          <span className="text-cyan-300 font-bold">{Math.min(progress, 100)}%</span>
        </div>
      </div>
    </div>
  );
};
