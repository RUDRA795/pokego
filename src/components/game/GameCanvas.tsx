import React from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Environment } from './Environment';
import { WeatherEffects } from './WeatherEffects';
import { ForestValleyTerrain } from '../world/ForestValleyTerrain';
import { ForestValleyStream } from '../world/ForestValleyStream';
import { ForestValleyFoliage } from '../world/ForestValleyFoliage';
import { PlayerController } from '../player/PlayerController';
import { PokemonSpawner } from '../pokemon/PokemonSpawner';
import { ThirdPersonCamera } from '../camera/ThirdPersonCamera';

export const GameCanvas: React.FC = () => {
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas
        shadows
        dpr={[1, 2]} // Performance-capped DPR for mobile
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
        camera={{
          position: [0, 6, 8],
          fov: 46,
          near: 0.1,
          far: 120,
        }}
      >
        {/* Dynamic Lighting, Fog & Sky */}
        <Environment />

        {/* Dynamic Weather Particle Systems */}
        <WeatherEffects />

        {/* Forest Valley 3D World Geometry */}
        <ForestValleyTerrain />
        <ForestValleyStream />
        <ForestValleyFoliage />

        {/* Articulated Player Character & Kinematic Controller */}
        <PlayerController />

        {/* Living Wildlife AI & Roaming Pokémon */}
        <PokemonSpawner />

        {/* Third-Person Orbit Camera */}
        <ThirdPersonCamera />
      </Canvas>
    </div>
  );
};
