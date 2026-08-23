/**
 * Pokémon 3D RPG — Weather Particle Systems & Atmospheric Effects
 * 
 * Features:
 * - Rain streaks falling dynamically in RAIN condition.
 * - Wind velocity streaks in WINDY condition.
 * - Floating sunlight motes/sparkles in CLEAR_SUNNY condition.
 * - Gentle drifting snow crystals in SNOW condition.
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { WeatherBoostCondition } from '../../state/useRealWorldStore';

interface WorldWeatherParticlesProps {
  weatherCondition?: WeatherBoostCondition;
  trainerPosition: [number, number, number];
}

export const WorldWeatherParticles: React.FC<WorldWeatherParticlesProps> = ({
  weatherCondition = 'CLEAR_SUNNY',
  trainerPosition,
}) => {
  const pointsRef = useRef<THREE.Points>(null);

  const particleCount = weatherCondition === 'RAIN' ? 350 : weatherCondition === 'SNOW' ? 250 : 80;

  // Particle positions array
  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = Math.random() * 18;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;

      if (weatherCondition === 'RAIN') {
        vel[i * 3] = -0.5; // Slanted wind
        vel[i * 3 + 1] = -(18 + Math.random() * 12); // Fast fall
        vel[i * 3 + 2] = -0.3;
      } else if (weatherCondition === 'SNOW') {
        vel[i * 3] = (Math.random() - 0.5) * 1.5;
        vel[i * 3 + 1] = -(1.5 + Math.random() * 1.5);
        vel[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
      } else if (weatherCondition === 'WINDY') {
        vel[i * 3] = -(8 + Math.random() * 6);
        vel[i * 3 + 1] = (Math.random() - 0.5) * 2;
        vel[i * 3 + 2] = (Math.random() - 0.5) * 3;
      } else {
        // Clear Sunny Sparkles
        vel[i * 3] = (Math.random() - 0.5) * 0.3;
        vel[i * 3 + 1] = 0.2 + Math.random() * 0.4;
        vel[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
      }
    }
    return [pos, vel];
  }, [weatherCondition, particleCount]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      array[idx] += velocities[idx] * delta;
      array[idx + 1] += velocities[idx + 1] * delta;
      array[idx + 2] += velocities[idx + 2] * delta;

      // Wrap around relative to player bounds
      if (array[idx + 1] < 0) {
        array[idx + 1] = 16;
        array[idx] = trainerPosition[0] + (Math.random() - 0.5) * 35;
        array[idx + 2] = trainerPosition[2] + (Math.random() - 0.5) * 35;
      } else if (array[idx + 1] > 18) {
        array[idx + 1] = 0.5;
      }
    }
    posAttr.needsUpdate = true;
  });

  const particleColor =
    weatherCondition === 'RAIN'
      ? '#38bdf8'
      : weatherCondition === 'SNOW'
      ? '#f8fafc'
      : weatherCondition === 'WINDY'
      ? '#e2e8f0'
      : '#fef08a';

  const particleSize = weatherCondition === 'RAIN' ? 0.16 : weatherCondition === 'SNOW' ? 0.25 : 0.18;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={particleSize}
        color={particleColor}
        transparent
        opacity={weatherCondition === 'RAIN' ? 0.8 : 0.6}
      />
    </points>
  );
};
