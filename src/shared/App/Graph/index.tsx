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
  const containerSize: Signal<[width: number, height: number] | null> =
    useSignal(null);

  useLayoutEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const size = entries[0].contentBoxSize[0];
      containerSize.value = [size.inlineSize, size.blockSize];
    });

    observer.observe(graphSVGRef.current!);

    return () => observer.disconnect();
  }, []);

  const valueBounds = useComputed(() => {
    const bounds = { x1: 0, y1: 0, x2: 1, y2: 1 };

    if (optimizedPoints.value === null) return bounds;

    for (const point of optimizedPoints.value) {
      if (point[0] < bounds.x1) {
        bounds.x1 = point[0];
      } else if (point[0] > bounds.x2) {
        bounds.x2 = point[0];
      }

      const val = 1 - point[1];

      if (val < bounds.y1) {
        bounds.y1 = val;
      } else if (val > bounds.y2) {
        bounds.y2 = val;
      }
    }

    return bounds;
  });

  const canvasBounds = useComputed(() => {
    const padding = 60;
    if (!containerSize.value) return { scale: 1, x1: 0, x2: 1, y1: 0, y2: 1 };

    const canvasUsableWidth = containerSize.value[0] - padding * 2;
    const canvasUsableHeight = containerSize.value[1] - padding * 2;
    const boundsWidth = valueBounds.value.x2 - valueBounds.value.x1;
    const boundsHeight = valueBounds.value.y2 - valueBounds.value.y1;

    let scale: number;

    if (boundsWidth / boundsHeight < canvasUsableWidth / canvasUsableHeight) {
      scale = canvasUsableHeight / boundsHeight;
    } else {
      scale = canvasUsableWidth / boundsWidth;
    }

    const canvasWidthToScale = containerSize.value[0] / scale;
    const canvasHeightToScale = containerSize.value[1] / scale;
    const x1 = valueBounds.value.x1 - (canvasWidthToScale - boundsWidth) / 2;
    const x2 = x1 + canvasWidthToScale;
    const y1 = valueBounds.value.y1 - (canvasHeightToScale - boundsHeight) / 2;
    const y2 = y1 + canvasHeightToScale;

    return { scale, x1, x2, y1, y2 };
  });

  const canvasScale = useComputed(() => canvasBounds.value.scale);

  const svgViewBox = useComputed(
    () =>
      `${canvasBounds.value.x1 * canvasBounds.value.scale} ${
        canvasBounds.value.y1 * canvasBounds.value.scale
      } ${
        (canvasBounds.value.x2 - canvasBounds.value.x1) *
        canvasBounds.value.scale
      } ${
        (canvasBounds.value.y2 - canvasBounds.value.y1) *
        canvasBounds.value.scale
      }`,
  );

  const graphAxisPath = useComputed(
    () => `M 0 0 V ${canvasBounds.value.scale} H ${canvasBounds.value.scale}`,
  );

  const graphSubLinesPath = useComputed(() => {
    let line = '';

    const { scale, x1, x2, y1, y2 } = canvasBounds.value;

    for (let x = 0; x > x1; x -= 0.25) {
      line += `M ${x * scale} ${y1 * scale} V ${y2 * scale}`;
    }

    for (let x = 0; x < x2; x += 0.25) {
      line += `M ${x * scale} ${y1 * scale} V ${y2 * scale}`;
    }

    for (let y = 0; y > y1; y -= 0.25) {
      line += `M ${x1 * scale} ${y * scale} H ${x2 * scale}`;
    }

    for (let y = 0; y < y2; y += 0.25) {
      line += `M ${x1 * scale} ${y * scale} H ${x2 * scale}`;
    }

    return line;
  });

  // A bit hacky, but if the fullPoints is a string, it's an SVG path
  // but we need to flip it so the origin is in the bottom left.
  const fullPathStyle = useComputed(() =>
    typeof fullPoints.value === 'string'
      ? 'transform: scaleY(-1); transform-origin: 50% 50%;'
      : '',
  );

  return (
    <div class={styles.graphComponent}>
      <svg ref={graphSVGRef} class={styles.graphSvg} viewBox={svgViewBox}>
        <path class={styles.graphSublines} d={graphSubLinesPath} />
        <path class={styles.graphAxis} d={graphAxisPath} />
        <svg
          class={styles.pointsSvg}
          width={canvasScale}
          height={canvasScale}
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
