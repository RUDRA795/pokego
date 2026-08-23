/**
 * Pokémon 3D RPG — Dynamic Atmospheric Lighting & Time-of-Day Engine
 * 
 * Features:
 * - Day / Dusk / Dawn / Night lighting with synchronized sun/moon azimuth.
 * - Soft hemisphere ambient fill and fog color transitions.
 * - Streetlamp fixtures along avenues with illuminated point lights at night.
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { TimeOfDayPhase, WeatherBoostCondition } from '../../state/useRealWorldStore';

interface WorldLightingProps {
  timeOfDay: TimeOfDayPhase;
  weatherCondition?: WeatherBoostCondition;
}

export const WorldLighting: React.FC<WorldLightingProps> = ({
  timeOfDay,
  weatherCondition = 'CLEAR_SUNNY',
}) => {
  const isNight = timeOfDay === 'NIGHT';
  const isDusk = timeOfDay === 'DUSK';
  const isDawn = timeOfDay === 'DAWN';
  const isRain = weatherCondition === 'RAIN';

  // Compute atmospheric parameters based on time & weather
  const lightingParams = useMemo(() => {
    if (isNight) {
      return {
        sunPos: [20, 25, -20] as [number, number, number],
        sunColor: '#93c5fd',
        sunIntensity: 0.45,
        ambientColor: '#1e1b4b',
        ambientIntensity: 0.55,
        hemiSky: '#1e293b',
        hemiGround: '#0f172a',
        fogColor: '#090d16',
        fogNear: 25,
        fogFar: 85,
      };
    }
    if (isDusk) {
      return {
        sunPos: [35, 12, 10] as [number, number, number],
        sunColor: '#f97316',
        sunIntensity: 1.4,
        ambientColor: '#fed7aa',
        ambientIntensity: 0.7,
        hemiSky: '#fdba74',
        hemiGround: '#7c2d12',
        fogColor: '#431407',
        fogNear: 30,
        fogFar: 95,
      };
    }
    if (isDawn) {
      return {
        sunPos: [-30, 14, 15] as [number, number, number],
        sunColor: '#fde047',
        sunIntensity: 1.2,
        ambientColor: '#fef08a',
        ambientIntensity: 0.75,
        hemiSky: '#bae6fd',
        hemiGround: '#14532d',
        fogColor: '#164e63',
        fogNear: 30,
        fogFar: 95,
      };
    }
    if (isRain) {
      return {
        sunPos: [15, 30, 15] as [number, number, number],
        sunColor: '#94a3b8',
        sunIntensity: 0.85,
        ambientColor: '#cbd5e1',
        ambientIntensity: 0.65,
        hemiSky: '#64748b',
        hemiGround: '#1e293b',
        fogColor: '#334155',
        fogNear: 20,
        fogFar: 75,
      };
    }
    // Default Clear Day
    return {
      sunPos: [25, 38, 20] as [number, number, number],
      sunColor: '#ffffff',
      sunIntensity: 1.55,
      ambientColor: '#f0fdf4',
      ambientIntensity: 0.85,
      hemiSky: '#7dd3fc',
      hemiGround: '#15803d',
      fogColor: '#bae6fd',
      fogNear: 40,
      fogFar: 110,
    };
  }, [isNight, isDusk, isDawn, isRain]);

  // Streetlamps along avenues
  const streetLamps = useMemo(() => [
    { x: -5, z: -8 },
    { x: 5, z: -8 },
    { x: -5, z: 8 },
    { x: 5, z: 8 },
    { x: -8, z: -5 },
    { x: 8, z: -5 },
    { x: -8, z: 5 },
    { x: 8, z: 5 },
  ], []);

  return (
    <group>
      {/* Fog */}
      <fog attach="fog" args={[lightingParams.fogColor, lightingParams.fogNear, lightingParams.fogFar]} />

      {/* Hemisphere Ambient Light */}
      <hemisphereLight
        color={lightingParams.hemiSky}
        groundColor={lightingParams.hemiGround}
        intensity={lightingParams.ambientIntensity}
      />

      {/* Ambient Fill */}
      <ambientLight color={lightingParams.ambientColor} intensity={0.4} />

      {/* Main Directional Sun / Moon */}
      <directionalLight
        position={lightingParams.sunPos}
        color={lightingParams.sunColor}
        intensity={lightingParams.sunIntensity}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={10}
        shadow-camera-far={100}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />

      {/* Streetlamps */}
      {streetLamps.map((lamp, idx) => (
        <group key={idx} position={[lamp.x, 0, lamp.z]}>
          {/* Post */}
          <mesh position={[0, 1.6, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.08, 3.2, 8]} />
            <meshStandardMaterial color="#334155" roughness={0.6} />
          </mesh>
          {/* Lamp Head */}
          <mesh position={[0, 3.2, 0]} castShadow>
            <coneGeometry args={[0.3, 0.35, 8]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* Light Bulb */}
          <mesh position={[0, 3.05, 0]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshBasicMaterial
              color={isNight || isDusk ? '#fef08a' : '#ffffff'}
            />
          </mesh>

          {/* Night PointLight from lamp */}
          {(isNight || isDusk) && (
            <pointLight
              position={[0, 2.9, 0]}
              color="#fbbf24"
              intensity={1.8}
              distance={7.5}
              decay={2}
            />
          )}
        </group>
      ))}
    </group>
  );
};
