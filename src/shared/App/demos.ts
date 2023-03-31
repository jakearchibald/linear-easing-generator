import { CodeType } from './types';

const bounceCode = `// Write/paste an 'easing' function:
function easing(pos) {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (pos < 1 / d1) {
    return n1 * pos * pos;
  } else if (pos < 2 / d1) {
    return n1 * (pos -= 1.5 / d1) * pos + 0.75;
  } else if (pos < 2.5 / d1) {
    return n1 * (pos -= 2.25 / d1) * pos + 0.9375;
  } else {
    return n1 * (pos -= 2.625 / d1) * pos + 0.984375;
  }
}`;

const materialEmphasizedCode = `M 0,0
C 0.05, 0, 0.133333, 0.06, 0.166666, 0.4
C 0.208333, 0.82, 0.25, 1, 1, 1`;

const elasticCode = `function easing(x) {
  if (x === 0 || x === 1) return x;
  const c4 = (2 * Math.PI) / 3;
  return Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}`;

export const bounce = {
  codeType: CodeType.JS,
  code: bounceCode,
};

export const materialEmphasized = {
  codeType: CodeType.SVG,
  code: materialEmphasizedCode,
};

export const elastic = {
  codeType: CodeType.JS,
  code: elasticCode,
};
