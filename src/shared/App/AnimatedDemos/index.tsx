import {
  Signal,
  useComputed,
  useSignal,
  useSignalEffect,
} from '@preact/signals';
import { h, Fragment, RenderableProps, FunctionComponent } from 'preact';
import 'add-css:./styles.module.css';
import * as styles from './styles.module.css';
import { useEffect, useRef } from 'preact/hooks';

interface Props {
  linear: Signal<string[]>;
  slightlyOptimizedLinear: Signal<string[]>;
  duration: Signal<number>;
}

const gap = 500;

const anim = (
  el: HTMLElement,
  easing: string,
  duration: number,
  keyframes: Keyframe[] | PropertyIndexedKeyframes,
) =>
  el.animate(keyframes, {
    fill: 'forwards',
    duration,
    easing: easing || 'linear',
  }).finished;

const useLinearValue = (linear: Signal<string[]>) =>
  useComputed(() =>
    linear.value.length === 0 ? '' : `linear(${linear.value.join()})`,
  );

const Demos: FunctionComponent<Props> = ({
  slightlyOptimizedLinear,
  linear,
  duration,
}: RenderableProps<Props>) => {
  const slightlyOptimizedLinearStr = useLinearValue(slightlyOptimizedLinear);
  const linearStr = useLinearValue(linear);
  const demos = useRef<HTMLDivElement>(null);
  const slightlyOptimizedTranslateEl = useRef<HTMLDivElement>(null);
  const translateEl = useRef<HTMLDivElement>(null);

  // Initial setup
  useEffect(() => {
    let stop = false;

    (async () => {
      while (!stop) {
        await Promise.all([
          anim(
            slightlyOptimizedTranslateEl.current!,
            slightlyOptimizedLinearStr.value,
            duration.value,
            {
              transform: ['translateY(0)', 'translateY(100%)'],
            },
          ),
          anim(translateEl.current!, linearStr.value, duration.value, {
            transform: ['translateY(0)', 'translateY(100%)'],
          }),
        ]);

        await document.body.animate(null, gap).finished;

        if (stop) break;

        await Promise.all([
          anim(
            slightlyOptimizedTranslateEl.current!,
            slightlyOptimizedLinearStr.value,
            duration.value,
            {
              transform: ['translateY(100%)', 'translateY(0)'],
            },
          ),
          anim(translateEl.current!, linearStr.value, duration.value, {
            transform: ['translateY(100%)', 'translateY(0)'],
          }),
        ]);

        await document.body.animate(null, gap).finished;
      }
    })();

    return () => (stop = true);
  }, []);

  // Updates to easing
  useSignalEffect(() => {
    if (slightlyOptimizedLinearStr.value === '' || linearStr.value === '') {
      return;
    }

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

  // Updates to duration
  useSignalEffect(() => {
    if (slightlyOptimizedLinearStr.value === '' || linearStr.value === '') {
      return;
    }

    const anims = [
      slightlyOptimizedTranslateEl.current!,
      translateEl.current!,
    ].flatMap((el) => el.getAnimations());

    for (const anim of anims) {
      anim.effect!.updateTiming({ duration: duration.value });
    }
  });

  return (
    <div ref={demos} class={styles.demos}>
      <div class={styles.translate}>
        <div ref={slightlyOptimizedTranslateEl}>
          <div class={[styles.demoBox, styles.unoptimizedDemoBox].join(' ')}>
            Input
          </div>
        </div>
        <div ref={translateEl}>
          <div class={styles.demoBox}>Output</div>
        </div>
      </div>
    </div>
  );
};

export { Demos as default };
