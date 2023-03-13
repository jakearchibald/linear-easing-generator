import { Signal, useComputed, useSignalEffect } from '@preact/signals';

export default function useFriendlyLinearCode(
  parts: Signal<string[]>,
): Signal<string> {
  return useComputed(() => {
    if (parts.value.length === 0) return '';

    let outputStart = ':root {\n  --easing: linear(';
    let outputEnd = ');\n}';
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

    if (lines.length === 1) {
      return outputStart + lines[0] + outputEnd;
    }

    return outputStart + '\n    ' + lines.join('\n    ') + '\n  ' + outputEnd;
  });
}
