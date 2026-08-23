import React from 'react';
import { useGameStore } from './state/useGameStore';
import { LoadingScreen } from './components/screens/LoadingScreen';
import { MainMenu } from './components/screens/MainMenu';
import { GameScreen } from './components/screens/GameScreen';
import { PokemonUniteBattleScreen } from './components/battle/PokemonUniteBattleScreen';
import { PokemonGoCaptureScreen } from './components/capture/PokemonGoCaptureScreen';
import { createRuntimePokemon } from './battle/RuntimePokemon';
import { getPokemonById } from './data/pokemon';

export const App: React.FC = () => {
  const screen = useGameStore((state) => state.screen);
  const encounter = useGameStore((state) => state.encounter);
  const setScreen = useGameStore((state) => state.setScreen);
  const dismissEncounter = useGameStore((state) => state.dismissEncounter);
  const triggerResetWorld = useGameStore((state) => state.triggerResetWorld);

  const handleEndMode = (result: 'VICTORY' | 'DEFEAT' | 'CAPTURED' | 'ESCAPED') => {
    dismissEncounter();
    setScreen('PLAYING');
    if (result === 'VICTORY' || result === 'CAPTURED') {
      triggerResetWorld();
    }
  };

  const currentSpecies = encounter
    ? (encounter.pokemonSpecies || getPokemonById(encounter.pokemon.speciesId))
    : null;

  const wildPokemonInstance = (encounter && currentSpecies)
    ? createRuntimePokemon(
        currentSpecies,
        encounter.pokemon.level || 5,
        true,
        encounter.pokemon.instanceId
      )
    : null;

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-950 text-white font-sans">
      {screen === 'LOADING' && <LoadingScreen />}
      {screen === 'MENU' && <MainMenu />}
      {screen === 'PLAYING' && <GameScreen />}
      {screen === 'CAPTURE' && currentSpecies && (
        <PokemonGoCaptureScreen
          species={currentSpecies}
          level={encounter?.pokemon.level || 5}
          onEscape={() => handleEndMode('ESCAPED')}
          onCaptured={() => handleEndMode('CAPTURED')}
        />
      )}
      {screen === 'BATTLE' && wildPokemonInstance && (
        <PokemonUniteBattleScreen
          wildPokemonInstance={wildPokemonInstance}
          onBattleEnd={handleEndMode}
        />
      )}
    </div>
  );
};

export default App;
