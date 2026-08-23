/**
 * Pokémon 3D RPG — Real-World GPS, Nagpur Hotspots & Live Weather Engine
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PokemonType } from '../types/pokemon';

export type WeatherBoostCondition =
  | 'CLEAR_SUNNY'
  | 'RAIN'
  | 'PARTLY_CLOUDY'
  | 'CLOUDY'
  | 'WINDY'
  | 'FOG'
  | 'SNOW';

export type TimeOfDayPhase = 'DAWN' | 'DAY' | 'DUSK' | 'NIGHT';

export interface NagpurHotspot {
  id: string;
  name: string;
  category: 'POKESTOP' | 'GYM_UNITE';
  lat: number;
  lng: number;
  biome: 'WATER' | 'HISTORIC_STEEL' | 'SACRED_PSYCHIC' | 'FOREST' | 'PARK' | 'CITY_CENTER';
  bossSpeciesId?: string;
  description: string;
  isRocketInvaded?: boolean;
  rocketGrunt?: string;
  shadowSpeciesId?: string;
}

export const NAGPUR_HOTSPOTS: NagpurHotspot[] = [
  {
    id: 'zero-mile',
    name: 'Zero Mile Stone Nagpur',
    category: 'POKESTOP',
    lat: 21.1458,
    lng: 79.0882,
    biome: 'CITY_CENTER',
    description: 'The geographical center point of India and historic landmark.',
  },
  {
    id: 'futala-lake',
    name: 'Futala Lake Promenade',
    category: 'POKESTOP',
    lat: 21.1558,
    lng: 79.0437,
    biome: 'WATER',
    description: 'Famous waterfront promenade, hotspot for Water and Ice Pokémon.',
  },
  {
    id: 'deekshabhoomi',
    name: 'Deekshabhoomi Stupa',
    category: 'GYM_UNITE',
    lat: 21.1278,
    lng: 79.0682,
    biome: 'SACRED_PSYCHIC',
    bossSpeciesId: 'mewtwo',
    description: 'Sacred architectural monument and high-level Psychic/Fairy UNITE Gym.',
  },
  {
    id: 'ambazari-lake',
    name: 'Ambazari Lake & Garden',
    category: 'POKESTOP',
    lat: 21.1287,
    lng: 79.0381,
    biome: 'WATER',
    description: 'Lush lakefront garden and breeding ground for Grass and Water Pokémon.',
  },
  {
    id: 'sitabuldi-fort',
    name: 'Sitabuldi Fort Heritage',
    category: 'GYM_UNITE',
    lat: 21.1494,
    lng: 79.0864,
    biome: 'HISTORIC_STEEL',
    bossSpeciesId: 'tyranitar',
    description: 'Historic hilltop fort currently invaded by Team GO Rocket!',
    isRocketInvaded: true,
    rocketGrunt: 'Team GO Rocket Leader Cliff',
    shadowSpeciesId: 'larvitar',
  },
  {
    id: 'kasturchand-park',
    name: 'Kasturchand Park',
    category: 'POKESTOP',
    lat: 21.1527,
    lng: 79.0867,
    biome: 'PARK',
    description: 'Expansive historic park ground with Team GO Rocket Grunt activity.',
    isRocketInvaded: true,
    rocketGrunt: 'Team GO Rocket Grunt (Electric)',
    shadowSpeciesId: 'electabuzz',
  },
  {
    id: 'seminary-hills',
    name: 'Seminary Hills Forest Reserve',
    category: 'GYM_UNITE',
    lat: 21.1685,
    lng: 79.0612,
    biome: 'FOREST',
    bossSpeciesId: 'rayquaza',
    description: 'Forested hillock with high altitude Flying, Ghost, and Dragon sightings.',
  },
  {
    id: 'maharajbagh-zoo',
    name: 'Maharajbagh Zoo & Garden',
    category: 'POKESTOP',
    lat: 21.1415,
    lng: 79.0732,
    biome: 'FOREST',
    description: 'Historic botanical garden and wildlife sanctuary rich in Bug & Poison Pokémon.',
  },
];

export interface RealWorldSpawn {
  uid: string;
  speciesId: string;
  dex: number;
  name: string;
  lat: number;
  lng: number;
  cp: number;
  primaryType: PokemonType;
  isWeatherBoosted: boolean;
  isUniteBoss?: boolean;
  isShadow?: boolean;
}

interface RealWorldStore {
  playerLat: number;
  playerLng: number;
  playerHeading: number;
  currentLocationName: string;
  weatherCondition: WeatherBoostCondition;
  timeOfDay: TimeOfDayPhase;
  temperatureCelsius: number;
  windSpeedKmh: number;
  speedKmh: number;
  isDrivingSpeed: boolean;
  is3DViewTilted: boolean;
  boostedTypes: PokemonType[];
  spawns: RealWorldSpawn[];
  isLoadingWeather: boolean;
  useLiveGps: boolean;
  activeHatchingEgg: { targetKm: number; speciesId?: string } | null;

  // Actions
  setPlayerLocation: (lat: number, lng: number, locationName?: string, heading?: number) => void;
  setPlayerHeading: (heading: number) => void;
  toggle3DViewTilted: () => void;
  setUseLiveGps: (enabled: boolean) => void;
  dismissDrivingWarning: () => void;
  triggerEggHatch: (targetKm: number, speciesId?: string) => void;
  clearHatchedEgg: () => void;
  fetchLiveWeather: () => Promise<void>;
  generateSpawnsAroundPlayer: () => void;
}

export const WEATHER_TYPE_BOOSTS: Record<WeatherBoostCondition, PokemonType[]> = {
  CLEAR_SUNNY: ['Fire', 'Grass', 'Ground'],
  RAIN: ['Water', 'Electric', 'Bug'],
  PARTLY_CLOUDY: ['Normal', 'Rock'],
  CLOUDY: ['Fighting', 'Poison', 'Fairy'],
  WINDY: ['Dragon', 'Flying', 'Psychic'],
  FOG: ['Ghost', 'Dark'],
  SNOW: ['Ice', 'Steel'],
};

export const useRealWorldStore = create<RealWorldStore>()(
  persist(
    (set, get) => ({
      playerLat: 21.1458,
      playerLng: 79.0882,
      playerHeading: 0,
      currentLocationName: 'Nagpur, India (Zero Mile Stone)',
      weatherCondition: 'CLEAR_SUNNY',
      timeOfDay: 'DAY',
      temperatureCelsius: 28,
      windSpeedKmh: 12,
      speedKmh: 4.8,
      isDrivingSpeed: false,
      is3DViewTilted: true,
      boostedTypes: ['Fire', 'Grass', 'Ground'],
      spawns: [],
      isLoadingWeather: false,
      useLiveGps: false,
      activeHatchingEgg: null,

      setPlayerLocation: (lat, lng, locationName, heading) => {
        const prevLat = get().playerLat;
        const prevLng = get().playerLng;

        // Calculate heading if moving
        let newHeading = get().playerHeading;
        if (heading !== undefined) {
          newHeading = heading;
        } else if (prevLat !== lat || prevLng !== lng) {
          const dLat = lat - prevLat;
          const dLng = lng - prevLng;
          newHeading = (Math.atan2(dLng, dLat) * 180) / Math.PI;
        }

        // Calculate Time of Day based on current hour
        const hour = new Date().getHours();
        let phase: TimeOfDayPhase = 'DAY';
        if (hour >= 5 && hour < 7) phase = 'DAWN';
        else if (hour >= 7 && hour < 17) phase = 'DAY';
        else if (hour >= 17 && hour < 19) phase = 'DUSK';
        else phase = 'NIGHT';

        set({
          playerLat: lat,
          playerLng: lng,
          playerHeading: newHeading,
          timeOfDay: phase,
          currentLocationName: locationName || `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
        });

        get().fetchLiveWeather();
        get().generateSpawnsAroundPlayer();
      },

      setPlayerHeading: (heading) => set({ playerHeading: heading }),

      toggle3DViewTilted: () => set((s) => ({ is3DViewTilted: !s.is3DViewTilted })),

      setUseLiveGps: (enabled) => set({ useLiveGps: enabled }),

      dismissDrivingWarning: () => set({ isDrivingSpeed: false }),

      triggerEggHatch: (targetKm, speciesId) => set({ activeHatchingEgg: { targetKm, speciesId } }),

      clearHatchedEgg: () => set({ activeHatchingEgg: null }),

      fetchLiveWeather: async () => {
        const { playerLat, playerLng } = get();
        set({ isLoadingWeather: true });

        try {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${playerLat}&longitude=${playerLng}&current_weather=true`;
          const res = await fetch(url);
          const data = await res.json();

          if (data && data.current_weather) {
            const code = data.current_weather.weathercode;
            const temp = Math.round(data.current_weather.temperature);
            const wind = Math.round(data.current_weather.windspeed);
            const isDay = data.current_weather.is_day === 1;

            let condition: WeatherBoostCondition = 'CLEAR_SUNNY';
            if (code >= 51 && code <= 67) condition = 'RAIN';
            else if (code >= 80 && code <= 82) condition = 'RAIN';
            else if (code >= 71 && code <= 77) condition = 'SNOW';
            else if (code === 45 || code === 48) condition = 'FOG';
            else if (code === 1 || code === 2) condition = 'PARTLY_CLOUDY';
            else if (code === 3) condition = 'CLOUDY';
            else if (wind > 20) condition = 'WINDY';

            const boosted = WEATHER_TYPE_BOOSTS[condition] || ['Normal'];
            const hour = new Date().getHours();
            let phase: TimeOfDayPhase = isDay ? (hour >= 17 ? 'DUSK' : 'DAY') : (hour >= 5 && hour < 7 ? 'DAWN' : 'NIGHT');

            set({
              weatherCondition: condition,
              temperatureCelsius: temp,
              windSpeedKmh: wind,
              timeOfDay: phase,
              boostedTypes: boosted,
              isLoadingWeather: false,
            });

            get().generateSpawnsAroundPlayer();
            return;
          }
        } catch (err) {
          console.warn('Using default real-time Nagpur weather profile:', err);
        }

        set({
          weatherCondition: 'CLEAR_SUNNY',
          temperatureCelsius: 31,
          windSpeedKmh: 14,
          boostedTypes: ['Fire', 'Grass', 'Ground'],
          isLoadingWeather: false,
        });
        get().generateSpawnsAroundPlayer();
      },

      generateSpawnsAroundPlayer: () => {
        const { playerLat, playerLng, boostedTypes } = get();

        const weatherBoostedPool: Record<PokemonType, { id: string; dex: number; name: string }[]> = {
          Fire: [
            { id: 'charmander', dex: 4, name: 'Charmander' },
            { id: 'charizard', dex: 6, name: 'Charizard' },
            { id: 'cyndaquil', dex: 155, name: 'Cyndaquil' },
          ],
          Water: [
            { id: 'squirtle', dex: 7, name: 'Squirtle' },
            { id: 'blastoise', dex: 9, name: 'Blastoise' },
            { id: 'totodile', dex: 158, name: 'Totodile' },
          ],
          Grass: [
            { id: 'bulbasaur', dex: 1, name: 'Bulbasaur' },
            { id: 'venusaur', dex: 3, name: 'Venusaur' },
            { id: 'chikorita', dex: 152, name: 'Chikorita' },
          ],
          Electric: [
            { id: 'pikachu', dex: 25, name: 'Pikachu' },
            { id: 'raichu', dex: 26, name: 'Raichu' },
          ],
          Dragon: [
            { id: 'dragonite', dex: 149, name: 'Dragonite' },
            { id: 'rayquaza', dex: 384, name: 'Rayquaza' },
          ],
          Ghost: [
            { id: 'gengar', dex: 94, name: 'Gengar' },
          ],
          Normal: [
            { id: 'eevee', dex: 133, name: 'Eevee' },
            { id: 'snorlax', dex: 143, name: 'Snorlax' },
          ],
          Fighting: [
            { id: 'lucario', dex: 448, name: 'Lucario' },
            { id: 'machamp', dex: 68, name: 'Machamp' },
          ],
          Steel: [
            { id: 'steelix', dex: 208, name: 'Steelix' },
            { id: 'scizor', dex: 212, name: 'Scizor' },
          ],
          Rock: [
            { id: 'tyranitar', dex: 248, name: 'Tyranitar' },
          ],
          Bug: [
            { id: 'scyther', dex: 123, name: 'Scyther' },
            { id: 'butterfree', dex: 12, name: 'Butterfree' },
          ],
          Poison: [
            { id: 'gengar', dex: 94, name: 'Gengar' },
            { id: 'arbok', dex: 24, name: 'Arbok' },
          ],
          Ground: [
            { id: 'garchomp', dex: 445, name: 'Garchomp' },
          ],
          Flying: [
            { id: 'pidgeot', dex: 18, name: 'Pidgeot' },
            { id: 'charizard', dex: 6, name: 'Charizard' },
          ],
          Psychic: [
            { id: 'mewtwo', dex: 150, name: 'Mewtwo' },
            { id: 'alakazam', dex: 65, name: 'Alakazam' },
          ],
          Ice: [
            { id: 'lapras', dex: 131, name: 'Lapras' },
            { id: 'articuno', dex: 144, name: 'Articuno' },
          ],
          Dark: [
            { id: 'umbreon', dex: 197, name: 'Umbreon' },
            { id: 'tyranitar', dex: 248, name: 'Tyranitar' },
          ],
          Fairy: [
            { id: 'gardevoir', dex: 282, name: 'Gardevoir' },
            { id: 'togekiss', dex: 468, name: 'Togekiss' },
          ],
        };

        const newSpawns: RealWorldSpawn[] = [];
        const SPAWN_COUNT = 10;

        for (let i = 0; i < SPAWN_COUNT; i++) {
          const isBoosted = Math.random() < 0.65;
          const chosenType: PokemonType = isBoosted
            ? boostedTypes[Math.floor(Math.random() * boostedTypes.length)]
            : (['Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Fighting', 'Dragon'] as PokemonType[])[
                Math.floor(Math.random() * 7)
              ];

          const pool = weatherBoostedPool[chosenType] || weatherBoostedPool.Normal;
          const selected = pool[Math.floor(Math.random() * pool.length)];

          const angle = (i / SPAWN_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
          const distDegrees = 0.0025 + Math.random() * 0.0045;

          const latOffset = Math.cos(angle) * distDegrees;
          const lngOffset = Math.sin(angle) * distDegrees;
          const baseCp = isBoosted ? 900 + Math.floor(Math.random() * 800) : 400 + Math.floor(Math.random() * 500);

          newSpawns.push({
            uid: `gps-spawn-${selected.id}-${i}-${Date.now()}`,
            speciesId: selected.id,
            dex: selected.dex,
            name: selected.name,
            lat: playerLat + latOffset,
            lng: playerLng + lngOffset,
            cp: baseCp,
            primaryType: chosenType,
            isWeatherBoosted: isBoosted,
            isUniteBoss: selected.dex === 384 || selected.dex === 150 || selected.dex === 248,
          });
        }

        set({ spawns: newSpawns });
      },
    }),
    {
      name: 'pokemon_real_world_store_v2',
    }
  )
);
