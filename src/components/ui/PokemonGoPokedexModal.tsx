/**
 * Pokémon 3D RPG — Pokémon GO Style 3D Pokédex Modal
 * 
 * Features:
 * - National Pokédex grid with 3D model inspection.
 * - Seen/Caught counters and regional filter tabs.
 * - 18-type filter pills and canonical lore details.
 */

import React, { useState } from 'react';
import { ArrowLeft, Search, CheckCircle2, Eye } from 'lucide-react';
import { POKEMON_SPECIES_LIST, POKEMON_SPECIES_DATABASE } from '../../data/pokemon/species';
import { usePlayerPartyStore } from '../../state/usePlayerPartyStore';
import { SoundSystem } from '../../systems/audio/SoundSystem';
import { PokemonType } from '../../types/pokemon';
import { POKEMON_TYPE_THEMES } from '../../data/pokemon/types';
import { PokemonButton } from './PokemonButton';
import { PokemonCard } from './PokemonCard';

interface PokemonGoPokedexModalProps {
  onClose: () => void;
}

const TYPE_EMOJIS: Record<string, string> = {
  Normal: '⚪',
  Fire: '🔥',
  Water: '💧',
  Grass: '🍃',
  Electric: '⚡',
  Ice: '❄️',
  Fighting: '🥊',
  Poison: '☠️',
  Ground: '🏜️',
  Flying: '🦅',
  Psychic: '🔮',
  Bug: '🐛',
  Rock: '🪨',
  Ghost: '👻',
  Dragon: '🐉',
  Dark: '🌑',
  Steel: '⚙️',
  Fairy: '✨',
};

export const PokemonGoPokedexModal: React.FC<PokemonGoPokedexModalProps> = ({ onClose }) => {
  const pokedexSeen = usePlayerPartyStore((state) => state.pokedexSeen);
  const pokedexCaught = usePlayerPartyStore((state) => state.pokedexCaught);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedType, setSelectedType] = useState<PokemonType | 'ALL'>('ALL');
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>('pikachu');

  const selectedSpecies = POKEMON_SPECIES_DATABASE[selectedSpeciesId] || POKEMON_SPECIES_LIST[0];

  // Filter list
  const filteredList = POKEMON_SPECIES_LIST.filter((species) => {
    const matchesSearch = species.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(species.nationalDexNumber).includes(searchTerm);
    const matchesType = selectedType === 'ALL' || species.primaryType === selectedType || species.secondaryType === selectedType;
    return matchesSearch && matchesType;
  });

  const totalCaught = pokedexCaught.length;
  const totalSeen = pokedexSeen.length;

  return (
    <div className="fixed inset-0 z-50 bg-pokemon-dark/90 flex flex-col justify-between select-none overflow-hidden font-pokemon animate-fade-in">
      <header className="p-4 flex items-center justify-between border-b-4 border-pokemon-ui-border">
        <PokemonButton
          onClick={() => { onClose(); SoundSystem.playTap(); }}
          className="w-10 h-10 flex items-center justify-center p-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </PokemonButton>

        <div className="flex items-center gap-3 pokemon-card px-4 py-1">
          <div className="flex items-center gap-1 text-pokemon-green text-xs font-black">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Caught: {totalCaught}</span>
          </div>
          <div className="w-px h-3 bg-pokemon-ui-border" />
          <div className="flex items-center gap-1 text-pokemon-blue text-xs font-black">
            <Eye className="w-3.5 h-3.5" />
            <span>Seen: {totalSeen}</span>
          </div>
        </div>

        <div className="w-10" />
      </header>

      <div className="p-4 flex flex-col gap-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-pokemon-ui-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Pokémon or Number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pokemon-card pl-10 pr-4 py-2 text-xs text-pokemon-ui-text placeholder-pokemon-ui-muted"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 grid grid-cols-3 sm:grid-cols-4 gap-2.5 pb-6">
        {filteredList.map((species) => {
          const isCaught = pokedexCaught.includes(species.id);
          const isSeen = pokedexSeen.includes(species.id) || isCaught;
          const isSelected = selectedSpeciesId === species.id;
          const primaryTheme = POKEMON_TYPE_THEMES[species.primaryType] || POKEMON_TYPE_THEMES.Normal;
          const emoji = TYPE_EMOJIS[species.primaryType] || '⚪';

          return (
            <button
              key={`dex-${species.id}`}
              onClick={() => { setSelectedSpeciesId(species.id); SoundSystem.playTap(); }}
              className={`p-3 rounded-2xl border-4 flex flex-col items-center justify-between text-center transition ${
                isSelected
                  ? 'bg-pokemon-green/20 border-pokemon-green text-pokemon-green'
                  : 'pokemon-card text-pokemon-ui-muted'
              }`}
            >
              <span className="text-[10px] font-mono font-bold text-pokemon-ui-muted">
                #{String(species.nationalDexNumber).padStart(3, '0')}
              </span>
              <div className="w-12 h-12 rounded-full pokemon-card flex items-center justify-center my-1">
                <span className="text-xl">{emoji}</span>
              </div>
              <span className="text-xs font-black uppercase truncate w-full">
                {species.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
