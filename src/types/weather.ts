export type WeatherType = 'SUNNY' | 'CLOUDY' | 'RAIN';

export type TimeOfDay = 'DAY' | 'NIGHT';

export interface WeatherPreset {
  type: WeatherType;
  name: string;
  temperature: number; // in Celsius
  isRaining: boolean;
  windSpeed: number; // in km/h
  ambientIntensityDay: number;
  ambientIntensityNight: number;
  sunIntensity: number;
  fogColorDay: string;
  fogColorNight: string;
  fogNear: number;
  fogFar: number;
  skyColorDay: string;
  skyColorNight: string;
}

export interface WeatherState {
  current: WeatherType;
  time: TimeOfDay;
  temperature: number;
  isRaining: boolean;
  windSpeed: number;
}
