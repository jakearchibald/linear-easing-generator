import { h, Fragment, RenderableProps, FunctionComponent } from 'preact';
import { useComputed, useSignal, signal } from '@preact/signals';
import Editor from './Editor';
import 'add-css:./styles.module.css';
import Graph from './Graph';
import useFullPointGeneration from './useFullPointGeneration';
import { CodeHighlight, CodeType } from './types';
import Optim from './Optim';
import useOptimizedPoints from './useOptimizedPoints';
import InputType from './InputType';
import useLinearSyntax from './useLinearSyntax';
import AnimatedDemos from './AnimatedDemos';
import useFriendlyLinearCode from './useFriendlyLinearCode';
import useURLState from './useURLState';
import DemoLinks from './DemoLinks';

interface Props {}

const App: FunctionComponent<Props> = ({}: RenderableProps<Props>) => {
  const { codeType, jsCode, svgCode, simplify, round, update } = useURLState();

  const code = useComputed(() =>
    codeType.value === CodeType.JS ? jsCode.value : svgCode.value,
  );
  const editorHighlight = useComputed(() =>
    codeType.value == CodeType.JS ? CodeHighlight.JS : CodeHighlight.SVG,
  );

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
  const friendlyExample = useFriendlyLinearCode(linear);

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
      <DemoLinks onStateUpdate={(newState) => update(newState)} />
      <InputType
        type={codeType}
        onChange={(val) => update({ codeType: val })}
      />
      <Editor
        error={codeError}
        code={code}
        onInput={(val) =>
          codeType.value === CodeType.JS
            ? update({ jsCode: val })
            : update({ svgCode: val })
        }
        language={editorHighlight}
      />
      {outputReady.value && (
        <Graph fullPoints={graphFullPoints} optimizedPoints={optimizedPoints} />
      )}
      <Optim
        onInput={(newSimplify, newRound) =>
          update({
            simplify: newSimplify,
            round: newRound,
          })
        }
        round={round}
        simplify={simplify}
      />
      <Editor
        code={friendlyExample}
        language={signal(CodeHighlight.CSS)}
        readOnly
      />
      {outputReady.value && (
        <AnimatedDemos
          linear={linear}
          slightlyOptimizedLinear={slightlyOptimizedLinear}
        />
      )}
    </>
  );
};

export { App as default };
