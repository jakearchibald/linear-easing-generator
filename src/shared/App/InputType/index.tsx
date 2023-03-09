import { Signal, useComputed } from '@preact/signals';
import { h, Fragment, RenderableProps, FunctionComponent } from 'preact';
import { useRef, useLayoutEffect, useCallback } from 'preact/hooks';
import { CodeType } from '../types';

interface Props {
  type: Signal<CodeType>;
  onChange: (newType: CodeType) => void;
}

const InputType: FunctionComponent<Props> = ({
  type,
  onChange,
}: RenderableProps<Props>) => {
  const jsRef = useRef<HTMLInputElement>(null);

  return (
    <form
      onChange={() =>
        onChange(jsRef.current!.checked ? CodeType.JS : CodeType.SVG)
      }
    >
      <label>
        <input
          name="code-type"
          ref={jsRef}
          type="radio"
          checked={type.value === CodeType.JS}
        />
        <span>JS</span>
      </label>
      <label>
        <input
          name="code-type"
          type="radio"
          checked={type.value === CodeType.SVG}
        />
        <span>SVG</span>
      </label>
    </form>
  );
};

export { InputType as default };
