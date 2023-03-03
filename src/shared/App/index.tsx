import { h, Fragment, RenderableProps, FunctionComponent } from 'preact';
import { Signal, useSignal, useSignalEffect } from '@preact/signals';
import Editor from './Editor';
import { useRef } from 'preact/hooks';
import { processScriptEasing } from './process-script';
import type { LinearData } from 'shared-types/index';
import 'add-css:./styles.module.css';
import Graph from './Graph';
import useFullPointGeneration from './use-full-point-generation';

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
  const [fullPoints, codeError] = useFullPointGeneration(code);

  return (
    <>
      <Editor
        error={codeError}
        value={code.value}
        onInput={(val) => (code.value = val)}
        highlighting="js"
      />
      {fullPoints.value && (
        <div>
          <Graph fullPoints={fullPoints as Signal<LinearData>} />
        </div>
      )}
    </>
  );
};

export { App as default };
