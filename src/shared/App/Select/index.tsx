import { Signal, useComputed, useSignal } from '@preact/signals';
import { h, RenderableProps, FunctionComponent, JSX } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import 'add-css:./styles.module.css';
import * as styles from './styles.module.css';
import { ComponentChild } from 'preact';
import { VNode } from 'preact';

interface Props {
  value: Signal<string>;
  onChange: (value: string) => void;
}

const Select: FunctionComponent<Props> = ({
  value,
  onChange,
  children,
}: RenderableProps<Props>) => {
  const selectedOptionText = useComputed(() => {
    const childrenArray = (
      Array.isArray(children) ? children.flat() : [children]
    ) as ComponentChild[];

    const options = childrenArray.filter(
      (child) =>
        child &&
        typeof child === 'object' &&
        'type' in child &&
        child.type === 'option',
    ) as JSX.Element[];

    const selectedOption = options.find(
      (option) => String(option.props.value) === value.value,
    );

    const selectedOptionText = selectedOption
      ? selectedOption.props.children
      : '';

    return selectedOptionText as string;
  });

  const selectEl = useRef<HTMLSelectElement>(null);

  function onSelectChange() {
    const el = selectEl.current!;
    const selectedOption = el.options[el.selectedIndex];
    onChange(selectedOption.value);
  }

  return (
    <div class={styles.select}>
      <div class={styles.selectCurrent} aria-hidden="true">
        <span>{selectedOptionText}</span>
        <svg viewBox="0 0 8.65 3.02">
          <path d="M8.57.33 4.54 2.96a.42.42 0 0 1-.43 0L.08.33a.15.15 0 0 1 0-.27.43.43 0 0 1 .43 0l3.82 2.48L8.14.05a.43.43 0 0 1 .42 0 .15.15 0 0 1 0 .28Z" />
        </svg>
      </div>
      <select
        class={styles.realSelect}
        ref={selectEl}
        value={value}
        onChange={onSelectChange}
      >
        {children}
      </select>
    </div>
  );
};

export { Select as default };
