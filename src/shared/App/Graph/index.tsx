import { Signal, useComputed, useSignal } from '@preact/signals';
import { h, Fragment, RenderableProps, FunctionComponent } from 'preact';
import {
  useRef,
  useLayoutEffect,
  useCallback,
  useEffect,
  Ref,
} from 'preact/hooks';
import { LinearData } from 'shared-types/index';
import 'add-css:./styles.module.css';
import * as styles from './styles.module.css';
import { logSignalUpdates } from '../utils';

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

function useIdealSVGScale(
  graphSVGRef: Ref<SVGSVGElement>,
  points: Signal<LinearData | null>,
): Signal<number> {
  // Find out how far the values go out of bounds, where 0 is within bounds.
  const valueBounds = useComputed(() => {
    if (points.value === null) return [0, 0];
    const result = [0, 0];

    for (const point of points.value) {
      for (const [i, value] of point.entries()) {
        if (value >= 1) {
          result[i] = Math.max(result[i], value - 1);
        } else if (value <= 0) {
          result[i] = Math.max(result[i], value * -1);
        }
      }
    }

    return result;
  });

  // Container size where 1 is the shortest side and the other side is >= 1
  const containerSize: Signal<[number, number] | null> = useSignal(null);

  useLayoutEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const size = entries[0].contentBoxSize[0];

      if (size.inlineSize > size.blockSize) {
        containerSize.value = [size.inlineSize / size.blockSize, 1];
      } else {
        containerSize.value = [1, size.blockSize / size.inlineSize];
      }
    });

    observer.observe(graphSVGRef.current!);

    return () => observer.disconnect();
  }, []);

  const idealScale = useComputed(() => {
    if (containerSize.value === null) return 1;

    const fullGraphX = valueBounds.value[0] * 2 + 1;
    const fullGraphY = valueBounds.value[1] * 2 + 1;

    const xDiff = fullGraphX - containerSize.value[0];
    const yDiff = fullGraphY - containerSize.value[1];

    if (xDiff > yDiff) {
      return Math.min(1, containerSize.value[0] / fullGraphX);
    } else {
      return Math.min(1, containerSize.value[1] / fullGraphY);
    }
  });

  return idealScale;
}

const Graph: FunctionComponent<Props> = ({
  fullPoints,
  optimizedPoints,
}: RenderableProps<Props>) => {
  const fullPointsPath = useToPath(fullPoints);
  const optimizedPath = useToPath(optimizedPoints);
  const graphSVGRef = useRef<SVGSVGElement>(null);
  const idealScale = useIdealSVGScale(graphSVGRef, optimizedPoints);

  const graphSvgStyle = useComputed(
    () => `transform: scale(${idealScale.value})`,
  );

  // A bit hacky, but if the fullPoints is a string, it's an SVG path
  // but we need to flip it so the origin is in the bottom left.
  const fullPathStyle = useComputed(() =>
    typeof fullPoints.value === 'string'
      ? 'transform: scaleY(-1); transform-origin: 50% 50%;'
      : '',
  );

  return (
    <div class={styles.graphComponent}>
      <svg
        ref={graphSVGRef}
        class={styles.graphSvg}
        viewBox="0 0 100 100"
        style={graphSvgStyle}
      >
        <path class={styles.graphAxis} d="M 0 0 V 100 H 100" />
        <svg
          class={styles.pointsSvg}
          width="100"
          height="100"
          viewBox="0 0 1 1"
        >
          <path
            class={styles.fullPath}
            style={fullPathStyle}
            d={fullPointsPath}
          />
          <path class={styles.optimizedPath} d={optimizedPath} />
        </svg>
      </svg>
    </div>
  );
};

export { Graph as default };
