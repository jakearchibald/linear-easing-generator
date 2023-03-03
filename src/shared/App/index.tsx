import { h, Fragment, RenderableProps, FunctionComponent } from 'preact';
import { useSignal, useSignalEffect } from '@preact/signals';
import Editor from './Editor';
import { useRef } from 'preact/hooks';
import { processScriptEasing } from './process-script';
import 'add-css:./styles.module.css';

interface Props {}

const App: FunctionComponent<Props> = ({}: RenderableProps<Props>) => {
  const code = useSignal('function easing(input) {\n  return input;\n}');
  const currentProcessingControllerRef = useRef<AbortController | null>(null);

  useSignalEffect(() => {
    currentProcessingControllerRef.current?.abort();
    currentProcessingControllerRef.current = new AbortController();

    processScriptEasing(
      currentProcessingControllerRef.current.signal,
      code.value,
    ).then(
      (result) => console.log(result),
      (error) => console.error(error),
    );
  });

  return (
    <>
      <h1>Hello World!</h1>
      <Editor value={code.value} onInput={(val) => (code.value = val)} />
    </>
  );
};

export { App as default };
