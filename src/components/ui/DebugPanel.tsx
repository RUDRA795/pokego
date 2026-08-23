import React, { useState, useEffect, useRef } from 'react';
import { Terminal, ChevronDown, ChevronUp, Sun, Moon, CloudRain, RotateCcw, Smartphone, Activity } from 'lucide-react';
import { usePlayerStore } from '../../state/usePlayerStore';
import { useWeatherStore } from '../../state/useWeatherStore';
import { useGameStore } from '../../state/useGameStore';
import { PokemonButton } from './PokemonButton';
import { PokemonCard } from './PokemonCard';

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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-2xl pokemon-card border-pokemon-blue text-pokemon-blue text-xs font-bold"
      >
        <Terminal className="w-3.5 h-3.5" />
        <span>DEBUG HUD</span>
        <span className="text-[10px] px-1.5 py-0.2 rounded pokemon-card text-pokemon-blue">
          {fps} FPS
        </span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>

      {isOpen && (
        <div className="mt-2 w-72 p-3.5 pokemon-dialog text-xs space-y-3 animate-slide-up">
          <div className="pokemon-card p-2.5 space-y-1">
            <div className="flex justify-between items-center text-pokemon-ui-muted">
              <span>Performance:</span>
              <span className={`font-bold ${fps >= 50 ? 'text-pokemon-green' : fps >= 30 ? 'text-pokemon-yellow' : 'text-pokemon-red'}`}>
                {fps} FPS
              </span>
            </div>
            <div className="flex justify-between items-center text-pokemon-ui-muted">
              <span>Player X, Z:</span>
              <span className="text-pokemon-ui-text font-semibold">
                {playerPos[0].toFixed(1)}, {playerPos[2].toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between items-center text-pokemon-ui-muted">
              <span>Active Pokémon:</span>
              <span className="text-pokemon-blue font-semibold">{pokemonCount} Entities</span>
            </div>
            <div className="flex justify-between items-center text-pokemon-ui-muted">
              <span>Asset Engine:</span>
              <span className="text-pokemon-green font-semibold">Phase 4 High-Def Rigs</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-[10px] uppercase tracking-wider text-pokemon-ui-muted font-bold">
              Environment Overrides
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={cycleWeather}
                className="p-2 pokemon-button flex items-center justify-between text-pokemon-ui-text"
              >
                <div className="flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-pokemon-blue" />
                  <span className="text-[11px]">Weather</span>
                </div>
                <span className="text-[10px] text-pokemon-blue font-bold uppercase">{currentWeather}</span>
              </button>

              <button
                onClick={toggleTime}
                className="p-2 pokemon-button flex items-center justify-between text-pokemon-ui-text"
              >
                <div className="flex items-center gap-1.5">
                  {currentTime === 'DAY' ? <Sun className="w-3.5 h-3.5 text-pokemon-yellow" /> : <Moon className="w-3.5 h-3.5 text-pokemon-blue" />}
                  <span className="text-[11px]">Time</span>
                </div>
                <span className="text-[10px] text-pokemon-yellow font-bold uppercase">{currentTime}</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-[10px] uppercase tracking-wider text-pokemon-ui-muted font-bold">
              Quick Actions
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => toggleDebugOption('showJoystick')}
                className={`p-2 pokemon-button flex items-center justify-center gap-1.5 ${
                  debug.showJoystick
                    ? 'border-pokemon-blue text-pokemon-blue'
                    : 'text-pokemon-ui-muted'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="text-[11px]">Joystick</span>
              </button>

              <button
                onClick={resetPosition}
                className="p-2 pokemon-button flex items-center justify-center gap-1.5 text-pokemon-ui-text"
              >
                <Activity className="w-3.5 h-3.5 text-pokemon-yellow" />
                <span className="text-[11px]">Reset Pos</span>
              </button>
            </div>

            <PokemonButton
              onClick={triggerResetWorld}
              variant="danger"
              className="w-full p-2 text-[11px] flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Full World Reset</span>
            </PokemonButton>
          </div>
        </div>
      )}
    </div>
  );
};
