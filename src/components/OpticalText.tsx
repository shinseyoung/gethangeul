import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * Text whose *ink* sits on the centre of its box, not whose line box does.
 *
 * Two previous attempts modelled where the browser puts the baseline from font
 * metrics and got it wrong, because the used ascent and descent for line layout
 * are not the ones the canvas reports. So nothing is modelled here:
 *
 *  - the baseline is measured directly, from a zero-sized inline probe that sits
 *    on it by definition
 *  - the ink's offset from that baseline comes from painting the glyphs once to
 *    an offscreen canvas and finding the first and last row with any pixel in it
 *
 * Latin, Hangul and Thai all differ by a couple of pixels; without this, three
 * of our four languages look like they are riding high.
 */

interface Props {
  children: string;
  className?: string;
  /** extra shift applied after centring, for optical judgement calls */
  bias?: number;
}

function inkOffsetAboveBaseline(text: string, font: string): number | null {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  ctx.font = font;
  const width = Math.ceil(ctx.measureText(text).width) + 24;
  const height = 140;
  const baseline = 100;
  canvas.width = width;
  canvas.height = height;

  const c = canvas.getContext('2d', { willReadFrequently: true });
  if (!c) return null;
  c.font = font;
  c.textBaseline = 'alphabetic';
  c.fillStyle = '#000';
  c.fillText(text, 12, baseline);

  const { data } = c.getImageData(0, 0, width, height);
  let top = -1;
  let bottom = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] > 24) {
        if (top === -1) top = y;
        bottom = y;
        break;
      }
    }
  }
  if (top === -1) return null;
  return baseline - (top + bottom) / 2;
}

export default function OpticalText({ children, className = '', bias = 0 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const probe = useRef<HTMLSpanElement>(null);
  const [nudge, setNudge] = useState(0);

  const measure = () => {
    const el = ref.current;
    const mark = probe.current;
    if (!el || !mark) return;

    const style = getComputedStyle(el);
    const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const above = inkOffsetAboveBaseline(children, font);
    if (above === null) return;

    const box = el.getBoundingClientRect();
    const baselineY = mark.getBoundingClientRect().top; // a baseline-aligned zero-height box
    const inkCentre = baselineY - above;
    setNudge(Math.round((box.top + box.height / 2 - inkCentre) * 2) / 2);
  };

  useLayoutEffect(measure, [children]);
  useEffect(() => {
    if (document.fonts?.ready) document.fonts.ready.then(measure).catch(measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  return (
    <span ref={ref} className={className} style={{ transform: `translateY(${nudge + bias}px)` }}>
      {children}
      <span ref={probe} aria-hidden="true" style={{ display: 'inline-block', width: 0, height: 0, verticalAlign: 'baseline' }} />
    </span>
  );
}
