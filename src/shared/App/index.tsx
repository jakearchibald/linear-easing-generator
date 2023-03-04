import { h, Fragment, RenderableProps, FunctionComponent } from 'preact';
import {
  Signal,
  useComputed,
  useSignal,
  useSignalEffect,
} from '@preact/signals';
import Editor from './Editor';
import { useCallback, useRef } from 'preact/hooks';
import { processScriptEasing } from './process-script';
import type { LinearData } from 'shared-types/index';
import 'add-css:./styles.module.css';
import Graph from './Graph';
import useFullPointGeneration from './use-full-point-generation';
import { Highlighting } from './types';

const defaultScriptEasing = `function easing(pos) {
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
  const [fullPoints, codeError] = useFullPointGeneration(code);
  const renderGraph = useComputed(() => !!fullPoints.value);

  return (
    <>
      <Editor
        error={codeError}
        code={code}
        onInput={(val) => (code.value = val)}
        highlighting={highlighting}
      />
      {renderGraph.value && (
        <div>
          <Graph fullPoints={fullPoints} />
        </div>
      )}
    </>
  );
};

export { App as default };
