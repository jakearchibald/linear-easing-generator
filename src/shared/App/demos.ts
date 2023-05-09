import { CodeType } from './types';

const bounceCode = `self.bounce = function(pos) {
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

const elasticCode = `self.elastic = function(x) {
  if (x === 0 || x === 1) return x;
  const c4 = (2 * Math.PI) / 3;
  return Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}`;

const springCode = `const [duration, func] = createSpring({
  mass: 1,
  stiffness: 100,
  damping: 10,
  velocity: 0,
});

/*
  Export your easing function as a global.
  The name you use here will appear in the output.
  The easing function must take a number as input,
  where 0 is the start, and 1 is the end.
  It must return the 'eased' value.
*/
self.spring = func;
/*
  Some easings have an ideal duration, like this one.
  Export it to the global, and it will be used in the output.
*/
self.duration = duration;

function createSpring({ mass, stiffness, damping, velocity }) {
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  const wd = zeta < 1 ? w0 * Math.sqrt(1 - zeta * zeta) : 0;
  const b = zeta < 1 ? (zeta * w0 + -velocity) / wd : -velocity + w0;

  function solver(t) {
    if (zeta < 1) {
      t =
        Math.exp(-t * zeta * w0) *
        (1 * Math.cos(wd * t) + b * Math.sin(wd * t));
    } else {
      t = (1 + b * t) * Math.exp(-t * w0);
    }

    return 1 - t;
  }

  const duration = (() => {
    const step = 1 / 6;
    let time = 0;

    while (true) {
      if (Math.abs(1 - solver(time)) < 0.001) {
        const restStart = time;
        let restSteps = 1;
        while (true) {
          time += step;
          if (Math.abs(1 - solver(time)) >= 0.001) break;
          restSteps++;
          if (restSteps === 16) return restStart;
        }
      }
      time += step;
    }
  })();

  return [duration * 1000, (t) => solver(duration * t)];
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

export const spring = {
  codeType: CodeType.JS,
  code: springCode,
};

export const defaultJS = spring;
export const defaultSVG = materialEmphasized;
