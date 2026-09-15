// Runnable check for the fortune room: the zodiac year boundary, the fortunes
// it feeds, and the lucky three.
// Run with: npm run check
import { SEOLLAL } from '../src/data/seollal';
import { ANIMALS, readBirthday } from '../src/utils/zodiac';
import { LUCKS, tell } from '../src/utils/fortune';
import { strokesOf } from '../src/utils/strokes';
import enF from '../src/data/locales/en/fortune.json';
import koF from '../src/data/locales/ko/fortune.json';
import viF from '../src/data/locales/vi/fortune.json';
import thF from '../src/data/locales/th/fortune.json';

let failures = 0;
function ok(label: string, condition: boolean, detail?: unknown) {
  if (condition) return;
  failures += 1;
  console.error(`  FAIL  ${label}${detail === undefined ? '' : ` — ${JSON.stringify(detail)}`}`);
}

// --- the Seollal table ----------------------------------------------------
// The zodiac year turns at the lunar new year, not 1 January. Getting this
// wrong tells roughly one visitor in eight the wrong animal — the single fact
// on the card they can check against any almanac.

const years = Object.keys(SEOLLAL).map(Number).sort((a, b) => a - b);
ok('one row per year from 1920 to 2044',
  years.length === 125 && years[0] === 1920 && years[124] === 2044, years.length);
ok('no gaps', years.every((y, i) => i === 0 || y === years[i - 1] + 1));
ok('every row is a real date in its own year',
  years.every((y) => {
    const d = new Date(`${SEOLLAL[y]}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === SEOLLAL[y]
      && d.getUTCFullYear() === y;
  }));
// the lunar new year cannot leave this window
ok('every Seollal falls between 21 January and 21 February',
  years.every((y) => {
    const [, m, d] = SEOLLAL[y].split('-').map(Number);
    return (m === 1 && d >= 21) || (m === 2 && d <= 21);
  }), years.filter((y) => {
    const [, m, d] = SEOLLAL[y].split('-').map(Number);
    return !((m === 1 && d >= 21) || (m === 2 && d <= 21));
  }));

// --- the boundary ---------------------------------------------------------

ok('1996-05-01 is a rat', readBirthday('1996-05-01')?.animal === 'rat',
  readBirthday('1996-05-01')?.animal);
ok('2000-01-01 is a rabbit, because Seollal 2000 had not come yet',
  readBirthday('2000-01-01')?.animal === 'rabbit', readBirthday('2000-01-01')?.animal);
ok('2000-02-05 is a dragon, the day the year turned',
  readBirthday('2000-02-05')?.animal === 'dragon', readBirthday('2000-02-05')?.animal);
ok('2000-02-04 is still a rabbit, the day before',
  readBirthday('2000-02-04')?.animal === 'rabbit', readBirthday('2000-02-04')?.animal);

// the day before Seollal belongs to the old animal, the day of to the new one
for (const y of [1925, 1960, 1988, 2005, 2023, 2040]) {
  const [, m, d] = SEOLLAL[y].split('-').map(Number);
  const dayOf = new Date(Date.UTC(y, m - 1, d));
  const dayBefore = new Date(dayOf.getTime() - 86400000);
  const iso = (x: Date) => x.toISOString().slice(0, 10);
  const before = readBirthday(iso(dayBefore))!;
  const on = readBirthday(iso(dayOf))!;
  ok(`${y}: the year turns on Seollal`,
    before.zodiacYear === y - 1 && on.zodiacYear === y, { before, on });
  ok(`${y}: and the animal turns with it`,
    ANIMALS.indexOf(on.animal) === (ANIMALS.indexOf(before.animal) + 1) % 12,
    { before: before.animal, on: on.animal });
}

// every animal must be reachable, or one of the twelve lines is unreadable
ok('all twelve animals are reachable',
  new Set(Array.from({ length: 12 }, (_, i) => readBirthday(`${1996 + i}-06-01`)!.animal)).size === 12);

// --- refusals -------------------------------------------------------------

ok('a year before the table is refused', readBirthday('1919-06-01') === null);
ok('a year after the table is refused', readBirthday('2045-06-01') === null);
ok('a malformed date is refused', readBirthday('not-a-date') === null);
ok('an impossible date is refused', readBirthday('2001-02-30') === null);
ok('an empty string is refused', readBirthday('') === null);

// --- seasons --------------------------------------------------------------

ok('April is spring', readBirthday('1996-04-10')?.season === 'spring');
ok('July is summer', readBirthday('1996-07-10')?.season === 'summer');
ok('October is autumn', readBirthday('1996-10-10')?.season === 'autumn');
ok('January is winter', readBirthday('1996-01-10')?.season === 'winter');

// --- the four fortunes ----------------------------------------------------
// Clamped to 15-90 on purpose. A card that tells someone their love life is nil
// has stopped being for fun, and the top of the scale should stay somewhere
// nobody quite reaches.

const NAMES = ['하준', '서연', '민서', '도윤', '지호', '철수'];
const DATES = ['1996-05-01', '2000-02-05', '1988-11-30', '2011-07-07', '1975-03-15'];

const all = NAMES.flatMap((n) => DATES.map((d) => tell(n, d)!));
ok('every name and date tells', all.every(Boolean), all.length);
for (const luck of LUCKS) {
  ok(`${luck} always lands in 15-90`,
    all.every((f) => Number.isInteger(f.scores[luck]) && f.scores[luck] >= 15 && f.scores[luck] <= 90),
    all.map((f) => f.scores[luck]).filter((x) => x < 15 || x > 90));
}
ok('the same name and birthday always tell the same',
  JSON.stringify(tell('하준', '1996-05-01')) === JSON.stringify(tell('하준', '1996-05-01')));
ok('the same birthday with a different name reads differently',
  JSON.stringify(tell('하준', '1996-05-01')?.scores) !== JSON.stringify(tell('철수', '1996-05-01')?.scores));
ok('the same name with a different birthday reads differently',
  JSON.stringify(tell('하준', '1996-05-01')?.scores) !== JSON.stringify(tell('하준', '1988-11-30')?.scores));
ok('a name with no Hangul tells nothing', tell('Anna', '1996-05-01') === null);
ok('a bad birthday tells nothing', tell('하준', '1919-01-01') === null);

// a meter that never moves is a meter nobody reads twice
for (const luck of LUCKS) {
  const buckets = new Set(all.map((f) => Math.floor(f.scores[luck] / 20)));
  ok(`${luck} uses more than one bucket across the sample`, buckets.size >= 3, [...buckets]);
}

// --- the lucky three ------------------------------------------------------

ok('the lucky number is a single digit',
  all.every((f) => Number.isInteger(f.number) && f.number >= 0 && f.number <= 9));
ok('the lucky number is the ones digit of the name\'s strokes',
  NAMES.every((n) => tell(n, '1996-05-01')!.number
    === strokesOf(n).reduce((sum, c) => sum + c.strokes, 0) % 10));
ok('the colour is one of the five',
  all.every((f) => ['blue', 'red', 'yellow', 'white', 'black'].includes(f.colour)));
ok('the twelve animals do not all share a colour',
  new Set(ANIMALS.map((_, i) => tell('하준', `${1996 + i}-06-01`)!.colour)).size === 5);
ok('the dish follows the season', all.every((f) => f.dish === f.reading.season));


// --- the room has to be fully written -------------------------------------
// vi and th may still carry the English string; they must not be missing.

const SHELL = ['eyebrow', 'title', 'sub', 'name_label', 'name_placeholder',
  'birthday_label', 'waiting', 'out_of_range', 'card_label', 'you_are',
  'lucky_colour', 'lucky_number', 'lucky_dish', 'disclaimer'];
const COLOURS = ['blue', 'red', 'yellow', 'white', 'black'];
const SEASONS = ['spring', 'summer', 'autumn', 'winter'];

for (const [lang, dict] of [['en', enF], ['ko', koF], ['vi', viF], ['th', thF]] as const) {
  const d = dict as Record<string, any>;
  for (const key of SHELL) {
    ok(`${lang}: fortune.${key}`, typeof d[key] === 'string' && d[key].length > 0);
  }
  for (const a of ANIMALS) {
    ok(`${lang}: fortune.animal.${a}.name`,
      typeof d.animal?.[a]?.name === 'string' && d.animal[a].name.length > 0);
    ok(`${lang}: fortune.animal.${a}.line`,
      typeof d.animal?.[a]?.line === 'string' && d.animal[a].line.length > 0);
  }
  for (const l of LUCKS) {
    ok(`${lang}: fortune.luck.${l}`, typeof d.luck?.[l] === 'string' && d.luck[l].length > 0);
  }
  for (const c of COLOURS) {
    ok(`${lang}: fortune.colour.${c}`, typeof d.colour?.[c] === 'string' && d.colour[c].length > 0);
  }
  for (const se of SEASONS) {
    ok(`${lang}: fortune.dish.${se}.name`,
      typeof d.dish?.[se]?.name === 'string' && d.dish[se].name.length > 0);
    ok(`${lang}: fortune.dish.${se}.line`,
      typeof d.dish?.[se]?.line === 'string' && d.dish[se].line.length > 0);
  }
  ok(`${lang}: you_are names the animal slot`, (d.you_are as string).includes('{animal}'), d.you_are);
}

// the twelve are the reason the room exists, so they must read as twelve
for (const [lang, dict] of [['en', enF], ['ko', koF]] as const) {
  const d = dict as Record<string, any>;
  ok(`${lang}: every animal line is distinct`,
    new Set(ANIMALS.map((a) => d.animal?.[a]?.line)).size === 12);
  ok(`${lang}: every dish is distinct`,
    new Set(SEASONS.map((se) => d.dish?.[se]?.name)).size === 4);
  ok(`${lang}: summer's dish mentions 복날`,
    (d.dish?.summer?.line as string).includes('복날'), d.dish?.summer?.line);
}

// --- report ---------------------------------------------------------------

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log('all fortune checks passed');
