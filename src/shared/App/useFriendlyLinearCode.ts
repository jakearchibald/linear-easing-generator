import { Signal, useComputed, useSignalEffect } from '@preact/signals';

export default function useFriendlyLinearCode(
  parts: Signal<string[]>,
): Signal<string> {
  return useComputed(() => {
    if (parts.value.length === 0) return '';

    let outputStart = ':root {\n';
    let linearStart = '  --custom-easing: linear(';
    let linearEnd = ');';
    let outputEnd = '\n}';
    let lines = [];
    let line = '';

    for (const part of parts.value) {
      if (line.length + part.length > 74) {
        lines.push(line + ',');
        line = '';
      }
      if (line) line += ', ';
      line += part;
    }

    if (line) lines.push(line);

    if (
      lines.length === 1 &&
      linearStart.length + lines[0].length + linearEnd.length < 80
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
