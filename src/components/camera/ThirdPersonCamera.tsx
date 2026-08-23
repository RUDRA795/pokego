/**
 * Pokémon 3D RPG — Third-Person Orbit Camera System
 * 
 * Features:
 * - Free orbit around the player character via mouse drag or touch drag.
 * - Smooth damping follow behind player with dynamic height & distance offset.
 * - Terrain collision avoidance: lifts camera above ground using `TerrainHeightmap`.
 * - Dynamic sprint FOV expansion for sense of speed.
 * - Global camera yaw state shared with player controller for camera-relative steering.
 */

import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { usePlayerStore } from '../../state/usePlayerStore';
import { useGameStore } from '../../state/useGameStore';
import { TerrainHeightmap } from '../../systems/world/TerrainHeightmap';

export const ThirdPersonCamera: React.FC = () => {
  const { camera, gl } = useThree();
  const playerPos = usePlayerStore((state) => state.position);
  const isMoving = usePlayerStore((state) => state.isMoving);
  const isPaused = useGameStore((state) => state.isPaused);

  // Camera Orbit Angles & Distance
  const yawRef = useRef<number>(0); // Horizontal rotation in radians
  const pitchRef = useRef<number>(0.28); // Vertical tilt in radians (approx 16 degrees)
  const distanceRef = useRef<number>(7.8); // Distance behind player
  const isDraggingRef = useRef<boolean>(false);
  const lastPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const currentPos = useRef(new THREE.Vector3(0, 5, 8));
  const currentLookAt = useRef(new THREE.Vector3(0, 1.2, 0));

  // Desktop Mouse Drag Orbit Handler
  useEffect(() => {
    const dom = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      // Right-side screen drag or right-click / middle-click for camera
      if (e.clientX > window.innerWidth * 0.35 || e.button === 2) {
        isDraggingRef.current = true;
        lastPointerRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastPointerRef.current.x;
      const dy = e.clientY - lastPointerRef.current.y;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };

      const sensitivity = 0.0055;
      yawRef.current -= dx * sensitivity;
      pitchRef.current = Math.max(0.08, Math.min(1.15, pitchRef.current + dy * sensitivity));
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [gl]);

  useFrame((_, delta) => {
    if (isPaused) return;

    const px = playerPos[0];
    const py = playerPos[1] + 1.2; // Player chest look-at level
    const pz = playerPos[2];

    const yaw = yawRef.current;
    const pitch = pitchRef.current;
    const dist = distanceRef.current;

    // Calculate spherical camera position relative to player
    const offsetX = Math.sin(yaw) * Math.cos(pitch) * dist;
    const offsetY = Math.sin(pitch) * dist + 1.2;
    const offsetZ = Math.cos(yaw) * Math.cos(pitch) * dist;

    let targetCamX = px + offsetX;
    let targetCamY = py + offsetY;
    let targetCamZ = pz + offsetZ;

    // Terrain Collision Avoidance: Check ground elevation below camera
    const groundBelowCam = TerrainHeightmap.getHeight(targetCamX, targetCamZ);
    if (targetCamY < groundBelowCam + 0.8) {
      targetCamY = groundBelowCam + 0.8;
    }

    // Smooth Lerp Damping
    const smoothFactor = Math.min(1.0, 8.0 * delta);
    currentPos.current.x += (targetCamX - currentPos.current.x) * smoothFactor;
    currentPos.current.y += (targetCamY - currentPos.current.y) * smoothFactor;
    currentPos.current.z += (targetCamZ - currentPos.current.z) * smoothFactor;

    currentLookAt.current.x += (px - currentLookAt.current.x) * smoothFactor;
    currentLookAt.current.y += (py - currentLookAt.current.y) * smoothFactor;
    currentLookAt.current.z += (pz - currentLookAt.current.z) * smoothFactor;

    camera.position.copy(currentPos.current);
    camera.lookAt(currentLookAt.current);

    // Dynamic FOV for sense of speed
    if (camera instanceof THREE.PerspectiveCamera) {
      const targetFov = isMoving ? 48 : 44;
      camera.fov += (targetFov - camera.fov) * (4.0 * delta);
      camera.updateProjectionMatrix();
    }
  });

  return null;
};
