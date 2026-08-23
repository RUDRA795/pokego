/**
 * Pokémon 3D RPG — Main Game Screen
 * 
 * Renders 3D Forest Valley Canvas, Pokémon GO style dynamic HUD, virtual joystick,
 * and seamless Party/Pokédex drawers.
 */

import React, { useState } from 'react';
import { GameCanvas } from '../game/GameCanvas';
import { PokemonGoHUD } from '../ui/PokemonGoHUD';
import { Joystick } from '../ui/Joystick';
import { EncounterModal } from '../ui/EncounterModal';
import { PokemonGoPartyModal } from '../ui/PokemonGoPartyModal';
import { PokemonGoPokedexModal } from '../ui/PokemonGoPokedexModal';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import { useGameStore } from '../../state/useGameStore';

export const GameScreen: React.FC = () => {
  // Activate keyboard controls for desktop development
  useKeyboardControls();

  const showJoystick = useGameStore((state) => state.debug.showJoystick);
  const encounter = useGameStore((state) => state.encounter);

  const [showParty, setShowParty] = useState(false);
  const [showPokedex, setShowPokedex] = useState(false);

  return (
    <main className="relative w-full h-full overflow-hidden bg-slate-950 select-none">
      {/* 3D WebGL Canvas Layer */}
      <GameCanvas />

      {/* Pokémon GO / UNITE Style Heads-Up Display */}
      {!encounter && (
        <PokemonGoHUD
          onOpenParty={() => setShowParty(true)}
          onOpenPokedex={() => setShowPokedex(true)}
        />
      )}

      {/* Virtual Mobile Joystick (Bottom-Left for dual-touch thumb ergonomics) */}
      {showJoystick && !encounter && !showParty && !showPokedex && (
        <div className="absolute bottom-6 left-6 z-20 pointer-events-auto">
          <Joystick size={128} />
        </div>
      )}

      {/* Modals & Overlays */}
      <EncounterModal />
      {showParty && <PokemonGoPartyModal onClose={() => setShowParty(false)} />}
      {showPokedex && <PokemonGoPokedexModal onClose={() => setShowPokedex(false)} />}
    </main>
  );
};
