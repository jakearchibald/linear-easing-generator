import { h, Fragment, RenderableProps, FunctionComponent } from 'preact';
import { useSignal } from '@preact/signals';
import Editor from './Editor';
import { useEffect } from 'preact/hooks';

interface Props {}

const App: FunctionComponent<Props> = ({}: RenderableProps<Props>) => {
  const code = useSignal('function easing() {}');

  return (
    <>
      <h1>Hello World!</h1>
      <Editor value={code.value} onInput={(val) => console.log(val)} />
    </>
  );
};

export { App as default };
