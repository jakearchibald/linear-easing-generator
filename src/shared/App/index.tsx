import { h, Fragment, RenderableProps, FunctionComponent } from 'preact';
import { useComputed, useSignal } from '@preact/signals';
import Editor from './Editor';
import 'add-css:./styles.module.css';
import Graph from './Graph';
import useFullPointGeneration from './useFullPointGeneration';
import { CodeType } from './types';
import Optim from './Optim';
import useOptimizedPoints from './useOptimizedPoints';
import InputType from './InputType';
import useLinearSyntax from './useLinearSyntax';
import Demos from './Demos';

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

interface Props {}

const App: FunctionComponent<Props> = ({}: RenderableProps<Props>) => {
  const codeType = useSignal(CodeType.JS);
  const jsCode = useSignal(defaultScriptEasing);
  const svgCode = useSignal(defaultSVGEasing);
  const code = useComputed(() =>
    codeType.value === CodeType.JS ? jsCode.value : svgCode.value,
  );
  const simplify = useSignal(0.002);
  const round = useSignal(3);

  const [fullPoints, codeError] = useFullPointGeneration(code, codeType);
  const optimizedPoints = useOptimizedPoints(fullPoints, simplify, round);
  const outputReady = useComputed(
    () => !!fullPoints.value && !!optimizedPoints.value,
  );
  // Just pass through the original SVG for the graph, if the input is SVG
  const graphFullPoints = useComputed(() =>
    codeType.value === CodeType.JS ? fullPoints.value : code.value,
  );
  const linear = useLinearSyntax(optimizedPoints, round);

  // Create slightly optimized version for the demos
  const slightlyOptimizedPoints = useOptimizedPoints(
    fullPoints,
    useSignal(0.00001),
    useSignal(5),
  );
  const slightlyOptimizedLinear = useLinearSyntax(
    slightlyOptimizedPoints,
    useSignal(5),
  );

  return (
    <>
      <InputType type={codeType} onChange={(val) => (codeType.value = val)} />
      <Editor
        error={codeError}
        code={code}
        onInput={(val) =>
          codeType.value === CodeType.JS
            ? (jsCode.value = val)
            : (svgCode.value = val)
        }
        language={codeType}
      />
      {outputReady.value && (
        <Graph fullPoints={graphFullPoints} optimizedPoints={optimizedPoints} />
      )}
      <Optim
        onInput={(newSimplify, newRound) => {
          simplify.value = newSimplify;
          round.value = newRound;
        }}
        round={round}
        simplify={simplify}
      />
      <p>{linear}</p>
      {outputReady.value && (
        <Demos
          linear={linear}
          slightlyOptimizedLinear={slightlyOptimizedLinear}
        />
      )}
    </>
  );
};

export { App as default };
