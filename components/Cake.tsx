import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3, MeshStandardMaterial } from 'three';
import { Text, Sparkles } from '@react-three/drei';

interface CakeLayerProps {
  targetY: number;
  radius: number;
  color: string;
  delay: number;
  isActive: boolean;
  onLanded: () => void;
}

const CakeLayer: React.FC<CakeLayerProps> = ({ targetY, radius, color, delay, isActive, onLanded }) => {
  const meshRef = useRef<Mesh>(null);
  const [landed, setLanded] = useState(false);
  const [startY] = useState(10); // Start high up
  const speed = 0.15;

  useFrame((state, delta) => {
    if (!isActive || !meshRef.current) return;

    if (!landed) {
      if (meshRef.current.position.y > targetY) {
        // Simple gravity-ish fall
        meshRef.current.position.y = Math.max(targetY, meshRef.current.position.y - speed - (10 - meshRef.current.position.y) * 0.05);
      } else {
        meshRef.current.position.y = targetY;
        setLanded(true);
        onLanded();
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, isActive ? (landed ? targetY : startY) : 20, 0]}
      visible={isActive}
      receiveShadow
      castShadow
    >
      <cylinderGeometry args={[radius, radius, 1, 32]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
    </mesh>
  );
};

interface CandleProps {
  position: [number, number, number];
  visible: boolean;
  lit: boolean;
  onClick: () => void;
}

const Candle: React.FC<CandleProps> = ({ position, visible, lit, onClick }) => {
  const meshRef = useRef<Mesh>(null);
  const flameRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (lit && flameRef.current) {
      // Flicker effect
      const t = clock.getElapsedTime();
      const scale = 1 + Math.sin(t * 10) * 0.1 + Math.cos(t * 25) * 0.1;
      flameRef.current.scale.set(scale, scale, scale);
      flameRef.current.position.y = 0.6; 
    }
  });

  if (!visible) return null;

  return (
    <group position={new Vector3(...position)} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {/* Candle Body */}
      <mesh castShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 1, 16]} />
        <meshStandardMaterial color="#FFF" />
      </mesh>
      
      {/* Wick */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* Flame */}
      {lit && (
        <group>
            <mesh ref={flameRef} position={[0, 0.7, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#FFD700" emissive="#FF4500" emissiveIntensity={2} toneMapped={false} />
            </mesh>
            <pointLight position={[0, 0.8, 0]} intensity={1.5} color="#FFA500" distance={3} decay={2} />
            <Sparkles count={20} scale={1.5} size={2} speed={0.4} opacity={0.7} color="#FFF" position={[0, 1, 0]} />
        </group>
      )}
      
      {/* Interaction Hint (invisible hit box if needed, but mesh click works) */}
      {!lit && (
         <Text position={[0, 1.2, 0]} fontSize={0.3} color="#333" anchorX="center" anchorY="middle">
           Click Me!
         </Text>
      )}
    </group>
  );
};

interface CakeSceneProps {
    stackStep: number;
    onLayerLanded: (index: number) => void;
    candleLit: boolean;
    onCandleClick: () => void;
}

export const CakeScene: React.FC<CakeSceneProps> = ({ stackStep, onLayerLanded, candleLit, onCandleClick }) => {
  
  // Define layers: Bottom to Top
  // Height of each layer is 1. Center of layer 1 is 0.5.
  // Layer 1: y=0.5
  // Layer 2: y=1.5
  // Layer 3: y=2.5
  // Layer 4: y=3.5
  // Candle: y=4.5 (center of candle which is height 1)
  
  const layers = [
    { targetY: 0.5, radius: 2.5, color: "#FBCFE8" }, // Pink 100
    { targetY: 1.5, radius: 2.0, color: "#F472B6" }, // Pink 400
    { targetY: 2.5, radius: 1.5, color: "#EC4899" }, // Pink 500
    { targetY: 3.5, radius: 1.0, color: "#BE185D" }, // Pink 700
  ];

  return (
    <group position={[0, -2, 0]}>
      {layers.map((layer, index) => (
        <CakeLayer
          key={index}
          {...layer}
          delay={index * 0.5}
          isActive={stackStep >= index}
          onLanded={() => onLayerLanded(index)}
        />
      ))}
      
      <Candle 
        position={[0, 4.5, 0]} 
        visible={stackStep >= 4} 
        lit={candleLit}
        onClick={onCandleClick}
      />
      
      {/* Plate */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[4, 64]} />
        <meshStandardMaterial color="#FFF" />
      </mesh>
    </group>
  );
};