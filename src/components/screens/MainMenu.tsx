import React, { useState } from 'react';
import { Play, Gamepad2, Info, Flame, Droplets, Leaf, Zap } from 'lucide-react';
import { useGameStore } from '../../state/useGameStore';
import { usePlayerPartyStore } from '../../state/usePlayerPartyStore';
import { POKEMON_SPECIES_DATABASE } from '../../data/pokemon';
import { POKEMON_TYPE_THEMES } from '../../data/pokemon/types';
import { PokemonType } from '../../types/pokemon';
import { PokemonButton } from '../ui/PokemonButton';
import { PokemonCard } from '../ui/PokemonCard';
import { TypeBadge } from '../ui/TypeBadge';

export const MainMenu: React.FC = () => {
  const setScreen = useGameStore((state) => state.setScreen);
  const party = usePlayerPartyStore((state) => state.party);
  const initStarter = usePlayerPartyStore((state) => state.initStarter);
  const hasChosenStarter = usePlayerPartyStore((state) => state.hasChosenStarter);

  const [selectedStarterId, setSelectedStarterId] = useState<string>('pikachu');
  const [showInfo, setShowInfo] = useState(false);

  const starterIds = ['bulbasaur', 'charmander', 'squirtle', 'pikachu'];
  const starters = starterIds
    .map((id) => POKEMON_SPECIES_DATABASE[id])
    .filter(Boolean);

  const getElementIcon = (type: PokemonType) => {
    switch (type) {
      case 'Fire': return <Flame className="w-4 h-4" />;
      case 'Water': return <Droplets className="w-4 h-4" />;
      case 'Grass': return <Leaf className="w-4 h-4" />;
      case 'Electric': return <Zap className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const handleStartGame = () => {
    if (!hasChosenStarter || party.length === 0) {
      initStarter(selectedStarterId);
    }
    setScreen('PLAYING');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-pokemon-dark select-none overflow-y-auto font-pokemon">
      <div className="scanlines" />
      
      {/* Top Header */}
      <div className="w-full flex justify-between items-center max-w-md pt-2 relative z-10">
        <div className="pokemon-card px-4 py-2 flex items-center gap-2">
          <span className="text-xs font-bold text-pokemon-ui-text">POKÉMON ENGINE v1.0</span>
        </div>

        <button
          onClick={() => setShowInfo(!showInfo)}
          className="pokemon-button w-10 h-10 flex items-center justify-center p-0"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Center Branding & Pokémon Showcase */}
      <div className="w-full max-w-md flex flex-col items-center my-auto py-6 relative z-10">
        {/* Title Card */}
        <div className="pokemon-card mb-6 text-center p-6">
          <h1 className="text-3xl font-black tracking-wider text-pokemon-red uppercase mb-2">
            POKÉMON RPG
          </h1>
          <p className="text-xs font-bold tracking-widest text-pokemon-ui-muted uppercase">
            3D EXPLORATION & BATTLE
          </p>
        </div>

        {/* Choose Starter Section */}
        <div className="w-full mb-3 text-left flex justify-between items-center px-1">
          <span className="text-xs font-bold text-pokemon-ui-muted uppercase tracking-wider">
            {hasChosenStarter ? 'ACTIVE STARTER' : 'CHOOSE YOUR STARTER'}
          </span>
          {hasChosenStarter && (
            <span className="text-[10px] font-bold px-2 py-1 rounded bg-pokemon-green text-pokemon-dark">
              SELECTED
            </span>
          )}
        </div>

        {/* Starter Cards */}
        <div className="w-full grid grid-cols-4 gap-2 mb-6">
          {starters.map((pokemon) => {
            const theme = POKEMON_TYPE_THEMES[pokemon.primaryType];
            const isSelected = selectedStarterId === pokemon.id;

            return (
              <button
                key={pokemon.id}
                onClick={() => setSelectedStarterId(pokemon.id)}
                className={`pokemon-card p-2 flex flex-col items-center transition ${
                  isSelected ? 'border-pokemon-blue' : ''
                }`}
              >
                <div
                  className="w-12 h-12 rounded-lg mb-2 flex items-center justify-center border-2 border-pokemon-ui-border"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  {getElementIcon(pokemon.primaryType)}
                </div>
                <span className="font-bold text-xs text-pokemon-ui-text">{pokemon.name}</span>
                <span className="text-[9px] text-pokemon-ui-muted">
                  #{String(pokemon.nationalDexNumber).padStart(3, '0')}
                </span>
              </button>
            );
          })}
        </div>

        {/* Play Button */}
        <PokemonButton
          variant="primary"
          onClick={handleStartGame}
          className="w-full py-4 text-lg flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5" />
          <span>{hasChosenStarter ? 'CONTINUE' : 'START ADVENTURE'}</span>
        </PokemonButton>
      </div>

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="pokemon-dialog w-full max-w-sm">
            <div className="flex items-center justify-between border-b-2 border-pokemon-ui-border pb-3 mb-4">
              <div className="flex items-center gap-2 font-bold text-pokemon-ui-text">
                <Gamepad2 className="w-5 h-5" />
                <span>CONTROLS</span>
              </div>
              <button
                onClick={() => setShowInfo(false)}
                className="pokemon-button text-xs px-3 py-1"
              >
                CLOSE
              </button>
            </div>

            <div className="space-y-3 text-sm text-pokemon-ui-text">
              <div className="pokemon-card p-3">
                <span className="font-bold block mb-2">MOVEMENT:</span>
                <p>• WASD / Arrow Keys to move</p>
                <p>• Virtual Joystick for touch</p>
                <p>• P / Esc to pause</p>
              </div>

              <div className="pokemon-card p-3">
                <span className="font-bold block mb-2">COMBAT:</span>
                <p>• Approach wild Pokémon to battle</p>
                <p>• Use moves to weaken opponents</p>
                <p>• Throw Poké Balls to capture</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full max-w-md text-center py-2 text-[10px] text-pokemon-ui-muted relative z-10">
        POKÉMON 3D RPG • EXPLORATION & COLLECTION
      </footer>
    </div>
  );
};
