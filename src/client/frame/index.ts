import workerURL from 'entry-url:workers/process-script';
import { ProcessScriptData, PostMessageError } from 'shared-types/index';

// Null origins can't create workers from an external resource,
// so we need to fetch the script and create a blob URL.
const localWorkerURL = (async () => {
  const response = await fetch(workerURL);
  const text = await response.text();
  return URL.createObjectURL(new Blob([text], { type: 'text/javascript' }));
})();

function isProcessJSData(data: any): data is ProcessScriptData {
  return data.action === 'process-script';
}

function isTerminateWorkerAction(
  data: any,
): data is { action: 'terminate-worker' } {
  return data.action === 'terminate-worker';
}

let workerPromise: Promise<Worker> | null = null;

function startWorker() {
  if (workerPromise) throw Error('Worker already running');
  workerPromise = localWorkerURL.then((url) => new Worker(url));
}

async function terminateWorker() {
  if (!workerPromise) return;
  const lastWorkerPromise = workerPromise;
  workerPromise = null;

  (await lastWorkerPromise).terminate();
}

onmessage = async ({ data }) => {
  if (typeof data !== 'object' || data === null) return;

  if (isProcessJSData(data)) {
    // Throw if worker is already running.
    // This action needs a fresh worker, as user script may break it.
    try {
      startWorker();
    } catch (error) {
      const postMessageError: PostMessageError = {
        message: (error as Error).message,
      };
      data.port.postMessage({ error: postMessageError });
      throw error;
    }

    // Also send the port to the worker, so the result can be sent straight back to the page,
    // Rather than going via this page.
    (await workerPromise!).postMessage(data, [data.port]);
  } else if (isTerminateWorkerAction(data)) {
    terminateWorker();
  }
};
