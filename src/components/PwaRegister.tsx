'use client';

import { useEffect } from 'react';

/** Check for a new service worker every 30 minutes while the app is open. */
const UPDATE_CHECK_MS = 30 * 60 * 1000;

/** Ask the active worker to refresh its cache every 6 hours. */
const CACHE_REFRESH_MS = 6 * 60 * 60 * 1000;

export default function PwaRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let updateTimer: ReturnType<typeof setInterval> | undefined;
    let cacheTimer: ReturnType<typeof setInterval> | undefined;
    let onFocus: (() => void) | undefined;
    let onVisible: (() => void) | undefined;
    let onControllerChange: (() => void) | undefined;

    const checkForUpdates = (registration: ServiceWorkerRegistration) => {
      registration.update().catch(() => {});
    };

    const refreshCache = (registration: ServiceWorkerRegistration) => {
      registration.active?.postMessage({ type: 'REFRESH_CACHE' });
    };

    navigator.serviceWorker
      .register('/sw.js', { updateViaCache: 'none' })
      .then((registration) => {
        checkForUpdates(registration);
        refreshCache(registration);

        updateTimer = setInterval(() => checkForUpdates(registration), UPDATE_CHECK_MS);
        cacheTimer = setInterval(() => refreshCache(registration), CACHE_REFRESH_MS);

        onFocus = () => checkForUpdates(registration);
        window.addEventListener('focus', onFocus);

        onVisible = () => {
          if (document.visibilityState === 'visible') {
            checkForUpdates(registration);
          }
        };
        document.addEventListener('visibilitychange', onVisible);

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });

        onControllerChange = () => {
          window.location.reload();
        };
        navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
      })
      .catch(() => {
        // Non-fatal — app still works without install prompt
      });

    return () => {
      if (updateTimer) clearInterval(updateTimer);
      if (cacheTimer) clearInterval(cacheTimer);
      if (onFocus) window.removeEventListener('focus', onFocus);
      if (onVisible) document.removeEventListener('visibilitychange', onVisible);
      if (onControllerChange) {
        navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      }
    };
  }, []);

  return null;
}
