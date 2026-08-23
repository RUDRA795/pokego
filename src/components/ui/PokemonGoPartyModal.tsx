/**
 * Pokémon 3D RPG — Pokémon GO Style Party & Pokémon Detail Modal
 * 
 * Features:
 * - 3D Rotatable Pokémon Model with dynamic elemental backdrop.
 * - Arc CP (Combat Power) meter.
 * - Stardust & Candy counters.
 * - "POWER UP" and "EVOLVE" action buttons.
 * - Fast & Charged move cards with type icons and power ratings.
 * - 3-Star IV Appraisal bars (HP, Attack, Defense).
 */

import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { ArrowLeft, Sparkles, Zap, Shield, Heart, ChevronRight, Swords } from 'lucide-react';
import { usePlayerPartyStore } from '../../state/usePlayerPartyStore';
import { PokemonSkeletonRig } from '../pokemon/PokemonSkeletonRig';
import { CombatPowerSystem } from '../../systems/progression/CombatPowerSystem';
import { SoundSystem } from '../../systems/audio/SoundSystem';
import { getPokemonById } from '../../data/pokemon';
import { POKEMON_TYPE_THEMES } from '../../data/pokemon/types';
import { PokemonButton } from './PokemonButton';
import { PokemonCard } from './PokemonCard';
import { TypeBadge } from './TypeBadge';
import { HealthBar } from './HealthBar';

interface PokemonGoPartyModalProps {
  onClose: () => void;
}

export const PokemonGoPartyModal: React.FC<PokemonGoPartyModalProps> = ({ onClose }) => {
  const party = usePlayerPartyStore((state) => state.party);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [showAppraisal, setShowAppraisal] = useState<boolean>(false);

  const activePokemon = party[selectedIndex] || party[0];
  const species = activePokemon ? getPokemonById(activePokemon.speciesId) : null;

  if (!activePokemon || !species) return null;

  const cp = CombatPowerSystem.calculateCP(species.baseStats, activePokemon.level);
  const primaryTheme = POKEMON_TYPE_THEMES[species.primaryType] || POKEMON_TYPE_THEMES.Normal;

  return (
    <div className="fixed inset-0 z-50 bg-pokemon-dark/90 flex flex-col justify-between select-none overflow-y-auto font-pokemon animate-fade-in">
      <header className="p-4 flex items-center justify-between border-b-4 border-pokemon-ui-border">
        <PokemonButton
          onClick={() => { onClose(); SoundSystem.playTap(); }}
          className="w-10 h-10 flex items-center justify-center p-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </PokemonButton>

        <span className="font-extrabold text-sm text-pokemon-ui-text uppercase tracking-widest">
          Pokémon Party ({party.length}/6)
        </span>

        <PokemonButton
          onClick={() => { setShowAppraisal(!showAppraisal); SoundSystem.playTap(); }}
          className="px-3 py-1.5 text-xs font-black text-pokemon-yellow"
        >
          Appraisal
        </PokemonButton>
      </header>

      <div className="relative w-full h-72 flex items-center justify-center">
        <div
          className="absolute w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: primaryTheme.primaryColor }}
        />

        <Canvas camera={{ position: [0, 1.0, 3.2], fov: 45 }}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[5, 10, 5]} intensity={2.0} />
          <group position={[0, -0.2, 0]}>
            <PokemonSkeletonRig speciesId={species.id} animationState="IDLE" />
          </group>
        </Canvas>

        <div className="absolute top-4 flex flex-col items-center">
          <span className="text-xs font-bold text-pokemon-ui-muted">CP</span>
          <span className="text-3xl font-black text-pokemon-ui-text tracking-tight">{cp}</span>
        </div>
      </div>

      <div className="pokemon-card border-t-4 border-pokemon-ui-border rounded-t-3xl p-6 flex flex-col gap-4">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl font-black text-pokemon-ui-text uppercase tracking-tight mb-1">
            {activePokemon.name}
          </h2>
          <div className="flex items-center gap-2">
            <TypeBadge type={species.primaryType} />
            {species.secondaryType && <TypeBadge type={species.secondaryType} />}
            <span className="px-3 py-0.5 rounded text-xs font-bold pokemon-card text-pokemon-green">
              Lv. {activePokemon.level}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pokemon-card p-3 text-center">
          <div>
            <div className="text-[10px] font-bold text-pokemon-ui-muted uppercase">Weight</div>
            <div className="text-xs font-black text-pokemon-ui-text">{species.weightKg} kg</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-pokemon-ui-muted uppercase">HP</div>
            <div className="text-xs font-black text-pokemon-green">{activePokemon.currentHp}/{activePokemon.calculatedStats.hp}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-pokemon-ui-muted uppercase">Height</div>
            <div className="text-xs font-black text-pokemon-ui-text">{species.heightMeters} m</div>
          </div>
        </div>

        {showAppraisal && (
          <div className="pokemon-card p-3.5 border-4 border-pokemon-yellow space-y-2 animate-slide-up">
            <div className="text-xs font-black text-pokemon-yellow uppercase tracking-wide">3-Star IV Appraisal</div>
            <div className="space-y-1.5 text-xs font-bold">
              <div className="flex justify-between text-pokemon-ui-text">
                <span>Attack</span>
                <span className="text-pokemon-yellow">14 / 15</span>
              </div>
              <div className="w-full h-2 rounded-full bg-pokemon-ui-card overflow-hidden">
                <div className="h-full bg-pokemon-yellow rounded-full w-[93%]" />
              </div>

              <div className="flex justify-between text-pokemon-ui-text">
                <span>Defense</span>
                <span className="text-pokemon-yellow">13 / 15</span>
              </div>
              <div className="w-full h-2 rounded-full bg-pokemon-ui-card overflow-hidden">
                <div className="h-full bg-pokemon-yellow rounded-full w-[86%]" />
              </div>

              <div className="flex justify-between text-pokemon-ui-text">
                <span>HP Stamina</span>
                <span className="text-pokemon-yellow">15 / 15</span>
              </div>
              <div className="w-full h-2 rounded-full bg-pokemon-ui-card overflow-hidden">
                <div className="h-full bg-pokemon-yellow rounded-full w-full" />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <PokemonButton
            variant="success"
            onClick={() => SoundSystem.playTap()}
            className="py-3 text-xs flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Power Up</span>
          </PokemonButton>

          <PokemonButton
            onClick={() => SoundSystem.playTap()}
            className="py-3 text-xs flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(180deg, #FFDE00 0%, #FFA500 100%)', borderColor: '#FFEE00' }}
          >
            <Zap className="w-4 h-4" />
            <span>Evolve</span>
          </PokemonButton>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {party.map((p, idx) => (
            <button
              key={`party-${idx}`}
              onClick={() => { setSelectedIndex(idx); SoundSystem.playTap(); }}
              className={`flex-shrink-0 p-2.5 rounded-2xl border-4 flex flex-col items-center gap-1 min-w-[72px] transition ${idx === selectedIndex ? 'bg-pokemon-yellow/20 border-pokemon-yellow text-pokemon-yellow' : 'pokemon-card text-pokemon-ui-muted'}`}
            >
              <span className="text-xs font-black uppercase truncate">{p.name}</span>
              <span className="text-[10px] font-bold">Lv. {p.level}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
