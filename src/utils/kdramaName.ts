import { NAME_DATABASE } from '../data/nameDatabase';
import type { NameItem } from '../types/name';
import type { Role } from './kdramaCasting';

/**
 * The name that comes with the casting.
 *
 * Drawn from the names the site already has, never generated, and filtered to
 * the ones tagged gender-neutral. Gender is not asked: stopping a story
 * mid-scene for an admin question is what makes the name generator feel like a
 * form, and the database tags both masculine- and feminine-leaning names as
 * neutral often enough that the pools stay wide without the site guessing at
 * anyone.
 *
 * `natural` is deliberately absent from every set below. It is on none of the
 * fifty-one neutral names, so including it would look like it widened a pool
 * while doing nothing at all.
 */

const TAGS: Record<Role, { vibes: string[]; personalities: string[] }> = {
  lead: { vibes: ['strong', 'trendy', 'bright'], personalities: ['enterprising', 'radiant', 'resilient'] },
  firstLove: { vibes: ['soft', 'lovely', 'calm'], personalities: ['sensitive', 'graceful', 'genuine'] },
  spark: { vibes: ['bright', 'lovely', 'trendy'], personalities: ['whimsical', 'radiant', 'sensitive'] },
  second: { vibes: ['calm', 'soft', 'mystic'], personalities: ['considerate', 'dependable', 'prudent'] },
  rival: { vibes: ['strong', 'mystic', 'trendy'], personalities: ['enterprising', 'inquisitive', 'upright'] },
  bestie: { vibes: ['bright', 'lovely', 'soft'], personalities: ['considerate', 'whimsical', 'genuine'] },
};

const NEUTRAL = NAME_DATABASE.filter((n) => n.gender.includes('neutral'));

/** Built once at module load; the pools never change. */
const POOLS: Record<Role, NameItem[]> = Object.fromEntries(
  (Object.keys(TAGS) as Role[]).map((role) => {
    const tag = TAGS[role];
    return [
      role,
      NEUTRAL.filter(
        (n) => tag.vibes.some((v) => n.vibes.includes(v))
          && tag.personalities.some((p) => n.personalities.includes(p)),
      ),
    ];
  }),
) as Record<Role, NameItem[]>;

export function namePool(role: Role): NameItem[] {
  return POOLS[role];
}

/**
 * One name from the role's pool.
 *
 * A walk, not a draw: `seed` fixes where in the pool the visitor starts and
 * `step` counts their presses of "다른 이름으로", so every press lands on a name
 * they have not seen and the whole pool comes round before anything repeats. A
 * random pick would hand back the same name twice and read as broken.
 *
 * The doubled modulo is for negative seeds — `%` keeps the sign in JavaScript,
 * and a negative index would read off the end of the pool as undefined.
 */
export function nameFor(role: Role, seed: number, step: number): NameItem {
  const pool = POOLS[role];
  const i = (((seed + step) % pool.length) + pool.length) % pool.length;
  return pool[i];
}
