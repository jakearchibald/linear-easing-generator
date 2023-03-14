import { Signal } from '@preact/signals';
import { h, RenderableProps, FunctionComponent } from 'preact';

interface Props {
  value: Signal<string>;
}

const CopyButton: FunctionComponent<Props> = ({
  value,
}: RenderableProps<Props>) => {
  return (
    <button onClick={() => navigator.clipboard.writeText(value.value)}>
      Copy
    </button>
  );
};

export { CopyButton as default };
