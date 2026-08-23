/**
 * Pokémon 3D RPG — Pokémon GO 3D Poké Ball Throwing, Curveball & Shadow Encounter
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../../state/useGameStore';
import { usePlayerPartyStore } from '../../state/usePlayerPartyStore';
import { getPokemonAnimated, getPokemonArtwork } from '../../data/pokemon/images';
import { getPokemonById } from '../../data/pokemon';
import { POKEMON_TYPE_THEMES } from '../../data/pokemon/types';
import {
  Heart,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  RotateCw,
  Flame
} from 'lucide-react';

export const PokemonGoCapture3D: React.FC = () => {
  const { activeEncounterPokemon, endEncounter, addStardust, addExp } = useGameStore();
  const { addCapturedPokemon, inventory, consumeItem } = usePlayerPartyStore();

  const pokemon = activeEncounterPokemon;
  if (!pokemon) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>No active wild encounter found.</p>
        <button onClick={endEncounter} className="mt-4 px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl">
          Return to Map
        </button>
      </div>
    );
  }

  const species = getPokemonById(pokemon.speciesId);
  const dexNumber = species?.nationalDexNumber || 25;
  const primaryType = species?.primaryType || 'Normal';
  const isShadow = Boolean(pokemon.isShadow);

  // Ball Throwing State
  const [selectedBall, setSelectedBall] = useState<'poke_ball' | 'great_ball' | 'ultra_ball'>('poke_ball');
  const [ballStage, setBallStage] = useState<'IDLE' | 'THROWN' | 'HIT' | 'SHAKE_1' | 'SHAKE_2' | 'SHAKE_3' | 'CAUGHT' | 'BREAKOUT'>('IDLE');
  const [targetRingSize, setTargetRingSize] = useState<number>(100);
  const [activeBerry, setActiveBerry] = useState<'NONE' | 'RAZZ' | 'NANAB' | 'PINAP' | 'GOLDEN_RAZZ'>('NONE');
  const [isCurveball, setIsCurveball] = useState<boolean>(false);
  const [throwQuality, setThrowQuality] = useState<string | null>(null);
  const [rewardData, setRewardData] = useState<{ stardust: number; candy: number; exp: number } | null>(null);

  // Ball drag coordinates
  const [ballPos, setBallPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingBall, setIsDraggingBall] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Contracting Target Ring Animation
  useEffect(() => {
    if (ballStage !== 'IDLE') return;
    const interval = setInterval(() => {
      setTargetRingSize((prev) => (prev <= 20 ? 100 : prev - 2));
    }, 24);
    return () => clearInterval(interval);
  }, [ballStage]);

  // Inventory counts
  const pokeBallCount = inventory.find((i) => i.id === 'poke_ball')?.count || 0;
  const greatBallCount = inventory.find((i) => i.id === 'great_ball')?.count || 0;
  const ultraBallCount = inventory.find((i) => i.id === 'ultra_ball')?.count || 0;
  const razzBerryCount = inventory.find((i) => i.id === 'razz_berry')?.count || 5;
  const pinapBerryCount = inventory.find((i) => i.id === 'pinap_berry')?.count || 3;
  const nanabBerryCount = inventory.find((i) => i.id === 'nanab_berry')?.count || 3;

  // Handle Berry Feeding
  const handleFeedBerry = (berry: 'RAZZ' | 'NANAB' | 'PINAP' | 'GOLDEN_RAZZ') => {
    if (activeBerry !== 'NONE') return;
    setActiveBerry(berry);
    confetti({ particleCount: 35, spread: 50, origin: { y: 0.4 }, colors: ['#f43f5e', '#fbbf24', '#38bdf8'] });
  };

  // Ball Touch / Drag Start
  const handleBallMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (ballStage !== 'IDLE') return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setIsDraggingBall(true);
    dragStartRef.current = { x: clientX, y: clientY };
    lastPosRef.current = { x: clientX, y: clientY };
  };

  const handleBallMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDraggingBall) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaX = clientX - dragStartRef.current.x;
    const deltaY = clientY - dragStartRef.current.y;

    // Detect Curveball circular spin speed
    const speedX = Math.abs(clientX - lastPosRef.current.x);
    if (speedX > 15) {
      setIsCurveball(true);
    }

    lastPosRef.current = { x: clientX, y: clientY };
    setBallPos({ x: deltaX, y: deltaY });
  };

  const handleBallMouseUp = () => {
    if (!isDraggingBall) return;
    setIsDraggingBall(false);

    if (ballPos.y < -50) {
      executeThrow();
    } else {
      setBallPos({ x: 0, y: 0 });
      setIsCurveball(false);
    }
  };

  const executeThrow = () => {
    consumeItem(selectedBall);

    let quality = isCurveball ? 'Curveball! Nice Throw!' : 'Nice Throw!';
    let qualityMultiplier = 1.15;
    if (targetRingSize < 40) {
      quality = isCurveball ? 'Curveball! Excellent Throw!' : 'Excellent Throw!';
      qualityMultiplier = 1.85;
    } else if (targetRingSize < 70) {
      quality = isCurveball ? 'Curveball! Great Throw!' : 'Great Throw!';
      qualityMultiplier = 1.45;
    }
    setThrowQuality(quality);
    setBallStage('THROWN');

    const ballMult = selectedBall === 'ultra_ball' ? 2.0 : selectedBall === 'great_ball' ? 1.5 : 1.0;
    const berryMult = activeBerry === 'GOLDEN_RAZZ' ? 2.5 : activeBerry === 'RAZZ' ? 1.5 : 1.0;
    const curveMult = isCurveball ? 1.7 : 1.0;
    const catchRate = pokemon.calculatedStats.hp > 0 ? (120 / pokemon.calculatedStats.hp) : 1.0;
    const finalCatchChance = Math.min(0.95, 0.40 * ballMult * berryMult * curveMult * qualityMultiplier * catchRate);

    setTimeout(() => {
      setBallStage('HIT');

      setTimeout(() => {
        setBallStage('SHAKE_1');

        setTimeout(() => {
          setBallStage('SHAKE_2');

          setTimeout(() => {
            const isCaught = Math.random() < finalCatchChance;

            if (isCaught) {
              setBallStage('SHAKE_3');
              setTimeout(() => {
                setBallStage('CAUGHT');
                addCapturedPokemon(pokemon);
                const candyReward = activeBerry === 'PINAP' ? 6 : 3;
                const stardustReward = isShadow ? 500 : 100;
                addStardust(stardustReward);
                addExp(150);
                setRewardData({ stardust: stardustReward, candy: candyReward, exp: 150 });
                confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
              }, 600);
            } else {
              setBallStage('BREAKOUT');
              setTimeout(() => {
                setBallStage('IDLE');
                setBallPos({ x: 0, y: 0 });
                setThrowQuality(null);
                setActiveBerry('NONE');
                setIsCurveball(false);
              }, 1200);
            }
          }, 800);
        }, 800);
      }, 800);
    }, 600);
  };

  const theme = POKEMON_TYPE_THEMES[primaryType] || POKEMON_TYPE_THEMES.Normal;

  return (
    <div
      className={`w-full h-full min-h-[620px] relative select-none overflow-hidden rounded-3xl border border-slate-800 shadow-2xl flex flex-col justify-between p-6 ${
        isShadow
          ? 'bg-gradient-to-b from-purple-950 via-slate-950 to-slate-950'
          : 'bg-gradient-to-b from-slate-950 via-emerald-950/30 to-slate-950'
      }`}
      onMouseMove={handleBallMouseMove}
      onMouseUp={handleBallMouseUp}
      onTouchMove={handleBallMouseMove}
      onTouchEnd={handleBallMouseUp}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between z-20">
        <button
          onClick={endEncounter}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-white/10 text-xs font-black text-slate-300 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Flee</span>
        </button>

        {/* Pokemon Info */}
        <div className="bg-slate-900/90 backdrop-blur-xl px-5 py-2 rounded-2xl border border-white/10 text-center shadow-xl">
          <div className={`text-[10px] font-black uppercase tracking-widest ${isShadow ? 'text-purple-400' : 'text-emerald-400'}`}>
            {isShadow ? '💀 Team GO Rocket Shadow Encounter' : 'Wild Encounter'}
          </div>
          <div className="text-xl font-black text-white">{pokemon.name}</div>
          <div className="text-xs font-black text-amber-400 font-mono">CP {Math.floor(pokemon.calculatedStats.hp * 12 + pokemon.level * 40)}</div>
        </div>

        {/* Berry Drawer Quick Pill */}
        <div className="flex gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl border border-white/10">
          <button
            onClick={() => handleFeedBerry('RAZZ')}
            disabled={activeBerry !== 'NONE'}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1 transition ${
              activeBerry === 'RAZZ' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Razz ({razzBerryCount})</span>
          </button>
          <button
            onClick={() => handleFeedBerry('PINAP')}
            disabled={activeBerry !== 'NONE'}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1 transition ${
              activeBerry === 'PINAP' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Pinap 2x ({pinapBerryCount})</span>
          </button>
        </div>
      </div>

      {/* Center 3D Encounter Stage */}
      <div className="relative flex-1 flex flex-col items-center justify-center">
        {/* Dynamic Background Glow / Purple Shadow Aura */}
        <div
          className={`absolute w-80 h-80 rounded-full blur-[100px] pointer-events-none ${
            isShadow ? 'bg-purple-600/40 animate-pulse' : 'opacity-30'
          }`}
          style={{ backgroundColor: isShadow ? undefined : theme.primaryColor }}
        />

        {/* Contracting Target Ring */}
        {ballStage === 'IDLE' && (
          <div
            className="absolute rounded-full border-2 border-emerald-400 pointer-events-none transition-all duration-75 flex items-center justify-center"
            style={{
              width: `${targetRingSize * 2.2}px`,
              height: `${targetRingSize * 2.2}px`,
              borderColor: targetRingSize < 40 ? '#ef4444' : targetRingSize < 70 ? '#f59e0b' : '#10b981',
            }}
          >
            <div className="w-full h-full rounded-full border border-white/40" />
          </div>
        )}

        {/* Throw Quality Popup */}
        {throwQuality && ballStage !== 'IDLE' && ballStage !== 'CAUGHT' && (
          <div className="absolute top-10 bg-slate-950/90 text-amber-300 px-5 py-1.5 rounded-full text-xs font-black border border-amber-400/40 animate-bounce shadow-xl">
            {throwQuality}
          </div>
        )}

        {/* Wild Pokémon / Shadow Pokémon */}
        {ballStage === 'IDLE' || ballStage === 'THROWN' || ballStage === 'BREAKOUT' ? (
          <div className="relative z-10 flex flex-col items-center animate-float">
            {/* Shadow Dark Fire Particles */}
            {isShadow && (
              <div className="absolute -inset-4 bg-gradient-to-t from-purple-700/30 to-transparent rounded-full blur-xl animate-pulse pointer-events-none" />
            )}

            <img
              src={getPokemonAnimated(dexNumber)}
              alt={pokemon.name}
              className={`w-64 h-64 object-contain drop-shadow-2xl transition-all duration-300 ${
                ballStage === 'THROWN' ? 'scale-90 brightness-150' : 'scale-100'
              } ${isShadow ? 'filter drop-shadow-[0_0_25px_rgba(168,85,247,0.8)] hue-rotate-15' : ''}`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = getPokemonArtwork(dexNumber);
              }}
            />
            <div className="w-48 h-8 bg-black/50 rounded-full blur-md" />
          </div>
        ) : (
          <div className="relative z-10 flex flex-col items-center">
            <div
              className={`w-16 h-16 rounded-full bg-gradient-to-b from-red-500 via-red-500 to-white border-2 border-slate-900 shadow-2xl flex items-center justify-center transition-transform duration-300 ${
                ballStage === 'SHAKE_1'
                  ? 'rotate-12 translate-x-3'
                  : ballStage === 'SHAKE_2'
                  ? '-rotate-12 -translate-x-3'
                  : ballStage === 'SHAKE_3'
                  ? 'rotate-6'
                  : ballStage === 'CAUGHT'
                  ? 'scale-110 shadow-emerald-500/50'
                  : ''
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white border-2 border-slate-900 flex items-center justify-center">
                <div className={`w-2 h-2 rounded-full ${ballStage === 'CAUGHT' ? 'bg-emerald-400 animate-ping' : 'bg-red-500'}`} />
              </div>
            </div>
            <div className="w-24 h-4 bg-black/60 rounded-full blur-sm mt-1" />

            <div className="text-xs font-black text-slate-300 mt-4 font-mono">
              {ballStage === 'SHAKE_1' && 'Shake 1...'}
              {ballStage === 'SHAKE_2' && 'Shake 2...'}
              {ballStage === 'SHAKE_3' && 'Shake 3...'}
              {ballStage === 'CAUGHT' && '✨ Gotcha! ✨'}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Ball Throw Area & Ball Switcher */}
      {ballStage === 'IDLE' ? (
        <div className="flex flex-col items-center gap-4 z-20">
          <div className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
            {isCurveball ? (
              <span className="text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Curveball Spin Active (1.7x Catch Rate)
              </span>
            ) : (
              <span>Spin in circle for Curveball • Flick Upward to Throw</span>
            )}
          </div>

          {/* Interactive Draggable Poké Ball */}
          <div
            className={`w-20 h-20 rounded-full bg-gradient-to-b from-red-500 via-red-500 to-white border-4 border-slate-950 shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${
              isCurveball ? 'animate-spin-slow ring-4 ring-amber-400/80 shadow-amber-500/50' : ''
            }`}
            style={{
              transform: `translate(${ballPos.x}px, ${ballPos.y}px)`,
            }}
            onMouseDown={handleBallMouseDown}
            onTouchStart={handleBallMouseDown}
          >
            <div className="w-6 h-6 rounded-full bg-white border-2 border-slate-950 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950" />
            </div>
          </div>

          {/* Ball Selector Pills */}
          <div className="flex gap-2 bg-slate-900/90 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-2xl">
            <button
              onClick={() => setSelectedBall('poke_ball')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition ${
                selectedBall === 'poke_ball' ? 'bg-red-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Poké Ball ({pokeBallCount})</span>
            </button>
            <button
              onClick={() => setSelectedBall('great_ball')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition ${
                selectedBall === 'great_ball' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Great Ball ({greatBallCount})</span>
            </button>
            <button
              onClick={() => setSelectedBall('ultra_ball')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition ${
                selectedBall === 'ultra_ball' ? 'bg-amber-400 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Ultra Ball ({ultraBallCount})</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Victory Reward Modal */}
      {ballStage === 'CAUGHT' && rewardData && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-center space-y-5 shadow-2xl animate-scale">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">
                {isShadow ? 'Shadow Pokémon Rescued!' : 'Capture Successful'}
              </span>
              <h3 className="text-2xl font-black text-white">{pokemon.name} Caught!</h3>
              <p className="text-xs text-slate-400 mt-1">
                {isShadow ? 'Purify in your Party Roster to boost stats!' : 'Added to your active Pokémon Party'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs font-black">
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Stardust</div>
                <div className="text-purple-300 font-mono">+{rewardData.stardust}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Candy</div>
                <div className="text-amber-300 font-mono">+{rewardData.candy}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase">EXP</div>
                <div className="text-emerald-300 font-mono">+{rewardData.exp}</div>
              </div>
            </div>

            <button
              onClick={endEncounter}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition-all"
            >
              CONTINUE TO OVERWORLD
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
