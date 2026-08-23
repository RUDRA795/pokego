/**
 * Pokémon 3D RPG — In-World 3D Battle Arena & Cinematic Combat Presentation
 * 
 * Features:
 * - Dynamic scale-aware camera calibrated to combatant heights using `SpeciesScaleSystem`.
 * - Multi-joint articulated skeletal models (`PokemonSkeletonRig`) for both combatants.
 * - In-world physical move VFX (`BattleVFX`) and Poké Ball capture sequences (`PokeBallCaptureVFX`).
 * - Natural forest clearing setting with spotlight rings and environmental illumination.
 */

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RuntimePokemon } from '../../battle/types';
import { PokemonSkeletonRig } from '../pokemon/PokemonSkeletonRig';
import { SpeciesScaleSystem } from '../../systems/pokemon/SpeciesScaleSystem';
import { BattleVFX } from './BattleVFX';
import { PokeBallCaptureVFX } from './PokeBallCaptureVFX';

interface BattleArena3DProps {
  playerPokemon: RuntimePokemon;
  opponentPokemon: RuntimePokemon;
  animatingActor: 'player' | 'opponent' | null;
  animatingAction: 'attack' | 'hit' | 'faint' | null;
  activeAttackType?: string | null;
  isCapturing?: boolean;
  onCaptureComplete?: (success: boolean) => void;
}

const BattleScene: React.FC<BattleArena3DProps> = ({
  playerPokemon,
  opponentPokemon,
  animatingActor,
  animatingAction,
  activeAttackType,
  isCapturing,
  onCaptureComplete,
}) => {
  const playerGroup = useRef<THREE.Group>(null);
  const opponentGroup = useRef<THREE.Group>(null);

  // Combatant dynamic animation loops
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Player Pokémon Lunge / Hit
    if (playerGroup.current) {
      if (animatingActor === 'player' && animatingAction === 'attack') {
        playerGroup.current.position.set(-2.5 + Math.sin(t * 18) * 1.2, 0, 1.5 - Math.sin(t * 18) * 0.8);
      } else if (animatingActor === 'player' && animatingAction === 'hit') {
        playerGroup.current.position.set(-2.5 + Math.sin(t * 40) * 0.25, 0, 1.5);
      } else {
        playerGroup.current.position.set(-2.5, 0, 1.5);
      }
    }

    // Opponent Pokémon Lunge / Hit
    if (opponentGroup.current) {
      if (animatingActor === 'opponent' && animatingAction === 'attack') {
        opponentGroup.current.position.set(2.5 - Math.sin(t * 18) * 1.2, 0, -1.5 + Math.sin(t * 18) * 0.8);
      } else if (animatingActor === 'opponent' && animatingAction === 'hit') {
        opponentGroup.current.position.set(2.5 + Math.sin(t * 40) * 0.25, 0, -1.5);
      } else {
        opponentGroup.current.position.set(2.5, 0, -1.5);
      }
    }
  });

  const showVFX = (animatingAction === 'attack' || animatingAction === 'hit');
  const sourcePos: [number, number, number] = animatingActor === 'player' ? [-2.5, 0.6, 1.5] : [2.5, 0.6, -1.5];
  const targetPos: [number, number, number] = animatingActor === 'player' ? [2.5, 0.6, -1.5] : [-2.5, 0.6, 1.5];

  return (
    <>
      {/* Dynamic Lighting */}
      <ambientLight intensity={1.3} />
      <directionalLight position={[12, 18, 10]} intensity={2.2} castShadow />
      <hemisphereLight groundColor="#1e293b" color="#93c5fd" intensity={0.9} />

      {/* In-World Battle Clearing Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <circleGeometry args={[15, 32]} />
        <meshStandardMaterial color="#1b4332" roughness={0.88} />
      </mesh>

      {/* Combatant Spotlight Circles */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.5, 0.01, 1.5]}>
        <ringGeometry args={[1.2, 1.45, 32]} />
        <meshBasicMaterial color="#38bdf8" opacity={0.65} transparent />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.5, 0.01, -1.5]}>
        <ringGeometry args={[1.2, 1.45, 32]} />
        <meshBasicMaterial color="#ef4444" opacity={0.65} transparent />
      </mesh>

      {/* Player Combatant Rig */}
      <group ref={playerGroup} position={[-2.5, 0, 1.5]} rotation={[0, Math.PI / 4, 0]}>
        <PokemonSkeletonRig
          speciesId={playerPokemon.speciesId}
          animationState={animatingActor === 'player' && animatingAction === 'attack' ? 'ATTACK' : 'WANDER'}
        />
      </group>

      {/* Opponent Combatant Rig */}
      {!isCapturing && (
        <group ref={opponentGroup} position={[2.5, 0, -1.5]} rotation={[0, -Math.PI * 0.75, 0]}>
          <PokemonSkeletonRig
            speciesId={opponentPokemon.speciesId}
            animationState={animatingActor === 'opponent' && animatingAction === 'attack' ? 'ATTACK' : 'WANDER'}
          />
        </group>
      )}

      {/* Elemental Move Attack VFX */}
      {showVFX && (
        <BattleVFX
          moveType={activeAttackType || 'Normal'}
          sourcePos={sourcePos}
          targetPos={targetPos}
        />
      )}

      {/* Poké Ball Capture Physical VFX */}
      {isCapturing && (
        <PokeBallCaptureVFX onCaptureComplete={onCaptureComplete} />
      )}
    </>
  );
};

export const BattleArena3D: React.FC<BattleArena3DProps> = (props) => {
  const pScale = SpeciesScaleSystem.getScaleData(props.playerPokemon.speciesId);
  const oScale = SpeciesScaleSystem.getScaleData(props.opponentPokemon.speciesId);
  const maxFramingDist = Math.max(pScale.cameraFramingDistance, oScale.cameraFramingDistance);

  const cameraZ = Math.max(8.5, maxFramingDist * 1.1);
  const cameraY = Math.max(4.5, 3.0 + maxFramingDist * 0.35);

  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas
        camera={{
          position: [-0.5, cameraY, cameraZ],
          fov: 42,
          near: 0.1,
          far: 60,
        }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <BattleScene {...props} />
      </Canvas>
    </div>
  );
};
