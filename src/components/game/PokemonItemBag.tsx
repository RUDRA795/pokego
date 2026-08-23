/**
 * Pokémon 3D RPG — Pokémon GO Style Item Bag & Inventory
 */

import React, { useState } from 'react';
import { usePlayerPartyStore } from '../../state/usePlayerPartyStore';
import { useGameStore } from '../../state/useGameStore';
import { ShoppingBag, Disc, Heart, Sparkles, Shield, Plus, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

const ALL_ITEMS = [
  { id: 'poke_ball', name: 'Poké Ball', category: 'Balls', desc: 'A device for catching wild Pokémon.', cost: 50 },
  { id: 'great_ball', name: 'Great Ball', category: 'Balls', desc: 'Higher catch rate than a standard Poké Ball.', cost: 100 },
  { id: 'ultra_ball', name: 'Ultra Ball', category: 'Balls', desc: 'Ultra-high performance ball for rare species.', cost: 200 },
  { id: 'razz_berry', name: 'Razz Berry', category: 'Berries', desc: 'Feed to wild Pokémon to make them easier to catch.', cost: 40 },
  { id: 'potion', name: 'Potion', category: 'Medicine', desc: 'Restores 20 HP to a damaged Pokémon.', cost: 60 },
  { id: 'max_revive', name: 'Max Revive', category: 'Medicine', desc: 'Fully revives a fainted Pokémon with max HP.', cost: 150 },
];

export const PokemonItemBag: React.FC = () => {
  const { inventory, addItem, healParty } = usePlayerPartyStore();
  const { pokeCoins, addCoins } = useGameStore();

  const [notice, setNotice] = useState<string | null>(null);

  const handleBuyItem = (item: typeof ALL_ITEMS[0]) => {
    if (pokeCoins < item.cost) {
      setNotice('Not enough Poké Coins! Complete battles to earn more.');
      setTimeout(() => setNotice(null), 2500);
      return;
    }

    useGameStore.setState((s) => ({ pokeCoins: s.pokeCoins - item.cost }));
    addItem(item.id, 5);
    setNotice(`Purchased 5x ${item.name}!`);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.5 } });
    setTimeout(() => setNotice(null), 2500);
  };

  return (
    <div className="w-full space-y-6">
      {notice && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-slate-950 font-black px-5 py-2.5 rounded-2xl text-xs text-center shadow-xl animate-bounce">
          {notice}
        </div>
      )}

      {/* Bag Header */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 shadow-lg">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Item Bag & Supplies</h2>
            <p className="text-xs text-slate-400">Manage catch supplies, medicines, and PokéStops items</p>
          </div>
        </div>

        <div className="bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 font-black text-amber-400 text-sm">
          {pokeCoins} Poké Coins
        </div>
      </div>

      {/* Item Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ALL_ITEMS.map((item) => {
          const count = inventory.find((i) => i.id === item.id)?.count || 0;
          return (
            <div
              key={item.id}
              className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-xl hover:border-slate-700 transition"
            >
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                    {item.category}
                  </span>
                  <span className="text-xs font-mono font-black text-white bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-800">
                    x{count} In Bag
                  </span>
                </div>
                <h3 className="text-lg font-black text-white">{item.name}</h3>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>

              <button
                onClick={() => handleBuyItem(item)}
                className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-emerald-500 hover:text-slate-950 border border-slate-800 text-xs font-black text-slate-200 flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buy 5x ({item.cost} Coins)</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
