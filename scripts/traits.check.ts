// Runnable check for the name-traits layer: the syllable dictionary, the five
// axes, and the blend copy both rooms draw their sentences from.
// Run with: npm run check
import { SYLLABLE_DATABASE, syllableInfo } from '../src/data/syllableDatabase';
import { decompose } from '../src/utils/strokes';
import enSyl from '../src/data/locales/en/syllables.json';
import koSyl from '../src/data/locales/ko/syllables.json';
import viSyl from '../src/data/locales/vi/syllables.json';
import thSyl from '../src/data/locales/th/syllables.json';
import { AXES, blendKey, readName } from '../src/utils/nameTraits';
import { hangulFor, looksKorean } from '../src/utils/romanToHangul';
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

// --- the dictionary -------------------------------------------------------

const COUNT = 61;
ok('sixty-one syllables', SYLLABLE_DATABASE.length === COUNT, SYLLABLE_DATABASE.length);
ok('roman keys are unique', new Set(SYLLABLE_DATABASE.map((s) => s.roman)).size === COUNT);
ok('syllables are unique', new Set(SYLLABLE_DATABASE.map((s) => s.syllable)).size === COUNT);
ok('every entry is one Hangul block',
  SYLLABLE_DATABASE.every((s) => [...s.syllable].length === 1 && decompose(s.syllable) !== null));
ok('every freq is a known band',
  SYLLABLE_DATABASE.every((s) => ['very-common', 'common', 'uncommon'].includes(s.freq)));
ok('every era is a known era',
  SYLLABLE_DATABASE.every((s) => ['modern', 'timeless', 'classic'].includes(s.era)));

ok('a known syllable is found', syllableInfo('준')?.roman === 'jun', syllableInfo('준'));
ok('an unknown syllable is not', syllableInfo('뷁') === null);
ok('a non-syllable is not', syllableInfo('A') === null);

// --- the copy -------------------------------------------------------------
// vi and th may still be carrying the English line; they must not be missing.

for (const [lang, dict] of [['en', enSyl], ['ko', koSyl], ['vi', viSyl], ['th', thSyl]] as const) {
  for (const item of SYLLABLE_DATABASE) {
    const line = (dict as Record<string, string>)[item.roman];
    ok(`${lang}: ${item.roman} has a line`, typeof line === 'string' && line.length > 0);
  }
  ok(`${lang}: no orphan lines`,
    Object.keys(dict).every((k) => SYLLABLE_DATABASE.some((s) => s.roman === k)),
    Object.keys(dict).filter((k) => !SYLLABLE_DATABASE.some((s) => s.roman === k)));
}

// --- the surname split ----------------------------------------------------
// 하, 서, 민, 도, 강 and 문 are family names AND ordinary given-name syllables.
// Splitting on "is the first syllable a surname" alone would read 하준 as
// 하 씨 준 — so the split needs three syllables, not two.

ok('김하준 gives up its family name', readName('김하준')?.surnameId === 'kim', readName('김하준')?.surnameId);
ok('김하준 is scored on 하준', readName('김하준')?.given === '하준', readName('김하준')?.given);
for (const name of ['하준', '서연', '민서', '도윤', '강민', '문수']) {
  ok(`${name} keeps all its syllables`, readName(name)?.surnameId === null, readName(name)?.surnameId);
  ok(`${name} is scored whole`, readName(name)?.given === name, readName(name)?.given);
}
ok('a surname alone is a given name', readName('김')?.given === '김', readName('김')?.given);
ok('the family name does not change the reading',
  JSON.stringify(readName('김하준')?.traits) === JSON.stringify(readName('하준')?.traits));

// --- two-syllable surnames split too ---------------------------------------
// Three of Korea's nine two-syllable family names open with a syllable that
// is itself one of the forty single-syllable surnames in SURNAME_DATABASE —
// 남궁 starts with 남, 황보 with 황, 서문 with 서 — so splitSurname has to try
// the two-syllable table before the single-syllable one, or "남궁서연" would
// read as 남 씨 궁서연 (see nameTraits.ts's splitSurname doc comment: longest
// match wins). None of the nine is itself in SURNAME_DATABASE, so surnameId
// stays null for all of them even though the split fires — `surname` is the
// field that names what actually got split off.

const TWO_SYLLABLE_CASES: [string, string, string][] = [
  ['남궁서연', '남궁', '서연'],
  ['황보민서', '황보', '민서'],
  ['서문하늘', '서문', '하늘'],
  ['선우지호', '선우', '지호'],
  ['제갈민준', '제갈', '민준'],
  ['사공하은', '사공', '하은'],
  ['독고태양', '독고', '태양'],
  ['동방서준', '동방', '서준'],
  ['망절하윤', '망절', '하윤'],
];
for (const [typed, surname, given] of TWO_SYLLABLE_CASES) {
  const reading = readName(typed);
  ok(`${typed} splits off ${surname}`, reading?.surname === surname, reading?.surname);
  ok(`${typed} is scored on ${given}`, reading?.given === given, reading?.given);
  ok(`${typed} has no forty-list surnameId`, reading?.surnameId === null, reading?.surnameId);
}

ok('a bare 남궁 does not split', readName('남궁')?.surname === null, readName('남궁')?.surname);
ok('a bare 남궁 is scored whole', readName('남궁')?.given === '남궁', readName('남궁')?.given);

// --- shape ----------------------------------------------------------------

const sample = ['하준', '서연', '민서', '도윤', '김철수', '박순자', '뚜껑', 'Anna'];
for (const name of sample) {
  const reading = readName(name);
  if (name === 'Anna') { ok('a Latin name reads as nothing', reading === null, reading); continue; }
  ok(`${name} reads`, reading !== null);
  for (const axis of AXES) {
    const score = reading!.traits[axis];
    ok(`${name}.${axis} is an integer 0–100`,
      Number.isInteger(score) && score >= 0 && score <= 100, score);
  }
  ok(`${name} names two distinct top axes`,
    reading!.top.length === 2 && reading!.top[0] !== reading!.top[1], reading!.top);
}

ok('blank input reads as nothing', readName('   ') === null);
ok('the reading is stable', JSON.stringify(readName('하준')) === JSON.stringify(readName('하준')));

// --- the axes say something ------------------------------------------------
// Not exact numbers — those are a tuning and will move. These are the
// orderings that would mean the formulas had stopped working.

ok('서연 is refined', (readName('서연')?.traits.refined ?? 0) >= 60, readName('서연')?.traits.refined);
ok('뚜껑 is less refined than 서연',
  (readName('뚜껑')?.traits.refined ?? 100) < (readName('서연')?.traits.refined ?? 0),
  [readName('뚜껑')?.traits.refined, readName('서연')?.traits.refined]);
ok('a name of nothing but invented syllables is uncommon',
  (readName('뷁쒉')?.traits.uncommon ?? 0) >= 80, readName('뷁쒉')?.traits.uncommon);
ok('하준 is not uncommon', (readName('하준')?.traits.uncommon ?? 100) <= 20, readName('하준')?.traits.uncommon);
ok('half-invented lands between the bands',
  (readName('하뷁')?.traits.uncommon ?? 0) > 20 && (readName('하뷁')?.traits.uncommon ?? 0) < 80,
  readName('하뷁')?.traits.uncommon);
ok('철수 is more classic than 서연 on uncommon',
  (readName('철수')?.traits.uncommon ?? 0) > (readName('서연')?.traits.uncommon ?? 0),
  [readName('철수')?.traits.uncommon, readName('서연')?.traits.uncommon]);
ok('every dictionary syllable scores without throwing',
  SYLLABLE_DATABASE.every((s) => readName(s.syllable + s.syllable) !== null));

// --- blend keys ------------------------------------------------------------

ok('a blend key is canonical whichever way round it is given',
  blendKey('cute', 'friendly') === blendKey('friendly', 'cute'));
ok('a blend key uses AXES order', blendKey('cute', 'friendly') === 'friendly_cute', blendKey('cute', 'friendly'));
ok('there are ten distinct pairs',
  new Set(AXES.flatMap((a) => AXES.filter((b) => b !== a).map((b) => blendKey(a, b)))).size === 10);

// --- the meters discriminate ------------------------------------------------
// A five-dot meter that always shows 4 or 5 dots is not a meter, it is
// decoration — Task 4 renders `filled = floor(score / 20) + 1` per axis, and
// Task 4/5's headline sentence is picked from `top`, the two highest axes. A
// weight stack can pass every ordering check above and still collapse here:
// nothing above asserts that scores actually spread out over the 114 names
// real visitors will read, only that they point the right direction for a
// handful of hand-picked ones. This block runs the whole database through
// the scorer and checks the bucket and blend-pair spread directly, so a
// future weight change that quietly re-collapses an axis fails loudly here
// instead of shipping a card that always says the same thing.

const bucketOf = (score: number) => Math.min(5, Math.floor(score / 20) + 1);

const buckets = Object.fromEntries(AXES.map((axis) => [axis, [0, 0, 0, 0, 0]])) as Record<
  (typeof AXES)[number],
  number[]
>;
const blendCounts = new Map<string, number>();
let sampled = 0;

for (const item of NAME_DATABASE) {
  const reading = readName(item.hangul);
  if (!reading) continue;
  sampled += 1;
  for (const axis of AXES) buckets[axis][bucketOf(reading.traits[axis]) - 1] += 1;
  const key = blendKey(reading.top[0], reading.top[1]);
  blendCounts.set(key, (blendCounts.get(key) ?? 0) + 1);
}

for (const axis of AXES) {
  const b = buckets[axis];
  const bucketsUsed = b.filter((count) => count > 0).length;
  const maxShare = Math.max(...b) / sampled;
  ok(`${axis} uses at least 4 of 5 buckets over the name database`, bucketsUsed >= 4, b);
  ok(`${axis} has no bucket holding more than 60% of names`, maxShare <= 0.6,
    b.map((count) => `${((count / sampled) * 100).toFixed(1)}%`));
}

const blendEntries = [...blendCounts.entries()];
const maxBlendShare = Math.max(...blendEntries.map(([, count]) => count)) / sampled;
ok('no single blend pair exceeds 30% of the sample',
  maxBlendShare <= 0.3,
  blendEntries.map(([key, count]) => `${key}: ${((count / sampled) * 100).toFixed(1)}%`));
ok('at least 7 of the 10 blend pairs appear across the name database',
  blendEntries.length >= 7,
  blendEntries.map(([key]) => key));

// --- friendly hears frequency first ------------------------------------------
// The spec for 친근함 (`friendly`) reads "common syllables, nasal and plain
// onsets, bright short sounds" — syllable frequency is supposed to be this
// axis's headline signal, phonetics a supporting one. Round 2 widened the
// bright-vowel and soft-coda terms far enough to hit the structural ceiling
// and, in doing so, swamped the frequency terms they were never meant to
// outrank: a name built entirely of syllables the dictionary has never seen
// scored HIGHER than 철수 and 영희, Korea's own textbook stand-ins for "any
// person," and higher than an ordinary name like 민수. A 친근함 meter that
// rates a nonsense string above 철수 is measuring something other than
// familiarity — this asserts the ordering directly, with a real gap, not a
// one-point win.

const invented = readName('걍먕')?.traits.friendly ?? 100;
const everyday = { 철수: readName('철수'), 영희: readName('영희'), 민수: readName('민수'), 하준: readName('하준'), 서연: readName('서연') };
const everydayFriendly = Object.fromEntries(
  Object.entries(everyday).map(([name, reading]) => [name, reading?.traits.friendly ?? -1]),
);
ok('an all-invented name is clearly less friendly than every everyday name',
  Object.values(everydayFriendly).every((score) => invented < score - 5),
  { invented, ...everydayFriendly });

// --- every meter can reach both of its own ends -----------------------------
// The 114-name checks above catch an axis that collapses across the names the
// site actually ships, but they say nothing about the syllables it doesn't
// ship yet. A weight change can pass every check above and still leave a
// bucket structurally out of reach for ANY Korean name — round 1 of this fix
// widened `refined` and `friendly` enough to spread the 114-name sample, but
// as a side effect (and an unrelated `calm` base cut) capped what the top
// bucket could ever score at 68/68/79, all below the 80 a fifth dot needs.
// That is not a rare case the sample missed, it is a meter whose top dot can
// never light for a name that exists — as dead as the meter this file's
// first check block was written to catch, just at the other end. Brute-forcing
// all 11,172 precomposed Hangul syllables through the real scorer is cheap
// arithmetic, so there's no reason not to assert the true range directly.

const structural = Object.fromEntries(AXES.map((axis) => [axis, { min: 100, max: 0 }])) as Record<
  (typeof AXES)[number],
  { min: number; max: number }
>;
for (let cp = 0xac00; cp <= 0xd7a3; cp++) {
  const reading = readName(String.fromCodePoint(cp));
  if (!reading) continue;
  for (const axis of AXES) {
    const score = reading.traits[axis];
    const s = structural[axis];
    if (score > s.max) s.max = score;
    if (score < s.min) s.min = score;
  }
}

for (const axis of AXES) {
  const s = structural[axis];
  ok(`${axis} can reach bucket 5 (structural max >= 80) over every Hangul syllable`,
    s.max >= 80, s);
  ok(`${axis} can reach bucket 1 (structural min <= 19) over every Hangul syllable`,
    s.min <= 19, s);
}

// --- the new room has to be fully translated ------------------------------

const PAIRS = AXES.flatMap((a, i) => AXES.slice(i + 1).map((b) => blendKey(a, b)));
ok('ten blends', PAIRS.length === 10, PAIRS.length);

const SHELL = ['eyebrow', 'title', 'sub', 'label', 'placeholder', 'hint', 'waiting',
  'card_label', 'disclaimer', 'family_note'];

for (const [lang, bundle] of [['en', en], ['ko', ko], ['vi', vi], ['th', th]] as const) {
  const room = (bundle as Record<string, any>).impression;
  ok(`${lang}: impression exists`, room !== undefined);
  for (const key of SHELL) {
    ok(`${lang}: impression.${key}`, typeof room?.[key] === 'string' && room[key].length > 0);
  }
  for (const axis of AXES) {
    ok(`${lang}: impression.axis.${axis}`, typeof room?.axis?.[axis] === 'string' && room.axis[axis].length > 0);
  }
  for (const key of PAIRS) {
    ok(`${lang}: impression.blend.${key}`, typeof room?.blend?.[key] === 'string' && room.blend[key].length > 0);
  }
  ok(`${lang}: nav.impression`, typeof (bundle as Record<string, any>).nav?.impression === 'string');
}

// --- a typed Roman surname has to reach the split at all --------------------
// This is the behaviour that actually failed in the impression room: typing
// "Kim Hajun" read as 킴 하준 (a foreign given name sounded out) rather than
// 김 하준 (a Korean surname), so splitSurname below never saw three syllables
// starting with a real family name and the family note never appeared.
// hangulFor is where that got fixed; this checks the two functions together,
// the way the impression room actually calls them.

const romanSurnamed: [string, string, string][] = [
  ['Kim Hajun', 'kim', '하준'], ['Park Seoyeon', 'park', '서연'], ['Lee Jiho', 'lee', '지호'],
];
for (const [typed, surnameId, given] of romanSurnamed) {
  const read = hangulFor(typed);
  ok(`${typed}: surname splits to ${surnameId}`, readName(read!.hangul)?.surnameId === surnameId, readName(read!.hangul)?.surnameId);
  ok(`${typed}: given name scored is ${given}`, readName(read!.hangul)?.given === given, readName(read!.hangul)?.given);
}

// --- a confident wrong reading is worse than no reading ---------------------
// This site's whole audience is non-Korean, so a visitor typing their own
// name is not an edge case, it is the single most likely wrong input — and
// before this fix nothing caught it. "Anna Miller" took 안 as a real surname
// and printed a syllable note for 나 as though it were a chosen given-name
// syllable; "David Smith" scored eight syllables of two English names as one
// Korean given name. Both produced a shareable card stating all that with a
// straight face, which is worse than the room saying nothing. looksKorean
// (romanToHangul.ts) gates the card on two things measured off the Hangul
// hangulFor actually returns: at most four syllables — a family name plus a
// one-to-three-syllable given name — and, only when the raw input had a
// second word, that the first word matched a real surname, the same lookup
// hangulFor itself uses to decide whether to substitute one. "Anna Miller"
// sounds out to exactly four syllables (안나밀러) and would slip under the
// syllable ceiling alone, which is why the second rule exists.

const SHAPE_CASES: [string, boolean][] = [
  ['Kim Hajun', true], ['Park Seoyeon', true], ['Lee Jiho', true], ['Choi Minseo', true],
  ['Kang Seoyeon', true], ['Jeong Doyun', true], ['Hajun', true], ['Seoyeon', true],
  ['Minseo', true], ['김하준', true], ['하준', true], ['Sarah', true], ['Elena', true],
  ['Anna Miller', false], ['David Smith', false], ['Christopher', false], ['Alexandra', false],
  // Round 3: a Hangul family name typed with the normal space before the given
  // name — the first thing a Korean visitor would actually type — was refused
  // because the multi-word rule checked knownSurname (a Latin-only lookup)
  // against a Hangul first word, which can never match. '하 준' has no listed
  // surname at all and still has to score, same as 'Park Seoyeon' Latin-side.
  ['김 하준', true], ['박 서연', true], ['이 지호', true], ['하 준', true],
  // Round 4: round 3's fix waved through *any* Hangul first word, which let
  // '안나 밀러' back in through the Hangul door — the exact bug round 2 was
  // built to stop, just no longer typed in Latin. A single Hangul family-name
  // syllable is the shape a spaced Korean name actually has (하 준 has none of
  // it listed and still passes); two syllables ('안나', '사라', '데이빗') is a
  // given name, not a surname, however it's spelled. And a name is never half
  // Latin: '김 Smith' and 'Smith 하준' fail because the two words disagree on
  // script, not because either word is individually wrong. '서연'/'민서'/'김'
  // are single words, already covered by the syllable ceiling above, added
  // here so every literal name in the brief has its own asserted row.
  ['서연', true], ['민서', true], ['김', true],
  ['안나 밀러', false], ['김 Smith', false], ['Smith 하준', false],
  ['사라 스미스', false], ['데이빗 스미스', false], ['ㄱㄴ 하준', false], ['ㅁ 하준', false],
  // Round 5: round 4's single-syllable rule over-corrected the other way and
  // refused Korea's own two-syllable family names — 남궁, 선우, 황보 and the
  // rest of TWO_SYLLABLE_SURNAMES are real surnames, not given names that
  // happen to be Hangul. '밀러 서연' and '스미스 지호' pin the other edge: a
  // two-syllable first word that is *not* one of the nine still refuses,
  // which is what proves the nine-name list is an allowlist and not just a
  // syllable-count check in disguise.
  ['남궁 서연', true], ['선우 지호', true], ['황보 민서', true],
  ['밀러 서연', false], ['스미스 지호', false],
];
for (const [name, expected] of SHAPE_CASES) {
  const got = looksKorean(name);
  ok(`${name} ${expected ? 'reads as a Korean name shape' : 'is refused as a foreign name shape'}`,
    got === expected, { hangul: hangulFor(name)?.hangul, looksKorean: got });
}

for (const [lang, bundle] of [['en', en], ['ko', ko], ['vi', vi], ['th', th]] as const) {
  const note = (bundle as Record<string, any>).impression?.not_korean;
  ok(`${lang}: impression.not_korean`, typeof note === 'string' && note.length > 0, note);
}

// --- report ---------------------------------------------------------------

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log('all name-traits checks passed');
