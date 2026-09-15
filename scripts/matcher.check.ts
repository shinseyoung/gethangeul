// Runnable check for the two pieces of real logic: reading a name's opening
// sound, and turning four answers into a reproducible ranking.
// Run with: npm run check
import { readOnset } from '../src/utils/soundBridge';
import { matchNames, type MatchAnswers } from '../src/utils/nameMatcher';
import { SITUATIONS, VARIANT_COUNT, type Answers } from '../src/data/situations';
import { choseongOf } from '../src/utils/soundBridge';
import { NAME_DATABASE } from '../src/data/nameDatabase';
import en from '../src/data/locales/en/common.json';
import ko from '../src/data/locales/ko/common.json';
import vi from '../src/data/locales/vi/common.json';
import th from '../src/data/locales/th/common.json';

let failures = 0;
function ok(label: string, condition: boolean, detail?: unknown) {
  if (condition) return;
  failures += 1;
  console.error(`  FAIL  ${label}${detail === undefined ? '' : ` — ${JSON.stringify(detail)}`}`);
}

// --- reading the opening sound -------------------------------------------

const onset = (s: string) => {
  const r = readOnset(s);
  return r.ok ? r.cho : `!${r.reason}`;
};

ok('Sarah opens on ㅅ', onset('Sarah') === 'ㅅ', onset('Sarah'));
ok('Michael opens on ㅁ', onset('Michael') === 'ㅁ', onset('Michael'));
ok('Ben opens on ㅂ', onset('Ben') === 'ㅂ', onset('Ben'));
ok('Chris takes the ch digraph', onset('Chris') === 'ㅊ', onset('Chris'));
ok('Cecilia takes soft c', onset('Cecilia') === 'ㅅ', onset('Cecilia'));
ok('a bare C stays hard — the empty-string guard', onset('C') === 'ㅋ', onset('C'));
ok('Vietnamese diacritics fold away', onset('Nguyễn') === 'ㄴ', onset('Nguyễn'));
ok('Đức folds to d', onset('Đức') === 'ㄷ', onset('Đức'));
ok('Hangul input is read directly', onset('설아') === 'ㅅ', onset('설아'));
ok('a full name uses only the first word', onset('Mary Jane') === 'ㅁ', onset('Mary Jane'));
ok('Thai is reported unreadable, not guessed', onset('ไทย') === '!unreadable', onset('ไทย'));
ok('Japanese is reported unreadable', onset('さくら') === '!unreadable', onset('さくら'));
ok('blank input is empty, not unreadable', onset('   ') === '!empty', onset('   '));

// --- the six situations ----------------------------------------------------
// Two screens shipped broken for months because nothing checked that a tag an
// option offers is a tag a name actually carries: `natural` is on none of the
// 114 names, and `sky`, `sun` and `flower` are on 46 of them and were offered
// by nobody. Both are impossible from here on.

const VIBES = new Set(NAME_DATABASE.flatMap((n) => n.vibes));
const PERSONALITIES = new Set(NAME_DATABASE.flatMap((n) => n.personalities));
const NATURE = new Set(NAME_DATABASE.flatMap((n) => n.nature));
const POOL: Record<string, Set<string>> = {
  vibes: VIBES, personalities: PERSONALITIES, nature: NATURE,
};

ok('six situations', SITUATIONS.length === 6, SITUATIONS.length);
ok('situation ids are unique', new Set(SITUATIONS.map((s) => s.id)).size === 6);
ok('four tag sets each', SITUATIONS.every((s) => s.tags.length === 4));
ok('every option moves at least one tag',
  SITUATIONS.every((s) => s.tags.every((tags) => tags.length > 0)));

/* Each situation is written three ways and a visit gets one. The tags sit on
   the situation rather than the telling, so answering first always puts the
   same tags on the table — which is why the 4,096-set walk below is still a
   walk of 4,096 and not of 4,096 x 3^6, and why a shared card reproduces for
   someone reading different scenes than the person who sent it. */
ok('every situation is written the same number of ways',
  SITUATIONS.every((s) => s.variants.length === VARIANT_COUNT), VARIANT_COUNT);
ok('more than one telling, or there was no point',
  VARIANT_COUNT > 1, VARIANT_COUNT);
ok('every telling offers four options',
  SITUATIONS.every((s) => s.variants.every((x) => x.options.length === 4)));
ok('variant ids are unique within their situation',
  SITUATIONS.every((s) => new Set(s.variants.map((x) => x.id)).size === s.variants.length));

/* the reasons dictionary is keyed by option id alone, so a collision between
   two tellings would print one telling's line for the other's answer */
const OPTION_IDS = SITUATIONS.flatMap((s) => s.variants.flatMap((x) => x.options));
ok('option ids are unique across every telling of every situation',
  new Set(OPTION_IDS).size === OPTION_IDS.length,
  OPTION_IDS.filter((id, i) => OPTION_IDS.indexOf(id) !== i));

for (const situation of SITUATIONS) {
  const pool = POOL[situation.axis];
  situation.tags.forEach((tags, i) => {
    const unknown = tags.filter((tag) => !pool.has(tag));
    ok(`${situation.id} option ${i} references only tags names carry`,
      unknown.length === 0, unknown);
  });
}

// a tag nothing offers is a tag names can be narrowed by and never selected for
for (const axis of ['vibes', 'personalities', 'nature'] as const) {
  const offered = new Set(SITUATIONS.filter((s) => s.axis === axis)
    .flatMap((s) => s.tags.flat()));
  const missed = [...POOL[axis]].filter((tag) => !offered.has(tag));
  ok(`every ${axis} tag is offered by some option`, missed.length === 0, missed);
}

// --- turning six answers into a ranking ------------------------------------

const sarah: MatchAnswers = { givenName: 'Sarah', gender: 'female', answers: [0, 0, 0, 0, 0, 0] };
const ben: MatchAnswers = { givenName: 'Ben', gender: 'male', answers: [1, 2, 3, 0, 1, 2] };
const anonymous: MatchAnswers = { gender: 'neutral', answers: [2, 2, 2, 2, 2, 2] };

const a = matchNames(sarah);
const b = matchNames(sarah);
ok('same answers give the same names',
  JSON.stringify(a.matches.map((m) => m.name.id)) === JSON.stringify(b.matches.map((m) => m.name.id)));
ok('three candidates are returned', a.matches.length === 3, a.matches.length);
ok('scores never increase down the list',
  a.matches.every((m, i) => i === 0 || m.score <= a.matches[i - 1].score));

ok('Sarah finds a sound match', a.sound.matched === true);
ok('Sarah maps onto ㅅ', a.sound.cho === 'ㅅ', a.sound.cho);
ok('every Sarah candidate starts on ㅅ',
  a.matches.every((m) => choseongOf(m.name.hangul) === 'ㅅ'), a.matches.map((m) => m.name.hangul));
ok('the gender filter holds',
  a.matches.every((m) => m.name.gender.includes('female')), a.matches.map((m) => m.name.hangul));
ok('a sound match is reported as a reason', a.matches.every((m) => m.reasons.includes('sound')));

const bm = matchNames(ben);
ok('Ben is told there is no sound match', bm.sound.tried === true && bm.sound.matched === false);
ok('Ben still gets three names on meaning alone', bm.matches.length === 3);
ok('Ben has no sound reason attached', bm.matches.every((m) => !m.reasons.includes('sound')));

const an = matchNames(anonymous);
ok('skipping the name still works', an.matches.length === 3 && an.sound.tried === false);

// a reason may only name a situation the visitor actually answered
ok('every reason is a situation id or the sound',
  an.matches.every((m) => m.reasons.every((r) => r === 'sound' || SITUATIONS.some((s) => s.id === r))),
  an.matches.flatMap((m) => m.reasons));

// "Mina" narrows to ㅁ, and after the female filter that was a pool of one —
// under a heading that promises three.
const mina = matchNames({ ...sarah, givenName: 'Mina' });
ok('a one-name sound pool is still topped up to three', mina.matches.length === 3);
ok('the sound match still leads', choseongOf(mina.matches[0].name.hangul) === 'ㅁ',
  mina.matches[0].name.hangul);
ok('only the sound-pool names claim a sound reason',
  mina.matches.every((m) => m.reasons.includes('sound') === (choseongOf(m.name.hangul) === 'ㅁ')),
  mina.matches.map((m) => `${m.name.hangul}:${m.reasons.join('+')}`));

// --- where 4,096 answer sets land ------------------------------------------
// Four questions over 114 names meant a lot of visitors got the same name. Six
// have to spread: a name nobody can reach is dead data, and a name a twelfth of
// everyone gets is the funnel this replaced.

const TOTAL = 4 ** SITUATIONS.length;
for (const gender of ['male', 'female', 'neutral'] as const) {
  const winners: Record<string, number> = {};
  for (let i = 0; i < TOTAL; i += 1) {
    const answers = Array.from({ length: SITUATIONS.length }, (_, k) => (i >> (2 * k)) & 3);
    const top = matchNames({ gender, answers }, 1).matches[0].name.id;
    winners[top] = (winners[top] ?? 0) + 1;
  }
  const pool = NAME_DATABASE.filter((n) => n.gender.includes(gender));
  const unreachable = pool.filter((n) => !winners[n.id]).map((n) => n.id);
  ok(`${gender}: every name in the pool wins at least once`, unreachable.length === 0,
    { pool: pool.length, unreachable: unreachable.length, sample: unreachable.slice(0, 8) });

  const ranked = Object.entries(winners).sort((x, y) => y[1] - x[1]);
  ok(`${gender}: no single name takes more than 8% of answer sets`,
    ranked[0][1] / TOTAL <= 0.08,
    { name: ranked[0][0], share: +(ranked[0][1] / TOTAL).toFixed(3), distinct: ranked.length });
}

const twice: Answers = [0, 1, 2, 3, 0, 1];
ok('the same answers give the same name',
  matchNames({ gender: 'female', answers: twice }, 1).matches[0].name.id
  === matchNames({ gender: 'female', answers: twice }, 1).matches[0].name.id);
// a situation nobody's answer can move is a screen that wastes a tap
for (let situation = 0; situation < SITUATIONS.length; situation += 1) {
  let moves = false;
  for (let base = 0; base < 4 ** SITUATIONS.length && !moves; base += 419) {
    const answers = Array.from({ length: SITUATIONS.length }, (_, k) => (base >> (2 * k)) & 3);
    const got = new Set([0, 1, 2, 3].map((pick) => {
      const tried = [...answers];
      tried[situation] = pick;
      return matchNames({ gender: 'female', answers: tried }, 1).matches[0].name.id;
    }));
    moves = got.size > 1;
  }
  ok(`answering ${SITUATIONS[situation].id} differently can change the name`, moves);
}

// --- the room has to be fully written --------------------------------------
// vi and th may still carry the English string; they must not be missing.

for (const [lang, bundle] of Object.entries({ en, ko, vi, th })) {
  const b = bundle as Record<string, any>;
  for (const situation of SITUATIONS) {
    for (const variant of situation.variants) {
      const block = b.situations?.[situation.id]?.[variant.id];
      ok(`${lang}: situations.${situation.id}.${variant.id}.title`,
        typeof block?.title === 'string' && block.title.length > 0);
      ok(`${lang}: situations.${situation.id}.${variant.id}.description`,
        typeof block?.description === 'string' && block.description.length > 0);
      for (const optionId of variant.options) {
        ok(`${lang}: situations.${situation.id}.${variant.id}.options.${optionId}`,
          typeof block?.options?.[optionId] === 'string' && block.options[optionId].length > 0);
        // the card names the answer, not the question, so every option needs one
        ok(`${lang}: reasons.${optionId}`,
          typeof b.reasons?.[optionId] === 'string' && b.reasons[optionId].length > 0);
      }
    }

  }

  // every tag a name carries can now reach a chip on the card — including the
  // three that were unreachable until the evening question existed
  for (const axis of ['vibes', 'personalities', 'nature'] as const) {
    for (const tag of POOL[axis]) {
      ok(`${lang}: tags.${axis}.${tag}`,
        typeof b.tags?.[axis]?.[tag] === 'string' && b.tags[axis][tag].length > 0);
    }
  }

  ok(`${lang}: result.because names all three slots`,
    ['{a}', '{b}', '{name}'].every((slot) => String(b.result?.because ?? '').includes(slot)),
    b.result?.because);
  ok(`${lang}: surname.gender_label`,
    typeof b.surname?.gender_label === 'string' && b.surname.gender_label.length > 0);
  ok(`${lang}: seven rail labels`, Object.keys(b.layout?.steps ?? {}).length === 7,
    Object.keys(b.layout?.steps ?? {}).length);

  // the four adjective grids are gone, not merely unused
  for (const group of ['vibe', 'personality', 'nature']) {
    ok(`${lang}: options.${group} is gone`, b.options?.[group] === undefined);
  }
  ok(`${lang}: the four old question screens are gone`, b.questions === undefined);
}

// --- the option lists must not answer each other in the same words ----------

for (const [lang, bundle] of Object.entries({ en, ko, vi, th })) {
  const seen = new Map<string, string>();
  for (const [group, items] of Object.entries(bundle.options as Record<string, Record<string, string>>)) {
    for (const [id, label] of Object.entries(items)) {
      ok(`${lang}: ${group}.${id} is not a repeat of ${seen.get(label)}`, !seen.has(label), label);
      seen.set(label, `${group}.${id}`);
    }
  }
}

// --- report ---------------------------------------------------------------

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log('all checks passed');
