/**
 * Pokémon 3D RPG — Pure 3D Game Screen (Zero 2D UI Overlay)
 * 
 * Delivers a 100% pure, uninterrupted 3D cinematic exploration experience.
 */

import React from 'react';
import { GameCanvas } from '../game/GameCanvas';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';

export const GameScreen: React.FC = () => {
  // Activate keyboard controls (WASD / Arrows / Space)
  useKeyboardControls();

  return (
    <main className="relative w-full h-full overflow-hidden bg-slate-950 select-none">
      {/* Pure 100% Fullscreen 3D WebGL World */}
      <GameCanvas />
    </main>
  );
};
