import React from 'react';

export const Props: React.FC = () => {
  return (
    <group>
      {/* Wooden Signpost near spawn */}
      <group position={[1.5, 0, 2]} rotation={[0, -0.4, 0]}>
        {/* Post */}
        <mesh position={[0, 0.7, 0]} castShadow>
          <boxGeometry args={[0.15, 1.4, 0.15]} />
          <meshStandardMaterial color="#8d5b4c" roughness={0.9} />
        </mesh>
        {/* Arrow Planks */}
        <mesh position={[0.2, 1.1, 0.05]} rotation={[0, 0, 0.05]} castShadow>
          <boxGeometry args={[0.7, 0.22, 0.06]} />
          <meshStandardMaterial color="#b08968" roughness={0.8} />
        </mesh>
        <mesh position={[-0.2, 0.8, -0.05]} rotation={[0, 0, -0.05]} castShadow>
          <boxGeometry args={[0.65, 0.2, 0.06]} />
          <meshStandardMaterial color="#b08968" roughness={0.8} />
        </mesh>
      </group>

      {/* Wooden Fence segment near cliff / pond */}
      <group position={[14, 0, -5]} rotation={[0, 0.3, 0]}>
        {/* Posts */}
        <mesh position={[-2, 0.5, 0]} castShadow><boxGeometry args={[0.14, 1.0, 0.14]} /><meshStandardMaterial color="#7f4f24" /></mesh>
        <mesh position={[0, 0.5, 0]} castShadow><boxGeometry args={[0.14, 1.0, 0.14]} /><meshStandardMaterial color="#7f4f24" /></mesh>
        <mesh position={[2, 0.5, 0]} castShadow><boxGeometry args={[0.14, 1.0, 0.14]} /><meshStandardMaterial color="#7f4f24" /></mesh>
        {/* Rails */}
        <mesh position={[0, 0.7, 0]} castShadow><boxGeometry args={[4.2, 0.1, 0.08]} /><meshStandardMaterial color="#936639" /></mesh>
        <mesh position={[0, 0.35, 0]} castShadow><boxGeometry args={[4.2, 0.1, 0.08]} /><meshStandardMaterial color="#936639" /></mesh>
      </group>

      {/* Ancient Realm Crystal Marker */}
      <group position={[-6, 0, -4]}>
        {/* Stone Pedestal */}
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.6, 0.8, 0.6, 6]} />
          <meshStandardMaterial color="#555b6e" roughness={0.9} flatShading />
        </mesh>
        {/* Floating Floating Crystal */}
        <mesh position={[0, 1.1, 0]} rotation={[0.4, 0.6, 0.2]} castShadow>
          <octahedronGeometry args={[0.35, 0]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={0.8}
            roughness={0.2}
            metalness={0.4}
            flatShading
          />
        </mesh>
      </group>
    </group>
  );
};
