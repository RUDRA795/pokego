import React from 'react';
import { Play, RotateCcw, Home, Gamepad2 } from 'lucide-react';
import { useGameStore } from '../../state/useGameStore';
import { PokemonButton } from './PokemonButton';
import { PokemonCard } from './PokemonCard';

export const PauseModal: React.FC = () => {
  const isPaused = useGameStore((state) => state.isPaused);
  const encounter = useGameStore((state) => state.encounter);
  const setPaused = useGameStore((state) => state.setPaused);
  const setScreen = useGameStore((state) => state.setScreen);
  const triggerResetWorld = useGameStore((state) => state.triggerResetWorld);

  // If encounter modal is open, let encounter handle the pause
  if (!isPaused || encounter !== null) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 animate-fade-in">
      <div className="w-full max-w-xs pokemon-dialog p-6 flex flex-col items-center text-center">
        <h2 className="text-xl font-extrabold text-pokemon-ui-text tracking-wider uppercase mb-1">
          Game Paused
        </h2>
        <p className="text-xs text-pokemon-ui-muted mb-5 font-medium">Pokémon 3D RPG</p>

        <div className="w-full pokemon-card p-3 mb-5 text-left text-xs text-pokemon-ui-text">
          <div className="flex items-center gap-1.5 font-bold text-pokemon-ui-text mb-1.5">
            <Gamepad2 className="w-4 h-4 text-pokemon-green" />
            <span>Controls</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[11px] text-pokemon-ui-muted">
            <div><span className="font-mono text-pokemon-ui-text">WASD / Arrows:</span> Move</div>
            <div><span className="font-mono text-pokemon-ui-text">Joystick:</span> Mobile touch</div>
            <div><span className="font-mono text-pokemon-ui-text">P / Esc:</span> Pause</div>
            <div><span className="font-mono text-pokemon-ui-text">Approach:</span> Encounter</div>
          </div>
        </div>

        <div className="w-full flex flex-col gap-2.5">
          <PokemonButton
            variant="success"
            onClick={() => setPaused(false)}
            className="w-full py-3 text-sm flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            RESUME
          </PokemonButton>

          <PokemonButton
            onClick={() => {
              triggerResetWorld();
              setPaused(false);
            }}
            className="w-full py-2.5 text-xs flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            RESET WORLD
          </PokemonButton>

          <PokemonButton
            onClick={() => {
              setPaused(false);
              setScreen('MENU');
            }}
            className="w-full py-2.5 text-xs flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            MAIN MENU
          </PokemonButton>
        </div>
      </div>
    </div>
  );
};
