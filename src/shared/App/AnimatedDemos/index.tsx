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
}

const gap = 500;

const anim = (
  el: HTMLElement,
  easing: string,
  duration: number,
  keyframes: Keyframe[] | PropertyIndexedKeyframes,
) => el.animate(keyframes, { fill: 'forwards', duration, easing }).finished;

const useLinearValue = (linear: Signal<string[]>) =>
  useComputed(() =>
    linear.value.length === 0 ? '' : `linear(${linear.value.join()})`,
  );

const Demos: FunctionComponent<Props> = ({
  slightlyOptimizedLinear,
  linear,
}: RenderableProps<Props>) => {
  const durationInputValue = useSignal('2000');
  const duration = useComputed(() => Number(durationInputValue.value) || 2000);
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
              transform: ['translateX(0)', 'translateX(100%)'],
            },
          ),
          anim(translateEl.current!, linearStr.value, duration.value, {
            transform: ['translateX(0)', 'translateX(100%)'],
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
              transform: ['translateX(100%)', 'translateX(0)'],
            },
          ),
          anim(translateEl.current!, linearStr.value, duration.value, {
            transform: ['translateX(100%)', 'translateX(0)'],
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
    <div style={{ display: 'none' }}>
      <p>
        <label>
          Duration:{' '}
          <input
            type="number"
            value={durationInputValue}
            onInput={(event) =>
              (durationInputValue.value = (
                event.target as HTMLInputElement
              ).value)
            }
          />
          ms
        </label>
      </p>
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
    </div>
  );
};

export { Demos as default };
