
'use client';

import { useBox } from '@react-three/cannon';
import { useState } from 'react';
import * as THREE from 'three';

interface CubeProps {
  position: [number, number, number];
  type: string;
  isTarget?: boolean;
}

const textures: Record<string, string> = {
  dirt: '#8B4513',
  grass: '#228B22',
  glass: '#ADD8E6',
  wood: '#A0522D',
  log: '#5D4037',
  target: '#ff4444',
};

export const Cube = ({ position, type, isTarget = false }: CubeProps) => {
  const [hover, setHover] = useState<number | null>(null);
  const [ref] = useBox(() => ({
    type: 'Static',
    position,
    args: [1, 1, 1],
  }));

  const color = textures[type] || '#ffffff';

  return (
    <mesh
      ref={ref as any}
      userData={{ isTarget }}
      onPointerMove={(e) => {
        e.stopPropagation();
        setHover(Math.floor(e.faceIndex! / 2));
      }}
      onPointerOut={() => {
        setHover(null);
      }}
    >
      <boxGeometry />
      <meshStandardMaterial
        color={hover !== null ? '#ddd' : color}
        transparent={type === 'glass'}
        opacity={type === 'glass' ? 0.6 : 1}
      />
    </mesh>
  );
};
