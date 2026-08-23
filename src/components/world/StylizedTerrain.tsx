/**
 * Pokémon 3D RPG — Stylized Multi-Biome Overworld Terrain
 * 
 * Features:
 * - Low-poly faceted island geometry with organic rolling contours and boundary cliffs.
 * - Multi-biome vertex coloration matching ecological zones:
 *   - Emerald Meadow (Center: #52b788)
 *   - Whispering Woods (North-West: #2d6a4f)
 *   - Azure Shoreline (North-East: #d4a373)
 *   - Granite Crags (East: #c2410c)
 *   - Shadow Cavern (South-West: #4c1d95)
 *   - Windswept Plateau (South-East: #0369a1)
 * - Cobblestone curved paths and rock rim borders.
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';

export const StylizedTerrain: React.FC = () => {
  const { groundGeo, pathGeo } = useMemo(() => {
    const size = 58;
    const segments = 32;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    const colorMeadow = new THREE.Color('#40916c');
    const colorForest = new THREE.Color('#1b4332');
    const colorPondShore = new THREE.Color('#d4a373');
    const colorRock = new THREE.Color('#78716c');
    const colorCave = new THREE.Color('#3b0764');
    const colorHighGround = new THREE.Color('#0369a1');

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Distance from center
      const dist = Math.sqrt(x * x + z * z);

      // 1. Elevation Profile
      let y = 0;
      if (dist > 20) {
        // Outer island boundary ridges
        const edgeFactor = (dist - 20) / 9;
        y = Math.sin(x * 0.25) * Math.cos(z * 0.25) * 1.8 + edgeFactor * 3.0;
      } else {
        // Gentle rolling terrain
        y = Math.sin(x * 0.3) * 0.22 + Math.cos(z * 0.3) * 0.22;
      }

      // Dip pond basin (centered at [8, -8])
      const dxPond = x - 8;
      const dzPond = z - (-8);
      const pondDist = Math.sqrt(dxPond * dxPond + dzPond * dzPond);
      if (pondDist < 7.5) {
        y = Math.min(y, -0.65 * (1 - pondDist / 7.5));
      }

      pos.setY(i, y);

      // 2. Vertex Biome Color Blending
      let vertexColor = colorMeadow.clone();

      if (pondDist < 8.5) {
        vertexColor = colorPondShore;
      } else if (x < -6 && z < -4) {
        vertexColor = colorForest;
      } else if (x > 8 && z > 2) {
        vertexColor = colorRock;
      } else if (x < -8 && z > 6) {
        vertexColor = colorCave;
      } else if (x > 6 && z < -10) {
        vertexColor = colorHighGround;
      }

      colors[i * 3] = vertexColor.r;
      colors[i * 3 + 1] = vertexColor.g;
      colors[i * 3 + 2] = vertexColor.b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    // Curved cobblestone path
    const path = new THREE.PlaneGeometry(3.2, 38, 6, 28);
    path.rotateX(-Math.PI / 2);
    const pathPos = path.attributes.position;
    for (let i = 0; i < pathPos.count; i++) {
      const pz = pathPos.getZ(i);
      const curveX = Math.sin(pz * 0.14) * 3.8;
      pathPos.setX(i, pathPos.getX(i) + curveX);
      pathPos.setY(i, 0.025);
    }
    path.computeVertexNormals();

    return { groundGeo: geo, pathGeo: path };
  }, []);

  return (
    <group>
      {/* Main Stylized Multi-Biome Island Mesh */}
      <mesh geometry={groundGeo} receiveShadow castShadow>
        <meshStandardMaterial
          vertexColors
          roughness={0.85}
          metalness={0.05}
          flatShading
        />
      </mesh>

      {/* Cobblestone / Dirt Path */}
      <mesh geometry={pathGeo} receiveShadow position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#d4a373"
          roughness={0.9}
          metalness={0.0}
          flatShading
        />
      </mesh>

      {/* Island Cliff Base Support */}
      <mesh position={[0, -2.5, 0]}>
        <cylinderGeometry args={[29.5, 32, 5, 32]} />
        <meshStandardMaterial color="#292524" roughness={0.95} flatShading />
      </mesh>
    </group>
  );
};
