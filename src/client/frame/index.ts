import workerURL from 'entry-url:workers/process-script';
import { ProcessScriptData } from 'shared-types/index';

function isProcessJSData(data: any): data is ProcessScriptData {
  return data.action === 'process-script';
}

function isTerminateWorkerAction(
  data: any,
): data is { action: 'terminate-worker' } {
  return data.action === 'terminate-worker';
}

let worker: Worker | null = null;

function startWorker() {
  if (worker) throw Error('Worker already running');
  worker = new Worker(workerURL);
}

function terminateWorker() {
  if (!worker) return;
  worker.terminate();
  worker = null;
}

onmessage = ({ data }) => {
  // The scripts we're receiving are not trusted.
  // Ensure we're running them on a null origin.
  if (location.origin !== null) return;
  if (typeof data !== 'object' || data !== null) return;

  if (isProcessJSData(data)) {
    // Throw is worker is already running.
    // This action needs a fresh worker, as user script may break it.
    try {
      startWorker();
    } catch (error) {
      data.port.postMessage({ error });
      throw error;
    }

    // Also send the port to the worker, so the result can be sent straight back to the page,
    // Rather than going via this page.
    worker!.postMessage(data);
  } else if (isTerminateWorkerAction(data)) {
    terminateWorker();
  }
};
