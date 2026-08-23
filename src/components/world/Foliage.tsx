/**
 * Pokémon 3D RPG — Stylized World Foliage, Flora & Ecological Props
 * 
 * Renders low-poly conifer and oak trees, flowering bushes, wild tall grass clumps,
 * glowing fantasy cavern mushrooms, and faceted rock boulders aligned with colliders.
 */

import React from 'react';
import { WORLD_CONFIG } from '../../data/biomes';

// Low-poly Stylized Tree Component
const StylizedTree: React.FC<{
  position: [number, number, number];
  scale?: number;
  type?: 'oak' | 'pine';
  color?: string;
}> = ({ position, scale = 1, type = 'pine', color = '#2d6a4f' }) => {
  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.42, 2.4, 6]} />
        <meshStandardMaterial color="#5c3d2e" roughness={0.92} flatShading />
      </mesh>

      {type === 'pine' ? (
        <>
          {/* Layered Conical Pine Needles */}
          <mesh position={[0, 2.5, 0]} castShadow>
            <coneGeometry args={[1.65, 2.1, 7]} />
            <meshStandardMaterial color={color} roughness={0.82} flatShading />
          </mesh>
          <mesh position={[0, 3.8, 0]} castShadow>
            <coneGeometry args={[1.25, 1.9, 7]} />
            <meshStandardMaterial color={color} roughness={0.82} flatShading />
          </mesh>
          <mesh position={[0, 4.9, 0]} castShadow>
            <coneGeometry args={[0.75, 1.5, 7]} />
            <meshStandardMaterial color={color} roughness={0.82} flatShading />
          </mesh>
        </>
      ) : (
        <>
          {/* Multi-tier Oak Canopy Spheres */}
          <mesh position={[0, 2.9, 0]} castShadow>
            <dodecahedronGeometry args={[1.55, 0]} />
            <meshStandardMaterial color={color} roughness={0.8} flatShading />
          </mesh>
          <mesh position={[0.55, 3.5, 0.35]} castShadow>
            <dodecahedronGeometry args={[1.15, 0]} />
            <meshStandardMaterial color="#40916c" roughness={0.8} flatShading />
          </mesh>
          <mesh position={[-0.45, 3.3, -0.45]} castShadow>
            <dodecahedronGeometry args={[1.05, 0]} />
            <meshStandardMaterial color="#52b788" roughness={0.8} flatShading />
          </mesh>
        </>
      )}
    </group>
  );
};

// Faceted Low-Poly Rock Boulder
const StylizedRock: React.FC<{
  position: [number, number, number];
  scale?: [number, number, number] | number;
  rotation?: [number, number, number];
  color?: string;
}> = ({ position, scale = 1, rotation = [0, 0, 0], color = '#6c757d' }) => {
  return (
    <mesh position={position} scale={scale} rotation={rotation} castShadow receiveShadow>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={color} roughness={0.92} metalness={0.08} flatShading />
    </mesh>
  );
};

export const Foliage: React.FC = () => {
  const treeObstacles = WORLD_CONFIG.obstacles.filter((o) => o.type === 'tree');
  const rockObstacles = WORLD_CONFIG.obstacles.filter((o) => o.type === 'rock');

  return (
    <group>
      {/* Placed Forest Trees matching colliders */}
      {treeObstacles.map((tree, i) => (
        <StylizedTree
          key={`tree-${i}`}
          position={[tree.x, 0, tree.z]}
          scale={i % 2 === 0 ? 1.05 : 1.3}
          type={i % 3 === 0 ? 'oak' : 'pine'}
          color={i % 2 === 0 ? '#2d6a4f' : '#1b4332'}
        />
      ))}

      {/* Decorative Perimeter Border Trees */}
      <StylizedTree position={[-23, 0, -21]} scale={1.45} type="pine" />
      <StylizedTree position={[-21, 0, 23]} scale={1.35} type="oak" />
      <StylizedTree position={[23, 0, -19]} scale={1.55} type="pine" />
      <StylizedTree position={[22, 0, 22]} scale={1.25} type="oak" />
      <StylizedTree position={[0, 0, 25]} scale={1.45} type="pine" />

      {/* Placed Boulders matching colliders */}
      {rockObstacles.map((rock, i) => (
        <StylizedRock
          key={`rock-${i}`}
          position={[rock.x, rock.radius * 0.45, rock.z]}
          scale={[rock.radius * 1.15, rock.radius * 0.95, rock.radius * 1.05]}
          rotation={[0.35 * i, 0.75 * i, 0.25 * i]}
          color={i % 2 === 0 ? '#6c757d' : '#495057'}
        />
      ))}

      {/* Blooming Wildflowers Clumps */}
      <group position={[-3, 0.05, 4]}>
        <mesh position={[0, 0.12, 0]}><cylinderGeometry args={[0.08, 0.08, 0.24, 5]} /><meshStandardMaterial color="#f43f5e" /></mesh>
        <mesh position={[0.4, 0.14, 0.2]}><cylinderGeometry args={[0.09, 0.09, 0.28, 5]} /><meshStandardMaterial color="#facc15" /></mesh>
        <mesh position={[-0.3, 0.09, -0.3]}><cylinderGeometry args={[0.07, 0.07, 0.2, 5]} /><meshStandardMaterial color="#a855f7" /></mesh>
      </group>

      <group position={[6, 0.05, 7]}>
        <mesh position={[0, 0.12, 0]}><cylinderGeometry args={[0.08, 0.08, 0.24, 5]} /><meshStandardMaterial color="#38bdf8" /></mesh>
        <mesh position={[0.3, 0.16, -0.2]}><cylinderGeometry args={[0.09, 0.09, 0.32, 5]} /><meshStandardMaterial color="#818cf8" /></mesh>
      </group>

      {/* Glowing Cavern Crystals / Mushrooms */}
      <group position={[-16, 0, 12]}>
        <mesh position={[0, 0.4, 0]}>
          <coneGeometry args={[0.22, 0.8, 5]} />
          <meshStandardMaterial color="#a855f7" emissive="#9333ea" emissiveIntensity={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0.3, 0.25, 0.2]} rotation={[0.2, 0, 0.3]}>
          <coneGeometry args={[0.16, 0.5, 5]} />
          <meshStandardMaterial color="#c084fc" emissive="#7e22ce" emissiveIntensity={0.6} roughness={0.2} />
        </mesh>
      </group>

      <group position={[-11, 0, -9]}>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.06, 0.09, 0.4, 6]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[0, 0.46, 0]}>
          <coneGeometry args={[0.28, 0.22, 8]} />
          <meshStandardMaterial color="#c084fc" emissive="#9333ea" emissiveIntensity={0.7} />
        </mesh>
      </group>
    </group>
  );
};
