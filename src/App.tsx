/**
 * Pokémon 3D RPG — 100% Pure Pokémon GO Game Engine
 * 
 * Screens:
 * - OVERWORLD: Fullscreen 3D Map (Nagpur GPS), Trainer Avatar, Walking Buddy, PokéStops, Gyms & Spawns
 * - CAPTURE: 3D Poké Ball Throwing, Curveball Physics, Berry Feeding & 3-Shake Catch
 * - STORAGE: Pokémon Storage Box, Arc CP Power-Up, Evolution, Eggs & Team Leader 3-Star IV Appraisal
 * - ITEMS: Item Bag with capacity gauge & supplies
 * - POKEDEX: National Pokédex with 1,025 Pokémon, 3D animated inspection & Shiny toggle
 * - BATTLE: GO Battle League & Team GO Rocket Stadium
 */

import React, { useState } from 'react';
import { PoGoOverworldMap } from './components/pogo/PoGoOverworldMap';
import { PoGoPokemonStorageScreen } from './components/pogo/PoGoPokemonStorageScreen';
import { PoGoItemBagScreen } from './components/pogo/PoGoItemBagScreen';
import { PoGoPokedexScreen } from './components/pogo/PoGoPokedexScreen';
import { PoGoScreenMode } from './components/pogo/PoGoMainMenuModal';
import { PokemonGoCapture3D } from './components/game/PokemonGoCapture3D';
import { PokemonUniteArena3D } from './components/game/PokemonUniteArena3D';
import { useGameStore } from './state/useGameStore';
import { usePlayerPartyStore } from './state/usePlayerPartyStore';

export const App: React.FC = () => {
  const { screen, setScreen, activeEncounterPokemon } = useGameStore();
  const { hasChosenStarter, initStarter } = usePlayerPartyStore();

  const [currentPoGoScreen, setCurrentPoGoScreen] = useState<PoGoScreenMode>('OVERWORLD');

  // Initialize Starter on first launch
  React.useEffect(() => {
    if (!hasChosenStarter) {
      initStarter('pikachu');
    }
  }, [hasChosenStarter, initStarter]);

  // If there is an active capture encounter from map
  if (screen === 'CAPTURE' && activeEncounterPokemon) {
    return (
      <div className="w-full min-h-screen bg-slate-950 flex items-center justify-center p-2 md:p-4">
        <div className="w-full max-w-md h-[95vh] relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
          <PokemonGoCapture3D />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-2 md:p-4 font-sans select-none">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md h-[95vh] relative rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.9)] border border-slate-800 bg-slate-950 flex flex-col">
        {/* 1. OVERWORLD MAP */}
        {currentPoGoScreen === 'OVERWORLD' && (
          <PoGoOverworldMap
            onNavigateScreen={(s) => {
              if (s === 'SHOP') setCurrentPoGoScreen('ITEMS');
              else setCurrentPoGoScreen(s);
            }}
          />
        )}

        {/* 2. POKÉMON STORAGE & EGGS */}
        {currentPoGoScreen === 'STORAGE' && (
          <PoGoPokemonStorageScreen onClose={() => setCurrentPoGoScreen('OVERWORLD')} />
        )}

        {/* 3. ITEM BAG & SHOP */}
        {currentPoGoScreen === 'ITEMS' && (
          <PoGoItemBagScreen onClose={() => setCurrentPoGoScreen('OVERWORLD')} />
        )}

        {/* 4. NATIONAL POKÉDEX */}
        {currentPoGoScreen === 'POKEDEX' && (
          <PoGoPokedexScreen onClose={() => setCurrentPoGoScreen('OVERWORLD')} />
        )}

        {/* 5. BATTLE STADIUM */}
        {currentPoGoScreen === 'BATTLE' && (
          <div className="w-full h-full relative">
            <PokemonUniteArena3D />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
