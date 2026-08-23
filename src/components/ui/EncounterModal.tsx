/**
 * Pokémon 3D RPG — Pokémon GO Style Encounter Action Card
 * 
 * Features:
 * - Glassmorphic high-production card with authentic typing badges and lore.
 * - Options to enter Pokémon GO Swipe Capture Mode or UNITE 3D Battle Arena.
 */

import React from 'react';
import { Swords, Disc3, Footprints, ShieldAlert } from 'lucide-react';
import { useGameStore } from '../../state/useGameStore';
import { usePlayerPartyStore } from '../../state/usePlayerPartyStore';
import { POKEMON_TYPE_THEMES } from '../../data/pokemon/types';
import { PokemonType } from '../../types/pokemon';
import { CombatPowerSystem } from '../../systems/progression/CombatPowerSystem';
import { SoundSystem } from '../../systems/audio/SoundSystem';
import { PokemonButton } from './PokemonButton';
import { PokemonCard } from './PokemonCard';
import { TypeBadge } from './TypeBadge';

export const EncounterModal: React.FC = () => {
  const encounter = useGameStore((state) => state.encounter);
  const dismissEncounter = useGameStore((state) => state.dismissEncounter);
  const setScreen = useGameStore((state) => state.setScreen);

  const party = usePlayerPartyStore((state) => state.party);
  const initStarter = usePlayerPartyStore((state) => state.initStarter);
  const markSeen = usePlayerPartyStore((state) => state.markSeen);

  if (!encounter) return null;

  const { pokemon, pokemonSpecies } = encounter;
  markSeen(pokemonSpecies.id);

  const name = pokemonSpecies.name;
  const category = pokemonSpecies.speciesCategory;
  const dexNum = `#${String(pokemonSpecies.nationalDexNumber).padStart(3, '0')}`;
  const description = pokemonSpecies.pokedexEntry;
  const level = pokemon.level;

  const primaryType: PokemonType = pokemonSpecies.primaryType;
  const secondaryType: PokemonType | undefined = pokemonSpecies.secondaryType;

  const primaryTheme = POKEMON_TYPE_THEMES[primaryType] || POKEMON_TYPE_THEMES.Normal;
  const secondaryTheme = secondaryType ? POKEMON_TYPE_THEMES[secondaryType] : undefined;

  const cp = CombatPowerSystem.calculateCP(pokemonSpecies.baseStats, level);

  const handleStartCapture = () => {
    SoundSystem.playTap();
    setScreen('CAPTURE');
  };

  const handleStartBattle = () => {
    SoundSystem.playTap();
    if (party.length === 0) {
      initStarter('pikachu');
    }
    setScreen('BATTLE');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fade-in">
      <div className="relative w-full max-w-sm pokemon-dialog p-6 flex flex-col items-center text-center">
        <div
          className="absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: primaryTheme.primaryColor }}
        />

        <div className="w-full flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-pokemon-red/20 border-2 border-pokemon-red text-pokemon-red text-xs font-black tracking-wider uppercase">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Wild Pokémon</span>
          </div>
          <span className="font-mono text-xs font-bold text-pokemon-ui-muted px-2.5 py-0.5 rounded pokemon-card">
            {dexNum}
          </span>
        </div>

        <div className="px-3.5 py-0.5 rounded pokemon-card text-xs font-black text-pokemon-yellow mb-2">
          CP {cp}
        </div>

        <h2 className="text-2xl font-black tracking-tight text-pokemon-ui-text uppercase mb-0.5">
          {name}
        </h2>
        <p className="text-xs text-pokemon-ui-muted mb-3 font-medium">{category}</p>

        <div className="flex items-center gap-2 mb-4">
          <TypeBadge type={primaryType} />
          {secondaryType && <TypeBadge type={secondaryType} />}
          <span className="px-3 py-0.5 rounded text-xs font-bold pokemon-card text-pokemon-green">
            Lv. {level}
          </span>
        </div>

        <div className="w-full pokemon-card p-3 mb-5 text-left">
          <p className="text-xs text-pokemon-ui-text leading-relaxed italic">
            "{description}"
          </p>
        </div>

        <div className="w-full grid grid-cols-1 gap-2.5">
          <div className="grid grid-cols-2 gap-2">
            <PokemonButton
              variant="success"
              onClick={handleStartCapture}
              className="py-3 text-xs flex items-center justify-center gap-2"
            >
              <Disc3 className="w-4 h-4" />
              GO CATCH
            </PokemonButton>

            <PokemonButton
              variant="danger"
              onClick={handleStartBattle}
              className="py-3 text-xs flex items-center justify-center gap-2"
            >
              <Swords className="w-4 h-4" />
              BATTLE
            </PokemonButton>
          </div>

          <PokemonButton
            onClick={() => { dismissEncounter(); SoundSystem.playTap(); }}
            className="w-full py-2.5 text-xs flex items-center justify-center gap-1.5"
          >
            <Footprints className="w-4 h-4" />
            RUN AWAY
          </PokemonButton>
        </div>
      </div>
    </div>
  );
};
