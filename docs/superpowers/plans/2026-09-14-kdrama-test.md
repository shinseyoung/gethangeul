# K-Drama Casting Test Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A fourth room at `/{lang}/kdrama` that asks six situational questions and casts the visitor as one of twelve K-drama character types, with a Korean name to match.

**Architecture:** Six questions, each option carrying weights on four axes plus a 직진/신중 sign. The two highest axes name one of six roles — four axes make exactly six pairs, which is the `blendKey` shape `src/utils/nameTraits.ts` already uses and checks, so that pattern is reused rather than reinvented. The sign picks one of two tempers, giving twelve types. The name is drawn from the existing 114-name database by tag, never generated.

**Tech Stack:** React 19, TypeScript, Zustand, Tailwind 3, Vite 8. No test framework: checks are plain-TS scripts bundled by rolldown and run through `npm run check`.

**Spec:** [`docs/superpowers/specs/2026-09-14-kdrama-test-design.md`](../specs/2026-09-14-kdrama-test-design.md)

## Global Constraints

- **No randomness anywhere.** `Math.random`, `Date.now`, any hash-of-time are forbidden. The same answers must always produce the same casting, or a shared card cannot be reproduced. The name redraw is deterministic too — it walks a pool in order, it does not sample.
- **No new dependencies.** Plain TypeScript plus what `package.json` already has.
- **Verification is `npm run check` and `npm run build`.** There is no test runner. New assertions go into `scripts/*.check.ts` using the `ok(label, condition, detail?)` helper the four existing check scripts use, and the script is registered in the array in `scripts/check.mjs`.
- **Every check script ends the same way** — the `failures > 0 → process.exit(1)` block, then one `console.log('...checks passed')`.
- **Locale keys ship in all four languages** (`ko`, `en`, `vi`, `th`). Write `en` and `ko` properly; `vi` and `th` take the English string verbatim, the standing decision since the syllable dictionary — a translator gets a real file and the checks monitor coverage.
- **Canonical axis order is `romance, presence, warmth, mischief`.** Role keys sort into it, so `romance_warmth` is the only spelling and `warmth_romance` never appears.
- **Scores are integers 0–100**, rounded once at the end.
- **Do not touch** `src/utils/nameTraits.ts`, `src/data/syllableDatabase.ts`, `src/data/surnameDatabase.ts`, `src/data/nameDatabase.ts`, or `src/utils/romanToHangul.ts`. This room shares none of their logic on purpose — the name scorer reads what a name *sounds* like, this reads what a person *chose*.
- **House comment voice:** comments explain *why* a surprising decision was made, in prose. Never restate the code.

## A deliberate departure from the spec

The spec says the header-nav rework is "its own small spec and its own branch". It is **Task 1 here instead.** The room cannot ship without it — four tabs do not fit at 375px — and a separate spec, plan, branch and review cycle for one component is ceremony around an hour of work. It is still the first task and still independent: if the rest of this plan is abandoned, Task 1 stands on its own and leaves the site better.

## Measured facts this plan depends on

Taken from the live database, not assumed:

- `NAME_DATABASE` holds 114 names; **51 carry `'neutral'`** in `gender`.
- Vibes present among those 51: `calm` 28, `soft` 21, `mystic` 13, `bright` 13, `lovely` 11, `trendy` 9, `strong` 7. **`natural` appears on none of them** — do not use it in a tag set, it would contribute nothing.
- Personalities present: `considerate` 20, `prudent` 19, `sensitive` 16, `graceful` 14, `genuine` 14, `radiant` 11, `dependable` 10, `inquisitive` 10, `upright` 9, `whimsical` 7, `enterprising` 5, `resilient` 4.
- With the tag sets in Task 3, the six pools measure **lead 14, firstLove 32, spark 15, second 34, rival 13, bestie 28** — all far above the spec's floor of five.

## File Structure

| File | Responsibility |
|---|---|
| `src/components/layout/Header.tsx` *(modify)* | Nav becomes a menu instead of a tab row. |
| `src/data/kdramaQuestions.ts` *(new)* | Six questions, their options, and each option's axis weights and temper sign. Data only. |
| `src/utils/kdramaCasting.ts` *(new)* | Answers → axes → role, temper, type key. The engine. |
| `src/utils/kdramaName.ts` *(new)* | Type → name pool, and the deterministic walk that redraws. |
| `src/steps/KdramaScreen.tsx` *(new)* | The room: questions, then the card. |
| `src/store/useFlowStore.ts` *(modify)* | Fourth `Tool`, the six answers, the redraw index. |
| `src/App.tsx` *(modify)* | Routes the fourth room. |
| `src/data/locales/*/kdrama.json` *(new, ×4)* | Questions, options, role names, temper names, twelve type sentences. Its own file — `common.json` is already large and this is a self-contained room. |
| `src/hooks/useTranslation.ts` *(modify)* | Loads `kdrama` alongside `names`, `surnames`, `syllables`. |
| `scripts/kdrama.check.ts` *(new)* | Every assertion in the spec's check list. |
| `scripts/check.mjs` *(modify)* | Registers the new check script. |

---

### Task 1: The header nav becomes a menu

Three tabs is the current ceiling; this room is the fourth and the fortune reading would be the fifth. Replacing the row with a menu unblocks both. **This task ships on its own** — it changes no behaviour beyond how the three existing rooms are reached.

**Files:**
- Modify: `src/components/layout/Header.tsx`
- Modify: `src/data/locales/{en,ko,vi,th}/common.json` — one new key
- Test: `scripts/pair.check.ts` (it already asserts `nav.*` keys exist)

**Interfaces:**
- Consumes: `Tool`, `useFlowStore` from `src/store/useFlowStore.ts`; `useTranslation`.
- Produces: nothing new for later tasks. The nav reads `Tool` values, so Task 5 adding `'kdrama'` makes it appear automatically.

- [ ] **Step 1: Add the menu label key to all four locales**

In `src/data/locales/en/common.json`, inside the existing `nav` object, add:

```json
"menu": "Rooms"
```

`ko`: `"menu": "메뉴"`. For `vi` and `th`, use the English string `"Rooms"` verbatim — the standing decision; a translator gets a real key and the check monitors coverage.

- [ ] **Step 2: Add the failing assertion**

In `scripts/pair.check.ts`, find the existing loop that asserts `nav.name` and `nav.pair` exist per language. Extend its key list to include `menu`:

```ts
  for (const key of ['name', 'pair', 'impression', 'menu']) {
    ok(`${lang}: nav.${key} exists`, typeof (bundle.nav as Record<string, string>)[key] === 'string');
  }
```

- [ ] **Step 3: Run the check to verify it fails**

Run: `npm run check`
Expected: FAIL, four lines of `FAIL  <lang>: nav.menu exists` — one per language — until Step 1's keys are in place. If Step 1 is already done it passes; that is fine, the assertion is still the guard.

- [ ] **Step 4: Replace the tab row with a menu**

In `src/components/layout/Header.tsx`, replace the whole `<nav>` block — the one that maps `(['name', 'pair', 'impression'] as Tool[])` — with a button that opens a panel. Model it on the language picker directly below it in the same file: it already has the outside-click and Escape handling, the `aria-expanded` / `aria-haspopup` pair, and the translate-and-fade transition. Reuse that shape rather than inventing a second one.

```tsx
const TOOLS: Tool[] = ['name', 'pair', 'impression'];
```

The button shows `t('nav.menu')` and the current room's name; the panel lists every room as a row, the current one marked with `aria-current="page"` and the same `border-l-[3px] border-accent bg-accent/5` treatment the language rows use for the selected language. Selecting a room calls `setTool` and closes the panel.

The existing menu state in this file is a single `open` boolean shared with the language picker's `boxRef`. **Give the rooms menu its own `useState` and its own ref** — one boolean for two independent popovers means opening either opens both.

- [ ] **Step 5: Run the check and build**

Run: `npm run check && npm run build`
Expected: both PASS.

- [ ] **Step 6: Verify in the browser**

Start the dev server with the Browser pane (`preview_start` with `{name: "gethangeul"}`), then at `/en`:

1. The header shows one rooms button, not three tabs.
2. Opening it lists Name, Name match, Impression; the current one is marked.
3. Picking a room navigates and closes the panel.
4. Escape closes it; clicking outside closes it.
5. Opening the rooms menu does not open the language menu, and vice versa.
6. At 375px (`resize_window` preset `mobile`) the header fits on one row.
7. `read_console_messages` returns no errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/layout/Header.tsx src/data/locales/*/common.json scripts/pair.check.ts
git commit -m "Replace the header tab row with a rooms menu"
```

---

### Task 2: The questions and the casting engine

**Files:**
- Create: `src/data/kdramaQuestions.ts`
- Create: `src/utils/kdramaCasting.ts`
- Create: `scripts/kdrama.check.ts`
- Modify: `scripts/check.mjs:5`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `export type Axis = 'romance' | 'presence' | 'warmth' | 'mischief'`
  - `export const AXES = ['romance', 'presence', 'warmth', 'mischief'] as const`
  - `export type Scores = Record<Axis, number>`
  - `export type Role = 'lead' | 'firstLove' | 'spark' | 'second' | 'rival' | 'bestie'`
  - `export type Temper = 'direct' | 'careful'`
  - `export interface Casting { scores: Scores; top: [Axis, Axis]; role: Role; temper: Temper; typeKey: string }`
  - `export function cast(answers: (number | null)[]): Casting | null` — `null` until every question is answered
  - `export function roleKey(a: Axis, b: Axis): string` — the two axes in `AXES` order, joined with `_`
  - `export const QUESTIONS: Question[]` and `export interface Question { id: string; options: Option[] }`, `export interface Option { id: string; weights: Partial<Record<Axis, number>>; temper: number }`

- [ ] **Step 1: Write the questions data**

Create `src/data/kdramaQuestions.ts`.

**The `Axis` import must stay `import type`.** This file imports `Axis` from
`kdramaCasting.ts`, and `kdramaCasting.ts` imports `QUESTIONS` back from here to
compute its `CEILING` at module load. That is a cycle, and it is only harmless
because a type-only import is erased before it runs. Turn it into a value import
and `CEILING` reads an undefined `QUESTIONS` at load — a blank page with a null
error, not a build failure, so nothing will catch it for you. Six questions, four options each. The `id` fields are locale keys, not display text — copy lives in `kdrama.json` (Task 4).

```ts
import type { Axis } from '../utils/kdramaCasting';

export interface Option {
  id: string;
  /** axis points this answer adds; omitted axes add nothing */
  weights: Partial<Record<Axis, number>>;
  /** +1 leans 직진, -1 leans 신중; summed across answers, the sign picks the temper */
  temper: number;
}

export interface Question {
  id: string;
  options: Option[];
}

/**
 * Six situations, not four and not ten.
 *
 * Four cannot separate twelve outcomes; by ten the visitor is answering to
 * finish rather than to answer. The weights are a first tuning — the check
 * asserts what the outcomes must do, never what the numbers are, so they can be
 * moved freely.
 */
export const QUESTIONS: Question[] = [
  {
    id: 'arrival',
    options: [
      { id: 'centre',  weights: { presence: 9, romance: 3 },  temper: 1 },
      { id: 'edge',    weights: { warmth: 6, romance: 4 },    temper: -1 },
      { id: 'joke',    weights: { mischief: 9, warmth: 3 },   temper: 1 },
      { id: 'observe', weights: { presence: 4, mischief: 4 }, temper: -1 },
    ],
  },
  {
    id: 'jealousy',
    options: [
      { id: 'walkover', weights: { romance: 9, presence: 4 }, temper: 1 },
      { id: 'wait',     weights: { romance: 7, warmth: 5 },   temper: -1 },
      { id: 'tease',    weights: { mischief: 8, romance: 4 }, temper: 1 },
      { id: 'leave',    weights: { presence: 6, warmth: 2 },  temper: -1 },
    ],
  },
  {
    id: 'microphone',
    options: [
      { id: 'sing',    weights: { presence: 9, mischief: 4 }, temper: 1 },
      { id: 'dedicate', weights: { romance: 9, warmth: 4 },   temper: 1 },
      { id: 'pass',    weights: { warmth: 7, mischief: 2 },   temper: -1 },
      { id: 'comedy',  weights: { mischief: 9, presence: 3 }, temper: 1 },
    ],
  },
  {
    id: 'late',
    options: [
      { id: 'scold',  weights: { presence: 7, mischief: 3 },  temper: 1 },
      { id: 'order',  weights: { warmth: 8, mischief: 3 },    temper: -1 },
      { id: 'worry',  weights: { warmth: 9, romance: 2 },     temper: -1 },
      { id: 'prank',  weights: { mischief: 9, presence: 2 },  temper: 1 },
    ],
  },
  {
    id: 'umbrella',
    options: [
      { id: 'share',  weights: { romance: 9, warmth: 5 },     temper: 1 },
      { id: 'give',   weights: { warmth: 9, romance: 3 },     temper: -1 },
      { id: 'run',    weights: { mischief: 8, presence: 3 },  temper: 1 },
      { id: 'wait',   weights: { presence: 5, romance: 5 },   temper: -1 },
    ],
  },
  {
    id: 'finale',
    options: [
      { id: 'reunion', weights: { romance: 10, presence: 3 }, temper: 1 },
      { id: 'letter',  weights: { romance: 7, warmth: 6 },    temper: -1 },
      { id: 'toast',   weights: { warmth: 6, mischief: 6 },   temper: 1 },
      { id: 'stare',   weights: { presence: 9, mischief: 3 }, temper: -1 },
    ],
  },
];
```

- [ ] **Step 2: Write the failing check script**

Create `scripts/kdrama.check.ts`:

```ts
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
  QUESTIONS.every((q) => q.options.every((o) => o.temper === 1 || o.temper === -1)));

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

// A test whose every road leads to 주인공 is not a test.
const tally: Record<string, number> = {};
for (const c of every) tally[c.typeKey] = (tally[c.typeKey] ?? 0) + 1;
const worst = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];
ok('no type takes more than a quarter of all answer sets',
  worst[1] / every.length <= 0.25, { type: worst[0], share: +(worst[1] / every.length).toFixed(3) });

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
```

- [ ] **Step 3: Register the script**

In `scripts/check.mjs`, extend the array on line 5 with `'scripts/kdrama.check.ts'`.

- [ ] **Step 4: Run the check to verify it fails**

Run: `npm run check`
Expected: FAIL. rolldown cannot resolve `../src/utils/kdramaCasting`.

- [ ] **Step 5: Write the engine**

Create `src/utils/kdramaCasting.ts`:

```ts
import { QUESTIONS } from '../data/kdramaQuestions';

/**
 * Which part you would play, worked out from six situations.
 *
 * Four axes make exactly six pairs, and six is exactly the number of roles this
 * needs — so the two highest axes name the role, the same shape blendKey uses in
 * nameTraits.ts. That is structure, not coincidence, and reusing it means one
 * canonical-ordering rule to get right instead of two.
 *
 * The questions ask about situations rather than letting the visitor pick a role
 * outright. Picking 라이벌 and being told you are the rival is a form, not a
 * test, and gives nobody a reason to answer differently next time.
 */

export type Axis = 'romance' | 'presence' | 'warmth' | 'mischief';

/** Canonical order. Role keys sort into it, so `romance_warmth` is the only spelling. */
export const AXES = ['romance', 'presence', 'warmth', 'mischief'] as const;

export type Scores = Record<Axis, number>;
export type Role = 'lead' | 'firstLove' | 'spark' | 'second' | 'rival' | 'bestie';
export type Temper = 'direct' | 'careful';

export interface Casting {
  scores: Scores;
  /** the two highest axes, highest first; ties break in AXES order */
  top: [Axis, Axis];
  role: Role;
  temper: Temper;
  /** `<role>_<temper>`, the key the copy is written against */
  typeKey: string;
}

const ROLE_BY_PAIR: Record<string, Role> = {
  romance_presence: 'lead',
  romance_warmth: 'firstLove',
  romance_mischief: 'spark',
  presence_warmth: 'second',
  presence_mischief: 'rival',
  warmth_mischief: 'bestie',
};

/** The two axes in AXES order, so `warmth + romance` and `romance + warmth` are one key. */
export function roleKey(a: Axis, b: Axis): string {
  const [first, second] = [a, b].sort((x, y) => AXES.indexOf(x) - AXES.indexOf(y));
  return `${first}_${second}`;
}

/** The largest total any single axis could reach, used to put scores on 0–100. */
const CEILING: Scores = (() => {
  const max: Scores = { romance: 0, presence: 0, warmth: 0, mischief: 0 };
  for (const q of QUESTIONS) {
    for (const axis of AXES) {
      max[axis] += Math.max(...q.options.map((o) => o.weights[axis] ?? 0));
    }
  }
  return max;
})();

export function cast(answers: (number | null)[]): Casting | null {
  if (answers.length !== QUESTIONS.length) return null;
  if (answers.some((a) => a === null || a === undefined)) return null;

  const raw: Scores = { romance: 0, presence: 0, warmth: 0, mischief: 0 };
  let temperTotal = 0;

  for (let i = 0; i < QUESTIONS.length; i += 1) {
    const option = QUESTIONS[i].options[answers[i] as number];
    if (!option) return null;
    for (const axis of AXES) raw[axis] += option.weights[axis] ?? 0;
    temperTotal += option.temper;
  }

  const scores = Object.fromEntries(
    AXES.map((axis) => [axis, Math.round((raw[axis] / CEILING[axis]) * 100)]),
  ) as Scores;

  // ties break in AXES order, so the same answers never reorder between renders
  const ranked = [...AXES].sort((a, b) => scores[b] - scores[a]);
  const top: [Axis, Axis] = [ranked[0], ranked[1]];

  // an exact tie on the temper leans 신중 — the quieter reading is the safer
  // thing to tell someone about themselves
  const temper: Temper = temperTotal > 0 ? 'direct' : 'careful';
  const role = ROLE_BY_PAIR[roleKey(top[0], top[1])];

  return { scores, top, role, temper, typeKey: `${role}_${temper}` };
}
```

- [ ] **Step 6: Run the check to verify it passes**

Run: `npm run check`
Expected: PASS, with a fifth line `all kdrama checks passed`.

If `no type takes more than a quarter of all answer sets` fails, the weights are wrong, not the assertion — that assertion is the spec's promise that the test is a test. Adjust the weight tables in `src/data/kdramaQuestions.ts` and re-run. Do not weaken the assertion.

If `all twelve types are reachable` fails, some axis pair never wins; look at which pair is missing from the tally and raise that pair's axes on a few options.

- [ ] **Step 7: Build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/data/kdramaQuestions.ts src/utils/kdramaCasting.ts scripts/kdrama.check.ts scripts/check.mjs
git commit -m "Cast a visitor from six situations onto six roles and two tempers"
```

---

### Task 3: The name pool

**Files:**
- Create: `src/utils/kdramaName.ts`
- Modify: `scripts/kdrama.check.ts` (append before the report block)

**Interfaces:**
- Consumes: `Role` from `src/utils/kdramaCasting.ts`; `NAME_DATABASE` and `NameItem` from `src/data/nameDatabase.ts` / `src/types/name.ts`.
- Produces:
  - `export function namePool(role: Role): NameItem[]` — never empty, at least five entries
  - `export function nameFor(role: Role, seed: number, step: number): NameItem` — `seed` fixes the starting point, `step` is how many times the visitor has pressed redraw

- [ ] **Step 1: Write the failing assertions**

Insert into `scripts/kdrama.check.ts` before the `// --- report ---` block, and add to its imports:

```ts
import { nameFor, namePool } from '../src/utils/kdramaName';
import type { Role } from '../src/utils/kdramaCasting';
```

```ts
// --- the name that comes with the casting ---------------------------------
// The pool floor is five because the redraw has to have somewhere to go. These
// sizes were measured against the live database, not assumed: `natural` is on
// none of the 51 neutral names, so a tag set using it would quietly shrink.

const ROLES: Role[] = ['lead', 'firstLove', 'spark', 'second', 'rival', 'bestie'];

for (const role of ROLES) {
  const pool = namePool(role);
  ok(`${role} has at least five names`, pool.length >= 5, pool.length);
  ok(`${role} draws only gender-neutral names`,
    pool.every((n) => n.gender.includes('neutral')), role);
  ok(`${role} has no duplicate names`, new Set(pool.map((n) => n.id)).size === pool.length);
}

ok('the same role and seed always give the same name',
  nameFor('lead', 7, 0).id === nameFor('lead', 7, 0).id);
ok('a different seed can give a different name',
  ROLES.some((r) => new Set([0, 1, 2, 3, 4].map((s) => nameFor(r, s, 0).id)).size > 1));

// walking a pool of N must return all N before repeating any
for (const role of ROLES) {
  const pool = namePool(role);
  const walked = pool.map((_, step) => nameFor(role, 3, step).id);
  ok(`${role} redraws through its whole pool before repeating`,
    new Set(walked).size === pool.length, { pool: pool.length, distinct: new Set(walked).size });
  ok(`${role} wraps back to the start after a full lap`,
    nameFor(role, 3, pool.length).id === nameFor(role, 3, 0).id);
}
```

- [ ] **Step 2: Run the check to verify it fails**

Run: `npm run check`
Expected: FAIL. rolldown cannot resolve `../src/utils/kdramaName`.

- [ ] **Step 3: Write the name picker**

Create `src/utils/kdramaName.ts`. The tag sets below were measured against the live database and produce pools of 14, 32, 15, 34, 13 and 28 — use them verbatim:

```ts
import { NAME_DATABASE } from '../data/nameDatabase';
import type { NameItem } from '../types/name';
import type { Role } from './kdramaCasting';

/**
 * The name that comes with the casting.
 *
 * Drawn from the 114 names the site already has, never generated, and filtered
 * to the ones tagged gender-neutral. Gender is not asked: stopping a story
 * mid-scene for an admin question is what makes the name generator feel like a
 * form, and the database tags both masculine- and feminine-leaning names as
 * neutral often enough that the pools stay wide without the site guessing at
 * anyone.
 *
 * `natural` is deliberately absent from every set below — it is on none of the
 * 51 neutral names, so including it would look like it widened a pool while
 * doing nothing.
 */

const TAGS: Record<Role, { vibes: string[]; personalities: string[] }> = {
  lead:      { vibes: ['strong', 'trendy', 'bright'], personalities: ['enterprising', 'radiant', 'resilient'] },
  firstLove: { vibes: ['soft', 'lovely', 'calm'],     personalities: ['sensitive', 'graceful', 'genuine'] },
  spark:     { vibes: ['bright', 'lovely', 'trendy'], personalities: ['whimsical', 'radiant', 'sensitive'] },
  second:    { vibes: ['calm', 'soft', 'mystic'],     personalities: ['considerate', 'dependable', 'prudent'] },
  rival:     { vibes: ['strong', 'mystic', 'trendy'], personalities: ['enterprising', 'inquisitive', 'upright'] },
  bestie:    { vibes: ['bright', 'lovely', 'soft'],   personalities: ['considerate', 'whimsical', 'genuine'] },
};

const NEUTRAL = NAME_DATABASE.filter((n) => n.gender.includes('neutral'));

/** Built once per role at module load; the pools never change. */
const POOLS: Record<Role, NameItem[]> = Object.fromEntries(
  (Object.keys(TAGS) as Role[]).map((role) => {
    const tag = TAGS[role];
    return [
      role,
      NEUTRAL.filter(
        (n) => tag.vibes.some((v) => n.vibes.includes(v))
          && tag.personalities.some((p) => n.personalities.includes(p)),
      ),
    ];
  }),
) as Record<Role, NameItem[]>;

export function namePool(role: Role): NameItem[] {
  return POOLS[role];
}

/**
 * One name from the role's pool.
 *
 * A walk, not a draw: `seed` fixes where in the pool the visitor starts and
 * `step` counts their presses of "다른 이름으로", so every press lands on a name
 * they have not seen and the whole pool comes round before anything repeats. A
 * random pick would hand back the same name twice and read as broken.
 */
export function nameFor(role: Role, seed: number, step: number): NameItem {
  const pool = POOLS[role];
  const i = (((seed + step) % pool.length) + pool.length) % pool.length;
  return pool[i];
}
```

- [ ] **Step 4: Run the check to verify it passes**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/utils/kdramaName.ts scripts/kdrama.check.ts
git commit -m "Draw the casting's name from the existing database by tag"
```

---

### Task 4: The copy

**Files:**
- Create: `src/data/locales/{en,ko,vi,th}/kdrama.json`
- Modify: `src/hooks/useTranslation.ts`
- Modify: `scripts/kdrama.check.ts` (append before the report block)

**Interfaces:**
- Consumes: `QUESTIONS` from `src/data/kdramaQuestions.ts`; `roleKey`, `AXES` from `src/utils/kdramaCasting.ts`.
- Produces: `t('kdrama.…')` resolves for every key below.

- [ ] **Step 1: Write the failing assertions**

Insert into `scripts/kdrama.check.ts` before the report block, extending the imports:

```ts
import enK from '../src/data/locales/en/kdrama.json';
import koK from '../src/data/locales/ko/kdrama.json';
import viK from '../src/data/locales/vi/kdrama.json';
import thK from '../src/data/locales/th/kdrama.json';
```

```ts
// --- the room has to be fully translated ----------------------------------
// vi and th may still carry the English string; they must not be missing.

const SHELL = ['eyebrow', 'title', 'sub', 'start', 'next', 'prev', 'again', 'reroll', 'card_label', 'disclaimer'];
const TEMPERS = ['direct', 'careful'];
const TYPE_KEYS = Object.values({
  romance_presence: 'lead', romance_warmth: 'firstLove', romance_mischief: 'spark',
  presence_warmth: 'second', presence_mischief: 'rival', warmth_mischief: 'bestie',
}).flatMap((role) => TEMPERS.map((t) => `${role}_${t}`));

ok('twelve type keys', TYPE_KEYS.length === 12, TYPE_KEYS.length);

for (const [lang, dict] of [['en', enK], ['ko', koK], ['vi', viK], ['th', thK]] as const) {
  const d = dict as Record<string, any>;
  for (const key of SHELL) {
    ok(`${lang}: kdrama.${key}`, typeof d[key] === 'string' && d[key].length > 0);
  }
  for (const axis of AXES) {
    ok(`${lang}: kdrama.axis.${axis}`, typeof d.axis?.[axis] === 'string' && d.axis[axis].length > 0);
  }
  for (const role of ['lead', 'firstLove', 'spark', 'second', 'rival', 'bestie']) {
    ok(`${lang}: kdrama.role.${role}`, typeof d.role?.[role] === 'string' && d.role[role].length > 0);
  }
  for (const temper of TEMPERS) {
    ok(`${lang}: kdrama.temper.${temper}`, typeof d.temper?.[temper] === 'string' && d.temper[temper].length > 0);
  }
  for (const key of TYPE_KEYS) {
    ok(`${lang}: kdrama.type.${key}`, typeof d.type?.[key] === 'string' && d.type[key].length > 0);
  }
  for (const q of QUESTIONS) {
    ok(`${lang}: kdrama.q.${q.id}.title`, typeof d.q?.[q.id]?.title === 'string' && d.q[q.id].title.length > 0);
    for (const o of q.options) {
      ok(`${lang}: kdrama.q.${q.id}.options.${o.id}`,
        typeof d.q?.[q.id]?.options?.[o.id] === 'string' && d.q[q.id].options[o.id].length > 0);
    }
  }
  ok(`${lang}: no orphan question keys`,
    Object.keys(d.q ?? {}).every((k) => QUESTIONS.some((q) => q.id === k)),
    Object.keys(d.q ?? {}).filter((k) => !QUESTIONS.some((q) => q.id === k)));
}
```

- [ ] **Step 2: Run the check to verify it fails**

Run: `npm run check`
Expected: FAIL. rolldown cannot resolve `../src/data/locales/en/kdrama.json`.

- [ ] **Step 3: Write the English copy**

Create `src/data/locales/en/kdrama.json`. Every key the assertions above enumerate must be present — that is the full list, so nothing here is open-ended.

Voice: the site's — plain, specific, a little dry, never breathless. The type sentences are the payoff; each of the twelve must read as a different person, not the same person with an adjective swapped. Six roles × two tempers means the pairs are close by construction, so lean on what actually separates 직진 from 신중 in that role.

Structure, with the shell and two type sentences as the pattern to follow:

```json
{
  "eyebrow": "Six questions",
  "title": "Which part would you play?",
  "sub": "Six situations, and we'll tell you where you'd land in the cast. Not the name you'd be given — the person you'd be.",
  "start": "Start",
  "next": "Next",
  "prev": "Back",
  "again": "Answer again",
  "reroll": "Another name",
  "card_label": "YOUR CASTING",
  "disclaimer": "For fun. Six questions cannot know you, and the name at the bottom is one we liked for the part — not a reading of anything.",
  "axis": {
    "romance": "Romance",
    "presence": "Presence",
    "warmth": "Warmth",
    "mischief": "Mischief"
  },
  "role": {
    "lead": "The Lead",
    "firstLove": "The First Love",
    "spark": "The Almost",
    "second": "The Second Lead",
    "rival": "The Rival",
    "bestie": "The Best Friend"
  },
  "temper": { "direct": "Headlong", "careful": "Measured" },
  "type": {
    "lead_direct": "The camera finds you because you walked into the shot like it was yours. You say the line in episode two that anyone else would save for the finale.",
    "lead_careful": "You carry the story without ever raising your voice, and the audience spends twelve episodes waiting for the moment you finally do."
  }
}
```

Write all twelve `type` entries. The remaining ten keys are `firstLove_direct`, `firstLove_careful`, `spark_direct`, `spark_careful`, `second_direct`, `second_careful`, `rival_direct`, `rival_careful`, `bestie_direct`, `bestie_careful`.

Write all six questions under `q`, keyed by the `id` values in `src/data/kdramaQuestions.ts` — `arrival`, `jealousy`, `microphone`, `late`, `umbrella`, `finale` — each with a `title` and an `options` object keyed by that question's option ids. The first, as the pattern:

```json
"q": {
  "arrival": {
    "title": "You walk into a room where you know one person.",
    "options": {
      "centre": "Head straight for the middle of it.",
      "edge": "Find the one person you know.",
      "joke": "Say something daft before anyone can speak first.",
      "observe": "Take a seat and watch for a minute."
    }
  }
}
```

- [ ] **Step 4: Write the Korean copy**

Create `src/data/locales/ko/kdrama.json`, same keys. Written for a Korean reader — shorter, more direct. **Do not translate the English word for word**; say the thing a Korean would say about a K-drama character, using the register drama recaps actually use.

```json
{
  "eyebrow": "여섯 가지 질문",
  "title": "당신은 어떤 배역일까요?",
  "sub": "상황 여섯 개면 배역이 나옵니다. 이름이 아니라, 당신이 어떤 사람일지요.",
  "start": "시작하기",
  "next": "다음",
  "prev": "이전",
  "again": "다시 하기",
  "reroll": "다른 이름으로",
  "card_label": "당신의 배역",
  "disclaimer": "재미로 보는 겁니다. 질문 여섯 개가 사람을 알 리 없고, 아래 이름도 그 배역에 어울려서 고른 것뿐입니다.",
  "role": {
    "lead": "주인공",
    "firstLove": "첫사랑",
    "spark": "썸남썸녀",
    "second": "서브 주인공",
    "rival": "라이벌",
    "bestie": "절친"
  },
  "temper": { "direct": "직진", "careful": "신중" }
}
```

Write the `axis`, `type` and `q` blocks too, with the same keys as English.

- [ ] **Step 5: Seed Vietnamese and Thai**

Create `src/data/locales/vi/kdrama.json` and `.../th/kdrama.json` as **exact copies of the English file**. The standing decision since the syllable dictionary: `useTranslation` would fall back to English anyway, but a real key means the check tells the truth about coverage and a translator has a file to work in. Flag in the report that vi/th is placeholder.

- [ ] **Step 6: Wire it into `useTranslation`**

In `src/hooks/useTranslation.ts`, add four imports beside the syllable ones, extend `TranslationData` with `kdrama: typeof koKdrama`, and add `kdrama: <lang>Kdrama` to all four bundles. Keep the existing `as unknown as TranslationData` casts on en/vi/th — only `ko` is the reference shape.

- [ ] **Step 7: Run the check and build**

Run: `npm run check && npm run build`
Expected: both PASS.

- [ ] **Step 8: Commit**

```bash
git add src/data/locales/*/kdrama.json src/hooks/useTranslation.ts scripts/kdrama.check.ts
git commit -m "Write the casting test's copy"
```

---

### Task 5: The room

**Files:**
- Create: `src/steps/KdramaScreen.tsx`
- Modify: `src/store/useFlowStore.ts`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `cast`, `AXES`, `type Casting` from `src/utils/kdramaCasting.ts`; `QUESTIONS` from `src/data/kdramaQuestions.ts`; `nameFor`, `namePool` from `src/utils/kdramaName.ts`; `TraitMeter` from `src/components/TraitMeter.tsx` (it takes `score` and `label`); `useImageShare`; `sentences` from `src/utils/sentences.ts`; `OpticalText`.
- Produces: `Tool` gains `'kdrama'`; `useFlowStore` gains `kdramaAnswers: (number | null)[]`, `setKdramaAnswer(i, option)`, `kdramaStep: number`, `setKdramaStep(n)`, `kdramaReroll: number`, `bumpKdramaReroll()`, `resetKdrama()`.

- [ ] **Step 1: Open the store to the fourth room**

In `src/store/useFlowStore.ts`:

```ts
export type Tool = 'name' | 'pair' | 'impression' | 'kdrama';

const PATH_TOOL = /^\/(?:ko|en|vi|th)\/(pair|impression|kdrama)(?=\/|$)/;
```

Add to the `FlowState` interface and the store body:

```ts
  /** one option index per question, null until answered */
  kdramaAnswers: (number | null)[];
  /** 0 is the intro, 1..6 are the questions, 7 is the card */
  kdramaStep: number;
  /** how many times "다른 이름으로" has been pressed */
  kdramaReroll: number;
  setKdramaAnswer: (index: number, option: number) => void;
  setKdramaStep: (step: number) => void;
  bumpKdramaReroll: () => void;
  resetKdrama: () => void;
```

```ts
  kdramaAnswers: Array(6).fill(null),
  kdramaStep: 0,
  kdramaReroll: 0,
  setKdramaAnswer: (index, option) => set((s) => {
    const next = [...s.kdramaAnswers];
    next[index] = option;
    return { kdramaAnswers: next };
  }),
  setKdramaStep: (kdramaStep) => set({ kdramaStep }),
  bumpKdramaReroll: () => set((s) => ({ kdramaReroll: s.kdramaReroll + 1 })),
  resetKdrama: () => set({ kdramaAnswers: Array(6).fill(null), kdramaStep: 0, kdramaReroll: 0 }),
```

- [ ] **Step 2: Write the room**

Create `src/steps/KdramaScreen.tsx`. Follow `StepOptions.tsx` for the question screens — the same `min-h-[84px]` option button, the same `border-accent bg-accent/[0.05]` selected state with identical border width in both states so nothing resizes, the same `ProgressRail`-style position indicator — and `ImpressionScreen.tsx` for the card: `MountainWash`, the inner rule, `TraitMeter` rows, `GETHANGEUL.COM`, `useImageShare`.

The card, reading down: the role and temper as the headline (`{temper} {role}` — "신중한 서브 주인공"), the name in 붓 type below it with its romanisation, four meters, the type sentence split by `sentences()` so each lands on its own line, then the eyebrow.

Below the card: **다른 이름으로**, which calls `bumpKdramaReroll()`, and **다시 하기**, which calls `resetKdrama()`. The name comes from `nameFor(casting.role, seed, kdramaReroll)`, where `seed` is derived from the answers — sum the chosen option indices, which is deterministic and needs no hash.

Wrap short single-string labels in `OpticalText` the way `ImpressionScreen` does for its axis rows; Hangul ink rides about 2px above its line box and the site corrects for it rather than living with it.

The card's structure, which is the part that is not already in another file:

```tsx
{/* this is what gets screenshotted, so no ad and no button goes inside it */}
<div
  ref={captureRef}
  className="relative mt-7 overflow-hidden rounded-3xl border border-rule-strong bg-paper-hi px-6 pb-8 pt-9 shadow-[0_26px_56px_-36px_rgba(23,24,26,0.4)] md:px-8"
>
  <MountainWash season="summer" className="absolute inset-x-0 bottom-0 h-[170px]" />
  <div className="pointer-events-none absolute inset-2 rounded-[20px] border border-rule" />

  <div className="relative flex flex-col items-center">
    <span className="eyebrow text-[8.5px] tracking-[0.26em] text-ink-4">{t('kdrama.card_label')}</span>

    <OpticalText className="mt-3 block font-disp text-[27px] leading-none text-ink md:text-[31px]">
      {`${t(`kdrama.temper.${casting.temper}`)} ${t(`kdrama.role.${casting.role}`)}`}
    </OpticalText>

    <span className="mt-5 font-brush text-[40px] leading-none text-ink">{name.hangul}</span>
    <span className="eyebrow mt-2 text-[8.5px] tracking-[0.24em] text-ink-4">{name.id}</span>

    <span className="my-6 block h-px w-11 bg-accent" />

    <div className="flex w-full max-w-[280px] flex-col gap-3.5">
      {AXES.map((axis) => (
        <span key={axis} className="flex items-center gap-3">
          <OpticalText className="block flex-1 font-disp text-[15px] leading-none text-ink-2">
            {String(t(`kdrama.axis.${axis}`))}
          </OpticalText>
          <TraitMeter score={casting.scores[axis]} label={String(t(`kdrama.axis.${axis}`))} />
        </span>
      ))}
    </div>

    <span className="my-6 block h-px w-11 bg-rule-strong" />

    {/* one block per sentence, so a break never lands mid-clause */}
    <span className="flex max-w-[320px] flex-col text-center text-[13px] leading-relaxed text-ink-2">
      {sentences(String(t(`kdrama.type.${casting.typeKey}`))).map((line) => (
        <span key={line} className="block">{line}</span>
      ))}
    </span>

    <span className="eyebrow mt-7 text-[9px] tracking-[0.28em] text-ink-4">GETHANGEUL.COM</span>
  </div>
</div>
```

`name.id` is the database's romanised id — it is the romanisation the rest of the site shows, so no new field is needed.

- [ ] **Step 3: Route it**

In `src/App.tsx`, import `KdramaScreen` and add `{tool === 'kdrama' && <KdramaScreen />}` beside the other two room conditions.

In `src/components/layout/Header.tsx`, add `'kdrama'` to the `TOOLS` array Task 1 created.

- [ ] **Step 4: Run the check and build**

Run: `npm run check && npm run build`
Expected: both PASS.

- [ ] **Step 5: Verify in the browser**

With the dev server open, at `/en/kdrama`:

1. The intro shows, and Start moves to question one.
2. Answering advances; Back returns and the previous answer is still selected.
3. Next is disabled until the current question is answered.
4. After six answers the card renders with a role, a temper, a name, four meters and a sentence.
5. **다른 이름으로** changes the name and leaves the role, temper and meters untouched — check the meters' dot counts before and after.
6. **다시 하기** returns to the intro with every answer cleared.
7. Answering all six differently produces a different role.
8. Save Image produces a PNG with the whole card in it.
9. The rooms menu lists four rooms and the header still fits at 375px.
10. `read_console_messages` returns no errors.

- [ ] **Step 6: Commit**

```bash
git add src/steps/KdramaScreen.tsx src/store/useFlowStore.ts src/App.tsx src/components/layout/Header.tsx
git commit -m "Add the K-Drama casting room"
```

---

## Deliberately not built

- **A shareable permalink encoding the answers.** The image share already covers sharing; a URL encoding is its own set of edge cases. Add it when someone asks twice.
- **Any use of the five-axis name scorer.** That reads what a name sounds like; this reads what a person chose. Same card, same meter, different engine.
- **Randomness.** Same answers, same casting. The name redraw is the one deliberate exception and it is a walk, not a draw.
- **A per-question progress bar with labels.** The existing `ProgressRail` is built for the four-question name flow; six unlabelled positions are enough here.
