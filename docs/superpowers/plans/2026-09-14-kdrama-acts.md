# K-Drama Four Acts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the K-Drama room's six unrelated questions into four acts of three scenes told in 기승전결, where each act opens on a line describing what the visitor's own choices have made of the story.

**Architecture:** Twelve scenes grouped into four acts. The story does not branch — the state between acts does: each act's three answers have a dominant axis, and that one value picks the next act's opening line. Twelve recap lines instead of 4¹² paths. Everything downstream — the four axes, six roles, two tempers, twelve types, the card, the name draw — is unchanged.

**Tech Stack:** React 19, TypeScript, Zustand, Tailwind 3, Vite 8. No test framework: checks are plain-TS scripts bundled by rolldown and run through `npm run check`.

**Spec:** [`docs/superpowers/specs/2026-09-14-kdrama-acts-design.md`](../specs/2026-09-14-kdrama-acts-design.md)

## Global Constraints

- **No randomness anywhere.** `Math.random`, `Date.now`, any hash-of-time are forbidden. The same answers must always produce the same casting.
- **No new dependencies.**
- **Verification is `npm run check` and `npm run build`**, both of which must pass before any commit. Assertions use the `ok(label, condition, detail?)` helper in `scripts/kdrama.check.ts`, inserted before its closing `failures > 0` block, extending the existing imports rather than duplicating them.
- **Canonical axis order is `romance, presence, warmth, mischief`.** Every tie — the role ranking, `roleKey`, and the new act-dominant axis — breaks in that order. One rule for the whole room.
- **Locale keys ship in all four languages.** Write `en` and `ko` properly; `vi` and `th` take the English string verbatim, the standing decision since the syllable dictionary.
- **Do not touch** `src/utils/nameTraits.ts`, `src/utils/kdramaName.ts`, the twelve type sentences, the six role names, the two tempers or the four axis names. The result model has not changed; only the front of the room has.
- **House comment voice:** comments explain *why* a surprising decision was made, in prose. Never restate the code.

## Measured facts this plan depends on

I simulated the design before writing this, over a 16,828-path stride sample of the full 4¹² space. Two arrangements were tried:

| arrangement | max type | min type | ties | tempers |
|---|---|---|---|---|
| six pairs dealt across each act, balanced per act | **26.0%** | **0.5%** | 0 | 50/50 |
| **one primary axis per option within each scene** | **9.4%** | **7.0%** | 0 | 50/50 |

The first is what "balance the six pairs" naively produces, and it fails both bounds — dealing the pairs in order gave one scene three romance-primary options out of four, so that scene almost always fed romance. **Balance has to hold inside a scene, not only across the set.** The second arrangement is the one specified below; 9.4%–7.0% against an ideal of 8.33% is as even as twelve types get.

## The option rule

Every scene offers **one option per axis**. The secondary rotates by scene index so that across twelve scenes each ordered (primary, secondary) combination lands exactly four times, which makes each of the six unordered pairs land exactly eight times.

With `AXES = ['romance', 'presence', 'warmth', 'mischief']` and `s` the scene's index 0–11:

```
option i of scene s:  primary = AXES[i]
                      secondary = AXES[(i + 1 + (s % 3)) % 4]
                      primary weight 10, secondary weight 6
```

Verified: 12 ordered combos × 4 each; 6 pairs × 8 each; exactly one primary per axis per scene; three per axis per act, so every axis is reachable as an act's dominant.

**Temper:** `+1` when `(s + i)` is even, `−1` when odd — six of each per act. The last scene of 결 (`finale`) carries `±2` instead. Eleven answers of ±1 always sum odd, so one even weight means the total can never be nought, and nought was the tie that made 신중 two thirds of all readings in the six-question version.

The weights are written out explicitly in the data file rather than computed by that formula at runtime: a person retuning one option should be able to see and edit its numbers, and the check guards the invariants either way.

## The twelve scenes

| Act | id | Korean | Scenes (in order) |
|---|---|---|---|
| 1 | `gi` | 기 | `arrival`, `notice`, `rumour` |
| 2 | `seung` | 승 | `microphone`, `jealousy`, `umbrella` |
| 3 | `jeon` | 전 | `late`, `secret`, `crossroads` |
| 4 | `gyeol` | 결 | `apology`, `station`, `finale` |

The six that exist today — `arrival`, `jealousy`, `microphone`, `late`, `umbrella`, `finale` — keep their ids, their titles and their option ids, and are redistributed into the acts above. Their **weights are reassigned** by the rule, because their scene indices have changed. Six new scenes join them; their option ids are:

```
notice:     meet, avoid, quip, study
rumour:     deny, laugh, shrug, trace
secret:     tell, keep, hint, deflect
crossroads: chase, stay, gamble, weigh
apology:    first, wait, gift, joke
station:    run, call, write, watch
```

Existing option ids stay as they are: `arrival` keeps centre/edge/joke/observe, `jealousy` walkover/wait/tease/leave, `microphone` sing/dedicate/pass/comedy, `late` scold/order/worry/prank, `umbrella` share/give/run/shelter (renamed from `wait`, which now collides with `apology`'s — ids only need to be unique within their scene, but two different `wait`s in one room is a trap for whoever writes the copy), `finale` reunion/letter/toast/stare.

## File Structure

| File | Responsibility |
|---|---|
| `src/data/kdramaQuestions.ts` *(modify)* | Twelve scenes with act ids and rule-assigned weights. |
| `src/utils/kdramaCasting.ts` *(modify)* | Gains `ACTS`, `dominantAxis`, `recapKey`. `cast` is unchanged apart from reading twelve answers. |
| `src/steps/KdramaScreen.tsx` *(modify)* | Act cards, two-row progress rail, twelve scenes. |
| `src/store/useFlowStore.ts` *(modify)* | `kdramaAnswers` grows to twelve slots. |
| `src/data/locales/*/kdrama.json` *(modify, ×4)* | Premise, four act names, twelve recap lines, six new scenes. |
| `scripts/kdrama.check.ts` *(modify)* | Act structure, the option rule, the stride sample. |

---

### Task 1: Twelve scenes and the act model

**Files:**
- Modify: `src/data/kdramaQuestions.ts`
- Modify: `src/utils/kdramaCasting.ts`
- Modify: `src/store/useFlowStore.ts`
- Modify: `scripts/kdrama.check.ts`

**Interfaces:**
- Consumes: `Axis`, `AXES` from `src/utils/kdramaCasting.ts` (unchanged).
- Produces:
  - `Question` gains `act: ActId`
  - `export type ActId = 'gi' | 'seung' | 'jeon' | 'gyeol'`
  - `export const ACTS: readonly ActId[]` — in 기승전결 order
  - `export function actOf(sceneIndex: number): ActId`
  - `export function dominantAxis(answers: (number | null)[], act: ActId): Axis | null` — null until that act's three scenes are all answered
  - `export function recapKey(act: ActId, answers: (number | null)[]): string | null` — `<act>_<dominantAxisOfPreviousAct>`; null for `gi`, which has no previous act

- [ ] **Step 1: Write the failing assertions**

Insert into `scripts/kdrama.check.ts` before its `// --- report ---` block, extending the imports with `ACTS, actOf, dominantAxis, recapKey, type ActId`:

```ts
// --- four acts of three scenes --------------------------------------------

ok('twelve scenes', QUESTIONS.length === 12, QUESTIONS.length);
ok('four acts in 기승전결 order',
  JSON.stringify(ACTS) === JSON.stringify(['gi', 'seung', 'jeon', 'gyeol']), ACTS);
for (const act of ACTS) {
  ok(`${act} holds three scenes`, QUESTIONS.filter((q) => q.act === act).length === 3,
    QUESTIONS.filter((q) => q.act === act).length);
}
ok('scenes are in act order',
  QUESTIONS.map((q) => ACTS.indexOf(q.act)).every((a, i, xs) => i === 0 || a >= xs[i - 1]),
  QUESTIONS.map((q) => q.act));
ok('actOf agrees with the data',
  QUESTIONS.every((q, i) => actOf(i) === q.act));

// --- the option rule ------------------------------------------------------
// Balance has to hold inside a scene, not only across the set. Dealing the six
// pairs in order gave one scene three romance-primary options out of four, and
// that one skew pushed a type to 26% of all answer sets.

const primaryOf = (o: typeof QUESTIONS[0]['options'][0]) =>
  AXES.find((a) => (o.weights[a] ?? 0) === 10);
const secondaryOf = (o: typeof QUESTIONS[0]['options'][0]) =>
  AXES.find((a) => (o.weights[a] ?? 0) === 6);

ok('every option has one primary at 10 and one secondary at 6',
  QUESTIONS.every((q) => q.options.every((o) =>
    primaryOf(o) !== undefined && secondaryOf(o) !== undefined
    && Object.keys(o.weights).length === 2)));
ok('every scene offers one option per axis',
  QUESTIONS.every((q) => new Set(q.options.map(primaryOf)).size === 4),
  QUESTIONS.filter((q) => new Set(q.options.map(primaryOf)).size !== 4).map((q) => q.id));

const ordered = new Map<string, number>();
const unordered = new Map<string, number>();
for (const q of QUESTIONS) {
  for (const o of q.options) {
    const p = primaryOf(o)!; const s = secondaryOf(o)!;
    ordered.set(`${p}>${s}`, (ordered.get(`${p}>${s}`) ?? 0) + 1);
    const k = roleKey(p, s);
    unordered.set(k, (unordered.get(k) ?? 0) + 1);
  }
}
ok('twelve ordered combinations, four each',
  ordered.size === 12 && [...ordered.values()].every((n) => n === 4), [...ordered]);
ok('six pairs, eight each',
  unordered.size === 6 && [...unordered.values()].every((n) => n === 8), [...unordered]);

ok('exactly one scene carries a doubled temper',
  QUESTIONS.filter((q) => q.options.every((o) => Math.abs(o.temper) === 2)).length === 1,
  QUESTIONS.filter((q) => q.options.some((o) => Math.abs(o.temper) === 2)).map((q) => q.id));

// --- the dominant axis an act hands forward -------------------------------

ok('an unfinished act has no dominant axis',
  dominantAxis([0, 1, null, ...Array(9).fill(0)], 'gi') === null);
ok('a finished act has one',
  AXES.includes(dominantAxis(Array(12).fill(0), 'gi')!));
ok('the dominant axis reads only its own act',
  dominantAxis([0, 0, 0, ...Array(9).fill(1)], 'gi')
  === dominantAxis([0, 0, 0, ...Array(9).fill(2)], 'gi'));
ok('gi has no recap of its own', recapKey('gi', Array(12).fill(0)) === null);
ok('seung recaps gi', (recapKey('seung', Array(12).fill(0)) ?? '').startsWith('seung_'));
```

- [ ] **Step 2: Run the check to verify it fails**

Run: `npm run check`
Expected: FAIL. rolldown reports `ACTS`, `actOf`, `dominantAxis` and `recapKey` are not exported by `src/utils/kdramaCasting.ts`.

- [ ] **Step 3: Write the twelve scenes**

Rewrite `QUESTIONS` in `src/data/kdramaQuestions.ts` with twelve entries in the act order of the table above, each gaining `act: ActId`, and each option's weights assigned by the rule:

```
option i of scene s:  primary = AXES[i]           weight 10
                      secondary = AXES[(i + 1 + (s % 3)) % 4]   weight 6
                      temper = (s + i) even ? +1 : -1
                      except the twelfth scene (finale), where the magnitude is 2
```

So scene 0 (`arrival`) gets `romance+presence`, `presence+warmth`, `warmth+mischief`, `mischief+romance`; scene 1 (`notice`) gets `romance+warmth`, `presence+mischief`, `warmth+romance`, `mischief+presence`; scene 2 (`rumour`) gets `romance+mischief`, `presence+romance`, `warmth+presence`, `mischief+warmth`; scene 3 repeats scene 0's pattern, and so on.

Write the numbers out literally — do not compute them in the file. Someone retuning one option should see its numbers, and the check in Step 1 guards the invariants whichever way they were produced.

Update the file's header comment: the six-scene rationale is gone, and the reason balance must hold *inside* a scene belongs there, with the measured 26%-versus-9.4% figures.

- [ ] **Step 4: Add the act model to the caster**

In `src/utils/kdramaCasting.ts`:

```ts
export type ActId = 'gi' | 'seung' | 'jeon' | 'gyeol';

/** 기승전결, in order. Three scenes each. */
export const ACTS = ['gi', 'seung', 'jeon', 'gyeol'] as const;

export const SCENES_PER_ACT = 3;

export function actOf(sceneIndex: number): ActId {
  return ACTS[Math.floor(sceneIndex / SCENES_PER_ACT)];
}

/**
 * The one value an act hands to the next.
 *
 * The story does not branch — this does. Twelve scenes of four options is
 * sixteen million paths and nobody writes that, so an act passes forward only
 * which axis its three answers fed most, and that picks the next act's opening
 * line. Three lines that respond is what being responded to actually feels like.
 *
 * Ties break in AXES order, the same rule the role ranking uses.
 */
export function dominantAxis(answers: (number | null)[], act: ActId): Axis | null {
  const start = ACTS.indexOf(act) * SCENES_PER_ACT;
  const slice = answers.slice(start, start + SCENES_PER_ACT);
  if (slice.some((a) => a === null || a === undefined)) return null;

  const raw: Scores = { romance: 0, presence: 0, warmth: 0, mischief: 0 };
  for (let i = 0; i < SCENES_PER_ACT; i += 1) {
    const option = QUESTIONS[start + i].options[slice[i] as number];
    if (!option) return null;
    for (const axis of AXES) raw[axis] += option.weights[axis] ?? 0;
  }
  return [...AXES].sort((a, b) => raw[b] - raw[a])[0];
}

/** The copy key for the line that opens `act`, or null for the first act. */
export function recapKey(act: ActId, answers: (number | null)[]): string | null {
  const i = ACTS.indexOf(act);
  if (i <= 0) return null;
  const previous = dominantAxis(answers, ACTS[i - 1]);
  return previous ? `${act}_${previous}` : null;
}
```

`cast` needs no change: it already reads `QUESTIONS.length` answers and recomputes `CEILING` from `QUESTIONS`.

- [ ] **Step 5: Grow the store**

In `src/store/useFlowStore.ts`, change both `Array(6).fill(null)` to `Array(12).fill(null)` — the initial value and the one in `resetKdrama`.

- [ ] **Step 6: Add the stride sample**

Replace the exhaustive 4⁶ walk in `scripts/kdrama.check.ts` with the sample. Keep every assertion that runs on it:

```ts
// --- every combination of answers, sampled ---------------------------------
// 4^12 is sixteen million and this suite finishes in about four seconds, so the
// exhaustive walk the six-question version used is gone. The stride is 997
// because it is coprime with 4^12 = 2^24 and therefore visits every residue
// class; a round 1000 would leave index % 4 fixed and pick the same option in
// the last scene every single time. Fixed sequence, so a failure reproduces.

const TOTAL = 4 ** QUESTIONS.length;
const STRIDE = 997;
const every: Casting[] = [];
for (let i = 0; i < TOTAL; i += STRIDE) {
  const answers = Array.from({ length: QUESTIONS.length }, (_, k) => (i >> (2 * k)) & 3);
  const c = cast(answers);
  if (c) every.push(c);
}
ok('the sample is big enough to bound twelve types', every.length > 10000, every.length);
```

The bounds that follow — every type reachable, none above 20%, none below 2%, neither temper below 40% — stay exactly as they are.

- [ ] **Step 7: Run the check to verify it passes**

Run: `npm run check`
Expected: PASS.

If a distribution bound fails, the weights are wrong, not the assertion. Re-derive them from the rule in Step 3 rather than nudging individual numbers — the rule is what produces the 9.4%/7.0% spread, and a hand-nudged table drifts out of it.

- [ ] **Step 8: Build and commit**

Run: `npm run build`

```bash
git add src/data/kdramaQuestions.ts src/utils/kdramaCasting.ts src/store/useFlowStore.ts scripts/kdrama.check.ts
git commit -m "Group the K-Drama scenes into four acts"
```

---

### Task 2: The copy

**Files:**
- Modify: `src/data/locales/{en,ko,vi,th}/kdrama.json`
- Modify: `scripts/kdrama.check.ts`

**Interfaces:**
- Consumes: `QUESTIONS`, `ACTS`, `AXES`.
- Produces: `t('kdrama.premise')`, `t('kdrama.act.<actId>')`, `t('kdrama.recap.<act>_<axis>')`, and titles and options for the six new scenes.

- [ ] **Step 1: Write the failing assertions**

Insert into `scripts/kdrama.check.ts` before the report block:

```ts
// --- the acts have to be fully written ------------------------------------

const RECAP_KEYS = ACTS.slice(1).flatMap((act) => AXES.map((axis) => `${act}_${axis}`));
ok('twelve recap lines', RECAP_KEYS.length === 12, RECAP_KEYS.length);

for (const [lang, dict] of [['en', enK], ['ko', koK], ['vi', viK], ['th', thK]] as const) {
  const d = dict as Record<string, any>;
  ok(`${lang}: kdrama.premise`, typeof d.premise === 'string' && d.premise.length > 0);
  for (const act of ACTS) {
    ok(`${lang}: kdrama.act.${act}`, typeof d.act?.[act] === 'string' && d.act[act].length > 0);
  }
  for (const key of RECAP_KEYS) {
    ok(`${lang}: kdrama.recap.${key}`, typeof d.recap?.[key] === 'string' && d.recap[key].length > 0);
  }
  ok(`${lang}: no orphan recap keys`,
    Object.keys(d.recap ?? {}).every((k) => RECAP_KEYS.includes(k)),
    Object.keys(d.recap ?? {}).filter((k) => !RECAP_KEYS.includes(k)));
}

// A recap describes what happened; it must not predict the result. Naming a
// role would leak the ending and make the last act pointless.
for (const [lang, dict] of [['en', enK], ['ko', koK]] as const) {
  const d = dict as Record<string, any>;
  const roles = Object.values(d.role ?? {}) as string[];
  for (const key of RECAP_KEYS) {
    const line = d.recap?.[key] ?? '';
    ok(`${lang}: recap.${key} does not name a role`,
      !roles.some((r) => r.length > 1 && line.includes(r)), { key, line });
  }
  ok(`${lang}: every recap line is distinct`,
    new Set(RECAP_KEYS.map((k) => d.recap?.[k])).size === RECAP_KEYS.length);
}
```

- [ ] **Step 2: Run the check to verify it fails**

Run: `npm run check`
Expected: FAIL, with `kdrama.premise`, `kdrama.act.*` and `kdrama.recap.*` missing in all four languages, plus the six new scenes' titles and options missing from the Task 1 loop that already asserts them.

- [ ] **Step 3: Write the English copy**

In `src/data/locales/en/kdrama.json`, add `premise`, an `act` object and a `recap` object, and add the six new scenes to `q`. Every key the assertions enumerate must be present — that list is the full specification, so nothing here is open-ended.

`premise` sets up the drama without saying who the visitor is; naming the role would give the game away. The pattern to follow:

```json
"premise": "Sixteen episodes. A city, a season that is about to turn, and a handful of people who keep ending up in the same rooms. Nobody has told you which one you are yet — that is what the next twelve scenes are for.",
"act": {
  "gi": "Act One · The Setup",
  "seung": "Act Two · It Grows",
  "jeon": "Act Three · The Turn",
  "gyeol": "Act Four · The Close"
}
```

The twelve `recap` lines describe what the visitor has been doing, in the second person, past or present perfect — never future. Two as the pattern:

```json
"recap": {
  "seung_romance": "Three scenes in and you have been looking at one person longer than the shot needed. The show has noticed.",
  "seung_presence": "You have taken up room in every scene so far. People move around you now, which is a thing the camera has started doing too."
}
```

Write all twelve: `seung_*` and `jeon_*` and `gyeol_*`, each for `romance`, `presence`, `warmth` and `mischief`.

**Rename `q.umbrella.options.wait` to `shelter`** in every locale file, keeping its text. Task 1 renames it in the data because `apology` now also has a `wait`, and two different `wait`s in one room is a trap for whoever writes the copy next. The check's per-option loop will fail on the stale key if this is missed.

Write the six new scenes under `q` — `notice`, `rumour`, `secret`, `crossroads`, `apology`, `station` — each with a `title` and an `options` object keyed by the ids listed in this plan's scene table. They must fit their act: `notice` and `rumour` set things up, `secret` and `crossroads` turn them, `apology` and `station` close them.

- [ ] **Step 4: Write the Korean copy**

Same keys in `src/data/locales/ko/kdrama.json`, written for a Korean reader in the register drama recaps use. **Do not translate the English clause by clause.** The act names are the real Korean terms:

```json
"act": { "gi": "1막 · 기", "seung": "2막 · 승", "jeon": "3막 · 전", "gyeol": "4막 · 결" }
```

- [ ] **Step 5: Seed Vietnamese and Thai**

Copy the English file verbatim over `vi/kdrama.json` and `th/kdrama.json`, as every locale file on this site has been since the syllable dictionary. Note in the report that vi/th is placeholder.

- [ ] **Step 6: Run the check and build, then commit**

Run: `npm run check && npm run build`

```bash
git add src/data/locales/*/kdrama.json scripts/kdrama.check.ts
git commit -m "Write the four acts"
```

---

### Task 3: The screen

**Files:**
- Modify: `src/steps/KdramaScreen.tsx`

**Interfaces:**
- Consumes: `ACTS`, `SCENES_PER_ACT`, `actOf`, `recapKey`, `cast` from `src/utils/kdramaCasting.ts`; `QUESTIONS`; the store's twelve-slot `kdramaAnswers`.
- Produces: nothing later tasks rely on.

- [ ] **Step 1: Add the premise to the intro**

Render `t('kdrama.premise')` above the start button, in the same `text-[14px] leading-relaxed text-ink-3` the sub line uses, split by `sentences()` so it breaks on full stops.

- [ ] **Step 2: Add the act card**

`kdramaStep` currently runs 0 (intro), 1–6 (scenes), 7 (card). It now runs 0, then twelve scenes, then the result — with an act card shown **before the first scene of acts 2, 3 and 4**.

Rather than renumbering steps and getting the arithmetic wrong, derive the act card from what is already there: when `kdramaStep` is the first scene of an act other than `gi`, **and that act card has not been dismissed yet**, render the act card instead of the scene. Track dismissal with one piece of local state — `const [actSeen, setActSeen] = useState<ActId | null>(null)` — so Back into the previous act and forward again does not re-show it.

The card shows `t('kdrama.act.<act>')` and `t('kdrama.recap.<recapKey>')`, split by `sentences()`, with a single full-width button to continue. No options, no progress rail — it is a beat, not a question.

If `recapKey` returns null because the previous act is somehow unanswered, skip the act card rather than rendering an empty one.

```tsx
const act = actOf(index);
const recap = recapKey(act, kdramaAnswers);
const showActCard = index % SCENES_PER_ACT === 0 && recap !== null && actSeen !== act;

if (showActCard) {
  return (
    <div className="mx-auto flex w-full max-w-[620px] flex-1 flex-col justify-center px-6 pb-8 pt-5 lg:px-4">
      <span className="eyebrow text-[8.5px] tracking-[0.26em] text-accent">
        {t(`kdrama.act.${act}`)}
      </span>
      <span className="mt-5 flex flex-col gap-1.5 font-disp text-[22px] leading-snug text-ink md:text-[26px]">
        {sentences(String(t(`kdrama.recap.${recap}`))).map((line) => (
          <span key={line} className="block">{line}</span>
        ))}
      </span>
      <Button full className="mt-9" onClick={() => setActSeen(act)}>
        {t('kdrama.next')}
        <ArrowRight />
      </Button>
    </div>
  );
}
```

`setActSeen` is what dismisses it — the step does not advance, so Back from the
scene that follows returns to the previous act's last scene rather than to this
card, and re-entering the act does not show it twice.

- [ ] **Step 3: Make the progress rail two rows**

Replace the twelve-across rail with:

```tsx
{/* four act marks over three scene marks. Twelve dots in a line reads as
    "ten more to go", which is the feeling four acts exist to avoid. */}
<div className="flex items-center gap-1.5 pt-2" aria-hidden="true">
  {ACTS.map((a) => (
    <span key={a} className={`h-[3px] flex-1 rounded-full transition-colors ${
      ACTS.indexOf(a) <= ACTS.indexOf(actOf(index)) ? 'bg-accent' : 'bg-rule'
    }`} />
  ))}
</div>
<div className="mt-1.5 flex items-center gap-1.5" aria-hidden="true">
  {Array.from({ length: SCENES_PER_ACT }, (_, i) => (
    <span key={i} className={`h-[2px] w-4 rounded-full transition-colors ${
      i <= index % SCENES_PER_ACT ? 'bg-accent/50' : 'bg-rule'
    }`} />
  ))}
</div>
```

Change the eyebrow above the question from `{index + 1} / {QUESTIONS.length}` to the act name and the scene within it — `{t(`kdrama.act.${actOf(index)}`)} · {index % SCENES_PER_ACT + 1} / {SCENES_PER_ACT}`.

- [ ] **Step 4: Verify in the browser**

I will run this step myself — the dev server is a session-level resource. Leave it to me and say so in your report.

- [ ] **Step 5: Run the check and build, then commit**

Run: `npm run check && npm run build`

```bash
git add src/steps/KdramaScreen.tsx
git commit -m "Play the K-Drama test as four acts"
```

---

## Browser verification (mine, after Task 3)

1. The intro shows the premise; Start opens Act One, scene one.
2. Answering three scenes reaches an act card, not scene four.
3. The act card names Act Two and carries a recap line that reflects the answers — answering three romance-heavy options gives a different line than three mischief-heavy ones.
4. Continue from the act card lands on scene four; Back from scene four returns to scene three, not the act card.
5. Going back into act one and forward again does not re-show the act card.
6. Twelve scenes answered reaches the result card, unchanged: role, temper, name, four meters, one sentence.
7. 다른 이름으로 still changes only the name; 다시 하기 clears all twelve answers.
8. The rail shows four act marks and three scene marks, and the eyebrow names the act.
9. Korean throughout: act names read 1막 · 기 and the recap lines are Korean, not English.
10. 375px: no horizontal scroll on the act card or any scene. No console errors.

## Deliberately not built

- **Real branching.** Sixteen million paths. Three act openings are where the story visibly responds.
- **Carrying more than one value between acts.** Two would be sixteen recap lines per act and an argument about which pairs are reachable.
- **Back across an act boundary.** Back works within an act; crossing back would re-show a recap the visitor has read, which reads as the story rewriting itself.
- **Changing the result model.** Roles, tempers, types, the card and the name draw are untouched.
