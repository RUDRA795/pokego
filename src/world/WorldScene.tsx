/**
 * Pokémon 3D RPG — Root 3D Overworld Scene & Canvas Manager
 * 
 * Coordinates:
 * - Real-world GPS $\to$ 3D Cartesian coordinates projection.
 * - Dynamic Lighting & Time of Day.
 * - Procedural Stylized World: Terrain, Roads, Buildings, Trees, Water, Landmarks.
 * - Weather particles (Rain, Wind, Sunny dust, Snow).
 * - Third-Person Orbit Camera & Trainer Avatar Locomotion.
 * - 3D Buddy Companion Following.
 * - 3D Wild Pokémon Entities with wander AI, contact shadows & CP badges.
 * - 3D Interactive PokéStops and Gym Monuments.
 * - Dual-ring 40m/80m radar scanner around player.
 */

import React, { useState, useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRealWorldStore, NAGPUR_HOTSPOTS, RealWorldSpawn, NagpurHotspot } from '../state/useRealWorldStore';
import { usePlayerPartyStore } from '../state/usePlayerPartyStore';
import { gpsToWorldCoords } from './navigation/GPSWorldProjection';
import { WorldLighting } from './environment/WorldLighting';
import { WorldTerrain } from './environment/WorldTerrain';
import { WorldRoads } from './environment/WorldRoads';
import { WorldBuildings } from './environment/WorldBuildings';
import { WorldVegetation } from './environment/WorldVegetation';
import { WorldWater } from './environment/WorldWater';
import { WorldLandmarks } from './environment/WorldLandmarks';
import { WorldWeatherParticles } from './environment/WorldWeatherParticles';
import { ThirdPersonCamera } from './player/ThirdPersonCamera';
import { TrainerController, JoystickInput } from './player/TrainerController';
import { BuddyCompanion3D } from './player/BuddyCompanion3D';
import { WildPokemonEntity3D } from './entities/WildPokemonEntity3D';
import { PokeStop3D } from './entities/PokeStop3D';
import { GymTower3D } from './entities/GymTower3D';

// Dual-ring Radar Scanner centered around Trainer
const OverworldRadarRings: React.FC<{ playerPos: [number, number, number] }> = ({ playerPos }) => {
  const innerRingRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (innerRingRef.current) {
      const s = ((t * 0.7) % 1) * 8.5;
      innerRingRef.current.scale.set(s, s, 1);
      (innerRingRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.7 - s / 8.5);
    }
    if (outerRingRef.current) {
      const s2 = (((t * 0.7) + 0.5) % 1) * 8.5;
      outerRingRef.current.scale.set(s2, s2, 1);
      (outerRingRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.7 - s2 / 8.5);
    }
  });

  return (
    <group position={[playerPos[0], 0.03, playerPos[2]]}>
      {/* Expanding Inner Pulse */}
      <mesh ref={innerRingRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.05, 32]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Expanding Outer Pulse */}
      <mesh ref={outerRingRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.05, 32]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Static 40m Interaction Radius Disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[4.8, 32]} />
        <meshBasicMaterial color="#0284c7" transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.75, 4.85, 32]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

interface WorldSceneProps {
  joystickInput: JoystickInput | null;
  onSelectPokemon: (spawn: RealWorldSpawn) => void;
  onSelectPokeStop: (hotspot: NagpurHotspot) => void;
}

export const WorldScene: React.FC<WorldSceneProps> = ({
  joystickInput,
  onSelectPokemon,
  onSelectPokeStop,
}) => {
  const { playerLat, playerLng, weatherCondition, timeOfDay, spawns } = useRealWorldStore();
  const { party, buddyInstanceId, buddyHearts, feedBuddy } = usePlayerPartyStore();

  const activeBuddy = party.find((p) => p.instanceId === buddyInstanceId) || party[0] || null;

  // Trainer dynamic position in local world
  const [trainerPos, setTrainerPos] = useState<[number, number, number]>([0, 0, 0]);
  const [trainerIsMoving, setTrainerIsMoving] = useState<boolean>(false);
  const [trainerHeading, setTrainerHeading] = useState<number>(0);

  // Camera orbit controls state
  const [orbitYaw, setOrbitYaw] = useState<number>(0); // Horizontal angle
  const [orbitPitch, setOrbitPitch] = useState<number>(0.75); // Vertical angle (~45 deg)
  const [zoomDist, setZoomDist] = useState<number>(7.5);

  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    // Orbit sensitivity
    setOrbitYaw((prev) => prev - dx * 0.007);
    setOrbitPitch((prev) => Math.max(0.3, Math.min(1.2, prev + dy * 0.005)));
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    setZoomDist((prev) => Math.max(4.5, Math.min(13, prev + e.deltaY * 0.005)));
  };

  // Convert GPS Hotspots into local 3D Cartesian coordinates
  const projectedHotspots = useMemo(() => {
    return NAGPUR_HOTSPOTS.map((spot) => {
      const coord = gpsToWorldCoords(spot.lat, spot.lng, playerLat, playerLng);
      return {
        spot,
        pos: [coord.x, 0, coord.z] as [number, number, number],
      };
    });
  }, [playerLat, playerLng]);

  // Convert GPS Spawns into local 3D Cartesian coordinates
  const projectedSpawns = useMemo(() => {
    return spawns.map((spawn) => {
      const coord = gpsToWorldCoords(spawn.lat, spawn.lng, playerLat, playerLng);
      return {
        spawn,
        pos: [coord.x, 0, coord.z] as [number, number, number],
      };
    });
  }, [spawns, playerLat, playerLng]);

  const handlePositionChange = useCallback(
    (pos: [number, number, number], isMoving: boolean, heading: number) => {
      setTrainerPos(pos);
      setTrainerIsMoving(isMoving);
      setTrainerHeading(heading);
    },
    []
  );

  return (
    <div
      className="w-full h-full relative select-none cursor-grab active:cursor-grabbing touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
    >
      <Canvas
        shadows
        camera={{ position: [0, 5, 8], fov: 50, near: 0.1, far: 250 }}
        className="w-full h-full"
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        {/* 1. Dynamic Lighting & Fog */}
        <WorldLighting timeOfDay={timeOfDay} weatherCondition={weatherCondition} />

        {/* 2. Third-Person Orbit Follow Camera */}
        <ThirdPersonCamera
          targetPosition={trainerPos}
          isMoving={trainerIsMoving}
          isSprinting={trainerIsMoving}
          orbitHorizontalAngle={orbitYaw}
          orbitVerticalAngle={orbitPitch}
          zoomDistance={zoomDist}
        />

        {/* 3. Overworld Procedural Environment */}
        <WorldTerrain />
        <WorldRoads />
        <WorldBuildings isNight={timeOfDay === 'NIGHT' || timeOfDay === 'DUSK'} />
        <WorldVegetation windIntensity={weatherCondition === 'WINDY' ? 2.5 : 1.0} />
        <WorldWater />
        <WorldLandmarks />

        {/* 4. Weather Particle Effects */}
        <WorldWeatherParticles
          weatherCondition={weatherCondition}
          trainerPosition={trainerPos}
        />

        {/* 5. Dual-Ring Radar Scanner around Trainer */}
        <OverworldRadarRings playerPos={trainerPos} />

        {/* 6. Third-Person Trainer Controller & Avatar */}
        <TrainerController
          cameraOrbitAngle={orbitYaw}
          joystickInput={joystickInput}
          onPositionChange={handlePositionChange}
        />

        {/* 7. 3D Walking Buddy Companion */}
        <BuddyCompanion3D
          buddy={activeBuddy}
          trainerPosition={trainerPos}
          trainerHeading={trainerHeading}
          trainerIsMoving={trainerIsMoving}
          buddyHearts={buddyHearts}
          onFeed={feedBuddy}
        />

        {/* 8. 3D Wild Pokémon Entities */}
        {projectedSpawns.map(({ spawn, pos }) => (
          <WildPokemonEntity3D
            key={spawn.uid}
            spawn={spawn}
            worldPosition={pos}
            trainerPosition={trainerPos}
            onSelect={onSelectPokemon}
          />
        ))}

        {/* 9. 3D PokéStops & Gym Monuments */}
        {projectedHotspots.map(({ spot, pos }) =>
          spot.category === 'GYM_UNITE' ? (
            <GymTower3D
              key={spot.id}
              hotspot={spot}
              worldPosition={pos}
              trainerPosition={trainerPos}
              onSelect={onSelectPokeStop}
            />
          ) : (
            <PokeStop3D
              key={spot.id}
              hotspot={spot}
              worldPosition={pos}
              trainerPosition={trainerPos}
              onSelect={onSelectPokeStop}
            />
          )
        )}
      </Canvas>
    </div>
  );
};
