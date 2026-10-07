"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { isReducedMotion } from "@/components/animations/gsap-core";

interface SceneProps {
  progress: number; // 0 to 1 scroll progress through the section
}

function ProductMonolith({ progress }: SceneProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const coreRef = useRef<THREE.Mesh | null>(null);
  const wireRef = useRef<THREE.LineSegments | null>(null);
  const ringRef = useRef<THREE.Mesh | null>(null);

  // Smooth rotation & subtle evolution driven by scroll progress
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const reduced = isReducedMotion();

    const targetRotY = progress * Math.PI * 1.5 + (reduced ? 0 : state.clock.getElapsedTime() * 0.15);
    const targetRotX = Math.sin(progress * Math.PI) * 0.35 + 0.1;

    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotY,
      0.08
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotX,
      0.08
    );

    // Core pulsing scale as it matures into production
    if (coreRef.current) {
      const targetScale = 0.8 + progress * 0.25;
      coreRef.current.scale.setScalar(
        THREE.MathUtils.lerp(coreRef.current.scale.x, targetScale, 0.1)
      );
    }

    // Outer security perimeter rotation
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * (0.2 + progress * 0.4);
      ringRef.current.rotation.x = progress * 0.5;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* 1. Main Digital Device Chassis - Sleek matte slate */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.4, 3.4, 0.18]} />
        <meshStandardMaterial
          color="#161616"
          roughness={0.25}
          metalness={0.85}
        />
      </mesh>

      {/* 2. Glass Face Plate / Display */}
      <mesh position={[0, 0, 0.1]}>
        <planeGeometry args={[2.2, 3.2]} />
        <meshPhysicalMaterial
          color="#080808"
          roughness={0.1}
          metalness={0.1}
          transmission={0.4}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* 3. Internal Architectural Grid / Core Component */}
      <mesh ref={coreRef} position={[0, 0, 0]}>
        <boxGeometry args={[1.6, 2.4, 0.22]} />
        <meshStandardMaterial
          color="#222222"
          roughness={0.4}
          metalness={0.6}
          wireframe={progress < 0.35}
        />
      </mesh>

      {/* 4. Architectural Wireframe Cage (visible in early phases) */}
      <lineSegments ref={wireRef} scale={1.04}>
        <edgesGeometry args={[new THREE.BoxGeometry(2.4, 3.4, 0.18)]} />
        <lineBasicMaterial
          color="#F5F5F3"
          transparent
          opacity={Math.max(0.15, 0.85 - progress * 0.7)}
        />
      </lineSegments>

      {/* 5. Cryptographic Perimeter Ring (activates at stage 4-5) */}
      <mesh ref={ringRef} position={[0, 0, 0]} scale={Math.min(1, Math.max(0.01, (progress - 0.4) * 2))}>
        <ringGeometry args={[2.1, 2.14, 64]} />
        <meshBasicMaterial
          color="#E5E5E3"
          side={THREE.DoubleSide}
          transparent
          opacity={Math.min(0.6, Math.max(0, (progress - 0.45) * 1.5))}
        />
      </mesh>
    </group>
  );
}

export function ProcessEvolutionCanvas({ progress }: SceneProps) {
  return (
    <div className="w-full h-full min-h-[380px] sm:min-h-[480px] lg:min-h-[560px] relative flex items-center justify-center pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        className="w-full h-full"
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 6, 5]} intensity={1.2} color="#ffffff" />
        <directionalLight position={[-4, -3, -2]} intensity={0.4} color="#888888" />
        <pointLight position={[0, 0, 3]} intensity={0.5} color="#dddddd" />
        <ProductMonolith progress={progress} />
      </Canvas>
    </div>
  );
}
