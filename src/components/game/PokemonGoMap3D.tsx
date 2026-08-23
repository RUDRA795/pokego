/**
 * Pokémon 3D RPG — Pokémon GO 3D Exploration & Radar Map
 * 
 * Features:
 * - 3D GPS Overworld with dynamic terrain grid and pulsing radar rings.
 * - 3D Player Avatar with keyboard (WASD/Arrows) and virtual on-screen joystick.
 * - Roaming wild Pokémon with 3D animated sprites and CP tags.
 * - Interactive 3D PokéStops that can be spun for items & Stardust.
 * - Encounter trigger router (GO Capture Mode or UNITE Action Stadium Battle).
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore, PokeStop } from '../../state/useGameStore';
import { usePlayerPartyStore } from '../../state/usePlayerPartyStore';
import { POKEMON_SPECIES_LIST, POKEMON_SPECIES_DATABASE } from '../../data/pokemon/species';
import { createRuntimePokemon } from '../../battle/RuntimePokemon';
import { getPokemonAnimated, getPokemonIcon } from '../../data/pokemon/images';
import { POKEMON_TYPE_THEMES } from '../../data/pokemon/types';
import { RuntimePokemon } from '../../battle/types';
import {
  Compass,
  Sparkles,
  Zap,
  Swords,
  Layers,
  ShoppingBag,
  Disc,
  Star,
  MapPin,
  Flame,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface WildMapSpawn {
  uid: string;
  speciesId: string;
  dex: number;
  name: string;
  cp: number;
  x: number;
  z: number;
  primaryType: string;
}

// 3D Pulsing Radar Rings
const RadarRings: React.FC<{ playerPos: [number, number, number] }> = ({ playerPos }) => {
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ringRef1.current) {
      const scale1 = ((t * 0.8) % 1) * 7.5;
      ringRef1.current.scale.set(scale1, scale1, 1);
      (ringRef1.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - (scale1 / 7.5));
    }
    if (ringRef2.current) {
      const scale2 = (((t * 0.8) + 0.5) % 1) * 7.5;
      ringRef2.current.scale.set(scale2, scale2, 1);
      (ringRef2.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - (scale2 / 7.5));
    }
  });

  return (
    <group position={[playerPos[0], 0.04, playerPos[2]]}>
      {/* Outer Pulse Ring 1 */}
      <mesh ref={ringRef1} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.05, 32]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Outer Pulse Ring 2 */}
      <mesh ref={ringRef2} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.05, 32]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Player Standing Glow Disk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.2, 32]} />
        <meshBasicMaterial color="#0284c7" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// 3D Interactive PokéStop Pillar
const PokeStop3D: React.FC<{
  stop: PokeStop;
  isReady: boolean;
  onSelect: () => void;
}> = ({ stop, isReady, onSelect }) => {
  const discRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (discRef.current) {
      discRef.current.rotation.y = t * 1.5;
      discRef.current.position.y = 2.4 + Math.sin(t * 2) * 0.15;
    }
  });

  return (
    <group position={[stop.x, 0, stop.z]} onClick={onSelect}>
      {/* Base Column */}
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.4, 0.6, 2.0, 16]} />
        <meshStandardMaterial color={isReady ? '#0284c7' : '#64748b'} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Spinning Photo Disc */}
      <mesh ref={discRef} position={[0, 2.4, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.1, 32]} />
        <meshStandardMaterial
          color={isReady ? '#38bdf8' : '#94a3b8'}
          emissive={isReady ? '#0284c7' : '#000000'}
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Ground Ring */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.0, 1.3, 32]} />
        <meshBasicMaterial color={isReady ? '#38bdf8' : '#64748b'} transparent opacity={0.7} />
      </mesh>
    </group>
  );
};

// 3D Player Avatar representation
const PlayerAvatar3D: React.FC<{ position: [number, number, number]; rotationY: number }> = ({
  position,
  rotationY,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = 0.9 + Math.sin(t * 4) * 0.04;
    }
  });

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <group ref={groupRef}>
        {/* Head / Cap */}
        <mesh position={[0, 0.9, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
        {/* Cap Visor */}
        <mesh position={[0, 0.95, 0.25]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.35, 0.05, 0.25]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* Torso / Jacket */}
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.25, 0.3, 0.8, 16]} />
          <meshStandardMaterial color="#2563eb" />
        </mesh>
      </group>
    </group>
  );
};

// 3D Overworld Environment
const MapEnvironment3D: React.FC = () => {
  return (
    <group>
      {/* Endless Stylized Grass Plane */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[180, 180]} />
        <meshStandardMaterial color="#064e3b" roughness={0.9} />
      </mesh>

      {/* Stylized GPS Grid Lines */}
      <gridHelper args={[180, 45, '#10b981', '#065f46']} position={[0, 0.01, 0]} />

      {/* Decorative Tree clusters */}
      {[
        [-12, 12], [14, 18], [-22, -14], [25, -20], [-8, -25], [30, 10], [-35, 5]
      ].map(([tx, tz], idx) => (
        <group key={`tree-${idx}`} position={[tx, 0, tz]}>
          <mesh position={[0, 1.2, 0]}>
            <coneGeometry args={[1.5, 3.2, 8]} />
            <meshStandardMaterial color="#047857" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.3, 0.4, 0.8, 8]} />
            <meshStandardMaterial color="#78350f" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export const PokemonGoMap3D: React.FC = () => {
  const { startEncounter, stardust, pokeCoins, playerLevel, playerExp, playerExpToNextLevel, pokeStops, spinPokeStop } =
    useGameStore();
  const { addItem, inventory } = usePlayerPartyStore();

  const [playerPos, setPlayerPos] = useState<[number, number, number]>([0, 0, 0]);
  const [playerRotY, setPlayerRotY] = useState<number>(0);
  const [activeSpawns, setActiveSpawns] = useState<WildMapSpawn[]>([]);
  const [selectedSpawn, setSelectedSpawn] = useState<WildMapSpawn | null>(null);
  const [spinningStopId, setSpinningStopId] = useState<string | null>(null);
  const [stopRewardMsg, setStopRewardMsg] = useState<string | null>(null);

  // Initialize roaming wild Pokémon spawns
  useEffect(() => {
    const popularSpecies = ['pikachu', 'charmander', 'bulbasaur', 'squirtle', 'gengar', 'snorlax', 'eevee', 'lucario', 'garchomp', 'rayquaza', 'cyndaquil', 'totodile'];
    const spawns: WildMapSpawn[] = popularSpecies.map((id, idx) => {
      const sp = POKEMON_SPECIES_DATABASE[id] || POKEMON_SPECIES_LIST[idx % POKEMON_SPECIES_LIST.length];
      const angle = (idx / popularSpecies.length) * Math.PI * 2;
      const dist = 6 + (idx % 3) * 6;
      return {
        uid: `spawn-${id}-${idx}`,
        speciesId: sp.id,
        dex: sp.nationalDexNumber,
        name: sp.name,
        cp: Math.floor(sp.baseStats.baseStatTotal * 4.5 + Math.random() * 200),
        x: Math.cos(angle) * dist,
        z: Math.sin(angle) * dist,
        primaryType: sp.primaryType,
      };
    });
    setActiveSpawns(spawns);
  }, []);

  // Keyboard Movement (WASD / Arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setPlayerPos((prev) => {
        let [x, y, z] = prev;
        const SPEED = 1.2;
        let angle = playerRotY;

        if (e.key === 'w' || e.key === 'ArrowUp') {
          z -= SPEED;
          angle = Math.PI;
        } else if (e.key === 's' || e.key === 'ArrowDown') {
          z += SPEED;
          angle = 0;
        } else if (e.key === 'a' || e.key === 'ArrowLeft') {
          x -= SPEED;
          angle = -Math.PI / 2;
        } else if (e.key === 'd' || e.key === 'ArrowRight') {
          x += SPEED;
          angle = Math.PI / 2;
        }
        setPlayerRotY(angle);
        return [x, y, z];
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerRotY]);

  // Virtual Joystick Touch / Drag
  const handleVirtualMove = (dx: number, dz: number) => {
    setPlayerPos((prev) => [prev[0] + dx * 1.5, prev[1], prev[2] + dz * 1.5]);
    const angle = Math.atan2(dx, dz);
    setPlayerRotY(angle);
  };

  // Handle PokéStop Interaction
  const handlePokeStopSpin = (stopId: string) => {
    const res = spinPokeStop(stopId);
    if (res.canSpin && res.rewards) {
      addItem('poke_ball', res.rewards.pokeBalls);
      addItem('razz_berry', res.rewards.berries);
      setStopRewardMsg(`+${res.rewards.pokeBalls} Poké Balls, +${res.rewards.berries} Berries, +${res.rewards.stardust} Stardust!`);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
      setTimeout(() => setStopRewardMsg(null), 3500);
    } else {
      setStopRewardMsg('PokéStop is on cooldown! Try again shortly.');
      setTimeout(() => setStopRewardMsg(null), 2500);
    }
  };

  // Trigger Encounter Modal
  const launchEncounter = (mode: 'CAPTURE' | 'BATTLE_UNITE') => {
    if (!selectedSpawn) return;
    const species = POKEMON_SPECIES_DATABASE[selectedSpawn.speciesId] || POKEMON_SPECIES_LIST[0];
    const runtimeWild = createRuntimePokemon(species, Math.floor(selectedSpawn.cp / 80) + 5, true);
    startEncounter(runtimeWild, mode);
  };

  return (
    <div className="w-full h-full relative select-none overflow-hidden rounded-3xl border border-slate-800 shadow-2xl bg-slate-950">
      {/* Top Floating Pokémon GO Glass HUD */}
      <div className="absolute top-4 left-4 right-4 z-30 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Player Trainer Profile Pill */}
        <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 shadow-2xl pointer-events-auto">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-black text-slate-950 text-sm shadow-md">
            {playerLevel}
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Trainer Lv. {playerLevel}</div>
            <div className="w-28 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.round((playerExp / playerExpToNextLevel) * 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Stardust & Poké Coins */}
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 shadow-2xl pointer-events-auto">
          <div className="flex items-center gap-1.5 text-xs font-black text-purple-300">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
            <span>{stardust.toLocaleString()}</span>
          </div>
          <div className="w-[1px] h-4 bg-white/10" />
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-300">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{pokeCoins}</span>
          </div>
        </div>
      </div>

      {/* Reward Notification Banner */}
      {stopRewardMsg && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-5 py-2 rounded-full font-black text-xs shadow-2xl border border-white/20 animate-bounce">
          {stopRewardMsg}
        </div>
      )}

      {/* 3D Overworld Canvas */}
      <div className="w-full h-[620px]">
        <Canvas
          camera={{ position: [playerPos[0], playerPos[1] + 16, playerPos[2] + 16], fov: 45 }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        >
          <ambientLight intensity={1.4} />
          <directionalLight position={[10, 30, 10]} intensity={2.2} castShadow />

          {/* Radar Waves & Player Avatar */}
          <RadarRings playerPos={playerPos} />
          <PlayerAvatar3D position={playerPos} rotationY={playerRotY} />

          {/* Interactive PokéStops */}
          {pokeStops.map((stop) => {
            const isReady = Date.now() - stop.lastSpunTime > 1000 * 60 * 2;
            return (
              <PokeStop3D
                key={stop.id}
                stop={stop}
                isReady={isReady}
                onSelect={() => handlePokeStopSpin(stop.id)}
              />
            );
          })}

          <MapEnvironment3D />
        </Canvas>
      </div>

      {/* Roaming Pokémon Overlays on Radar (HTML 3D Floating Avatars) */}
      <div className="absolute inset-0 pointer-events-none">
        {activeSpawns.map((spawn) => {
          // Calculate screen proximity to player
          const dist = Math.sqrt(Math.pow(spawn.x - playerPos[0], 2) + Math.pow(spawn.z - playerPos[2], 2));
          if (dist > 22) return null; // Outside radar range

          const theme = (POKEMON_TYPE_THEMES as any)[spawn.primaryType] || POKEMON_TYPE_THEMES.Normal;

          // 2.5D projected coordinates around center screen
          const screenX = 50 + (spawn.x - playerPos[0]) * 2.8;
          const screenY = 55 + (spawn.z - playerPos[2]) * 2.2;

          return (
            <div
              key={spawn.uid}
              onClick={() => setSelectedSpawn(spawn)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto group transition-transform duration-200 hover:scale-125"
              style={{ left: `${screenX}%`, top: `${screenY}%` }}
            >
              {/* CP Badge */}
              <div className="bg-slate-950/90 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10 text-[10px] font-black text-amber-300 text-center shadow-lg mb-1">
                CP {spawn.cp}
              </div>

              {/* 3D Animated Pokemon Avatar */}
              <div className="relative flex items-center justify-center">
                <div
                  className="absolute w-12 h-12 rounded-full blur-md opacity-50"
                  style={{ backgroundColor: theme.primaryColor }}
                />
                <img
                  src={getPokemonAnimated(spawn.dex)}
                  alt={spawn.name}
                  className="w-16 h-16 object-contain drop-shadow-2xl animate-float"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getPokemonIcon(spawn.dex);
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Virtual Joystick for Touch / Mouse Drag */}
      <div className="absolute bottom-6 left-6 z-30">
        <div className="bg-slate-900/90 backdrop-blur-xl p-3 rounded-full border border-white/10 shadow-2xl flex flex-col items-center gap-1">
          <button
            onClick={() => handleVirtualMove(0, -1)}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 font-black text-xs flex items-center justify-center transition"
          >
            W
          </button>
          <div className="flex gap-1">
            <button
              onClick={() => handleVirtualMove(-1, 0)}
              className="w-9 h-9 rounded-full bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 font-black text-xs flex items-center justify-center transition"
            >
              A
            </button>
            <button
              onClick={() => handleVirtualMove(0, 1)}
              className="w-9 h-9 rounded-full bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 font-black text-xs flex items-center justify-center transition"
            >
              S
            </button>
            <button
              onClick={() => handleVirtualMove(1, 0)}
              className="w-9 h-9 rounded-full bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 font-black text-xs flex items-center justify-center transition"
            >
              D
            </button>
          </div>
        </div>
      </div>

      {/* Encounter Choice Modal */}
      {selectedSpawn && (
        <div className="absolute inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl text-center relative animate-scale">
            <button
              onClick={() => setSelectedSpawn(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xs font-black"
            >
              ✕
            </button>

            {/* Spawn Header */}
            <div>
              <span className="text-[11px] font-black uppercase text-emerald-400">Wild Encounter</span>
              <h3 className="text-2xl font-black text-white">{selectedSpawn.name}</h3>
              <div className="text-sm font-black text-amber-400 mt-0.5">CP {selectedSpawn.cp}</div>
            </div>

            {/* 3D Animated Pokemon Preview */}
            <div className="flex items-center justify-center py-2">
              <img
                src={getPokemonAnimated(selectedSpawn.dex)}
                alt={selectedSpawn.name}
                className="w-36 h-36 object-contain drop-shadow-2xl"
              />
            </div>

            {/* Action Selection Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => launchEncounter('CAPTURE')}
                className="px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/25 transition-all"
              >
                <Disc className="w-4 h-4" />
                <span>Catch (GO)</span>
              </button>

              <button
                onClick={() => launchEncounter('BATTLE_UNITE')}
                className="px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-purple-500/25 transition-all"
              >
                <Swords className="w-4 h-4" />
                <span>Battle (UNITE)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
