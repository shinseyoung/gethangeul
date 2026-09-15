import { useEffect, useState } from 'react';

/**
 * Whether the page may paint yet.
 *
 * `font-display: block` stops the browser painting text in a stand-in and
 * changing it later, but it does nothing about the rest of the screen: rules,
 * marks and the hero would arrive first and the words would fill in after,
 * which is its own kind of flicker. Holding the whole first paint until the
 * faces are in hand means the first thing anyone sees is the finished page.
 *
 * Capped, because a font server that never answers must not take the site with
 * it. At the cap the app paints in whatever is available — the metric-matched
 * fallbacks in index.css, which are the same shape and the same line box, so
 * even that case lands softly.
 */
const CAP_MS = 1600;

export function useFontsReady(): boolean {
  const [ready, setReady] = useState(() => {
    if (typeof document === 'undefined') return true;
    // a repeat visit has them cached, so there is nothing to hold for
    return document.fonts?.status === 'loaded';
  });

  useEffect(() => {
    if (ready || typeof document === 'undefined' || !document.fonts) return;
    let done = false;
    const finish = () => { if (!done) { done = true; setReady(true); } };
    const timer = window.setTimeout(finish, CAP_MS);
    document.fonts.ready.then(finish).catch(finish);
    return () => window.clearTimeout(timer);
  }, [ready]);

  return ready;
}
