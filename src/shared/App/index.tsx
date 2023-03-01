import { h, Fragment, RenderableProps, FunctionComponent } from 'preact';
import Editor from './Editor';

interface Props {}

const App: FunctionComponent<Props> = (props: RenderableProps<Props>) => {
  return (
    <>
      <h1>Hello World!</h1>
      <Editor />
    </>
  );
};

export { App as default };
