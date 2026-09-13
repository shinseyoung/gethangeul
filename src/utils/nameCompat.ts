import { strokesOf } from './strokes';

/**
 * 이름궁합 — the name-compatibility game Korean children have played for
 * decades on the back of a notebook.
 *
 * Write the two names one letter each in turn, count the strokes, add each
 * neighbouring pair and keep only the ones digit, and fold the row down again
 * and again until two digits are left. Those two digits are the percentage.
 *
 * It is a playground game, not divination, and the site says so. Showing the
 * whole fold is what makes it one: the visitor can see exactly where the
 * number came from, including that swapping the two names changes it — which
 * is how the game has always worked, not a bug to be smoothed away.
 */

export interface CompatResult {
  /** the interleaved syllables, in the order they are written down */
  cells: { char: string; strokes: number }[];
  /** every row of the fold, first the stroke counts, last the two digits */
  rows: number[][];
  /** 0–99; null when there was not enough Hangul to play */
  percent: number | null;
}

/** Names are written a letter each in turn, leftovers trailing on the end. */
function interleave<T>(a: T[], b: T[]): T[] {
  const out: T[] = [];
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    if (i < a.length) out.push(a[i]);
    if (i < b.length) out.push(b[i]);
  }
  return out;
}

/** One fold: add each neighbouring pair, keep the ones digit. */
function fold(row: number[]): number[] {
  const next: number[] = [];
  for (let i = 0; i < row.length - 1; i += 1) next.push((row[i] + row[i + 1]) % 10);
  return next;
}

export function compatibility(nameA: string, nameB: string): CompatResult {
  const cells = interleave(strokesOf(nameA), strokesOf(nameB));

  // two syllables is the shortest row that can fold to two digits at all
  if (cells.length < 3) return { cells, rows: [], percent: null };

  const rows: number[][] = [cells.map((c) => c.strokes)];
  while (rows[rows.length - 1].length > 2) rows.push(fold(rows[rows.length - 1]));

  const [tens, ones] = rows[rows.length - 1];
  return { cells, rows, percent: tens * 10 + ones };
}
