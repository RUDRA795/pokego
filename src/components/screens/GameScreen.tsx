import React from 'react';
import { GameCanvas } from '../game/GameCanvas';
import { GameHUD } from '../ui/GameHUD';
import { Joystick } from '../ui/Joystick';
import { EncounterModal } from '../ui/EncounterModal';
import { PauseModal } from '../ui/PauseModal';
import { DebugPanel } from '../ui/DebugPanel';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import { useGameStore } from '../../state/useGameStore';

export const GameScreen: React.FC = () => {
  // Activate keyboard controls for desktop development
  useKeyboardControls();

  const showJoystick = useGameStore((state) => state.debug.showJoystick);
  const encounter = useGameStore((state) => state.encounter);

  return (
    <main className="relative w-full h-full overflow-hidden bg-slate-950 select-none">
      {/* 3D WebGL Canvas Layer */}
      <GameCanvas />

      {/* Heads-Up Display */}
      <GameHUD />

      {/* Virtual Mobile Joystick (Bottom-Right or Bottom-Center for thumb comfort) */}
      {showJoystick && !encounter && (
        <div className="absolute bottom-6 right-6 z-20 pointer-events-auto">
          <Joystick size={128} />
        </div>
      )}

      {/* Modals & Overlays */}
      <EncounterModal />
      <PauseModal />
      <DebugPanel />
    </main>
  );
};
