import { Signal, useComputed, useSignalEffect } from '@preact/signals';
import { CodeType, State } from './types';

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
    console.log(
      Object.fromEntries(
        Object.entries(signals).map(([key, value]) => [key, value.value]),
      ),
    );
  });
}

export function getURLParamsFromState(state: Partial<State>) {
  const params = new URLSearchParams();

  if (state.codeType === CodeType.JS) {
    params.set('codeType', 'js');
  } else if (state.codeType === CodeType.SVG) {
    params.set('codeType', 'svg');
  }

  if (state.code) params.set('code', state.code);

  if (state.simplify !== undefined) {
    params.set('simplify', state.simplify.toString());
  }

  if (state.round !== undefined) params.set('round', state.round.toString());

  return params;
}
