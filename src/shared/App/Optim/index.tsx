import { Signal, useComputed } from '@preact/signals';
import { h, Fragment, RenderableProps, FunctionComponent } from 'preact';
import { useRef, useLayoutEffect, useCallback, useEffect } from 'preact/hooks';
import 'add-css:./styles.module.css';
import * as styles from './styles.module.css';
import * as sharedStyles from '../styles.module.css';
import Range from '../Range';
import { hideFromPrerender } from '../utils';

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
  return (
    <form class={styles.form}>
      <label style={hideFromPrerender}>
        <span class={sharedStyles.labelText}>Simplify</span>
        <Range
          min={0.00001}
          max={0.025}
          step="any"
          onInput={(newVal) => onInput(newVal, round.value)}
          value={simplify}
        />
      </label>
      <label style={hideFromPrerender}>
        <span class={sharedStyles.labelText}>Round</span>
        <Range
          min={2}
          max={5}
          step={1}
          onInput={(newVal) => onInput(simplify.value, newVal)}
          value={round}
        />
      </label>
    </form>
  );
};

export { Optim as default };
