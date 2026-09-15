// Runnable check for the fortune room: the zodiac year boundary, the fortunes
// it feeds, and the lucky three.
// Run with: npm run check
import { SEOLLAL } from '../src/data/seollal';
import { ANIMALS, readBirthday } from '../src/utils/zodiac';

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

// --- report ---------------------------------------------------------------

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log('all fortune checks passed');
