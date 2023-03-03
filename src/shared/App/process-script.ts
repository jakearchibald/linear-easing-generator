import * as styles from './styles.module.css';
import { doAbortable } from './utils';
import type { LinearData } from 'shared-types/index';

const [iframe, loaded] = (() => {
  if (__PRERENDER__) return [null, null];
  const iframe = document.createElement('iframe');
  iframe.setAttribute('sandbox', 'allow-scripts');
  iframe.src = '/process-script/';
  iframe.className = styles.processScriptsIframe;
  const loaded = new Promise<void>(
    (resolve) => (iframe.onload = () => resolve()),
  );
  document.body.appendChild(iframe);
  return [iframe, loaded];
})();

let queue: Promise<any> = Promise.resolve();

export function processScriptEasing(
  signal: AbortSignal,
  script: string,
): Promise<LinearData> {
  return (queue = queue
    .catch(() => {})
    .then(() =>
      doAbortable(signal, async (setAbortAction) => {
        const { port1, port2 } = new MessageChannel();
        await loaded;

        const done = () =>
          iframe!.contentWindow!.postMessage(
            { action: 'terminate-worker' },
            '*',
          );

        setAbortAction(done);

        const resultPromise = new Promise<LinearData>((resolve, reject) => {
          port1.onmessage = ({ data }) => {
            if (data.error) reject(data.error);
            else resolve(data.result);

            done();
          };
        });

        iframe!.contentWindow!.postMessage(
          { action: 'process-script', script, port: port2 },
          '*',
          [port2],
        );

        return resultPromise;
      }),
    )) as Promise<LinearData>;
}
