import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { usePlayerStore } from '../../state/usePlayerStore';

export const FollowCamera: React.FC = () => {
  const { camera } = useThree();
  const playerPos = usePlayerStore((state) => state.position);

  // Target camera position and look-at references
  const currentPos = useRef(new THREE.Vector3(0, 9, 12));
  const currentLookAt = useRef(new THREE.Vector3(0, 1, 0));

  useFrame((_, delta) => {
    // Mobile responsive framing offsets
    const isPortrait = window.innerHeight > window.innerWidth;
    const heightOffset = isPortrait ? 9.5 : 8.0;
    const distanceOffset = isPortrait ? 13.0 : 11.0;

    // Desired camera position relative to player
    const targetX = playerPos[0];
    const targetY = playerPos[1] + heightOffset;
    const targetZ = playerPos[2] + distanceOffset;

    // Desired look-at target (player's chest level)
    const targetLookX = playerPos[0];
    const targetLookY = playerPos[1] + 1.2;
    const targetLookZ = playerPos[2];

    // Smooth damping (lerp)
    const smoothFactor = 6.0 * delta;
    currentPos.current.x += (targetX - currentPos.current.x) * smoothFactor;
    currentPos.current.y += (targetY - currentPos.current.y) * smoothFactor;
    currentPos.current.z += (targetZ - currentPos.current.z) * smoothFactor;

    currentLookAt.current.x += (targetLookX - currentLookAt.current.x) * smoothFactor;
    currentLookAt.current.y += (targetLookY - currentLookAt.current.y) * smoothFactor;
    currentLookAt.current.z += (targetLookZ - currentLookAt.current.z) * smoothFactor;

    camera.position.copy(currentPos.current);
    camera.lookAt(currentLookAt.current);
  });

  return null;
};
