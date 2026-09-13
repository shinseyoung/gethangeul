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

// --- report ---------------------------------------------------------------

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log('all name-traits checks passed');
