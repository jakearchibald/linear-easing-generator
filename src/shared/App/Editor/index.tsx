import { h, RenderableProps, FunctionComponent } from 'preact';
import { useRef, useLayoutEffect, useEffect } from 'preact/hooks';
import { EditorView } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState, Compartment } from '@codemirror/state';
import { Signal, useSignalEffect } from '@preact/signals';
import { CodeType } from '../types';

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
];

interface Props {
  code: Signal<string>;
  onInput?: (value: string) => void;
  error: Signal<string>;
  language: Signal<CodeType>;
}

const Editor: FunctionComponent<Props> = ({
  code,
  onInput,
  error,
  language,
}: RenderableProps<Props>) => {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const lastPropValueRef = useRef<string>('');
  const onInputRef = useRef<typeof onInput>(undefined);
  const languageCompartment = useRef<Compartment | null>(null);

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

    languageCompartment.current = new Compartment();

    editorViewRef.current = new EditorView({
      extensions: [
        ...extensions(),
        languageCompartment.current.of([]),
        updateListener,
      ],
      parent: editorContainerRef.current!,
    });

    return () => {
      editorViewRef.current!.destroy();
    };
  }, []);

  // Handle changes to the value prop
  useSignalEffect(() => {
    if (code.value === lastPropValueRef.current) return;

    editorViewRef.current!.dispatch({
      changes: {
        from: 0,
        to: lastPropValueRef.current.length,
        insert: code.value,
      },
    });

    lastPropValueRef.current = code.value;
  });

  useSignalEffect(() => {
    const extension = language.value === CodeType.JS ? javascript() : [];

    editorViewRef.current!.dispatch({
      effects: languageCompartment.current!.reconfigure(extension),
    });
  });

  return (
    <div>
      <div ref={editorContainerRef} />
      <div>{error}</div>
    </div>
  );
};

export { Editor as default };
