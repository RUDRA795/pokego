/**
 * Pokémon 3D RPG — 100% Authentic Pokémon GO Overworld Map with Premium 3D World Engine
 * 
 * Modes:
 * - 3D WORLD (Primary): Living third-person 3D world with Trainer avatar, walking buddy,
 *   3D wild Pokémon entities with wander AI & shadows, dynamic lighting, weather particles,
 *   and interactive 3D PokéStops & Gym towers.
 * - 2D MAP (Tactical): Fullscreen Leaflet map for strategic overview and landmark navigation.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import confetti from 'canvas-confetti';
import { useRealWorldStore, NAGPUR_HOTSPOTS, RealWorldSpawn, NagpurHotspot } from '../../state/useRealWorldStore';
import { useGameStore } from '../../state/useGameStore';
import { usePlayerPartyStore } from '../../state/usePlayerPartyStore';
import { getPokemonAnimated, getPokemonIcon } from '../../data/pokemon/images';
import { getPokemonById } from '../../data/pokemon';
import { createRuntimePokemon } from '../../battle/RuntimePokemon';
import { POKEMON_TYPE_THEMES } from '../../data/pokemon/types';
import { PoGoBottomNav } from './PoGoBottomNav';
import { PoGoMainMenuModal, PoGoScreenMode } from './PoGoMainMenuModal';
import { PoGoPokeStopScreen } from './PoGoPokeStopScreen';
import { PoGoTrainerProfileModal } from './PoGoTrainerProfileModal';
import { EggHatchingCinematic } from '../game/EggHatchingCinematic';
import { WorldScene } from '../../world/WorldScene';
import { JoystickInput } from '../../world/player/TrainerController';
import {
  MapPin,
  Sparkles,
  Crosshair,
  Eye,
  Layers,
  Compass,
} from 'lucide-react';

interface PoGoOverworldProps {
  onNavigateScreen: (screen: PoGoScreenMode) => void;
}

// Mobile Virtual Touch Joystick
const VirtualTouchJoystick: React.FC<{
  onMove: (input: JoystickInput | null) => void;
}> = ({ onMove }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState<boolean>(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsActive(true);
    updateKnob(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isActive) return;
    updateKnob(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    setIsActive(false);
    setKnobPos({ x: 0, y: 0 });
    onMove(null);
  };

  const updateKnob = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const maxRadius = 38;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    let clampedX = dx;
    let clampedY = dy;
    if (dist > maxRadius) {
      clampedX = (dx / dist) * maxRadius;
      clampedY = (dy / dist) * maxRadius;
    }

    setKnobPos({ x: clampedX, y: clampedY });
    onMove({
      x: clampedX / maxRadius,
      y: -clampedY / maxRadius, // Forward is +Y
    });
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="w-24 h-24 rounded-full bg-slate-900/80 backdrop-blur-xl border-2 border-white/20 shadow-2xl flex items-center justify-center touch-none select-none relative cursor-pointer"
    >
      {/* Direction indicators */}
      <span className="absolute top-1.5 text-[8px] font-black text-slate-400">▲</span>
      <span className="absolute bottom-1.5 text-[8px] font-black text-slate-400">▼</span>
      <span className="absolute left-1.5 text-[8px] font-black text-slate-400">◀</span>
      <span className="absolute right-1.5 text-[8px] font-black text-slate-400">▶</span>

      {/* Thumbstick Knob */}
      <div
        className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 border-2 border-white shadow-xl flex items-center justify-center transition-transform pointer-events-none"
        style={{
          transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
        }}
      >
        <div className="w-3 h-3 rounded-full bg-white/80" />
      </div>
    </div>
  );
};

export const PoGoOverworldMap: React.FC<PoGoOverworldProps> = ({
  onNavigateScreen,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const playerMarkerRef = useRef<L.Marker | null>(null);
  const buddyMarkerRef = useRef<L.Marker | null>(null);
  const innerRadarRef = useRef<L.Circle | null>(null);
  const outerRadarRef = useRef<L.Circle | null>(null);

  const {
    playerLat,
    playerLng,
    playerHeading,
    currentLocationName,
    weatherCondition,
    timeOfDay,
    temperatureCelsius,
    boostedTypes,
    spawns,
    activeHatchingEgg,
    setPlayerLocation,
    triggerEggHatch,
    clearHatchedEgg,
    fetchLiveWeather,
  } = useRealWorldStore();

  const { startEncounter } = useGameStore();
  const { party, buddyInstanceId, buddyHearts, progressWalkDistance } = usePlayerPartyStore();

  const activeBuddy = party.find((p) => p.instanceId === buddyInstanceId) || party[0];

  // View Mode: '3D_WORLD' (Primary) vs '2D_MAP'
  const [viewMode, setViewMode] = useState<'3D_WORLD' | '2D_MAP'>('3D_WORLD');

  // Virtual Joystick input
  const [joystickInput, setJoystickInput] = useState<JoystickInput | null>(null);

  // Modals state
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [activePokeStop, setActivePokeStop] = useState<NagpurHotspot | null>(null);

  useEffect(() => {
    fetchLiveWeather();
  }, [fetchLiveWeather]);

  // Handle Pokémon Selection from 3D World or 2D Map
  const handleSelectPokemon = useCallback((spawn: RealWorldSpawn) => {
    const species = getPokemonById(spawn.speciesId);
    if (species) {
      const runtime = createRuntimePokemon(species, 20, true);
      startEncounter(runtime, 'CAPTURE');
    }
  }, [startEncounter]);

  // Handle PokéStop Selection
  const handleSelectPokeStop = useCallback((hotspot: NagpurHotspot) => {
    setActivePokeStop(hotspot);
  }, []);

  // Initialize Leaflet 2D Map only when in 2D mode
  useEffect(() => {
    if (viewMode !== '2D_MAP') {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      return;
    }

    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [playerLat, playerLng],
      zoom: 16,
      minZoom: 13,
      maxZoom: 18,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors & CartoDB',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    map.on('click', (e: L.LeafletMouseEvent) => {
      setPlayerLocation(e.latlng.lat, e.latlng.lng);
      const res = progressWalkDistance(0.15);
      if (res.hatchedEggs.length > 0) {
        triggerEggHatch(res.hatchedEggs[0].targetKm, res.hatchedEggs[0].speciesId);
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [viewMode]);

  // Update Leaflet 2D Markers when in 2D mode
  useEffect(() => {
    if (viewMode !== '2D_MAP') return;
    const map = mapInstanceRef.current;
    if (!map) return;

    map.panTo([playerLat, playerLng], { animate: true, duration: 0.6 });

    const playerHtml = `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 select-none" style="transform: rotate(${playerHeading}deg)">
        <div class="w-12 h-12 rounded-full bg-emerald-500/30 border-2 border-emerald-400 animate-ping absolute"></div>
        <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 border-2 border-white shadow-2xl flex items-center justify-center text-slate-950 font-black text-xs">
          ▲
        </div>
      </div>
    `;

    const playerIcon = L.divIcon({
      className: 'custom-player-marker',
      html: playerHtml,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    if (playerMarkerRef.current) {
      playerMarkerRef.current.setLatLng([playerLat, playerLng]);
      playerMarkerRef.current.setIcon(playerIcon);
    } else {
      playerMarkerRef.current = L.marker([playerLat, playerLng], { icon: playerIcon }).addTo(map);
    }

    if (activeBuddy) {
      const buddySpecies = getPokemonById(activeBuddy.speciesId);
      const buddyDex = buddySpecies?.nationalDexNumber || 25;

      const buddyHtml = `
        <div class="cursor-pointer group flex flex-col items-center -translate-x-1/2 -translate-y-1/2 select-none">
          <div class="bg-slate-950/90 px-2 py-0.5 rounded-full border border-pink-500/50 text-[8px] font-black text-pink-300 shadow-md mb-0.5 flex items-center gap-0.5">
            <span>❤️ ${buddyHearts}</span>
          </div>
          <img
            src="${getPokemonAnimated(buddyDex)}"
            alt="${activeBuddy.name}"
            class="w-12 h-12 object-contain drop-shadow-xl animate-float"
            onerror="this.src='${getPokemonIcon(buddyDex)}'"
          />
        </div>
      `;

      const buddyIcon = L.divIcon({
        className: 'custom-buddy-marker',
        html: buddyHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const buddyLat = playerLat - 0.00035;
      const buddyLng = playerLng - 0.00035;

      if (buddyMarkerRef.current) {
        buddyMarkerRef.current.setLatLng([buddyLat, buddyLng]);
      } else {
        buddyMarkerRef.current = L.marker([buddyLat, buddyLng], { icon: buddyIcon }).addTo(map);
      }
    }

    // Inner 40m Radar
    if (innerRadarRef.current) {
      innerRadarRef.current.setLatLng([playerLat, playerLng]);
    } else {
      innerRadarRef.current = L.circle([playerLat, playerLng], {
        radius: 120,
        color: '#10b981',
        weight: 2,
        fillColor: '#10b981',
        fillOpacity: 0.12,
      }).addTo(map);
    }

    // Outer 80m Radar
    if (outerRadarRef.current) {
      outerRadarRef.current.setLatLng([playerLat, playerLng]);
    } else {
      outerRadarRef.current = L.circle([playerLat, playerLng], {
        radius: 350,
        color: '#38bdf8',
        weight: 1,
        dashArray: '4, 8',
        fillColor: '#0284c7',
        fillOpacity: 0.04,
      }).addTo(map);
    }

    // Render Landmarks & Spawns on 2D map
    const markersLayer = markersLayerRef.current;
    if (markersLayer) {
      markersLayer.clearLayers();

      NAGPUR_HOTSPOTS.forEach((spot) => {
        const isGym = spot.category === 'GYM_UNITE';
        const isRocket = Boolean(spot.isRocketInvaded);

        const spotHtml = `
          <div class="cursor-pointer group flex flex-col items-center -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125">
            <div class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-white shadow-lg mb-0.5 whitespace-nowrap ${
              isRocket
                ? 'bg-gradient-to-r from-red-600 via-rose-700 to-black animate-pulse border border-red-500'
                : isGym
                ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                : 'bg-gradient-to-r from-blue-600 to-cyan-500'
            }">
              ${isRocket ? '💀 ROCKET' : isGym ? '⚔️ GYM' : '🔷 POKÉSTOP'}
            </div>
            <div class="w-9 h-9 rounded-2xl flex items-center justify-center border-2 border-white shadow-2xl ${
              isRocket ? 'bg-black text-rose-400' : isGym ? 'bg-purple-900 text-pink-300' : 'bg-sky-900 text-cyan-300'
            }">
              ${isRocket ? '☠️' : isGym ? '🏆' : '🌀'}
            </div>
          </div>
        `;

        const spotIcon = L.divIcon({
          className: 'hotspot-marker',
          html: spotHtml,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const m = L.marker([spot.lat, spot.lng], { icon: spotIcon });
        m.on('click', () => handleSelectPokeStop(spot));
        markersLayer.addLayer(m);
      });

      spawns.forEach((spawn) => {
        const theme = (POKEMON_TYPE_THEMES as any)[spawn.primaryType] || POKEMON_TYPE_THEMES.Normal;
        const spawnHtml = `
          <div class="cursor-pointer group flex flex-col items-center -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125 select-none">
            <div class="bg-slate-950/90 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 text-[9px] font-black text-amber-300 shadow-md mb-0.5 flex items-center gap-0.5">
              ${spawn.isWeatherBoosted ? '<span class="text-amber-400">☀️</span>' : ''}
              <span>CP ${spawn.cp}</span>
            </div>
            <div class="relative flex items-center justify-center">
              <img
                src="${getPokemonAnimated(spawn.dex)}"
                alt="${spawn.name}"
                class="w-12 h-12 object-contain drop-shadow-2xl animate-float"
                onerror="this.src='${getPokemonIcon(spawn.dex)}'"
              />
            </div>
          </div>
        `;

        const spawnIcon = L.divIcon({
          className: 'wild-spawn-marker',
          html: spawnHtml,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const marker = L.marker([spawn.lat, spawn.lng], { icon: spawnIcon });
        marker.on('click', () => handleSelectPokemon(spawn));
        markersLayer.addLayer(marker);
      });
    }
  }, [viewMode, playerLat, playerLng, playerHeading, activeBuddy, buddyHearts, spawns, handleSelectPokemon, handleSelectPokeStop]);

  const handleLiveGpsLocate = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPlayerLocation(pos.coords.latitude, pos.coords.longitude, 'Live Device GPS Location');
          const res = progressWalkDistance(0.2);
          if (res.hatchedEggs.length > 0) {
            triggerEggHatch(res.hatchedEggs[0].targetKm, res.hatchedEggs[0].speciesId);
          }
          confetti({ particleCount: 40, spread: 60 });
        },
        () => {
          alert('Could not access live device GPS. Defaulting to Nagpur Zero Mile Stone.');
        }
      );
    }
  };

  return (
    <div className="w-full h-full min-h-[640px] relative select-none overflow-hidden rounded-3xl border border-slate-800 shadow-2xl bg-slate-950">
      {/* "Oh?" Egg Hatching Cinematic */}
      {activeHatchingEgg && (
        <EggHatchingCinematic
          targetKm={activeHatchingEgg.targetKm}
          speciesId={activeHatchingEgg.speciesId}
          onComplete={clearHatchedEgg}
        />
      )}

      {/* Main Menu Modal */}
      {isMenuOpen && (
        <PoGoMainMenuModal
          onClose={() => setIsMenuOpen(false)}
          onNavigate={(screen) => onNavigateScreen(screen)}
          onToggleSettings={() => {}}
        />
      )}

      {/* Trainer Profile Modal */}
      {isProfileOpen && (
        <PoGoTrainerProfileModal onClose={() => setIsProfileOpen(false)} />
      )}

      {/* PokéStop Photo Disc Screen */}
      {activePokeStop && (
        <PoGoPokeStopScreen
          hotspot={activePokeStop}
          onClose={() => setActivePokeStop(null)}
        />
      )}

      {/* Top Floating Glass HUD */}
      <div className="absolute top-4 left-4 right-4 z-[500] flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Real-World Location Selector */}
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-xl px-4 py-2 rounded-full border border-white/15 shadow-2xl pointer-events-auto">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <select
            value="custom"
            onChange={(e) => {
              const spot = NAGPUR_HOTSPOTS.find((s) => s.id === e.target.value);
              if (spot) {
                setPlayerLocation(spot.lat, spot.lng, spot.name);
              }
            }}
            className="bg-transparent text-xs font-black text-white focus:outline-none cursor-pointer"
          >
            <option value="custom" className="bg-slate-900 text-white">
              📍 {currentLocationName}
            </option>
            {NAGPUR_HOTSPOTS.map((s) => (
              <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                {s.isRocketInvaded ? '💀' : s.category === 'GYM_UNITE' ? '🏆' : '🔷'} {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Live Weather & Weather Boost Pill */}
        <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-xl px-4 py-2 rounded-full border border-white/15 shadow-2xl pointer-events-auto">
          <div className="flex items-center gap-1.5">
            {timeOfDay === 'NIGHT' && <span className="text-xs">🌙</span>}
            {timeOfDay === 'DUSK' && <span className="text-xs">🌅</span>}
            {timeOfDay === 'DAWN' && <span className="text-xs">🌄</span>}
            {timeOfDay === 'DAY' && <span className="text-xs">☀️</span>}
            <span className="text-xs font-black text-white font-mono">{temperatureCelsius}°C</span>
          </div>

          <div className="w-[1px] h-4 bg-white/15" />

          <div className="flex items-center gap-1 text-[11px] font-black text-amber-300">
            <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
            <div className="flex gap-1">
              {boostedTypes.slice(0, 2).map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase text-white shadow-sm"
                  style={{
                    backgroundColor: ((POKEMON_TYPE_THEMES as any)[t]?.primaryColor) || '#10b981',
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PRIMARY 3D OVERWORLD VIEWPORT */}
      {viewMode === '3D_WORLD' ? (
        <div className="w-full h-full min-h-[640px] absolute inset-0 z-0">
          <WorldScene
            joystickInput={joystickInput}
            onSelectPokemon={handleSelectPokemon}
            onSelectPokeStop={handleSelectPokeStop}
          />
        </div>
      ) : (
        /* 2D TACTICAL MAP VIEWPORT */
        <div className="w-full h-full min-h-[640px] absolute inset-0 z-0">
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>
      )}

      {/* Floating Action Controls (Bottom Left: Joystick, Bottom Right: Mode Switch & GPS) */}
      <div className="absolute bottom-24 left-4 z-[500] pointer-events-auto">
        {viewMode === '3D_WORLD' && (
          <VirtualTouchJoystick onMove={(input) => setJoystickInput(input)} />
        )}
      </div>

      <div className="absolute bottom-24 right-4 z-[500] flex flex-col items-end gap-2 pointer-events-auto">
        {/* 3D World / 2D Map Toggle */}
        <button
          onClick={() => setViewMode((prev) => (prev === '3D_WORLD' ? '2D_MAP' : '3D_WORLD'))}
          className={`px-3.5 py-2.5 rounded-2xl border text-xs font-black flex items-center gap-2 shadow-2xl transition-all ${
            viewMode === '3D_WORLD'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 border-emerald-300 shadow-emerald-500/30'
              : 'bg-slate-900/90 text-slate-200 border-white/20 hover:text-white'
          }`}
        >
          {viewMode === '3D_WORLD' ? <Eye className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
          <span>{viewMode === '3D_WORLD' ? '3D World' : '2D Map'}</span>
        </button>

        {/* Live GPS Locate */}
        <button
          onClick={handleLiveGpsLocate}
          className="p-2.5 bg-slate-900/90 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 rounded-2xl border border-white/20 shadow-2xl text-xs font-black flex items-center gap-1.5 transition-all"
        >
          <Crosshair className="w-4 h-4" />
          <span>My GPS</span>
        </button>
      </div>

      {/* Bottom Pokémon GO HUD Navigation */}
      <PoGoBottomNav
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenTrainerProfile={() => setIsProfileOpen(true)}
        onOpenNearby={() => {
          if (spawns.length > 0) {
            handleSelectPokemon(spawns[0]);
          }
        }}
      />
    </div>
  );
};
