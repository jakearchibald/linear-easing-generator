import { h, Fragment, RenderableProps, FunctionComponent } from 'preact';
import { useRef, useLayoutEffect, useCallback } from 'preact/hooks';
import { EditorView } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState } from '@codemirror/state';

import {
  lineNumbers,
  highlightActiveLineGutter,
  highlightSpecialChars,
  highlightActiveLine,
  keymap,
  drawSelection,
  ViewUpdate,
} from '@codemirror/view';
import { indentOnInput, bracketMatching } from '@codemirror/language';
import {
  history,
  defaultKeymap,
  historyKeymap,
  indentWithTab,
} from '@codemirror/commands';
import {
  closeBrackets,
  autocompletion,
  closeBracketsKeymap,
  completionKeymap,
} from '@codemirror/autocomplete';
import { Signal } from '@preact/signals';

const extensions = () => [
  lineNumbers(),
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  bracketMatching(),
  closeBrackets(),
  autocompletion(),
  highlightActiveLine(),
  drawSelection(),
  keymap.of([
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...historyKeymap,
    ...completionKeymap,
    indentWithTab,
  ]),
  EditorView.lineWrapping,
  oneDark,
];

interface Props {
  value: string;
  onInput?: (value: string) => void;
  error: Signal<string>;
  highlighting: 'js' | 'svg-path';
}

const Editor: FunctionComponent<Props> = ({
  value,
  onInput,
  error,
  highlighting,
}: RenderableProps<Props>) => {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const currentValueRef = useRef<string>('');
  const lastPropValueRef = useRef<string>(value);

  // Initial setup of the editor
  useLayoutEffect(() => {
    // Handle updates to the editor
    const updateListener = EditorView.updateListener.of(
      (update: ViewUpdate) => {
        if (!update.docChanged) return;
        const newValue = update.state.doc.toString();
        currentValueRef.current = newValue;
        if (newValue === lastPropValueRef.current) return;
        lastPropValueRef.current = newValue;
        onInput?.(newValue);
      },
    );

    editorViewRef.current = new EditorView({
      extensions: [...extensions(), updateListener],
      parent: editorContainerRef.current!,
    });

    return () => {
      editorViewRef.current!.destroy();
    };
  }, []);

  // Handle changes to the value prop
  useLayoutEffect(() => {
    lastPropValueRef.current = value;

    // Exit early if the external component is just giving us the current value.
    if (value === currentValueRef.current) return;

    editorViewRef.current!.dispatch({
      changes: { from: 0, to: currentValueRef.current.length, insert: value },
    });

    currentValueRef.current = value;
  }, [value]);

  return (
    <div>
      <div ref={editorContainerRef} />
      <div>{error.value}</div>
    </div>
  );
};

export { Editor as default };
