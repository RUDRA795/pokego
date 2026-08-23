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
        active ? 'bg-slate-900/80 border-cyan-400/60 shadow-lg shadow-cyan-500/20' : 'bg-slate-900/50 border-slate-700/60'
      } border-2 backdrop-blur-md`}
    >
      {/* Outer directional indicator ring */}
      <div className="absolute inset-2 rounded-full border border-dashed border-slate-600/40 pointer-events-none" />

      {/* Center crosshair */}
      <div className="w-2 h-2 rounded-full bg-slate-500/40 pointer-events-none" />

      {/* Interactive Handle */}
      <div
        style={{
          transform: `translate(${handlePos.x}px, ${handlePos.y}px)`,
        }}
        className={`w-12 h-12 rounded-full flex items-center justify-center pointer-events-none transition-transform duration-75 ${
          active
            ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/50 scale-105'
            : 'bg-slate-700/80 shadow'
        } border border-white/20`}
      >
        <div className="w-4 h-4 rounded-full bg-white/40" />
      </div>
    </div>
  );
};
