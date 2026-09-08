// Runnable check for the two pieces of real logic: reading a name's opening
// sound, and turning four answers into a reproducible ranking.
// Run with: npm run check
import { readOnset } from '../src/utils/soundBridge';
import { matchNames, type MatchAnswers } from '../src/utils/nameMatcher';
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

// --- turning answers into a ranking --------------------------------------

const sarah: MatchAnswers = {
  givenName: 'Sarah', gender: 'female', vibe: 'calm', personality: 'prudent', seasonNature: 'winter',
};
const ben: MatchAnswers = {
  givenName: 'Ben', gender: 'male', vibe: 'calm', personality: 'prudent', seasonNature: 'autumn',
};
const anonymous: MatchAnswers = {
  gender: 'neutral', vibe: 'calm', personality: 'prudent', seasonNature: 'winter',
};

const a = matchNames(sarah);
const b = matchNames(sarah);
ok('same answers give the same names', JSON.stringify(a.matches.map((m) => m.name.id)) === JSON.stringify(b.matches.map((m) => m.name.id)));
ok('three candidates are returned', a.matches.length === 3, a.matches.length);
ok('scores never increase down the list', a.matches.every((m, i) => i === 0 || m.score <= a.matches[i - 1].score));

ok('Sarah finds a sound match', a.sound.matched === true);
ok('Sarah maps onto ㅅ', a.sound.cho === 'ㅅ', a.sound.cho);
ok('every Sarah candidate starts on ㅅ', a.matches.every((m) => choseongOf(m.name.hangul) === 'ㅅ'), a.matches.map((m) => m.name.hangul));
ok('the gender filter holds', a.matches.every((m) => m.name.gender.includes('female')), a.matches.map((m) => m.name.hangul));
ok('a sound match is reported as a reason', a.matches.every((m) => m.reasons.includes('sound')));

const bm = matchNames(ben);
ok('Ben is told there is no sound match', bm.sound.tried === true && bm.sound.matched === false);
ok('Ben still gets three names on meaning alone', bm.matches.length === 3);
ok('Ben has no sound reason attached', bm.matches.every((m) => !m.reasons.includes('sound')));

const an = matchNames(anonymous);
ok('skipping the name still works', an.matches.length === 3 && an.sound.tried === false);

// "Mina" narrows to ㅁ, and after the female filter that was a pool of one —
// under a heading that promises three.
const mina = matchNames({ ...sarah, givenName: 'Mina' });
ok('a one-name sound pool is still topped up to three', mina.matches.length === 3, mina.matches.map((m) => m.name.hangul));
ok('the sound match still leads', choseongOf(mina.matches[0].name.hangul) === 'ㅁ', mina.matches[0].name.hangul);
ok('only the sound-pool names claim a sound reason',
  mina.matches.every((m) => m.reasons.includes('sound') === (choseongOf(m.name.hangul) === 'ㅁ')),
  mina.matches.map((m) => `${m.name.hangul}:${m.reasons.join('+')}`));

const differentName = matchNames({ ...sarah, givenName: 'Daniel' });
ok('a different name reaches a different pool',
  JSON.stringify(differentName.matches.map((m) => m.name.id)) !== JSON.stringify(a.matches.map((m) => m.name.id)));

// --- the two option lists must not answer each other in the same words ------

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
