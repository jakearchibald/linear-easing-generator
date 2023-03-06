import { Signal, useComputed } from '@preact/signals';
import { h, Fragment, RenderableProps, FunctionComponent } from 'preact';
import { useRef, useLayoutEffect, useCallback } from 'preact/hooks';
import { LinearData } from 'shared-types/index';
import 'add-css:./styles.module.css';
import * as styles from './styles.module.css';

interface Props {
  fullPoints: Signal<LinearData | null>;
}

const Graph: FunctionComponent<Props> = ({
  fullPoints,
}: RenderableProps<Props>) => {
  const fullPointsPath = useComputed(() => {
    // We never render with null data here, but:
    // https://github.com/preactjs/signals/issues/315
    if (!fullPoints.value) return '';
    return 'M ' + fullPoints.value.map(([x, y]) => `${x} ${1 - y}`).join();
  });

  return (
    <svg class={styles.graphSvg} viewBox="0 0 1 1">
      <path d={fullPointsPath} stroke="red" fill="none" stroke-width="0.005" />
    </svg>
  );
};

export { Graph as default };
