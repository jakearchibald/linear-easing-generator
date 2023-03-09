import type { LinearData } from 'shared-types/index';

const pointsLength = 10_000;
const waitFrame = () =>
  new Promise((resolve) => requestAnimationFrame(resolve));

export default async function processSVGEasing(
  signal: AbortSignal,
  path: string,
): Promise<LinearData> {
  signal.throwIfAborted();

  path = path.replaceAll('\n', ' ');

  if (!CSS.supports(`clip-path: path("${path}")`)) {
    throw new TypeError('Invalid path data');
  }

  const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pathEl.setAttribute('d', path);

  const totalLength = pathEl.getTotalLength();

  if (totalLength === 0) throw new TypeError('Path is zero length');

  let lastX = -Infinity;

  const points: LinearData = [];

  await waitFrame();
  let workStart = performance.now();

  for (let i = 0; i < pointsLength; i++) {
    // Split the work into 16ms chunks, since this is really expensive for some reason
    if (performance.now() - workStart > 16) {
      await waitFrame();
      workStart = performance.now();
    }

    const pos = (i / (pointsLength - 1)) * totalLength;
    const point = pathEl.getPointAtLength(pos);

    // Prevent paths going back on themselves
    lastX = Math.max(lastX, point.x);
    points.push([lastX, point.y]);
  }

  return points;
}
