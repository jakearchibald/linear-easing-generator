import { Signal } from '@preact/signals';
import { h, RenderableProps, FunctionComponent } from 'preact';
import * as sharedStyles from '../styles.module.css';
import { useRef } from 'preact/hooks';
import { animateFrom } from '../utils';

interface Props {
  value: Signal<string>;
}

const CopyButton: FunctionComponent<Props> = ({
  value,
}: RenderableProps<Props>) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <button
      ref={buttonRef}
      class={sharedStyles.sectionHeaderIconButton}
      onClick={() => {
        navigator.clipboard.writeText(value.value);
        animateFrom(
          buttonRef.current!,
          { scale: 1.3 },
          { duration: 200, easing: 'ease-out' },
        );
      }}
    >
      <span class={sharedStyles.sectionHeaderIconButtonText}>Copy</span>
      <svg viewBox="0 96 960 960">
        <path d="M180 975q-24 0-42-18t-18-42V312h60v603h474v60H180Zm120-120q-24 0-42-18t-18-42V235q0-24 18-42t42-18h440q24 0 42 18t18 42v560q0 24-18 42t-42 18H300Zm0-60h440V235H300v560Zm0 0V235v560Z" />
      </svg>
    </button>
  );
};

export { CopyButton as default };
