import {
  ProcessScriptData,
  PostMessageError,
  LinearData,
  ProcessSVGData,
} from 'shared-types/index';
import parseStack from './error-stack-parser';
import { svgPathProperties as SVGPathProperties } from 'svg-path-properties';

function isProcessScriptData(data: any): data is ProcessScriptData {
  return data.action === 'process-script';
}

function isProcessSVGData(data: any): data is ProcessSVGData {
  return data.action === 'process-svg';
}

type EasingFunc = (value: number) => unknown;

const pointsLength = 10_000;

function processScriptData(script: string) {
  const oldGlobals = Object.keys(self);

  // Using importScripts rather than eval, as it gives better stack traces.
  importScripts(`data:text/javascript,${encodeURIComponent(script)}`);

  let easingFunc: EasingFunc | undefined;

  // Ideally the function is called 'easing'.
  if ('easing' in self && typeof self.easing === 'function') {
    easingFunc = self.easing as EasingFunc;
  } else {
    // Buuuuut if there's just one new global, let's be nice and use it.
    const newGlobals = new Set(Object.keys(self));
    for (const key of oldGlobals) newGlobals.delete(key);

    if (newGlobals.size === 1) {
      const [key] = newGlobals;

      // @ts-ignore
      if (key in self && typeof self[key] === 'function') {
        // @ts-ignore
        easingFunc = self[key] as EasingFunc;
      }
    }
  }

  if (!easingFunc) throw Error('Cannot find `easing` function on global');

  return Array.from({ length: pointsLength }, (_, i) => {
    const pos = i / (pointsLength - 1);
    return [pos, Number(easingFunc!(pos))];
  });
}

function processSVGData(pathData: string) {
  const parsedPath = new SVGPathProperties(pathData);
  const totalLength = parsedPath.getTotalLength();

  if (totalLength === 0) throw new TypeError('Path is zero length');

  let lastX = -Infinity;

  const points: LinearData = Array.from({ length: pointsLength }, (_, i) => {
    const pos = (i / (pointsLength - 1)) * totalLength;
    const point = parsedPath.getPointAtLength(pos);

    // Prevent paths going back on themselves
    lastX = Math.max(lastX, point.x);
    return [lastX, point.y];
  });

  return points;
}

let used = false;

onmessage = ({ data }) => {
  // The scripts we're receiving are not trusted.
  // Ensure we're running them on a null origin.
  if (origin !== 'null') return;
  if (typeof data !== 'object' || data === null) return;

  if (isProcessScriptData(data) || isProcessSVGData(data)) {
    const { port, script } = data;

    if (used) {
      const error: PostMessageError = { message: 'Worker already used' };
      port.postMessage({ error });
      return;
    }

    used = true;

    try {
      const points =
        data.action === 'process-svg'
          ? processSVGData(script)
          : processScriptData(script);
      port.postMessage({ result: points });
    } catch (error) {
      const errorDetails: PostMessageError = {
        ...parseStack(error as Error),
        message: (error as Error).message,
      };
      port.postMessage({ error: errorDetails });
      throw error;
    }
  }
};
