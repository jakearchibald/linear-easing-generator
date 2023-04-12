import * as styles from '../styles.module.css';
import { doAbortable } from '../utils';
import type {
  LinearData,
  PostMessageError,
  ProcessResult,
} from 'shared-types/index';
import { CodeType } from '../types';

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

export class ProcessScriptEasingError extends Error {
  fileName?: string;
  lineNumber?: number;
  columnNumber?: number;
  functionName?: string;

  constructor(postMessageError: PostMessageError) {
    super(postMessageError.message);
    this.name = 'ProcessScriptEasingError';

    if ('fileName' in postMessageError) {
      this.fileName = postMessageError.fileName;
      this.lineNumber = postMessageError.lineNumber;
      this.columnNumber = postMessageError.columnNumber;
      this.functionName = postMessageError.functionName;
    }
  }
}

export default function processEasing(
  signal: AbortSignal,
  script: string,
  type: CodeType,
): Promise<ProcessResult> {
  return (queue = queue
    .catch(() => {})
    .then(() =>
      doAbortable(signal, async (setAbortAction) => {
        // Check for validity of SVG on the main thread.
        // The parser in the worker is too permissive.
        if (type === CodeType.SVG) {
          if (
            !CSS.supports(`clip-path: path("${script.replaceAll('\n', ' ')}")`)
          ) {
            throw new TypeError('Invalid SVG path');
          }
        }

        const { port1, port2 } = new MessageChannel();

        await loaded;

        const done = () =>
          iframe!.contentWindow!.postMessage(
            { action: 'terminate-worker' },
            '*',
          );

        setAbortAction(done);

        const resultPromise = new Promise<ProcessResult>((resolve, reject) => {
          port1.onmessage = ({ data }) => {
            if (data.error) reject(new ProcessScriptEasingError(data.error));
            else {
              resolve(data.result);
            }

            done();
          };
        });

        iframe!.contentWindow!.postMessage(
          {
            action: type === CodeType.JS ? 'process-script' : 'process-svg',
            script,
            port: port2,
          },
          '*',
          [port2],
        );

        return resultPromise;
      }),
    )) as Promise<ProcessResult>;
}
