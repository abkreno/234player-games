import type { Vector } from './types';

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function distance(a: Vector, b: Vector): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function normalize(vector: Vector, maxLength: number): Vector {
  const length = Math.hypot(vector.x, vector.y);

  if (length <= maxLength || length === 0) {
    return vector;
  }

  return {
    x: (vector.x / length) * maxLength,
    y: (vector.y / length) * maxLength,
  };
}
