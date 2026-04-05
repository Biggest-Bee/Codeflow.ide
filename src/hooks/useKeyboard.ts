
'use client';

import { useEffect, useState } from 'react';

function actionByKey(key: string) {
  const keys: Record<string, string> = {
    KeyW: 'moveForward',
    KeyS: 'moveBackward',
    KeyA: 'moveLeft',
    KeyD: 'moveRight',
    Space: 'jump',
    Digit1: 'weapon1',
    Digit2: 'weapon2',
    Digit3: 'weapon3',
    Digit4: 'weapon4',
    Digit5: 'weapon5',
    ShiftLeft: 'sprint',
  };
  return keys[key];
}

export const useKeyboard = () => {
  const [actions, setActions] = useState({
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    jump: false,
    sprint: false,
    weapon1: true, // Default to first weapon
    weapon2: false,
    weapon3: false,
    weapon4: false,
    weapon5: false,
    shoot: false,
    aim: false,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const action = actionByKey(event.code);
      if (action) {
        if (action.startsWith('weapon')) {
          setActions(prev => ({
            ...prev,
            weapon1: action === 'weapon1',
            weapon2: action === 'weapon2',
            weapon3: action === 'weapon3',
            weapon4: action === 'weapon4',
            weapon5: action === 'weapon5',
          }));
        } else {
          setActions((prev) => ({ ...prev, [action]: true }));
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const action = actionByKey(event.code);
      if (action) {
        if (!action.startsWith('weapon')) {
          setActions((prev) => ({ ...prev, [action]: false }));
        }
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) setActions(prev => ({ ...prev, shoot: true }));
      if (event.button === 2) setActions(prev => ({ ...prev, aim: true }));
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 0) setActions(prev => ({ ...prev, shoot: false }));
      if (event.button === 2) setActions(prev => ({ ...prev, aim: false }));
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return actions;
};
