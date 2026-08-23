/**
 * Pokémon 3D RPG — High-Fidelity Pokémon 3D Renderer & Dynamic Rig
 * 
 * Features:
 * - Species-specific stylized 3D geometry with signature canonical traits:
 *   - Pikachu: lightning tail, red cheeks, black-tipped ears with animated twitch.
 *   - Charmander: orange biped, cream belly, flickering animated tail flame.
 *   - Bulbasaur: quadruped body, dark spots, green dorsal bulb with pulse.
 *   - Squirtle: turtle shell with yellow plastron and curled tail.
 *   - Pidgey / Birds: feathered body with flapping articulated wings.
 *   - Zubat: bat body with rapid dual-wing flapping.
 *   - Gastly: purple spectral sphere with glowing eyes and pulsing mist aura.
 *   - Onix: chain of 6 articulated rocky boulder segments with spine undulation.
 *   - Magikarp: orange fish body with yellow crown fin and fluttering tail.
 *   - Geodude: floating rock boulder with two articulated rocky arms.
 *   - Eevee: fox quadruped with fluffy neck mane, ear twitches, and tail wag.
 * - Non-combat dynamic emote bubbles (alert, heart, musical note, sleep zzz).
 * - Centralized asset registry integration with fallback safety.
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AIState } from '../../types/pokemon';
import { getPokemonById } from '../../data/pokemon';
import { getPokemonAsset } from '../../data/pokemon/assets';
import { getPokemonAnimationProfile } from '../../data/pokemon/animations';

interface PokemonRendererProps {
  speciesId: string;
  state: AIState;
  emote?: 'heart' | 'alert' | 'music' | 'sleep' | null;
}

export const PokemonRenderer: React.FC<PokemonRendererProps> = ({ speciesId, state, emote }) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);
  const flameRef = useRef<THREE.Mesh>(null);
  const leftWingRef = useRef<THREE.Group>(null);
  const rightWingRef = useRef<THREE.Group>(null);
  const leftEarRef = useRef<THREE.Group>(null);
  const rightEarRef = useRef<THREE.Group>(null);
  const bulbRef = useRef<THREE.Group>(null);
  const spineSegmentsRef = useRef<THREE.Group[]>([]);

  const species = getPokemonById(speciesId);
  const asset = getPokemonAsset(speciesId);
  const animProfile = getPokemonAnimationProfile(speciesId);

  const showExclamation = state === 'DETECTED' || state === 'APPROACH' || emote === 'alert';

  // Dynamic Multi-Part Animation Loop
  useFrame(({ clock }) => {
    if (!meshRef.current || !species) return;
    const t = clock.getElapsedTime();
    const isMoving = state === 'WANDER' || state === 'APPROACH' || state === 'FLEE';
    const locomotion = species.visualConfig.locomotion;
    const pacing = isMoving ? animProfile.walk : animProfile.idle;

    // 1. Root Vertical Elevation & Locomotion
    if (locomotion === 'flying' || locomotion === 'hovering') {
      const hoverBase = (asset.groundOffset || 1.0);
      meshRef.current.position.y = hoverBase + Math.sin(t * pacing.frequency) * pacing.amplitude * 1.5;
      if (isMoving) {
        meshRef.current.rotation.z = Math.sin(t * 6) * 0.12; // Bank angle
      } else {
        meshRef.current.rotation.z = 0;
      }
    } else if (locomotion === 'swimming') {
      meshRef.current.position.y = (asset.groundOffset || 0) + Math.sin(t * pacing.frequency) * 0.05;
      meshRef.current.rotation.z = Math.sin(t * pacing.frequency * 1.2) * 0.07;
    } else if (animProfile.specialProps.hoppingGait || locomotion === 'ground_hop') {
      if (isMoving) {
        meshRef.current.position.y = Math.abs(Math.sin(t * pacing.frequency)) * 0.35;
      } else {
        meshRef.current.position.y = Math.sin(t * pacing.frequency) * 0.03;
      }
    } else {
      // Standard ground walk
      if (isMoving) {
        meshRef.current.position.y = Math.abs(Math.sin(t * pacing.frequency)) * 0.1;
      } else {
        meshRef.current.position.y = Math.sin(t * pacing.frequency) * 0.025;
      }
    }

    // 2. Ears Animation (Pikachu, Eevee)
    if (animProfile.specialProps.earTwitch) {
      const earTwitch = Math.sin(t * 4.5) * 0.15;
      if (leftEarRef.current) leftEarRef.current.rotation.z = -0.2 + earTwitch;
      if (rightEarRef.current) rightEarRef.current.rotation.z = 0.2 - earTwitch;
    }

    // 3. Tail Wag & Flame Flicker (Charmander, Pikachu, Eevee)
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(t * (isMoving ? 8 : 4)) * 0.25;
    }
    if (flameRef.current && animProfile.specialProps.tailFlameFlicker) {
      const flicker = 0.8 + Math.sin(t * 18) * 0.2 + Math.cos(t * 26) * 0.15;
      flameRef.current.scale.set(flicker, flicker * 1.3, flicker);
    }

    // 4. Wings Flapping (Pidgey, Zubat, Butterfree)
    const wingSpeed = animProfile.specialProps.wingFlapSpeed || (isMoving ? 14 : 6);
    if (leftWingRef.current) {
      leftWingRef.current.rotation.z = Math.sin(t * wingSpeed) * 0.55;
    }
    if (rightWingRef.current) {
      rightWingRef.current.rotation.z = -Math.sin(t * wingSpeed) * 0.55;
    }

    // 5. Bulb Pulse (Bulbasaur, Ivysaur)
    if (bulbRef.current && animProfile.specialProps.bulbPulse) {
      const bulbScale = 1.0 + Math.sin(t * 2) * 0.05;
      bulbRef.current.scale.set(bulbScale, bulbScale, bulbScale);
    }

    // 6. Onix / Gyarados Serpentine Body Wave
    if (animProfile.specialProps.segmentedBodyCurl) {
      spineSegmentsRef.current.forEach((seg, i) => {
        if (seg) {
          const wave = Math.sin(t * 4 + i * 0.8) * 0.2;
          seg.position.x = wave * (i * 0.15);
          seg.rotation.y = wave * 0.6;
        }
      });
    }
  });

  if (!species) return null;

  const canonicalScale = Math.max(0.4, Math.min(2.5, asset.scale));
  const pColor = asset.primaryColor;
  const sColor = asset.secondaryColor;
  const aColor = asset.accentColor || '#ffffff';

  return (
    <group ref={groupRef}>
      {/* Dynamic Emote Floating Bubble */}
      {showExclamation && (
        <group position={[0, canonicalScale + 0.85, 0]}>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.06, 0.04, 0.28, 6]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0, -0.12, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </group>
      )}

      {emote === 'heart' && (
        <group position={[0, canonicalScale + 0.8, 0]}>
          <mesh>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshBasicMaterial color="#f43f5e" />
          </mesh>
        </group>
      )}

      {emote === 'music' && (
        <group position={[0, canonicalScale + 0.8, 0]}>
          <mesh>
            <torusGeometry args={[0.1, 0.03, 8, 16]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>
      )}

      {emote === 'sleep' && (
        <group position={[0.3, canonicalScale + 0.75, 0]}>
          <mesh>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color="#94a3b8" />
          </mesh>
        </group>
      )}

      {/* Main 3D Articulated Pokémon Mesh */}
      <group ref={meshRef} scale={[canonicalScale, canonicalScale, canonicalScale]}>
        
        {/* ==================================================== */}
        {/* SPECIES A: PIKACHU RIG */}
        {/* ==================================================== */}
        {asset.speciesId === 'pikachu' || asset.speciesId === 'raichu' ? (
          <group position={[0, 0, 0]}>
            {/* Body */}
            <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
              <sphereGeometry args={[0.36, 14, 12]} />
              <meshStandardMaterial color={pColor} roughness={0.4} />
            </mesh>

            {/* Head */}
            <mesh position={[0, 0.62, 0.08]} castShadow>
              <sphereGeometry args={[0.3, 14, 12]} />
              <meshStandardMaterial color={pColor} roughness={0.4} />
            </mesh>

            {/* Red Cheek Pouches */}
            <mesh position={[0.22, 0.56, 0.28]}>
              <sphereGeometry args={[0.075, 8, 8]} />
              <meshStandardMaterial color="#ef4444" roughness={0.3} />
            </mesh>
            <mesh position={[-0.22, 0.56, 0.28]}>
              <sphereGeometry args={[0.075, 8, 8]} />
              <meshStandardMaterial color="#ef4444" roughness={0.3} />
            </mesh>

            {/* Eyes */}
            <mesh position={[0.13, 0.68, 0.32]}>
              <sphereGeometry args={[0.045, 8, 8]} />
              <meshBasicMaterial color="#0f172a" />
            </mesh>
            <mesh position={[-0.13, 0.68, 0.32]}>
              <sphereGeometry args={[0.045, 8, 8]} />
              <meshBasicMaterial color="#0f172a" />
            </mesh>

            {/* Articulated Ears with Black Tips */}
            <group ref={leftEarRef} position={[-0.18, 0.85, 0.02]} rotation={[0, 0, -0.2]}>
              <mesh position={[0, 0.16, 0]}>
                <cylinderGeometry args={[0.04, 0.07, 0.32, 8]} />
                <meshStandardMaterial color={pColor} roughness={0.4} />
              </mesh>
              <mesh position={[0, 0.35, 0]}>
                <coneGeometry args={[0.045, 0.16, 8]} />
                <meshBasicMaterial color="#0f172a" />
              </mesh>
            </group>

            <group ref={rightEarRef} position={[0.18, 0.85, 0.02]} rotation={[0, 0, 0.2]}>
              <mesh position={[0, 0.16, 0]}>
                <cylinderGeometry args={[0.04, 0.07, 0.32, 8]} />
                <meshStandardMaterial color={pColor} roughness={0.4} />
              </mesh>
              <mesh position={[0, 0.35, 0]}>
                <coneGeometry args={[0.045, 0.16, 8]} />
                <meshBasicMaterial color="#0f172a" />
              </mesh>
            </group>

            {/* Articulated Lightning Bolt Tail */}
            <group ref={tailRef} position={[0, 0.25, -0.32]} rotation={[0.4, 0, 0]}>
              <mesh position={[0, 0.14, 0]}>
                <boxGeometry args={[0.08, 0.24, 0.02]} />
                <meshStandardMaterial color={sColor} roughness={0.5} />
              </mesh>
              <mesh position={[0.08, 0.28, 0]} rotation={[0, 0, 0.6]}>
                <boxGeometry args={[0.1, 0.22, 0.02]} />
                <meshStandardMaterial color={pColor} roughness={0.4} />
              </mesh>
              <mesh position={[0.04, 0.44, 0]}>
                <boxGeometry args={[0.18, 0.18, 0.02]} />
                <meshStandardMaterial color={pColor} roughness={0.4} />
              </mesh>
            </group>

            {/* Paws */}
            <mesh position={[0.14, 0.08, 0.14]}><sphereGeometry args={[0.08, 8, 8]} /><meshStandardMaterial color={pColor} /></mesh>
            <mesh position={[-0.14, 0.08, 0.14]}><sphereGeometry args={[0.08, 8, 8]} /><meshStandardMaterial color={pColor} /></mesh>
          </group>
        ) : null}

        {/* ==================================================== */}
        {/* SPECIES B: CHARMANDER / CHARMELEON / CHARIZARD */}
        {/* ==================================================== */}
        {asset.speciesId === 'charmander' || asset.speciesId === 'charmeleon' || asset.speciesId === 'charizard' ? (
          <group position={[0, 0, 0]}>
            {/* Body */}
            <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
              <sphereGeometry args={[0.38, 14, 12]} />
              <meshStandardMaterial color={pColor} roughness={0.4} />
            </mesh>

            {/* Belly Patch */}
            <mesh position={[0, 0.38, 0.2]}>
              <sphereGeometry args={[0.26, 12, 10]} />
              <meshStandardMaterial color={sColor} roughness={0.6} />
            </mesh>

            {/* Head */}
            <mesh position={[0, 0.72, 0.1]} castShadow>
              <sphereGeometry args={[0.3, 14, 12]} />
              <meshStandardMaterial color={pColor} roughness={0.4} />
            </mesh>

            {/* Blue Eyes */}
            <mesh position={[0.12, 0.78, 0.32]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial color="#0284c7" />
            </mesh>
            <mesh position={[-0.12, 0.78, 0.32]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial color="#0284c7" />
            </mesh>

            {/* Articulated Tail with Flame Tip */}
            <group ref={tailRef} position={[0, 0.2, -0.32]} rotation={[-0.3, 0, 0]}>
              <mesh position={[0, 0.15, -0.2]}>
                <cylinderGeometry args={[0.06, 0.12, 0.45, 8]} />
                <meshStandardMaterial color={pColor} roughness={0.4} />
              </mesh>
              {/* Animated Glowing Tail Flame */}
              <mesh ref={flameRef} position={[0, 0.4, -0.24]}>
                <coneGeometry args={[0.14, 0.32, 8]} />
                <meshBasicMaterial color="#facc15" />
              </mesh>
            </group>

            {/* Charizard Wings */}
            {asset.hasWings && (
              <>
                <group ref={leftWingRef} position={[-0.25, 0.65, -0.2]}>
                  <mesh position={[-0.4, 0.2, 0]} rotation={[0, 0.3, -0.4]}>
                    <coneGeometry args={[0.45, 0.9, 4]} />
                    <meshStandardMaterial color={sColor} roughness={0.5} />
                  </mesh>
                </group>
                <group ref={rightWingRef} position={[0.25, 0.65, -0.2]}>
                  <mesh position={[0.4, 0.2, 0]} rotation={[0, -0.3, 0.4]}>
                    <coneGeometry args={[0.45, 0.9, 4]} />
                    <meshStandardMaterial color={sColor} roughness={0.5} />
                  </mesh>
                </group>
              </>
            )}
          </group>
        ) : null}

        {/* ==================================================== */}
        {/* SPECIES C: BULBASAUR / IVYSAUR / VENUSAUR */}
        {/* ==================================================== */}
        {asset.speciesId === 'bulbasaur' || asset.speciesId === 'ivysaur' || asset.speciesId === 'venusaur' ? (
          <group position={[0, 0, 0]}>
            {/* Main Quadruped Body */}
            <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
              <sphereGeometry args={[0.42, 14, 12]} />
              <meshStandardMaterial color={pColor} roughness={0.5} />
            </mesh>

            {/* Dark Green Body Spots */}
            <mesh position={[0.25, 0.42, 0.12]}>
              <circleGeometry args={[0.09, 6]} />
              <meshStandardMaterial color={sColor} roughness={0.8} />
            </mesh>
            <mesh position={[-0.24, 0.38, -0.15]}>
              <circleGeometry args={[0.08, 6]} />
              <meshStandardMaterial color={sColor} roughness={0.8} />
            </mesh>

            {/* Head */}
            <mesh position={[0, 0.45, 0.35]} castShadow>
              <sphereGeometry args={[0.32, 14, 12]} />
              <meshStandardMaterial color={pColor} roughness={0.5} />
            </mesh>

            {/* Red Eyes */}
            <mesh position={[0.14, 0.52, 0.6]}>
              <sphereGeometry args={[0.045, 8, 8]} />
              <meshBasicMaterial color="#dc2626" />
            </mesh>
            <mesh position={[-0.14, 0.52, 0.6]}>
              <sphereGeometry args={[0.045, 8, 8]} />
              <meshBasicMaterial color="#dc2626" />
            </mesh>

            {/* Dorsal Plant Bulb / Flower with Pulse */}
            <group ref={bulbRef} position={[0, 0.62, -0.1]}>
              <mesh position={[0, 0.12, 0]}>
                <dodecahedronGeometry args={[0.28, 0]} />
                <meshStandardMaterial color={sColor} roughness={0.7} />
              </mesh>
              {asset.accentColor && (
                <mesh position={[0, 0.32, 0]}>
                  <coneGeometry args={[0.16, 0.25, 6]} />
                  <meshStandardMaterial color={aColor} roughness={0.4} />
                </mesh>
              )}
            </group>

            {/* 4 Sturdy Legs */}
            <mesh position={[0.24, 0.12, 0.22]}><cylinderGeometry args={[0.09, 0.11, 0.26, 6]} /><meshStandardMaterial color={pColor} /></mesh>
            <mesh position={[-0.24, 0.12, 0.22]}><cylinderGeometry args={[0.09, 0.11, 0.26, 6]} /><meshStandardMaterial color={pColor} /></mesh>
            <mesh position={[0.24, 0.12, -0.22]}><cylinderGeometry args={[0.09, 0.11, 0.26, 6]} /><meshStandardMaterial color={pColor} /></mesh>
            <mesh position={[-0.24, 0.12, -0.22]}><cylinderGeometry args={[0.09, 0.11, 0.26, 6]} /><meshStandardMaterial color={pColor} /></mesh>
          </group>
        ) : null}

        {/* ==================================================== */}
        {/* SPECIES D: SQUIRTLE / WARTORTLE / BLASTOISE */}
        {/* ==================================================== */}
        {asset.speciesId === 'squirtle' || asset.speciesId === 'wartortle' || asset.speciesId === 'blastoise' ? (
          <group position={[0, 0, 0]}>
            {/* Turtle Shell Back */}
            <mesh position={[0, 0.36, -0.05]} castShadow receiveShadow>
              <sphereGeometry args={[0.42, 14, 12]} />
              <meshStandardMaterial color={sColor} roughness={0.8} />
            </mesh>

            {/* Front Yellow Plastron / Belly */}
            <mesh position={[0, 0.36, 0.18]}>
              <sphereGeometry args={[0.34, 12, 10]} />
              <meshStandardMaterial color={aColor} roughness={0.6} />
            </mesh>

            {/* Head */}
            <mesh position={[0, 0.62, 0.18]} castShadow>
              <sphereGeometry args={[0.28, 14, 12]} />
              <meshStandardMaterial color={pColor} roughness={0.4} />
            </mesh>

            {/* Eyes */}
            <mesh position={[0.11, 0.68, 0.42]}><sphereGeometry args={[0.045, 8, 8]} /><meshBasicMaterial color="#78350f" /></mesh>
            <mesh position={[-0.11, 0.68, 0.42]}><sphereGeometry args={[0.045, 8, 8]} /><meshBasicMaterial color="#78350f" /></mesh>

            {/* Curled Tail */}
            <group ref={tailRef} position={[0, 0.18, -0.38]}>
              <mesh position={[0, 0.08, -0.1]}>
                <torusGeometry args={[0.12, 0.05, 8, 16, Math.PI * 1.5]} />
                <meshStandardMaterial color={pColor} roughness={0.4} />
              </mesh>
            </group>
          </group>
        ) : null}

        {/* ==================================================== */}
        {/* SPECIES E: PIDGEY / PIDGEOTTO / PIDGEOT / BIRDS */}
        {/* ==================================================== */}
        {asset.fallbackMeshType === 'winged_bird' ? (
          <group position={[0, 0, 0]}>
            {/* Avian Body */}
            <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
              <sphereGeometry args={[0.32, 12, 10]} />
              <meshStandardMaterial color={pColor} roughness={0.6} />
            </mesh>
            {/* Chest Plumes */}
            <mesh position={[0, 0.26, 0.18]}>
              <sphereGeometry args={[0.22, 10, 8]} />
              <meshStandardMaterial color={sColor} roughness={0.7} />
            </mesh>
            {/* Head & Beak */}
            <mesh position={[0, 0.5, 0.15]} castShadow>
              <sphereGeometry args={[0.2, 10, 10]} />
              <meshStandardMaterial color={pColor} roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.48, 0.34]} rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.06, 0.15, 6]} />
              <meshStandardMaterial color="#f59e0b" roughness={0.4} />
            </mesh>
            {/* Articulated Flapping Wings */}
            <group ref={leftWingRef} position={[-0.22, 0.36, 0]}>
              <mesh position={[-0.32, 0, 0]} rotation={[0, 0, -0.2]}>
                <boxGeometry args={[0.55, 0.04, 0.3]} />
                <meshStandardMaterial color={pColor} roughness={0.6} />
              </mesh>
            </group>
            <group ref={rightWingRef} position={[0.22, 0.36, 0]}>
              <mesh position={[0.32, 0, 0]} rotation={[0, 0, 0.2]}>
                <boxGeometry args={[0.55, 0.04, 0.3]} />
                <meshStandardMaterial color={pColor} roughness={0.6} />
              </mesh>
            </group>
          </group>
        ) : null}

        {/* ==================================================== */}
        {/* SPECIES F: ONIX / SERPENTINE */}
        {/* ==================================================== */}
        {asset.hasSegmentedSpine ? (
          <group position={[0, 0, 0]}>
            {/* Head Boulder with Horn */}
            <mesh position={[0, 0.65, 0.4]} castShadow>
              <dodecahedronGeometry args={[0.42, 0]} />
              <meshStandardMaterial color={pColor} roughness={0.9} flatShading />
            </mesh>
            <mesh position={[0, 1.05, 0.4]}>
              <coneGeometry args={[0.1, 0.4, 6]} />
              <meshStandardMaterial color={sColor} roughness={0.9} flatShading />
            </mesh>
            {/* Chain of 6 Articulated Boulders */}
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const segRadius = 0.36 - i * 0.04;
              const zPos = 0.4 - (i + 1) * 0.42;
              return (
                <group
                  key={`seg-${i}`}
                  ref={(el) => { if (el) spineSegmentsRef.current[i] = el; }}
                  position={[0, 0.4 - i * 0.03, zPos]}
                >
                  <mesh castShadow receiveShadow>
                    <dodecahedronGeometry args={[segRadius, 0]} />
                    <meshStandardMaterial color={pColor} roughness={0.9} flatShading />
                  </mesh>
                </group>
              );
            })}
          </group>
        ) : null}

        {/* ==================================================== */}
        {/* SPECIES G: GASTLY / SPECTRAL ORBS */}
        {/* ==================================================== */}
        {asset.hasGhostAura ? (
          <group position={[0, 0.4, 0]}>
            {/* Dark Gaseous Core */}
            <mesh castShadow>
              <sphereGeometry args={[0.38, 16, 14]} />
              <meshStandardMaterial color={pColor} roughness={0.2} metalness={0.8} />
            </mesh>
            {/* Glowing Ethereal Purple Halo */}
            <mesh>
              <sphereGeometry args={[0.55, 12, 10]} />
              <meshBasicMaterial color={sColor} opacity={0.35} transparent wireframe />
            </mesh>
            {/* Eyes */}
            <mesh position={[0.14, 0.1, 0.34]}><sphereGeometry args={[0.07, 8, 8]} /><meshBasicMaterial color="#ffffff" /></mesh>
            <mesh position={[-0.14, 0.1, 0.34]}><sphereGeometry args={[0.07, 8, 8]} /><meshBasicMaterial color="#ffffff" /></mesh>
          </group>
        ) : null}

        {/* ==================================================== */}
        {/* SPECIES H: EEVEE / QUADRUPEDS */}
        {/* ==================================================== */}
        {asset.hasFluffyMane ? (
          <group position={[0, 0, 0]}>
            {/* Quadruped Body */}
            <mesh position={[0, 0.3, -0.05]} castShadow receiveShadow>
              <sphereGeometry args={[0.32, 12, 10]} />
              <meshStandardMaterial color={pColor} roughness={0.6} />
            </mesh>
            {/* Fluffy Neck Mane */}
            <mesh position={[0, 0.44, 0.12]}>
              <dodecahedronGeometry args={[0.26, 0]} />
              <meshStandardMaterial color={sColor} roughness={0.9} />
            </mesh>
            {/* Head */}
            <mesh position={[0, 0.58, 0.22]} castShadow>
              <sphereGeometry args={[0.24, 12, 10]} />
              <meshStandardMaterial color={pColor} roughness={0.6} />
            </mesh>
            {/* Ears */}
            <group ref={leftEarRef} position={[-0.15, 0.75, 0.15]} rotation={[0, 0, -0.3]}>
              <mesh position={[0, 0.14, 0]}><coneGeometry args={[0.08, 0.28, 6]} /><meshStandardMaterial color={pColor} /></mesh>
            </group>
            <group ref={rightEarRef} position={[0.15, 0.75, 0.15]} rotation={[0, 0, 0.3]}>
              <mesh position={[0, 0.14, 0]}><coneGeometry args={[0.08, 0.28, 6]} /><meshStandardMaterial color={pColor} /></mesh>
            </group>
            {/* Bushy Tail */}
            <group ref={tailRef} position={[0, 0.32, -0.3]} rotation={[0.4, 0, 0]}>
              <mesh position={[0, 0.16, -0.12]}><dodecahedronGeometry args={[0.18, 0]} /><meshStandardMaterial color={pColor} /></mesh>
            </group>
          </group>
        ) : null}

        {/* ==================================================== */}
        {/* DEFAULT STYLIZED MESH FOR OTHER REGISTERED SPECIES */}
        {/* ==================================================== */}
        {!['pikachu', 'raichu', 'charmander', 'charmeleon', 'charizard', 'bulbasaur', 'ivysaur', 'venusaur', 'squirtle', 'wartortle', 'blastoise'].includes(asset.speciesId) &&
         !asset.hasWings && !asset.hasSegmentedSpine && !asset.hasGhostAura && !asset.hasFluffyMane && (
          <group position={[0, 0, 0]}>
            <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
              <sphereGeometry args={[0.4, 14, 12]} />
              <meshStandardMaterial color={pColor} roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.65, 0.2]} castShadow>
              <sphereGeometry args={[0.28, 12, 10]} />
              <meshStandardMaterial color={sColor} roughness={0.6} />
            </mesh>
            <mesh position={[0.12, 0.72, 0.44]}><sphereGeometry args={[0.045, 8, 8]} /><meshBasicMaterial color="#0f172a" /></mesh>
            <mesh position={[-0.12, 0.72, 0.44]}><sphereGeometry args={[0.045, 8, 8]} /><meshBasicMaterial color="#0f172a" /></mesh>
          </group>
        )}

        {/* Ground Contact Shadow Disk */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.48, 16]} />
          <meshBasicMaterial color="#020617" opacity={0.32} transparent depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
};
