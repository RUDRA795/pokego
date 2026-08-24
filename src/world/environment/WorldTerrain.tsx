/**
 * Pokémon 3D RPG — UNITE-Style Layered Lush Grass & Terrain Shading Engine
 * 
 * Features:
 * - Multi-tonal lush grass field with ambient ground decals and stone pathways.
 * - Instanced 3D grass blade clusters with wind sway and floating leaf drift particles.
 * - High-density tall grass encounter zones with interactive flattening and seed particles.
 * - Circular Pokémon Center and PokéMart plaza decals with stone paving.
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const WorldTerrain: React.FC = () => {
  const tallGrassGroupRef = useRef<THREE.Group>(null);
  const instancedGrassRef = useRef<THREE.InstancedMesh>(null);
  const floatingLeavesRef = useRef<THREE.Points>(null);

  // Instanced Grass Blades (240 individual blades across park & road verges)
  const grassCount = 240;
  const grassData = useMemo(() => {
    const data: { matrix: THREE.Matrix4; phase: number }[] = [];
    const tempObj = new THREE.Object3D();

    for (let i = 0; i < grassCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 5 + Math.random() * 38;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      // Leave main road avenues clear
      if (Math.abs(x) < 4.6 && Math.abs(z) > 4.6) continue;
      if (Math.abs(z) < 4.6 && Math.abs(x) > 4.6) continue;

      tempObj.position.set(x, 0, z);
      tempObj.rotation.set(
        (Math.random() - 0.5) * 0.25,
        Math.random() * Math.PI,
        (Math.random() - 0.5) * 0.25
      );
      const s = 0.8 + Math.random() * 0.6;
      tempObj.scale.set(s, s * (0.9 + Math.random() * 0.5), s);
      tempObj.updateMatrix();

      data.push({
        matrix: tempObj.matrix.clone(),
        phase: Math.random() * Math.PI * 2,
      });
    }
    return data;
  }, []);

  React.useEffect(() => {
    if (!instancedGrassRef.current) return;
    const mesh = instancedGrassRef.current;
    grassData.forEach((item, idx) => {
      mesh.setMatrixAt(idx, item.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [grassData]);

  // Tall Grass Thicket Clusters
  const tallGrassClusters = useMemo(() => {
    const tufts: { x: number; z: number; scale: number; rot: number }[] = [];
    const clusters = [
      { cx: 9, cz: 9, count: 28, radius: 4.8 },
      { cx: -15, cz: 9, count: 32, radius: 5.5 },
      { cx: 18, cz: -18, count: 30, radius: 5.2 },
      { cx: -14, cz: -14, count: 26, radius: 4.5 },
      { cx: 26, cz: 7, count: 34, radius: 6.5 },
      { cx: -26, cz: -20, count: 28, radius: 5.0 },
      { cx: 12, cz: 28, count: 30, radius: 5.5 },
    ];

    clusters.forEach((c) => {
      for (let i = 0; i < c.count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * c.radius;
        tufts.push({
          x: c.cx + Math.cos(angle) * r,
          z: c.cz + Math.sin(angle) * r,
          scale: 0.9 + Math.random() * 0.5,
          rot: Math.random() * Math.PI,
        });
      }
    });
    return tufts;
  }, []);

  // Floating ambient leaves positions
  const leafCount = 45;
  const leafPositions = useMemo(() => {
    const pos = new Float32Array(leafCount * 3);
    for (let i = 0; i < leafCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = 0.5 + Math.random() * 4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    return pos;
  }, []);

  // Wildflower Blooms
  const flowers = useMemo(() => {
    const list: { x: number; z: number; color: string }[] = [];
    const colors = ['#f43f5e', '#fbbf24', '#a855f7', '#38bdf8', '#ffffff', '#fb7185', '#f59e0b'];
    for (let i = 0; i < 70; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 3.5 + Math.random() * 34;
      list.push({
        x: Math.cos(angle) * dist,
        z: Math.sin(angle) * dist,
        color: colors[i % colors.length],
      });
    }
    return list;
  }, []);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();

    // Grass sway
    if (tallGrassGroupRef.current) {
      tallGrassGroupRef.current.children.forEach((child, idx) => {
        const sway = Math.sin(t * 3.6 + idx * 0.3) * 0.16;
        child.rotation.z = sway;
        child.rotation.x = Math.cos(t * 2.6 + idx * 0.2) * 0.09;
      });
    }

    // Drifting leaves
    if (floatingLeavesRef.current) {
      const posAttr = floatingLeavesRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < leafCount; i++) {
        arr[i * 3] -= delta * 1.5; // Drift West
        arr[i * 3 + 1] -= delta * 0.2; // Fall slowly
        arr[i * 3 + 2] += Math.sin(t * 2 + i) * delta * 0.8;

        if (arr[i * 3 + 1] < 0.1) {
          arr[i * 3 + 1] = 4.5;
          arr[i * 3] = 30 + Math.random() * 10;
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* 1. Base UNITE Emerald Ground Mesh */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[240, 240, 32, 32]} />
        <meshStandardMaterial color="#22c55e" roughness={0.8} metalness={0.05} />
      </mesh>

      {/* 2. Soft Park Lawns & Radial Grass Rings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} receiveShadow>
        <ringGeometry args={[12, 28, 48]} />
        <meshStandardMaterial color="#4ade80" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]} receiveShadow>
        <ringGeometry args={[36, 56, 48]} />
        <meshStandardMaterial color="#16a34a" roughness={0.9} />
      </mesh>

      {/* 3. Central Poké Ball Plaza Paved Stone Disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
        <circleGeometry args={[5.6, 48]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.5} />
      </mesh>
      {/* Red Outer Ring on Plaza */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <ringGeometry args={[5.2, 5.6, 48]} />
        <meshBasicMaterial color="#0284c7" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.007, 0]}>
        <circleGeometry args={[1.6, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
        <ringGeometry args={[0.55, 0.82, 32]} />
        <meshBasicMaterial color="#0f172a" />
      </mesh>

      {/* 4. Ambient Decals for Building Foundations */}
      {[
        { x: -15, z: -14, w: 9.5, d: 8.5 },
        { x: 15, z: -14, w: 8.5, d: 7.5 },
        { x: -16, z: 16, w: 8, d: 8 },
        { x: 16, z: 16, w: 8.5, d: 8.5 },
      ].map((decal, idx) => (
        <mesh key={idx} rotation={[-Math.PI / 2, 0, 0]} position={[decal.x, 0.004, decal.z]}>
          <planeGeometry args={[decal.w, decal.d]} />
          <meshBasicMaterial color="#0f172a" transparent opacity={0.25} />
        </mesh>
      ))}

      {/* 5. Instanced 3D Grass Blades */}
      <instancedMesh
        ref={instancedGrassRef}
        args={[undefined, undefined, grassCount]}
        castShadow
      >
        <coneGeometry args={[0.08, 0.65, 4]} />
        <meshStandardMaterial color="#15803d" roughness={0.5} />
      </instancedMesh>

      {/* 6. Interactive Tall Grass Thickets */}
      <group ref={tallGrassGroupRef}>
        {tallGrassClusters.map((tuft, idx) => (
          <group key={idx} position={[tuft.x, 0, tuft.z]} rotation={[0, tuft.rot, 0]} scale={tuft.scale}>
            {/* Center Main Blade */}
            <mesh position={[0, 0.45, 0]} rotation={[0, 0, 0.1]} castShadow>
              <coneGeometry args={[0.12, 0.9, 5]} />
              <meshStandardMaterial color="#16a34a" roughness={0.5} />
            </mesh>
            {/* Left Curved Blade */}
            <mesh position={[-0.14, 0.38, 0.07]} rotation={[0.18, 0, -0.28]} castShadow>
              <coneGeometry args={[0.09, 0.75, 5]} />
              <meshStandardMaterial color="#22c55e" roughness={0.5} />
            </mesh>
            {/* Right Curved Blade */}
            <mesh position={[0.14, 0.34, -0.07]} rotation={[-0.18, 0, 0.32]} castShadow>
              <coneGeometry args={[0.08, 0.68, 5]} />
              <meshStandardMaterial color="#15803d" roughness={0.5} />
            </mesh>
            {/* Rustling Seed Head */}
            <mesh position={[0, 0.9, 0]}>
              <sphereGeometry args={[0.07, 6, 6]} />
              <meshStandardMaterial color="#86efac" />
            </mesh>
          </group>
        ))}
      </group>

      {/* 7. Drifting Leaf Particles */}
      <points ref={floatingLeavesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[leafPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.16} color="#86efac" transparent opacity={0.65} />
      </points>

      {/* 8. Wildflower Blooms */}
      {flowers.map((f, idx) => (
        <group key={idx} position={[f.x, 0.05, f.z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.15, 6]} />
            <meshBasicMaterial color={f.color} />
          </mesh>
          <mesh position={[0, 0.01, 0]}>
            <sphereGeometry args={[0.05, 6, 6]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
        </group>
      ))}

      {/* 9. Distant Horizon Hills for Environmental Depth */}
      <group position={[0, -2, 0]}>
        <mesh position={[0, 9, -105]} castShadow>
          <sphereGeometry args={[65, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#16a34a" roughness={0.9} />
        </mesh>
        <mesh position={[-100, 8, 0]} castShadow>
          <sphereGeometry args={[60, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#15803d" roughness={0.9} />
        </mesh>
        <mesh position={[100, 8, 10]} castShadow>
          <sphereGeometry args={[62, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#16a34a" roughness={0.9} />
        </mesh>
        <mesh position={[0, 10, 110]} castShadow>
          <sphereGeometry args={[68, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#14532d" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
};
