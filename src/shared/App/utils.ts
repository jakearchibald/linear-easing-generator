import {
  Signal,
  useComputed,
  useSignal,
  useSignalEffect,
} from '@preact/signals';
import { CodeType, State } from './types';
import { useCallback } from 'preact/hooks';

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

export function useElementSize(): [
  refCallback: (el: Element | null) => void,
  sizeSignal: Signal<{ width: number; height: number } | null>,
] {
  const elSignal = useSignal<Element | null>(null);
  const sizeSignal = useSignal<{ width: number; height: number } | null>(null);
  const refCallback = useCallback((el: Element | null) => {
    elSignal.value = el;
  }, []);

  useSignalEffect(() => {
    if (!elSignal.value) return;

    const observer = new ResizeObserver((entries) => {
      const size = entries[0].contentBoxSize[0];
      sizeSignal.value = { width: size.inlineSize, height: size.blockSize };
    });

    observer.observe(elSignal.value!);

    return () => observer.disconnect();
  });

  return [refCallback, sizeSignal];
}
