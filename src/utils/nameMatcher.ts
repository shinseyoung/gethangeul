import { NAME_DATABASE } from '../data/nameDatabase';
import type { NameItem } from '../types/name';
import { choseongOf, readOnset } from './soundBridge';
import { SITUATIONS, profileOf, type Answers } from '../data/situations';

export type Gender = 'male' | 'female' | 'neutral' | null;

export interface MatchAnswers {
  givenName?: string;
  gender: Gender;
  /** one option index per situation — see data/situations.ts */
  answers: Answers;
}

export interface Match {
  name: NameItem;
  score: number;
  /** the situations this name answered to, plus 'sound' — for the "why" line */
  reasons: string[];
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
export function hash01(input: string): number {
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

/**
 * How much a tag says about a name.
 *
 * `calm` is on 47 of the 114 names and `resilient` on 12, so matching the two
 * is not the same event. Counting them the same handed the room to names built
 * out of common tags: 윤아 — calm, bright, prudent, radiant, upright, autumn,
 * sky, all of them frequent — took 14% of all answer sets on its own.
 * Inverse frequency is the standard fix and the honest one: a rare tag matched
 * is a stronger statement about the person who picked it.
 */
const IDF: Record<string, number> = (() => {
  const freq: Record<string, number> = {};
  for (const name of NAME_DATABASE) {
    for (const tag of [...name.vibes, ...name.personalities, ...name.nature]) {
      freq[tag] = (freq[tag] ?? 0) + 1;
    }
  }
  return Object.fromEntries(
    Object.entries(freq).map(([tag, n]) => [tag, Math.log(NAME_DATABASE.length / n)]),
  );
})();

/**
 * The most a name could score, if every situation were answered in its favour.
 *
 * Names are not equally easy to satisfy: measured across the six situations the
 * ceiling ran from 5 to 10, so 태하 could not have won for any of the 4,096
 * answer sets whatever anyone picked, and 민규 was in the running for nearly all
 * of them. Dividing by it puts every name on the same scale.
 *
 * By its square root, not by itself. Full normalisation over-corrects — a name
 * with few, common tags reaches its own ceiling far more often than a name with
 * many — and left 윤아 on 14% again from the other direction. Halfway between
 * "how much did you match" and "how much of yourself did you match" is the one
 * that put every name in reach with no name above 7%, measured over all three
 * gender pools.
 */
const CEILING: Record<string, number> = Object.fromEntries(
  NAME_DATABASE.map((name) => [
    name.id,
    Math.sqrt(SITUATIONS.reduce((total, situation) => total + Math.max(
      ...situation.options.map((o) => o.tags
        .filter((t) => name[situation.axis].includes(t))
        .reduce((sum, t) => sum + (IDF[t] ?? 0), 0)),
    ), 0)) || 1,
  ]),
);

export function matchNames(input: MatchAnswers, limit = 3): MatchResult {
  const { givenName, gender, answers } = input;
  const { pool, sound } = narrowBySound(givenName);

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

  /* every tag the six answers put on the table, and a seed that changes with
     any of them — two names on the same score must not always break the same
     way, or a whole corner of the database becomes unreachable */
  const profile = profileOf(answers);
  const seed = [givenName ?? '', gender ?? '', ...answers.map(String)].join('|');

  const scored: Match[] = candidates.map((name) => {
    const reasons = new Set<string>();
    let matched = 0;

    for (const { tag, axis, from } of profile) {
      if (name[axis].includes(tag)) { matched += IDF[tag] ?? 0; reasons.add(from); }
    }

    let score = matched / CEILING[name.id];

    /* 'neutral' keeps the whole database as candidates and leans on this to
       bring the 51 neutral-tagged names up. Measured: below 0.3 one of them —
       단우 — could not win for any of the 4,096 answer sets. */
    if (gender === 'neutral' && name.gender.includes('neutral')) score += 0.3;
    if (sound.matched && bySound.has(name.id)) { score += 2; reasons.add('sound'); }

    return { name, score, reasons: [...reasons] };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return hash01(a.name.id + seed) - hash01(b.name.id + seed);
  });

  return { matches: scored.slice(0, limit), sound };
}

