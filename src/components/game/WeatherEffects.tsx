/**
 * Pokémon 3D RPG — Atmospheric Weather & Environmental Particle System
 * 
 * Features:
 * - Rain streaks with dynamic speed and ground collision reset.
 * - Daytime floating pollen / golden dust motes in forest and meadow.
 * - Nighttime glowing fireflies with sinusoidal floating paths.
 * - Lightweight buffer geometry optimized for 60 FPS mobile performance.
 */

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useWeatherStore } from '../../state/useWeatherStore';
import { usePlayerStore } from '../../state/usePlayerStore';

export const WeatherEffects: React.FC = () => {
  const isRaining = useWeatherStore((state) => state.isRaining);
  const time = useWeatherStore((state) => state.time);
  const playerPos = usePlayerStore((state) => state.position);

  const rainRef = useRef<THREE.Points>(null);
  const ambientParticlesRef = useRef<THREE.Points>(null);

  const isNight = time === 'NIGHT';
  const rainCount = 450;
  const ambientCount = 120; // Lightweight ambient motes / fireflies

  // Rain Particles Buffers
  const { rainPositions } = useMemo(() => {
    const pos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      const idx = i * 3;
      pos[idx] = (Math.random() - 0.5) * 36;
      pos[idx + 1] = Math.random() * 20 + 2;
      pos[idx + 2] = (Math.random() - 0.5) * 36;
    }
    return { rainPositions: pos };
  }, []);

  // Ambient Particles Buffers (Pollen / Fireflies)
  const { ambientPositions, ambientPhases } = useMemo(() => {
    const pos = new Float32Array(ambientCount * 3);
    const phases = new Float32Array(ambientCount);
    for (let i = 0; i < ambientCount; i++) {
      const idx = i * 3;
      pos[idx] = (Math.random() - 0.5) * 32;
      pos[idx + 1] = Math.random() * 5 + 0.5;
      pos[idx + 2] = (Math.random() - 0.5) * 32;
      phases[i] = Math.random() * Math.PI * 2;
    }
    return { ambientPositions: pos, ambientPhases: phases };
  }, []);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();

    // 1. Rain Motion
    if (isRaining && rainRef.current) {
      const geo = rainRef.current.geometry;
      const posAttr = geo.attributes.position;
      const posArray = posAttr.array as Float32Array;
      const fallSpeed = 24 * delta;

      for (let i = 0; i < rainCount; i++) {
        const idx = i * 3;
        posArray[idx + 1] -= fallSpeed;

        if (posArray[idx + 1] <= 0) {
          posArray[idx + 1] = 18 + Math.random() * 4;
          posArray[idx] = playerPos[0] + (Math.random() - 0.5) * 32;
          posArray[idx + 2] = playerPos[2] + (Math.random() - 0.5) * 32;
        }
      }
      posAttr.needsUpdate = true;
    }

    // 2. Ambient Pollen / Fireflies Sinusoidal Float
    if (ambientParticlesRef.current) {
      const geo = ambientParticlesRef.current.geometry;
      const posAttr = geo.attributes.position;
      const posArray = posAttr.array as Float32Array;

      for (let i = 0; i < ambientCount; i++) {
        const idx = i * 3;
        const phase = ambientPhases[i];
        posArray[idx + 1] += Math.sin(t * 1.5 + phase) * 0.005;
        posArray[idx] += Math.cos(t * 0.8 + phase) * 0.003;
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Rain Streaks */}
      {isRaining && (
        <points ref={rainRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={rainCount}
              array={rainPositions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            color="#93c5fd"
            size={0.14}
            transparent
            opacity={0.7}
            sizeAttenuation
          />
        </points>
      )}

      {/* Ambient Floating Motes / Fireflies */}
      <points ref={ambientParticlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={ambientCount}
            array={ambientPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color={isNight ? '#fde047' : '#86efac'}
          size={isNight ? 0.18 : 0.1}
          transparent
          opacity={isNight ? 0.85 : 0.5}
          sizeAttenuation
        />
      </points>
    </group>
  );
};
