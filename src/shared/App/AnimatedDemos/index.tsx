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
import { useMatchMedia } from '../utils';

interface Props {
  linear: Signal<string[]>;
  play: Signal<boolean>;
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
  });

const useLinearValue = (linear: Signal<string[]>) =>
  useComputed(() =>
    linear.value.length === 0 ? '' : `linear(${linear.value.join()})`,
  );

const Demos: FunctionComponent<Props> = ({
  slightlyOptimizedLinear,
  linear,
  duration,
  play,
}: RenderableProps<Props>) => {
  const slightlyOptimizedLinearStr = useLinearValue(slightlyOptimizedLinear);
  const linearStr = useLinearValue(linear);
  const computedPlayState = useComputed(() =>
    Boolean(play.value && slightlyOptimizedLinearStr.value && linearStr.value),
  );
  const demos = useRef<HTMLDivElement>(null);
  const slightlyOptimizedTranslateEl = useRef<HTMLDivElement>(null);
  const translateEl = useRef<HTMLDivElement>(null);

  // Initial setup
  useEffect(() => {
    let stop = false;

    // Watch for the media change, as the animation direction changes
    const horizonalAnimMedia = matchMedia(
      '(min-width: 1820px), (max-width: 1159px)',
    );
    let currentMediaListener: (() => void) | null = null;
    const mediaListener = () => currentMediaListener?.();
    horizonalAnimMedia.addEventListener('change', mediaListener);

    const getAxis = () => (horizonalAnimMedia.matches ? 'X' : 'Y');
    const getOutKeyframes = () => [
      `translate${getAxis()}(0)`,
      `translate${getAxis()}(100%)`,
    ];
    const getInKeyframes = () => [
      `translate${getAxis()}(100%)`,
      `translate${getAxis()}(0)`,
    ];

    (async () => {
      while (!stop) {
        const outAnims = [
          anim(
            slightlyOptimizedTranslateEl.current!,
            slightlyOptimizedLinearStr.value,
            duration.value,
            {
              transform: getOutKeyframes(),
            },
          ),
          anim(translateEl.current!, linearStr.value, duration.value, {
            transform: getOutKeyframes(),
          }),
        ];

        // Switch the keyframes if the media query changes
        currentMediaListener = () => {
          for (const anim of outAnims) {
            (anim.effect as KeyframeEffect).setKeyframes({
              transform: getOutKeyframes(),
            });
          }
        };

        await Promise.all(outAnims.map((a) => a.finished));
        await slightlyOptimizedTranslateEl.current!.animate(null, gap).finished;

        if (stop) break;

        const inAnims = [
          anim(
            slightlyOptimizedTranslateEl.current!,
            slightlyOptimizedLinearStr.value,
            duration.value,
            {
              transform: getInKeyframes(),
            },
          ),
          anim(translateEl.current!, linearStr.value, duration.value, {
            transform: getInKeyframes(),
          }),
        ];

        // Switch the keyframes if the media query changes
        currentMediaListener = () => {
          for (const anim of outAnims) {
            (anim.effect as KeyframeEffect).setKeyframes({
              transform: getInKeyframes(),
            });
          }
        };

        await Promise.all(inAnims.map((a) => a.finished));
        await slightlyOptimizedTranslateEl.current!.animate(null, gap).finished;
      }
    })();

    return () => {
      stop = true;
      horizonalAnimMedia.removeEventListener('change', mediaListener);
    };
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

  // Changes to play state
  useSignalEffect(() => {
    const anims = [
      slightlyOptimizedTranslateEl.current!,
      translateEl.current!,
    ].flatMap((el) => el.getAnimations());

    for (const anim of anims) {
      if (anim.playState === 'finished') continue;

      if (computedPlayState.value) {
        anim.play();
      } else {
        anim.pause();
      }
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
