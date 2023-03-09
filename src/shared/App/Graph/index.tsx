import { Signal, useComputed } from '@preact/signals';
import { h, Fragment, RenderableProps, FunctionComponent } from 'preact';
import { useRef, useLayoutEffect, useCallback, useEffect } from 'preact/hooks';
import { LinearData } from 'shared-types/index';
import 'add-css:./styles.module.css';
import * as styles from './styles.module.css';

interface Props {
  fullPoints: Signal<LinearData | string | null>;
  optimizedPoints: Signal<LinearData | null>;
}

function useToPath(pointsSignal: Signal<LinearData | string | null>) {
  return useComputed(() => {
    // We never render with null data here, but:
    // https://github.com/preactjs/signals/issues/315
    if (!pointsSignal.value) return '';
    if (typeof pointsSignal.value === 'string') return pointsSignal.value;
    return 'M ' + pointsSignal.value.map(([x, y]) => `${x} ${1 - y}`).join();
  });
}

const Graph: FunctionComponent<Props> = ({
  fullPoints,
  optimizedPoints,
}: RenderableProps<Props>) => {
  const fullPointsPath = useToPath(fullPoints);
  const optimizedPath = useToPath(optimizedPoints);

  // A bit hacky, but if the fullPoints is a string, it's an SVG path
  // but we need to flip it so the origin is in the bottom left.
  const fullPathStyle = useComputed(() =>
    typeof fullPoints.value === 'string'
      ? 'transform: scaleY(-1); transform-origin: 50% 50%;'
      : '',
  );

  return (
    <svg class={styles.graphSvg} viewBox="0 0 1 1">
      <path
        style={fullPathStyle}
        d={fullPointsPath}
        stroke="red"
        fill="none"
        stroke-width="0.005"
      />
      <path d={optimizedPath} stroke="white" fill="none" stroke-width="0.005" />
    </svg>
  );
};

export { Graph as default };
