import { Signal } from '@preact/signals';
import { h, RenderableProps, FunctionComponent } from 'preact';

interface Props {
  value: Signal<string>;
}

const CopyButton: FunctionComponent<Props> = ({
  value,
}: RenderableProps<Props>) => {
  return (
    <button
      style={{ display: 'none' }}
      onClick={() => navigator.clipboard.writeText(value.value)}
    >
      Copy
    </button>
  );
};

export { CopyButton as default };
