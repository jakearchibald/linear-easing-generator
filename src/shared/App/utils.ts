import swURL from 'service-worker:workers/sw';

const isSafari =
  /Safari\//.test(navigator.userAgent) &&
  !/Chrom(e|ium)\//.test(navigator.userAgent);

function onControllerChange() {
  return new Promise<void>((resolve) => {
    navigator.serviceWorker.addEventListener(
      'controllerchange',
      () => resolve(),
      { once: true },
    );
  });
}

export async function addServiceWorker() {
  console.warn('Service worker not set up yet');
  return;
  if (!__PRODUCTION__) return;
  // Firefox in private browsing doesn't support service workers
  if (!navigator.serviceWorker) return;

  // I keep getting reports of stuck pages from iOS Safari users.
  // It happens when there's a service worker update.
  // There's some kind of browser bug there that's intermittent, and difficult to reproduce.
  // So, for now, I'm going to ditch service workers in Safari.
  if (isSafari) return;

  navigator.serviceWorker.register(swURL);
  let hadPreviousController = !!navigator.serviceWorker.controller;

  while (true) {
    await onControllerChange();

    // Don't reload for the first controller (eg initial sw registration).
    if (hadPreviousController) {
      // Reload all tabs when there's an update.
      // This only happens when activatePendingSw() is called.
      location.reload();
      return;
    }

    hadPreviousController = true;
  }
}

export async function swUpdatePending(): Promise<boolean> {
  // Firefox in private browsing doesn't support service workers
  if (!navigator.serviceWorker || isSafari) return false;
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return false;
  return !!reg.waiting;
}

export async function activatePendingSw(): Promise<void> {
  // Firefox in private browsing doesn't support service workers
  if (!navigator.serviceWorker || isSafari) return;
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg || !reg.waiting) throw Error('No pending service worker');
  reg.waiting.postMessage('skipWaiting');
}
