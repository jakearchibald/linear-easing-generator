import { Signal, useComputed } from '@preact/signals';

const lineLength = 80;

export default function useFriendlyLinearCode(
  parts: Signal<string[]>,
  name: Signal<string>,
): Signal<string> {
  return useComputed(() => {
    if (parts.value.length === 0) return '';

    let outputStart = ':root {\n';
    let linearStart = `  --${name}-easing: linear(`;
    let linearEnd = ');';
    let outputEnd = '\n}';
    let lines = [];
    let line = '';

    const lineIndentSize = 4;

    for (const part of parts.value) {
      // 1 for comma
      if (line.length + part.length + lineIndentSize + 1 > lineLength) {
        lines.push(line + ',');
        line = '';
      }
      if (line) line += ', ';
      line += part;
    }

    if (line) lines.push(line);

    if (
      lines.length === 1 &&
      linearStart.length + lines[0].length + linearEnd.length < lineLength
    ) {
      return outputStart + linearStart + lines[0] + linearEnd + outputEnd;
    }

    return (
      outputStart +
      linearStart +
      '\n    ' +
      lines.join('\n    ') +
      '\n  ' +
      linearEnd +
      outputEnd
    );
  });
}
