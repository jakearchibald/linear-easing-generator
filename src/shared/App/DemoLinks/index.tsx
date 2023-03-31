import { Signal, useComputed } from '@preact/signals';
import { h, Fragment, RenderableProps, FunctionComponent } from 'preact';
import { useRef, useLayoutEffect, useCallback } from 'preact/hooks';
import { bounce, elastic, materialEmphasized } from '../demos';
import { State } from '../types';
import { getURLParamsFromState } from '../utils';

interface Props {
  onStateUpdate: (newState: Partial<State>) => void;
}

const demos = {
  Bounce: bounce,
  Elastic: elastic,
  'Material Design emphasized easing': materialEmphasized,
} as const;

const DemoLinks: FunctionComponent<Props> = ({
  onStateUpdate,
}: RenderableProps<Props>) => {
  return (
    <ul style={{ display: 'none' }}>
      {Object.entries(demos).map(([name, demo]) => (
        <li>
          <a
            href={`/?${getURLParamsFromState(demo)}`}
            onClick={(event) => {
              if (event.metaKey || event.ctrlKey) return;
              onStateUpdate(demo);
              event.preventDefault();
            }}
          >
            {name}
          </a>
        </li>
      ))}
    </ul>
  );
};

export { DemoLinks as default };
