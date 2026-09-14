import { decompose } from './strokes';
import { SURNAME_DATABASE } from '../data/surnameDatabase';
import { syllableInfo, type Era, type Freq, type SyllableItem } from '../data/syllableDatabase';

/**
 * What a Korean name sounds like to someone who grew up hearing them.
 *
 * Four of the five axes are computed from the jamo, not looked up. That is the
 * point: this site already draws the whole stroke-count fold on the match card
 * so a visitor can see where the number came from, and a star rating pulled out
 * of a hash would have nothing to show and nothing to answer with. Only
 * `uncommon` needs data, because how often a syllable is used is not something
 * the letters can tell you.
 *
 * The weights below are a first tuning. They are meant to be moved; the check
 * script asserts orderings rather than numbers so that moving them is cheap.
 */

export type Axis = 'friendly' | 'refined' | 'cute' | 'calm' | 'uncommon';

/** Canonical order. Blend keys sort into it, so `friendly_cute` is the only spelling. */
export const AXES = ['friendly', 'refined', 'cute', 'calm', 'uncommon'] as const;

export type Traits = Record<Axis, number>;

export interface Reading {
  /** the family name split off the front, if there was one */
  surnameId: string | null;
  /** the syllables actually scored */
  given: string;
  traits: Traits;
  /** the two highest axes, highest first; ties break in AXES order */
  top: [Axis, Axis];
  /** dictionary hits among the given name's syllables, in order */
  known: SyllableItem[];
}

// Jamo classes, as index sets into the CHO / JUNG / JONG orders in strokes.ts.
//
// PLAIN and SIBILANT overlap on ㅅ and ㅈ on purpose: `friendly` hears them as
// ordinary everyday onsets, `refined` hears them as sibilants. These are lenses
// on the same letter, not a partition of the alphabet.
const SONORANT = new Set([2, 5, 6, 11]);        // ㄴㄹㅁㅇ
const TENSE = new Set([1, 4, 8, 10, 13]);       // ㄲㄸㅃㅆㅉ
const ASPIRATE = new Set([14, 15, 16, 17]);     // ㅊㅋㅌㅍ
const SIBILANT = new Set([9, 10, 12, 13, 14]);  // ㅅㅆㅈㅉㅊ
const PLAIN = new Set([0, 3, 7, 9, 12]);        // ㄱㄷㅂㅅㅈ
const H = 18;                                    // ㅎ, breathy — in no class
const IEUNG = 11;                                // ㅇ

const BRIGHT = new Set([0, 1, 2, 3, 8, 9, 10, 11, 12]);   // ㅏㅐㅑㅒㅗㅘㅙㅚㅛ
const DARK = new Set([4, 5, 6, 7, 13, 14, 15, 16, 17]);   // ㅓㅔㅕㅖㅜㅝㅞㅟㅠ
const MID = new Set([18, 19, 20]);                        // ㅡㅢㅣ

const SOFT_CODA = new Set([4, 8, 16, 21]);      // ㄴㄹㅁㅇ

const UNCOMMON_BY_FREQ: Record<Freq, number> = {
  'very-common': 10,
  common: 35,
  uncommon: 70,
};
/** A syllable nobody has catalogued is the most unusual thing a name can hold. */
const UNCOMMON_ABSENT = 88;

const DEFAULT_ERA: Era = 'timeless';

interface Cell {
  cho: number;
  jung: number;
  jong: number;
  info: SyllableItem | null;
}

function cellsOf(given: string): Cell[] {
  const cells: Cell[] = [];
  for (const char of given) {
    const jamo = decompose(char);
    if (jamo === null) continue;
    cells.push({ ...jamo, info: syllableInfo(char) });
  }
  return cells;
}

const clamp = (n: number) => Math.round(Math.min(100, Math.max(0, n)));
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

function cute(cells: Cell[]): number {
  const per = cells.map((c) => {
    let n = 30;
    if (BRIGHT.has(c.jung)) n += 22;
    if (DARK.has(c.jung)) n -= 12;
    if (c.jong === 0) n += 18;
    else if (!SOFT_CODA.has(c.jong)) n -= 10;
    if (TENSE.has(c.cho)) n += 12;
    if (c.cho === IEUNG || c.cho === H) n += 10;
    return n;
  });
  // a name that repeats its vowel — 나나, 다다 — is doing something childlike
  const oneVowel = cells.length > 1 && cells.every((c) => c.jung === cells[0].jung);
  return clamp(mean(per) + (oneVowel ? 15 : 0));
}

function refined(cells: Cell[]): number {
  const per = cells.map((c) => {
    // Base sits low on purpose. An open or soft coda and a two-syllable shape
    // (below) are true of almost every contemporary given name in the
    // dictionary — 99%+ of real syllables land on one or the other — so
    // giving that near-universal a big weight was what pinned the floor at
    // 60: the base plus those two constants alone summed past 60 before a
    // single letter had said anything distinctive.
    let n = 8;
    // Widened from 34/30: with the base this low, the single best real
    // syllable (a sibilant/ㅎ onset, open coda, modern era — 서 is exactly
    // this) topped out at 68, so no name could ever light the fifth dot no
    // matter how "refined" it read. Sibilant and modern era are the two
    // terms that actually split the syllable set close to evenly — widening
    // them raises the ceiling without touching the near-universal open-coda
    // term that would just lift every score by the same amount again.
    if (SIBILANT.has(c.cho) || c.cho === H) n += 42;
    if (TENSE.has(c.cho)) n -= 34;
    if (ASPIRATE.has(c.cho)) n -= 20;
    if (c.jong === 0 || SOFT_CODA.has(c.jong)) n += 4;
    else n -= 12;
    const era = c.info?.era ?? DEFAULT_ERA;
    if (era === 'modern') n += 38;
    if (era === 'classic') n -= 24;
    return n;
  });
  // Two syllables still reads as the contemporary shape, but the bonus is
  // small now: every name in the built-in database is two syllables, so a
  // large constant here did nothing but raise every score by the same
  // amount — it never separated one name from another.
  const shape = cells.length === 2 ? 6 : -8;
  return clamp(mean(per) + shape);
}

function friendly(cells: Cell[]): number {
  return clamp(mean(cells.map((c) => {
    // Base is low for the same reason as `refined`'s: a plain/sonorant onset
    // and a common-or-better syllable cover the large majority of real given
    // names, so the old +16/+20 bonuses for them acted like a second base
    // rather than a signal. Splitting freq into three tiers instead of a
    // very-common/common cliff, and giving the vowel a matching dark-side
    // penalty, does the differentiating work those flat bonuses didn't.
    let n = 12;
    const freq = c.info?.freq;
    if (freq === 'very-common') n += 16;
    else if (freq === 'common') n += 6;
    else if (freq === 'uncommon') n -= 8;
    if (c.info === null) n -= 20;
    if (SONORANT.has(c.cho) || PLAIN.has(c.cho)) n += 6;
    if (ASPIRATE.has(c.cho)) n -= 14;
    // Widened from 26/18: no syllable in the dictionary happens to pair a
    // very-common reading with both a bright vowel and a soft coda, so the
    // best real combination (a common-band syllable with the rest) only
    // reached 68 — bucket five was as unreachable here as it was for
    // `refined`. Bright/dark and soft-coda-or-not are close to even splits
    // of the syllable set, which is what makes them worth widening instead
    // of the freq or onset terms above.
    if (BRIGHT.has(c.jung)) n += 38;
    else if (DARK.has(c.jung)) n -= 10;
    if (SOFT_CODA.has(c.jong)) n += 30;
    return n;
  })));
}

function calm(cells: Cell[]): number {
  return clamp(mean(cells.map((c) => {
    // 24 (one round of tuning ago) undershot: the best real syllable — a
    // sonorant onset, dark/mid vowel, soft coda, no other axis's bonus
    // firing — only reached 79, one point short of the fifth dot, for every
    // syllable that exists. 27 clears that with a couple of points to
    // spare without pushing this axis back into dominating `top` the way
    // the original 35 did.
    let n = 27;
    if (SONORANT.has(c.cho)) n += 22;
    if (ASPIRATE.has(c.cho)) n -= 20;
    if (TENSE.has(c.cho)) n -= 12;
    if (DARK.has(c.jung) || MID.has(c.jung)) n += 18;
    if (BRIGHT.has(c.jung)) n -= 8;
    if (SOFT_CODA.has(c.jong)) n += 15;
    return n;
  })));
}

function uncommon(cells: Cell[]): number {
  return clamp(mean(cells.map((c) => {
    if (c.info === null) return UNCOMMON_ABSENT;
    return UNCOMMON_BY_FREQ[c.info.freq] + (c.info.era === 'classic' ? 12 : 0);
  })));
}

/**
 * Where the family name ends.
 *
 * Three syllables, not two. 하, 서, 민, 도, 강 and 문 are all family names and
 * ordinary given-name syllables at once, so a rule that only asked whether the
 * first syllable is a surname would read 하준 as 하 씨 준 and 서연 as 서 씨 연 —
 * three of the commonest names on the site, mangled. Two-syllable family names
 * (남궁, 선우) are not in the forty-name database and are not handled, the same
 * coarse trade familyToken already makes.
 */
function splitSurname(syllables: string[]): { surnameId: string | null; given: string[] } {
  if (syllables.length >= 3) {
    const hit = SURNAME_DATABASE.find((s) => s.hangul === syllables[0]);
    if (hit) return { surnameId: hit.id, given: syllables.slice(1) };
  }
  return { surnameId: null, given: syllables };
}

export function readName(hangul: string): Reading | null {
  const syllables = [...hangul.trim()].filter((c) => decompose(c) !== null);
  if (syllables.length === 0) return null;

  const { surnameId, given } = splitSurname(syllables);
  const cells = cellsOf(given.join(''));

  const traits: Traits = {
    friendly: friendly(cells),
    refined: refined(cells),
    cute: cute(cells),
    calm: calm(cells),
    uncommon: uncommon(cells),
  };

  // ties break in AXES order, so the same name never reorders between renders
  const ranked = [...AXES].sort((a, b) => traits[b] - traits[a]);

  return {
    surnameId,
    given: given.join(''),
    traits,
    top: [ranked[0], ranked[1]],
    known: cells.map((c) => c.info).filter((i): i is SyllableItem => i !== null),
  };
}

/** The two axes in AXES order, so `cute + friendly` and `friendly + cute` are one key. */
export function blendKey(a: Axis, b: Axis): string {
  const [first, second] = [a, b].sort((x, y) => AXES.indexOf(x) - AXES.indexOf(y));
  return `${first}_${second}`;
}
