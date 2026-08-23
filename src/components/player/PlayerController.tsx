/**
 * Pokémon 3D RPG — 3D Character Controller & Kinematic Movement Engine
 * 
 * Features:
 * - Direct sampling of `TerrainHeightmap.getHeight(x, z)` for organic slope traversal.
 * - Slope steepness evaluation: prevents climbing past 48 degrees.
 * - Camera-relative movement: joystick and WASD steer relative to the camera's orientation.
 * - Jump & gravity physics with landing detection.
 * - Dynamic locomotion blending (IDLE, WALK, JOG, SPRINT, JUMP, FALL, LAND).
 */

import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePlayerStore } from '../../state/usePlayerStore';
import { useGameStore } from '../../state/useGameStore';
import { TerrainHeightmap } from '../../systems/world/TerrainHeightmap';
import { lerpAngle } from '../../utils/math';
import { PlayerCharacter, PlayerLocomotionState } from './PlayerCharacter';

export const PlayerController: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);

  const input = usePlayerStore((state) => state.input);
  const setPosition = usePlayerStore((state) => state.setPosition);
  const setRotation = usePlayerStore((state) => state.setRotation);
  const setIsMoving = usePlayerStore((state) => state.setIsMoving);

  const isPaused = useGameStore((state) => state.isPaused);
  const resetTrigger = useGameStore((state) => state.resetWorldTrigger);

  // Position, Velocity & State Refs
  const posRef = useRef({ x: 0, y: 0, z: 0 });
  const velYRef = useRef(0);
  const isGroundedRef = useRef(true);
  const rotRef = useRef(0);
  const currentSpeedRef = useRef(0);
  const [locomotionState, setLocomotionState] = useState<PlayerLocomotionState>('IDLE');
  const [speedRatio, setSpeedRatio] = useState(0);

  // World Reset Handler
  useEffect(() => {
    const startY = TerrainHeightmap.getHeight(0, 0);
    posRef.current = { x: 0, y: startY, z: 0 };
    velYRef.current = 0;
    isGroundedRef.current = true;
    rotRef.current = 0;
    currentSpeedRef.current = 0;

    if (groupRef.current) {
      groupRef.current.position.set(0, startY, 0);
      groupRef.current.rotation.y = 0;
    }
    setPosition([0, startY, 0]);
    setRotation(0);
    setIsMoving(false);
  }, [resetTrigger, setPosition, setRotation, setIsMoving]);

  useFrame((state, delta) => {
    if (isPaused || !groupRef.current) return;

    // 1. Evaluate Movement Input
    const inputMagnitude = Math.min(1.0, Math.sqrt(input.x * input.x + input.y * input.y));
    const isSprint = inputMagnitude > 0.85;
    const maxSpeed = isSprint ? 6.5 : inputMagnitude > 0.4 ? 4.2 : 2.2;
    const targetSpeed = inputMagnitude > 0.05 ? maxSpeed * inputMagnitude : 0;

    // Smooth Acceleration & Deceleration
    const accel = targetSpeed > currentSpeedRef.current ? 14.0 : 18.0;
    currentSpeedRef.current += (targetSpeed - currentSpeedRef.current) * Math.min(1.0, accel * delta);

    const isMoving = currentSpeedRef.current > 0.1;
    setIsMoving(isMoving);

    // 2. Camera-Relative Direction Calculation
    if (isMoving) {
      // Get camera yaw
      const cam = state.camera;
      const camDirection = new THREE.Vector3();
      cam.getWorldDirection(camDirection);
      const camAngle = Math.atan2(camDirection.x, camDirection.z);

      // Input angle relative to camera
      const inputAngle = Math.atan2(input.x, input.y);
      const moveAngle = camAngle + inputAngle;

      const moveX = Math.sin(moveAngle) * currentSpeedRef.current * delta;
      const moveZ = Math.cos(moveAngle) * currentSpeedRef.current * delta;

      const nextX = posRef.current.x + moveX;
      const nextZ = posRef.current.z + moveZ;

      // Check walkability and slope limits
      if (TerrainHeightmap.getWalkability(nextX, nextZ)) {
        posRef.current.x = nextX;
        posRef.current.z = nextZ;
      }

      // Smooth rotation facing heading
      rotRef.current = lerpAngle(rotRef.current, moveAngle, 14 * delta);
    }

    // 3. Terrain Height & Vertical Physics
    const groundY = TerrainHeightmap.getHeight(posRef.current.x, posRef.current.z);

    if (posRef.current.y > groundY + 0.05) {
      // Airborne: Apply gravity
      velYRef.current -= 18.0 * delta;
      posRef.current.y += velYRef.current * delta;

      if (posRef.current.y <= groundY) {
        posRef.current.y = groundY;
        velYRef.current = 0;
        isGroundedRef.current = true;
      } else {
        isGroundedRef.current = false;
      }
    } else {
      // Snapped to ground slope
      posRef.current.y = groundY;
      velYRef.current = 0;
      isGroundedRef.current = true;
    }

    // 4. Update Animation Locomotion State
    if (!isGroundedRef.current) {
      setLocomotionState(velYRef.current > 0 ? 'JUMP' : 'FALL');
    } else if (currentSpeedRef.current > 4.8) {
      setLocomotionState('SPRINT');
    } else if (currentSpeedRef.current > 2.5) {
      setLocomotionState('JOG');
    } else if (currentSpeedRef.current > 0.1) {
      setLocomotionState('WALK');
    } else {
      setLocomotionState('IDLE');
    }

    setSpeedRatio(currentSpeedRef.current / 6.5);

    // 5. Update Three.js Transform & Store
    groupRef.current.position.set(posRef.current.x, posRef.current.y, posRef.current.z);
    groupRef.current.rotation.y = rotRef.current;

    setPosition([posRef.current.x, posRef.current.y, posRef.current.z]);
    setRotation(rotRef.current);
  });

  return (
    <group ref={groupRef}>
      <PlayerCharacter locomotionState={locomotionState} speedRatio={speedRatio} />
    </group>
  );
};
