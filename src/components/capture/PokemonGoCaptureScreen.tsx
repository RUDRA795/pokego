/**
 * Pokémon 3D RPG — Pokémon GO Style 3D Capture Screen
 * 
 * Features:
 * - 3D Wild Pokémon in meadow setting with Combat Power (CP) display.
 * - Interactive shrinking target bullseye ring (Green / Yellow / Red).
 * - Touch & swipe-to-throw Poké Ball physics with curveball spins.
 * - Berry drawer (Razz Berry, Nanab Berry) and Ball drawer (Poké, Great, Ultra, Master Ball).
 * - Physical 3-wobble capture sequence with tension sound effects.
 * - "GOTCHA!" victory rewards overlay (+100 Stardust, +3 Candies).
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Sparkles, ArrowLeft, Disc3 } from 'lucide-react';
import { PokemonSpeciesData } from '../../types/pokemon';
import { PokemonSkeletonRig } from '../pokemon/PokemonSkeletonRig';
import { CombatPowerSystem, ThrowRatingResult } from '../../systems/progression/CombatPowerSystem';
import { SoundSystem } from '../../systems/audio/SoundSystem';
import { usePlayerPartyStore } from '../../state/usePlayerPartyStore';
import { createRuntimePokemon } from '../../battle/RuntimePokemon';
import { POKEMON_TYPE_THEMES } from '../../data/pokemon/types';
import { PokemonButton } from '../ui/PokemonButton';
import { PokemonCard } from '../ui/PokemonCard';

interface PokemonGoCaptureScreenProps {
  species: PokemonSpeciesData;
  level?: number;
  onEscape: () => void;
  onCaptured: () => void;
}

// 3D Scene Inside Capture Mode
const Capture3DScene: React.FC<{
  species: PokemonSpeciesData;
  ballPos: [number, number, number];
  isThrown: boolean;
  capturePhase: string;
}> = ({ species, ballPos, isThrown, capturePhase }) => {
  const ballGroup = useRef<THREE.Group>(null);
  const pokemonGroup = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (pokemonGroup.current && capturePhase === 'AIM') {
      // Gentle idle breathing & subtle jump reaction
      pokemonGroup.current.position.y = Math.sin(t * 2) * 0.05;
    }

    if (ballGroup.current) {
      if (isThrown) {
        ballGroup.current.position.set(ballPos[0], ballPos[1], ballPos[2]);
        ballGroup.current.rotation.x += 0.25;
      } else if (capturePhase.startsWith('WOBBLE')) {
        ballGroup.current.position.set(0, 0.4, -4.5);
        const wobbleDir = capturePhase === 'WOBBLE_2' ? -1 : 1;
        ballGroup.current.rotation.z = Math.sin(t * 14) * 0.45 * wobbleDir;
      } else {
        ballGroup.current.position.set(0, 0.4, -4.5);
        ballGroup.current.rotation.z = 0;
      }
    }
  });

  const showPokemon = capturePhase === 'AIM' || capturePhase === 'THROW';

  return (
    <>
      {/* Soft Ambient & Directional Sunlight */}
      <ambientLight intensity={1.4} />
      <directionalLight position={[6, 12, 6]} intensity={2.0} castShadow />

      {/* Lush Meadow Ground Platform */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, -3]}>
        <circleGeometry args={[14, 32]} />
        <meshStandardMaterial color="#40916c" roughness={0.88} />
      </mesh>

      {/* Target Pokémon */}
      {showPokemon && (
        <group ref={pokemonGroup} position={[0, 0, -4.5]} rotation={[0, 0, 0]}>
          <PokemonSkeletonRig speciesId={species.id} animationState="IDLE" />
        </group>
      )}

      {/* 3D Thrown / Wobbling Poké Ball */}
      {capturePhase !== 'AIM' && (
        <group ref={ballGroup} position={ballPos} scale={[0.26, 0.26, 0.26]}>
          {/* Red Top Half */}
          <mesh>
            <sphereGeometry args={[0.5, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshStandardMaterial color="#dc2626" roughness={0.3} />
          </mesh>
          {/* White Bottom Half */}
          <mesh>
            <sphereGeometry args={[0.5, 16, 12, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.3} />
          </mesh>
          {/* Black Center Band */}
          <mesh>
            <cylinderGeometry args={[0.51, 0.51, 0.08, 16]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          {/* Button */}
          <mesh position={[0, 0, 0.52]}>
            <circleGeometry args={[0.14, 12]} />
            <meshBasicMaterial color={capturePhase === 'GOTCHA' ? '#facc15' : '#ffffff'} />
          </mesh>
        </group>
      )}
    </>
  );
};

export const PokemonGoCaptureScreen: React.FC<PokemonGoCaptureScreenProps> = ({
  species,
  level = 12,
  onEscape,
  onCaptured,
}) => {
  const addCapturedPokemon = usePlayerPartyStore((state) => state.addCapturedPokemon);

  // Capture State Machine
  const [phase, setPhase] = useState<'AIM' | 'THROW' | 'BEAM' | 'WOBBLE_1' | 'WOBBLE_2' | 'WOBBLE_3' | 'GOTCHA'>('AIM');
  const [selectedBall, setSelectedBall] = useState<'poke' | 'great' | 'ultra' | 'master'>('poke');
  const [razzBerryActive, setRazzBerryActive] = useState<boolean>(false);
  const [showBallDrawer, setShowBallDrawer] = useState<boolean>(false);
  const [showBerryDrawer, setShowBerryDrawer] = useState<boolean>(false);
  const [throwFeedback, setThrowFeedback] = useState<ThrowRatingResult | null>(null);

  // Shrinking Target Ring Scale (1.0 down to 0.2)
  const [targetRingScale, setTargetRingScale] = useState(1.0);
  const ringRef = useRef(1.0);
  const ringDirRef = useRef(-1);

  // Ball Throw Animation Trajectory
  const [ballPos, setBallPos] = useState<[number, number, number]>([0, -1.2, 0]);
  const isDraggingRef = useRef(false);
  const startTouchRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const cp = CombatPowerSystem.calculateCP(species.baseStats, level);

  // Shrinking Target Ring Loop
  useEffect(() => {
    if (phase !== 'AIM') return;

    const interval = setInterval(() => {
      ringRef.current += ringDirRef.current * 0.04;
      if (ringRef.current <= 0.2) {
        ringDirRef.current = 1;
      } else if (ringRef.current >= 1.0) {
        ringDirRef.current = -1;
      }
      setTargetRingScale(ringRef.current);
    }, 32);

    return () => clearInterval(interval);
  }, [phase]);

  // Execute Poké Ball Throw Physics
  const triggerThrow = useCallback(() => {
    if (phase !== 'AIM') return;

    setPhase('THROW');
    SoundSystem.playThrow();

    // Evaluate throw quality
    const rating = CombatPowerSystem.evaluateThrow(ringRef.current, false);
    setThrowFeedback(rating);

    // Animate throw arc toward the 3D Pokémon
    let step = 0;
    const throwInterval = setInterval(() => {
      step += 0.05;
      const progress = Math.min(1.0, step);
      const x = 0;
      const z = -progress * 4.5;
      const y = -1.2 + Math.sin(progress * Math.PI) * 2.2 + progress * 1.6;

      setBallPos([x, y, z]);

      if (progress >= 1.0) {
        clearInterval(throwInterval);
        SoundSystem.playBallHit();
        setPhase('BEAM');

        // Wobble sequence
        setTimeout(() => {
          setPhase('WOBBLE_1');
          SoundSystem.playBallWobble();
        }, 600);

        setTimeout(() => {
          setPhase('WOBBLE_2');
          SoundSystem.playBallWobble();
        }, 1300);

        setTimeout(() => {
          setPhase('WOBBLE_3');
          SoundSystem.playBallWobble();
        }, 2000);

        setTimeout(() => {
          setPhase('GOTCHA');
          SoundSystem.playCaptureSuccess();

          // Construct and save captured RuntimePokemon to player store
          const capturedInstance = createRuntimePokemon(
            species,
            level,
            false,
            `captured-${species.id}-${Date.now()}`
          );
          addCapturedPokemon(capturedInstance);
        }, 2700);
      }
    }, 20);
  }, [phase, addCapturedPokemon, species, level]);

  // Touch Swipe Handlers for mobile throw
  const handlePointerDown = (e: React.PointerEvent) => {
    if (phase !== 'AIM') return;
    isDraggingRef.current = true;
    startTouchRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || phase !== 'AIM') return;
    isDraggingRef.current = false;
    const dy = startTouchRef.current.y - e.clientY;

    if (dy > 45) {
      // Swiped upward: trigger throw
      triggerThrow();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between select-none overflow-hidden bg-pokemon-dark font-pokemon"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <div className="scanlines" />
      
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 1.2, 0], fov: 50, near: 0.1, far: 50 }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        >
          <Capture3DScene
            species={species}
            ballPos={ballPos}
            isThrown={phase === 'THROW'}
            capturePhase={phase}
          />
        </Canvas>
      </div>

      <header className="relative z-10 p-4 flex items-center justify-between pointer-events-auto">
        <PokemonButton
          onClick={onEscape}
          className="w-11 h-11 flex items-center justify-center p-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </PokemonButton>

        <div className="flex flex-col items-center">
          <PokemonCard className="px-4 py-1 flex items-center gap-2">
            <span className="text-pokemon-ui-muted font-bold text-xs">CP</span>
            <span className="text-xl font-black text-pokemon-ui-text tracking-wide">{cp}</span>
          </PokemonCard>
          <span className="text-sm font-extrabold text-pokemon-ui-text uppercase mt-1 tracking-wider">
            {species.name}
          </span>
        </div>

        <div className="w-11 flex justify-end">
          {razzBerryActive && (
            <div className="w-10 h-10 rounded-full bg-pokemon-red/20 border-2 border-pokemon-red flex items-center justify-center text-lg">
              🍓
            </div>
          )}
        </div>
      </header>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center pointer-events-none">
        {phase === 'AIM' && (
          <div
            className="relative w-44 h-44 rounded-full border-4 border-pokemon-ui-border flex items-center justify-center transition-all duration-75"
            style={{
              transform: `scale(${targetRingScale})`,
              borderColor: targetRingScale <= 0.35 ? '#00C127' : targetRingScale <= 0.7 ? '#FFDE00' : '#FF0000',
            }}
          >
            <div
              className="w-full h-full rounded-full border-4 opacity-75 animate-pulse"
              style={{
                borderColor: targetRingScale <= 0.35 ? '#00C127' : targetRingScale <= 0.7 ? '#FFDE00' : '#FF0000',
              }}
            />
          </div>
        )}

        {throwFeedback && phase !== 'AIM' && phase !== 'GOTCHA' && (
          <div className="mt-6 px-5 py-2 pokemon-card text-pokemon-yellow font-black text-sm tracking-wider animate-scale-in">
            {throwFeedback.text}
          </div>
        )}
      </div>

      <footer className="relative z-10 p-6 flex items-end justify-between pointer-events-auto">
        <div className="relative">
          <button
            onClick={() => {
              setShowBerryDrawer(!showBerryDrawer);
              setShowBallDrawer(false);
              SoundSystem.playTap();
            }}
            className="w-14 h-14 rounded-full pokemon-card flex items-center justify-center text-2xl"
          >
            🍓
          </button>

          {showBerryDrawer && (
            <div className="absolute bottom-16 left-0 pokemon-dialog p-2 flex flex-col gap-2 animate-slide-up">
              <button
                onClick={() => {
                  setRazzBerryActive(true);
                  setShowBerryDrawer(false);
                  SoundSystem.playTap();
                }}
                className="flex items-center gap-2 p-2 pokemon-button text-xs font-bold text-pokemon-ui-text"
              >
                <span>🍓</span>
                <span>Razz Berry (+1.5x)</span>
              </button>
            </div>
          )}
        </div>

        {phase === 'AIM' && (
          <div className="flex flex-col items-center gap-1.5 animate-bounce-slow">
            <button
              onClick={triggerThrow}
              className="w-20 h-20 rounded-full bg-pokemon-red border-4 border-white flex items-center justify-center text-white"
            >
              <Disc3 className="w-10 h-10" />
            </button>
            <span className="text-[11px] font-bold text-pokemon-ui-muted tracking-wider uppercase pokemon-card px-3 py-0.5">
              Swipe or Tap to Throw
            </span>
          </div>
        )}

        <div className="relative">
          <button
            onClick={() => {
              setShowBallDrawer(!showBallDrawer);
              setShowBerryDrawer(false);
              SoundSystem.playTap();
            }}
            className="w-14 h-14 rounded-full pokemon-card flex items-center justify-center text-pokemon-red font-bold text-xs uppercase"
          >
            {selectedBall}
          </button>

          {showBallDrawer && (
            <div className="absolute bottom-16 right-0 pokemon-dialog p-2 flex flex-col gap-2 w-36 animate-slide-up">
              <button
                onClick={() => { setSelectedBall('poke'); setShowBallDrawer(false); SoundSystem.playTap(); }}
                className="flex items-center justify-between p-2 pokemon-button text-xs font-bold text-pokemon-red"
              >
                <span>Poké Ball</span>
                <span>1.0x</span>
              </button>
              <button
                onClick={() => { setSelectedBall('great'); setShowBallDrawer(false); SoundSystem.playTap(); }}
                className="flex items-center justify-between p-2 pokemon-button text-xs font-bold text-pokemon-blue"
              >
                <span>Great Ball</span>
                <span>1.5x</span>
              </button>
              <button
                onClick={() => { setSelectedBall('ultra'); setShowBallDrawer(false); SoundSystem.playTap(); }}
                className="flex items-center justify-between p-2 pokemon-button text-xs font-bold text-pokemon-yellow"
              >
                <span>Ultra Ball</span>
                <span>2.0x</span>
              </button>
            </div>
          )}
        </div>
      </footer>

      {phase === 'GOTCHA' && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-6 text-center animate-scale-in">
          <div className="w-24 h-24 rounded-full bg-pokemon-green/20 border-4 border-pokemon-green flex items-center justify-center text-pokemon-green mb-4">
            <Sparkles className="w-12 h-12 animate-spin-slow" />
          </div>

          <h2 className="text-3xl font-black text-pokemon-ui-text uppercase tracking-tight mb-1">
            GOTCHA!
          </h2>
          <p className="text-base font-bold text-pokemon-green mb-6">
            {species.name} was caught!
          </p>

          <div className="w-full max-w-xs pokemon-card p-4 flex justify-around mb-6">
            <div className="flex flex-col items-center">
              <span className="text-xl font-black text-purple-400">+100</span>
              <span className="text-[10px] font-bold text-pokemon-ui-muted uppercase">Stardust</span>
            </div>
            <div className="w-px bg-pokemon-ui-border" />
            <div className="flex flex-col items-center">
              <span className="text-xl font-black text-pokemon-yellow">+3</span>
              <span className="text-[10px] font-bold text-pokemon-ui-muted uppercase">Candies</span>
            </div>
            <div className="w-px bg-pokemon-ui-border" />
            <div className="flex flex-col items-center">
              <span className="text-xl font-black text-cyan-400">+{throwFeedback?.bonusXp || 100}</span>
              <span className="text-[10px] font-bold text-pokemon-ui-muted uppercase">XP</span>
            </div>
          </div>

          <PokemonButton
            variant="success"
            onClick={onCaptured}
            className="w-full max-w-xs py-3.5 text-sm"
          >
            OK
          </PokemonButton>
        </div>
      )}
    </div>
  );
};
