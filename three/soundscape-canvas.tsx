"use client";

import { Bloom, EffectComposer, Noise } from "@react-three/postprocessing";
import { Float, Line, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { memo, useMemo, useRef } from "react";
import * as THREE from "three";

import { useSoundscapeStore } from "@/lib/soundscape-store";

function PulseOrb({ colors }: { colors: string[] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const color = useMemo(() => new THREE.Color(colors[0] ?? "#38BDF8"), [colors]);

  useFrame((state, delta) => {
    const metrics = useSoundscapeStore.getState().metrics;
    const scale = 1 + metrics.energy * 1.6;

    if (meshRef.current) {
      meshRef.current.rotation.x += delta * (0.18 + metrics.mid * 0.5);
      meshRef.current.rotation.y += delta * (0.34 + metrics.treble * 0.8);
      meshRef.current.scale.lerp(
        new THREE.Vector3(scale, scale, scale),
        0.1,
      );
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.7) * (0.18 + metrics.mid * 0.4);
    }

    if (materialRef.current) {
      color.set(colors[0] ?? "#38BDF8");
      materialRef.current.color.lerp(color, 0.08);
      materialRef.current.emissive.lerp(color, 0.08);
      materialRef.current.emissiveIntensity = 0.6 + metrics.energy * 1.8;
      materialRef.current.roughness = Math.max(0.2, 0.8 - metrics.treble * 0.55);
    }
  });

  return (
    <Float speed={2.4} rotationIntensity={1.2} floatIntensity={2.2}>
      <mesh ref={meshRef} position={[0, 0.55, 0]}>
        <icosahedronGeometry args={[0.95, 5]} />
        <meshStandardMaterial ref={materialRef} emissive={color} color={color} metalness={0.18} />
      </mesh>
    </Float>
  );
}

function WaveField({ colors }: { colors: string[] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => new THREE.PlaneGeometry(18, 18, 60, 60), []);
  const color = useMemo(() => new THREE.Color(colors[1] ?? "#A855F7"), [colors]);

  useFrame((state) => {
    const metrics = useSoundscapeStore.getState().metrics;
    const positions = geometry.attributes.position;
    const elapsed = state.clock.elapsedTime;

    for (let index = 0; index < positions.count; index += 1) {
      const x = positions.getX(index);
      const y = positions.getY(index);
      const waveA = Math.sin(x * 0.8 + elapsed * (1.3 + metrics.mid * 3.2));
      const waveB = Math.cos(y * 1.1 - elapsed * (0.9 + metrics.treble * 2.2));
      const ridge = Math.sin((x + y) * 1.3 + elapsed * 0.7);
      const z = (waveA + waveB + ridge) * (0.18 + metrics.bass * 1.9);
      positions.setZ(index, z);
    }

    positions.needsUpdate = true;
    geometry.computeVertexNormals();

    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      material.color.lerp(color.set(colors[1] ?? "#A855F7"), 0.08);
      material.emissive.lerp(color, 0.08);
      material.emissiveIntensity = 0.24 + metrics.treble * 0.6;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} rotation-x={-Math.PI / 2} position={[0, -1.4, 0]}>
      <meshStandardMaterial color={color} emissive={color} wireframe metalness={0.28} roughness={0.42} />
    </mesh>
  );
}

function ParticleField({ colors }: { colors: string[] }) {
  const pointsRef = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const buffer = new Float32Array(540 * 3);

    for (let index = 0; index < buffer.length; index += 3) {
      buffer[index] = (Math.random() - 0.5) * 16;
      buffer[index + 1] = (Math.random() - 0.5) * 9;
      buffer[index + 2] = (Math.random() - 0.5) * 12;
    }

    return buffer;
  }, []);
  const color = useMemo(() => new THREE.Color(colors[2] ?? "#E2E8F0"), [colors]);

  useFrame((state) => {
    const metrics = useSoundscapeStore.getState().metrics;

    if (!pointsRef.current) {
      return;
    }

    pointsRef.current.rotation.y += 0.0015 + metrics.mid * 0.01;
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.12;
    const material = pointsRef.current.material as THREE.PointsMaterial;
    color.set(colors[2] ?? "#E2E8F0");
    material.color.lerp(color, 0.08);
    material.size = 0.03 + metrics.treble * 0.09;
    material.opacity = 0.45 + metrics.treble * 0.4;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.05} transparent opacity={0.7} depthWrite={false} />
    </points>
  );
}

function EnergyLines({ colors }: { colors: string[] }) {
  const groupRef = useRef<THREE.Group>(null);
  const curves = useMemo(
    () =>
      [0, 1, 2].map((index) =>
        Array.from({ length: 80 }, (_, pointIndex) => {
          const angle = (pointIndex / 80) * Math.PI * 2;
          const radius = 1.8 + index * 0.45;
          return new THREE.Vector3(
            Math.cos(angle) * radius,
            Math.sin(angle * 2 + index) * 0.22,
            Math.sin(angle) * radius,
          );
        }),
      ),
    [],
  );

  useFrame((state) => {
    const metrics = useSoundscapeStore.getState().metrics;

    if (!groupRef.current) {
      return;
    }

    groupRef.current.rotation.y += 0.004 + metrics.treble * 0.025;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.28) * 0.28;
    groupRef.current.position.y = metrics.bass * 0.45;
  });

  return (
    <group ref={groupRef}>
      {curves.map((curve, index) => (
        <Line
          key={index}
          color={colors[index % colors.length] ?? "#38BDF8"}
          lineWidth={1.2 + index * 0.25}
          opacity={0.6 - index * 0.12}
          points={curve}
          transparent
        />
      ))}
    </group>
  );
}

function SceneContent({ colors }: { colors: string[] }) {
  useFrame(({ scene }) => {
    const fogColor = new THREE.Color(colors[0] ?? "#020617");
    scene.fog = new THREE.FogExp2(fogColor, 0.068);
  });

  return (
    <>
      <PerspectiveCamera makeDefault fov={48} position={[0, 2.2, 9.5]} />
      <color attach="background" args={["#020617"]} />
      <ambientLight intensity={0.35} />
      <directionalLight color={colors[0] ?? "#38BDF8"} intensity={2.6} position={[5, 6, 4]} />
      <pointLight color={colors[1] ?? "#A855F7"} intensity={28} distance={30} position={[-4, 3, 2]} />
      <pointLight color={colors[2] ?? "#E2E8F0"} intensity={16} distance={24} position={[3, -1, -3]} />
      <PulseOrb colors={colors} />
      <WaveField colors={colors} />
      <ParticleField colors={colors} />
      <EnergyLines colors={colors} />
      <OrbitControls enablePan={false} enableRotate={false} enableZoom={false} />
      <EffectComposer>
        <Bloom intensity={1.2} luminanceThreshold={0.15} luminanceSmoothing={0.85} radius={0.8} />
        <Noise opacity={0.04} />
      </EffectComposer>
    </>
  );
}

function SoundScapeCanvasComponent({
  colors,
  isActive,
}: {
  colors: string[];
  isActive: boolean;
}) {
  return (
    <div className="absolute inset-0">
      <Canvas dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }}>
        <SceneContent colors={isActive ? colors : ["#38BDF8", "#A855F7", "#E2E8F0"]} />
      </Canvas>
    </div>
  );
}

export const SoundScapeCanvas = memo(SoundScapeCanvasComponent);
