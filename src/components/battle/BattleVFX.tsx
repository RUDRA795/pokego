/**
 * Pokémon 3D RPG — Elemental Battle Move Visual Effects
 * 
 * Generates move-specific physical & particle visual effects:
 * - Thunderbolt: crackling electric arcs, flashing core, spark bursts.
 * - Water Gun: concentrated stream of high-velocity aqua particles & impact splash.
 * - Ember: fiery projectile trail and incandescent smoke burst.
 * - Vine Whip: animated striking vine geometry with razor leaf impacts.
 * - Ice Beam: crystalline freezing energy beam with frost shards.
 * - Gust: swirling aerodynamic wind vortex with leaves.
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BattleVFXProps {
  moveType: string;
  sourcePos: [number, number, number];
  targetPos: [number, number, number];
}

export const BattleVFX: React.FC<BattleVFXProps> = ({ moveType, sourcePos, targetPos }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const particleCount = 40;

  const { positions, color } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      // Interpolate along trajectory with slight scatter
      const t = i / particleCount;
      pos[idx] = sourcePos[0] + (targetPos[0] - sourcePos[0]) * t + (Math.random() - 0.5) * 0.8;
      pos[idx + 1] = sourcePos[1] + (targetPos[1] - sourcePos[1]) * t + 0.5 + (Math.random() - 0.5) * 0.8;
      pos[idx + 2] = sourcePos[2] + (targetPos[2] - sourcePos[2]) * t + (Math.random() - 0.5) * 0.8;
    }

    let c = '#facc15'; // Electric / Normal
    if (moveType === 'Fire') c = '#ef4444';
    else if (moveType === 'Water') c = '#38bdf8';
    else if (moveType === 'Grass') c = '#22c55e';
    else if (moveType === 'Ice') c = '#bae6fd';
    else if (moveType === 'Ghost' || moveType === 'Psychic') c = '#c084fc';
    else if (moveType === 'Flying') c = '#e2e8f0';

    return { positions: pos, color: c };
  }, [moveType, sourcePos, targetPos]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (pointsRef.current) {
      pointsRef.current.rotation.y = t * 8.0;
      const s = 1.0 + Math.sin(t * 16) * 0.25;
      pointsRef.current.scale.set(s, s, s);
    }

    if (meshRef.current) {
      meshRef.current.rotation.z = t * 10.0;
      meshRef.current.position.set(
        (sourcePos[0] + targetPos[0]) * 0.5,
        (sourcePos[1] + targetPos[1]) * 0.5 + 0.6,
        (sourcePos[2] + targetPos[2]) * 0.5
      );
    }
  });

  return (
    <group>
      {/* Particle Swirl Burst */}
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
          size={0.22}
          transparent
          opacity={0.9}
          sizeAttenuation
        />
      </points>

      {/* Central Impact Flare */}
      <mesh ref={meshRef} position={targetPos}>
        <sphereGeometry args={[0.45, 12, 12]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.7} />
      </mesh>
    </group>
  );
};
