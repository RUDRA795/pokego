import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePlayerStore } from '../../state/usePlayerStore';
import { useGameStore } from '../../state/useGameStore';
import { resolvePosition } from '../../utils/collision';
import { lerpAngle } from '../../utils/math';
import { PlayerCharacter } from './PlayerCharacter';

export const PlayerController: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  const input = usePlayerStore((state) => state.input);
  const speed = usePlayerStore((state) => state.speed);
  const setPosition = usePlayerStore((state) => state.setPosition);
  const setRotation = usePlayerStore((state) => state.setRotation);
  const setIsMoving = usePlayerStore((state) => state.setIsMoving);
  const isMoving = usePlayerStore((state) => state.isMoving);

  const isPaused = useGameStore((state) => state.isPaused);
  const resetTrigger = useGameStore((state) => state.resetWorldTrigger);

  // Position & rotation state maintained across frames
  const posRef = useRef({ x: 0, y: 0, z: 0 });
  const rotRef = useRef(0);

  // Handle world reset
  useEffect(() => {
    posRef.current = { x: 0, y: 0, z: 0 };
    rotRef.current = 0;
    if (groupRef.current) {
      groupRef.current.position.set(0, 0, 0);
      groupRef.current.rotation.y = 0;
    }
    setPosition([0, 0, 0]);
    setRotation(0);
    setIsMoving(false);
  }, [resetTrigger, setPosition, setRotation, setIsMoving]);

  useFrame((_, delta) => {
    if (isPaused || !groupRef.current) return;

    const inputLen = Math.sqrt(input.x * input.x + input.y * input.y);
    const moving = inputLen > 0.05;

    if (moving !== isMoving) {
      setIsMoving(moving);
    }

    if (moving) {
      // Calculate target direction vector in world space
      // In our standard third-person perspective:
      // input.x: +1 = right (+X), -1 = left (-X)
      // input.y: +1 = forward (-Z), -1 = backward (+Z)
      const moveX = input.x * speed * delta;
      const moveZ = -input.y * speed * delta;

      const targetX = posRef.current.x + moveX;
      const targetZ = posRef.current.z + moveZ;

      // Apply collision resolution
      const resolved = resolvePosition(targetX, targetZ, 0.5);

      posRef.current.x = resolved.x;
      posRef.current.z = resolved.z;

      // Calculate desired character rotation
      const targetAngle = Math.atan2(moveX, moveZ);
      rotRef.current = lerpAngle(rotRef.current, targetAngle, 12 * delta);

      // Apply to Three.js Object3D
      groupRef.current.position.set(posRef.current.x, 0, posRef.current.z);
      groupRef.current.rotation.y = rotRef.current;

      // Sync Zustand store
      setPosition([posRef.current.x, 0, posRef.current.z]);
      setRotation(rotRef.current);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <PlayerCharacter isMoving={isMoving} />
    </group>
  );
};
