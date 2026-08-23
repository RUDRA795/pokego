/**
 * Pokémon 3D RPG — Physical Poké Ball Capture Presentation
 * 
 * Features:
 * - Parabolic throw trajectory from trainer to wild Pokémon.
 * - Energy beam absorption flash.
 * - Gravity drop & ground bounce.
 * - 3 physical tension wobbles (shake 1, shake 2, shake 3).
 * - Celebratory star sparkle burst upon success or breakout bounce.
 */

import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PokeBallCaptureVFXProps {
  onCaptureComplete?: (success: boolean) => void;
}

export const PokeBallCaptureVFX: React.FC<PokeBallCaptureVFXProps> = ({ onCaptureComplete }) => {
  const ballRef = useRef<THREE.Group>(null);
  const starsRef = useRef<THREE.Points>(null);

  const [phase, setPhase] = useState<'THROW' | 'BEAM' | 'WOBBLE_1' | 'WOBBLE_2' | 'WOBBLE_3' | 'SUCCESS'>('THROW');
  const progressRef = useRef(0);

  useEffect(() => {
    // Timed capture sequence
    const t1 = setTimeout(() => setPhase('BEAM'), 600);
    const t2 = setTimeout(() => setPhase('WOBBLE_1'), 1100);
    const t3 = setTimeout(() => setPhase('WOBBLE_2'), 1800);
    const t4 = setTimeout(() => setPhase('WOBBLE_3'), 2500);
    const t5 = setTimeout(() => {
      setPhase('SUCCESS');
      if (onCaptureComplete) onCaptureComplete(true);
    }, 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onCaptureComplete]);

  useFrame((_, delta) => {
    if (!ballRef.current) return;

    if (phase === 'THROW') {
      progressRef.current = Math.min(1.0, progressRef.current + delta * 1.8);
      const p = progressRef.current;
      // Parabolic throw arc
      const x = -2.5 + p * 5.0;
      const z = 1.5 - p * 3.0;
      const y = 1.0 + Math.sin(p * Math.PI) * 2.2 - p * 0.8;
      ballRef.current.position.set(x, y, z);
      ballRef.current.rotation.x += delta * 12.0;
    } else if (phase === 'BEAM') {
      ballRef.current.position.set(2.5, 0.2, -1.5);
    } else if (phase === 'WOBBLE_1') {
      ballRef.current.position.set(2.5, 0.15, -1.5);
      ballRef.current.rotation.z = Math.sin(Date.now() * 0.012) * 0.45;
    } else if (phase === 'WOBBLE_2') {
      ballRef.current.rotation.z = -Math.sin(Date.now() * 0.012) * 0.45;
    } else if (phase === 'WOBBLE_3') {
      ballRef.current.rotation.z = Math.sin(Date.now() * 0.012) * 0.45;
    } else if (phase === 'SUCCESS') {
      ballRef.current.rotation.z = 0;
      if (starsRef.current) {
        starsRef.current.rotation.y += delta * 4.0;
      }
    }
  });

  return (
    <group>
      {/* Physical 3D Poké Ball */}
      <group ref={ballRef} position={[-2.5, 1.0, 1.5]} scale={[0.32, 0.32, 0.32]}>
        {/* Top Red Half */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.5, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial color="#dc2626" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Bottom White Half */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.5, 16, 12, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Center Black Ring & Button */}
        <mesh>
          <cylinderGeometry args={[0.51, 0.51, 0.08, 16]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0, 0, 0.52]}>
          <circleGeometry args={[0.14, 12]} />
          <meshBasicMaterial color={phase === 'SUCCESS' ? '#facc15' : '#f8fafc'} />
        </mesh>
      </group>

      {/* Energy Capture Beam Flare */}
      {phase === 'BEAM' && (
        <mesh position={[2.5, 0.8, -1.5]}>
          <sphereGeometry args={[1.2, 12, 12]} />
          <meshBasicMaterial color="#ef4444" wireframe transparent opacity={0.6} />
        </mesh>
      )}

      {/* Success Stars Particle Halo */}
      {phase === 'SUCCESS' && (
        <points ref={starsRef} position={[2.5, 0.6, -1.5]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={20}
              array={new Float32Array(60).map(() => (Math.random() - 0.5) * 1.8)}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial color="#facc15" size={0.25} transparent opacity={0.9} />
        </points>
      )}
    </group>
  );
};
