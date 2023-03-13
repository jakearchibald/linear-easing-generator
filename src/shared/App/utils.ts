import { Signal, useSignalEffect } from '@preact/signals';

export function doAbortable<R>(
  signal: AbortSignal,
  callback: (
    setAbortAction: (abortAction: () => void) => void,
  ) => R | Promise<R>,
): Promise<R> {
  if (signal.aborted) throw new DOMException('', 'AbortError');
  let onAbort: () => void;
  let listener: () => void;
  let onAbortReturn: any;
  const setAbortAction = (c: () => void) => {
    onAbort = c;
  };
  const promise = callback(setAbortAction);

  return Promise.race([
    new Promise<R>((_, reject) => {
      listener = () => {
        reject(new DOMException('', 'AbortError'));
        onAbortReturn = onAbort?.();
      };
      signal.addEventListener('abort', listener);
    }),
    promise,
  ]).finally(() => {
    signal.removeEventListener('abort', listener);
    return onAbortReturn;
  });
}

export function logSignalUpdates(signals: { [name: string]: Signal<any> }) {
  useSignalEffect(() => {
    for (const [name, signal] of Object.entries(signals)) {
      console.log(name, signal.value);
    }
  });
}
