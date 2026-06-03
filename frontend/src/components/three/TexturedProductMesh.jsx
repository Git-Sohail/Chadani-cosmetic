'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';

const materialProps = {
  roughness: 0.35,
  metalness: 0.15,
};

export default function TexturedProductMesh({
  imageUrl,
  shape = 'box',
  autoRotate = true,
  rotationSpeed = 0.35,
  ...groupProps
}) {
  const groupRef = useRef();
  const texture = useTexture(imageUrl);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group ref={groupRef} {...groupProps}>
      {shape === 'bottle' ? (
        <>
          <mesh position={[0, -0.05, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.55, 0.62, 1.35, 48]} />
            <meshStandardMaterial map={texture} {...materialProps} />
          </mesh>
          <mesh position={[0, 0.78, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.26, 0.28, 32]} />
            <meshStandardMaterial color="#f9a8d4" roughness={0.2} metalness={0.4} />
          </mesh>
          <mesh position={[0, 0.95, 0]} castShadow>
            <sphereGeometry args={[0.18, 24, 24]} />
            <meshStandardMaterial color="#881337" roughness={0.25} metalness={0.35} />
          </mesh>
        </>
      ) : (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.05, 1.45, 0.42]} />
          <meshStandardMaterial map={texture} {...materialProps} />
        </mesh>
      )}
    </group>
  );
}
