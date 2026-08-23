/**
 * Pokémon 3D RPG — Authentic Pokémon GO Circular Radial Main Menu
 */

import React from 'react';
import {
  Layers,
  ShoppingBag,
  Swords,
  Zap,
  Settings,
  X,
  Sparkles,
  BookOpen,
  Backpack,
  Compass
} from 'lucide-react';

export type PoGoScreenMode = 'OVERWORLD' | 'STORAGE' | 'ITEMS' | 'POKEDEX' | 'BATTLE' | 'SHOP';

interface MainMenuModalProps {
  onClose: () => void;
  onNavigate: (screen: PoGoScreenMode) => void;
  onToggleSettings: () => void;
}

export const PoGoMainMenuModal: React.FC<MainMenuModalProps> = ({
  onClose,
  onNavigate,
  onToggleSettings,
}) => {
  return (
    <div className="fixed inset-0 z-[900] bg-slate-950/85 backdrop-blur-2xl flex flex-col items-center justify-between p-6 select-none animate-fade">
      {/* Top Header Controls */}
      <div className="w-full max-w-md flex items-center justify-between z-10">
        <button
          onClick={onToggleSettings}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900/90 border border-white/10 text-xs font-black text-slate-300 hover:text-white shadow-xl hover:scale-105 active:scale-95 transition"
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Quick GPS / Settings</span>
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-white/10 text-[10px] font-black text-amber-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>POKÉMON GO ENGINE</span>
        </div>
      </div>

      {/* Center Circular Radial Menu Layout */}
      <div className="relative w-full max-w-sm h-96 flex items-center justify-center">
        {/* Decorative Background Pulsing Ring */}
        <div className="absolute w-72 h-72 rounded-full border border-teal-500/20 animate-spin-slow pointer-events-none" />
        <div className="absolute w-80 h-80 rounded-full border border-teal-500/10 pointer-events-none" />

        {/* 1. TOP-LEFT: POKÉDEX */}
        <div className="absolute top-4 left-6 flex flex-col items-center gap-1">
          <button
            onClick={() => {
              onNavigate('POKEDEX');
              onClose();
            }}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white border-2 border-white/40 shadow-[0_10px_25px_rgba(244,63,94,0.4)] flex items-center justify-center transition-all hover:scale-115 active:scale-95"
          >
            <BookOpen className="w-7 h-7" />
          </button>
          <span className="text-[11px] font-black uppercase text-slate-200 tracking-wider">
            Pokédex
          </span>
        </div>

        {/* 2. TOP-RIGHT: BATTLE */}
        <div className="absolute top-4 right-6 flex flex-col items-center gap-1">
          <button
            onClick={() => {
              onNavigate('BATTLE');
              onClose();
            }}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-2 border-white/40 shadow-[0_10px_25px_rgba(147,51,234,0.4)] flex items-center justify-center transition-all hover:scale-115 active:scale-95"
          >
            <Swords className="w-7 h-7" />
          </button>
          <span className="text-[11px] font-black uppercase text-slate-200 tracking-wider">
            Battle
          </span>
        </div>

        {/* 3. CENTER: SHOP */}
        <div className="absolute top-28 flex flex-col items-center gap-1">
          <button
            onClick={() => {
              onNavigate('SHOP');
              onClose();
            }}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 border-2 border-white/40 shadow-[0_10px_25px_rgba(245,158,11,0.4)] flex items-center justify-center transition-all hover:scale-115 active:scale-95"
          >
            <ShoppingBag className="w-7 h-7" />
          </button>
          <span className="text-[11px] font-black uppercase text-slate-200 tracking-wider">
            Shop
          </span>
        </div>

        {/* 4. BOTTOM-LEFT: POKÉMON & EGGS */}
        <div className="absolute bottom-6 left-10 flex flex-col items-center gap-1">
          <button
            onClick={() => {
              onNavigate('STORAGE');
              onClose();
            }}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 border-2 border-white/40 shadow-[0_10px_25px_rgba(16,185,129,0.4)] flex items-center justify-center transition-all hover:scale-115 active:scale-95"
          >
            <Zap className="w-7 h-7 fill-slate-950" />
          </button>
          <span className="text-[11px] font-black uppercase text-slate-200 tracking-wider">
            Pokémon
          </span>
        </div>

        {/* 5. BOTTOM-RIGHT: ITEMS (BAG) */}
        <div className="absolute bottom-6 right-10 flex flex-col items-center gap-1">
          <button
            onClick={() => {
              onNavigate('ITEMS');
              onClose();
            }}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white border-2 border-white/40 shadow-[0_10px_25px_rgba(6,182,212,0.4)] flex items-center justify-center transition-all hover:scale-115 active:scale-95"
          >
            <Backpack className="w-7 h-7" />
          </button>
          <span className="text-[11px] font-black uppercase text-slate-200 tracking-wider">
            Items
          </span>
        </div>
      </div>

      {/* Bottom Close Button (Circular X) */}
      <button
        onClick={onClose}
        className="w-14 h-14 rounded-full bg-slate-900 hover:bg-slate-800 border-2 border-white/30 text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all cursor-pointer"
        title="Close Menu"
      >
        <X className="w-6 h-6" />
      </button>
    </div>
  );
};
