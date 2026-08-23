import React from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Environment } from './Environment';
import { WeatherEffects } from './WeatherEffects';
import { StylizedTerrain } from '../world/StylizedTerrain';
import { WaterPond } from '../world/WaterPond';
import { Foliage } from '../world/Foliage';
import { Props } from '../world/Props';
import { PlayerController } from '../player/PlayerController';
import { PokemonSpawner } from '../pokemon/PokemonSpawner';
import { FollowCamera } from '../camera/FollowCamera';

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
          position: [0, 9, 12],
          fov: 48,
          near: 0.1,
          far: 80,
        }}
      >
        {/* Dynamic Lighting, Fog & Sky */}
        <Environment />

        {/* Dynamic Weather Particle Systems */}
        <WeatherEffects />

        {/* 3D World Geometry */}
        <StylizedTerrain />
        <WaterPond />
        <Foliage />
        <Props />

        {/* Player Character & Controller */}
        <PlayerController />

        {/* Dynamic AI Roaming Pokémon */}
        <PokemonSpawner />

        {/* Third-Person Camera Tracker */}
        <FollowCamera />
      </Canvas>
    </div>
  );
};
