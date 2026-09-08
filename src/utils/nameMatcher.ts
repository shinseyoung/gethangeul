import { NAME_DATABASE } from '../data/nameDatabase';
import type { NameItem } from '../types/name';
import { choseongOf, readOnset } from './soundBridge';

export type Gender = 'male' | 'female' | 'neutral' | null;

export interface MatchAnswers {
  givenName?: string;
  gender: Gender;
  vibe: string | null;
  personality: string | null;
  seasonNature: string | null;
}

export interface Match {
  name: NameItem;
  score: number;
  /** which answers this name actually matched, for the "why" line */
  reasons: ('vibe' | 'personality' | 'nature' | 'sound')[];
}

export interface SoundReport {
  /** a name was given and could be read */
  tried: boolean;
  /** the database actually held names with that initial */
  matched: boolean;
  cho: string | null;
  /** the distinct first syllables the visitor's sound maps onto */
  syllables: string[];
  poolSize: number;
  unreadable: boolean;
}

export interface MatchResult {
  matches: Match[];
  sound: SoundReport;
}

/**
 * FNV-1a → [0, 1). Replaces the old Math.random() tiebreak: the same answers
 * must always produce the same name, or a shared result cannot be reproduced by
 * the person it was shared with.
 */
function hash01(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

/** Distinct first syllables in the database that begin with any of `initials`. */
export function syllablesFor(initials: string[]): string[] {
  const seen = new Set<string>();
  for (const item of NAME_DATABASE) {
    const cho = choseongOf(item.hangul);
    if (cho && initials.includes(cho)) seen.add(item.hangul[0]);
  }
  return [...seen];
}

const EMPTY_SOUND: SoundReport = {
  tried: false, matched: false, cho: null, syllables: [], poolSize: 0, unreadable: false,
};

export interface SoundPreview {
  /** empty: nothing typed · unreadable: a script we cannot romanise ·
   *  none: readable, but no Korean name starts with that sound · ok: a pool exists */
  state: 'empty' | 'unreadable' | 'none' | 'ok';
  cho: string | null;
  syllables: string[];
  count: number;
}

/** What the name field shows back while someone is typing. */
export function soundPreview(raw: string): SoundPreview {
  const read = readOnset(raw);
  if (!read.ok) {
    return { state: read.reason === 'empty' ? 'empty' : 'unreadable', cho: null, syllables: [], count: 0 };
  }
  const initials = [read.cho, ...read.alts];
  const syllables = syllablesFor(initials);
  const count = NAME_DATABASE.filter((item) => {
    const cho = choseongOf(item.hangul);
    return cho !== null && initials.includes(cho);
  }).length;
  return { state: count > 0 ? 'ok' : 'none', cho: read.cho, syllables, count };
}

function narrowBySound(givenName: string | undefined): { pool: NameItem[]; sound: SoundReport } {
  if (!givenName || !givenName.trim()) return { pool: NAME_DATABASE, sound: EMPTY_SOUND };

  const read = readOnset(givenName);
  if (!read.ok) {
    return {
      pool: NAME_DATABASE,
      sound: { ...EMPTY_SOUND, tried: true, unreadable: read.reason === 'unreadable' },
    };
  }

  const initials = [read.cho, ...read.alts];
  const pool = NAME_DATABASE.filter((item) => {
    const cho = choseongOf(item.hangul);
    return cho !== null && initials.includes(cho);
  });

  const sound: SoundReport = {
    tried: true,
    matched: pool.length > 0,
    cho: read.cho,
    syllables: syllablesFor(initials),
    poolSize: pool.length,
    unreadable: false,
  };

  // No Korean given name starts with this sound. Say so; do not fake a match.
  return { pool: pool.length > 0 ? pool : NAME_DATABASE, sound };
}

export function matchNames(answers: MatchAnswers, limit = 3): MatchResult {
  const { pool, sound } = narrowBySound(answers.givenName);
  const { gender, vibe, personality, seasonNature } = answers;

  // Gender is a hard filter for male/female; 'neutral' keeps the whole pool and
  // only rewards names actually tagged neutral.
  let candidates = pool;
  if (gender === 'male' || gender === 'female') {
    const filtered = pool.filter((item) => item.gender.includes(gender));
    if (filtered.length > 0) candidates = filtered;
  }

  // "Mina" narrows to names starting with ㅁ, and after the gender filter that
  // can be a single name — under a heading promising three. Keep the sound pool
  // on top by scoring it, and fill the remaining slots from the rest.
  const bySound = new Set(candidates.map((item) => item.id));
  if (candidates.length < limit) {
    const wider = gender === 'male' || gender === 'female'
      ? NAME_DATABASE.filter((item) => item.gender.includes(gender))
      : NAME_DATABASE;
    candidates = [...candidates, ...wider.filter((item) => !bySound.has(item.id))];
  }

  const seed = [answers.givenName ?? '', gender ?? '', vibe ?? '', personality ?? '', seasonNature ?? ''].join('|');

  const scored: Match[] = candidates.map((name) => {
    const reasons: Match['reasons'] = [];
    let score = 0;

    if (gender === 'neutral' && name.gender.includes('neutral')) score += 0.5;
    // above the three traits put together: the sound pool was a hard filter
    // before the top-up existed, and it stays one wherever it can fill a slot
    if (sound.matched && bySound.has(name.id)) score += 4;
    if (vibe && name.vibes.includes(vibe)) { score += 1; reasons.push('vibe'); }
    if (personality && name.personalities.includes(personality)) { score += 1; reasons.push('personality'); }
    if (seasonNature && name.nature.includes(seasonNature)) { score += 1; reasons.push('nature'); }
    if (sound.matched && bySound.has(name.id)) reasons.unshift('sound');

    return { name, score, reasons };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return hash01(a.name.id + seed) - hash01(b.name.id + seed);
  });

  return { matches: scored.slice(0, limit), sound };
}

/** Back-compat helper for anything still expecting a single name. */
export function getRecommendedName(
  gender: Gender,
  vibe: string | null,
  personality: string | null,
  seasonNature: string | null,
  givenName?: string,
): NameItem {
  return matchNames({ gender, vibe, personality, seasonNature, givenName }, 1).matches[0].name;
}
