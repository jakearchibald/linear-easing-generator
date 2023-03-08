import { Signal, useComputed } from '@preact/signals';
import { h, Fragment, RenderableProps, FunctionComponent } from 'preact';
import { useRef, useLayoutEffect, useCallback } from 'preact/hooks';
import 'add-css:./styles.module.css';
import * as styles from './styles.module.css';

interface Props {
  simplify: Signal<number>;
  round: Signal<number>;
  onInput: (simplify: number, round: number) => void;
}

const Optim: FunctionComponent<Props> = ({
  round,
  simplify,
  onInput,
}: RenderableProps<Props>) => {
  const simplifyRef = useRef<HTMLInputElement>(null);
  const roundRef = useRef<HTMLInputElement>(null);
  const onRangeInput = useCallback(() => {
    onInput(
      simplifyRef.current!.valueAsNumber,
      roundRef.current!.valueAsNumber,
    );
  }, []);

  return (
    <form class={styles.form}>
      <label>
        <span>Simplify</span>
        <input
          ref={simplifyRef}
          type="range"
          min="0.00001"
          max="0.025"
          step="any"
          value={simplify}
          onInput={onRangeInput}
        />
      </label>
      <label>
        <span>Round</span>
        <input
          ref={roundRef}
          type="range"
          min="1"
          max="5"
          step="1"
          value={round}
          onInput={onRangeInput}
        />
      </label>
    </form>
  );
};

export { Optim as default };
