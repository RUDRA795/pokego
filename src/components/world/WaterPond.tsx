/**
 * Pokémon 3D RPG — Animated Water Pond & Aquatic Ecology
 * 
 * Features:
 * - Animated wave motion and caustic surface reflections.
 * - Shoreline sandy rim and translucent foam edge.
 * - Underwater depth gradient.
 * - Stylized lily pads and floating blossom flowers.
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { WORLD_CONFIG } from '../../data/biomes';

export const WaterPond: React.FC = () => {
  const waterRef = useRef<THREE.Mesh>(null);
  const foamRef = useRef<THREE.Mesh>(null);
  const { x, z, radiusX, radiusZ } = WORLD_CONFIG.pond;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (waterRef.current) {
      // Gentle surface wave bobbing & rotation
      waterRef.current.position.y = -0.15 + Math.sin(t * 2.0) * 0.025;
      waterRef.current.rotation.z = Math.sin(t * 0.8) * 0.02;
    }

    if (foamRef.current) {
      // Pulsing foam shoreline
      const foamScale = 1.0 + Math.sin(t * 2.5) * 0.02;
      foamRef.current.scale.set(foamScale, (radiusZ / radiusX) * foamScale, 1);
    }
  });

  return (
    <group position={[x, 0, z]}>
      {/* Sandy Shoreline Basin Rim */}
      <mesh position={[0, -0.22, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, radiusZ / radiusX, 1]}>
        <ringGeometry args={[radiusX * 0.85, radiusX * 1.35, 28]} />
        <meshStandardMaterial color="#cca476" roughness={0.92} flatShading />
      </mesh>

      {/* Translucent Shoreline Foam Ring */}
      <mesh ref={foamRef} position={[0, -0.16, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, radiusZ / radiusX, 1]}>
        <ringGeometry args={[radiusX * 0.92, radiusX * 1.02, 28]} />
        <meshBasicMaterial color="#e0f2fe" opacity={0.6} transparent depthWrite={false} />
      </mesh>

      {/* Main Animated Water Surface */}
      <mesh ref={waterRef} position={[0, -0.15, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, radiusZ / radiusX, 1]}>
        <circleGeometry args={[radiusX, 32]} />
        <meshStandardMaterial
          color="#0284c7"
          roughness={0.08}
          metalness={0.3}
          transparent
          opacity={0.82}
          flatShading
        />
      </mesh>

      {/* Deep Water Bed Base */}
      <mesh position={[0, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, radiusZ / radiusX, 1]}>
        <circleGeometry args={[radiusX * 0.8, 24]} />
        <meshStandardMaterial color="#0c4a6e" roughness={0.95} />
      </mesh>

      {/* Stylized Lily Pads & Flowers */}
      <group position={[-2.2, -0.11, 1.2]}>
        <mesh rotation={[-Math.PI / 2, 0, 0.5]}>
          <circleGeometry args={[0.6, 14, 0, Math.PI * 1.85]} />
          <meshStandardMaterial color="#1b4332" roughness={0.7} />
        </mesh>
        <mesh position={[0.1, 0.06, 0]}>
          <coneGeometry args={[0.16, 0.22, 6]} />
          <meshStandardMaterial color="#f472b6" roughness={0.4} />
        </mesh>
      </group>

      <group position={[2.0, -0.11, -1.6]}>
        <mesh rotation={[-Math.PI / 2, 0, 1.3]}>
          <circleGeometry args={[0.5, 14, 0, Math.PI * 1.85]} />
          <meshStandardMaterial color="#1b4332" roughness={0.7} />
        </mesh>
        <mesh position={[0.08, 0.05, 0]}>
          <coneGeometry args={[0.12, 0.18, 6]} />
          <meshStandardMaterial color="#facc15" roughness={0.4} />
        </mesh>
      </group>

      <group position={[-1.4, -0.11, -2.2]}>
        <mesh rotation={[-Math.PI / 2, 0, 2.7]}>
          <circleGeometry args={[0.45, 14, 0, Math.PI * 1.85]} />
          <meshStandardMaterial color="#1b4332" roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
};
