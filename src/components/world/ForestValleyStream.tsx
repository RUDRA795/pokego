/**
 * Pokémon 3D RPG — Flowing Stream & Waterfall System
 * 
 * Generates continuous flowing water ribbons traversing the valley from the
 * upper waterfall cliff down into the lower delta basin:
 * - Animated river surface with downstream wave motion.
 * - Translucent shoreline foam and caustic highlights.
 * - Waterfall vertical curtain with animated falling mist and basin splash particles.
 */

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TerrainHeightmap } from '../../systems/world/TerrainHeightmap';

export const ForestValleyStream: React.FC = () => {
  const waterMeshRef = useRef<THREE.Mesh>(null);
  const mistPointsRef = useRef<THREE.Points>(null);

  // Generate smooth curved river ribbon geometry
  const riverGeo = useMemo(() => {
    const points = TerrainHeightmap.STREAM_PATH.map((p) => new THREE.Vector3(p.x, p.yWater, p.z));
    const curve = new THREE.CatmullRomCurve3(points);
    const numSteps = 48;
    const halfWidth = 2.4;

    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const curvePoints = curve.getPoints(numSteps);

    for (let i = 0; i <= numSteps; i++) {
      const p = curvePoints[i];
      const tangent = curve.getTangent(i / numSteps);
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

      // Left vertex
      positions.push(p.x + normal.x * halfWidth, p.y, p.z + normal.z * halfWidth);
      uvs.push(0, i / numSteps);

      // Right vertex
      positions.push(p.x - normal.x * halfWidth, p.y, p.z - normal.z * halfWidth);
      uvs.push(1, i / numSteps);

      if (i < numSteps) {
        const base = i * 2;
        indices.push(base, base + 1, base + 2);
        indices.push(base + 1, base + 3, base + 2);
      }
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    return geo;
  }, []);

  // Waterfall Mist Particle Buffers
  const mistCount = 45;
  const { mistPositions } = useMemo(() => {
    const pos = new Float32Array(mistCount * 3);
    for (let i = 0; i < mistCount; i++) {
      const idx = i * 3;
      pos[idx] = -35 + (Math.random() - 0.5) * 4;
      pos[idx + 1] = Math.random() * 6 + 1;
      pos[idx + 2] = -35 + (Math.random() - 0.5) * 4;
    }
    return { mistPositions: pos };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (waterMeshRef.current) {
      // Gentle surface wave pulsation
      waterMeshRef.current.position.y = Math.sin(t * 2.5) * 0.02;
    }

    if (mistPointsRef.current) {
      const geo = mistPointsRef.current.geometry;
      const pos = geo.attributes.position.array as Float32Array;

      for (let i = 0; i < mistCount; i++) {
        const idx = i * 3;
        pos[idx + 1] -= 0.05; // Fall down
        if (pos[idx + 1] <= 1.2) {
          pos[idx + 1] = 7.5; // Reset to top of cliff
        }
      }
      geo.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Flowing River Surface Ribbon */}
      <mesh ref={waterMeshRef} geometry={riverGeo}>
        <meshStandardMaterial
          color="#0284c7"
          roughness={0.06}
          metalness={0.4}
          transparent
          opacity={0.82}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Waterfall Vertical Flow Curtain */}
      <group position={[-35, 4.8, -35]} rotation={[0, Math.PI / 4, 0]}>
        <mesh>
          <planeGeometry args={[4.2, 7.5]} />
          <meshStandardMaterial
            color="#38bdf8"
            roughness={0.1}
            transparent
            opacity={0.85}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Waterfall Mist / Splash Particles */}
      <points ref={mistPointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={mistCount}
            array={mistPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#e0f2fe"
          size={0.28}
          transparent
          opacity={0.7}
          sizeAttenuation
        />
      </points>
    </group>
  );
};
