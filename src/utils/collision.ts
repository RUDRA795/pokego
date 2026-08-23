import { WORLD_CONFIG, WorldBoundary, ObstacleCollider } from '../data/biomes';
import { distanceSq2D, clamp } from './math';

export function clampToBounds(
  x: number,
  z: number,
  boundary: WorldBoundary = WORLD_CONFIG.boundary,
  padding: number = 1.0
): { x: number; z: number } {
  return {
    x: clamp(x, boundary.minX + padding, boundary.maxX - padding),
    z: clamp(z, boundary.minZ + padding, boundary.maxZ - padding),
  };
}

export function checkObstacleCollision(
  x: number,
  z: number,
  radius: number = 0.6,
  obstacles: ObstacleCollider[] = WORLD_CONFIG.obstacles
): { collided: boolean; pushX: number; pushZ: number } {
  let pushX = 0;
  let pushZ = 0;
  let collided = false;

  for (const obs of obstacles) {
    const minDist = radius + obs.radius;
    const minDistSq = minDist * minDist;
    const distSq = distanceSq2D(x, z, obs.x, obs.z);

    if (distSq < minDistSq && distSq > 0.0001) {
      collided = true;
      const dist = Math.sqrt(distSq);
      const overlap = minDist - dist;
      const normalX = (x - obs.x) / dist;
      const normalZ = (z - obs.z) / dist;

      pushX += normalX * overlap;
      pushZ += normalZ * overlap;
    }
  }

  return { collided, pushX, pushZ };
}

export function resolvePosition(
  targetX: number,
  targetZ: number,
  radius: number = 0.6
): { x: number; z: number } {
  // 1. Clamp to outer island bounds
  let bounded = clampToBounds(targetX, targetZ, WORLD_CONFIG.boundary, radius + 0.5);

  // 2. Push out of obstacle colliders
  const col = checkObstacleCollision(bounded.x, bounded.z, radius);
  if (col.collided) {
    bounded.x += col.pushX;
    bounded.z += col.pushZ;
    // Re-clamp after push
    bounded = clampToBounds(bounded.x, bounded.z, WORLD_CONFIG.boundary, radius + 0.5);
  }

  return bounded;
}
