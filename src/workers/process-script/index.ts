import { ProcessScriptData } from 'shared-types/index';

function isProcessScriptData(data: any): data is ProcessScriptData {
  return data.action === 'process-script';
}

type EasingFunc = (value: number) => unknown;

const pointsLength = 10_000;

function processScriptData(script: string) {
  const oldGlobals = Object.keys(self);

  // Indirect eval, so it happens in the global scope.
  // http://perfectionkills.com/global-eval-what-are-the-options/
  (1, eval)(script);

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
      const potentialFunc = key in self && typeof self[key] === 'function';

      // @ts-ignore
      if (key in self && typeof self[key] === 'function') {
        // @ts-ignore
        easingFunc = self[key] as EasingFunc;
      }
    }
  }

  if (!easingFunc) throw Error('Cannot find `easing` function on global');

  return Array.from({ length: pointsLength }, (_, i) => {
    const pos = i / pointsLength;
    return [pos, Number(easingFunc!(pos))];
  });
}

let used = false;

onmessage = ({ data }) => {
  // The scripts we're receiving are not trusted.
  // Ensure we're running them on a null origin.
  if (origin !== 'null') return;
  if (typeof data !== 'object' || data === null) return;

  if (isProcessScriptData(data)) {
    const { port, script } = data;

    if (used) {
      port.postMessage({ error: Error('Worker already used') });
      return;
    }

    used = true;

    try {
      const points = processScriptData(script);
      port.postMessage({ result: points });
    } catch (error) {
      port.postMessage({ error });
      throw error;
    }
  }
};
