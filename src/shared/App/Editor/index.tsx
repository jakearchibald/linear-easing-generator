import { h, Fragment, RenderableProps, FunctionComponent } from 'preact';
import { useRef, useLayoutEffect } from 'preact/hooks';
import { EditorView } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark, oneDarkHighlightStyle } from '@codemirror/theme-one-dark';
import { EditorState } from '@codemirror/state';

import {
  lineNumbers,
  highlightActiveLineGutter,
  highlightSpecialChars,
  highlightActiveLine,
  keymap,
  drawSelection,
} from '@codemirror/view';
import {
  indentOnInput,
  syntaxHighlighting,
  bracketMatching,
} from '@codemirror/language';
import { history, defaultKeymap, historyKeymap } from '@codemirror/commands';
import {
  closeBrackets,
  autocompletion,
  closeBracketsKeymap,
  completionKeymap,
} from '@codemirror/autocomplete';

const extensions = [
  lineNumbers(),
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  syntaxHighlighting(oneDarkHighlightStyle, { fallback: true }),
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

interface Props {}

const Editor: FunctionComponent<Props> = (props: RenderableProps<Props>) => {
  const editorContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const view = new EditorView({
      extensions,
      parent: editorContainerRef.current!,
    });

    return () => view.destroy();
  }, []);

  return <div ref={editorContainerRef} />;
};

export { Editor as default };
