
'use client';

import { Canvas } from '@react-three/fiber';
import { Sky, PointerLockControls, Stars } from '@react-three/drei';
import { Physics } from '@react-three/cannon';
import { Cube } from './Cube';
import { Player } from './Player';
import { useMemo } from 'react';

export const VoxelWorld = () => {
  // Generate a flat ground of voxels
  const groundCubes = useMemo(() => {
    const cubes = [];
    for (let x = -10; x < 10; x++) {
      for (let z = -10; z < 10; z++) {
        cubes.push({ position: [x, 0, z], type: 'grass' });
      }
    }
    return cubes;
  }, []);

  return (
    <div className="w-full h-full bg-black">
      <Canvas shadows camera={{ fov: 45 }}>
        <Sky sunPosition={[100, 20, 100]} />
        <Stars />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} castShadow />
        
        <Physics gravity={[0, -9.81, 0]}>
          <Player />
          {groundCubes.map((cube, i) => (
            <Cube key={i} position={cube.position as any} type={cube.type} />
          ))}
          {/* Some decorative pillars */}
          <Cube position={[2, 1, 2]} type="log" />
          <Cube position={[2, 2, 2]} type="log" />
          <Cube position={[2, 3, 2]} type="wood" />
        </Physics>
        
        <PointerLockControls />
      </Canvas>
      
      <div className="absolute top-4 left-4 z-50 text-white pointer-events-none bg-black/50 p-4 rounded-lg border border-white/10 backdrop-blur-md">
        <h3 className="text-xs font-bold uppercase tracking-widest mb-2 text-primary">Controls</h3>
        <ul className="text-[10px] space-y-1 opacity-80">
          <li>W, A, S, D - Move</li>
          <li>SPACE - Jump</li>
          <li>Click - Lock Mouse</li>
          <li>ESC - Unlock Mouse</li>
        </ul>
      </div>
    </div>
  );
};
