/**
 * Hangul stroke counts, the way the playground name game counts them.
 *
 * This is the traditional 획수 convention the game has always used, not a
 * typographic truth: ㄱ is one stroke, ㅁ is three, ㅃ is eight. Getting these
 * numbers exactly right is the whole point — 김 must be 5 and 박 must be 7, or
 * every percentage the site prints is wrong.
 */

const CHO = [
  1, 2, 1, 2, 4, 3, 3, 4, 8, 2, 4, 1, 2, 4, 3, 2, 3, 4, 3,
]; // ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ

const JUNG = [
  2, 3, 3, 4, 2, 3, 3, 4, 2, 4, 5, 3, 3, 2, 4, 5, 3, 3, 1, 2, 1,
]; // ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ

// index 0 is "no final consonant"; clusters are the sum of their two parts
const JONG = [
  0, 1, 2, 3, 1, 3, 4, 2, 1, 4, 6, 7, 5, 6, 7, 6, 3, 0, 4, 2, 4, 1, 2, 0, 3, 4, 3,
]; // -ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ

const BASE = 0xac00;
const LAST = 0xd7a3;

/**
 * The three jamo of a Hangul syllable block, as indices into CHO / JUNG / JONG.
 *
 * Indices rather than characters, because every table that reads them — stroke
 * counts here, sound classes in nameTraits — is a flat array in the same order.
 */
export function decompose(char: string): { cho: number; jung: number; jong: number } | null {
  const code = char.codePointAt(0);
  if (code === undefined || code < BASE || code > LAST) return null;
  const offset = code - BASE;
  return {
    cho: Math.floor(offset / 588),
    jung: Math.floor(offset / 28) % 21,
    jong: offset % 28,
  };
}

/** Strokes in one Hangul syllable block, or null if it is not one. */
export function strokesOfSyllable(char: string): number | null {
  const jamo = decompose(char);
  if (jamo === null) return null;
  return CHO[jamo.cho] + JUNG[jamo.jung] + JONG[jamo.jong];
}

/** Every syllable of a Hangul name, with its stroke count. Non-Hangul is dropped. */
export function strokesOf(name: string): { char: string; strokes: number }[] {
  const out: { char: string; strokes: number }[] = [];
  for (const char of name.trim()) {
    const strokes = strokesOfSyllable(char);
    if (strokes !== null) out.push({ char, strokes });
  }
  return out;
}
