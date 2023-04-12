import { h, Fragment, RenderableProps, FunctionComponent } from 'preact';
import { useComputed, useSignal, signal } from '@preact/signals';
import Editor from './Editor';
import 'add-css:./styles.module.css';
import * as styles from './styles.module.css';
import Graph from './Graph';
import useFullPointGeneration from './useFullPointGeneration';
import { CodeHighlight, CodeType } from './types';
import Optim from './Optim';
import useOptimizedPoints from './useOptimizedPoints';
import useLinearSyntax from './useLinearSyntax';
import AnimatedDemos from './AnimatedDemos';
import useFriendlyLinearCode from './useFriendlyLinearCode';
import useURLState from './useURLState';
import DemoLinks from './DemoLinks';
import CopyButton from './CopyButton';
import Input from './Input';

interface Props {}

const App: FunctionComponent<Props> = ({}: RenderableProps<Props>) => {
  const { codeType, code, simplify, round, update } = useURLState();

  const durationInputValue = useSignal('1.5');
  const duration = useComputed(
    () => (Number(durationInputValue.value) || 1.5) * 1000,
  );

  const [fullPoints, codeError, name] = useFullPointGeneration(code, codeType);
  const optimizedPoints = useOptimizedPoints(fullPoints, simplify, round);

  // Just pass through the original SVG for the graph, if the input is SVG
  const graphFullPoints = useComputed(() =>
    codeType.value === CodeType.JS ? fullPoints.value : code.value,
  );
  const linear = useLinearSyntax(optimizedPoints, round);
  const friendlyExample = useFriendlyLinearCode(linear, name);

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
      <div class={styles.appModule} style={{ gridArea: 'input' }}>
        <Input
          code={code}
          codeType={codeType}
          error={codeError}
          onChange={(code, codeType) => update({ code, codeType })}
        />
      </div>
      <div class={styles.previewOutput} style={{ gridArea: 'preview-output' }}>
        <div class={styles.appModule} style={{ gridArea: 'preview' }}>
          <div
            class={[styles.sectionHeader, styles.previewSectionHeader].join(
              ' ',
            )}
          >
            <div class={styles.sectionHeaderTitle}>
              <h2>Preview</h2>
              <p>Here's how it looks:</p>
            </div>
            <label class={styles.selectLabel}>
              <span class={styles.labelTextEnd}>Duration</span>
              <input
                class={[styles.input, styles.durationInput].join(' ')}
                type="number"
                value={durationInputValue}
                onInput={(event) =>
                  (durationInputValue.value = (
                    event.target as HTMLInputElement
                  ).value)
                }
              />
            </label>
          </div>
          <div class={styles.previewContent}>
            <Graph
              fullPoints={graphFullPoints}
              optimizedPoints={optimizedPoints}
            />
            <div class={styles.animatedDemos}>
              <AnimatedDemos
                duration={duration}
                linear={linear}
                slightlyOptimizedLinear={slightlyOptimizedLinear}
              />
            </div>
          </div>
        </div>
        <div class={styles.appModule} style={{ gridArea: 'output' }}>
          <div class={styles.sectionHeader}>
            <div class={styles.sectionHeaderTitle}>
              <h2>Output</h2>
              <p>Some shiny new CSS!</p>
            </div>
          </div>
          <Editor
            code={friendlyExample}
            language={signal(CodeHighlight.CSS)}
            readOnly
          />
        </div>
        <div class={styles.appModule} style={{ gridArea: 'simplify' }}>
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
        </div>
      </div>
      {/*

      <DemoLinks onStateUpdate={(newState) => update(newSta


      <CopyButton value={friendlyExample} />
      */}
    </>
  );
};

export { App as default };
