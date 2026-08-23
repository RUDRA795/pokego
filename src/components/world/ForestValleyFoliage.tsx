/**
 * Pokémon 3D RPG — Organic Forest Valley Flora & Ecological Foliage
 * 
 * Features:
 * - Multi-tier oak and conifer pine trees positioned onto `TerrainHeightmap` elevation.
 * - Instanced grass clumps with synchronized vertex wind sway.
 * - Fallen hollow logs, mossy boulders, flowering shrubs, and glowing cavern crystals.
 * - Dense natural clustering around stream and forest edge, sparse in the central clearing.
 */

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TerrainHeightmap } from '../../systems/world/TerrainHeightmap';

// Organic Stylized Tree
const OrganicTree: React.FC<{
  x: number;
  z: number;
  scale?: number;
  type?: 'oak' | 'pine';
  color?: string;
}> = ({ x, z, scale = 1.0, type = 'oak', color = '#2d6a4f' }) => {
  const y = TerrainHeightmap.getHeight(x, z);

  return (
    <group position={[x, y, z]} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.45, 2.4, 6]} />
        <meshStandardMaterial color="#451a03" roughness={0.92} flatShading />
      </mesh>

      {type === 'oak' ? (
        <>
          {/* Canopy Spheres */}
          <mesh position={[0, 2.8, 0]} castShadow>
            <dodecahedronGeometry args={[1.5, 0]} />
            <meshStandardMaterial color={color} roughness={0.8} flatShading />
          </mesh>
          <mesh position={[0.5, 3.4, 0.3]} castShadow>
            <dodecahedronGeometry args={[1.1, 0]} />
            <meshStandardMaterial color="#40916c" roughness={0.8} flatShading />
          </mesh>
          <mesh position={[-0.4, 3.2, -0.4]} castShadow>
            <dodecahedronGeometry args={[1.0, 0]} />
            <meshStandardMaterial color="#52b788" roughness={0.8} flatShading />
          </mesh>
        </>
      ) : (
        <>
          {/* Layered Conical Pine Tiers */}
          <mesh position={[0, 2.4, 0]} castShadow>
            <coneGeometry args={[1.6, 2.0, 6]} />
            <meshStandardMaterial color={color} roughness={0.85} flatShading />
          </mesh>
          <mesh position={[0, 3.6, 0]} castShadow>
            <coneGeometry args={[1.2, 1.8, 6]} />
            <meshStandardMaterial color={color} roughness={0.85} flatShading />
          </mesh>
          <mesh position={[0, 4.7, 0]} castShadow>
            <coneGeometry args={[0.7, 1.4, 6]} />
            <meshStandardMaterial color={color} roughness={0.85} flatShading />
          </mesh>
        </>
      )}
    </group>
  );
};

// Mossy Boulder
const MossyBoulder: React.FC<{
  x: number;
  z: number;
  scale?: [number, number, number];
  rotation?: [number, number, number];
}> = ({ x, z, scale = [1, 1, 1], rotation = [0, 0, 0] }) => {
  const y = TerrainHeightmap.getHeight(x, z);

  return (
    <group position={[x, y + 0.3, z]} scale={scale} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#57534e" roughness={0.9} flatShading />
      </mesh>
      {/* Moss top patch */}
      <mesh position={[0, 0.5, 0]}>
        <dodecahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial color="#2d6a4f" roughness={0.95} flatShading />
      </mesh>
    </group>
  );
};

export const ForestValleyFoliage: React.FC = () => {
  const grassGroupRef = useRef<THREE.Group>(null);

  // Procedural tree locations positioned in ecological zones
  const trees = useMemo(() => {
    const list: { x: number; z: number; scale: number; type: 'oak' | 'pine'; color: string }[] = [];

    // Dense Forest Grove in North-West
    for (let i = 0; i < 22; i++) {
      const x = -12 - Math.random() * 26;
      const z = -8 - Math.random() * 26;
      list.push({
        x,
        z,
        scale: 1.0 + Math.random() * 0.6,
        type: i % 2 === 0 ? 'oak' : 'pine',
        color: i % 3 === 0 ? '#1b4332' : '#2d6a4f',
      });
    }

    // High Ridge Pines in South-West
    for (let i = 0; i < 14; i++) {
      const x = -20 - Math.random() * 18;
      const z = 16 + Math.random() * 20;
      list.push({
        x,
        z,
        scale: 1.2 + Math.random() * 0.5,
        type: 'pine',
        color: '#1b4332',
      });
    }

    // Perimeter boundary trees
    for (let angle = 0; angle < Math.PI * 2; angle += 0.35) {
      const r = 46 + Math.random() * 8;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      list.push({
        x,
        z,
        scale: 1.3 + Math.random() * 0.6,
        type: Math.random() > 0.5 ? 'pine' : 'oak',
        color: '#1b4332',
      });
    }

    return list;
  }, []);

  // Instanced Grass Clump Positions
  const grassClumps = useMemo(() => {
    const count = 40;
    const items: { x: number; z: number; y: number; scale: number }[] = [];

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 50;
      const z = (Math.random() - 0.5) * 50;
      const surface = TerrainHeightmap.getSurfaceType(x, z);

      if (surface === 'grass') {
        const y = TerrainHeightmap.getHeight(x, z);
        items.push({ x, z, y, scale: 0.8 + Math.random() * 0.5 });
      }
    }

    return items;
  }, []);

  // Animate grass sway
  useFrame(({ clock }) => {
    if (grassGroupRef.current) {
      const t = clock.getElapsedTime();
      grassGroupRef.current.children.forEach((child, idx) => {
        child.rotation.z = Math.sin(t * 2.5 + idx) * 0.12;
      });
    }
  });

  return (
    <group>
      {/* Placed Ecological Trees */}
      {trees.map((t, i) => (
        <OrganicTree key={`tree-${i}`} {...t} />
      ))}

      {/* Mossy Boulders */}
      <MossyBoulder x={8} z={6} scale={[1.8, 1.2, 1.5]} rotation={[0.2, 0.5, 0]} />
      <MossyBoulder x={-14} z={4} scale={[2.2, 1.5, 1.8]} rotation={[0.1, 1.2, 0.3]} />
      <MossyBoulder x={18} z={-16} scale={[2.5, 2.0, 2.2]} rotation={[0.4, 0.8, 0.1]} />
      <MossyBoulder x={-6} z={-18} scale={[1.5, 1.1, 1.4]} />

      {/* Fallen Hollow Log in Forest */}
      <group position={[-16, TerrainHeightmap.getHeight(-16, -14) + 0.3, -14]} rotation={[0, 0.7, Math.PI / 2]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.35, 0.42, 3.8, 6]} />
          <meshStandardMaterial color="#3e2723" roughness={0.95} flatShading />
        </mesh>
      </group>

      {/* Glowing Cavern Crystals near Cave Entrance */}
      <group position={[32, TerrainHeightmap.getHeight(32, -28), -28]}>
        <mesh position={[0, 0.6, 0]}>
          <coneGeometry args={[0.3, 1.2, 5]} />
          <meshStandardMaterial color="#c084fc" emissive="#9333ea" emissiveIntensity={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.4, 0.4, 0.3]} rotation={[0.2, 0, 0.3]}>
          <coneGeometry args={[0.2, 0.8, 5]} />
          <meshStandardMaterial color="#a855f7" emissive="#7e22ce" emissiveIntensity={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Swaying Grass Clumps */}
      <group ref={grassGroupRef}>
        {grassClumps.map((g, i) => (
          <group key={`grass-${i}`} position={[g.x, g.y, g.z]} scale={g.scale}>
            <mesh position={[0, 0.25, 0]}>
              <coneGeometry args={[0.18, 0.5, 4]} />
              <meshStandardMaterial color="#52b788" roughness={0.7} />
            </mesh>
            <mesh position={[0.1, 0.2, 0.05]} rotation={[0, 0, 0.2]}>
              <coneGeometry args={[0.14, 0.4, 4]} />
              <meshStandardMaterial color="#40916c" roughness={0.7} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};
