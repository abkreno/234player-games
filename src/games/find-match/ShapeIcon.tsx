import type { ShapeKind } from './findMatchTypes';

type ShapeIconProps = {
  shape: ShapeKind;
  color: string;
};

export function ShapeIcon({ shape, color }: ShapeIconProps) {
  if (shape === 'circle') {
    return <span className="shape-icon shape-icon--circle" style={{ background: color }} />;
  }

  if (shape === 'square') {
    return <span className="shape-icon shape-icon--square" style={{ background: color }} />;
  }

  if (shape === 'triangle') {
    return <span className="shape-icon shape-icon--triangle" style={{ borderBottomColor: color }} />;
  }

  if (shape === 'star') {
    return <span className="shape-icon shape-icon--text" style={{ color }}>★</span>;
  }

  if (shape === 'heart') {
    return <span className="shape-icon shape-icon--text" style={{ color }}>♥</span>;
  }

  if (shape === 'diamond') {
    return <span className="shape-icon shape-icon--diamond" style={{ background: color }} />;
  }

  if (shape === 'moon') {
    return <span className="shape-icon shape-icon--text" style={{ color }}>☾</span>;
  }

  return <span className="shape-icon shape-icon--hexagon" style={{ background: color }} />;
}
