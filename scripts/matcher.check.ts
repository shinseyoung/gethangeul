// Runnable check for the two pieces of real logic: reading a name's opening
// sound, and turning four answers into a reproducible ranking.
// Run with: npm run check
import { readOnset } from '../src/utils/soundBridge';
import { matchNames, type MatchAnswers } from '../src/utils/nameMatcher';
import { choseongOf } from '../src/utils/soundBridge';
import { FILL_WIDTH, MASK_WIDTH, strokeCount, nameStrokes } from '../src/utils/hangulStrokes';
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

// --- stroke order ---------------------------------------------------------

ok('설아 is ten strokes', strokeCount('설아') === 10, strokeCount('설아'));
ok('과 is five strokes — ㄱ, then ㅗ, then ㅏ', strokeCount('과') === 5, strokeCount('과'));
// 규 = ㄱ(1) + ㅠ(3); 현 = ㅎ(3) + ㅕ(3) + ㄴ(1)
ok('규현 is eleven strokes', strokeCount('규현') === 11, strokeCount('규현'));
ok('a compound vowel and compound final both decompose', strokeCount('뷁') === 13, strokeCount('뷁'));
ok('non-Hangul yields nothing', strokeCount('Sarah') === 0, strokeCount('Sarah'));

const CMD = /([MLHVA])([^MLHVA]*)/g;
const args = (a: string) => (a.match(/-?\d*\.?\d+/g) ?? []).map(Number);

/** every point a path passes through, after bake() placed it in the cell */
function points(d: string): [number, number][] {
  const out: [number, number][] = [];
  let x = 0;
  let y = 0;
  for (const [, cmd, rest] of d.matchAll(CMD)) {
    const n = args(rest);
    if (cmd === 'H') x = n[0];
    else if (cmd === 'V') y = n[0];
    else if (cmd === 'A') { x = n[5]; y = n[6]; }
    else { x = n[0]; y = n[1]; }
    out.push([x, y]);
  }
  return out;
}

const seolCho = points(nameStrokes('설')[0].strokes[0].d);
// ㅅ is one diagonal, and 설 has a final, so its initial lives in the top-left box
ok('the first stroke of 설 is the initial ㅅ, placed', seolCho.length === 2, seolCho);
ok('it runs down and to the left', seolCho[1][0] < seolCho[0][0] && seolCho[1][1] > seolCho[0][1], seolCho);
ok('it stays inside the initial box', seolCho.every(([x, y]) => x >= 3 && x <= 48 && y >= 2 && y <= 56), seolCho);

// The reason bake() exists: a final ㄹ sits in a box 40 units tall, so its three
// horizontal bars land close together. The mask has to be wide enough to bridge
// them or the letter comes out in slices — which is what a scaled stroke did.
const ril = nameStrokes('늘')[0].strokes.slice(-3);
const bars = [...new Set(ril.flatMap((st) => points(st.d).map(([, y]) => y)))].sort((a, b) => a - b);
const widestGap = Math.max(...bars.slice(1).map((y, i) => y - bars[i]));
ok('the settling pass closes ㄹ', widestGap <= FILL_WIDTH, { bars, widestGap, FILL_WIDTH });
// and the brush itself stays near the ink — a wide one reads as a smear, which
// is the whole reason the settling pass exists instead of one fat stroke
ok('the writing brush stays near the ink', MASK_WIDTH <= 18 && MASK_WIDTH < FILL_WIDTH, { MASK_WIDTH, FILL_WIDTH });
ok('every stroke says which jamo it belongs to',
  nameStrokes('늘')[0].strokes.map((st) => st.group).join('') === '01222', nameStrokes('늘')[0].strokes.map((st) => st.group));

const strays = NAME_DATABASE.flatMap((n) => nameStrokes(n.hangul)
  .flatMap((syl) => syl.strokes.filter((st) => points(st.d).some(([x, y]) => x < -2 || x > 102 || y < -2 || y > 102))
    .map((st) => `${n.hangul}:${st.d}`)));
ok('no stroke wanders outside its cell', strays.length === 0, strays.slice(0, 5));

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

// the whole point of the arithmetic: no name may fall through the jamo tables
const gaps = NAME_DATABASE.filter((n) => strokeCount(n.hangul) === 0);
ok('all 114 names can be written', gaps.length === 0, gaps.map((n) => n.hangul));
const thin = NAME_DATABASE.filter((n) => strokeCount(n.hangul) < [...n.hangul].length * 2);
ok('no name comes back suspiciously short', thin.length === 0, thin.map((n) => `${n.hangul}:${strokeCount(n.hangul)}`));

// --- report ---------------------------------------------------------------

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log('all checks passed');
