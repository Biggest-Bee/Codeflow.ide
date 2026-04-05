'use client';

import { Canvas } from '@react-three/fiber';
import { Sky, PointerLockControls, Stars } from '@react-three/drei';
import { Physics, usePlane } from '@react-three/cannon';
import { Cube } from './Cube';
import { Player } from './Player';
import { useState, useEffect } from 'react';
import { useKeyboard } from '@/hooks/useKeyboard';
import { WEAPONS } from './Weapon';
import { cn } from '@/lib/utils';

const Ground = () => {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0]
  }));
  return (
    <mesh ref={ref as any} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#2d5a27" roughness={0.8} />
    </mesh>
  );
};

export const VoxelWorld = () => {
  const { aim, weapon1, weapon2, weapon3, weapon4, weapon5 } = useKeyboard();
  const [activeWeapon, setActiveWeapon] = useState('weapon1');

  useEffect(() => {
    if (weapon1) setActiveWeapon('weapon1');
    if (weapon2) setActiveWeapon('weapon2');
    if (weapon3) setActiveWeapon('weapon3');
    if (weapon4) setActiveWeapon('weapon4');
    if (weapon5) setActiveWeapon('weapon5');
  }, [weapon1, weapon2, weapon3, weapon4, weapon5]);

  const isSniperAiming = aim && activeWeapon === 'weapon3';

  return (
    <div className="w-full h-full bg-black relative">
      <Canvas shadows camera={{ fov: 75, position: [0, 5, 10] }}>
        <Sky sunPosition={[100, 50, 100]} turbidity={0.1} rayleigh={2} />
        <Stars radius={100} depth={50} count={5000} factor={4} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 20, 10]} castShadow intensity={1.5} shadow-mapSize={[1024, 1024]} />
        
        <Physics gravity={[0, -18, 0]} tolerance={0.001}>
          <Ground />
          <Player />
          
          {/* Targets */}
          {[...Array(12)].map((_, i) => (
            <group key={`target-${i}`} position={[Math.cos(i) * 20, 1, -20 - i * 8]}>
              <Cube position={[0, 0, 0]} type="target" isTarget />
              <Cube position={[0, 1, 0]} type="target" isTarget />
              <Cube position={[0, 2, 0]} type="target" isTarget />
            </group>
          ))}

          {/* Environmental Obstacles */}
          <Cube position={[10, 1, 5]} type="wood" />
          <Cube position={[10, 2, 5]} type="wood" />
          <Cube position={[-8, 1, -5]} type="log" />
          <Cube position={[-8, 2, -5]} type="log" />
          <Cube position={[0, 1, -15]} type="glass" />
        </Physics>
        
        <PointerLockControls />
      </Canvas>

      {/* Scope Overlay for Sniper */}
      {isSniperAiming && (
        <div className="absolute inset-0 z-[200] pointer-events-none flex items-center justify-center bg-black/10 overflow-hidden">
          <div className="w-full h-full border-[200px] border-black rounded-full opacity-95 shadow-[inset_0_0_100px_black]" />
          <div className="absolute w-[1px] h-full bg-black opacity-80" />
          <div className="absolute w-full h-[1px] bg-black opacity-80" />
          <div className="absolute w-6 h-6 border border-red-600 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-green-500/5" />
        </div>
      )}

      {/* UI Overlays */}
      <div className={cn("absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity", isSniperAiming ? "opacity-0" : "opacity-100")}>
        <div className="w-5 h-5 border border-primary/40 rounded-full" />
        <div className="absolute w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_cyan]" />
      </div>

      <div className="absolute top-4 left-4 z-50 text-white pointer-events-none flex flex-col gap-4">
        <div className="bg-black/60 p-4 rounded-xl border border-white/10 backdrop-blur-md shadow-2xl">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-3 text-primary flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-ping" /> Arsenal Status
          </h3>
          <ul className="text-[10px] space-y-1.5 font-bold uppercase opacity-90">
            <li className={cn("flex justify-between gap-4", activeWeapon === 'weapon1' ? "text-primary scale-105 origin-left transition-transform" : "opacity-50")}>
              <span>1: M416 [AR]</span> {activeWeapon === 'weapon1' && '●'}
            </li>
            <li className={cn("flex justify-between gap-4", activeWeapon === 'weapon2' ? "text-primary scale-105 origin-left transition-transform" : "opacity-50")}>
              <span>2: Vector [SMG]</span> {activeWeapon === 'weapon2' && '●'}
            </li>
            <li className={cn("flex justify-between gap-4", activeWeapon === 'weapon3' ? "text-primary scale-105 origin-left transition-transform" : "opacity-50")}>
              <span>3: AWM [SNIPER]</span> {activeWeapon === 'weapon3' && '●'}
            </li>
            <li className={cn("flex justify-between gap-4", activeWeapon === 'weapon4' ? "text-primary scale-105 origin-left transition-transform" : "opacity-50")}>
              <span>4: Deagle [SIDEARM]</span> {activeWeapon === 'weapon4' && '●'}
            </li>
            <li className={cn("flex justify-between gap-4", activeWeapon === 'weapon5' ? "text-primary scale-105 origin-left transition-transform" : "opacity-50")}>
              <span>5: Shotgun [CQC]</span> {activeWeapon === 'weapon5' && '●'}
            </li>
            <li className="pt-3 text-white/40 text-[8px] tracking-widest border-t border-white/5 mt-2">
              L-CLICK: FIRE | R-CLICK: ADS | SHIFT: RUN
            </li>
          </ul>
        </div>
        
        <div className="bg-primary/20 p-3 rounded-lg border border-primary/30 backdrop-blur-sm flex items-center justify-between min-w-[180px]">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">
            {WEAPONS[activeWeapon].name}
          </p>
          <span className="text-[8px] font-black text-white/50">{WEAPONS[activeWeapon].type}</span>
        </div>
      </div>
    </div>
  );
};
