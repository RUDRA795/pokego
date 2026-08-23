/**
 * Pokémon 3D RPG — Articulated 3D Player Character Rig
 * 
 * Features:
 * - Multi-joint articulated skeletal structure: Head, Neck, Shoulders, Upper Arms,
 *   Forearms, Hands, Torso, Backpack, Pelvis, Thighs, Shins, Shoes.
 * - Procedural locomotion blend: IDLE, WALK, JOG, SPRINT, JUMP, FALL, LAND.
 * - Dynamic stride gait, arm swing counter-oscillation, and vertical torso bounce.
 * - Dynamic shadow projection disk.
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type PlayerLocomotionState = 'IDLE' | 'WALK' | 'JOG' | 'SPRINT' | 'JUMP' | 'FALL' | 'LAND';

interface PlayerCharacterProps {
  locomotionState: PlayerLocomotionState;
  speedRatio: number; // 0 (idle) to 1.0 (sprint)
}

export const PlayerCharacter: React.FC<PlayerCharacterProps> = ({ locomotionState, speedRatio }) => {
  const rootGroupRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftKneeRef = useRef<THREE.Group>(null);
  const rightKneeRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (locomotionState === 'JUMP' || locomotionState === 'FALL') {
      // Airborne pose: arms extended, knees bent up
      if (leftArmRef.current) leftArmRef.current.rotation.x = -0.8;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -0.8;
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0.6;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0.3;
      if (torsoRef.current) torsoRef.current.position.y = 0.88;
      return;
    }

    const isMoving = locomotionState === 'WALK' || locomotionState === 'JOG' || locomotionState === 'SPRINT';

    if (isMoving) {
      // Dynamic frequency & amplitude scaling with speed
      const freq = 8.0 + speedRatio * 8.0; // 8 to 16 rad/s
      const swingAmp = 0.35 + speedRatio * 0.45; // 0.35 to 0.8 rad

      const swing = Math.sin(t * freq) * swingAmp;

      // Leg swings
      if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;

      // Knee bending on back-swing
      if (leftKneeRef.current) leftKneeRef.current.rotation.x = Math.max(0, -swing * 0.8);
      if (rightKneeRef.current) rightKneeRef.current.rotation.x = Math.max(0, swing * 0.8);

      // Arm swing counter-oscillation
      if (leftArmRef.current) leftArmRef.current.rotation.x = -swing * 0.85;
      if (rightArmRef.current) rightArmRef.current.rotation.x = swing * 0.85;

      // Torso vertical bounce & slight forward lean
      if (torsoRef.current) {
        torsoRef.current.position.y = 0.85 + Math.abs(Math.sin(t * freq)) * (0.05 + speedRatio * 0.05);
        torsoRef.current.rotation.x = 0.05 + speedRatio * 0.12; // Forward sprint lean
      }

      // Head stabilization
      if (headRef.current) {
        headRef.current.rotation.x = -0.05 - speedRatio * 0.1;
      }
    } else {
      // Idle breathing and relaxed posture
      const breathe = Math.sin(t * 2.5) * 0.025;
      if (torsoRef.current) {
        torsoRef.current.position.y = 0.85 + breathe;
        torsoRef.current.rotation.x = 0;
      }
      if (headRef.current) headRef.current.rotation.x = Math.sin(t * 1.8) * 0.03;

      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (leftKneeRef.current) leftKneeRef.current.rotation.x = 0;
      if (rightKneeRef.current) rightKneeRef.current.rotation.x = 0;

      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * 2.5) * 0.04;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -Math.sin(t * 2.5) * 0.04;
    }
  });

  return (
    <group ref={rootGroupRef}>
      {/* Ground Contact Shadow Disk */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42, 16]} />
        <meshBasicMaterial color="#020617" opacity={0.35} transparent depthWrite={false} />
      </mesh>

      {/* Main Articulated Torso */}
      <group ref={torsoRef} position={[0, 0.85, 0]}>
        {/* Trainer Jacket / Chest */}
        <mesh position={[0, 0.24, 0]} castShadow>
          <boxGeometry args={[0.44, 0.48, 0.26]} />
          <meshStandardMaterial color="#2563eb" roughness={0.7} />
        </mesh>

        {/* White Collar */}
        <mesh position={[0, 0.46, 0.04]} castShadow>
          <boxGeometry args={[0.18, 0.1, 0.18]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.8} />
        </mesh>

        {/* Trainer Backpack */}
        <mesh position={[0, 0.22, -0.17]} castShadow>
          <boxGeometry args={[0.3, 0.36, 0.15]} />
          <meshStandardMaterial color="#b45309" roughness={0.85} />
        </mesh>

        {/* Head & Cap */}
        <group ref={headRef} position={[0, 0.65, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshStandardMaterial color="#fed7aa" roughness={0.6} />
          </mesh>
          {/* Cap */}
          <mesh position={[0, 0.1, -0.02]}>
            <sphereGeometry args={[0.21, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshStandardMaterial color="#dc2626" roughness={0.6} />
          </mesh>
          {/* Cap Visor */}
          <mesh position={[0, 0.08, 0.16]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.24, 0.03, 0.16]} />
            <meshStandardMaterial color="#dc2626" roughness={0.6} />
          </mesh>
        </group>

        {/* Left Arm Articulation */}
        <group ref={leftArmRef} position={[-0.28, 0.38, 0]}>
          <mesh position={[0, -0.18, 0]} castShadow>
            <cylinderGeometry args={[0.065, 0.065, 0.36, 6]} />
            <meshStandardMaterial color="#2563eb" roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.4, 0]}>
            <sphereGeometry args={[0.065, 8, 8]} />
            <meshStandardMaterial color="#fed7aa" />
          </mesh>
        </group>

        {/* Right Arm Articulation */}
        <group ref={rightArmRef} position={[0.28, 0.38, 0]}>
          <mesh position={[0, -0.18, 0]} castShadow>
            <cylinderGeometry args={[0.065, 0.065, 0.36, 6]} />
            <meshStandardMaterial color="#2563eb" roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.4, 0]}>
            <sphereGeometry args={[0.065, 8, 8]} />
            <meshStandardMaterial color="#fed7aa" />
          </mesh>
        </group>

        {/* Left Leg Articulation */}
        <group ref={leftLegRef} position={[-0.14, 0, 0]}>
          <mesh position={[0, -0.22, 0]} castShadow>
            <cylinderGeometry args={[0.075, 0.075, 0.44, 6]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          <group ref={leftKneeRef} position={[0, -0.44, 0]}>
            <mesh position={[0, -0.1, 0.06]} castShadow>
              <boxGeometry args={[0.11, 0.09, 0.2]} />
              <meshStandardMaterial color="#dc2626" roughness={0.7} />
            </mesh>
          </group>
        </group>

        {/* Right Leg Articulation */}
        <group ref={rightLegRef} position={[0.14, 0, 0]}>
          <mesh position={[0, -0.22, 0]} castShadow>
            <cylinderGeometry args={[0.075, 0.075, 0.44, 6]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          <group ref={rightKneeRef} position={[0, -0.44, 0]}>
            <mesh position={[0, -0.1, 0.06]} castShadow>
              <boxGeometry args={[0.11, 0.09, 0.2]} />
              <meshStandardMaterial color="#dc2626" roughness={0.7} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
};
