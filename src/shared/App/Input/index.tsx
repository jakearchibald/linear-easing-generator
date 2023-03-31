import { Signal, useComputed, useSignalEffect } from '@preact/signals';
import { h, RenderableProps, FunctionComponent } from 'preact';
import { useRef } from 'preact/hooks';
import { CodeHighlight, CodeType } from '../types';
import Editor from '../Editor';
import 'add-css:./styles.module.css';
import * as styles from './styles.module.css';
import * as sharedStyles from '../styles.module.css';
import { bounce, materialEmphasized } from '../demos';
import Select from '../Select';

function useCachedFormatCodes(
  code: Signal<string>,
  codeType: Signal<CodeType>,
) {
  const lastJSCode = useRef(bounce.code);
  const lastSVGCode = useRef(materialEmphasized.code);

  useSignalEffect(() => {
    if (codeType.value === CodeType.JS) {
      lastJSCode.current = code.value;
    } else {
      lastSVGCode.current = code.value;
    }
  });

  return { [CodeType.JS]: lastJSCode, [CodeType.SVG]: lastSVGCode };
}

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
  const codeTypeString = useComputed(() => String(codeType.value));
  const lastCodes = useCachedFormatCodes(code, codeType);

  function onSelectChange(newVal: string) {
    const newValNum = Number(newVal) as CodeType;
    onChange(lastCodes[newValNum].current, newValNum);
  }

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
        <Select value={codeTypeString} onChange={onSelectChange}>
          <option value={CodeType.JS}>JS</option>
          <option value={CodeType.SVG}>SVG</option>
        </Select>
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
