// Runnable check for the K-Drama casting test: the questions, the six roles the
// axis pairs name, and the twelve types they make with the temper.
// Run with: npm run check
import { SLOTS, BRANCH_AT } from '../src/data/kdramaSlots';
import { GENRES, STORIES, sceneAt } from '../src/data/kdramaScenes';
import { ACTS, AXES, SCENES_PER_ACT, actOf, cast, dominantAxis, recapKey, roleKey, type Casting, type Role } from '../src/utils/kdramaCasting';
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

// --- the twelve slots --------------------------------------------------------

ok('every scene has four options', SLOTS.every((q) => q.options.length === 4));
ok('every option moves at least one axis',
  SLOTS.every((q) => q.options.every((o) => Object.values(o.weights).some((w) => (w ?? 0) > 0))));
ok('every option leans one way or the other',
  SLOTS.every((q) => q.options.every((o) => o.temper !== 0)));
// five answers of +/-1 always sum odd, so one even weight makes a tie impossible
ok('the temper can never tie',
  SLOTS.reduce((n, q) => n + (Math.abs(q.options[0].temper) % 2 === 0 ? 1 : 0), 0) === 1);

// --- every combination of answers, sampled ---------------------------------
// 4^12 is sixteen million and this suite finishes in about four seconds, so the
// exhaustive walk the six-question version used is gone. The stride is 997
// because it is coprime with 4^12 = 2^24 and therefore visits every residue
// class; a round 1000 would leave index % 4 fixed and pick the same option in
// the last scene every single time. A fixed sequence, so a failure reproduces.

const TOTAL = 4 ** SLOTS.length;
const STRIDE = 997;
const every: Casting[] = [];
for (let i = 0; i < TOTAL; i += STRIDE) {
  const answers = Array.from({ length: SLOTS.length }, (_, k) => (i >> (2 * k)) & 3);
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

// The six roles, in the order the copy is written against.
const ROLES: Role[] = ['lead', 'firstLove', 'spark', 'second', 'rival', 'bestie'];

// --- one arithmetic, four stories ------------------------------------------
// The weights belong to the slot, not to the scene sitting in it. That is why a
// genre swap cannot move the distribution measured above, and why the rule is
// asserted rather than trusted: retyping a number is the only way it moves.

ok('the weights still follow the position rule',
  SLOTS.every((slot, i) => slot.options.every((o, j) => {
    const primary = AXES[j];
    const secondary = AXES[(j + 1 + (i % 3)) % 4];
    const sign = (i + j) % 2 === 0 ? 1 : -1;
    const scale = i === SLOTS.length - 1 ? 2 : 1;
    return o.weights[primary] === 10 && o.weights[secondary] === 6
      && Object.keys(o.weights).length === 2 && o.temper === sign * scale;
  })),
  SLOTS.map((slot, i) => (slot.options.some((o, j) => o.weights[AXES[j]] !== 10
    || o.weights[AXES[(j + 1 + (i % 3)) % 4]] !== 6) ? i : null)).filter((i) => i !== null));

for (const genre of GENRES) {
  const story = STORIES[genre];
  ok(`${genre}: twelve positions`, story.tellings.length === 12, story.tellings.length);
  ok(`${genre}: branches exactly at ${BRANCH_AT.join(',')}`,
    story.tellings.every((t, i) => t.branch === BRANCH_AT.includes(i)),
    story.tellings.map((t, i) => (t.branch ? i : null)).filter((i) => i !== null));

  // a branch the dominant axis can select but that nobody wrote is a crash
  for (const i of BRANCH_AT) {
    const telling = story.tellings[i];
    ok(`${genre}: position ${i} offers all four axes`,
      telling.branch && AXES.every((a) => (telling.scenes[a]?.id ?? '').length > 0),
      telling.branch ? Object.keys(telling.scenes) : 'not a branch');
  }

  const scenes = story.tellings.flatMap((t) => (t.branch ? Object.values(t.scenes) : [t.scene]));
  ok(`${genre}: twenty-one scenes`, scenes.length === 21, scenes.length);
  ok(`${genre}: scene ids are unique`,
    new Set(scenes.map((s) => s.id)).size === scenes.length,
    scenes.map((s) => s.id).filter((id, i, xs) => xs.indexOf(id) !== i));
  ok(`${genre}: four options per scene, ids unique within it`,
    scenes.every((s) => s.options.length === 4 && new Set(s.options).size === 4));
  ok(`${genre}: option ids are unique across the genre`,
    new Set(scenes.flatMap((s) => s.options)).size === scenes.length * 4,
    scenes.flatMap((s) => s.options).filter((id, i, xs) => xs.indexOf(id) !== i));
  ok(`${genre}: six name positions`, story.name.length === 6, story.name);
  ok(`${genre}: name positions are in range and sorted`,
    story.name.every((i, k) => i >= 0 && i < 12 && (k === 0 || i > story.name[k - 1])), story.name);

  // every one of the 4^3 paths has to land on a real scene at all twelve
  for (let a = 0; a < 4; a += 1) for (let b = 0; b < 4; b += 1) for (let c = 0; c < 4; c += 1) {
    const answers = [a, a, a, b, b, b, c, c, c, 0, 0, 0];
    ok(`${genre}: path ${a}${b}${c} resolves every position`,
      Array.from({ length: 12 }, (_, i) => sceneAt(genre, i, answers)).every((s) => (s?.id ?? '').length > 0));
  }
}

// --- the room has to be fully written --------------------------------------
// vi and th may still carry the English string; they must not be missing.

const SHELL = ['eyebrow', 'title', 'sub', 'start', 'next', 'prev', 'again', 'disclaimer',
  'premise', 'name_label', 'name_placeholder', 'name_hint'];
const TYPE_KEYS = ROLES.flatMap((role) => ['direct', 'careful'].map((t) => `${role}_${t}`));
ok('twelve type keys', TYPE_KEYS.length === 12, TYPE_KEYS.length);

for (const [lang, dict] of [['en', enK], ['ko', koK], ['vi', viK], ['th', thK]] as const) {
  const d = dict as Record<string, any>;
  for (const key of SHELL) {
    ok(`${lang}: kdrama.${key}`, typeof d[key] === 'string' && d[key].length > 0);
  }
  for (const axis of AXES) {
    ok(`${lang}: kdrama.axis.${axis}`, typeof d.axis?.[axis] === 'string' && d.axis[axis].length > 0);
  }
  for (const act of ACTS) {
    ok(`${lang}: kdrama.act.${act}`, typeof d.act?.[act] === 'string' && d.act[act].length > 0);
  }

  // the vocabulary is gone, not merely unused: 주인공 on a card is a verdict
  // about a person, and this room hands back a drama instead
  for (const key of ['role', 'temper', 'type', 'recap', 'headline', 'card_label', 'reroll']) {
    ok(`${lang}: kdrama.${key} is gone`, d[key] === undefined);
  }

  for (const genre of GENRES) {
    for (const key of ['label', 'tagline', 'slot']) {
      ok(`${lang}: genre.${genre}.${key}`,
        typeof d.genre?.[genre]?.[key] === 'string' && d.genre[genre][key].length > 0);
    }
    const g = d[genre] ?? {};
    const story = STORIES[genre];
    for (let i = 0; i < 12; i += 1) {
      const telling = story.tellings[i];
      const variants = telling.branch ? Object.values(telling.scenes) : [telling.scene];
      for (const scene of variants) {
        const title = (g.q?.[scene.id]?.title ?? '') as string;
        ok(`${lang}: ${genre}.q.${scene.id}.title`, title.length > 0);
        for (const optionId of scene.options) {
          ok(`${lang}: ${genre}.q.${scene.id}.options.${optionId}`,
            typeof g.q?.[scene.id]?.options?.[optionId] === 'string'
            && g.q[scene.id].options[optionId].length > 0);
        }
        // name-bearing belongs to the position, so every path hears it six times
        const carries = title.includes('{name}')
          || Object.values(g.q?.[scene.id]?.options ?? {}).some((o) => String(o).includes('{name}'));
        ok(`${lang}: ${genre}.q.${scene.id} carries {name} exactly when its position does`,
          carries === story.name.includes(i), { scene: scene.id, position: i, carries });
      }
    }
    const written = new Set(story.tellings.flatMap((t) =>
      (t.branch ? Object.values(t.scenes) : [t.scene]).map((s) => s.id)));
    ok(`${lang}: ${genre} has no orphan scene keys`,
      Object.keys(g.q ?? {}).every((key) => written.has(key)),
      Object.keys(g.q ?? {}).filter((key) => !written.has(key)));

    for (const key of TYPE_KEYS) {
      const poster = g.poster?.[key] ?? {};
      // the title is where the visitor is; a poster without them in it is the
      // old casting card wearing a new word
      ok(`${lang}: ${genre}.poster.${key}.title names the visitor`,
        typeof poster.title === 'string' && poster.title.includes('{name}'), poster.title);
      ok(`${lang}: ${genre}.poster.${key}.logline`,
        typeof poster.logline === 'string' && poster.logline.length > 0);
    }
    ok(`${lang}: ${genre} posters read as twelve dramas`,
      new Set(TYPE_KEYS.map((key) => g.poster?.[key]?.title)).size === 12);
    ok(`${lang}: ${genre} has no orphan poster keys`,
      Object.keys(g.poster ?? {}).every((key) => TYPE_KEYS.includes(key)),
      Object.keys(g.poster ?? {}).filter((key) => !TYPE_KEYS.includes(key)));
  }
}

// --- the particles after a name --------------------------------------------
// Korean picks between 은/는 and 과/와 by the syllable in front, and the syllable
// in front is a name the copy has never seen: 사라는 but 하린은. A bare particle
// written straight after {name} is right for half of all visitors — the poster
// read 《사라과 그 사람 사이》 until this was caught. The copy writes the pair.

const BARE_PARTICLE = /\{name\}[은는이가과와을를랑아야으]/;
const PAIR = /\{[가-힣]{1,2}\/[가-힣]{1,2}\}/;
for (const genre of GENRES) {
  const g = (koK as Record<string, any>)[genre] ?? {};
  const lines: [string, string][] = [
    ...Object.entries(g.q ?? {}).flatMap(([id, scene]: [string, any]) =>
      [[`q.${id}.title`, scene.title] as [string, string],
        ...Object.entries(scene.options ?? {}).map(([o, v]) => [`q.${id}.${o}`, v] as [string, string])]),
    ...Object.entries(g.poster ?? {}).flatMap(([key, p]: [string, any]) =>
      [[`poster.${key}.title`, p.title] as [string, string],
        [`poster.${key}.logline`, p.logline] as [string, string]]),
  ];
  for (const [where, line] of lines) {
    ok(`ko: ${genre}.${where} writes the particle pair, not a bare one`,
      !BARE_PARTICLE.test(String(line)), line);
  }
  // and a pair that nothing resolves is a brace on the screen
  for (const [where, line] of lines) {
    ok(`ko: ${genre}.${where} only pairs a particle where a name precedes it`,
      !PAIR.test(String(line)) || String(line).includes('{name}'), line);
  }
}

// --- report ---------------------------------------------------------------

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log('all kdrama checks passed');
