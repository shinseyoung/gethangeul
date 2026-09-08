import { useEffect, useState } from 'react';

/**
 * Draws a word by tracing its real glyph outlines, one syllable after another,
 * then letting the ink fill in behind the line.
 *
 * The result screen's StrokeWriter is different on purpose: there, correct
 * stroke order is the point, so the jamo are drawn by hand. Here the point is
 * that it looks good, so this uses the actual typeface — SVG text accepts
 * stroke-dasharray, and the dash follows the glyph contour.
 */

const clamp = (v: number) => Math.min(1, Math.max(0, v));
// a cubic ease-out is visually complete around 80% of its own slice, which made
// the word look finished at ~90%. Linear here; the pacing lives in the caller.
const easeOut = (v: number) => v;

interface Props {
  text: string;
  /** 0–1 */
  progress: number;
  fontFamily?: string;
  fontSize?: number;
  className?: string;
}

export default function WordDraw({
  text,
  progress,
  fontFamily = "'Gowun Batang', serif",
  fontSize = 120,
  className = '',
}: Props) {
  const chars = [...text];
  const [fontReady, setFontReady] = useState(false);

  // Tracing an outline before the webfont lands would trace the fallback. Wait
  // for this one face only — document.fonts.ready also waits on the 568 KB
  // brush font, which on a phone can outlast the whole loading beat.
  useEffect(() => {
    let alive = true;
    const done = () => { if (alive) setFontReady(true); };
    if (typeof document === 'undefined' || !document.fonts?.load) { done(); return; }

    document.fonts.load(`${fontSize}px ${fontFamily}`, text).then(done).catch(done);
    const bail = setTimeout(done, 1200);
    return () => { alive = false; clearTimeout(bail); };
  }, [fontFamily, fontSize, text]);

  const advance = fontSize * 1.06;
  const width = chars.length * advance;
  const height = fontSize * 1.34;

  // each syllable owns a slice, and they overlap slightly so the hand never lifts
  const slice = 1 / chars.length;
  const overlap = slice * 0.18;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      className={className}
      role="img"
      aria-label={text}
      style={{ opacity: fontReady ? 1 : 0, transition: 'opacity 240ms ease' }}
    >
      {chars.map((ch, i) => {
        const start = i * slice - (i > 0 ? overlap : 0);
        const local = easeOut(clamp((progress - start) / (slice + overlap)));
        // the outline finishes first, then the fill catches up behind it
        const fill = clamp((local - 0.55) / 0.45);

        return (
          <text
            key={i}
            x={i * advance + advance / 2}
            y={height * 0.76}
            textAnchor="middle"
            fontFamily={fontFamily}
            fontSize={fontSize}
            fill="currentColor"
            fillOpacity={fill}
            stroke="currentColor"
            strokeWidth={1.2}
            strokeLinejoin="round"
            /* The dash has to sit near a contour's own length: much longer and
               every contour completes at once, so the word ghosts in instead of
               being drawn. And because the pattern repeats, at maximum offset
               parts of the outline are still inside a dash — so a syllable is
               hidden outright until its own slice begins, or the second letter
               shows a trace under the first. */
            style={{
              strokeDasharray: fontSize * 1.6,
              strokeDashoffset: fontSize * 1.6 * (1 - local),
              // a dashed outline keeps its gaps at offset 0, so once the fill
               // has arrived the stroke has to get out of the way or the letter
               // reads as unfinished along those gaps
               strokeOpacity: 1 - fill,
              opacity: local <= 0.001 ? 0 : 1,
            }}
          >
            {ch}
          </text>
        );
      })}
    </svg>
  );
}
