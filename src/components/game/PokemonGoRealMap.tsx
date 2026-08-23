/**
 * Pokémon 3D RPG — Pokémon GO Real-World Map with 3D Street View, Atmospheric Lighting & Buddy Engine
 * 
 * Features:
 * - 3D Isometric Perspective Street View (Tilted 45° Camera Angle).
 * - Real-Time Dynamic Day / Dusk / Night Atmospheric Lighting.
 * - Dual-Ring Pulsing Radar Scanner (40m Interaction + 80m Vision).
 * - 3D Buddy Companion Locomotion & Feed Happiness.
 * - Team GO Rocket Invasions & Shadow Battles.
 * - "Oh?" Egg Hatching Cinematic Integration.
 * - Speed Safety Limit Warning ("I'm a Passenger").
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import confetti from 'canvas-confetti';
import { useRealWorldStore, NAGPUR_HOTSPOTS, RealWorldSpawn } from '../../state/useRealWorldStore';
import { useGameStore } from '../../state/useGameStore';
import { usePlayerPartyStore } from '../../state/usePlayerPartyStore';
import { getPokemonAnimated, getPokemonIcon } from '../../data/pokemon/images';
import { getPokemonById } from '../../data/pokemon';
import { createRuntimePokemon } from '../../battle/RuntimePokemon';
import { POKEMON_TYPE_THEMES } from '../../data/pokemon/types';
import { EggHatchingCinematic } from './EggHatchingCinematic';
import {
  MapPin,
  Sparkles,
  Sun,
  CloudRain,
  Cloud,
  Wind,
  Disc,
  Swords,
  Crosshair,
  Compass,
  Star,
  RefreshCw,
  Zap,
  Map as MapIcon,
  Flame,
  Droplets,
  Trophy,
  Heart,
  Skull,
  Layers,
  Eye,
  AlertTriangle
} from 'lucide-react';

export const PokemonGoRealMap: React.FC = () => {
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
    windSpeedKmh,
    speedKmh,
    isDrivingSpeed,
    is3DViewTilted,
    boostedTypes,
    spawns,
    isLoadingWeather,
    activeHatchingEgg,
    setPlayerLocation,
    toggle3DViewTilted,
    dismissDrivingWarning,
    triggerEggHatch,
    clearHatchedEgg,
    fetchLiveWeather,
    generateSpawnsAroundPlayer,
  } = useRealWorldStore();

  const { startEncounter, stardust, pokeCoins, playerLevel, playerExp, playerExpToNextLevel } =
    useGameStore();
  const { party, buddyInstanceId, buddyHearts, buddyDistanceKm, feedBuddy, progressWalkDistance, addItem } =
    usePlayerPartyStore();

  const activeBuddy = party.find((p) => p.instanceId === buddyInstanceId) || party[0];

  const [selectedSpawn, setSelectedSpawn] = useState<RealWorldSpawn | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<typeof NAGPUR_HOTSPOTS[0] | null>(null);
  const [hotspotRewardMsg, setHotspotRewardMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchLiveWeather();
  }, [fetchLiveWeather]);

  // Initialize Leaflet Real-World Map
  useEffect(() => {
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
  }, []);

  // Update Player, Buddy & Dual Radar Circles
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.panTo([playerLat, playerLng], { animate: true, duration: 0.6 });

    // Player Marker with Heading Direction Arrow
    const playerHtml = `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 select-none" style="transform: rotate(${playerHeading}deg)">
        <div class="w-11 h-11 rounded-full bg-emerald-500/30 border-2 border-emerald-400 animate-ping absolute"></div>
        <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 border-2 border-white shadow-xl flex items-center justify-center text-slate-950 font-black text-[11px]">
          ▲
        </div>
      </div>
    `;

    const playerIcon = L.divIcon({
      className: 'custom-player-marker',
      html: playerHtml,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    if (playerMarkerRef.current) {
      playerMarkerRef.current.setLatLng([playerLat, playerLng]);
      playerMarkerRef.current.setIcon(playerIcon);
    } else {
      playerMarkerRef.current = L.marker([playerLat, playerLng], { icon: playerIcon }).addTo(map);
    }

    // Buddy Companion Marker
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

    // Inner 40m Interaction Radar Circle
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

    // Outer 80m Vision Radar Circle
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
  }, [playerLat, playerLng, playerHeading, activeBuddy, buddyHearts]);

  // Render Landmarks & Spawns
  useEffect(() => {
    const markersLayer = markersLayerRef.current;
    if (!markersLayer) return;

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
            ${isRocket ? '💀 ROCKET INVASION' : isGym ? '⚔️ UNITE GYM' : '🔷 POKÉSTOP'}
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
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const m = L.marker([spot.lat, spot.lng], { icon: spotIcon });
      m.on('click', () => setSelectedHotspot(spot));
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
            ${
              spawn.isWeatherBoosted
                ? `<div class="absolute w-12 h-12 rounded-full blur-md opacity-70 animate-pulse" style="background-color: ${theme.primaryColor}"></div>`
                : ''
            }
            <img
              src="${getPokemonAnimated(spawn.dex)}"
              alt="${spawn.name}"
              class="w-14 h-14 object-contain drop-shadow-2xl animate-float"
              onerror="this.src='${getPokemonIcon(spawn.dex)}'"
            />
          </div>
        </div>
      `;

      const spawnIcon = L.divIcon({
        className: 'wild-spawn-marker',
        html: spawnHtml,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      const marker = L.marker([spawn.lat, spawn.lng], { icon: spawnIcon });
      marker.on('click', () => setSelectedSpawn(spawn));
      markersLayer.addLayer(marker);
    });
  }, [spawns]);

  const handleVirtualWalk = (dLat: number, dLng: number) => {
    setPlayerLocation(playerLat + dLat * 0.0006, playerLng + dLng * 0.0006);
    const res = progressWalkDistance(0.08);
    if (res.hatchedEggs.length > 0) {
      triggerEggHatch(res.hatchedEggs[0].targetKm, res.hatchedEggs[0].speciesId);
    }
  };

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

  const launchEncounter = (mode: 'CAPTURE' | 'BATTLE_UNITE', isShadow = false) => {
    if (!selectedSpawn && !selectedHotspot) return;
    const speciesId = selectedSpawn ? selectedSpawn.speciesId : (selectedHotspot?.shadowSpeciesId || 'larvitar');
    const species = getPokemonById(speciesId);
    if (!species) return;

    const runtimeWild = createRuntimePokemon(species, 20, true);
    if (isShadow) runtimeWild.isShadow = true;

    startEncounter(runtimeWild, mode);
  };

  const handleSpinHotspot = () => {
    if (!selectedHotspot) return;
    addItem('poke_ball', 4);
    addItem('great_ball', 2);
    addItem('razz_berry', 2);
    useGameStore.setState((s) => ({ stardust: s.stardust + 200 }));
    setHotspotRewardMsg(`Collected +4 Poké Balls, +2 Great Balls, +2 Razz Berries & 200 Stardust!`);
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
  };

  return (
    <div className="w-full h-full min-h-[640px] relative select-none overflow-hidden rounded-3xl border border-slate-800 shadow-2xl bg-slate-950">
      {/* "Oh?" Egg Hatching Cinematic Modal */}
      {activeHatchingEgg && (
        <EggHatchingCinematic
          targetKm={activeHatchingEgg.targetKm}
          speciesId={activeHatchingEgg.speciesId}
          onComplete={clearHatchedEgg}
        />
      )}

      {/* Speed Warning Modal */}
      {isDrivingSpeed && (
        <div className="fixed inset-0 z-[1200] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 select-none">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl animate-scale">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-white">You're going too fast!</h3>
            <p className="text-xs text-slate-400">
              Pokémon GO shouldn't be played while driving. Please be aware of your surroundings.
            </p>
            <button
              onClick={dismissDrivingWarning}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition-all uppercase"
            >
              I'M A PASSENGER
            </button>
          </div>
        </div>
      )}

      {/* Top Floating Glass HUD */}
      <div className="absolute top-4 left-4 right-4 z-[500] flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/95 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 shadow-2xl pointer-events-auto">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <select
            value={selectedHotspot?.id || 'custom'}
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

        {/* Real-Time Sky Atmosphere & Weather Boost Pill */}
        <div className="flex items-center gap-3 bg-slate-900/95 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 shadow-2xl pointer-events-auto">
          <div className="flex items-center gap-2">
            {timeOfDay === 'NIGHT' && <span className="text-xs">🌙</span>}
            {timeOfDay === 'DUSK' && <span className="text-xs">🌅</span>}
            {timeOfDay === 'DAY' && <span className="text-xs">☀️</span>}
            <span className="text-xs font-black text-white font-mono">{temperatureCelsius}°C</span>
          </div>

          <div className="w-[1px] h-4 bg-white/10" />

          <div className="flex items-center gap-1.5 text-[11px] font-black text-amber-300">
            <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
            <span>Weather Boost:</span>
            <div className="flex gap-1">
              {boostedTypes.map((t) => (
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

      {/* 3D Perspective Map Viewport Container */}
      <div
        className={`w-full h-[640px] z-0 transition-transform duration-500 ease-out origin-bottom ${
          is3DViewTilted ? 'perspective-street-view' : ''
        }`}
        style={{
          transform: is3DViewTilted ? 'perspective(900px) rotateX(32deg) scale(1.08)' : 'none',
        }}
      >
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Day / Dusk / Night Atmospheric Lighting Overlays */}
      {timeOfDay === 'NIGHT' && (
        <div className="absolute inset-0 pointer-events-none bg-indigo-950/20 z-10" />
      )}
      {timeOfDay === 'DUSK' && (
        <div className="absolute inset-0 pointer-events-none bg-amber-600/10 z-10" />
      )}
      {weatherCondition === 'RAIN' && (
        <div className="absolute inset-0 pointer-events-none bg-sky-950/20 z-10 animate-pulse" />
      )}

      {/* Bottom Controls: 3D Perspective Toggle, Live GPS & Virtual Walking Joystick */}
      <div className="absolute bottom-6 left-6 z-[500] flex items-end gap-3 pointer-events-auto">
        <div className="bg-slate-900/95 backdrop-blur-xl p-3 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center gap-1">
          <button
            onClick={() => handleVirtualWalk(1, 0)}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 font-black text-xs flex items-center justify-center transition"
          >
            ▲
          </button>
          <div className="flex gap-1">
            <button
              onClick={() => handleVirtualWalk(0, -1)}
              className="w-9 h-9 rounded-full bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 font-black text-xs flex items-center justify-center transition"
            >
              ◀
            </button>
            <button
              onClick={() => handleVirtualWalk(-1, 0)}
              className="w-9 h-9 rounded-full bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 font-black text-xs flex items-center justify-center transition"
            >
              ▼
            </button>
            <button
              onClick={() => handleVirtualWalk(0, 1)}
              className="w-9 h-9 rounded-full bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 font-black text-xs flex items-center justify-center transition"
            >
              ▶
            </button>
          </div>
        </div>

        {/* 3D Isometric Street View Toggle */}
        <button
          onClick={toggle3DViewTilted}
          className={`p-3.5 rounded-2xl border text-xs font-black flex items-center gap-2 transition-all ${
            is3DViewTilted
              ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/25'
              : 'bg-slate-900/95 text-slate-300 border-white/10 hover:text-white'
          }`}
          title="Toggle 3D Street Perspective View"
        >
          <Eye className="w-4 h-4" />
          <span>{is3DViewTilted ? '3D Street' : '2D Top'}</span>
        </button>

        {/* Live Device GPS Locator Button */}
        <button
          onClick={handleLiveGpsLocate}
          className="p-3.5 bg-slate-900/95 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 rounded-2xl border border-white/10 shadow-2xl text-xs font-black flex items-center gap-2 transition-all"
        >
          <Crosshair className="w-4 h-4" />
          <span>My GPS</span>
        </button>

        {/* Buddy Companion Profile Pill */}
        {activeBuddy && (
          <button
            onClick={() => {
              feedBuddy();
              confetti({ particleCount: 30, spread: 50 });
            }}
            className="p-3 bg-slate-900/95 hover:bg-slate-800 text-slate-200 rounded-2xl border border-pink-500/30 shadow-2xl text-xs font-black flex items-center gap-2 transition-all"
          >
            <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
            <span>Feed ({buddyHearts}❤️)</span>
          </button>
        )}
      </div>

      {/* Wild Pokémon Encounter Modal */}
      {selectedSpawn && (
        <div className="absolute inset-0 z-[600] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl text-center relative animate-scale">
            <button
              onClick={() => setSelectedSpawn(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xs font-black"
            >
              ✕
            </button>

            <div>
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-black uppercase text-emerald-400">
                {selectedSpawn.isWeatherBoosted && (
                  <span className="text-amber-400 flex items-center gap-0.5">
                    <Sparkles className="w-3 h-3" /> WEATHER BOOSTED (+25% STARDUST)
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-black text-white mt-1">{selectedSpawn.name}</h3>
              <div className="text-sm font-black text-amber-400 font-mono">CP {selectedSpawn.cp}</div>
            </div>

            <div className="flex items-center justify-center py-2">
              <img
                src={getPokemonAnimated(selectedSpawn.dex)}
                alt={selectedSpawn.name}
                className="w-36 h-36 object-contain drop-shadow-2xl animate-float"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => launchEncounter('CAPTURE')}
                className="px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/25 transition-all"
              >
                <Disc className="w-4 h-4" />
                <span>Catch (GO)</span>
              </button>

              <button
                onClick={() => launchEncounter('BATTLE_UNITE')}
                className="px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-purple-500/25 transition-all"
              >
                <Swords className="w-4 h-4" />
                <span>Battle (UNITE)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nagpur Landmark / Team Rocket Invasion Modal */}
      {selectedHotspot && (
        <div className="absolute inset-0 z-[600] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl text-center relative animate-scale">
            <button
              onClick={() => {
                setSelectedHotspot(null);
                setHotspotRewardMsg(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xs font-black"
            >
              ✕
            </button>

            <div>
              <span className={`text-[10px] font-black uppercase tracking-wider ${selectedHotspot.isRocketInvaded ? 'text-rose-400' : 'text-cyan-400'}`}>
                {selectedHotspot.isRocketInvaded ? '⚠️ Team GO Rocket Invaded Landmark' : selectedHotspot.category === 'GYM_UNITE' ? 'Nagpur UNITE Gym Arena' : 'Nagpur PokéStop'}
              </span>
              <h3 className="text-xl font-black text-white mt-1">{selectedHotspot.name}</h3>
              <p className="text-xs text-slate-400 mt-1 italic">{selectedHotspot.description}</p>
            </div>

            {selectedHotspot.isRocketInvaded ? (
              <div className="space-y-4">
                <div className="bg-rose-950/60 border border-rose-600/50 p-4 rounded-2xl text-xs space-y-1 text-center">
                  <Skull className="w-8 h-8 text-rose-500 mx-auto animate-pulse" />
                  <div className="font-black text-white">{selectedHotspot.rocketGrunt}</div>
                  <p className="text-slate-300">"Prepare for trouble! Defeat me to rescue the Shadow Pokémon!"</p>
                </div>

                <button
                  onClick={() => launchEncounter('BATTLE_UNITE', true)}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 text-white font-black text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Swords className="w-4 h-4" />
                  <span>BATTLE ROCKET GRUNT</span>
                </button>
              </div>
            ) : (
              <div>
                {hotspotRewardMsg ? (
                  <div className="bg-emerald-500/20 text-emerald-300 p-3 rounded-2xl border border-emerald-500/40 text-xs font-bold animate-bounce">
                    {hotspotRewardMsg}
                  </div>
                ) : (
                  <div className="py-3 flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 border-4 border-white flex items-center justify-center shadow-2xl animate-spin-slow">
                      <Disc className="w-12 h-12 text-white" />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSpinHotspot}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-black text-xs shadow-lg shadow-cyan-500/25 transition-all mt-2"
                >
                  SPIN PHOTO DISC FOR REWARDS
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
