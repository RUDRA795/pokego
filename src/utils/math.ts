export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export function distance2D(x1: number, z1: number, x2: number, z2: number): number {
  const dx = x2 - x1;
  const dz = z2 - z1;
  return Math.sqrt(dx * dx + dz * dz);
}

export function distanceSq2D(x1: number, z1: number, x2: number, z2: number): number {
  const dx = x2 - x1;
  const dz = z2 - z1;
  return dx * dx + dz * dz;
}

export function angleBetween(fromX: number, fromZ: number, toX: number, toZ: number): number {
  return Math.atan2(toX - fromX, toZ - fromZ);
}

export function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function lerpAngle(start: number, end: number, t: number): number {
  const da = (end - start) % (Math.PI * 2);
  const diff = ((2 * da) % (Math.PI * 2)) - da;
  return start + diff * t;
}
