import { Signal, useComputed, useSignalEffect } from '@preact/signals';
import { h, Fragment, RenderableProps, FunctionComponent } from 'preact';
import 'add-css:./styles.module.css';
import * as styles from './styles.module.css';
import { useEffect, useRef } from 'preact/hooks';

interface Props {
  linear: Signal<string[]>;
  slightlyOptimizedLinear: Signal<string[]>;
}

const duration = 2000;
const gap = 500;
const animOpts = {
  duration,
  fill: 'forwards',
} as const;

const anim = (
  el: HTMLElement,
  easing: string,
  keyframes: Keyframe[] | PropertyIndexedKeyframes,
) => el.animate(keyframes, { ...animOpts, easing }).finished;

const useLinearValue = (linear: Signal<string[]>) =>
  useComputed(() =>
    linear.value.length === 0 ? '' : `linear(${linear.value.join()})`,
  );

const Demos: FunctionComponent<Props> = ({
  slightlyOptimizedLinear,
  linear,
}: RenderableProps<Props>) => {
  const slightlyOptimizedLinearStr = useLinearValue(slightlyOptimizedLinear);
  const linearStr = useLinearValue(linear);
  const demos = useRef<HTMLDivElement>(null);
  const slightlyOptimizedTranslateEl = useRef<HTMLDivElement>(null);
  const translateEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let stop = false;

    (async () => {
      while (!stop) {
        await Promise.all([
          anim(
            slightlyOptimizedTranslateEl.current!,
            slightlyOptimizedLinearStr.value,
            {
              transform: ['translateX(0)', 'translateX(100%)'],
            },
          ),
          anim(translateEl.current!, linearStr.value, {
            transform: ['translateX(0)', 'translateX(100%)'],
          }),
        ]);

        await document.body.animate(null, gap).finished;

        if (stop) break;

        await Promise.all([
          anim(
            slightlyOptimizedTranslateEl.current!,
            slightlyOptimizedLinearStr.value,
            {
              transform: ['translateX(100%)', 'translateX(0)'],
            },
          ),
          anim(translateEl.current!, linearStr.value, {
            transform: ['translateX(100%)', 'translateX(0)'],
          }),
        ]);

        await document.body.animate(null, gap).finished;
      }
    })();

    return () => (stop = true);
  }, []);

  useSignalEffect(() => {
    if (slightlyOptimizedLinearStr.value === '' || linearStr.value === '')
      return;

    const slightly = [slightlyOptimizedTranslateEl.current!].flatMap((el) =>
      el.getAnimations(),
    );
    const optim = [translateEl.current!].flatMap((el) => el.getAnimations());

    for (const anim of slightly) {
      anim.effect!.updateTiming({ easing: slightlyOptimizedLinearStr.value });
    }

    for (const anim of optim) {
      anim.effect!.updateTiming({ easing: linearStr.value });
    }
  });

  return (
    <div ref={demos} class={styles.demos}>
      <div class={styles.translate}>
        <div ref={slightlyOptimizedTranslateEl}>
          <div class={styles.demoBox}>Original</div>
        </div>
        <div ref={translateEl}>
          <div class={styles.demoBox}>Optimized</div>
        </div>
      </div>
    </div>
  );
};

export { Demos as default };
