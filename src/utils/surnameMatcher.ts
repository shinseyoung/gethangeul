import { SURNAME_DATABASE } from '../data/surnameDatabase';
import type { SurnameItem } from '../types/name';
import { choseongOf, readOnset } from './soundBridge';
import { hash01 } from './nameMatcher';

/** How many sound matches the surname screen offers before "show all". */
const SUGGESTED = 5;

/**
 * The part of what someone typed that is their family name.
 *
 * ponytail: last token, except Vietnamese, where the family name comes first
 * (Nguyễn Văn An). Chinese and Japanese also put it first, and Spanish speakers
 * often carry two — both read wrong here. The surname screen lets anyone pick
 * from the full list, which is what makes a coarse rule affordable; upgrade to
 * a per-locale ordering table if the picker turns out to be doing all the work.
 */
export function familyToken(fullName: string, lang: string): string | null {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return null;
  return lang === 'vi' ? parts[0] : parts[parts.length - 1];
}

export interface SurnameSuggestion {
  /** a family name was given and could be read */
  tried: boolean;
  /** the sound it was read as, for the "sounds like ㅁ" line */
  cho: string | null;
  /** commonest first, at most SUGGESTED — empty when nothing matched */
  matches: SurnameItem[];
}

const EMPTY: SurnameSuggestion = { tried: false, cho: null, matches: [] };

/** Korean family names that open on the same sound as the visitor's own. */
export function suggestSurnames(fullName: string, lang: string): SurnameSuggestion {
  const token = familyToken(fullName, lang);
  if (!token) return EMPTY;

  const read = readOnset(token);
  if (!read.ok) return { tried: true, cho: null, matches: [] };

  const initials = [read.cho, ...read.alts];
  const matches = SURNAME_DATABASE
    .filter((s) => {
      const cho = choseongOf(s.hangul);
      return cho !== null && initials.includes(cho);
    })
    .sort((a, b) => b.share - a.share)
    .slice(0, SUGGESTED);

  return { tried: true, cho: read.cho, matches };
}

/**
 * The surname the visitor arrives on before touching anything. Sound first;
 * failing that a stable draw from the whole list, weighted the way the
 * population is, so a blank name still lands on Kim about a fifth of the time.
 *
 * Deterministic on purpose — the same visit must always show the same surname,
 * or the card changes under someone who is reading it.
 */
export function defaultSurname(fullName: string, lang: string, seed: string): SurnameItem {
  const { matches } = suggestSurnames(fullName, lang);
  if (matches.length > 0) return matches[0];

  const total = SURNAME_DATABASE.reduce((sum, s) => sum + s.share, 0);
  let draw = hash01(seed || 'anonymous') * total;
  for (const surname of SURNAME_DATABASE) {
    draw -= surname.share;
    if (draw <= 0) return surname;
  }
  return SURNAME_DATABASE[0];
}

export function surnameById(id: string | null): SurnameItem | null {
  return SURNAME_DATABASE.find((s) => s.id === id) ?? null;
}
