// Runnable check for the name-traits layer: the syllable dictionary, the five
// axes, and the blend copy both rooms draw their sentences from.
// Run with: npm run check
import { SYLLABLE_DATABASE, syllableInfo } from '../src/data/syllableDatabase';
import { decompose } from '../src/utils/strokes';
import enSyl from '../src/data/locales/en/syllables.json';
import koSyl from '../src/data/locales/ko/syllables.json';
import viSyl from '../src/data/locales/vi/syllables.json';
import thSyl from '../src/data/locales/th/syllables.json';

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

// --- report ---------------------------------------------------------------

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log('all name-traits checks passed');
