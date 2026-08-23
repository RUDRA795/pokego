import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PlayerCharacterProps {
  isMoving: boolean;
}

export const PlayerCharacter: React.FC<PlayerCharacterProps> = ({ isMoving }) => {
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (isMoving) {
      // Running limb swing animation
      const swing = Math.sin(t * 14) * 0.6;
      if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -swing * 0.8;
      if (rightArmRef.current) rightArmRef.current.rotation.x = swing * 0.8;

      // Running vertical bounce
      if (bodyRef.current) {
        bodyRef.current.position.y = 0.85 + Math.abs(Math.sin(t * 14)) * 0.08;
      }
    } else {
      // Idle breathing and gentle limb reset
      const breathe = Math.sin(t * 3) * 0.03;
      if (bodyRef.current) bodyRef.current.position.y = 0.85 + breathe;
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * 3) * 0.05;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -Math.sin(t * 3) * 0.05;
    }
  });

  return (
    <group>
      {/* Player Shadow Circle */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.45, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.3} />
      </mesh>

      {/* Main Body Pivot */}
      <group ref={bodyRef} position={[0, 0.85, 0]}>
        {/* Torso / Jacket */}
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[0.45, 0.5, 0.28]} />
          <meshStandardMaterial color="#2563eb" roughness={0.7} flatShading />
        </mesh>

        {/* Inner Shirt Collar */}
        <mesh position={[0, 0.45, 0.05]} castShadow>
          <boxGeometry args={[0.2, 0.12, 0.2]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.8} />
        </mesh>

        {/* Adventurer Backpack */}
        <mesh position={[0, 0.22, -0.18]} castShadow>
          <boxGeometry args={[0.32, 0.38, 0.16]} />
          <meshStandardMaterial color="#b45309" roughness={0.8} />
        </mesh>

        {/* Head */}
        <mesh position={[0, 0.68, 0]} castShadow>
          <sphereGeometry args={[0.22, 12, 12]} />
          <meshStandardMaterial color="#fed7aa" roughness={0.6} />
        </mesh>

        {/* Cap / Visor */}
        <group position={[0, 0.78, 0]}>
          {/* Cap Crown */}
          <mesh position={[0, 0.04, -0.02]}>
            <sphereGeometry args={[0.23, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshStandardMaterial color="#dc2626" roughness={0.6} />
          </mesh>
          {/* Visor / Brim */}
          <mesh position={[0, 0.02, 0.18]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.26, 0.04, 0.18]} />
            <meshStandardMaterial color="#dc2626" roughness={0.6} />
          </mesh>
        </group>

        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.3, 0.4, 0]}>
          <mesh position={[0, -0.2, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.4, 6]} />
            <meshStandardMaterial color="#2563eb" roughness={0.7} />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.42, 0]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial color="#fed7aa" />
          </mesh>
        </group>

        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.3, 0.4, 0]}>
          <mesh position={[0, -0.2, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.4, 6]} />
            <meshStandardMaterial color="#2563eb" roughness={0.7} />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.42, 0]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial color="#fed7aa" />
          </mesh>
        </group>

        {/* Left Leg */}
        <group ref={leftLegRef} position={[-0.14, 0, 0]}>
          <mesh position={[0, -0.25, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.5, 6]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          {/* Shoe */}
          <mesh position={[0, -0.52, 0.06]} castShadow>
            <boxGeometry args={[0.12, 0.1, 0.22]} />
            <meshStandardMaterial color="#dc2626" roughness={0.7} />
          </mesh>
        </group>

        {/* Right Leg */}
        <group ref={rightLegRef} position={[0.14, 0, 0]}>
          <mesh position={[0, -0.25, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.5, 6]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          {/* Shoe */}
          <mesh position={[0, -0.52, 0.06]} castShadow>
            <boxGeometry args={[0.12, 0.1, 0.22]} />
            <meshStandardMaterial color="#dc2626" roughness={0.7} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
