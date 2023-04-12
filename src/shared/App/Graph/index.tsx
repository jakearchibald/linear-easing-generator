import { Signal, useComputed } from '@preact/signals';
import { h, Fragment, RenderableProps, FunctionComponent } from 'preact';
import { LinearData } from 'shared-types/index';
import 'add-css:./styles.module.css';
import * as styles from './styles.module.css';
import { logSignalUpdates, useElementSize } from '../utils';

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

function useCanvasBounds(points: Signal<LinearData | null>) {
  const [graphSVGRef, containerSize] = useElementSize();

  const valueBounds = useComputed(() => {
    const bounds = { x1: 0, y1: 0, x2: 1, y2: 1 };

    if (points.value === null) return bounds;

    for (const point of points.value) {
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
    const padding = 30;
    const paddingRight = 250;

    if (!containerSize.value) return { scale: 1, x1: 0, x2: 1, y1: 0, y2: 1 };

    const canvasUsableWidth =
      containerSize.value.width - (padding + paddingRight);

    const canvasUsableHeight = containerSize.value.height - padding * 2;
    const boundsWidth = valueBounds.value.x2 - valueBounds.value.x1;
    const boundsHeight = valueBounds.value.y2 - valueBounds.value.y1;

    let scale: number;

    if (boundsWidth / boundsHeight < canvasUsableWidth / canvasUsableHeight) {
      scale = canvasUsableHeight / boundsHeight;
    } else {
      scale = canvasUsableWidth / boundsWidth;
    }

    const canvasWidthToScale = containerSize.value.width / scale;
    const canvasHeightToScale = containerSize.value.height / scale;
    const x1 = valueBounds.value.x1 - padding / scale;
    const x2 = x1 + canvasWidthToScale;
    const y1 = valueBounds.value.y1 - (canvasHeightToScale - boundsHeight) / 2;
    const y2 = y1 + canvasHeightToScale;

    return { scale, x1, x2, y1, y2 };
  });

  return [graphSVGRef, canvasBounds] as const;
}

const Graph: FunctionComponent<Props> = ({
  fullPoints,
  optimizedPoints,
}: RenderableProps<Props>) => {
  const fullPointsPath = useToPath(fullPoints);
  const optimizedPath = useToPath(optimizedPoints);
  const [graphSVGRef, canvasBounds] = useCanvasBounds(optimizedPoints);

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
