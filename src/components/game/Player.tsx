'use client';

import { useSphere } from '@react-three/cannon';
import { useThree, useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useKeyboard } from '@/hooks/useKeyboard';
import { Weapon, WEAPONS } from './Weapon';

const JUMP_FORCE = 4.5;
const SPEED = 5;
const SPRINT_MULTIPLIER = 1.6;

export const Player = () => {
  const { camera, scene } = useThree();
  const [ref, api] = useSphere(() => ({
    mass: 1,
    type: 'Dynamic',
    position: [0, 5, 0],
    args: [0.6],
  }));

  const velocity = useRef([0, 0, 0]);
  useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), [api.velocity]);

  const pos = useRef([0, 0, 0]);
  useEffect(() => api.position.subscribe((p) => (pos.current = p)), [api.position]);

  const { moveForward, moveBackward, moveLeft, moveRight, jump, sprint, shoot, aim, weapon1, weapon2, weapon3, weapon4, weapon5 } = useKeyboard();
  
  const [activeWeaponKey, setActiveWeaponKey] = useState('weapon1');
  const [lastShotTime, setLastShotTime] = useState(0);
  
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const centerVector = useMemo(() => new THREE.Vector2(0, 0), []);

  useEffect(() => {
    if (weapon1) setActiveWeaponKey('weapon1');
    if (weapon2) setActiveWeaponKey('weapon2');
    if (weapon3) setActiveWeaponKey('weapon3');
    if (weapon4) setActiveWeaponKey('weapon4');
    if (weapon5) setActiveWeaponKey('weapon5');
  }, [weapon1, weapon2, weapon3, weapon4, weapon5]);

  useFrame((state) => {
    const activeWeapon = WEAPONS[activeWeaponKey];
    if (!activeWeapon) return;

    // PerspectiveCamera Specific FOV Handling
    if (camera instanceof THREE.PerspectiveCamera) {
      const targetFOV = aim ? activeWeapon.zoom : 75;
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFOV, 0.15);
      camera.updateProjectionMatrix();
    }

    // Movement Physics
    camera.position.set(pos.current[0], pos.current[1] + 0.75, pos.current[2]);
    
    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3(0, 0, Number(moveBackward) - Number(moveForward));
    const sideVector = new THREE.Vector3(Number(moveLeft) - Number(moveRight), 0, 0);

    const currentSpeed = sprint && moveForward && !aim ? SPEED * SPRINT_MULTIPLIER : SPEED;

    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(currentSpeed)
      .applyEuler(camera.rotation);

    api.velocity.set(direction.x, velocity.current[1], direction.z);

    if (jump && Math.abs(velocity.current[1]) < 0.05) {
      api.velocity.set(velocity.current[0], JUMP_FORCE, velocity.current[2]);
    }

    // Shooting Logic
    if (shoot && state.clock.getElapsedTime() - lastShotTime > activeWeapon.fireRate) {
      const now = state.clock.getElapsedTime();
      setLastShotTime(now);
      
      // Camera Recoil (X-Axis upward tilt)
      camera.rotation.x += activeWeapon.recoil * (Math.random() * 0.5 + 0.8);
      camera.rotation.y += (Math.random() - 0.5) * 0.01; // Slight horizontal jitter
      
      // Precision Raycasting
      raycaster.setFromCamera(centerVector, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      
      if (intersects.length > 0) {
        const hit = intersects[0];
        if (hit.object.userData.isTarget) {
          const target = hit.object as THREE.Mesh;
          const mat = target.material as THREE.MeshStandardMaterial;
          const originalColor = mat.color.clone();
          mat.color.set('#ffffff');
          setTimeout(() => {
            if (mat) mat.color.copy(originalColor);
          }, 50);
        }
      }
    }

    // Recoil Recovery (smoothly return camera to center)
    camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, camera.rotation.x * 0.95, 0.1);
  });

  return (
    <>
      <mesh ref={ref as any} />
      <group>
        <primitive object={camera}>
          <Weapon activeWeapon={activeWeaponKey} isAiming={aim} lastShotTime={lastShotTime} />
        </primitive>
      </group>
    </>
  );
};
