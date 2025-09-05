import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Floating cyber particles
const CyberParticles = ({ count = 100, size = 0.02 }) => {
  const mesh = useRef<THREE.InstancedMesh>(null!);
  
  useFrame((state) => {
    if (!mesh.current) return;
    
    const time = state.clock.getElapsedTime();
    const dummy = new THREE.Object3D();
    
    for (let i = 0; i < count; i++) {
      mesh.current.getMatrixAt(i, dummy.matrix);
      dummy.position.setFromMatrixPosition(dummy.matrix);
      
      // Simple animation
      dummy.position.y += Math.sin(time * 0.5 + i) * 0.01;
      dummy.position.x += Math.cos(time * 0.5 + i) * 0.01;
      
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  // Initialize positions
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 3;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 3;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
  }

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial color="#00FFFF" emissive="#00FFFF" emissiveIntensity={2} />
    </instancedMesh>
  );
};

// Grid for cyberpunk floor
const CyberGrid = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
      <planeGeometry args={[10, 10, 10, 10]} />
      <meshStandardMaterial 
        wireframe 
        color="#00FFFF" 
        emissive="#00FFFF"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
};

// Main sphere with distortion
const CyberSphere = () => {
  const sphere = useRef<THREE.Mesh>(null!);
  
  useFrame(({ clock }) => {
    if (!sphere.current) return;
    const t = clock.getElapsedTime();
    sphere.current.rotation.x = t * 0.1;
    sphere.current.rotation.y = t * 0.15;
  });
  
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={sphere}>
        <icosahedronGeometry args={[1, 3]} />
        <MeshDistortMaterial 
          color="#FF00FF" 
          emissive="#FF00FF"
          emissiveIntensity={0.4}
          distort={0.4} 
          speed={2} 
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      <mesh scale={1.2}>
        <icosahedronGeometry args={[1, 2]} />
        <meshBasicMaterial color="#FF00FF" wireframe opacity={0.1} transparent />
      </mesh>
    </Float>
  );
};

// Scanning effect
const ScanEffect = () => {
  const plane = useRef<THREE.Mesh>(null!);
  
  useFrame(({ clock }) => {
    if (!plane.current) return;
    const t = clock.getElapsedTime();
    plane.current.position.y = (t % 4) - 2; // Scan from bottom to top every 4 seconds
  });
  
  return (
    <mesh ref={plane} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[20, 0.1]} />
      <meshBasicMaterial color="#00FFFF" opacity={0.3} transparent />
    </mesh>
  );
};

// Main Scene component
const Scene = () => {
  return (
    <Canvas 
      camera={{ position: [0, 0, 5], fov: 45 }}
      className="w-full h-full"
    >
      {/* Lights */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#FF00FF" />
      <pointLight position={[-10, 10, 10]} intensity={1} color="#00FFFF" />
      
      {/* Main elements */}
      <CyberSphere />
      <CyberParticles count={150} />
      <CyberGrid />
      <ScanEffect />
      
      {/* Controls */}
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
};

export default Scene;