'use client';

import React from 'react';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import SceneCanvas from './SceneCanvas';
import TexturedProductMesh from './TexturedProductMesh';

function ProductScene({ imageUrl }) {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-3, 2, -2]} intensity={0.4} color="#fecdd3" />
      <Environment preset="city" />

      <TexturedProductMesh
        key={imageUrl}
        imageUrl={imageUrl}
        shape="bottle"
        autoRotate={false}
        scale={1.15}
      />

      <ContactShadows position={[0, -1.1, 0]} opacity={0.45} scale={8} blur={2} />
      <OrbitControls
        enablePan={false}
        minDistance={2.4}
        maxDistance={6}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.8}
      />
    </>
  );
}

export default function ProductViewer3D({ imageUrl, className = 'w-full h-full min-h-[280px]' }) {
  if (!imageUrl) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-gradient-to-tr from-pink-100/50 to-rose-200/50 rounded-[2rem] border border-pink-100 text-rose-900/40 text-xs font-bold uppercase tracking-widest`}
      >
        No image for 3D preview
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <SceneCanvas className="w-full h-full rounded-[2rem] overflow-hidden">
        <ProductScene imageUrl={imageUrl} />
      </SceneCanvas>
      <p className="absolute bottom-3 left-0 right-0 text-center text-[9px] font-bold uppercase tracking-widest text-rose-900/40 pointer-events-none">
        Drag to rotate
      </p>
    </div>
  );
}
