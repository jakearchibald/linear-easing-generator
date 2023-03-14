import { h, RenderableProps, FunctionComponent } from 'preact';
import { useRef, useLayoutEffect, useEffect } from 'preact/hooks';
import { EditorView } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { cssLanguage } from '@codemirror/lang-css';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState, Compartment } from '@codemirror/state';
import { ReadonlySignal, signal, useSignalEffect } from '@preact/signals';
import { CodeHighlight } from '../types';

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
  code: ReadonlySignal<string>;
  onInput?: (value: string) => void;
  error?: ReadonlySignal<string>;
  language: ReadonlySignal<CodeHighlight>;
  readOnly?: boolean;
}

const highlighting = {
  [CodeHighlight.JS]: javascript,
  [CodeHighlight.CSS]: () => cssLanguage,
  [CodeHighlight.SVG]: () => [],
} as const;

const Editor: FunctionComponent<Props> = ({
  code,
  onInput,
  error = signal(''),
  language,
  readOnly,
}: RenderableProps<Props>) => {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const lastPropValueRef = useRef<string>('');
  const onInputRef = useRef<typeof onInput>(undefined);
  const languageCompartment = useRef<Compartment | null>(null);
  const readOnlyCompartment = useRef<Compartment | null>(null);

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
    readOnlyCompartment.current = new Compartment();

    editorViewRef.current = new EditorView({
      extensions: [
        ...extensions(),
        languageCompartment.current.of([]),
        readOnlyCompartment.current.of([]),
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

    const currentLength = lastPropValueRef.current.length;

    lastPropValueRef.current = code.value;

    editorViewRef.current!.dispatch({
      changes: {
        from: 0,
        to: currentLength,
        insert: code.value,
      },
    });
  });

  useSignalEffect(() => {
    editorViewRef.current!.dispatch({
      effects: languageCompartment.current!.reconfigure(
        highlighting[language.value](),
      ),
    });
  });

  useEffect(() => {
    editorViewRef.current!.dispatch({
      effects: readOnlyCompartment.current!.reconfigure(
        EditorState.readOnly.of(readOnly || false),
      ),
    });
  }, [readOnly]);

  return (
    <div>
      <div ref={editorContainerRef} />
      <div>{error}</div>
    </div>
  );
};

export { Editor as default };
