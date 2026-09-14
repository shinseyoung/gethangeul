// Runnable check for the K-Drama casting test: the questions, the six roles the
// axis pairs name, and the twelve types they make with the temper.
// Run with: npm run check
import { QUESTIONS } from '../src/data/kdramaQuestions';
import { AXES, cast, roleKey, type Casting } from '../src/utils/kdramaCasting';

let failures = 0;
function ok(label: string, condition: boolean, detail?: unknown) {
  if (condition) return;
  failures += 1;
  console.error(`  FAIL  ${label}${detail === undefined ? '' : ` — ${JSON.stringify(detail)}`}`);
}

// --- the questions --------------------------------------------------------

ok('six questions', QUESTIONS.length === 6, QUESTIONS.length);
ok('question ids are unique', new Set(QUESTIONS.map((q) => q.id)).size === 6);
ok('every question has four options', QUESTIONS.every((q) => q.options.length === 4));
ok('option ids are unique within their question',
  QUESTIONS.every((q) => new Set(q.options.map((o) => o.id)).size === q.options.length));
ok('every option moves at least one axis',
  QUESTIONS.every((q) => q.options.every((o) => Object.values(o.weights).some((w) => (w ?? 0) > 0))));
ok('every option leans one way or the other',
  QUESTIONS.every((q) => q.options.every((o) => o.temper !== 0)));
// five answers of +/-1 always sum odd, so one even weight makes a tie impossible
ok('the temper can never tie',
  QUESTIONS.reduce((n, q) => n + (Math.abs(q.options[0].temper) % 2 === 0 ? 1 : 0), 0) === 1);

// --- every combination of answers -----------------------------------------
// 4^6 = 4096. Small enough to walk exhaustively, which is the only way to know
// the test does not funnel everyone into one answer.

const every: Casting[] = [];
const walk = (i: number, acc: number[]) => {
  if (i === QUESTIONS.length) {
    const c = cast(acc);
    if (c) every.push(c);
    return;
  }
  for (let o = 0; o < QUESTIONS[i].options.length; o += 1) walk(i + 1, [...acc, o]);
};
walk(0, []);

ok('every combination casts', every.length === 4096, every.length);
ok('every score is an integer 0–100',
  every.every((c) => AXES.every((a) => Number.isInteger(c.scores[a]) && c.scores[a] >= 0 && c.scores[a] <= 100)));
ok('the two top axes are distinct', every.every((c) => c.top[0] !== c.top[1]));

const roles = new Set(every.map((c) => c.role));
ok('all six roles are reachable', roles.size === 6, [...roles]);
const types = new Set(every.map((c) => c.typeKey));
ok('all twelve types are reachable', types.size === 12, [...types]);

// A test whose every road leads to 주인공 is not a test, and one whose rarest
// answer is a lottery ticket is not either. The bounds are tighter than the
// spec's 25% because the shipped weights reach 4.2%–13.7%: a cap at 25% would
// let a retune slide most of the way back to the funnel this replaced.
const tally: Record<string, number> = {};
for (const c of every) tally[c.typeKey] = (tally[c.typeKey] ?? 0) + 1;
const ranked = Object.entries(tally).sort((a, b) => b[1] - a[1]);
const share = (n: number) => n / every.length;
ok('no type takes more than a fifth of all answer sets',
  share(ranked[0][1]) <= 0.20, { type: ranked[0][0], share: +share(ranked[0][1]).toFixed(3) });
ok('even the rarest type is reachable by more than one answer set in fifty',
  share(ranked[ranked.length - 1][1]) >= 0.02,
  { type: ranked[ranked.length - 1][0], share: +share(ranked[ranked.length - 1][1]).toFixed(3) });

// the temper must not collapse: it doubles the six roles into twelve, and a
// two-thirds lean would make half the types near-unreachable
const direct = every.filter((c) => c.temper === 'direct').length;
ok('neither temper takes less than 40% of answer sets',
  share(direct) >= 0.4 && share(direct) <= 0.6, +share(direct).toFixed(3));

// --- determinism ----------------------------------------------------------

ok('an incomplete answer set does not cast', cast([0, 1, 2, null, 0, 1]) === null);
ok('a short answer set does not cast', cast([0, 1]) === null);
ok('the same answers always cast the same',
  JSON.stringify(cast([0, 1, 2, 3, 0, 1])) === JSON.stringify(cast([0, 1, 2, 3, 0, 1])));

// --- role keys ------------------------------------------------------------

ok('a role key is canonical whichever way round it is given',
  roleKey('warmth', 'romance') === roleKey('romance', 'warmth'));
ok('a role key uses AXES order', roleKey('warmth', 'romance') === 'romance_warmth',
  roleKey('warmth', 'romance'));
ok('there are six distinct pairs',
  new Set(AXES.flatMap((a) => AXES.filter((b) => b !== a).map((b) => roleKey(a, b)))).size === 6);

// --- report ---------------------------------------------------------------

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log('all kdrama checks passed');
