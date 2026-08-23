/**
 * Pokémon 3D RPG — Third-Person Trainer Movement & Physics Controller
 * 
 * Features:
 * - Camera-relative movement (WASD, Arrow Keys, and Virtual Joystick).
 * - Smooth acceleration, friction deceleration, and sprint mechanics.
 * - Automatic character rotation towards moving velocity vector.
 * - Real-world GPS synchronizer & walk distance accumulator for Egg hatching & Buddy candy.
 */

import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TrainerAvatar3D } from './TrainerAvatar3D';
import { useRealWorldStore } from '../../state/useRealWorldStore';
import { usePlayerPartyStore } from '../../state/usePlayerPartyStore';
import { worldCoordsToGps } from '../navigation/GPSWorldProjection';

export interface JoystickInput {
  x: number; // -1 to 1 (horizontal)
  y: number; // -1 to 1 (vertical: 1 = forward, -1 = backward)
}

interface TrainerControllerProps {
  initialPosition?: [number, number, number];
  cameraOrbitAngle: number;
  joystickInput: JoystickInput | null;
  onPositionChange: (pos: [number, number, number], isMoving: boolean, heading: number) => void;
  teamColor?: string;
}

export const TrainerController: React.FC<TrainerControllerProps> = ({
  initialPosition = [0, 0, 0],
  cameraOrbitAngle,
  joystickInput,
  onPositionChange,
  teamColor = '#0284c7',
}) => {
  const positionRef = useRef<THREE.Vector3>(new THREE.Vector3(...initialPosition));
  const velocityRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const headingRef = useRef<number>(0);

  const [isMovingState, setIsMovingState] = useState<boolean>(false);
  const [isSprintingState, setIsSprintingState] = useState<boolean>(false);

  // Keyboard keys tracking
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  const { playerLat, playerLng, setPlayerLocation, triggerEggHatch } = useRealWorldStore();
  const { progressWalkDistance } = usePlayerPartyStore();

  // Distance walk accumulator for GPS sync & egg hatching
  const walkAccumulatorRef = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    // 1. Determine raw 2D input direction (x: right/left, z: forward/back)
    let inputX = 0;
    let inputZ = 0;

    const keys = keysPressed.current;
    if (keys['w'] || keys['arrowup']) inputZ -= 1;
    if (keys['s'] || keys['arrowdown']) inputZ += 1;
    if (keys['a'] || keys['arrowleft']) inputX -= 1;
    if (keys['d'] || keys['arrowright']) inputX += 1;

    // Merge with virtual joystick if active
    if (joystickInput && (Math.abs(joystickInput.x) > 0.05 || Math.abs(joystickInput.y) > 0.05)) {
      inputX = joystickInput.x;
      inputZ = -joystickInput.y; // Invert Y so up is forward (-Z)
    }

    const isSprinting = Boolean(keys['shift']);
    setIsSprintingState(isSprinting);

    const inputLength = Math.sqrt(inputX * inputX + inputZ * inputZ);
    const hasInput = inputLength > 0.05;

    // 2. Transform input relative to camera orbit horizontal angle (yaw)
    let moveDir = new THREE.Vector3(0, 0, 0);

    if (hasInput) {
      // Normalize raw input
      const normX = inputX / (inputLength > 1 ? inputLength : 1);
      const normZ = inputZ / (inputLength > 1 ? inputLength : 1);

      // Camera yaw angle in world space
      const yaw = cameraOrbitAngle;
      const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
      const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));

      moveDir = forward.multiplyScalar(-normZ).add(right.multiplyScalar(normX));
      moveDir.normalize();

      // Heading angle towards movement vector
      headingRef.current = Math.atan2(moveDir.x, moveDir.z);
    }

    // 3. Acceleration & Friction physics
    const maxSpeed = isSprinting ? 9.5 : 5.2;
    const accelRate = 28;
    const friction = 14;

    if (hasInput) {
      const targetVel = moveDir.multiplyScalar(maxSpeed * (inputLength > 1 ? 1 : inputLength));
      velocityRef.current.lerp(targetVel, delta * accelRate);
    } else {
      velocityRef.current.lerp(new THREE.Vector3(0, 0, 0), delta * friction);
    }

    const currentSpeed = velocityRef.current.length();
    const isMoving = currentSpeed > 0.15;
    if (isMoving !== isMovingState) {
      setIsMovingState(isMoving);
    }

    // 4. Update Position
    const moveStep = velocityRef.current.clone().multiplyScalar(delta);
    positionRef.current.add(moveStep);

    // Keep on ground plane (Y = 0)
    positionRef.current.y = 0;

    // 5. Accumulate walking distance and update GPS & Egg hatching
    if (isMoving) {
      const distUnits = moveStep.length();
      walkAccumulatorRef.current += distUnits;

      // Sync every ~10 world units (approx 25m)
      if (walkAccumulatorRef.current >= 10) {
        walkAccumulatorRef.current = 0;
        const newGps = worldCoordsToGps(
          positionRef.current.x,
          positionRef.current.z,
          playerLat,
          playerLng
        );
        setPlayerLocation(newGps.lat, newGps.lng);

        const res = progressWalkDistance(0.025);
        if (res.hatchedEggs.length > 0) {
          triggerEggHatch(res.hatchedEggs[0].targetKm, res.hatchedEggs[0].speciesId);
        }
      }
    }

    // Broadcast position update to parent scene
    onPositionChange(
      [positionRef.current.x, positionRef.current.y, positionRef.current.z],
      isMoving,
      headingRef.current
    );
  });

  return (
    <group position={[positionRef.current.x, positionRef.current.y, positionRef.current.z]}>
      <TrainerAvatar3D
        isMoving={isMovingState}
        isSprinting={isSprintingState}
        headingAngle={headingRef.current}
        teamColor={teamColor}
      />
    </group>
  );
};
