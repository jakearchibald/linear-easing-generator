import { Signal, useSignalEffect } from '@preact/signals';
import { LinearData } from 'shared-types/index';

// square distance from a point to a segment
function getSqSegDist(
  p: [number, number],
  p1: [number, number],
  p2: [number, number],
) {
  let x = p1[0];
  let y = p1[1];
  let dx = p2[0] - x;
  let dy = p2[1] - y;

  if (dx !== 0 || dy !== 0) {
    var t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);

    if (t > 1) {
      x = p2[0];
      y = p2[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }

  dx = p[0] - x;
  dy = p[1] - y;

  return dx * dx + dy * dy;
}

function simplifyDPStep(
  points: LinearData,
  first: number,
  last: number,
  sqTolerance: number,
  simplified: LinearData,
) {
  let maxSqDist = sqTolerance;
  let index: number;

  for (let i = first + 1; i < last; i++) {
    const sqDist = getSqSegDist(points[i], points[first], points[last]);

    if (sqDist > maxSqDist) {
      index = i;
      maxSqDist = sqDist;
    }
  }

  if (maxSqDist > sqTolerance) {
    if (index! - first > 1)
      simplifyDPStep(points, first, index!, sqTolerance, simplified);
    simplified.push(points[index!]);
    if (last - index! > 1)
      simplifyDPStep(points, index!, last, sqTolerance, simplified);
  }
}

// simplification using Ramer-Douglas-Peucker algorithm
function simplifyDouglasPeucker(points: LinearData, tolerance: number) {
  if (points.length <= 1) return points;
  const sqTolerance = tolerance * tolerance;
  const last = points.length - 1;
  const simplified: LinearData = [points[0]];
  simplifyDPStep(points, 0, last, sqTolerance, simplified);
  simplified.push(points[last]);

  return simplified;
}

export default function useOptimizedPoints(
  fullPoints: Signal<LinearData | null>,
  simplify: Signal<number>,
  round: Signal<number>,
): Signal<LinearData | null> {
  const optimizedPoints = new Signal<LinearData | null>(null);

  useSignalEffect(() => {
    if (!fullPoints.value) {
      optimizedPoints.value = null;
      return;
    }

    // TODO: apply rounding first
    const simplifiedPoints = simplifyDouglasPeucker(
      fullPoints.value,
      simplify.value,
    );

    optimizedPoints.value = simplifiedPoints;
  });

  return optimizedPoints;
}
