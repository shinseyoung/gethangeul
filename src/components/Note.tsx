/**
 * The bordered aside both rooms show while they have nothing to say yet.
 *
 * The vertical padding is deliberately lopsided. A line box is centred on the
 * font's metrics, not on where the ink actually sits, and Gowun Batang carries
 * far more ascent than descent — so Hangul set in it rides about 2.5px above the
 * middle of its box at this size, and Latin about 2px. With even padding the
 * text reads as pinned to the top of the frame. 16px over 12px pushes the ink
 * back down onto the centre line and keeps the box exactly as tall as the p-3.5
 * it replaces, so nothing below it moves.
 *
 * Measured in the browser at 13px, not guessed: the correction takes Hangul from
 * 2.5px high to 0.5px and Latin from 2px to nil. Thai sits slightly lower than
 * either, which is the cost of one number serving three scripts and is not worth
 * a per-script class.
 */
export default function Note({ children }: { children: string }) {
  return (
    <p className="mt-7 rounded-sm border border-l-[3px] border-rule border-l-pig-jeok bg-paper-hi px-3.5 pb-3 pt-4 text-[13px] leading-relaxed text-ink-3">
      {children}
    </p>
  );
}
