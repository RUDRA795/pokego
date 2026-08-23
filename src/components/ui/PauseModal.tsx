import React from 'react';
import { Play, RotateCcw, Home, Gamepad2 } from 'lucide-react';
import { useGameStore } from '../../state/useGameStore';

export const PauseModal: React.FC = () => {
  const isPaused = useGameStore((state) => state.isPaused);
  const encounter = useGameStore((state) => state.encounter);
  const setPaused = useGameStore((state) => state.setPaused);
  const setScreen = useGameStore((state) => state.setScreen);
  const triggerResetWorld = useGameStore((state) => state.triggerResetWorld);

  // If encounter modal is open, let encounter handle the pause
  if (!isPaused || encounter !== null) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xs rounded-3xl bg-slate-900/95 border border-white/15 shadow-2xl p-6 flex flex-col items-center text-center">
        {/* Title */}
        <h2 className="text-xl font-extrabold text-white tracking-wider uppercase mb-1">
          Game Paused
        </h2>
        <p className="text-xs text-slate-400 mb-5 font-medium">Pokémon 3D RPG • Phase 1</p>

        {/* Controls Quick Reference */}
        <div className="w-full bg-slate-950/60 rounded-2xl p-3 border border-white/5 mb-5 text-left text-xs text-slate-300">
          <div className="flex items-center gap-1.5 font-bold text-slate-200 mb-1.5">
            <Gamepad2 className="w-4 h-4 text-emerald-400" />
            <span>Controls</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400">
            <div><span className="font-mono text-slate-200">WASD / Arrows:</span> Move</div>
            <div><span className="font-mono text-slate-200">Joystick:</span> Mobile touch</div>
            <div><span className="font-mono text-slate-200">P / Esc:</span> Pause</div>
            <div><span className="font-mono text-slate-200">Approach:</span> Encounter</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={() => setPaused(false)}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition"
          >
            <Play className="w-4 h-4 fill-current" />
            RESUME
          </button>

          <button
            onClick={() => {
              triggerResetWorld();
              setPaused(false);
            }}
            className="w-full py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs tracking-wider flex items-center justify-center gap-2 border border-white/10 active:scale-95 transition"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            RESET WORLD
          </button>

          <button
            onClick={() => {
              setPaused(false);
              setScreen('MENU');
            }}
            className="w-full py-2.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs tracking-wider flex items-center justify-center gap-2 border border-white/5 active:scale-95 transition"
          >
            <Home className="w-4 h-4" />
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};
