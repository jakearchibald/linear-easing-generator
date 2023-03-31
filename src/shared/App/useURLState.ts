import { ReadonlySignal, Signal, useSignal, batch } from '@preact/signals';
import { useCallback, useMemo } from 'preact/hooks';
import { CodeType, State } from './types';
import { bounce, materialEmphasized } from './demos';
import { getURLParamsFromState } from './utils';

interface UseURLStateReturn {
  codeType: ReadonlySignal<CodeType>;
  code: ReadonlySignal<string>;
  simplify: ReadonlySignal<number>;
  round: ReadonlySignal<number>;
  update: (state: Partial<State>) => void;
}

function getStateFromURL(): Partial<State> {
  if (__PRERENDER__) return {};

  const params = new URLSearchParams(location.search);
  const output: Partial<State> = {};

  if (params.has('codeType')) {
    const codeType = params.get('codeType');
    output.codeType = codeType === 'js' ? CodeType.JS : CodeType.SVG;

    if (params.has('code')) {
      output.code = params.get('code')!;
    }
  }

  if (params.has('simplify')) {
    const simplify = Number(params.get('simplify')!);
    if (!isNaN(simplify)) output.simplify = simplify;
  }

  if (params.has('round')) {
    const round = Number(params.get('round')!);
    if (!isNaN(round)) output.round = round;
  }

  return output;
}

export default function useURLState(): UseURLStateReturn {
  const originalURLState = useMemo(getStateFromURL, []);
  const defaultCodeType = originalURLState.codeType || CodeType.JS;

  const codeType = useSignal(defaultCodeType);
  const code = useSignal(
    originalURLState.code ||
      (defaultCodeType === CodeType.JS ? bounce.code : materialEmphasized.code),
  );

  const simplify = useSignal(originalURLState.simplify ?? 0.002);
  const round = useSignal(originalURLState.round ?? 3);

  const update = useCallback((newState: Partial<State>) => {
    batch(() => {
      if (newState.codeType !== undefined) codeType.value = newState.codeType;
      if (newState.code !== undefined) code.value = newState.code;
      if (newState.simplify !== undefined) simplify.value = newState.simplify;
      if (newState.round !== undefined) round.value = newState.round;
    });

    const newURL = new URL(location.href);
    newURL.search = getURLParamsFromState({
      codeType: codeType.value,
      code: code.value,
      simplify: simplify.value,
      round: round.value,
    }).toString();

    history.replaceState(null, '', newURL.toString());
  }, []);

  return useMemo(
    () => ({
      codeType,
      code,
      simplify,
      round,
      update,
    }),
    [],
  );
}
