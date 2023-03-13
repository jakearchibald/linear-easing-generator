import { Signal, useComputed, useSignalEffect } from '@preact/signals';
import { LinearData } from 'shared-types/index';

export default function useLinearSyntax(
  points: Signal<LinearData | null>,
  round: Signal<number>,
): Signal<string[]> {
  return useComputed(() => {
    if (!points.value) return [];
    const xFormat = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: Math.max(round.value - 2, 0),
    });
    const yFormat = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: round.value,
    });

    const pointsValue = points.value;
    const valuesWithRedundantX = new Set<[number, number]>();
    const maxDelta = 1 / 10 ** round.value;

    // Figure out entries that don't need an explicit position value
    for (const [i, value] of pointsValue.entries()) {
      const [x] = value;
      // If the first item's position is 0, then we don't need to state the position
      if (i === 0) {
        if (x === 0) valuesWithRedundantX.add(value);
        continue;
      }
      // If the last entry's position is 1, and the item before it is less than 1, then we don't need to state the position
      if (i === pointsValue.length - 1) {
        const previous = pointsValue[i - 1][0];
        if (x === 1 && previous <= 1) valuesWithRedundantX.add(value);
        continue;
      }

      // If the position is the average of the previous and next positions, then we don't need to state the position
      const previous = pointsValue[i - 1][0];
      const next = pointsValue[i + 1][0];

      const averagePos = (next - previous) / 2 + previous;
      const delta = Math.abs(x - averagePos);

      if (delta < maxDelta) valuesWithRedundantX.add(value);
    }

    // Group into sections with same y
    const groupedValues: LinearData[] = [[pointsValue[0]]];

    for (const value of pointsValue.slice(1)) {
      if (value[1] === groupedValues.at(-1)![0][1]) {
        groupedValues.at(-1)!.push(value);
      } else {
        groupedValues.push([value]);
      }
    }

    const outputValues = groupedValues.map((group) => {
      const yValue = yFormat.format(group[0][1]);

      const regularValue = group
        .map((value) => {
          const [x] = value;
          let output = yValue;

          if (!valuesWithRedundantX.has(value)) {
            output += ' ' + xFormat.format(x * 100) + '%';
          }

          return output;
        })
        .join(', ');

      if (group.length === 1) return regularValue;

      // Maybe it's shorter to provide a value that skips steps?
      const xVals = [group[0][0], group.at(-1)![0]];
      const positionalValues = xVals
        .map((x) => xFormat.format(x * 100) + '%')
        .join(' ');

      const skipValue = `${yValue} ${positionalValues}`;

      return skipValue.length > regularValue.length ? regularValue : skipValue;
    });

    return outputValues;
  });
}
