// Runnable check for the name-compatibility room: stroke counts, the fold, and
// the Latin-to-Hangul reading that lets a foreign name play at all.
// Run with: npm run check
import { decompose, strokesOf, strokesOfSyllable } from '../src/utils/strokes';
import { compatibility } from '../src/utils/nameCompat';
import { hangulFor, romanToHangul } from '../src/utils/romanToHangul';
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

// --- stroke counts, the numbers everything else is built on ----------------
// If these drift, every percentage the site prints is quietly wrong, and
// nothing else in the app would notice.

ok('김 is 5 strokes', strokesOfSyllable('김') === 5, strokesOfSyllable('김'));
ok('박 is 7 strokes', strokesOfSyllable('박') === 7, strokesOfSyllable('박'));
ok('민 is 5 strokes', strokesOfSyllable('민') === 5, strokesOfSyllable('민'));
ok('다 is 4 strokes', strokesOfSyllable('다') === 4, strokesOfSyllable('다'));
ok('서 is 4 strokes', strokesOfSyllable('서') === 4, strokesOfSyllable('서'));
ok('혜 is 7 strokes', strokesOfSyllable('혜') === 7, strokesOfSyllable('혜'));
ok('아 is 3 strokes', strokesOfSyllable('아') === 3, strokesOfSyllable('아'));
ok('a Latin letter has no stroke count', strokesOfSyllable('A') === null);
ok('non-Hangul is dropped, not counted', strokesOf('Anna 안나').length === 2, strokesOf('Anna 안나').length);

// --- jamo decomposition, shared with the traits scorer ---------------------
// nameTraits.ts reads the same indices these tables are indexed by, so this is
// the one place the arithmetic is allowed to live.

ok('김 decomposes to ㄱ / ㅣ / ㅁ', JSON.stringify(decompose('김')) === JSON.stringify({ cho: 0, jung: 20, jong: 16 }), decompose('김'));
ok('하 has no final consonant', decompose('하')?.jong === 0, decompose('하'));
ok('뷁 is still a syllable block', decompose('뷁') !== null);
ok('a Latin letter does not decompose', decompose('A') === null);
ok('a bare jamo does not decompose', decompose('ㄱ') === null);
ok('an empty string does not decompose', decompose('') === null);

// --- the fold --------------------------------------------------------------
// The worked example everyone knows: 김민서 × 박다혜 is 34%.

const known = compatibility('김민서', '박다혜');
ok('names are written one letter each in turn',
  known.cells.map((c) => c.char).join('') === '김박민다서혜',
  known.cells.map((c) => c.char).join(''));
ok('the first row is the stroke counts',
  JSON.stringify(known.rows[0]) === JSON.stringify([5, 7, 5, 4, 4, 7]), known.rows[0]);
ok('each fold is one shorter', known.rows.every((r, i) => i === 0 || r.length === known.rows[i - 1].length - 1));
ok('every folded digit is a single digit', known.rows.slice(1).every((r) => r.every((d) => d >= 0 && d <= 9)));
ok('김민서 × 박다혜 is 34%', known.percent === 34, known.percent);

ok('the same pair always gives the same number',
  compatibility('김민서', '박다혜').percent === 34);
ok('order matters, the way the game has always worked',
  compatibility('박다혜', '김민서').percent !== null
  && compatibility('박다혜', '김민서').percent !== 34,
  compatibility('박다혜', '김민서').percent);
ok('uneven name lengths still play',
  compatibility('안나', '김민준').percent !== null,
  compatibility('안나', '김민준').percent);
ok('too little Hangul returns no number', compatibility('안', '나').percent === null);
ok('an empty side returns no number', compatibility('안나', '').percent === null);
ok('the percentage is two digits at most',
  [['안나', '민준'], ['수지', '지호'], ['김민서', '박다혜']]
    .every(([a, b]) => (compatibility(a, b).percent ?? 0) <= 99));

// --- reading a Latin name as Hangul ---------------------------------------

const roman: [string, string][] = [
  ['Anna', '안나'], ['Minjun', '민준'], ['Miller', '밀러'], ['Sarah', '사라'],
  ['Smith', '스미스'], ['Emily', '에밀리'], ['Chris', '크리스'], ['Marco', '마르코'],
  ['Elena', '엘레나'], ['Tom', '톰'], ['Mina', '미나'], ['Seojun', '서준'],
  ['Nguyen', '응우옌'], ['David', '데이비드'],
];
for (const [latin, expected] of roman) {
  ok(`${latin} reads as ${expected}`, romanToHangul(latin) === expected, romanToHangul(latin));
}

ok('diacritics fold away', romanToHangul('Nguyễn') === '응우옌', romanToHangul('Nguyễn'));
ok('a two-word name keeps its space', romanToHangul('Anna Miller') === '안나 밀러', romanToHangul('Anna Miller'));

ok('Hangul input is taken as written', hangulFor('민서')?.hangul === '민서');
ok('Hangul input is not marked converted', hangulFor('민서')?.converted === false);
ok('Latin input is marked converted', hangulFor('Anna')?.converted === true);
ok('blank input reads as nothing', hangulFor('   ') === null);
ok('a script we cannot read returns nothing', hangulFor('さくら') === null, hangulFor('さくら'));

// --- a romanized Korean surname is a lookup, not a sound ------------------
// hangulFor is the one entry point both the pair room and the impression room
// read typed text through, so this is where a two-word "Kim Hajun" has to stop
// being sounded out letter by letter (김 -> 킴) and start being looked up
// (김) — fixing it here fixes both rooms at once, and leaves romanToHangul
// itself, asserted above, untouched.

const surnamed: [string, string][] = [
  ['Kim Hajun', '김 하준'], ['Park Seoyeon', '박 서연'], ['Lee Jiho', '이 지호'],
  ['Choi Minseo', '최 민서'], ['Kang Seoyeon', '강 서연'], ['Jeong Doyun', '정 도윤'],
];
for (const [typed, expected] of surnamed) {
  ok(`${typed} reads as ${expected}`, hangulFor(typed)?.hangul === expected, hangulFor(typed)?.hangul);
}

ok('a single "Kim" is still a foreign given name, sounded out',
  hangulFor('Kim')?.hangul === '킴', hangulFor('Kim')?.hangul);

// The surname lookup only ever changes what the FIRST word of a two-word
// name becomes; it must never reach into romanToHangul's own foreign-name
// table above and change any of those results.
for (const [latin, expected] of roman) {
  ok(`${latin} still round-trips through hangulFor unchanged`,
    hangulFor(latin)?.hangul === expected, hangulFor(latin)?.hangul);
}

// converted still means "this was not typed as Hangul": a surname pulled from
// the lookup table is still Latin input that had to be turned into Hangul, so
// it is converted exactly like any other transliteration, not a new third
// state. hangulFor('민서') above already pins converted === false for real
// Hangul input; this pins the Latin side of the same boolean.
ok('a surname substitution is still marked converted',
  hangulFor('Kim Hajun')?.converted === true, hangulFor('Kim Hajun')?.converted);

// Everything the transliterator produces has to be countable, or the fold
// silently drops syllables and the percentage changes.
for (const [latin] of roman) {
  const hangul = romanToHangul(latin);
  ok(`${latin} is entirely countable`, strokesOf(hangul).length === [...hangul].length, hangul);
}

// --- the second room has to be fully translated ---------------------------

const keys = Object.keys(en.pair);
for (const [lang, bundle] of Object.entries({ ko, vi, th })) {
  for (const key of keys) {
    const value = (bundle.pair as Record<string, string>)[key];
    ok(`${lang}: pair.${key} exists`, typeof value === 'string' && value.length > 0);
  }
  for (const key of ['name', 'pair']) {
    ok(`${lang}: nav.${key} exists`, typeof (bundle.nav as Record<string, string>)[key] === 'string');
  }
}

// --- report ---------------------------------------------------------------

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log('all name-match checks passed');
