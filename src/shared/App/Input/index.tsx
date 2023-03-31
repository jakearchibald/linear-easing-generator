import { Signal, useComputed } from '@preact/signals';
import { h, RenderableProps, FunctionComponent } from 'preact';
import { CodeHighlight, CodeType } from '../types';
import InputType from './InputType';
import Editor from '../Editor';
import 'add-css:./styles.module.css';
import * as styles from './styles.module.css';
import * as sharedStyles from '../styles.module.css';

interface Props {
  code: Signal<string>;
  codeType: Signal<CodeType>;
  error: Signal<string>;
  onChange: (code: string, codeType: CodeType) => void;
}

const Input: FunctionComponent<Props> = ({
  code,
  codeType,
  error,
  onChange,
}: RenderableProps<Props>) => {
  const editorHighlight = useComputed(() =>
    codeType.value == CodeType.JS ? CodeHighlight.JS : CodeHighlight.SVG,
  );

  return (
    <div>
      <div
        class={[sharedStyles.sectionHeader, styles.inputSectionHeader].join(
          ' ',
        )}
      >
        <div class={sharedStyles.sectionHeaderTitle}>
          <h2>Input</h2>
          <p>Provide easing as JavaScript or SVG</p>
        </div>
        <InputType
          type={codeType}
          onChange={(val) => onChange(code.value, val)}
        />
      </div>
      <Editor
        error={error}
        code={code}
        onInput={(val) => onChange(val, codeType.value)}
        language={editorHighlight}
      />
    </div>
  );
};

export { Input as default };
