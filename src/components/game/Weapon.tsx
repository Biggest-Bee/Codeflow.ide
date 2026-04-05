'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface WeaponStats {
  name: string;
  fireRate: number;
  recoil: number;
  spread: number;
  zoom: number;
  color: string;
  kickback: number;
  type: 'auto' | 'semi' | 'bolt';
}

export const WEAPONS: Record<string, WeaponStats> = {
  weapon1: { name: 'M416', fireRate: 0.1, recoil: 0.04, kickback: 0.08, spread: 0.02, zoom: 45, color: '#2c3e50', type: 'auto' },
  weapon2: { name: 'Vector', fireRate: 0.05, recoil: 0.02, kickback: 0.04, spread: 0.05, zoom: 55, color: '#34495e', type: 'auto' },
  weapon3: { name: 'AWM', fireRate: 1.5, recoil: 0.4, kickback: 0.25, spread: 0.001, zoom: 15, color: '#145a32', type: 'bolt' },
  weapon4: { name: 'Deagle', fireRate: 0.4, recoil: 0.15, kickback: 0.15, spread: 0.03, zoom: 50, color: '#d5d8dc', type: 'semi' },
  weapon5: { name: 'Shotgun', fireRate: 0.8, recoil: 0.3, kickback: 0.2, spread: 0.15, zoom: 60, color: '#5d4037', type: 'semi' },
};

interface WeaponProps {
  activeWeapon: string;
  isAiming: boolean;
  lastShotTime: number;
}

export const Weapon: React.FC<WeaponProps> = ({ activeWeapon, isAiming, lastShotTime }) => {
  const group = useRef<THREE.Group>(null);
  const internalGroup = useRef<THREE.Group>(null);
  const stats = WEAPONS[activeWeapon];

  // Procedural Animation State
  const recoilOffset = useRef(new THREE.Vector3());
  const recoilRotation = useRef(0);

  useFrame((state) => {
    if (!group.current || !internalGroup.current) return;

    const time = state.clock.getElapsedTime();
    
    // 1. Position smoothing (Hip vs ADS)
    const targetPos = isAiming 
      ? new THREE.Vector3(0, -0.12, -0.15) // ADS Center
      : new THREE.Vector3(0.35, -0.35, -0.5); // Hip Fire

    group.current.position.lerp(targetPos, 0.15);

    // 2. Procedural Idle Sway
    const swayX = Math.sin(time * 1.5) * 0.005;
    const swayY = Math.cos(time * 2) * 0.005;
    
    // 3. Shooting Kickback Animation
    const timeSinceShot = state.clock.getElapsedTime() - lastShotTime;
    const kickDuration = 0.1; // How fast it kicks back
    
    if (timeSinceShot < kickDuration) {
      // Linear interpolation for the kick
      const t = timeSinceShot / kickDuration;
      recoilOffset.current.z = THREE.MathUtils.lerp(0, stats.kickback, t);
      recoilRotation.current = THREE.MathUtils.lerp(0, stats.recoil * 2, t);
    } else {
      // Elastic return to zero
      recoilOffset.current.z = THREE.MathUtils.lerp(recoilOffset.current.z, 0, 0.1);
      recoilRotation.current = THREE.MathUtils.lerp(recoilRotation.current, 0, 0.1);
    }

    internalGroup.current.position.set(swayX, swayY, recoilOffset.current.z);
    internalGroup.current.rotation.x = recoilRotation.current;
  });

  return (
    <group ref={group}>
      <group ref={internalGroup}>
        {/* Main Body / Receiver */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.06, 0.14, 0.45]} />
          <meshStandardMaterial color={stats.color} roughness={0.7} />
        </mesh>

        {/* Barrel Assembly */}
        <mesh position={[0, 0.04, -0.4]}>
          <boxGeometry args={activeWeapon === 'weapon3' ? [0.04, 0.04, 0.8] : [0.03, 0.03, 0.55]} />
          <meshStandardMaterial color="#111" metalness={0.8} />
        </mesh>

        {/* Pistol Grip */}
        <mesh position={[0, -0.15, 0.15]} rotation={[-0.2, 0, 0]}>
          <boxGeometry args={[0.05, 0.18, 0.08]} />
          <meshStandardMaterial color="#111" />
        </mesh>

        {/* Magazine */}
        <mesh position={[0, -0.18, -0.1]} rotation={[0.1, 0, 0]}>
          <boxGeometry args={activeWeapon === 'weapon2' ? [0.04, 0.25, 0.06] : [0.04, 0.15, 0.07]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>

        {/* Stock */}
        <mesh position={[0, -0.02, 0.35]}>
          <boxGeometry args={[0.05, 0.12, 0.3]} />
          <meshStandardMaterial color={stats.color} />
        </mesh>

        {/* Sight / Optics */}
        <mesh position={[0, 0.11, -0.05]}>
          <boxGeometry args={activeWeapon === 'weapon3' ? [0.07, 0.07, 0.25] : [0.02, 0.05, 0.08]} />
          <meshStandardMaterial color="#000" />
        </mesh>
      </group>
    </group>
  );
};
