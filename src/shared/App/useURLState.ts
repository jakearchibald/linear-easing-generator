import { ReadonlySignal, Signal, useSignal, batch } from '@preact/signals';
import { useCallback, useMemo } from 'preact/hooks';
import { CodeType } from './types';

const defaultScriptEasing = `// Write/paste an 'easing' function:
function easing(pos) {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (pos < 1 / d1) {
    return n1 * pos * pos;
  } else if (pos < 2 / d1) {
    return n1 * (pos -= 1.5 / d1) * pos + 0.75;
  } else if (pos < 2.5 / d1) {
    return n1 * (pos -= 2.25 / d1) * pos + 0.9375;
  } else {
    return n1 * (pos -= 2.625 / d1) * pos + 0.984375;
  }
}`;

const defaultSVGEasing = `M 0,0
C 0.05, 0, 0.133333, 0.06, 0.166666, 0.4
C 0.208333, 0.82, 0.25, 1, 1, 1`;

interface State {
  codeType: CodeType;
  jsCode: string;
  svgCode: string;
  simplify: number;
  round: number;
}

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

function getURLParamsFromState(state: State) {
  const params = new URLSearchParams();

  if (state.codeType === CodeType.JS) {
    params.set('codeType', 'js');
    params.set('code', state.jsCode);
  } else if (state.codeType === CodeType.SVG) {
    params.set('codeType', 'svg');
    params.set('code', state.svgCode);
  }

  params.set('simplify', state.simplify.toString());
  params.set('round', state.round.toString());

  return params;
}

export default function useURLState(): UseURLStateReturn {
  const originalURLState = useMemo(getStateFromURL, []);
  const defaultCodeType = originalURLState.codeType || CodeType.JS;

  const codeType = useSignal(defaultCodeType);

  const jsCode = useSignal(
    defaultCodeType === CodeType.JS && originalURLState.jsCode !== undefined
      ? originalURLState.jsCode
      : defaultScriptEasing,
  );

  const svgCode = useSignal(
    defaultCodeType === CodeType.SVG && originalURLState.svgCode !== undefined
      ? originalURLState.svgCode
      : defaultSVGEasing,
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
