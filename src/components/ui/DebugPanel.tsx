import React, { useState, useEffect, useRef } from 'react';
import { Terminal, ChevronDown, ChevronUp, Sun, Moon, CloudRain, RotateCcw, Smartphone, Activity } from 'lucide-react';
import { usePlayerStore } from '../../state/usePlayerStore';
import { useWeatherStore } from '../../state/useWeatherStore';
import { useGameStore } from '../../state/useGameStore';

export const DebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [fps, setFps] = useState(60);
  
  const playerPos = usePlayerStore((state) => state.position);
  const resetPosition = usePlayerStore((state) => state.resetPosition);

  const currentWeather = useWeatherStore((state) => state.current);
  const currentTime = useWeatherStore((state) => state.time);
  const cycleWeather = useWeatherStore((state) => state.cycleWeather);
  const toggleTime = useWeatherStore((state) => state.toggleTime);

  const pokemonCount = useGameStore((state) => state.pokemonCount);
  const debug = useGameStore((state) => state.debug);
  const toggleDebugOption = useGameStore((state) => state.toggleDebugOption);
  const triggerResetWorld = useGameStore((state) => state.triggerResetWorld);

  // Real-time lightweight FPS counter
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    let animId: number;
    const calcFps = () => {
      frameCount.current++;
      const now = performance.now();
      if (now - lastTime.current >= 1000) {
        setFps(Math.round((frameCount.current * 1000) / (now - lastTime.current)));
        frameCount.current = 0;
        lastTime.current = now;
      }
      animId = requestAnimationFrame(calcFps);
    };
    animId = requestAnimationFrame(calcFps);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="fixed bottom-4 left-4 z-30 font-mono pointer-events-auto">
      {/* Floating Toggle Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-cyan-500/30 text-cyan-300 text-xs font-bold shadow-lg hover:bg-slate-800 transition active:scale-95"
      >
        <Terminal className="w-3.5 h-3.5" />
        <span>DEBUG HUD</span>
        <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-200">
          {fps} FPS
        </span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>

      {/* Expanded Debug Dashboard */}
      {isOpen && (
        <div className="mt-2 w-72 p-3.5 rounded-2xl bg-slate-950/95 backdrop-blur-md border border-white/10 shadow-2xl text-xs space-y-3 animate-in slide-in-from-bottom-2">
          {/* Real-time Telemetry */}
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/5 space-y-1">
            <div className="flex justify-between items-center text-slate-400">
              <span>Performance:</span>
              <span className={`font-bold ${fps >= 50 ? 'text-emerald-400' : fps >= 30 ? 'text-amber-400' : 'text-red-400'}`}>
                {fps} FPS
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Player X, Z:</span>
              <span className="text-slate-200 font-semibold">
                {playerPos[0].toFixed(1)}, {playerPos[2].toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Active Pokémon:</span>
              <span className="text-cyan-300 font-semibold">{pokemonCount} Entities</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Asset Engine:</span>
              <span className="text-emerald-400 font-semibold">Phase 4 High-Def Rigs</span>
            </div>
          </div>

          {/* Quick Environment Controls */}
          <div className="space-y-1.5">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              Environment Overrides
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={cycleWeather}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 flex items-center justify-between text-slate-200 active:scale-95 transition"
              >
                <div className="flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[11px]">Weather</span>
                </div>
                <span className="text-[10px] text-cyan-400 font-bold uppercase">{currentWeather}</span>
              </button>

              <button
                onClick={toggleTime}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 flex items-center justify-between text-slate-200 active:scale-95 transition"
              >
                <div className="flex items-center gap-1.5">
                  {currentTime === 'DAY' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
                  <span className="text-[11px]">Time</span>
                </div>
                <span className="text-[10px] text-amber-400 font-bold uppercase">{currentTime}</span>
              </button>
            </div>
          </div>

          {/* UI & State Toggles */}
          <div className="space-y-1.5">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              Quick Actions
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => toggleDebugOption('showJoystick')}
                className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 transition active:scale-95 ${
                  debug.showJoystick
                    ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-900 border-white/10 text-slate-400'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="text-[11px]">Joystick</span>
              </button>

              <button
                onClick={resetPosition}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 flex items-center justify-center gap-1.5 text-slate-300 active:scale-95 transition"
              >
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px]">Reset Pos</span>
              </button>
            </div>

            <button
              onClick={triggerResetWorld}
              className="w-full p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/30 text-rose-300 flex items-center justify-center gap-1.5 font-bold text-[11px] active:scale-95 transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>Full World Reset</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
