// frontend/src/components/layout/Three.tsx
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const RotatingSphere: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
      meshRef.current.rotation.x += 0.001;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial
        color="#2563eb"
        emissive="#1e40af"
        emissiveIntensity={0.4}
        metalness={0.3}
        roughness={0.7}
      />
    </mesh>
  );
};

const ThreeBackground: React.FC = () => {
  return (
    <Canvas className="absolute inset-0 z-0">
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <RotatingSphere />
      <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
    </Canvas>
  );
};

export default ThreeBackground;
