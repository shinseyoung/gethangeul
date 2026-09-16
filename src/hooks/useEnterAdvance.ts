import { useEffect } from 'react';

/**
 * Enter moves on, once there is an answer.
 *
 * Picking a card leaves the focus on it, so Enter was re-pressing the card the
 * visitor had just chosen — the one key everyone reaches for did nothing at all.
 * The keydown runs before the button's own click, so preventing the default is
 * what stops the re-press.
 *
 * Only from a card or from nowhere in particular. Focus sitting on 전체 보기 or
 * on 이전 means Enter belongs to that button, and stealing it there would make
 * the flow jump when the visitor asked for a list.
 */
export function useEnterAdvance(ready: boolean, advance: () => void) {
  useEffect(() => {
    if (!ready) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || event.repeat || event.isComposing) return;
      const focused = document.activeElement;
      const onACard = focused instanceof HTMLElement && focused.hasAttribute('aria-pressed');
      if (!onACard && focused !== document.body) return;
      event.preventDefault();
      advance();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ready, advance]);
}
