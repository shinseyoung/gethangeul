import koCommon from '../data/locales/ko/common.json';
import koNames from '../data/locales/ko/names.json';
import koSurnames from '../data/locales/ko/surnames.json';
import koSyllables from '../data/locales/ko/syllables.json';
import koKdrama from '../data/locales/ko/kdrama.json';
import thCommon from '../data/locales/th/common.json';
import { NAME_DATABASE } from '../data/nameDatabase';
import { SURNAME_DATABASE } from '../data/surnameDatabase';
import { SYLLABLE_DATABASE } from '../data/syllableDatabase';

/**
 * Every character the site can put on screen in Korean, and in Thai.
 *
 * Google serves Gowun Batang as about a hundred and ninety unicode-range
 * subsets and the browser only fetches the ones a page actually paints. An
 * English visitor therefore holds none of them, and the moment they switch to
 * Korean every label swaps from the system font to ours in front of them.
 *
 * A short sample string was not enough: it pulled the handful of subsets its own
 * characters happened to fall in and left every other one to arrive later, which
 * is why the swap was still visible. This walks the actual copy instead — the
 * locale files and the three databases — so warming it asks for exactly the
 * subsets the site can ever need, and nothing is left to fetch later.
 */

function charsOf(value: unknown, into: Set<string>): void {
  if (typeof value === 'string') {
    for (const ch of value) into.add(ch);
  } else if (value && typeof value === 'object') {
    for (const v of Object.values(value as Record<string, unknown>)) charsOf(v, into);
  }
}

function sample(sources: unknown[], range: RegExp): string {
  const chars = new Set<string>();
  for (const source of sources) charsOf(source, chars);
  return [...chars].filter((c) => range.test(c)).join('');
}

const HANGUL = /[가-힣㄰-㆏]/;
const THAI = /[฀-๿]/;

export const KOREAN_SAMPLE = sample(
  [koCommon, koNames, koSurnames, koSyllables, koKdrama,
    NAME_DATABASE, SURNAME_DATABASE, SYLLABLE_DATABASE],
  HANGUL,
);

export const THAI_SAMPLE = sample([thCommon], THAI);

/**
 * Pull the faces a visitor has not asked for yet.
 *
 * Deliberately fire-and-forget: a browser that refuses, or a network that is not
 * there, leaves the site exactly as it was. Nothing waits on this.
 */
export function warmFonts(): void {
  if (typeof document === 'undefined' || !document.fonts?.load) return;
  const jobs: [string, string][] = [
    ['400 1em "Gowun Batang"', KOREAN_SAMPLE],
    ['700 1em "Gowun Batang"', KOREAN_SAMPLE],
    ['400 1em "Noto Sans Thai"', THAI_SAMPLE],
  ];
  for (const [spec, text] of jobs) {
    if (!text) continue;
    document.fonts.load(spec, text).catch(() => { /* offline, or blocked */ });
  }
}
