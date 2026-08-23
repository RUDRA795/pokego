/**
 * Pokémon 3D RPG — GPS to Local 3D Cartesian Coordinate Projection Engine
 * 
 * Provides high-precision floating-origin projection from real-world Geodetic coordinates (Lat, Lng)
 * into a local Three.js Cartesian coordinate space (X, Y, Z).
 */

export interface WorldCoord {
  x: number;
  z: number;
}

export interface GPSCoord {
  lat: number;
  lng: number;
}

// 1 World Unit = 2.5 Real-World Meters for optimal RPG scale & visibility
export const WORLD_SCALE_FACTOR = 0.4; // 1 meter = 0.4 Three.js units (i.e. 2.5m = 1 unit)

// Meters per degree latitude (approx standard WGS84)
export const METERS_PER_DEG_LAT = 111320;

/**
 * Returns meters per degree longitude at a given latitude.
 */
export function getMetersPerDegLng(lat: number): number {
  const rad = (lat * Math.PI) / 180;
  return 111320 * Math.cos(rad);
}

/**
 * Converts a target GPS position (lat, lng) to local (X, Z) world coordinates
 * relative to an anchor GPS position (usually the player's position or city center).
 */
export function gpsToWorldCoords(
  targetLat: number,
  targetLng: number,
  anchorLat: number,
  anchorLng: number
): WorldCoord {
  const dLat = targetLat - anchorLat;
  const dLng = targetLng - anchorLng;

  const metersNorth = dLat * METERS_PER_DEG_LAT;
  const metersEast = dLng * getMetersPerDegLng(anchorLat);

  // In Three.js:
  // +X is East, -X is West
  // -Z is North, +Z is South
  const x = metersEast * WORLD_SCALE_FACTOR;
  const z = -metersNorth * WORLD_SCALE_FACTOR;

  return { x, z };
}

/**
 * Converts local (X, Z) world coordinates back to GPS (lat, lng)
 * relative to an anchor GPS position.
 */
export function worldCoordsToGps(
  x: number,
  z: number,
  anchorLat: number,
  anchorLng: number
): GPSCoord {
  const metersEast = x / WORLD_SCALE_FACTOR;
  const metersNorth = -z / WORLD_SCALE_FACTOR;

  const dLat = metersNorth / METERS_PER_DEG_LAT;
  const dLng = metersEast / getMetersPerDegLng(anchorLat);

  return {
    lat: anchorLat + dLat,
    lng: anchorLng + dLng,
  };
}

/**
 * Calculates Euclidean distance in 3D world units between two coordinates.
 */
export function getWorldDistance(x1: number, z1: number, x2: number, z2: number): number {
  const dx = x2 - x1;
  const dz = z2 - z1;
  return Math.sqrt(dx * dx + dz * dz);
}

/**
 * Converts world distance back to real-world kilometers.
 */
export function worldDistanceToKm(units: number): number {
  const meters = units / WORLD_SCALE_FACTOR;
  return meters / 1000;
}
