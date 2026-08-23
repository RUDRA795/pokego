/**
 * Pokémon 3D RPG — Stylized 3D Pokémon Trainer Character Model & Animation Rig
 * 
 * Features:
 * - Stylized anime proportions (Trainer cap, hair, jacket, backpack, sneakers).
 * - Dynamic team color accents (Mystic Blue / Valor Red / Instinct Yellow).
 * - Procedural skeletal animation rig:
 *   - Idle breathing and subtle postural shifts.
 *   - Walking stride cycle (alternating legs, swinging arms, vertical torso bob).
 *   - Running sprint cycle (forward torso lean, rapid stride dynamics).
 *   - Smooth turn banking and heading rotation.
 * - Soft contact blob shadow disc on ground.
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface TrainerAvatarProps {
  isMoving: boolean;
  isSprinting?: boolean;
  headingAngle: number; // in radians
  teamColor?: string;
}

export const TrainerAvatar3D: React.FC<TrainerAvatarProps> = ({
  isMoving,
  isSprinting = false,
  headingAngle,
  teamColor = '#0284c7', // Default Mystic Blue
}) => {
  const rootGroupRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Mesh>(null);

  // Animation cycle phase tracker
  const animPhaseRef = useRef<number>(0);
  const currentHeadingRef = useRef<number>(headingAngle);

  useFrame((_, delta) => {
    // Smooth heading interpolation (slerp-like)
    let diff = headingAngle - currentHeadingRef.current;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    currentHeadingRef.current += diff * Math.min(1, delta * 12);

    if (rootGroupRef.current) {
      rootGroupRef.current.rotation.y = currentHeadingRef.current;
    }

    const speedMultiplier = isSprinting ? 12 : 7;
    const animDelta = isMoving ? delta * speedMultiplier : delta * 2;
    animPhaseRef.current += animDelta;
    const phase = animPhaseRef.current;

    if (isMoving) {
      const strideAmp = isSprinting ? 0.75 : 0.45;
      const armAmp = isSprinting ? 0.8 : 0.5;
      const bobAmp = isSprinting ? 0.08 : 0.04;

      // 1. Legs Striding (Opposite phases)
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = Math.sin(phase) * strideAmp;
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = -Math.sin(phase) * strideAmp;
      }

      // 2. Arms Swing (Opposite to legs)
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -Math.sin(phase) * armAmp;
        leftArmRef.current.rotation.z = 0.1;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = Math.sin(phase) * armAmp;
        rightArmRef.current.rotation.z = -0.1;
      }

      // 3. Torso Bobbing & Forward Sprint Lean
      if (torsoRef.current) {
        torsoRef.current.position.y = 0.65 + Math.abs(Math.sin(phase * 2)) * bobAmp;
        torsoRef.current.rotation.x = isSprinting ? 0.15 : 0.05;
        torsoRef.current.rotation.y = Math.sin(phase) * 0.08;
      }

      // 4. Head subtle counter-tilt
      if (headRef.current) {
        headRef.current.rotation.y = -Math.sin(phase) * 0.05;
        headRef.current.rotation.x = isSprinting ? -0.1 : 0;
      }

      // 5. Shadow scale pulsation with step
      if (shadowRef.current) {
        const s = 0.95 + Math.sin(phase * 2) * 0.08;
        shadowRef.current.scale.set(s, s, 1);
      }
    } else {
      // Idle Breathing Animation
      const breath = Math.sin(phase * 0.8) * 0.02;

      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = 0;
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = 0;
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = Math.sin(phase * 0.8) * 0.05;
        leftArmRef.current.rotation.z = 0.08;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -Math.sin(phase * 0.8) * 0.05;
        rightArmRef.current.rotation.z = -0.08;
      }
      if (torsoRef.current) {
        torsoRef.current.position.y = 0.65 + breath;
        torsoRef.current.rotation.x = 0;
        torsoRef.current.rotation.y = 0;
      }
      if (headRef.current) {
        headRef.current.rotation.x = Math.sin(phase * 0.4) * 0.03;
        headRef.current.rotation.y = Math.sin(phase * 0.3) * 0.04;
      }
      if (shadowRef.current) {
        shadowRef.current.scale.set(1, 1, 1);
      }
    }
  });

  return (
    <group>
      {/* Dynamic Blob Contact Shadow */}
      <mesh ref={shadowRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42, 24]} />
        <meshBasicMaterial color="#050811" transparent opacity={0.55} />
      </mesh>

      {/* Trainer Skeleton Root */}
      <group ref={rootGroupRef}>
        {/* LEGS (Anchored at Pelvis / Hip Joints) */}
        {/* Left Leg */}
        <group ref={leftLegRef} position={[-0.14, 0.5, 0]}>
          {/* Thigh */}
          <mesh position={[0, -0.15, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.06, 0.3, 12]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          {/* Shin */}
          <mesh position={[0, -0.36, 0.01]} castShadow>
            <cylinderGeometry args={[0.06, 0.05, 0.26, 12]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>
          {/* Sneaker */}
          <mesh position={[0, -0.48, 0.05]} castShadow>
            <boxGeometry args={[0.11, 0.1, 0.22]} />
            <meshStandardMaterial color="#ffffff" roughness={0.4} />
          </mesh>
          {/* Sneaker Sole/Stripe */}
          <mesh position={[0, -0.52, 0.05]}>
            <boxGeometry args={[0.115, 0.03, 0.23]} />
            <meshStandardMaterial color={teamColor} roughness={0.4} />
          </mesh>
        </group>

        {/* Right Leg */}
        <group ref={rightLegRef} position={[0.14, 0.5, 0]}>
          {/* Thigh */}
          <mesh position={[0, -0.15, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.06, 0.3, 12]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          {/* Shin */}
          <mesh position={[0, -0.36, 0.01]} castShadow>
            <cylinderGeometry args={[0.06, 0.05, 0.26, 12]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>
          {/* Sneaker */}
          <mesh position={[0, -0.48, 0.05]} castShadow>
            <boxGeometry args={[0.11, 0.1, 0.22]} />
            <meshStandardMaterial color="#ffffff" roughness={0.4} />
          </mesh>
          {/* Sneaker Sole/Stripe */}
          <mesh position={[0, -0.52, 0.05]}>
            <boxGeometry args={[0.115, 0.03, 0.23]} />
            <meshStandardMaterial color={teamColor} roughness={0.4} />
          </mesh>
        </group>

        {/* UPPER BODY & TORSO GROUP */}
        <group ref={torsoRef} position={[0, 0.65, 0]}>
          {/* Hips / Shorts */}
          <mesh position={[0, -0.05, 0]} castShadow>
            <boxGeometry args={[0.34, 0.18, 0.22]} />
            <meshStandardMaterial color="#1e293b" roughness={0.7} />
          </mesh>

          {/* Torso / Trainer Jacket */}
          <mesh position={[0, 0.15, 0]} castShadow>
            <boxGeometry args={[0.36, 0.32, 0.24]} />
            <meshStandardMaterial color={teamColor} roughness={0.5} />
          </mesh>

          {/* Jacket Center Zipper & Collar */}
          <mesh position={[0, 0.15, 0.122]}>
            <planeGeometry args={[0.06, 0.32]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 0.32, 0.02]} castShadow>
            <boxGeometry args={[0.22, 0.06, 0.2]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>

          {/* Adventure Backpack on Back */}
          <group position={[0, 0.16, -0.16]}>
            <mesh castShadow>
              <boxGeometry args={[0.26, 0.28, 0.14]} />
              <meshStandardMaterial color="#334155" roughness={0.6} />
            </mesh>
            {/* Backpack Flap */}
            <mesh position={[0, 0.1, 0.02]}>
              <boxGeometry args={[0.24, 0.08, 0.12]} />
              <meshStandardMaterial color="#e2e8f0" />
            </mesh>
            {/* Poké Ball Keyring on Bag */}
            <mesh position={[0.12, -0.05, 0.08]}>
              <sphereGeometry args={[0.04, 12, 12]} />
              <meshStandardMaterial color="#ef4444" roughness={0.3} />
            </mesh>
          </group>

          {/* LEFT ARM */}
          <group ref={leftArmRef} position={[-0.24, 0.25, 0]}>
            {/* Sleeve */}
            <mesh position={[0, -0.08, 0]} castShadow>
              <cylinderGeometry args={[0.06, 0.055, 0.18, 10]} />
              <meshStandardMaterial color={teamColor} roughness={0.5} />
            </mesh>
            {/* Forearm & Hand */}
            <mesh position={[0, -0.24, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.045, 0.2, 10]} />
              <meshStandardMaterial color="#fed7aa" roughness={0.6} />
            </mesh>
            {/* Fingerless Glove */}
            <mesh position={[0, -0.32, 0]}>
              <boxGeometry args={[0.08, 0.08, 0.08]} />
              <meshStandardMaterial color="#0f172a" roughness={0.6} />
            </mesh>
          </group>

          {/* RIGHT ARM */}
          <group ref={rightArmRef} position={[0.24, 0.25, 0]}>
            {/* Sleeve */}
            <mesh position={[0, -0.08, 0]} castShadow>
              <cylinderGeometry args={[0.06, 0.055, 0.18, 10]} />
              <meshStandardMaterial color={teamColor} roughness={0.5} />
            </mesh>
            {/* Forearm & Hand */}
            <mesh position={[0, -0.24, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.045, 0.2, 10]} />
              <meshStandardMaterial color="#fed7aa" roughness={0.6} />
            </mesh>
            {/* Fingerless Glove */}
            <mesh position={[0, -0.32, 0]}>
              <boxGeometry args={[0.08, 0.08, 0.08]} />
              <meshStandardMaterial color="#0f172a" roughness={0.6} />
            </mesh>
          </group>

          {/* HEAD & CAP */}
          <group ref={headRef} position={[0, 0.44, 0]}>
            {/* Neck */}
            <mesh position={[0, -0.08, 0]}>
              <cylinderGeometry args={[0.05, 0.06, 0.08, 10]} />
              <meshStandardMaterial color="#fed7aa" />
            </mesh>
            {/* Head Face */}
            <mesh position={[0, 0.06, 0]} castShadow>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial color="#ffedd5" roughness={0.5} />
            </mesh>
            {/* Anime Eyes */}
            <mesh position={[-0.05, 0.06, 0.138]}>
              <planeGeometry args={[0.03, 0.04]} />
              <meshBasicMaterial color="#0f172a" />
            </mesh>
            <mesh position={[0.05, 0.06, 0.138]}>
              <planeGeometry args={[0.03, 0.04]} />
              <meshBasicMaterial color="#0f172a" />
            </mesh>

            {/* Hair Tufts */}
            <mesh position={[0, 0.08, -0.04]} castShadow>
              <sphereGeometry args={[0.16, 12, 12]} />
              <meshStandardMaterial color="#334155" roughness={0.9} />
            </mesh>

            {/* Trainer Cap (Red & White with Visor) */}
            <group position={[0, 0.12, 0]}>
              {/* Cap Dome */}
              <mesh castShadow>
                <sphereGeometry args={[0.16, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color="#ef4444" roughness={0.4} />
              </mesh>
              {/* Front White Panel */}
              <mesh position={[0, 0.04, 0.12]} rotation={[0.2, 0, 0]}>
                <circleGeometry args={[0.07, 16]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
              {/* Poké Ball Icon on Cap */}
              <mesh position={[0, 0.04, 0.123]} rotation={[0.2, 0, 0]}>
                <ringGeometry args={[0.02, 0.035, 16]} />
                <meshBasicMaterial color="#ef4444" />
              </mesh>
              {/* Cap Visor / Brim */}
              <mesh position={[0, 0.02, 0.14]} rotation={[0.25, 0, 0]} castShadow>
                <boxGeometry args={[0.2, 0.02, 0.12]} />
                <meshStandardMaterial color="#ffffff" roughness={0.4} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};
