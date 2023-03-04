import { h, Fragment, RenderableProps, FunctionComponent } from 'preact';
import { useRef, useLayoutEffect, useCallback, useEffect } from 'preact/hooks';
import { EditorView } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState } from '@codemirror/state';
import { Signal, useSignalEffect } from '@preact/signals';
import type { Highlighting } from '../types';

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
  javascript(),
];

interface Props {
  code: Signal<string>;
  onInput?: (value: string) => void;
  error: Signal<string>;
  highlighting: Signal<Highlighting>;
}

const Editor: FunctionComponent<Props> = ({
  code,
  onInput,
  error,
  highlighting,
}: RenderableProps<Props>) => {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const lastPropValueRef = useRef<string>('');
  const onInputRef = useRef<typeof onInput>(undefined);

  useEffect(() => {
    onInputRef.current = onInput;
  }, [onInput]);

  // Initial setup of the editor
  useLayoutEffect(() => {
    // Handle updates to the editor
    const updateListener = EditorView.updateListener.of(
      (update: ViewUpdate) => {
        if (!update.docChanged) return;
        const newValue = update.state.doc.toString();
        if (newValue === lastPropValueRef.current) return;
        lastPropValueRef.current = newValue;
        onInputRef.current?.(newValue);
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
  useSignalEffect(() => {
    editorViewRef.current!.dispatch({
      changes: {
        from: 0,
        to: lastPropValueRef.current.length,
        insert: code.value,
      },
    });

    lastPropValueRef.current = code.value;
  });

  return (
    <div>
      <div ref={editorContainerRef} />
      <div>{error}</div>
    </div>
  );
};

export { Editor as default };
