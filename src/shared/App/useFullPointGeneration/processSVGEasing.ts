import type { LinearData } from 'shared-types/index';
import { svgPathProperties as SVGPathProperties } from 'svg-path-properties';

const pointsLength = 10_000;
const waitFrame = () =>
  new Promise((resolve) => requestAnimationFrame(resolve));

export default async function processSVGEasing(
  signal: AbortSignal,
  path: string,
): Promise<LinearData> {
  signal.throwIfAborted();

  path = path.replaceAll('\n', ' ');

  const parsedPath = new SVGPathProperties(path);
  const totalLength = parsedPath.getTotalLength();

  if (totalLength === 0) throw new TypeError('Path is zero length');

  let lastX = -Infinity;

  const points: LinearData = [];

  await waitFrame();
  signal.throwIfAborted();
  let workStart = performance.now();

  for (let i = 0; i < pointsLength; i++) {
    // Split the work into 16ms chunks, since this is really expensive for some reason
    if (performance.now() - workStart > 16) {
      await waitFrame();
      signal.throwIfAborted();
      workStart = performance.now();
    }

    const pos = (i / (pointsLength - 1)) * totalLength;
    const point = parsedPath.getPointAtLength(pos);

    // Prevent paths going back on themselves
    lastX = Math.max(lastX, point.x);
    points.push([lastX, point.y]);
  }

  return points;
}
