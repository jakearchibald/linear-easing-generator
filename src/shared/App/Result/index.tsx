import { Signal, useComputed } from '@preact/signals';
import { h, Fragment, RenderableProps, FunctionComponent } from 'preact';
import { useRef, useLayoutEffect, useCallback } from 'preact/hooks';
import { LinearData } from 'shared-types/index';

const trailingZeros = /\.?0+$/;
const initialZero = /^0\./;

interface Props {
  points: Signal<LinearData | null>;
  round: Signal<number>;
}

const Result: FunctionComponent<Props> = ({
  points,
  round,
}: RenderableProps<Props>) => {
  const value = useComputed(() => {
    if (!points.value) return '';
    const indexesWithRedundantX = new Set();
    const maxDelta = 1 / 10 ** round.value;

    // Figure out entries that don't need an explicit position value
    for (const [i, [x]] of points.value.entries()) {
      // If the first item's position is 0, then we don't need to state the position
      if (i === 0) {
        if (x === 0) indexesWithRedundantX.add(i);
        continue;
      }
      // If the last entry's position is 1, and the item before it is less than 1, then we don't need to state the position
      if (i === points.value.length - 1) {
        const previous = points.value[i - 1][0];
        if (previous <= 1) indexesWithRedundantX.add(i);
        continue;
      }

      // If the position is the average of the previous and next positions, then we don't need to state the position
      const previous = points.value[i - 1][0];
      const next = points.value[i + 1][0];

      const averagePos = (next - previous) / 2 + previous;
      const delta = Math.abs(x - averagePos);

      if (delta < maxDelta) indexesWithRedundantX.add(i);
    }

    let output = 'linear(';

    for (const [i, [x, y]] of points.value.entries()) {
      if (i !== 0) output += ', ';
      output += y
        .toFixed(round.value)
        .replace(trailingZeros, '')
        .replace(initialZero, '.');

      if (!indexesWithRedundantX.has(i)) {
        output +=
          ' ' +
          (x * 100)
            .toFixed(Math.max(0, round.value - 2))
            .replace(trailingZeros, '') +
          '%';
      }
    }

    output += ')';

    return output;
  });

  return <p>{value}</p>;
};

export { Result as default };

/*

// Cycle through fixed points
// If first item, and x is 0, eliminate x
// If last item, and (x is 1 and last item is less than 1), or x is same as last item, eliminate
// If x is average of previous two points, eliminate

const indexesWithRedundantX = new Set();

for (const [i, point] of fixedPoints.entries()) {
  if (i === 0) {
    if (point[0] === '0') {
      indexesWithRedundantX.add(i);
    }
    continue;
  }
  if (i === fixedPoints.length - 1) {
    const previous = easingPoints[i - 1].input;
    if (previous <= 1) {
      indexesWithRedundantX.add(i);
    }
    continue;
  }

  const previous = easingPoints[i - 1].input;
  const next = easingPoints[i + 1].input;

  if (((next - previous) / 2 + previous).toFixed(fixed).replace(trailingZeros, '') === point[0]) {
    indexesWithRedundantX.add(i);
  }
}

let outputTest = 'linear(';
for (const [i, point] of fixedPoints.entries()) {
  if (i !== 0) outputTest += ', ';
  outputTest += point[1];

  if (!indexesWithRedundantX.has(i)) {
    outputTest += ' ' + (simplePoints[i][0] * 100).toFixed(Math.max(fixed - 2, 0)).replace(trailingZeros, '') + '%';
  }
}

output.textContent = outputTest + ')';
*/
