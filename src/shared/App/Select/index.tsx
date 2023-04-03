import { Signal, useSignal } from '@preact/signals';
import { h, RenderableProps, FunctionComponent } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import 'add-css:./styles.module.css';
import * as styles from './styles.module.css';

interface Props {
  value: Signal<string>;
  onChange: (value: string) => void;
}

const Select: FunctionComponent<Props> = ({
  value,
  onChange,
  children,
}: RenderableProps<Props>) => {
  const selectedOptionText = useSignal(' ');
  const selectEl = useRef<HTMLSelectElement>(null);

  useLayoutEffect(() => {
    const el = selectEl.current!;
    const selectedOption = el.options[el.selectedIndex];
    selectedOptionText.value = selectedOption.text;
  }, []);

  function onSelectChange() {
    const el = selectEl.current!;
    const selectedOption = el.options[el.selectedIndex];
    selectedOptionText.value = selectedOption.text;
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
