import { h, Fragment, RenderableProps, FunctionComponent } from 'preact';
import { useComputed, useSignal } from '@preact/signals';
import Editor from './Editor';
import 'add-css:./styles.module.css';
import Graph from './Graph';
import useFullPointGeneration from './useFullPointGeneration';
import { Highlighting } from './types';
import Optim from './Optim';
import useOptimizedPoints from './useOptimizedPoints';
import { useLayoutEffect } from 'preact/hooks';
import Result from './Result';

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

interface Props {}

const App: FunctionComponent<Props> = ({}: RenderableProps<Props>) => {
  const code = useSignal(defaultScriptEasing);
  const highlighting = useSignal<Highlighting>('js');
  const simplify = useSignal(0.002);
  const round = useSignal(3);

  const [fullPoints, codeError] = useFullPointGeneration(code);
  const optimizedPoints = useOptimizedPoints(fullPoints, simplify, round);
  const renderGraph = useComputed(
    () => !!fullPoints.value && !!optimizedPoints.value,
  );

  return (
    <>
      <Editor
        error={codeError}
        code={code}
        onInput={(val) => (code.value = val)}
        language={highlighting}
      />
      <div>
        {renderGraph.value && (
          <Graph fullPoints={fullPoints} optimizedPoints={optimizedPoints} />
        )}
        <Optim
          onInput={(newSimplify, newRound) => {
            simplify.value = newSimplify;
            round.value = newRound;
          }}
          round={round}
          simplify={simplify}
        />
        <Result round={round} points={optimizedPoints} />
      </div>
    </>
  );
};

export { App as default };
