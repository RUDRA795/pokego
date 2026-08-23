import React from 'react';
import { useWeatherStore } from '../../state/useWeatherStore';
import { WEATHER_PRESETS } from '../../data/weather';

export const Environment: React.FC = () => {
  const current = useWeatherStore((state) => state.current);
  const time = useWeatherStore((state) => state.time);

  const preset = WEATHER_PRESETS[current];
  const isNight = time === 'NIGHT';

  const skyColor = isNight ? preset.skyColorNight : preset.skyColorDay;
  const fogColor = isNight ? preset.fogColorNight : preset.fogColorDay;
  const ambientIntensity = isNight ? preset.ambientIntensityNight : preset.ambientIntensityDay;
  const sunIntensity = isNight ? 0.3 : preset.sunIntensity;
  const sunColor = isNight ? '#93c5fd' : '#fffbeb';

  return (
    <>
      {/* Background and Scene Fog */}
      <color attach="background" args={[skyColor]} />
      <fog attach="fog" args={[fogColor, preset.fogNear, preset.fogFar]} />

      {/* Ambient Lighting */}
      <ambientLight intensity={ambientIntensity} color={isNight ? '#60a5fa' : '#ffffff'} />

      {/* Hemisphere Light for natural ground/sky gradient */}
      <hemisphereLight
        args={[
          isNight ? '#1e3a8a' : '#bfdbfe',
          isNight ? '#064e3b' : '#34d399',
          ambientIntensity * 0.8
        ]}
      />

      {/* Directional Sunlight / Moonlight */}
      <directionalLight
        position={isNight ? [-15, 20, -10] : [15, 25, 12]}
        intensity={sunIntensity}
        color={sunColor}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />
    </>
  );
};
