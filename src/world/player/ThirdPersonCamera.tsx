/**
 * Pokémon 3D RPG — Third-Person Trailing & Orbital Camera Controller
 * 
 * Features:
 * - Smooth damped follow behind the trainer.
 * - Orbit rotation control via mouse and touch drag.
 * - Dynamic pitch, distance zoom clamping, and smooth elevation.
 * - Action-speed sprint dynamic FOV expansion.
 */

import React, { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ThirdPersonCameraProps {
  targetPosition: [number, number, number];
  isMoving: boolean;
  isSprinting?: boolean;
  orbitHorizontalAngle: number;
  orbitVerticalAngle: number;
  zoomDistance: number;
}

export const ThirdPersonCamera: React.FC<ThirdPersonCameraProps> = ({
  targetPosition,
  isMoving,
  isSprinting = false,
  orbitHorizontalAngle,
  orbitVerticalAngle,
  zoomDistance,
}) => {
  const { camera } = useThree();

  const currentCamPos = useRef<THREE.Vector3>(
    new THREE.Vector3(targetPosition[0], targetPosition[1] + 4, targetPosition[2] + 7)
  );
  const currentLookAt = useRef<THREE.Vector3>(
    new THREE.Vector3(targetPosition[0], targetPosition[1] + 1.2, targetPosition[2])
  );

  useFrame((_, delta) => {
    // 1. Calculate desired camera position relative to target
    const radius = zoomDistance;
    const phi = THREE.MathUtils.clamp(orbitVerticalAngle, 0.2, 1.25); // Pitch (radians from top)
    const theta = orbitHorizontalAngle; // Yaw

    const offsetX = radius * Math.sin(phi) * Math.sin(theta);
    const offsetY = radius * Math.cos(phi);
    const offsetZ = radius * Math.sin(phi) * Math.cos(theta);

    const desiredCamPos = new THREE.Vector3(
      targetPosition[0] + offsetX,
      Math.max(0.6, targetPosition[1] + offsetY),
      targetPosition[2] + offsetZ
    );

    const desiredLookAt = new THREE.Vector3(
      targetPosition[0],
      targetPosition[1] + 1.1,
      targetPosition[2]
    );

    // 2. Smooth exponential damping towards target
    const posLerpFactor = THREE.MathUtils.clamp(delta * 8.5, 0.05, 0.95);
    const lookLerpFactor = THREE.MathUtils.clamp(delta * 10, 0.05, 0.95);

    currentCamPos.current.lerp(desiredCamPos, posLerpFactor);
    currentLookAt.current.lerp(desiredLookAt, lookLerpFactor);

    // 3. Dynamic Action Sprint FOV
    const perspCam = camera as THREE.PerspectiveCamera;
    if (perspCam.isPerspectiveCamera) {
      const targetFov = isSprinting ? 56 : 50;
      perspCam.fov = THREE.MathUtils.lerp(perspCam.fov, targetFov, delta * 5);
      perspCam.updateProjectionMatrix();
    }

    // 4. Apply to Three.js camera
    camera.position.copy(currentCamPos.current);
    camera.lookAt(currentLookAt.current);
  });

  return null;
};
