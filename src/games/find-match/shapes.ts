import type { ShapeKind } from './findMatchTypes';

export type ShapeDefinition = {
  kind: ShapeKind;
  color: string;
  label: string;
};

export const SHAPES: readonly ShapeDefinition[] = [
  { kind: 'circle', color: '#ef4444', label: 'Circle' },
  { kind: 'square', color: '#2563eb', label: 'Square' },
  { kind: 'triangle', color: '#f59e0b', label: 'Triangle' },
  { kind: 'star', color: '#eab308', label: 'Star' },
  { kind: 'heart', color: '#ec4899', label: 'Heart' },
  { kind: 'diamond', color: '#06b6d4', label: 'Diamond' },
  { kind: 'moon', color: '#8b5cf6', label: 'Moon' },
  { kind: 'hexagon', color: '#10b981', label: 'Hexagon' },
] as const;

export function getShapeLabel(kind: ShapeKind): string {
  return SHAPES.find((shape) => shape.kind === kind)?.label ?? kind;
}
