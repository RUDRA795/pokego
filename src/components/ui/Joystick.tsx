import React, { useRef, useState, useCallback, useEffect } from 'react';
import { usePlayerStore } from '../../state/usePlayerStore';

interface JoystickProps {
  size?: number;
}

export const Joystick: React.FC<JoystickProps> = ({ size = 120 }) => {
  const setInput = usePlayerStore((state) => state.setInput);
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [handlePos, setHandlePos] = useState({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);

  const maxRadius = size / 2 - 16;

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActive(true);
    touchIdRef.current = e.pointerId;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!active || !containerRef.current || e.pointerId !== touchIdRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);

    const clampedX = Math.cos(angle) * clampedDist;
    const clampedY = Math.sin(angle) * clampedDist;

    setHandlePos({ x: clampedX, y: clampedY });

    // Normalize input between -1 and 1
    // Screen Y is down (positive), but forward in game is positive Y (up on screen), so invert Y
    const normX = clampedX / maxRadius;
    const normY = -(clampedY / maxRadius);

    setInput({ x: normX, y: normY });
  }, [active, maxRadius, setInput]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (e.pointerId === touchIdRef.current) {
      setActive(false);
      touchIdRef.current = null;
      setHandlePos({ x: 0, y: 0 });
      setInput({ x: 0, y: 0 });
    }
  }, [setInput]);

  // Reset when window loses focus
  useEffect(() => {
    const handleBlur = () => {
      setActive(false);
      setHandlePos({ x: 0, y: 0 });
      setInput({ x: 0, y: 0 });
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [setInput]);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ width: size, height: size }}
      className={`relative rounded-full flex items-center justify-center select-none touch-none transition-opacity duration-200 ${
        active ? 'bg-pokemon-ui-card/80 border-pokemon-blue shadow-lg' : 'bg-pokemon-ui-card/50 border-pokemon-ui-border'
      } border-4`}
    >
      <div className="absolute inset-2 rounded-full border-2 border-dashed border-pokemon-ui-border pointer-events-none" />

      <div className="w-2 h-2 rounded-full bg-pokemon-ui-muted pointer-events-none" />

      <div
        style={{
          transform: `translate(${handlePos.x}px, ${handlePos.y}px)`,
        }}
        className={`w-12 h-12 rounded-full flex items-center justify-center pointer-events-none transition-transform duration-75 ${
          active
            ? 'bg-pokemon-blue shadow-md scale-105'
            : 'bg-pokemon-ui-border shadow'
        } border-4 border-white`}
      >
        <div className="w-4 h-4 rounded-full bg-white/60" />
      </div>
    </div>
  );
};
