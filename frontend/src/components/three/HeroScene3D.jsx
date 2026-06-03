'use client';

import React from 'react';
import { Float, Environment, ContactShadows, Sparkles as DreiSparkles } from '@react-three/drei';
import SceneCanvas from './SceneCanvas';
import TexturedProductMesh from './TexturedProductMesh';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800';

const SIDE_IMAGE =
  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600';

function HeroSceneContent() {
  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[5, 8, 5]} intensity={1.15} castShadow />
      <directionalLight position={[-4, 2, -3]} intensity={0.35} color="#fda4af" />
      <Environment preset="studio" />

      <DreiSparkles count={40} scale={4} size={2} speed={0.35} opacity={0.45} color="#fb7185" />

      <Float speed={1.8} rotationIntensity={0.25} floatIntensity={0.6}>
        <TexturedProductMesh
          imageUrl={HERO_IMAGE}
          shape="bottle"
          position={[0, 0, 0]}
          scale={1.05}
          rotationSpeed={0.28}
        />
      </Float>

      <Float speed={2.2} rotationIntensity={0.5} floatIntensity={0.9}>
        <TexturedProductMesh
          imageUrl={SIDE_IMAGE}
          shape="box"
          position={[-1.55, 0.15, -0.35]}
          scale={0.42}
          rotationSpeed={0.45}
        />
      </Float>

      <Float speed={2.5} rotationIntensity={0.45} floatIntensity={0.85}>
        <TexturedProductMesh
          imageUrl={SIDE_IMAGE}
          shape="box"
          position={[1.5, -0.1, -0.25]}
          scale={0.38}
          rotationSpeed={-0.4}
        />
      </Float>

      <ContactShadows position={[0, -1.15, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
    </>
  );
}

export default function HeroScene3D({ className = 'w-full h-[22rem] sm:h-[26rem]' }) {
  return (
    <SceneCanvas
      className={className}
      camera={{ position: [0, 0.2, 5.2], fov: 38 }}
    >
      <HeroSceneContent />
    </SceneCanvas>
  );
}
