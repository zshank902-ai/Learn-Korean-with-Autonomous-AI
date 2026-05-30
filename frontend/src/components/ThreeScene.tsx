"use client";

import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useKMasteryStore } from '@/store/useKMasteryStore';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

// TOPIK Roadmap Node positions (6 levels mapped to 3D space)
const LEVEL_POSITIONS: [number, number, number][] = [
  [0, 0, 0],
  [5, 2, -5],
  [10, 0, -10],
  [15, 3, -15],
  [10, 5, -25],
  [0, 8, -30],
];

const LEVEL_LABELS = [
  'TOPIK I\nLevel 1',
  'TOPIK I\nLevel 2',
  'TOPIK II\nLevel 3',
  'TOPIK II\nLevel 4',
  'TOPIK II\nLevel 5',
  'TOPIK II\nLevel 6',
];

const LEVEL_COLORS = ['#F97316', '#FBBF24', '#4F46E5', '#818CF8', '#10B981', '#EC4899'];

// 3D Roadmap Nodes built inline — no external file dependency
function TopikRoadmap3D({ currentLevel }: { currentLevel: number }) {
  return (
    <group>
      {LEVEL_POSITIONS.map((pos, i) => {
        const isCompleted = i + 1 < currentLevel;
        const isActive = i + 1 === currentLevel;
        const isLocked = i + 1 > currentLevel;

        return (
          <group key={i} position={pos}>
            {/* Node sphere */}
            <mesh>
              <sphereGeometry args={[isActive ? 1.2 : 0.8, 32, 32]} />
              <meshStandardMaterial
                color={isLocked ? '#94A3B8' : LEVEL_COLORS[i]}
                roughness={0.3}
                metalness={isActive ? 0.3 : 0.1}
                emissive={isActive ? LEVEL_COLORS[i] : '#000000'}
                emissiveIntensity={isActive ? 0.2 : 0}
              />
            </mesh>
            {/* HTML label overlay */}
            <Html
              position={[0, isActive ? 2 : 1.5, 0]}
              center
              style={{ pointerEvents: 'none', whiteSpace: 'pre-line', textAlign: 'center' }}
            >
              <div style={{
                background: isActive ? LEVEL_COLORS[i] : 'rgba(255,255,255,0.85)',
                color: isActive ? 'white' : '#1E1B4B',
                padding: '4px 10px',
                borderRadius: '12px',
                border: '2px solid #1E1B4B',
                fontWeight: 800,
                fontSize: isActive ? '12px' : '10px',
                boxShadow: isActive ? `4px 4px 0px #1E1B4B` : '2px 2px 0px #1E1B4B',
                opacity: isLocked ? 0.5 : 1,
              }}>
                {isCompleted ? '✓ ' : ''}{LEVEL_LABELS[i].replace('\n', ' ')}
              </div>
            </Html>
            {/* Connecting line to next node */}
            {i < LEVEL_POSITIONS.length - 1 && (() => {
              const next = LEVEL_POSITIONS[i + 1];
              const start = new THREE.Vector3(...pos);
              const end = new THREE.Vector3(...next);
              const mid = start.clone().lerp(end, 0.5);
              const length = start.distanceTo(end);
              const dir = end.clone().sub(start).normalize();
              const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
              return (
                <mesh position={[mid.x, mid.y, mid.z]} quaternion={quat}>
                  <cylinderGeometry args={[0.08, 0.08, length, 8]} />
                  <meshStandardMaterial
                    color={isCompleted ? LEVEL_COLORS[i] : '#CBD5E1'}
                    roughness={0.8}
                  />
                </mesh>
              );
            })()}
          </group>
        );
      })}
    </group>
  );
}

// Camera Manager handles smooth interpolation based on Zustand state
function CameraManager() {
  const { cameraPosition3D, cameraTarget3D, level } = useKMasteryStore();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  useEffect(() => {
    const targetNode = LEVEL_POSITIONS[Math.min(level - 1, 5)];
    useKMasteryStore.getState().setCamera3D(
      [targetNode[0], targetNode[1] + 5, targetNode[2] + 12],
      [targetNode[0], targetNode[1], targetNode[2]]
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  useFrame((state) => {
    state.camera.position.lerp(new THREE.Vector3(...cameraPosition3D), 0.05);
  });

  return (
    <OrbitControls
      ref={controlsRef}
      target={new THREE.Vector3(...cameraTarget3D)}
      enablePan={false}
      maxPolarAngle={Math.PI / 2 + 0.1}
      minDistance={2}
      maxDistance={30}
    />
  );
}

// Decorative floating spheres for playful feel
function FloatingOrbs() {
  const meshRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.5;
    }
  });
  return (
    <group ref={meshRef}>
      <mesh position={[-12, 6, -5]}>
        <sphereGeometry args={[1.2, 16, 16]} />
        <meshStandardMaterial color="#F97316" roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh position={[14, 4, -8]}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial color="#818CF8" roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh position={[8, 10, -20]}>
        <sphereGeometry args={[1.0, 16, 16]} />
        <meshStandardMaterial color="#4F46E5" roughness={0.3} metalness={0.1} />
      </mesh>
    </group>
  );
}

// Flat ground plane with vibrant color
function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, -15]}>
      <planeGeometry args={[80, 80]} />
      <meshStandardMaterial color="#C7D2FE" roughness={1} />
    </mesh>
  );
}

export default function ThreeScene({ children }: { children?: React.ReactNode }) {
  const { level } = useKMasteryStore();

  return (
    <div className="fixed inset-0 z-0" style={{ background: 'linear-gradient(180deg, #C7D2FE 0%, #EEF2FF 60%, #E0E7FF 100%)' }}>
      <Canvas
        camera={{ position: [0, 5, 10], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor('#C7D2FE');
        }}
      >
        {/* Bright warm lighting for claymorphism */}
        <ambientLight intensity={1.2} color="#FFF8F0" />
        <directionalLight position={[10, 20, 10]} intensity={2.0} color="#FFF0D0" castShadow />
        <pointLight position={[-8, 8, 5]} intensity={0.8} color="#F97316" />
        <pointLight position={[12, 6, -10]} intensity={0.6} color="#818CF8" />
        <hemisphereLight args={["#EEF2FF", "#C7D2FE", 0.5]} />

        <GroundPlane />
        <FloatingOrbs />
        <CameraManager />
        <TopikRoadmap3D currentLevel={level} />

        {/* Only render Html overlay if children are provided */}
        {children && (
          <Html fullscreen zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
            <div className="w-full h-full pointer-events-auto overflow-y-auto">
              {children}
            </div>
          </Html>
        )}
      </Canvas>
    </div>
  );
}
