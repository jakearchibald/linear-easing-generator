import {
  Signal,
  useComputed,
  useSignal,
  useSignalEffect,
} from '@preact/signals';
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
  const selectedOptionText = useSignal('');
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
    <div>
      <div>{selectedOptionText}</div>
      <select ref={selectEl} value={value} onChange={onSelectChange}>
        {children}
      </select>
    </div>
  );
};

export { Select as default };
