import { ReadonlySignal, Signal, useSignal, batch } from '@preact/signals';
import { useCallback, useMemo } from 'preact/hooks';
import { CodeType, State } from './types';
import { bounce, materialEmphasized } from './demos';
import { getURLParamsFromState } from './utils';

interface UseURLStateReturn {
  codeType: ReadonlySignal<CodeType>;
  jsCode: ReadonlySignal<string>;
  svgCode: ReadonlySignal<string>;
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

    if (codeType === 'js') {
      output.codeType = CodeType.JS;
      if (params.has('code')) {
        output.jsCode = params.get('code')!;
      }
    } else if (codeType === 'svg') {
      output.codeType = CodeType.SVG;
      if (params.has('code')) {
        output.svgCode = params.get('code')!;
      }
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

  const jsCode = useSignal(
    defaultCodeType === CodeType.JS && originalURLState.jsCode !== undefined
      ? originalURLState.jsCode
      : bounce.jsCode!,
  );

  const svgCode = useSignal(
    defaultCodeType === CodeType.SVG && originalURLState.svgCode !== undefined
      ? originalURLState.svgCode
      : materialEmphasized.svgCode!,
  );

  const simplify = useSignal(originalURLState.simplify ?? 0.002);
  const round = useSignal(originalURLState.round ?? 3);

  const update = useCallback((newState: Partial<State>) => {
    batch(() => {
      if (newState.codeType !== undefined) codeType.value = newState.codeType;
      if (newState.jsCode !== undefined) jsCode.value = newState.jsCode;
      if (newState.svgCode !== undefined) svgCode.value = newState.svgCode;
      if (newState.simplify !== undefined) simplify.value = newState.simplify;
      if (newState.round !== undefined) round.value = newState.round;
    });

    const newURL = new URL(location.href);
    newURL.search = getURLParamsFromState({
      codeType: codeType.value,
      jsCode: jsCode.value,
      svgCode: svgCode.value,
      simplify: simplify.value,
      round: round.value,
    }).toString();

    history.replaceState(null, '', newURL.toString());
  }, []);

  return useMemo(
    () => ({
      codeType,
      jsCode,
      svgCode,
      simplify,
      round,
      update,
    }),
    [],
  );
}
