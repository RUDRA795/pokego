import { create } from 'zustand';
import { WeatherState, WeatherType, TimeOfDay } from '../types/weather';
import { WEATHER_PRESETS } from '../data/weather';

interface WeatherStore extends WeatherState {
  setWeather: (weather: WeatherType) => void;
  cycleWeather: () => void;
  setTime: (time: TimeOfDay) => void;
  toggleTime: () => void;
}

export const useWeatherStore = create<WeatherStore>((set) => ({
  current: 'SUNNY',
  time: 'DAY',
  temperature: WEATHER_PRESETS.SUNNY.temperature,
  isRaining: WEATHER_PRESETS.SUNNY.isRaining,
  windSpeed: WEATHER_PRESETS.SUNNY.windSpeed,

  setWeather: (weather: WeatherType) => {
    const preset = WEATHER_PRESETS[weather];
    set({
      current: weather,
      temperature: preset.temperature,
      isRaining: preset.isRaining,
      windSpeed: preset.windSpeed,
    });
  },

  cycleWeather: () => {
    set((state) => {
      const types: WeatherType[] = ['SUNNY', 'CLOUDY', 'RAIN'];
      const nextIndex = (types.indexOf(state.current) + 1) % types.length;
      const nextType = types[nextIndex];
      const preset = WEATHER_PRESETS[nextType];
      return {
        current: nextType,
        temperature: preset.temperature,
        isRaining: preset.isRaining,
        windSpeed: preset.windSpeed,
      };
    });
  },

  setTime: (time: TimeOfDay) => set({ time }),

  toggleTime: () => set((state) => ({
    time: state.time === 'DAY' ? 'NIGHT' : 'DAY',
  })),
}));
