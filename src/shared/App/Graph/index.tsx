import { Signal, useComputed } from '@preact/signals';
import { h, Fragment, RenderableProps, FunctionComponent } from 'preact';
import { useRef, useLayoutEffect, useCallback } from 'preact/hooks';
import { LinearData } from 'shared-types/index';

interface Props {
  fullPoints: Signal<LinearData>;
}

const Graph: FunctionComponent<Props> = ({
  fullPoints,
}: RenderableProps<Props>) => {
  const fullPointsPath = useComputed(() => {
    if (!fullPoints.value) return '';
    return 'M ' + fullPoints.value.map(([x, y]) => `${x} ${1 - y}`).join();
  });

  return (
    <svg viewBox="0 0 1 1">
      <path d={fullPointsPath} stroke="red" fill="none" stroke-width="0.005" />
    </svg>
  );
};

export { Graph as default };
