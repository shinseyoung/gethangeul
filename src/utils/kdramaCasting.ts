import { SLOTS } from '../data/kdramaSlots';

/**
 * Which part you would play, worked out from six situations.
 *
 * Four axes make exactly six pairs, and six is exactly the number of roles this
 * needs — so the two highest axes name the role, the same shape blendKey uses in
 * nameTraits.ts. That is structure, not coincidence, and reusing it means one
 * canonical-ordering rule to get right instead of two.
 *
 * `cast()` takes answers and nothing else — not the genre, not which branch
 * was taken. Four genres tell four stories through the same twelve slots, so
 * one measured distribution covers all of them; a change that needs the genre
 * in here is a change that broke that.
 *
 * Nothing here reads the name scorer. That one hears what a name *sounds* like;
 * this one reads what a person *chose*. Same card, same meter, different engine,
 * and wiring them together would make both harder to reason about.
 */

export type Axis = 'romance' | 'presence' | 'warmth' | 'mischief';

/** Canonical order. Role keys sort into it, so `romance_warmth` is the only spelling. */
export const AXES = ['romance', 'presence', 'warmth', 'mischief'] as const;

export type Scores = Record<Axis, number>;
export type Role = 'lead' | 'firstLove' | 'spark' | 'second' | 'rival' | 'bestie';
export type Temper = 'direct' | 'careful';

export type ActId = 'gi' | 'seung' | 'jeon' | 'gyeol';

/** 기승전결, in order. Three scenes each. */
export const ACTS = ['gi', 'seung', 'jeon', 'gyeol'] as const;

export const SCENES_PER_ACT = 3;

export function actOf(sceneIndex: number): ActId {
  return ACTS[Math.floor(sceneIndex / SCENES_PER_ACT)];
}

export interface Casting {
  scores: Scores;
  /** the two highest axes, highest first; ties break in AXES order */
  top: [Axis, Axis];
  role: Role;
  temper: Temper;
  /** `<role>_<temper>`, the key the copy is written against */
  typeKey: string;
}

const ROLE_BY_PAIR: Record<string, Role> = {
  romance_presence: 'lead',
  romance_warmth: 'firstLove',
  romance_mischief: 'spark',
  presence_warmth: 'second',
  presence_mischief: 'rival',
  warmth_mischief: 'bestie',
};

/**
 * The one value an act hands to the next.
 *
 * The story does not branch — this does. Twelve scenes of four options is
 * sixteen million paths and nobody writes that, so an act passes forward only
 * which axis its three answers fed most, and that picks the next act's opening
 * line. Being answered three times is what being answered feels like.
 *
 * Ties break in AXES order, the same rule the role ranking uses.
 */
export function dominantAxis(answers: (number | null)[], act: ActId): Axis | null {
  const start = ACTS.indexOf(act) * SCENES_PER_ACT;
  const slice = answers.slice(start, start + SCENES_PER_ACT);
  if (slice.length < SCENES_PER_ACT) return null;
  if (slice.some((a) => a === null || a === undefined)) return null;

  const raw: Scores = { romance: 0, presence: 0, warmth: 0, mischief: 0 };
  for (let i = 0; i < SCENES_PER_ACT; i += 1) {
    const option = SLOTS[start + i]?.options[slice[i] as number];
    if (!option) return null;
    for (const axis of AXES) raw[axis] += option.weights[axis] ?? 0;
  }
  return [...AXES].sort((a, b) => raw[b] - raw[a])[0];
}

/** The copy key for the line that opens `act`, or null for the first act. */
export function recapKey(act: ActId, answers: (number | null)[]): string | null {
  const i = ACTS.indexOf(act);
  if (i <= 0) return null;
  const previous = dominantAxis(answers, ACTS[i - 1]);
  return previous ? `${act}_${previous}` : null;
}

/** The two axes in AXES order, so `warmth + romance` and `romance + warmth` are one key. */
export function roleKey(a: Axis, b: Axis): string {
  const [first, second] = [a, b].sort((x, y) => AXES.indexOf(x) - AXES.indexOf(y));
  return `${first}_${second}`;
}

/**
 * The largest total any single axis could reach, so the four can be shown on one
 * scale. Without it `romance` — which almost every question offers — would read
 * high against `mischief` purely because more answers feed it.
 */
const CEILING: Scores = (() => {
  const max: Scores = { romance: 0, presence: 0, warmth: 0, mischief: 0 };
  for (const q of SLOTS) {
    for (const axis of AXES) {
      max[axis] += Math.max(...q.options.map((o) => o.weights[axis] ?? 0));
    }
  }
  return max;
})();

export function cast(answers: (number | null)[]): Casting | null {
  if (answers.length !== SLOTS.length) return null;
  if (answers.some((a) => a === null || a === undefined)) return null;

  const raw: Scores = { romance: 0, presence: 0, warmth: 0, mischief: 0 };
  let temperTotal = 0;

  for (let i = 0; i < SLOTS.length; i += 1) {
    const option = SLOTS[i].options[answers[i] as number];
    if (!option) return null;
    for (const axis of AXES) raw[axis] += option.weights[axis] ?? 0;
    temperTotal += option.temper;
  }

  const scores = Object.fromEntries(
    AXES.map((axis) => [axis, Math.round((raw[axis] / CEILING[axis]) * 100)]),
  ) as Scores;

  // ties break in AXES order, so the same answers never reorder between renders
  const ranked = [...AXES].sort((a, b) => scores[b] - scores[a]);
  const top: [Axis, Axis] = [ranked[0], ranked[1]];

  // an exact tie leans 신중 — the quieter reading is the safer thing to tell
  // someone about themselves, and six answers of ±1 can land on zero
  const temper: Temper = temperTotal > 0 ? 'direct' : 'careful';
  const role = ROLE_BY_PAIR[roleKey(top[0], top[1])];

  return { scores, top, role, temper, typeKey: `${role}_${temper}` };
}
