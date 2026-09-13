// Runnable check for the surname layer: reading a family name's sound, the
// forty-name list's coverage of it, and a stable fallback when it fails.
// Run with: npm run check
import { SURNAME_DATABASE } from '../src/data/surnameDatabase';
import { choseongOf, readOnset } from '../src/utils/soundBridge';
import { defaultSurname, familyToken, suggestSurnames } from '../src/utils/surnameMatcher';
import en from '../src/data/locales/en/surnames.json';
import ko from '../src/data/locales/ko/surnames.json';
import vi from '../src/data/locales/vi/surnames.json';
import th from '../src/data/locales/th/surnames.json';

let failures = 0;
function ok(label: string, condition: boolean, detail?: unknown) {
  if (condition) return;
  failures += 1;
  console.error(`  FAIL  ${label}${detail === undefined ? '' : ` — ${JSON.stringify(detail)}`}`);
}

// --- the list itself ------------------------------------------------------

ok('forty family names', SURNAME_DATABASE.length === 40, SURNAME_DATABASE.length);
ok('ids are unique', new Set(SURNAME_DATABASE.map((s) => s.id)).size === 40);
ok('hangul are unique', new Set(SURNAME_DATABASE.map((s) => s.hangul)).size === 40);
ok('every entry is a single syllable', SURNAME_DATABASE.every((s) => s.hangul.length === 1));
ok('every share is a positive percentage', SURNAME_DATABASE.every((s) => s.share > 0 && s.share < 100));

// --- sound coverage, which is the whole reason the list is forty long ------

const ids = SURNAME_DATABASE.map((s) => s.id);
for (const bundle of [['en', en], ['ko', ko], ['vi', vi], ['th', th]] as const) {
  const [lang, dict] = bundle;
  for (const id of ids) {
    const entry = (dict as Record<string, { meaning?: string }>)[id];
    ok(`${lang}: ${id} has a meaning`, typeof entry?.meaning === 'string' && entry.meaning.length > 0);
  }
}

// Every Latin letter has to land on a family name, directly or through the
// alternates readOnset offers. ㅋ has no Korean surname at all; it survives
// only because readOnset hands ㄱ back as its alternate, so this is the check
// that would catch that alternate being dropped.
const LETTERS = 'abcdefghijklmnopqrstuvwxyz';
for (const letter of LETTERS) {
  const read = readOnset(letter + 'a');
  const initials = read.ok ? [read.cho, ...read.alts] : [];
  const hit = SURNAME_DATABASE.some((s) => {
    const cho = choseongOf(s.hangul);
    return cho !== null && initials.includes(cho);
  });
  ok(`"${letter}" reaches a family name`, hit, initials);
}

// --- reading the family name out of what was typed ------------------------

ok('the last word is the family name', familyToken('Sarah Miller', 'en') === 'Miller');
ok('a middle name does not confuse it', familyToken('Anna Maria Rossi', 'en') === 'Rossi');
ok('Vietnamese puts the family name first', familyToken('Nguyễn Văn An', 'vi') === 'Nguyễn');
ok('one word means no family name', familyToken('Sarah', 'en') === null);
ok('blank means no family name', familyToken('   ', 'en') === null);

const roman = (name: string, lang = 'en') => suggestSurnames(name, lang).matches.map((s) => s.roman);

ok('Miller finds the ㅁ names', roman('Sarah Miller').length > 0, roman('Sarah Miller'));
ok('Nguyễn finds the ㄴ names', roman('Nguyễn Văn An', 'vi').length > 0, roman('Nguyễn Văn An', 'vi'));
ok('Taylor finds the ㅌ name', roman('Amy Taylor').includes('Tae'), roman('Amy Taylor'));
ok('Perez reaches ㅍ or ㅂ', roman('Ana Perez').length > 0, roman('Ana Perez'));
ok('Davis reaches ㄷ', roman('Joe Davis').includes('Do'), roman('Joe Davis'));
ok('Lopez reaches ㄹ', roman('Ana Lopez').includes('Ryu'), roman('Ana Lopez'));
ok('suggestions are capped at five', roman('Anna Smith').length <= 5, roman('Anna Smith'));
ok('suggestions come commonest first',
  suggestSurnames('Anna Smith', 'en').matches.every((s, i, a) => i === 0 || s.share <= a[i - 1].share));

ok('a single word is not tried', suggestSurnames('Sarah', 'en').tried === false);
ok('an unreadable script is tried and empty', suggestSurnames('Somchai ไทย', 'en').matches.length === 0);

// --- the opening guess ----------------------------------------------------

const seed = 'calm|prudent|winter';
ok('the same visit always opens on the same surname',
  defaultSurname('Sarah', 'en', seed).id === defaultSurname('Sarah', 'en', seed).id);
ok('a sound match wins over the weighted draw',
  defaultSurname('Sarah Miller', 'en', seed).id === suggestSurnames('Sarah Miller', 'en').matches[0].id);
ok('a blank name still resolves', SURNAME_DATABASE.includes(defaultSurname('', 'en', '')));

// The weighted draw has to actually spread, or every anonymous visitor is a Kim.
const drawn = new Set(
  Array.from({ length: 200 }, (_, i) => defaultSurname('', 'en', `seed-${i}`).id),
);
ok('the weighted draw reaches many houses', drawn.size >= 10, drawn.size);

// --- report ---------------------------------------------------------------

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log('all surname checks passed');
