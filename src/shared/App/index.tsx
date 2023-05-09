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
import CopyButton from './CopyButton';
import Input from './Input';
import Header from './Header';
import { hideFromPrerender } from './utils';

interface Props {}

const initiallyPlay = __PRERENDER__
  ? true
  : matchMedia('(prefers-reduced-motion: no-preference)').matches;

const App: FunctionComponent<Props> = ({}: RenderableProps<Props>) => {
  const { codeType, code, simplify, round, update } = useURLState();

  const playAnims = useSignal(initiallyPlay);
  const durationInputValue = useSignal('1.5');
  const duration = useComputed(
    () => (Number(durationInputValue.value) || 1.5) * 1000,
  );

  const [fullPoints, codeError, name] = useFullPointGeneration(
    code,
    codeType,
    (newDuration) =>
      (durationInputValue.value = (newDuration / 1000).toFixed(3)),
  );
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

  const playToggleText = useComputed(() =>
    playAnims.value ? 'Pause' : 'Play',
  );

  const playToggleIconPath = useComputed(() =>
    playAnims.value
      ? // Pause icon
        'M525 856V296h235v560H525Zm-325 0V296h235v560H200Zm385-60h115V356H585v440Zm-325 0h115V356H260v440Zm0-440v440-440Zm325 0v440-440Z'
      : // Play icon
        'M320 853V293l440 280-440 280Zm60-280Zm0 171 269-171-269-171v342Z',
  );

  return (
    <>
      <Header onPresetSelect={(newState) => update(newState)} />
      <div class={styles.appGrid}>
        <div class={styles.appModule} style={{ gridArea: 'input' }}>
          <Input
            code={code}
            codeType={codeType}
            error={codeError}
            onChange={(code, codeType) => update({ code, codeType })}
          />
        </div>
        <div
          class={styles.previewOutput}
          style={{ gridArea: 'preview-output' }}
        >
          <div class={styles.appModule} style={{ gridArea: 'preview' }}>
            <div class={styles.sectionHeader}>
              <div class={styles.sectionHeaderTitle}>
                <h2>Preview</h2>
                <p>Here's how it looks:</p>
              </div>
              <label class={styles.selectLabel} style={hideFromPrerender}>
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
              <button
                style={hideFromPrerender}
                class={styles.sectionHeaderIconButton}
                onClick={() => (playAnims.value = !playAnims.value)}
              >
                <span class={styles.sectionHeaderIconButtonText}>
                  {playToggleText}
                </span>
                <svg viewBox="0 96 960 960">
                  <path d={playToggleIconPath} />
                </svg>
              </button>
            </div>
            <div class={styles.previewContent}>
              <Graph
                fullPoints={graphFullPoints}
                optimizedPoints={optimizedPoints}
              />
              <div class={styles.animatedDemos}>
                <AnimatedDemos
                  play={playAnims}
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
              <CopyButton value={friendlyExample} />
            </div>
            <Editor
              code={friendlyExample}
              language={signal(CodeHighlight.CSS)}
              readOnly
            />
          </div>
          <div
            class={[styles.appModule, styles.simplifyModule].join(' ')}
            style={{ gridArea: 'simplify' }}
          >
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
      </div>
    </>
  );
};

export { App as default };
