import { Signal, useComputed, useSignalEffect } from '@preact/signals';
import { h, RenderableProps, FunctionComponent, Fragment } from 'preact';
import { useRef } from 'preact/hooks';
import { CodeHighlight, CodeType } from '../types';
import Editor from '../Editor';
import * as sharedStyles from '../styles.module.css';
import { defaultJS, defaultSVG } from '../demos';
import Select from '../Select';

function useCachedFormatCodes(
  code: Signal<string>,
  codeType: Signal<CodeType>,
) {
  const lastJSCode = useRef(defaultJS.code);
  const lastSVGCode = useRef(defaultSVG.code);

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
    <>
      <div class={sharedStyles.sectionHeader}>
        <div class={sharedStyles.sectionHeaderTitle}>
          <h2>Input</h2>
          <p>Provide easing as JavaScript or SVG</p>
        </div>
        <label class={sharedStyles.selectLabel}>
          <span class={sharedStyles.labelTextEnd}>Format</span>
          <Select value={codeTypeString} onChange={onSelectChange}>
            <option value={CodeType.JS}>JS</option>
            <option value={CodeType.SVG}>SVG</option>
          </Select>
        </label>
      </div>
      <Editor
        error={error}
        code={code}
        onInput={(val) => onChange(val, codeType.value)}
        language={editorHighlight}
      />
    </>
  );
};

export { Input as default };
