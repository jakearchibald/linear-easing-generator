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
import { history, defaultKeymap, historyKeymap } from '@codemirror/commands';
import {
  closeBrackets,
  autocompletion,
  closeBracketsKeymap,
  completionKeymap,
} from '@codemirror/autocomplete';
import { usePrevious } from '../utils';

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
  ]),
  javascript(),
  oneDark,
];

interface Props {
  value: string;
  onInput?: (value: string) => void;
}

const Editor: FunctionComponent<Props> = ({
  value,
  onInput,
}: RenderableProps<Props>) => {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const currentValueRef = useRef<string>('');
  const lastPropValueRef = useRef<string>(value);

  // Handle updates to the editor
  const editorUpdateCallback = useCallback(
    (update: ViewUpdate) => {
      if (!update.docChanged) return;
      const newValue = update.state.doc.toString();
      if (newValue === lastPropValueRef.current) return;
      lastPropValueRef.current = newValue;
      onInput?.(newValue);
    },
    [value],
  );

  // Initial setup of the editor
  useLayoutEffect(() => {
    const updateListener = EditorView.updateListener.of(editorUpdateCallback);

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

  return <div ref={editorContainerRef} />;
};

export { Editor as default };
