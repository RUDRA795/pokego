/**
 * Pokémon 3D RPG — 3D Battle Arena & Cinematic Combat Visuals
 * 
 * Features:
 * - Dynamic framing camera calibrated to Pokémon physical heights.
 * - Type-specific battle attack particle VFX (Electric, Fire, Water, Grass, Ice, Ghost).
 * - Attack anticipation lunges, hit recoil vibration, and faint arcs.
 * - Arena spotlight rings and atmospheric ambient illumination.
 */

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RuntimePokemon } from '../../battle/types';
import { PokemonRenderer } from '../pokemon/PokemonRenderer';
import { getPokemonById } from '../../data/pokemon';

interface BattleArena3DProps {
  playerPokemon: RuntimePokemon;
  opponentPokemon: RuntimePokemon;
  animatingActor: 'player' | 'opponent' | null;
  animatingAction: 'attack' | 'hit' | 'faint' | null;
  activeAttackType?: string | null;
}

// Elemental VFX Particle Generator Component
const ElementalAttackVFX: React.FC<{
  type: string;
  targetPos: [number, number, number];
}> = ({ type, targetPos }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 35;

  const { positions, color } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      pos[idx] = targetPos[0] + (Math.random() - 0.5) * 1.5;
      pos[idx + 1] = targetPos[1] + 0.4 + (Math.random() - 0.5) * 1.2;
      pos[idx + 2] = targetPos[2] + (Math.random() - 0.5) * 1.5;
    }

    let c = '#facc15'; // Default Electric / Normal
    if (type === 'Fire') c = '#ef4444';
    else if (type === 'Water') c = '#38bdf8';
    else if (type === 'Grass') c = '#22c55e';
    else if (type === 'Ice') c = '#bae6fd';
    else if (type === 'Ghost' || type === 'Psychic') c = '#c084fc';

    return { positions: pos, color: c };
  }, [type, targetPos]);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      const t = clock.getElapsedTime();
      pointsRef.current.rotation.y = t * 6;
      const s = 1.0 + Math.sin(t * 12) * 0.3;
      pointsRef.current.scale.set(s, s, s);
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.16}
        transparent
        opacity={0.85}
        sizeAttenuation
      />
    </points>
  );
};

const BattleScene: React.FC<BattleArena3DProps> = ({
  playerPokemon,
  opponentPokemon,
  animatingActor,
  animatingAction,
  activeAttackType,
}) => {
  const playerGroup = useRef<THREE.Group>(null);
  const opponentGroup = useRef<THREE.Group>(null);

  const playerSpecies = getPokemonById(playerPokemon.speciesId);
  const opponentSpecies = getPokemonById(opponentPokemon.speciesId);

  // Animation controller
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // 1. Player Battler Lunge / Hit Vibration
    if (playerGroup.current) {
      if (animatingActor === 'player' && animatingAction === 'attack') {
        playerGroup.current.position.set(-2.5 + Math.sin(t * 18) * 1.0, 0, 1.5 - Math.sin(t * 18) * 0.6);
      } else if (animatingActor === 'player' && animatingAction === 'hit') {
        playerGroup.current.position.set(-2.5 + Math.sin(t * 40) * 0.2, 0, 1.5);
      } else {
        playerGroup.current.position.set(-2.5, 0, 1.5);
      }
    }

    // 2. Opponent Battler Lunge / Hit Vibration
    if (opponentGroup.current) {
      if (animatingActor === 'opponent' && animatingAction === 'attack') {
        opponentGroup.current.position.set(2.5 - Math.sin(t * 18) * 1.0, 0, -1.5 + Math.sin(t * 18) * 0.6);
      } else if (animatingActor === 'opponent' && animatingAction === 'hit') {
        opponentGroup.current.position.set(2.5 + Math.sin(t * 40) * 0.2, 0, -1.5);
      } else {
        opponentGroup.current.position.set(2.5, 0, -1.5);
      }
    }
  });

  const showVFX = (animatingAction === 'hit' || animatingAction === 'attack');
  const vfxTargetPos: [number, number, number] = animatingActor === 'player'
    ? [2.5, 0, -1.5]
    : [-2.5, 0, 1.5];

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={1.3} />
      <directionalLight position={[10, 16, 10]} intensity={2.2} castShadow />
      <hemisphereLight groundColor="#1e293b" color="#93c5fd" intensity={0.9} />

      {/* Arena Ground Platform */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <circleGeometry args={[14, 32]} />
        <meshStandardMaterial color="#0f172a" roughness={0.75} />
      </mesh>

      {/* Glowing Spotlights under Battlers */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.5, 0.01, 1.5]}>
        <ringGeometry args={[1.1, 1.3, 32]} />
        <meshBasicMaterial color="#38bdf8" opacity={0.65} transparent />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.5, 0.01, -1.5]}>
        <ringGeometry args={[1.1, 1.3, 32]} />
        <meshBasicMaterial color="#f43f5e" opacity={0.65} transparent />
      </mesh>

      {/* Player Combatant */}
      <group ref={playerGroup} position={[-2.5, 0, 1.5]} rotation={[0, Math.PI / 4, 0]}>
        <PokemonRenderer speciesId={playerPokemon.speciesId} state="APPROACH" />
      </group>

      {/* Opponent Combatant */}
      <group ref={opponentGroup} position={[2.5, 0, -1.5]} rotation={[0, -Math.PI * 0.75, 0]}>
        <PokemonRenderer speciesId={opponentPokemon.speciesId} state="APPROACH" />
      </group>

      {/* Active Attack Elemental VFX */}
      {showVFX && (
        <ElementalAttackVFX
          type={activeAttackType || 'Normal'}
          targetPos={vfxTargetPos}
        />
      )}
    </>
  );
};

export const BattleArena3D: React.FC<BattleArena3DProps> = (props) => {
  const maxScale = Math.max(
    getPokemonById(props.playerPokemon.speciesId)?.heightMeters || 1,
    getPokemonById(props.opponentPokemon.speciesId)?.heightMeters || 1
  );

  const cameraZ = Math.max(8.5, 6.8 + maxScale * 0.55);
  const cameraY = Math.max(4.2, 3.2 + maxScale * 0.35);

  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas
        camera={{
          position: [-0.5, cameraY, cameraZ],
          fov: 42,
          near: 0.1,
          far: 50,
        }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <BattleScene {...props} />
      </Canvas>
    </div>
  );
};
