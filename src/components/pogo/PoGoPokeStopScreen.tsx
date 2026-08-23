/**
 * Pokémon 3D RPG — Authentic Pokémon GO PokéStop Photo Disc Screen
 * 
 * Features:
 * - 3D Spinning Photo Disc of real landmark.
 * - Interactive swipe/spin physics with rapid disc spin animation.
 * - Floating bubble item drops (Poké Balls, Great Balls, Berries, Eggs) that pop when tapped.
 * - Cooldown state (disc turns purple) with persistent rewards.
 */

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../../state/useGameStore';
import { usePlayerPartyStore } from '../../state/usePlayerPartyStore';
import { NagpurHotspot } from '../../state/useRealWorldStore';
import { getPokemonIcon } from '../../data/pokemon/images';
import { X, Disc, Sparkles, Check } from 'lucide-react';

interface PokeStopScreenProps {
  hotspot: NagpurHotspot;
  onClose: () => void;
}

interface ItemBubble {
  id: number;
  type: 'POKE_BALL' | 'GREAT_BALL' | 'RAZZ_BERRY' | 'POTION' | 'EGG';
  name: string;
  count: number;
  x: number; // percentage
  y: number;
  isPopped: boolean;
}

export const PoGoPokeStopScreen: React.FC<PokeStopScreenProps> = ({
  hotspot,
  onClose,
}) => {
  const { addStardust, addExp } = useGameStore();
  const { addItem, addEgg } = usePlayerPartyStore();

  const [isSpun, setIsSpun] = useState<boolean>(false);
  const [discRotation, setDiscRotation] = useState<number>(0);
  const [bubbles, setBubbles] = useState<ItemBubble[]>([]);

  // Spin Photo Disc
  const handleSpinDisc = () => {
    if (isSpun) return;
    setIsSpun(true);
    setDiscRotation((prev) => prev + 1080); // 3 full 360 spins

    // Generate 4 floating item drops
    const drops: ItemBubble[] = [
      { id: 1, type: 'POKE_BALL', name: 'Poké Ball', count: 3, x: 25, y: 35, isPopped: false },
      { id: 2, type: 'GREAT_BALL', name: 'Great Ball', count: 2, x: 75, y: 32, isPopped: false },
      { id: 3, type: 'RAZZ_BERRY', name: 'Razz Berry', count: 2, x: 30, y: 65, isPopped: false },
      { id: 4, type: 'EGG', name: '2km Egg', count: 1, x: 70, y: 68, isPopped: false },
    ];

    setTimeout(() => {
      setBubbles(drops);
      addItem('poke_ball', 3);
      addItem('great_ball', 2);
      addItem('razz_berry', 2);
      addEgg(2.0);
      addStardust(150);
      addExp(100);
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
    }, 600);
  };

  const handlePopBubble = (id: number) => {
    setBubbles((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isPopped: true } : b))
    );
    confetti({ particleCount: 20, spread: 40 });
  };

  return (
    <div className="fixed inset-0 z-[900] bg-gradient-to-b from-sky-950 via-slate-900 to-slate-950 flex flex-col items-center justify-between p-6 select-none animate-fade">
      {/* Top Landmark Banner */}
      <div className="w-full max-w-sm text-center space-y-1 z-20">
        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
          Nagpur PokéStop
        </span>
        <h2 className="text-2xl font-black text-white">{hotspot.name}</h2>
        <p className="text-xs text-slate-400 italic">{hotspot.description}</p>
      </div>

      {/* Center 3D Photo Disc & Floating Item Bubbles */}
      <div className="relative w-full max-w-sm h-[400px] flex items-center justify-center">
        {/* Floating Bubble Drops */}
        {bubbles.map((bubble) => {
          if (bubble.isPopped) return null;
          return (
            <button
              key={bubble.id}
              onClick={() => handlePopBubble(bubble.id)}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-cyan-400/20 backdrop-blur-md border-2 border-cyan-300 shadow-[0_0_20px_rgba(56,189,248,0.6)] flex flex-col items-center justify-center animate-bounce hover:scale-125 transition-transform z-30 cursor-pointer"
              style={{ left: `${bubble.x}%`, top: `${bubble.y}%` }}
            >
              <div className="text-lg">
                {bubble.type === 'POKE_BALL' && '🔴'}
                {bubble.type === 'GREAT_BALL' && '🔵'}
                {bubble.type === 'RAZZ_BERRY' && '🍇'}
                {bubble.type === 'EGG' && '🥚'}
              </div>
              <span className="text-[9px] font-black text-white font-mono">
                +{bubble.count}
              </span>
            </button>
          );
        })}

        {/* 3D Circular Photo Disc */}
        <div
          onClick={handleSpinDisc}
          className={`w-64 h-64 rounded-full border-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex items-center justify-center relative cursor-grab active:cursor-grabbing transition-transform duration-1000 ease-out ${
            isSpun ? 'border-purple-500 shadow-purple-500/40' : 'border-cyan-400 shadow-cyan-500/40'
          }`}
          style={{ transform: `rotate(${discRotation}deg)` }}
        >
          {/* Inner Photo Placeholder */}
          <div className="w-52 h-52 rounded-full overflow-hidden bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center text-center p-4 border-2 border-white/20">
            <Disc className="w-16 h-16 text-cyan-400 mb-2 opacity-80" />
            <span className="text-[11px] font-black text-white uppercase tracking-wider">
              {hotspot.name}
            </span>
          </div>

          {/* Glowing Center Ring */}
          <div className="absolute w-12 h-12 rounded-full border-4 border-white/80 bg-slate-950/80 shadow-md" />
        </div>
      </div>

      {/* Swipe Instruction or Rewarded State */}
      <div className="text-center z-20">
        {!isSpun ? (
          <div className="text-xs font-black uppercase tracking-widest text-cyan-300 animate-pulse">
            Swipe or Tap Photo Disc to Spin!
          </div>
        ) : (
          <div className="text-xs font-black uppercase tracking-widest text-purple-300">
            PokéStop Spun! Items Added to Bag.
          </div>
        )}
      </div>

      {/* Bottom Close Button (Circular X) */}
      <button
        onClick={onClose}
        className="w-14 h-14 rounded-full bg-slate-900 hover:bg-slate-800 border-2 border-white/30 text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all cursor-pointer z-30"
        title="Close PokéStop"
      >
        <X className="w-6 h-6" />
      </button>
    </div>
  );
};
