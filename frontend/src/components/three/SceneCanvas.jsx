'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';

export default function SceneCanvas({
  children,
  className = 'w-full h-full',
  camera = { position: [0, 0.15, 3.8], fov: 42 },
}) {
  return (
    <div className={className}>
      <Canvas
        camera={camera}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  );
}
