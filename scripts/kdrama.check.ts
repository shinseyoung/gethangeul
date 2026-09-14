// Runnable check for the K-Drama casting test: the questions, the six roles the
// axis pairs name, and the twelve types they make with the temper.
// Run with: npm run check
import { QUESTIONS } from '../src/data/kdramaQuestions';
import { ACTS, AXES, SCENES_PER_ACT, actOf, cast, dominantAxis, recapKey, roleKey, type Casting, type Role } from '../src/utils/kdramaCasting';
import { nameFor, namePool } from '../src/utils/kdramaName';
import enK from '../src/data/locales/en/kdrama.json';
import koK from '../src/data/locales/ko/kdrama.json';
import viK from '../src/data/locales/vi/kdrama.json';
import thK from '../src/data/locales/th/kdrama.json';

let failures = 0;
function ok(label: string, condition: boolean, detail?: unknown) {
  if (condition) return;
  failures += 1;
  console.error(`  FAIL  ${label}${detail === undefined ? '' : ` — ${JSON.stringify(detail)}`}`);
}

// --- the questions --------------------------------------------------------

ok('scene ids are unique',
  new Set(QUESTIONS.map((q) => q.id)).size === QUESTIONS.length,
  QUESTIONS.length - new Set(QUESTIONS.map((q) => q.id)).size);
ok('every scene has four options', QUESTIONS.every((q) => q.options.length === 4));
ok('option ids are unique within their scene',
  QUESTIONS.every((q) => new Set(q.options.map((o) => o.id)).size === q.options.length));
ok('every option moves at least one axis',
  QUESTIONS.every((q) => q.options.every((o) => Object.values(o.weights).some((w) => (w ?? 0) > 0))));
ok('every option leans one way or the other',
  QUESTIONS.every((q) => q.options.every((o) => o.temper !== 0)));
// five answers of +/-1 always sum odd, so one even weight makes a tie impossible
ok('the temper can never tie',
  QUESTIONS.reduce((n, q) => n + (Math.abs(q.options[0].temper) % 2 === 0 ? 1 : 0), 0) === 1);

// --- every combination of answers, sampled ---------------------------------
// 4^12 is sixteen million and this suite finishes in about four seconds, so the
// exhaustive walk the six-question version used is gone. The stride is 997
// because it is coprime with 4^12 = 2^24 and therefore visits every residue
// class; a round 1000 would leave index % 4 fixed and pick the same option in
// the last scene every single time. A fixed sequence, so a failure reproduces.

const TOTAL = 4 ** QUESTIONS.length;
const STRIDE = 997;
const every: Casting[] = [];
for (let i = 0; i < TOTAL; i += STRIDE) {
  const answers = Array.from({ length: QUESTIONS.length }, (_, k) => (i >> (2 * k)) & 3);
  const c = cast(answers);
  if (c) every.push(c);
}
ok('the sample is big enough to bound twelve types', every.length > 10000, every.length);
ok('every score is an integer 0–100',
  every.every((c) => AXES.every((a) => Number.isInteger(c.scores[a]) && c.scores[a] >= 0 && c.scores[a] <= 100)));
ok('the two top axes are distinct', every.every((c) => c.top[0] !== c.top[1]));

const roles = new Set(every.map((c) => c.role));
ok('all six roles are reachable', roles.size === 6, [...roles]);
const types = new Set(every.map((c) => c.typeKey));
ok('all twelve types are reachable', types.size === 12, [...types]);

// A test whose every road leads to 주인공 is not a test, and one whose rarest
// answer is a lottery ticket is not either. The bounds are tighter than the
// spec's 25% because the shipped weights reach 4.2%–13.7%: a cap at 25% would
// let a retune slide most of the way back to the funnel this replaced.
const tally: Record<string, number> = {};
for (const c of every) tally[c.typeKey] = (tally[c.typeKey] ?? 0) + 1;
const ranked = Object.entries(tally).sort((a, b) => b[1] - a[1]);
const share = (n: number) => n / every.length;
ok('no type takes more than a fifth of all answer sets',
  share(ranked[0][1]) <= 0.20, { type: ranked[0][0], share: +share(ranked[0][1]).toFixed(3) });
ok('even the rarest type is reachable by more than one answer set in fifty',
  share(ranked[ranked.length - 1][1]) >= 0.02,
  { type: ranked[ranked.length - 1][0], share: +share(ranked[ranked.length - 1][1]).toFixed(3) });

// the temper must not collapse: it doubles the six roles into twelve, and a
// two-thirds lean would make half the types near-unreachable
const direct = every.filter((c) => c.temper === 'direct').length;
ok('neither temper takes less than 40% of answer sets',
  share(direct) >= 0.4 && share(direct) <= 0.6, +share(direct).toFixed(3));

// --- determinism ----------------------------------------------------------

ok('an incomplete answer set does not cast',
  cast([0, 1, 2, null, ...Array(8).fill(0)]) === null);
ok('a short answer set does not cast', cast([0, 1]) === null);
ok('the same answers always cast the same',
  JSON.stringify(cast(Array(12).fill(2))) === JSON.stringify(cast(Array(12).fill(2))));

// --- role keys ------------------------------------------------------------

ok('a role key is canonical whichever way round it is given',
  roleKey('warmth', 'romance') === roleKey('romance', 'warmth'));
ok('a role key uses AXES order', roleKey('warmth', 'romance') === 'romance_warmth',
  roleKey('warmth', 'romance'));
ok('there are six distinct pairs',
  new Set(AXES.flatMap((a) => AXES.filter((b) => b !== a).map((b) => roleKey(a, b)))).size === 6);

// --- the name that comes with the casting ---------------------------------
// The pool floor is five because the redraw has to have somewhere to go. The
// sizes were measured against the live database, not assumed: `natural` is on
// none of the 51 gender-neutral names, so a tag set using it would quietly
// shrink the pool while looking like it widened it.

const ROLES: Role[] = ['lead', 'firstLove', 'spark', 'second', 'rival', 'bestie'];

for (const role of ROLES) {
  const pool = namePool(role);
  ok(`${role} has at least five names`, pool.length >= 5, pool.length);
  ok(`${role} draws only gender-neutral names`,
    pool.every((n) => n.gender.includes('neutral')), role);
  ok(`${role} has no duplicate names`, new Set(pool.map((n) => n.id)).size === pool.length);
}

ok('the same role and seed always give the same name',
  nameFor('lead', 7, 0).id === nameFor('lead', 7, 0).id);
ok('a different seed can give a different name',
  ROLES.some((r) => new Set([0, 1, 2, 3, 4].map((s) => nameFor(r, s, 0).id)).size > 1));

// walking a pool of N must return all N before repeating any
for (const role of ROLES) {
  const pool = namePool(role);
  const walked = pool.map((_, step) => nameFor(role, 3, step).id);
  ok(`${role} redraws through its whole pool before repeating`,
    new Set(walked).size === pool.length, { pool: pool.length, distinct: new Set(walked).size });
  ok(`${role} wraps back to the start after a full lap`,
    nameFor(role, 3, pool.length).id === nameFor(role, 3, 0).id);
}

// a negative or oversized seed must still land inside the pool
for (const role of ROLES) {
  ok(`${role} keeps a wild seed inside the pool`,
    [-99, -1, 0, 9999].every((seed) => namePool(role).some((n) => n.id === nameFor(role, seed, 0).id)), role);
}

// --- the room has to be fully translated ----------------------------------
// vi and th may still carry the English string; they must not be missing.

const SHELL = ['eyebrow', 'title', 'sub', 'start', 'next', 'prev', 'again', 'reroll', 'card_label', 'disclaimer', 'headline'];
const TEMPERS = ['direct', 'careful'];
const TYPE_KEYS = ROLES.flatMap((role) => TEMPERS.map((t) => `${role}_${t}`));

ok('twelve type keys', TYPE_KEYS.length === 12, TYPE_KEYS.length);

for (const [lang, dict] of [['en', enK], ['ko', koK], ['vi', viK], ['th', thK]] as const) {
  const d = dict as Record<string, any>;
  for (const key of SHELL) {
    ok(`${lang}: kdrama.${key}`, typeof d[key] === 'string' && d[key].length > 0);
  }
  for (const axis of AXES) {
    ok(`${lang}: kdrama.axis.${axis}`, typeof d.axis?.[axis] === 'string' && d.axis[axis].length > 0);
  }
  for (const role of ROLES) {
    ok(`${lang}: kdrama.role.${role}`, typeof d.role?.[role] === 'string' && d.role[role].length > 0);
  }
  for (const temper of TEMPERS) {
    ok(`${lang}: kdrama.temper.${temper}`, typeof d.temper?.[temper] === 'string' && d.temper[temper].length > 0);
  }
  for (const key of TYPE_KEYS) {
    ok(`${lang}: kdrama.type.${key}`, typeof d.type?.[key] === 'string' && d.type[key].length > 0);
  }
  for (const q of QUESTIONS) {
    ok(`${lang}: kdrama.q.${q.id}.title`, typeof d.q?.[q.id]?.title === 'string' && d.q[q.id].title.length > 0);
    for (const o of q.options) {
      ok(`${lang}: kdrama.q.${q.id}.options.${o.id}`,
        typeof d.q?.[q.id]?.options?.[o.id] === 'string' && d.q[q.id].options[o.id].length > 0);
    }
  }
  ok(`${lang}: no orphan question keys`,
    Object.keys(d.q ?? {}).every((k) => QUESTIONS.some((q) => q.id === k)),
    Object.keys(d.q ?? {}).filter((k) => !QUESTIONS.some((q) => q.id === k)));
  ok(`${lang}: no orphan type keys`,
    Object.keys(d.type ?? {}).every((k) => TYPE_KEYS.includes(k)),
    Object.keys(d.type ?? {}).filter((k) => !TYPE_KEYS.includes(k)));
}

// word order differs per language, so the headline is a pattern the locale owns
// rather than two strings the component glues together
for (const [lang, dict] of [['en', enK], ['ko', koK], ['vi', viK], ['th', thK]] as const) {
  const pattern = (dict as Record<string, any>).headline as string;
  ok(`${lang}: headline names both slots`,
    pattern.includes('{temper}') && pattern.includes('{role}'), pattern);
}

// the twelve must read as twelve people, not one with an adjective swapped
for (const [lang, dict] of [['en', enK], ['ko', koK]] as const) {
  const lines = TYPE_KEYS.map((k) => (dict as Record<string, any>).type?.[k]).filter(Boolean);
  ok(`${lang}: every type sentence is distinct`, new Set(lines).size === lines.length);
}

// --- four acts of three scenes --------------------------------------------

ok('twelve scenes', QUESTIONS.length === 12, QUESTIONS.length);
ok('three scenes to an act', SCENES_PER_ACT === 3, SCENES_PER_ACT);
ok('four acts in 기승전결 order',
  JSON.stringify(ACTS) === JSON.stringify(['gi', 'seung', 'jeon', 'gyeol']), ACTS);
for (const act of ACTS) {
  ok(`${act} holds three scenes`, QUESTIONS.filter((q) => q.act === act).length === 3,
    QUESTIONS.filter((q) => q.act === act).length);
}
ok('scenes are in act order',
  QUESTIONS.map((q) => ACTS.indexOf(q.act)).every((a, i, xs) => i === 0 || a >= xs[i - 1]),
  QUESTIONS.map((q) => q.act));
ok('actOf agrees with the data', QUESTIONS.every((q, i) => actOf(i) === q.act));

// --- the option rule ------------------------------------------------------
// Balance has to hold inside a scene, not only across the set. Dealing the six
// pairs in order gave one scene three romance-primary options out of four, and
// that single skew pushed a type to 26% of all answer sets against a 20% bound.

type Opt = (typeof QUESTIONS)[number]['options'][number];
const primaryOf = (o: Opt) => AXES.find((a) => (o.weights[a] ?? 0) === 10);
const secondaryOf = (o: Opt) => AXES.find((a) => (o.weights[a] ?? 0) === 6);

ok('every option has one primary at 10 and one secondary at 6',
  QUESTIONS.every((q) => q.options.every((o) =>
    primaryOf(o) !== undefined && secondaryOf(o) !== undefined
    && Object.keys(o.weights).length === 2)));
ok('every scene offers one option per axis',
  QUESTIONS.every((q) => new Set(q.options.map(primaryOf)).size === 4),
  QUESTIONS.filter((q) => new Set(q.options.map(primaryOf)).size !== 4).map((q) => q.id));

const ordered = new Map<string, number>();
const unordered = new Map<string, number>();
for (const q of QUESTIONS) {
  for (const o of q.options) {
    const p = primaryOf(o)!; const sec = secondaryOf(o)!;
    ordered.set(`${p}>${sec}`, (ordered.get(`${p}>${sec}`) ?? 0) + 1);
    unordered.set(roleKey(p, sec), (unordered.get(roleKey(p, sec)) ?? 0) + 1);
  }
}
ok('twelve ordered combinations, four each',
  ordered.size === 12 && [...ordered.values()].every((n) => n === 4), [...ordered]);
ok('six pairs, eight each',
  unordered.size === 6 && [...unordered.values()].every((n) => n === 8), [...unordered]);

ok('exactly one scene carries a doubled temper',
  QUESTIONS.filter((q) => q.options.every((o) => Math.abs(o.temper) === 2)).length === 1,
  QUESTIONS.filter((q) => q.options.some((o) => Math.abs(o.temper) === 2)).map((q) => q.id));

// --- the one value an act hands forward -----------------------------------

ok('an unfinished act has no dominant axis',
  dominantAxis([0, 1, null, ...Array(9).fill(0)], 'gi') === null);
ok('a finished act has one', AXES.includes(dominantAxis(Array(12).fill(0), 'gi')!));
ok('the dominant axis reads only its own act',
  dominantAxis([0, 0, 0, ...Array(9).fill(1)], 'gi')
  === dominantAxis([0, 0, 0, ...Array(9).fill(2)], 'gi'));
ok('gi has no recap of its own', recapKey('gi', Array(12).fill(0)) === null);
ok('seung recaps gi', (recapKey('seung', Array(12).fill(0)) ?? '').startsWith('seung_'));
// a recap line nobody can reach is a line nobody should write
for (const act of ACTS.slice(0, 3)) {
  const reached = new Set<string>();
  for (let a = 0; a < 4; a += 1) for (let b = 0; b < 4; b += 1) for (let c = 0; c < 4; c += 1) {
    const ans = Array(12).fill(0);
    const start = ACTS.indexOf(act) * SCENES_PER_ACT;
    ans[start] = a; ans[start + 1] = b; ans[start + 2] = c;
    reached.add(dominantAxis(ans, act)!);
  }
  ok(`every axis is reachable as ${act}'s dominant`, reached.size === 4, [...reached]);
}

// --- the acts have to be fully written ------------------------------------

const RECAP_KEYS = ACTS.slice(1).flatMap((act) => AXES.map((axis) => `${act}_${axis}`));
ok('twelve recap lines', RECAP_KEYS.length === 12, RECAP_KEYS.length);

for (const [lang, dict] of [['en', enK], ['ko', koK], ['vi', viK], ['th', thK]] as const) {
  const d = dict as Record<string, any>;
  ok(`${lang}: kdrama.premise`, typeof d.premise === 'string' && d.premise.length > 0);
  for (const act of ACTS) {
    ok(`${lang}: kdrama.act.${act}`, typeof d.act?.[act] === 'string' && d.act[act].length > 0);
  }
  for (const key of RECAP_KEYS) {
    ok(`${lang}: kdrama.recap.${key}`, typeof d.recap?.[key] === 'string' && d.recap[key].length > 0);
  }
  ok(`${lang}: no orphan recap keys`,
    Object.keys(d.recap ?? {}).every((k) => RECAP_KEYS.includes(k)),
    Object.keys(d.recap ?? {}).filter((k) => !RECAP_KEYS.includes(k)));
}

// A recap describes what happened; it must never predict the result. Naming a
// role would leak the ending and make the last act pointless.
for (const [lang, dict] of [['en', enK], ['ko', koK]] as const) {
  const d = dict as Record<string, any>;
  const roles = Object.values(d.role ?? {}) as string[];
  for (const key of RECAP_KEYS) {
    const line = (d.recap?.[key] ?? '') as string;
    ok(`${lang}: recap.${key} does not name a role`,
      !roles.some((r) => r.length > 1 && line.includes(r)), { key, line });
  }
  ok(`${lang}: every recap line is distinct`,
    new Set(RECAP_KEYS.map((k) => d.recap?.[k])).size === RECAP_KEYS.length);
}

// --- report ---------------------------------------------------------------

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log('all kdrama checks passed');
