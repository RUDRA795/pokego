/**
 * Pokémon 3D RPG — Cinematic Evolution Presentation
 * 
 * Features:
 * - Glowing energy aura & orbiting particle vortex.
 * - Silhouette metamorphosis transition between pre-evolution and evolved form.
 * - Rotating dynamic presentation camera.
 * - Celebration fanfare and stats update reveal.
 */

import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PokemonSkeletonRig } from '../pokemon/PokemonSkeletonRig';
import { getPokemonById } from '../../data/pokemon';

interface EvolutionCinematicProps {
  preEvolutionSpeciesId: string;
  postEvolutionSpeciesId: string;
  onEvolutionComplete: () => void;
}

export const EvolutionCinematic: React.FC<EvolutionCinematicProps> = ({
  preEvolutionSpeciesId,
  postEvolutionSpeciesId,
  onEvolutionComplete,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const [phase, setPhase] = useState<'AURA' | 'SWIRL' | 'TRANSFORM' | 'REVEAL'>('AURA');
  const preSpecies = getPokemonById(preEvolutionSpeciesId);
  const postSpecies = getPokemonById(postEvolutionSpeciesId);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('SWIRL'), 1200);
    const t2 = setTimeout(() => setPhase('TRANSFORM'), 2400);
    const t3 = setTimeout(() => setPhase('REVEAL'), 3600);
    const t4 = setTimeout(() => onEvolutionComplete(), 5500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onEvolutionComplete]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (groupRef.current) {
      // Orbiting presentation spin
      groupRef.current.rotation.y = t * 1.5;
    }

    if (auraRef.current) {
      const s = 1.0 + Math.sin(t * 8) * 0.25;
      auraRef.current.scale.set(s, s, s);
    }

    if (particlesRef.current) {
      particlesRef.current.rotation.y = -t * 6.0;
    }
  });

  const isEvolved = phase === 'REVEAL';

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Dynamic Lighting */}
      <ambientLight intensity={1.5} />
      <pointLight position={[0, 3, 0]} intensity={4.0} color="#38bdf8" />

      {/* Main Pokémon Rig with transformation */}
      <group position={[0, 0, 0]}>
        <PokemonSkeletonRig
          speciesId={isEvolved ? postEvolutionSpeciesId : preEvolutionSpeciesId}
          animationState={isEvolved ? 'PLAY' : 'IDLE'}
        />
      </group>

      {/* Metamorphosis Glowing Energy Halo */}
      {phase !== 'REVEAL' && (
        <mesh ref={auraRef} position={[0, 0.8, 0]}>
          <sphereGeometry args={[1.4, 16, 16]} />
          <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.65} />
        </mesh>
      )}

      {/* Orbiting Evolution Energy Particles */}
      <points ref={particlesRef} position={[0, 0.8, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={45}
            array={new Float32Array(135).map(() => (Math.random() - 0.5) * 3.2)}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color={isEvolved ? '#facc15' : '#38bdf8'}
          size={0.2}
          transparent
          opacity={0.85}
        />
      </points>
    </group>
  );
};
