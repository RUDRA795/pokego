import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../state/usePlayerStore';
import { useGameStore } from '../state/useGameStore';

export function useKeyboardControls() {
  const setInput = usePlayerStore((state) => state.setInput);
  const screen = useGameStore((state) => state.screen);

  const keysPressed = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (screen !== 'MAP') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      keysPressed.current[e.code] = true;
      updateInputVector();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
      updateInputVector();
    };

    const updateInputVector = () => {
      let x = 0;
      let y = 0;

      // Horizontal (X)
      if (keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft']) x -= 1;
      if (keysPressed.current['KeyD'] || keysPressed.current['ArrowRight']) x += 1;

      // Vertical (Y -> forward / backward)
      if (keysPressed.current['KeyW'] || keysPressed.current['ArrowUp']) y += 1;
      if (keysPressed.current['KeyS'] || keysPressed.current['ArrowDown']) y -= 1;

      const len = Math.sqrt(x * x + y * y);
      if (len > 0) {
        x /= len;
        y /= len;
      }

      setInput({ x, y });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      keysPressed.current = {};
      setInput({ x: 0, y: 0 });
    };
  }, [screen, setInput]);
}
