import { QUESTIONS } from '../data/kdramaQuestions';

/**
 * Which part you would play, worked out from six situations.
 *
 * Four axes make exactly six pairs, and six is exactly the number of roles this
 * needs — so the two highest axes name the role, the same shape blendKey uses in
 * nameTraits.ts. That is structure, not coincidence, and reusing it means one
 * canonical-ordering rule to get right instead of two.
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
  for (const q of QUESTIONS) {
    for (const axis of AXES) {
      max[axis] += Math.max(...q.options.map((o) => o.weights[axis] ?? 0));
    }
  }
  return max;
})();

export function cast(answers: (number | null)[]): Casting | null {
  if (answers.length !== QUESTIONS.length) return null;
  if (answers.some((a) => a === null || a === undefined)) return null;

  const raw: Scores = { romance: 0, presence: 0, warmth: 0, mischief: 0 };
  let temperTotal = 0;

  for (let i = 0; i < QUESTIONS.length; i += 1) {
    const option = QUESTIONS[i].options[answers[i] as number];
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
