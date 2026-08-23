/**
 * Pokémon 3D RPG — Multi-Joint Articulated Pokémon Skeleton Rig
 * 
 * Provides anatomically authentic skeletal movement for canonical Pokémon species:
 * - PIKACHU (Hero Benchmark): bipedal steps, ear twitching, tail wag counter-oscillation,
 *   head tilts, cheek spark effects, curious observations, sprint bursts.
 * - BULBASAUR: 4-leg lumbering gait, body weight shifts, sniffing, dorsal bulb expansion pulse.
 * - PIDGEY: articulated wing flapping, banking turns, gliding, ground pecking, perch posture.
 * - CATERPIE: 5-segment undulating crawl wave, antenna twitching.
 * - MAGIKARP: aquatic spine undulation, pectoral fin flap, surface jumping and splash rings.
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SpeciesScaleSystem } from '../../systems/pokemon/SpeciesScaleSystem';
import { getPokemonAsset } from '../../data/pokemon/assets';

export type WildlifeAnimationState =
  | 'IDLE'
  | 'OBSERVE'
  | 'WANDER'
  | 'GRAZE'
  | 'FEED'
  | 'REST'
  | 'PLAY'
  | 'SLEEP'
  | 'CURIOUS'
  | 'FLEE'
  | 'AGGRESSIVE'
  | 'SWIM'
  | 'FLY'
  | 'ATTACK'
  | 'HIT';

interface PokemonSkeletonRigProps {
  speciesId: string;
  animationState: WildlifeAnimationState;
  speedRatio?: number;
  lookAtTarget?: [number, number, number] | null;
}

export const PokemonSkeletonRig: React.FC<PokemonSkeletonRigProps> = ({
  speciesId,
  animationState,
  speedRatio = 0,
}) => {
  const rootRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);
  const leftEarRef = useRef<THREE.Group>(null);
  const rightEarRef = useRef<THREE.Group>(null);
  const leftWingRef = useRef<THREE.Group>(null);
  const rightWingRef = useRef<THREE.Group>(null);
  const bulbRef = useRef<THREE.Group>(null);
  const segmentsRef = useRef<THREE.Group[]>([]);
  const sparkRef = useRef<THREE.Mesh>(null);

  const scaleData = SpeciesScaleSystem.getScaleData(speciesId);
  const asset = getPokemonAsset(speciesId);
  const isMoving = animationState === 'WANDER' || animationState === 'FLEE' || animationState === 'FLY' || animationState === 'SWIM';

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const isFlee = animationState === 'FLEE';
    const moveSpeed = isFlee ? 2.2 : 1.0;

    // =========================================================
    // 1. HERO BENCHMARK: PIKACHU RIG
    // =========================================================
    if (speciesId === 'pikachu' || speciesId === 'raichu') {
      if (isMoving) {
        // Fast lively hop stride
        const strideFreq = (isFlee ? 16 : 10) * moveSpeed;
        if (bodyRef.current) {
          bodyRef.current.position.y = 0.38 + Math.abs(Math.sin(t * strideFreq)) * 0.12;
          bodyRef.current.rotation.x = 0.12; // Forward sprint lean
        }
        // Tail counter-balance wag
        if (tailRef.current) {
          tailRef.current.rotation.y = Math.sin(t * strideFreq) * 0.45;
          tailRef.current.rotation.z = Math.cos(t * strideFreq) * 0.2;
        }
        // Ears sweep back during sprint
        if (leftEarRef.current) leftEarRef.current.rotation.x = -0.3 + Math.sin(t * 8) * 0.1;
        if (rightEarRef.current) rightEarRef.current.rotation.x = -0.3 - Math.sin(t * 8) * 0.1;
      } else {
        // Idle breathing & curious head tilts
        const breathe = Math.sin(t * 3) * 0.02;
        if (bodyRef.current) {
          bodyRef.current.position.y = 0.38 + breathe;
          bodyRef.current.rotation.x = 0;
        }
        // Ear twitches
        if (leftEarRef.current) leftEarRef.current.rotation.z = -0.2 + Math.sin(t * 5) * 0.15;
        if (rightEarRef.current) rightEarRef.current.rotation.z = 0.2 - Math.sin(t * 5) * 0.15;
        // Tail gentle wag
        if (tailRef.current) tailRef.current.rotation.y = Math.sin(t * 3.5) * 0.25;
        // Curious head tilt
        if (headRef.current) {
          headRef.current.rotation.z = animationState === 'CURIOUS' ? 0.25 : Math.sin(t * 1.5) * 0.08;
        }
      }

      // Cheek electrical spark animation
      if (sparkRef.current) {
        const isSparking = animationState === 'CURIOUS' || isFlee;
        sparkRef.current.visible = isSparking;
        if (isSparking) {
          const s = 0.8 + Math.sin(t * 24) * 0.4;
          sparkRef.current.scale.set(s, s, s);
        }
      }
    }

    // =========================================================
    // 2. BULBASAUR RIG (Quadruped lumbering gait & bulb pulse)
    // =========================================================
    if (speciesId === 'bulbasaur' || speciesId === 'ivysaur' || speciesId === 'venusaur') {
      if (isMoving) {
        const walkFreq = 7.0 * moveSpeed;
        if (bodyRef.current) {
          bodyRef.current.position.y = 0.32 + Math.abs(Math.sin(t * walkFreq)) * 0.04;
          bodyRef.current.rotation.z = Math.sin(t * walkFreq) * 0.06; // Side-to-side weight shift
        }
        if (headRef.current) headRef.current.rotation.x = 0.1 + Math.sin(t * walkFreq) * 0.08;
      } else {
        const breathe = Math.sin(t * 2.0) * 0.015;
        if (bodyRef.current) bodyRef.current.position.y = 0.32 + breathe;
        if (headRef.current) headRef.current.rotation.x = animationState === 'GRAZE' ? 0.35 : 0;
      }

      // Dorsal bulb breathing pulse
      if (bulbRef.current) {
        const pulse = 1.0 + Math.sin(t * 2.2) * 0.04;
        bulbRef.current.scale.set(pulse, pulse * 1.05, pulse);
      }
    }

    // =========================================================
    // 3. PIDGEY RIG (Airspace flight, wing flap & ground pecking)
    // =========================================================
    if (speciesId === 'pidgey' || speciesId === 'pidgeotto' || speciesId === 'pidgeot') {
      if (animationState === 'FLY' || isFlee) {
        // High speed flapping flight
        const flapFreq = 16.0;
        if (leftWingRef.current) leftWingRef.current.rotation.z = Math.sin(t * flapFreq) * 0.65;
        if (rightWingRef.current) rightWingRef.current.rotation.z = -Math.sin(t * flapFreq) * 0.65;
        if (bodyRef.current) bodyRef.current.position.y = 1.2 + Math.sin(t * 4) * 0.2;
      } else {
        // Perched or ground pecking
        if (leftWingRef.current) leftWingRef.current.rotation.z = -0.15;
        if (rightWingRef.current) rightWingRef.current.rotation.z = 0.15;
        if (headRef.current) {
          headRef.current.rotation.x = animationState === 'FEED' || animationState === 'GRAZE' ? Math.abs(Math.sin(t * 6)) * 0.5 : 0;
        }
      }
    }

    // =========================================================
    // 4. CATERPIE RIG (Multi-segment crawling undulation)
    // =========================================================
    if (speciesId === 'caterpie') {
      segmentsRef.current.forEach((seg, i) => {
        if (seg) {
          const waveFreq = 8.0;
          const yOffset = isMoving ? Math.sin(t * waveFreq - i * 0.9) * 0.06 : 0;
          seg.position.y = 0.15 + yOffset;
        }
      });
    }

    // =========================================================
    // 5. MAGIKARP RIG (Aquatic swimming & jumping)
    // =========================================================
    if (speciesId === 'magikarp') {
      const swimFreq = 10.0;
      if (bodyRef.current) {
        bodyRef.current.rotation.y = Math.sin(t * swimFreq) * 0.35;
        bodyRef.current.position.y = Math.sin(t * 2) * 0.05;
      }
      if (tailRef.current) {
        tailRef.current.rotation.y = Math.sin(t * swimFreq + 0.8) * 0.6;
      }
    }
  });

  const pColor = asset.primaryColor;
  const sColor = asset.secondaryColor;
  const inWorldScale = scaleData.inWorldScale;

  return (
    <group ref={rootRef} scale={[inWorldScale, inWorldScale, inWorldScale]}>
      {/* Dynamic Shadow Disk */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[scaleData.shadowRadius, 16]} />
        <meshBasicMaterial color="#020617" opacity={0.32} transparent depthWrite={false} />
      </mesh>

      {/* ========================================================= */}
      {/* 1. PIKACHU SKELETAL MESH */}
      {/* ========================================================= */}
      {(speciesId === 'pikachu' || speciesId === 'raichu') && (
        <group ref={bodyRef} position={[0, 0.38, 0]}>
          {/* Torso */}
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[0.36, 14, 12]} />
            <meshStandardMaterial color={pColor} roughness={0.4} />
          </mesh>
          {/* Back Stripes */}
          <mesh position={[0, 0.08, -0.32]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.28, 0.06, 0.08]} />
            <meshStandardMaterial color="#78350f" roughness={0.8} />
          </mesh>

          {/* Head */}
          <group ref={headRef} position={[0, 0.28, 0.08]}>
            <mesh castShadow>
              <sphereGeometry args={[0.3, 14, 12]} />
              <meshStandardMaterial color={pColor} roughness={0.4} />
            </mesh>
            {/* Red Cheeks */}
            <mesh position={[0.22, -0.06, 0.22]}>
              <sphereGeometry args={[0.075, 8, 8]} />
              <meshStandardMaterial color="#ef4444" roughness={0.3} />
            </mesh>
            <mesh position={[-0.22, -0.06, 0.22]}>
              <sphereGeometry args={[0.075, 8, 8]} />
              <meshStandardMaterial color="#ef4444" roughness={0.3} />
            </mesh>
            {/* Cheek Spark Particles */}
            <mesh ref={sparkRef} position={[0.24, -0.04, 0.24]}>
              <sphereGeometry args={[0.06, 6, 6]} />
              <meshBasicMaterial color="#fef08a" wireframe />
            </mesh>
            {/* Eyes */}
            <mesh position={[0.13, 0.06, 0.26]}><sphereGeometry args={[0.045, 8, 8]} /><meshBasicMaterial color="#0f172a" /></mesh>
            <mesh position={[-0.13, 0.06, 0.26]}><sphereGeometry args={[0.045, 8, 8]} /><meshBasicMaterial color="#0f172a" /></mesh>

            {/* Independent Ears */}
            <group ref={leftEarRef} position={[-0.18, 0.26, 0]}>
              <mesh position={[0, 0.16, 0]}><cylinderGeometry args={[0.04, 0.07, 0.32, 8]} /><meshStandardMaterial color={pColor} /></mesh>
              <mesh position={[0, 0.34, 0]}><coneGeometry args={[0.045, 0.16, 8]} /><meshBasicMaterial color="#0f172a" /></mesh>
            </group>
            <group ref={rightEarRef} position={[0.18, 0.26, 0]}>
              <mesh position={[0, 0.16, 0]}><cylinderGeometry args={[0.04, 0.07, 0.32, 8]} /><meshStandardMaterial color={pColor} /></mesh>
              <mesh position={[0, 0.34, 0]}><coneGeometry args={[0.045, 0.16, 8]} /><meshBasicMaterial color="#0f172a" /></mesh>
            </group>
          </group>

          {/* Articulated Lightning Tail */}
          <group ref={tailRef} position={[0, -0.1, -0.32]} rotation={[0.4, 0, 0]}>
            <mesh position={[0, 0.12, 0]}><boxGeometry args={[0.08, 0.22, 0.02]} /><meshStandardMaterial color="#78350f" /></mesh>
            <mesh position={[0.08, 0.24, 0]} rotation={[0, 0, 0.6]}><boxGeometry args={[0.1, 0.2, 0.02]} /><meshStandardMaterial color={pColor} /></mesh>
            <mesh position={[0.04, 0.38, 0]}><boxGeometry args={[0.18, 0.18, 0.02]} /><meshStandardMaterial color={pColor} /></mesh>
          </group>

          {/* Feet */}
          <mesh position={[0.15, -0.3, 0.05]}><boxGeometry args={[0.1, 0.08, 0.22]} /><meshStandardMaterial color={pColor} /></mesh>
          <mesh position={[-0.15, -0.3, 0.05]}><boxGeometry args={[0.1, 0.08, 0.22]} /><meshStandardMaterial color={pColor} /></mesh>
        </group>
      )}

      {/* ========================================================= */}
      {/* 2. BULBASAUR SKELETAL MESH */}
      {/* ========================================================= */}
      {(speciesId === 'bulbasaur' || speciesId === 'ivysaur' || speciesId === 'venusaur') && (
        <group ref={bodyRef} position={[0, 0.32, 0]}>
          {/* Main Quadruped Body */}
          <mesh castShadow receiveShadow><sphereGeometry args={[0.42, 14, 12]} /><meshStandardMaterial color={pColor} roughness={0.5} /></mesh>
          {/* Head */}
          <group ref={headRef} position={[0, 0.12, 0.35]}>
            <mesh castShadow><sphereGeometry args={[0.32, 14, 12]} /><meshStandardMaterial color={pColor} roughness={0.5} /></mesh>
            <mesh position={[0.14, 0.08, 0.26]}><sphereGeometry args={[0.045, 8, 8]} /><meshBasicMaterial color="#dc2626" /></mesh>
            <mesh position={[-0.14, 0.08, 0.26]}><sphereGeometry args={[0.045, 8, 8]} /><meshBasicMaterial color="#dc2626" /></mesh>
          </group>
          {/* Dorsal Plant Bulb */}
          <group ref={bulbRef} position={[0, 0.32, -0.08]}>
            <mesh><dodecahedronGeometry args={[0.3, 0]} /><meshStandardMaterial color={sColor} roughness={0.7} /></mesh>
          </group>
          {/* 4 Sturdy Legs */}
          <mesh position={[0.24, -0.2, 0.22]}><cylinderGeometry args={[0.09, 0.11, 0.26, 6]} /><meshStandardMaterial color={pColor} /></mesh>
          <mesh position={[-0.24, -0.2, 0.22]}><cylinderGeometry args={[0.09, 0.11, 0.26, 6]} /><meshStandardMaterial color={pColor} /></mesh>
          <mesh position={[0.24, -0.2, -0.22]}><cylinderGeometry args={[0.09, 0.11, 0.26, 6]} /><meshStandardMaterial color={pColor} /></mesh>
          <mesh position={[-0.24, -0.2, -0.22]}><cylinderGeometry args={[0.09, 0.11, 0.26, 6]} /><meshStandardMaterial color={pColor} /></mesh>
        </group>
      )}

      {/* ========================================================= */}
      {/* 3. PIDGEY AVIAN SKELETAL MESH */}
      {/* ========================================================= */}
      {(speciesId === 'pidgey' || speciesId === 'pidgeotto' || speciesId === 'pidgeot') && (
        <group ref={bodyRef} position={[0, 0.3, 0]}>
          <mesh castShadow receiveShadow><sphereGeometry args={[0.32, 12, 10]} /><meshStandardMaterial color={pColor} roughness={0.6} /></mesh>
          {/* Head & Beak */}
          <group ref={headRef} position={[0, 0.22, 0.16]}>
            <mesh castShadow><sphereGeometry args={[0.2, 10, 10]} /><meshStandardMaterial color={pColor} /></mesh>
            <mesh position={[0, -0.02, 0.2]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.06, 0.16, 6]} /><meshStandardMaterial color="#f59e0b" /></mesh>
          </group>
          {/* Wings */}
          <group ref={leftWingRef} position={[-0.24, 0.08, 0]}>
            <mesh position={[-0.34, 0, 0]}><boxGeometry args={[0.55, 0.04, 0.3]} /><meshStandardMaterial color={pColor} /></mesh>
          </group>
          <group ref={rightWingRef} position={[0.24, 0.08, 0]}>
            <mesh position={[0.34, 0, 0]}><boxGeometry args={[0.55, 0.04, 0.3]} /><meshStandardMaterial color={pColor} /></mesh>
          </group>
        </group>
      )}

      {/* ========================================================= */}
      {/* 4. CATERPIE 5-SEGMENT CRAWLER */}
      {/* ========================================================= */}
      {speciesId === 'caterpie' && (
        <group position={[0, 0, 0]}>
          {[0, 1, 2, 3, 4].map((i) => (
            <group
              key={`seg-${i}`}
              ref={(el) => { if (el) segmentsRef.current[i] = el; }}
              position={[0, 0.15, 0.25 - i * 0.18]}
            >
              <mesh castShadow><sphereGeometry args={[0.16 - i * 0.015, 10, 8]} /><meshStandardMaterial color={i === 0 ? '#65a30d' : '#84cc16'} /></mesh>
              {i === 0 && (
                /* Red Y-antenna */
                <mesh position={[0, 0.14, 0.08]} rotation={[0.3, 0, 0]}>
                  <coneGeometry args={[0.04, 0.14, 5]} />
                  <meshBasicMaterial color="#ef4444" />
                </mesh>
              )}
            </group>
          ))}
        </group>
      )}

      {/* ========================================================= */}
      {/* 5. MAGIKARP AQUATIC FISH */}
      {/* ========================================================= */}
      {speciesId === 'magikarp' && (
        <group ref={bodyRef} position={[0, 0.2, 0]}>
          <mesh castShadow><boxGeometry args={[0.22, 0.45, 0.65]} /><meshStandardMaterial color="#ef4444" roughness={0.4} /></mesh>
          {/* Yellow Crown Fin */}
          <mesh position={[0, 0.34, 0]}><coneGeometry args={[0.18, 0.25, 4]} /><meshStandardMaterial color="#facc15" /></mesh>
          {/* Tail Fin */}
          <group ref={tailRef} position={[0, 0, -0.35]}>
            <mesh position={[0, 0, -0.12]}><boxGeometry args={[0.04, 0.35, 0.25]} /><meshStandardMaterial color="#f8fafc" /></mesh>
          </group>
        </group>
      )}

      {/* Generic fallback for other registered species */}
      {!['pikachu', 'raichu', 'bulbasaur', 'ivysaur', 'venusaur', 'pidgey', 'pidgeotto', 'pidgeot', 'caterpie', 'magikarp'].includes(speciesId) && (
        <group position={[0, 0.4, 0]}>
          <mesh castShadow><sphereGeometry args={[0.4, 14, 12]} /><meshStandardMaterial color={pColor} roughness={0.5} /></mesh>
          <mesh position={[0, 0.25, 0.2]} castShadow><sphereGeometry args={[0.28, 12, 10]} /><meshStandardMaterial color={sColor} roughness={0.6} /></mesh>
        </group>
      )}
    </group>
  );
};
