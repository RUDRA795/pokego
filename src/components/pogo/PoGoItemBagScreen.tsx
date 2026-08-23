/**
 * Pokémon 3D RPG — Authentic Pokémon GO Item Bag Screen
 */

import React, { useState } from 'react';
import { usePlayerPartyStore } from '../../state/usePlayerPartyStore';
import { useGameStore } from '../../state/useGameStore';
import { X, ShoppingBag, Plus, Sparkles, Disc, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ItemBagScreenProps {
  onClose: () => void;
}

const ITEM_DETAILS = [
  { id: 'poke_ball', name: 'Poké Ball', icon: '🔴', category: 'Balls', desc: 'A device for catching wild Pokémon. It is thrown like a ball.', cost: 50 },
  { id: 'great_ball', name: 'Great Ball', icon: '🔵', category: 'Balls', desc: 'A high-performance Poké Ball that provides a higher catch rate.', cost: 100 },
  { id: 'ultra_ball', name: 'Ultra Ball', icon: '🟡', category: 'Balls', desc: 'An ultra-performance Poké Ball that provides an even higher catch rate.', cost: 200 },
  { id: 'razz_berry', name: 'Razz Berry', icon: '🍇', category: 'Berries', desc: 'Feed this to a Pokémon to make it easier to catch.', cost: 40 },
  { id: 'pinap_berry', name: 'Pinap Berry', icon: '🍍', category: 'Berries', desc: 'Feed this to a Pokémon to receive double Candy upon capture.', cost: 60 },
  { id: 'nanab_berry', name: 'Nanab Berry', icon: '🍌', category: 'Berries', desc: 'Feed this to a Pokémon to calm its movements during capture.', cost: 40 },
  { id: 'potion', name: 'Potion', icon: '🧪', category: 'Medicine', desc: 'A spray-type medicine for treating wounds. It restores 20 HP.', cost: 60 },
  { id: 'max_revive', name: 'Max Revive', icon: '💎', category: 'Medicine', desc: 'A medicine that revives a fainted Pokémon and fully restores its HP.', cost: 150 },
  { id: 'lucky_egg', name: 'Lucky Egg', icon: '🥚', category: 'Boosts', desc: 'Earns 2x XP for 30 minutes!', cost: 250 },
  { id: 'incense', name: 'Incense', icon: '💨', category: 'Boosts', desc: 'Attracts wild Pokémon to your location for 30 minutes.', cost: 200 },
];

export const PoGoItemBagScreen: React.FC<ItemBagScreenProps> = ({
  onClose,
}) => {
  const { inventory, addItem, consumeItem } = usePlayerPartyStore();
  const { pokeCoins } = useGameStore();

  const [selectedItem, setSelectedItem] = useState<typeof ITEM_DETAILS[0] | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const totalItems = inventory.reduce((sum, i) => sum + i.count, 0);

  const handleBuy = (item: typeof ITEM_DETAILS[0]) => {
    if (pokeCoins < item.cost) {
      setActionNotice('Not enough Poké Coins!');
      setTimeout(() => setActionNotice(null), 2500);
      return;
    }
    useGameStore.setState((s) => ({ pokeCoins: s.pokeCoins - item.cost }));
    addItem(item.id, 5);
    setActionNotice(`Bought 5x ${item.name}!`);
    confetti({ particleCount: 30, spread: 50 });
    setTimeout(() => setActionNotice(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-[900] bg-slate-950 flex flex-col justify-between p-4 md:p-6 select-none animate-fade">
      {/* Header with Bag Capacity */}
      <div className="max-w-md w-full mx-auto space-y-3 z-10">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider">
              Item Storage
            </span>
            <h2 className="text-2xl font-black text-white">
              {totalItems} / 350
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-900 px-3 py-1.5 rounded-full border border-white/10 text-xs font-black text-amber-400">
              {pokeCoins} Coins
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-slate-900 hover:bg-slate-800 border border-white/20 text-white flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all"
            style={{ width: `${Math.min(100, Math.round((totalItems / 350) * 100))}%` }}
          />
        </div>
      </div>

      {actionNotice && (
        <div className="max-w-md w-full mx-auto bg-gradient-to-r from-emerald-600 to-teal-600 text-slate-950 font-black px-4 py-2 rounded-2xl text-xs text-center shadow-lg animate-bounce z-20">
          {actionNotice}
        </div>
      )}

      {/* Item List Grid */}
      <div className="max-w-md w-full mx-auto flex-1 overflow-y-auto my-3 space-y-2.5 pr-1">
        {ITEM_DETAILS.map((item) => {
          const count = inventory.find((i) => i.id === item.id)?.count || 0;
          return (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer transition-all shadow-md"
            >
              <div className="flex items-center gap-3.5">
                <div className="text-3xl">{item.icon}</div>
                <div>
                  <div className="text-xs font-black text-white">{item.name}</div>
                  <div className="text-[10px] text-slate-400">{item.desc}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-black text-cyan-300 font-mono">
                  x{count}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[1000] bg-black/75 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl animate-scale">
            <div className="text-5xl">{selectedItem.icon}</div>
            <div>
              <h3 className="text-xl font-black text-white">{selectedItem.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{selectedItem.desc}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleBuy(selectedItem)}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-lg"
              >
                Buy 5x ({selectedItem.cost} Coins)
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-3 rounded-2xl bg-slate-950 text-slate-300 text-xs font-black"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Close */}
      <div className="max-w-md w-full mx-auto flex justify-center pt-2">
        <button
          onClick={onClose}
          className="w-12 h-12 rounded-full bg-slate-900 hover:bg-slate-800 border border-white/20 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
