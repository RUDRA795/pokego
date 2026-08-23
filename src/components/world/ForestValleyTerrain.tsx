/**
 * Pokémon 3D RPG — High-Fidelity Forest Valley Terrain
 * 
 * Generates continuous stylized 3D terrain directly driven by `TerrainHeightmap`:
 * - 120x120m expansive valley with organic elevation, ridges, slopes, and riverbed depressions.
 * - Multi-textured vertex color blending (lush grass, forest loam, natural dirt trail, sandy riverbank, rocky crags).
 * - Receives and casts soft global shadows.
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { TerrainHeightmap } from '../../systems/world/TerrainHeightmap';

export const ForestValleyTerrain: React.FC = () => {
  const terrainGeo = useMemo(() => {
    const size = TerrainHeightmap.WORLD_SIZE; // 120
    const segments = 96; // Dense mesh for smooth organic slopes
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    const colorMeadowGrass = new THREE.Color('#40916c');
    const colorForestLoam = new THREE.Color('#1b4332');
    const colorDirtTrail = new THREE.Color('#b45309');
    const colorShoreSand = new THREE.Color('#d4a373');
    const colorRockCrag = new THREE.Color('#78716c');
    const colorCliffFace = new THREE.Color('#57534e');
    const colorCaveEntrance = new THREE.Color('#2e1065');

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Sample analytical continuous height
      const y = TerrainHeightmap.getHeight(x, z);
      pos.setY(i, y);

      // Determine surface color based on spatial properties
      const surfaceType = TerrainHeightmap.getSurfaceType(x, z);
      let vColor = colorMeadowGrass.clone();

      if (surfaceType === 'cliff') {
        vColor = colorCliffFace;
      } else if (surfaceType === 'rock') {
        vColor = colorRockCrag;
      } else if (surfaceType === 'dirt_trail') {
        vColor = colorDirtTrail;
      } else if (surfaceType === 'sand' || surfaceType === 'water_bed') {
        vColor = colorShoreSand;
      } else {
        // Deep forest vs open sunny meadow
        if (x < -10 && z < -10) {
          vColor = colorForestLoam;
        } else if (x > 20 && z < -18) {
          vColor = colorCaveEntrance;
        } else {
          // Subtle natural variation in meadow grass
          const grassNoise = Math.sin(x * 0.4) * Math.cos(z * 0.4);
          if (grassNoise > 0.3) {
            vColor.set('#52b788');
          }
        }
      }

      colors[i * 3] = vColor.r;
      colors[i * 3 + 1] = vColor.g;
      colors[i * 3 + 2] = vColor.b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    return geo;
  }, []);

  return (
    <group>
      {/* Main Continuous Forest Valley Mesh */}
      <mesh geometry={terrainGeo} receiveShadow castShadow>
        <meshStandardMaterial
          vertexColors
          roughness={0.88}
          metalness={0.04}
          flatShading
        />
      </mesh>
    </group>
  );
};
