# Name Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the four adjective grids with six situations from a day in Korea, move gender onto the surname screen, and show the visitor which of their answers pointed at the name they got.

**Architecture:** A new `SITUATIONS` table holds six questions of four options, each option contributing tags the name database already carries. The six answers add up to a tag profile; `matchNames` scores against the profile instead of three single answers. Nothing about the sound bridge, the surname screen's matching, or the result card's share and download changes.

**Tech Stack:** React 19, TypeScript, Zustand, Tailwind 3, Vite 8. No test framework — `npm run check` bundles `scripts/*.check.ts` with rolldown; `npm run build` is `tsc -b && vite build`.

**Spec:** [`docs/superpowers/specs/2026-09-15-name-generator-design.md`](../specs/2026-09-15-name-generator-design.md)

## Global Constraints

- **`nameDatabase.ts` does not change.** 114 names, their tags, their hanja. Six situations mapped onto data that already exists.
- **Every tag an option references must exist in the database.** This is the whole reason two of the current screens are broken, and it is asserted, not trusted.
- **All eleven nature tags and all seven vibe tags must be reachable.** The nature screen offers eight of eleven today; the vibe screen offers a tag carried by nobody.
- **The same answers always give the same name.** No `Math.random`; the existing FNV-1a tiebreak stays.
- **Gender is not a question.** It is a three-way control on the surname screen, where it reads as part of assembling a name rather than as the first thing the site asks about you.
- **Register:** spoken, current, no literary flourish. These six are the first thing a visitor reads.
- **Every situation must be true.** A foreigner who has been to Korea should recognise all six; one who has not should learn something.

## Measured before planning

Re-measured against the live database today, not taken from the spec:

- 114 names. Gender pools: **female 57, male 53, neutral 51**.
- vibes carried by names: `calm` 47, `soft` 39, `bright` 39, `trendy` 34, `lovely` 28, `strong` 22, `mystic` 19. **Seven.**
- personalities: `radiant` 40, `graceful` 39, `considerate` 34, `genuine` 34, `prudent` 32, `enterprising` 24, `inquisitive` 24, `sensitive` 23, `dependable` 23, `upright` 21, `whimsical` 18, `resilient` 12. **Twelve.**
- nature: `spring` 36, `summer` 28, `autumn` 28, `winter` 22, `river` 21, `forest` 21, `sky` 21, `sun` 14, `mountain` 14, `sea` 12, `flower` 11. **Eleven.**

Both faults in the spec are still live:

- **`natural` is on no name.** `StepOptions` offers it as "Understated & Easy", and choosing it narrows nothing and scores nothing.
- **`sky`, `sun` and `flower` are offered nowhere.** 46 names carry them.

## The six situations

| # | id | the moment | what it reads | axis |
|---|---|---|---|---|
| 1 | `cup` | The barista asks what name to put on the cup | how you want to be called | vibes |
| 2 | `train` | Last train, and someone's grandmother is standing | warmth | personalities |
| 3 | `dinner` | Company dinner, and a colleague pours you a drink | how you meet people | personalities |
| 4 | `lift` | Three minutes late, and the lift doors are closing | pace | vibes |
| 5 | `market` | The 아주머니 gives you extra and waves the money away | how you take a kindness | personalities |
| 6 | `evening` | Your last evening here, and you can be anywhere | what you are drawn to | nature |

Two situations feed `vibes`, three feed `personalities`, one feeds `nature`.

**`evening`'s four options carry three tags each**, because eleven nature tags cannot be covered by four options carrying one. That is also what makes `sky`, `sun` and `flower` reachable for the first time.

## The shape

```ts
// src/data/situations.ts
export interface Option {
  id: string;
  /** tags from nameDatabase — vibes, personalities or nature, never mixed */
  tags: string[];
}
export interface Situation {
  id: string;
  /** which field of NameItem this question's tags are read against */
  axis: 'vibes' | 'personalities' | 'nature';
  options: Option[];               // exactly four
}
export const SITUATIONS: Situation[];   // exactly six
```

Answers are an array of six option indices, `null` until answered:

```ts
export type Answers = (number | null)[];

/** every tag the visitor's six answers put on the table */
export function profileOf(answers: Answers): { tag: string; axis: Situation['axis']; from: string }[];
```

`matchNames` scores a name as **one point per profile tag the name carries**, keeps the sound bonus it already has, and breaks ties with the existing hash over a seed that includes every answer.

## File Structure

| File | Responsibility |
|---|---|
| `src/data/situations.ts` | create — the six questions, their options and tags |
| `src/utils/nameMatcher.ts` | modify — `MatchAnswers` takes `answers: Answers`; scoring reads the profile; `Match.reasons` becomes the situations that matched |
| `src/store/useFlowStore.ts` | modify — `STEPS` becomes the six situation ids; `nameAnswers`, `setNameAnswer`; `vibe`/`personality`/`seasonNature` go |
| `src/hooks/useMatches.ts` | modify — passes `nameAnswers` |
| `src/steps/StepOptions.tsx` | modify — one situation per screen, four options, no marks grid |
| `src/steps/StepSurname.tsx` | modify — gains the three-way gender control |
| `src/steps/StepResult.tsx` | modify — the reasoning line; the tag row reads the profile |
| `src/components/ProgressRail.tsx` | modify — seven slots |
| `src/data/locales/{en,ko,vi,th}/common.json` | modify — six titles, twenty-four options, twelve reasoning lines; the old `options.vibe/personality/nature` groups go |
| `scripts/matcher.check.ts` | modify — tag existence, reachability, the 8% bound |

---

### Task 1: The situations, the profile and the matcher

No screen changes yet. The check is what proves this task.

**Files:**
- Create: `src/data/situations.ts`
- Modify: `src/utils/nameMatcher.ts`, `scripts/matcher.check.ts`

**Interfaces:**
- Produces: `SITUATIONS`, `Option`, `Situation`, `Answers`, `profileOf(answers)`, and a `matchNames({ givenName, gender, answers }, limit?)` whose `Match.reasons` is now `string[]` of situation ids plus `'sound'`.
- Consumes: `NAME_DATABASE`, `choseongOf`, `readOnset`, `hash01` — all unchanged.

- [ ] **Step 1: Write the failing assertions**

Replace the `--- turning answers into a ranking ---` block of `scripts/matcher.check.ts` and add:

```ts
import { SITUATIONS, profileOf, type Answers } from '../src/data/situations';

// --- the six situations ----------------------------------------------------
// Two screens shipped broken for months because nothing checked that a tag an
// option offers is a tag a name actually carries: `natural` is on none of the
// 114 names, and `sky`, `sun` and `flower` are on 46 of them and offered by
// nobody. Both are impossible from here on.

const VIBES = new Set(NAME_DATABASE.flatMap((n) => n.vibes));
const PERSONALITIES = new Set(NAME_DATABASE.flatMap((n) => n.personalities));
const NATURE = new Set(NAME_DATABASE.flatMap((n) => n.nature));
const POOL = { vibes: VIBES, personalities: PERSONALITIES, nature: NATURE };

ok('six situations', SITUATIONS.length === 6, SITUATIONS.length);
ok('situation ids are unique', new Set(SITUATIONS.map((s) => s.id)).size === 6);
ok('four options each', SITUATIONS.every((s) => s.options.length === 4));
ok('option ids are unique across the six',
  new Set(SITUATIONS.flatMap((s) => s.options.map((o) => o.id))).size === 24);
ok('every option moves at least one tag',
  SITUATIONS.every((s) => s.options.every((o) => o.tags.length > 0)));

for (const situation of SITUATIONS) {
  const pool = POOL[situation.axis];
  for (const option of situation.options) {
    const unknown = option.tags.filter((tag) => !pool.has(tag));
    ok(`${situation.id}.${option.id} references only tags names carry`,
      unknown.length === 0, unknown);
  }
}

// every tag in the database has to be reachable, or names carrying only it are
// names the flow can never point at
for (const [axis, pool] of Object.entries(POOL) as [Situation['axis'], Set<string>][]) {
  const offered = new Set(SITUATIONS.filter((s) => s.axis === axis)
    .flatMap((s) => s.options.flatMap((o) => o.tags)));
  const missed = [...pool].filter((tag) => !offered.has(tag));
  ok(`every ${axis} tag is offered by some option`, missed.length === 0, missed);
}
```

- [ ] **Step 2: Run the check to verify it fails**

Run: `npm run check`

Expected: FAIL — `src/data/situations.ts` does not exist.

- [ ] **Step 3: Write the situations**

Create `src/data/situations.ts`. The tags, option by option — these are the choices the rest of the plan and all four locale files are keyed against:

```ts
export const SITUATIONS: Situation[] = [
  { id: 'cup', axis: 'vibes', options: [
    { id: 'own', tags: ['strong', 'trendy'] },      // your own name, spelled out
    { id: 'short', tags: ['bright', 'trendy'] },     // something short they can write
    { id: 'korean', tags: ['calm', 'mystic'] },      // the Korean name you are trying out
    { id: 'whatever', tags: ['soft', 'lovely'] },    // whatever they hear is fine
  ] },
  { id: 'train', axis: 'personalities', options: [
    { id: 'standup', tags: ['considerate', 'upright'] },
    { id: 'tap', tags: ['genuine', 'sensitive'] },
    { id: 'gesture', tags: ['graceful', 'prudent'] },
    { id: 'pretend', tags: ['whimsical', 'inquisitive'] },
  ] },
  { id: 'dinner', axis: 'personalities', options: [
    { id: 'twohands', tags: ['upright', 'dependable'] },
    { id: 'pourback', tags: ['considerate', 'graceful'] },
    { id: 'ask', tags: ['inquisitive', 'genuine'] },
    { id: 'toast', tags: ['radiant', 'enterprising'] },
  ] },
  { id: 'lift', axis: 'vibes', options: [
    { id: 'run', tags: ['bright', 'strong'] },
    { id: 'wave', tags: ['lovely', 'bright'] },
    { id: 'wait', tags: ['calm', 'soft'] },
    { id: 'stairs', tags: ['mystic', 'strong'] },
  ] },
  { id: 'market', axis: 'personalities', options: [
    { id: 'insist', tags: ['upright', 'resilient'] },
    { id: 'accept', tags: ['genuine', 'radiant'] },
    { id: 'return', tags: ['considerate', 'dependable'] },
    { id: 'regular', tags: ['enterprising', 'prudent'] },
  ] },
  { id: 'evening', axis: 'nature', options: [
    { id: 'hangang', tags: ['river', 'summer', 'sky'] },
    { id: 'bukhansan', tags: ['mountain', 'forest', 'autumn'] },
    { id: 'sea', tags: ['sea', 'sun', 'winter'] },
    { id: 'alley', tags: ['flower', 'spring', 'sky'] },
  ] },
];
```

Every vibe (7), every personality (12) and every nature tag (11) appears at least once; the check enforces it.

Then the profile:

```ts
export type Answers = (number | null)[];

export interface ProfileTag { tag: string; axis: Situation['axis']; from: string }

/** Every tag the visitor's six answers put on the table, with where it came from. */
export function profileOf(answers: Answers): ProfileTag[] {
  const out: ProfileTag[] = [];
  SITUATIONS.forEach((situation, i) => {
    const option = situation.options[answers[i] ?? -1];
    if (!option) return;
    for (const tag of option.tags) out.push({ tag, axis: situation.axis, from: situation.id });
  });
  return out;
}
```

- [ ] **Step 4: Point the matcher at the profile**

In `src/utils/nameMatcher.ts`, replace `MatchAnswers`'s three single fields with the answer array and score against the profile:

```ts
export interface MatchAnswers {
  givenName?: string;
  gender: Gender;
  answers: Answers;
}

export interface Match {
  name: NameItem;
  score: number;
  /** the situations this name actually answered to, plus 'sound' */
  reasons: string[];
}
```

In `matchNames`, destructure the argument so `answers` is the array rather than the whole object, then build the profile and the seed from it:

```ts
export function matchNames(input: MatchAnswers, limit = 3): MatchResult {
  const { givenName, gender, answers } = input;
  const { pool, sound } = narrowBySound(givenName);

  const profile = profileOf(answers);
  const seed = [givenName ?? '', gender ?? '', ...answers.map(String)].join('|');
```

and the per-name scoring becomes:

```ts
  const scored: Match[] = candidates.map((name) => {
    const reasons = new Set<string>();
    let score = 0;

    if (gender === 'neutral' && name.gender.includes('neutral')) score += 0.5;
    if (sound.matched && bySound.has(name.id)) { score += 4; reasons.add('sound'); }

    for (const { tag, axis, from } of profile) {
      if (name[axis].includes(tag)) { score += 1; reasons.add(from); }
    }

    return { name, score, reasons: [...reasons] };
  });
```

Delete `getRecommendedName` — nothing imports it, and it takes the four arguments that no longer exist. Check with `grep -rn getRecommendedName src/ scripts/` before deleting.

- [ ] **Step 5: Assert the spread**

Add to `scripts/matcher.check.ts`:

```ts
// --- where 4,096 answer sets land ------------------------------------------
// Four questions over 114 names meant a lot of visitors got the same name. Six
// weighted questions have to spread: a name nobody can reach is dead data, and
// a name a twelfth of everyone gets is the funnel this replaced.

for (const gender of ['male', 'female', 'neutral'] as const) {
  const winners: Record<string, number> = {};
  const total = 4 ** SITUATIONS.length;
  for (let i = 0; i < total; i += 1) {
    const answers = Array.from({ length: SITUATIONS.length }, (_, k) => (i >> (2 * k)) & 3);
    const top = matchNames({ gender, answers }, 1).matches[0].name.id;
    winners[top] = (winners[top] ?? 0) + 1;
  }
  const pool = NAME_DATABASE.filter((n) => n.gender.includes(gender));
  const unreachable = pool.filter((n) => !winners[n.id]).map((n) => n.id);
  ok(`${gender}: every name in the pool wins at least once`, unreachable.length === 0,
    { pool: pool.length, unreachable: unreachable.length, sample: unreachable.slice(0, 8) });

  const ranked = Object.entries(winners).sort((a, b) => b[1] - a[1]);
  ok(`${gender}: no single name takes more than 8% of answer sets`,
    ranked[0][1] / total <= 0.08, { name: ranked[0][0], share: +(ranked[0][1] / total).toFixed(3) });
}

// the same answers must always give the same name — a shared card has to
// reproduce for the person it was shared with
const twice = [0, 1, 2, 3, 0, 1];
ok('the same answers give the same name',
  matchNames({ gender: 'female', answers: twice }, 1).matches[0].name.id
  === matchNames({ gender: 'female', answers: twice }, 1).matches[0].name.id);
ok('a different answer can give a different name',
  new Set([0, 1, 2, 3].map((first) =>
    matchNames({ gender: 'female', answers: [first, 1, 2, 3, 0, 1] }, 1).matches[0].name.id)).size > 1);
```

- [ ] **Step 6: Run it, and tune if the bounds fail**

Run: `npm run check`

**The two bounds are the risk in this whole plan**, so expect to iterate. If a pool has unreachable names, the tag sets are too narrow — widen the rarest tags across more options. If one name takes more than 8%, a tag combination is over-represented — 12,288 scored runs take a couple of seconds, so measure after each change rather than reasoning about it.

Do not reach for randomness. The hash tiebreak already varies with the answers, which is what spreads ties; if it is not spreading enough, the fix is in the tags.

- [ ] **Step 7: Commit**

```bash
git add src/data/situations.ts src/utils/nameMatcher.ts scripts/matcher.check.ts
git commit -m "Six situations and a tag profile, in place of three adjectives"
```

---

### Task 2: The flow

**Files:**
- Modify: `src/store/useFlowStore.ts`, `src/hooks/useMatches.ts`, `src/steps/StepOptions.tsx`, `src/components/ProgressRail.tsx`, `src/steps/StepSurname.tsx`, `src/App.tsx`

**Interfaces:**
- Consumes: `SITUATIONS` and `Answers` from Task 1.
- Produces: store fields `nameAnswers: Answers` and `setNameAnswer(index, option)`; `gender` stays but loses its step.

- [ ] **Step 1: Rewrite the steps**

In `src/store/useFlowStore.ts`:

```ts
export const STEPS = [
  'landing', 'cup', 'train', 'dinner', 'lift', 'market', 'evening', 'surname', 'loading', 'result',
] as const;

/** The six situation screens, in order — used for the progress rail. */
export const QUESTION_STEPS = ['cup', 'train', 'dinner', 'lift', 'market', 'evening'] as const;
```

Replace `vibe`, `personality`, `seasonNature` and their setters with:

```ts
  /** one option index per situation, null until answered */
  nameAnswers: Answers;
  setNameAnswer: (index: number, option: number) => void;
```

```ts
  nameAnswers: Array(6).fill(null),
  setNameAnswer: (index, option) => set((s) => {
    const next = [...s.nameAnswers];
    next[index] = option;
    return { nameAnswers: next };
  }),
```

`setAnswer`/`answerFor` go with the three fields they addressed. `restart` becomes:

```ts
  restart: () => set({
    step: 'landing', givenName: '', gender: null,
    nameAnswers: Array(6).fill(null), surnameId: null,
  }),
```

- [ ] **Step 2: Point the hook at it**

`src/hooks/useMatches.ts` reads `givenName`, `gender` and `nameAnswers` and passes them straight through.

- [ ] **Step 3: One situation per screen**

Rewrite `src/steps/StepOptions.tsx`. The four adjective grids and their `COLS` map go; every situation is four options in one column, because they are sentences now rather than words:

```tsx
export default function StepOptions({ step }: { step: QuestionStep }) {
  const { nameAnswers, setNameAnswer, next, prev } = useFlowStore();
  const { t } = useTranslation();

  const index = QUESTION_STEPS.indexOf(step);
  const situation = SITUATIONS[index];
  const selected = nameAnswers[index];

  return (
    <div className="mx-auto flex w-full max-w-[900px] flex-1 flex-col px-6 pb-8 pt-5 lg:px-4">
      <ProgressRail current={step} />

      <div className="pb-5 pt-7">
        {/* one block per sentence: a situation is where you are and then what
            is happening, and the two wrapping together read as one run-on */}
        <h2 className="mb-2.5 -ml-[0.035em] flex flex-col text-pretty font-disp text-[29px] leading-[1.1] tracking-tight text-ink md:text-[38px]">
          {sentences(String(t(`situations.${situation.id}.title`))).map((line) => (
            <span key={line} className="block">{line}</span>
          ))}
        </h2>
        <p className="text-[14px] leading-relaxed text-ink-3 md:text-[15px]">
          {t(`situations.${situation.id}.description`)}
        </p>
      </div>

      <div className="grid gap-2.5">
        {situation.options.map((option, o) => {
          const on = selected === o;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={on}
              onClick={() => setNameAnswer(index, o)}
              className={`focus-ring flex min-h-[68px] items-center rounded-2xl border-[1.5px] p-4 text-left transition-colors duration-150 ${
                on ? 'border-accent bg-accent/[0.05]' : 'border-rule bg-paper-hi hover:border-rule-strong hover:bg-paper-lo/60'
              }`}
            >
              <span className={`min-w-0 flex-1 text-balance font-disp text-[17px] leading-snug md:text-[18px] ${on ? 'text-ink' : 'text-ink-2'}`}>
                {t(`situations.${situation.id}.options.${option.id}`)}
              </span>
              <CheckMark on={on} />
            </button>
          );
        })}
      </div>

      <div className="mt-auto flex items-center justify-between gap-4 pt-9">
        <Button variant="ghost" onClick={prev} className="px-3">
          <ArrowLeft />
          {t('layout.buttons.prev')}
        </Button>
        <Button onClick={next} disabled={selected === null}>
          {t('layout.buttons.next')}
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
```

`OptionMark` leaves this file. The marks are drawn per adjective and there are no adjectives here.

- [ ] **Step 4: Seven slots on the rail**

`ProgressRail`'s `SLOTS` already derives from `QUESTION_STEPS`, so it widens on its own. Its labels read `layout.steps.<n>`, which Task 3 rewrites to seven.

- [ ] **Step 5: Gender on the surname screen**

In `src/steps/StepSurname.tsx`, above the surname list:

```tsx
      {/* Gender used to be the first question, which set the form tone for
          everything after it. It is the one genuinely administrative field in
          the flow, so it sits here, where it reads as part of assembling a name
          rather than as the first thing the site wants to know about you. */}
      <div className="mt-6">
        <span className="eyebrow mb-2 block text-[8.5px] text-ink-4">{t('surname.gender_label')}</span>
        <div className="grid grid-cols-3 gap-2">
          {(['female', 'male', 'neutral'] as const).map((g) => {
            const on = gender === g;
            return (
              <button
                key={g}
                type="button"
                aria-pressed={on}
                onClick={() => setGender(on ? null : g)}
                className={`focus-ring flex min-h-[46px] items-center justify-center rounded-2xl border-[1.5px] px-3 text-center font-disp text-[15px] transition-colors duration-150 ${
                  on ? 'border-accent bg-accent/[0.05] text-ink' : 'border-rule bg-paper-hi text-ink-2 hover:border-rule-strong'
                }`}
              >
                {t(`options.gender.${g}`)}
              </button>
            );
          })}
        </div>
      </div>
```

with `gender` and `setGender` pulled from the store. The Next button stays enabled whether or not a gender is picked — `null` keeps the whole pool, which is a real answer.

- [ ] **Step 6: Run the build**

Run: `npx tsc -b --noEmit`

Expected: errors only where locale keys are still the old ones. Fix any type error; leave the copy to Task 3.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Six situation screens, and gender beside the surname"
```

---

### Task 3: The copy and the reasoning line

**Files:**
- Modify: `src/data/locales/{en,ko,vi,th}/common.json`, `src/steps/StepResult.tsx`, `scripts/matcher.check.ts`

**Interfaces:**
- Consumes: `SITUATIONS`, `profileOf`, `Match.reasons` from Tasks 1 and 2.
- Produces: `t('situations.<id>.title' | '.description' | '.options.<id>')`, `t('result.because')`, `t('reasons.<id>')`.

- [ ] **Step 1: Write the Korean situations**

In `src/data/locales/ko/common.json`, add a `situations` block and delete `options.vibe`, `options.personality` and `options.nature` (keep `options.gender` — the surname screen uses it). `questions.step1..4` go too.

```json
"situations": {
  "cup": {
    "title": "카페에서 이름을 묻습니다. 컵에 뭐라고 적을까요?",
    "description": "한국 카페는 진동벨 대신 이름을 부르는 데가 많습니다.",
    "options": {
      "own": "내 이름 그대로. 철자까지 불러 준다",
      "short": "짧게 줄여서. 쓰기 쉬운 걸로",
      "korean": "요즘 써 보는 한국 이름으로",
      "whatever": "들리는 대로 적어 주세요"
    }
  }
}
```

Write all six with the same shape. The `description` is one line and exists to teach a foreigner why the moment is a moment — that cafés call names, that the last train is full, that 회식 has a pouring order, that the 아주머니 will not take the money back.

- [ ] **Step 2: Write the twelve reasoning lines**

**Keyed by the option the visitor picked — `reasons.<optionId>`, twenty-four of them.** Keying by situation would print a line about the question; keying by option prints a line about the answer, which is the half they will recognise as theirs.

```json
"reasons": {
  "own": "이름을 줄이지 않는 사람",
  "short": "빨리 통하는 쪽이 좋은 사람",
  "korean": "여기 말로 불리고 싶은 사람",
  "whatever": "아무렇게나 불려도 괜찮은 사람"
}
```

Each is a noun phrase that finishes "…이라서" in the line the card prints. That keeps the sentence short and stops it reading as a horoscope.

```json
"result": { "because": "{a}, {b}. 그래서 {name}입니다." }
```

- [ ] **Step 3: Print it on the card**

In `src/steps/StepResult.tsx`, under the name and above the meaning, add the line. `match.reasons` holds the situation ids that scored; take the first two in `SITUATIONS` order, look up the option the visitor picked for each, and fill the pattern:

```tsx
  const why = match.reasons
    .filter((r) => r !== 'sound')
    .slice(0, 2)
    .map((id) => {
      const i = SITUATIONS.findIndex((s) => s.id === id);
      const option = SITUATIONS[i].options[nameAnswers[i] ?? 0];
      return String(t(`reasons.${option.id}`));
    });

  const because = why.length === 2
    ? String(t('result.because')).replace('{a}', why[0]).replace('{b}', why[1]).replace('{name}', fullHangul)
    : null;
```

Render `because` only when it is non-null — a visitor whose name matched on sound alone gets no line rather than a half one.

- [ ] **Step 4: English, then vi and th**

Same keys in `src/data/locales/en/common.json`, written for a reader who may never have been to Korea, then copy the English file over `vi` and `th` as every locale here has been since the syllable dictionary. **Do not translate the Korean clause by clause** — the Korean is written for someone who already knows what a 회식 is, and the English is not.

- [ ] **Step 5: Assert the copy**

Add to `scripts/matcher.check.ts`:

```ts
for (const [lang, bundle] of Object.entries({ en, ko, vi, th })) {
  const b = bundle as Record<string, any>;
  for (const situation of SITUATIONS) {
    const s = b.situations?.[situation.id];
    ok(`${lang}: situations.${situation.id}.title`, typeof s?.title === 'string' && s.title.length > 0);
    ok(`${lang}: situations.${situation.id}.description`,
      typeof s?.description === 'string' && s.description.length > 0);
    for (const option of situation.options) {
      ok(`${lang}: situations.${situation.id}.options.${option.id}`,
        typeof s?.options?.[option.id] === 'string' && s.options[option.id].length > 0);
      ok(`${lang}: reasons.${option.id}`,
        typeof b.reasons?.[option.id] === 'string' && b.reasons[option.id].length > 0);
    }
  }
  ok(`${lang}: result.because names all three slots`,
    ['{a}', '{b}', '{name}'].every((slot) => String(b.result?.because ?? '').includes(slot)),
    b.result?.because);
  // the four adjective grids are gone, not merely unused
  for (const group of ['vibe', 'personality', 'nature']) {
    ok(`${lang}: options.${group} is gone`, b.options?.[group] === undefined);
  }
  ok(`${lang}: seven rail labels`, Object.keys(b.layout?.steps ?? {}).length === 7,
    Object.keys(b.layout?.steps ?? {}).length);
}
```

- [ ] **Step 6: Run the check and the build, then commit**

Run: `npm run check && npm run build`

```bash
git add -A
git commit -m "Write the six situations, and say which answers picked the name"
```

---

## Browser verification (mine, after Task 3)

1. `/ko` — the landing still starts the flow, and the rail shows seven slots.
2. Walk the six situations: each is four sentences in one column, Next is disabled until one is picked, Back returns to the previous situation.
3. The surname screen shows the three-way gender control, and picking one changes the name that arrives.
4. The result prints the "because" line, and the two phrases in it correspond to answers actually given — change one answer and watch the line change.
5. A name matched on sound alone prints no because-line rather than a truncated one.
6. `npm run check` reports every name reachable and the top name under 8% for all three gender pools.
7. `/en` shows the English situations, not Korean ones.

## Deliberately not built

- **Free-text description.** A blank page is worse than a form.
- **More than six.** This is the front door; K-Drama is the long room.
- **Asking the visitor to judge Korean sounds.** Nobody outside Korea knows what 서연 sounds like, and pretending otherwise is what makes a name feel arbitrary when it arrives.
- **New name data.** Six situations mapped onto tags that already exist.
- **Changing the surname screen's matching.** Only the gender control is added.
- **vi/th translations.** Placeholder English, as everywhere else on the site.
