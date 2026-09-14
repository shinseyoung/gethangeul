/**
 * A description, split so a sentence never has to share a line with the next.
 *
 * The card copy used to wrap wherever the box ran out, which put line breaks in
 * the middle of clauses and made two short sentences read as one long ragged
 * one. Rendering each sentence as its own block moves every break to a full
 * stop, where the reader was going to pause anyway.
 *
 * Splitting on the punctuation rather than on a sentence-segmentation library:
 * this copy is ours, it is a sentence or two long, and none of it contains the
 * abbreviations ("Dr.", "e.g.") that make real segmentation hard. The decimal
 * guard below is the one case that does come up, because a percentage or a
 * score can land in a sentence.
 *
 * Thai writes without terminal punctuation and separates clauses with spaces.
 * A Thai string therefore comes back whole, which is correct — splitting on its
 * spaces would break it mid-phrase, which is the fault this exists to fix.
 */

/** A full stop, bang or question mark — plus their fullwidth forms — that ends a
 *  sentence rather than sitting inside a number. */
const TERMINATOR = /([.!?！？。]+)(?=\s|$)/g;

export function sentences(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const out: string[] = [];
  let start = 0;
  for (const match of trimmed.matchAll(TERMINATOR)) {
    const end = match.index + match[0].length;
    // "4.5" — a stop with digits on both sides is a decimal point, not an end
    if (/\d$/.test(trimmed.slice(0, match.index)) && /^\s*\d/.test(trimmed.slice(end))) continue;
    const piece = trimmed.slice(start, end).trim();
    if (piece) out.push(piece);
    start = end;
  }

  const tail = trimmed.slice(start).trim();
  if (tail) out.push(tail);
  return out.length > 0 ? out : [trimmed];
}
