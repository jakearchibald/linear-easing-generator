import { Signal, useComputed, useSignal } from '@preact/signals';
import { h, RenderableProps, FunctionComponent } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import 'add-css:./styles.module.css';
import * as styles from './styles.module.css';

interface Props {
  value: Signal<number>;
  min: number;
  max: number;
  step: number | 'any';
  onInput: (value: number) => void;
}

const Range: FunctionComponent<Props> = ({
  value,
  max,
  min,
  step,
  onInput,
}: RenderableProps<Props>) => {
  const fakeRangeStyle = useComputed(
    () => `--pos: ${(max - min) / (value.value - min)}`,
  );

  return (
    <div class={styles.rangeComponent} style={fakeRangeStyle}>
      <div class={styles.fakeRange}>
        <div class={styles.activeLine}></div>
        <div class={styles.inactiveLine}></div>
        <div class={styles.track}>
          <div class={styles.control}></div>
        </div>
      </div>
      <input
        class={styles.rangeInput}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onInput={(event) =>
          onInput((event.currentTarget as HTMLInputElement).valueAsNumber)
        }
      />
    </div>
  );
};

export { Range as default };
