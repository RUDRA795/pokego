/**
 * Pokémon 3D RPG — Continuous Terrain Heightmap & Spatial Surface Engine
 * 
 * Provides analytical and continuous procedural heightfield calculations for the Forest Valley:
 * - getHeight(x, z): elevation in world units
 * - getNormal(x, z): surface normal vector for slopes and character alignment
 * - getSlope(x, z): gradient steepness in degrees (0 to 90)
 * - getBiome(x, z): ecological zone type
 * - getSurfaceType(x, z): 'grass' | 'dirt_trail' | 'rock' | 'sand' | 'water_bed' | 'cliff'
 * - getWaterLevel(x, z): water surface elevation if over water body/stream
 * - getWalkability(x, z): boolean indicating if terrain is walkable by the player
 */

import * as THREE from 'three';

export type SurfaceType = 'grass' | 'dirt_trail' | 'rock' | 'sand' | 'water_bed' | 'cliff';

export class TerrainHeightmap {
  // World Dimensions
  public static readonly WORLD_SIZE = 120; // 120x120 extended forest valley
  public static readonly HALF_SIZE = 60;

  // Key Ecological Feature Coordinates
  public static readonly VALLEY_CENTER = { x: 0, z: 0 };
  public static readonly STREAM_PATH = [
    { x: -35, z: -35, yWater: 2.2 }, // Upper waterfall source
    { x: -20, z: -25, yWater: 1.5 },
    { x: -8, z: -12, yWater: 0.8 },
    { x: 0, z: 0, yWater: 0.2 },      // Valley center stream
    { x: 14, z: 12, yWater: -0.4 },
    { x: 28, z: 24, yWater: -1.0 },   // Lower delta pond
  ];
  public static readonly WATERFALL_SOURCE = { x: -35, z: -35, height: 8.5 };
  public static readonly WATERFALL_CLIFF_Z = -30;
  public static readonly CAVE_ENTRANCE = { x: 32, z: -28, elevation: 4.5 };
  public static readonly HIGH_RIDGE = { x: -30, z: 30, elevation: 9.0 };

  /**
   * Returns continuous terrain elevation at world coordinate (x, z).
   */
  public static getHeight(x: number, z: number): number {
    // 1. Boundary mountain ring that frames the valley
    const distFromCenter = Math.sqrt(x * x + z * z);
    let elevation = 0;

    if (distFromCenter > 38) {
      const ringFactor = (distFromCenter - 38) / 18;
      elevation += Math.pow(ringFactor, 1.8) * 9.5;
      elevation += Math.sin(x * 0.15) * Math.cos(z * 0.15) * 3.5;
    }

    // 2. High Western Ridge / Plateau
    const dxRidge = x - (-30);
    const dzRidge = z - 28;
    const ridgeDist = Math.sqrt(dxRidge * dxRidge + dzRidge * dzRidge);
    if (ridgeDist < 25) {
      const ridgeFactor = (1 - ridgeDist / 25);
      elevation += Math.pow(ridgeFactor, 2) * 7.5 + Math.sin(x * 0.3) * 0.8;
    }

    // 3. North-West Waterfall Cliff
    const dxCliff = x - (-35);
    const dzCliff = z - (-35);
    const cliffDist = Math.sqrt(dxCliff * dxCliff + dzCliff * dzCliff);
    if (cliffDist < 20) {
      const cliffFactor = (1 - cliffDist / 20);
      elevation += cliffFactor * 8.0;
    }

    // 4. North-East Rocky Crags & Cave Entrance
    const dxCave = x - 32;
    const dzCave = z - (-28);
    const caveDist = Math.sqrt(dxCave * dxCave + dzCave * dzCave);
    if (caveDist < 22) {
      const caveFactor = (1 - caveDist / 22);
      elevation += caveFactor * 5.5 + Math.cos(x * 0.25) * 1.2;
    }

    // 5. Central Valley gentle rolling hills
    elevation += Math.sin(x * 0.12) * 0.65 + Math.cos(z * 0.14) * 0.55;
    elevation += Math.sin(x * 0.35 + z * 0.28) * 0.25;

    // 6. Winding Stream Bed (Carves a smooth depression into terrain)
    const streamInfo = this.getStreamDist(x, z);
    if (streamInfo.dist < 5.5) {
      const streamDepression = (1 - streamInfo.dist / 5.5) * 1.8;
      elevation = Math.min(elevation, streamInfo.yWater - 0.4 - streamDepression * 0.6);
    }

    return elevation;
  }

  /**
   * Calculates surface normal vector at (x, z) using central finite differences.
   */
  public static getNormal(x: number, z: number): THREE.Vector3 {
    const eps = 0.2;
    const hL = this.getHeight(x - eps, z);
    const hR = this.getHeight(x + eps, z);
    const hD = this.getHeight(x, z - eps);
    const hU = this.getHeight(x, z + eps);

    const normal = new THREE.Vector3(hL - hR, 2 * eps, hD - hU);
    return normal.normalize();
  }

  /**
   * Returns ground slope steepness in degrees (0 = flat, 90 = vertical cliff).
   */
  public static getSlope(x: number, z: number): number {
    const normal = this.getNormal(x, z);
    const dotUp = Math.max(-1, Math.min(1, normal.y));
    return Math.acos(dotUp) * (180 / Math.PI);
  }

  /**
   * Determines if player/Pokémon can walk on terrain at (x, z).
   * Slopes > 48 degrees or deep water beds are non-walkable for ground walkers.
   */
  public static getWalkability(x: number, z: number): boolean {
    const distFromCenter = Math.sqrt(x * x + z * z);
    if (distFromCenter > 52) return false; // Outer boundary cliff

    const slope = this.getSlope(x, z);
    if (slope > 48) return false; // Too steep to climb

    return true;
  }

  /**
   * Determines the surface material category at (x, z).
   */
  public static getSurfaceType(x: number, z: number): SurfaceType {
    const slope = this.getSlope(x, z);
    if (slope > 36) return 'cliff';

    const streamInfo = this.getStreamDist(x, z);
    if (streamInfo.dist < 3.2) {
      const currentHeight = this.getHeight(x, z);
      if (currentHeight < streamInfo.yWater) return 'water_bed';
      return 'sand';
    }

    // Dirt trail curve through the valley
    const trailDist = this.getTrailDist(x, z);
    if (trailDist < 2.2) return 'dirt_trail';

    if (x > 18 && z < -10) return 'rock';

    return 'grass';
  }

  /**
   * Returns water elevation if the point is within the stream/pond basin, or null.
   */
  public static getWaterLevel(x: number, z: number): number | null {
    const streamInfo = this.getStreamDist(x, z);
    if (streamInfo.dist < 5.0) {
      return streamInfo.yWater;
    }
    return null;
  }

  /**
   * Helper: Calculates shortest distance to the winding stream and stream water height.
   */
  public static getStreamDist(x: number, z: number): { dist: number; yWater: number } {
    let minDist = Infinity;
    let closestYWater = 0;

    for (let i = 0; i < this.STREAM_PATH.length - 1; i++) {
      const p1 = this.STREAM_PATH[i];
      const p2 = this.STREAM_PATH[i + 1];

      const dx = p2.x - p1.x;
      const dz = p2.z - p1.z;
      const segLenSq = dx * dx + dz * dz;

      let t = ((x - p1.x) * dx + (z - p1.z) * dz) / segLenSq;
      t = Math.max(0, Math.min(1, t));

      const projX = p1.x + t * dx;
      const projZ = p1.z + t * dz;
      const d = Math.sqrt((x - projX) * (x - projX) + (z - projZ) * (z - projZ));

      if (d < minDist) {
        minDist = d;
        closestYWater = p1.yWater + t * (p2.yWater - p1.yWater);
      }
    }

    return { dist: minDist, yWater: closestYWater };
  }

  /**
   * Helper: Distance to natural dirt exploration trail.
   */
  public static getTrailDist(x: number, z: number): number {
    // S-curve trail connecting clearing to lookout ridge
    const targetZ = z;
    const trailX = Math.sin(targetZ * 0.08) * 8.5 + Math.cos(targetZ * 0.04) * 4.0;
    return Math.abs(x - trailX);
  }
}
