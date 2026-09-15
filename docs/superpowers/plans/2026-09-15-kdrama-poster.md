# K-Drama Poster Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the K-Drama room from a personality test into a drama you star in — pick a genre, walk twelve scenes that fork three times, and get a poster with your name in the title.

**Architecture:** The numbers move out of the scene table into one `SLOTS` array so that four genres share one arithmetic and the distribution cannot drift. Each genre owns twelve *tellings*: nine fixed scenes and three that come in four variants, chosen by the dominant axis of the act just finished. The result card becomes a poster keyed on `genre × typeKey`.

**Tech Stack:** React 19, TypeScript, Zustand, Tailwind 3, Vite 8. No test framework — `npm run check` bundles `scripts/*.check.ts` with rolldown; `npm run build` is `tsc -b && vite build`.

**Spec:** [`docs/superpowers/specs/2026-09-15-kdrama-poster-design.md`](../specs/2026-09-15-kdrama-poster-design.md)

## Global Constraints

- **The engine does not change.** Four axes `romance / presence / warmth / mischief`; six roles from the six axis pairs; two tempers; twelve types; four acts of three scenes; the finale's doubled temper; the 997-stride sample and its bounds (no type above 20%, none below 2%, tempers within 40–60%).
- **The numbers live in exactly one place.** `SLOTS[i].options[j]` carries `weights` and `temper`. No genre, no scene and no branch variant carries a number. The position rule, unchanged:
  ```
  option j of slot i:  primary   = AXES[j]                      weight 10
                       secondary = AXES[(j + 1 + (i % 3)) % 4]  weight 6
                       temper    = (i + j) even ? +1 : -1,  doubled in slot 11
  ```
- **`cast()` never sees the genre or the branch.** If it needs either, the change is wrong.
- **The six role names and the two temper words never reach the screen.** `lead`, `firstLove`, `spark`, `second`, `rival`, `bestie`, `direct`, `careful` are keys. 주인공 / 첫사랑 / 직진하는 and their translations are deleted from the locale files.
- **Branch positions are `[3, 6, 9]`** — the first scene of 승, 전 and 결 — and each holds one scene per axis.
- **Name-bearing is a property of the position.** Six of twelve positions carry `{name}`, and at a branch position all four variants carry it or none does, so every path hears it exactly six times.
- **Every poster title contains `{name}`.**
- **The test for every scene:** could you screenshot it and have a Korean say "아 그거"?
- **Register:** short, spoken, current. No literary flourish, no slang with a shelf life. Korean is written first, never translated clause by clause from English.

---

## The shape

```ts
// src/data/kdramaSlots.ts — the engine. Twelve positions, one arithmetic.
export interface SlotOption { weights: Partial<Record<Axis, number>>; temper: number }
export interface Slot { act: ActId; options: SlotOption[] }
export const SLOTS: Slot[];                    // 12
export const BRANCH_AT: readonly number[];      // first scene of 승, 전, 결

// src/data/kdramaScenes.ts — the stories.
// Widened by one per task: Task 1 ships ['chaebol'], Task 4 ships all four.
export const GENRES = ['chaebol', 'makjang', 'highteen', 'idol'] as const;
export type Genre = (typeof GENRES)[number];
export interface Scene { id: string; options: [string, string, string, string] }
export type Telling =
  | { branch: false; scene: Scene }
  | { branch: true; scenes: Record<Axis, Scene> };
export interface Story { name: number[]; tellings: Telling[] }   // name: six positions
export const STORIES: Record<Genre, Story>;
```

`sceneAt(genre, index, answers)` resolves a position to one `Scene`:

```ts
export function sceneAt(genre: Genre, index: number, answers: (number | null)[]): Scene {
  const telling = STORIES[genre].tellings[index];
  if (!telling.branch) return telling.scene;
  const previous = ACTS[Math.floor(index / SCENES_PER_ACT) - 1];
  // the act before a branch is always complete, so the fallback is unreachable;
  // it is here so a wrong call site returns a scene rather than undefined
  return telling.scenes[dominantAxis(answers, previous) ?? AXES[0]];
}
```

## Copy keys

```
kdrama.genre.<genre>.label        재벌 로맨스
kdrama.genre.<genre>.tagline      회장님, 비서, 그리고 봉투
kdrama.genre.<genre>.slot         16부작 · 수목 미니시리즈
kdrama.<genre>.q.<sceneId>.title
kdrama.<genre>.q.<sceneId>.options.<optionId>
kdrama.<genre>.poster.<typeKey>.title      《{name}의 계약 연애》
kdrama.<genre>.poster.<typeKey>.logline
kdrama.axis.<axis>                로맨스 / 긴장감 / 다정함 / 코미디   (shared, relabelled)
```

Deleted: `kdrama.role.*`, `kdrama.temper.*`, `kdrama.type.*`, `kdrama.recap.*`, `kdrama.headline`.

## File Structure

| File | Responsibility |
|---|---|
| `src/data/kdramaSlots.ts` | create — the twelve positions and their numbers, `BRANCH_AT` |
| `src/data/kdramaScenes.ts` | create — `GENRES`, `STORIES`, `sceneAt` |
| `src/data/kdramaQuestions.ts` | **delete** — it was numbers and story in one table |
| `src/utils/kdramaCasting.ts` | modify — `cast`/`dominantAxis` read `SLOTS`; `CEILING` from `SLOTS` |
| `src/store/useFlowStore.ts` | modify — `kdramaGenre`, `setKdramaGenre`; reset clears it |
| `src/steps/KdramaScreen.tsx` | modify — genre picker, branch resolution, the poster |
| `src/data/locales/{en,ko,vi,th}/kdrama.json` | modify — all of the above |
| `scripts/kdrama.check.ts` | modify — per-genre and per-branch assertions |

---

### Task 1: 재벌 — the whole room, one genre

This is the vertical slice: the model, the branching, the picker, the poster, and 재벌 written end to end. The other three genres are pure repeats of its copy work.

**Files:**
- Create: `src/data/kdramaSlots.ts`, `src/data/kdramaScenes.ts`
- Delete: `src/data/kdramaQuestions.ts`
- Modify: `src/utils/kdramaCasting.ts`, `src/store/useFlowStore.ts`, `src/steps/KdramaScreen.tsx`, `src/data/locales/*/kdrama.json`, `scripts/kdrama.check.ts`

**Interfaces:**
- Produces: `SLOTS`, `BRANCH_AT`, `GENRES`, `Genre`, `Scene`, `Telling`, `Story`, `STORIES`, `sceneAt(genre, index, answers)`. Store gains `kdramaGenre: Genre | null` and `setKdramaGenre(g: Genre | null): void`.
- Consumes: `AXES`, `ACTS`, `SCENES_PER_ACT`, `actOf`, `dominantAxis`, `cast`, `roleKey` from `kdramaCasting`; `hangulFor`.

- [ ] **Step 1: Move the numbers into `SLOTS`**

Create `src/data/kdramaSlots.ts`. Copy the twelve `options` arrays out of `src/data/kdramaQuestions.ts` **exactly as written** — do not recompute them from the rule, because retyping is the only way this plan can move the distribution:

```ts
import type { ActId, Axis } from '../utils/kdramaCasting';

export interface SlotOption {
  /** one primary axis at 10 and one secondary at 6 */
  weights: Partial<Record<Axis, number>>;
  /** +1 leans 직진, -1 leans 신중; doubled in the finale so a tie cannot happen */
  temper: number;
}

export interface Slot { act: ActId; options: SlotOption[] }

/**
 * The twelve positions, and the only place a number lives.
 *
 * Four genres tell four different stories through these same twelve slots, so
 * the weights belong to the slot rather than to the scene sitting in it. That
 * is not tidiness: it is why `cast()` cannot tell which genre or which branch
 * was played, and why the measured distribution holds for all of them without
 * being measured four times.
 *
 *   option j of slot i:  primary   = AXES[j]                      weight 10
 *                        secondary = AXES[(j + 1 + (i % 3)) % 4]  weight 6
 *                        temper    = (i + j) even ? +1 : -1, doubled in slot 11
 */
export const SLOTS: Slot[] = [
  { act: 'gi', options: [
    { weights: { romance: 10, presence: 6 }, temper: 1 },
    { weights: { presence: 10, warmth: 6 }, temper: -1 },
    { weights: { warmth: 10, mischief: 6 }, temper: 1 },
    { weights: { mischief: 10, romance: 6 }, temper: -1 },
  ] },
  // ... the remaining eleven, copied verbatim from kdramaQuestions.ts in order
];

/**
 * Where the story forks: the first scene of 승, 전 and 결.
 *
 * `dominantAxis()` already read the act just finished and already picked the
 * recap line — the fork was computed and then spent on a card with one button
 * on it. These three positions spend it on a scene instead.
 */
export const BRANCH_AT: readonly number[] = [3, 6, 9];
```

- [ ] **Step 2: Write the failing assertions**

Rewrite `scripts/kdrama.check.ts`'s imports and its question block. Replace `import { QUESTIONS } from '../src/data/kdramaQuestions';` with:

```ts
import { SLOTS, BRANCH_AT } from '../src/data/kdramaSlots';
import { GENRES, STORIES, sceneAt, type Genre } from '../src/data/kdramaScenes';
```

Replace every `QUESTIONS` reference in the existing distribution, determinism, act and option-rule blocks with `SLOTS` (the shapes match: `.length`, `[i].options[j].weights`, `[i].options[j].temper`, `[i].act`). Then add before the report block:

```ts
// --- one arithmetic, four stories ------------------------------------------

ok('the weights still follow the position rule',
  SLOTS.every((slot, i) => slot.options.every((o, j) => {
    const primary = AXES[j];
    const secondary = AXES[(j + 1 + (i % 3)) % 4];
    const sign = (i + j) % 2 === 0 ? 1 : -1;
    const scale = i === SLOTS.length - 1 ? 2 : 1;
    return o.weights[primary] === 10 && o.weights[secondary] === 6
      && Object.keys(o.weights).length === 2 && o.temper === sign * scale;
  })),
  SLOTS.filter((s, i) => s.options.some((o, j) => o.weights[AXES[j]] !== 10
    || o.weights[AXES[(j + 1 + (i % 3)) % 4]] !== 6)).map((_, i) => i));

for (const genre of GENRES) {
  const story = STORIES[genre];
  ok(`${genre}: twelve positions`, story.tellings.length === 12, story.tellings.length);
  ok(`${genre}: branches exactly at ${BRANCH_AT}`,
    story.tellings.every((t, i) => t.branch === BRANCH_AT.includes(i)),
    story.tellings.map((t, i) => (t.branch ? i : null)).filter((i) => i !== null));

  // a branch the dominant axis can select but that nobody wrote is a crash
  for (const i of BRANCH_AT) {
    const telling = story.tellings[i];
    ok(`${genre}: position ${i} offers all four axes`,
      telling.branch && AXES.every((a) => telling.scenes[a]?.id),
      telling.branch ? Object.keys(telling.scenes) : 'not a branch');
  }

  const scenes = story.tellings.flatMap((t) => (t.branch ? Object.values(t.scenes) : [t.scene]));
  ok(`${genre}: twenty-one scenes`, scenes.length === 21, scenes.length);
  ok(`${genre}: scene ids are unique`,
    new Set(scenes.map((s) => s.id)).size === scenes.length);
  ok(`${genre}: every scene has four options with unique ids`,
    scenes.every((s) => s.options.length === 4 && new Set(s.options).size === 4));
  ok(`${genre}: six name positions`, story.name.length === 6, story.name);
  ok(`${genre}: name positions are in range and sorted`,
    story.name.every((i, k) => i >= 0 && i < 12 && (k === 0 || i > story.name[k - 1])), story.name);
}

// every one of the 4^3 paths resolves to a real scene
for (const genre of GENRES) {
  for (let a = 0; a < 4; a += 1) for (let b = 0; b < 4; b += 1) for (let c = 0; c < 4; c += 1) {
    const answers = [a, a, a, b, b, b, c, c, c, 0, 0, 0];
    ok(`${genre}: path ${a}${b}${c} resolves every position`,
      Array.from({ length: 12 }, (_, i) => sceneAt(genre, i, answers)).every((s) => s?.id));
  }
}
```

- [ ] **Step 3: Run the check to verify it fails**

Run: `npm run check`

Expected: FAIL — `src/data/kdramaScenes.ts` does not exist yet.

- [ ] **Step 4: Build the story table for 재벌**

Create `src/data/kdramaScenes.ts` with the model from "The shape" above, and 재벌's twenty-one scenes. Positions, in order — nine fixed, three branching:

| # | act | scene id | name | option ids |
|---|---|---|---|---|
| 0 | 기 | `intern` | ✔ | `stare`, `brief`, `learn`, `mutter` |
| 1 | 기 | `elevator` | | `mirror`, `ask`, `hold`, `joke` |
| 2 | 기 | `rumour` | ✔ | `sowhat`, `silence`, `offer`, `rename` |
| 3 | 승 | **branch** | ✔ | see below |
| 4 | 승 | `rooftop` | | `beside`, `coffee`, `tissue`, `weather` |
| 5 | 승 | `rival` | | `overtime`, `between`, `defer`, `photo` |
| 6 | 전 | **branch** | ✔ | see below |
| 7 | 전 | `hospital` | | `wait`, `family`, `porridge`, `talk` |
| 8 | 전 | `contract` | ✔ | `real`, `terms`, `why`, `rings` |
| 9 | 결 | **branch** | | see below |
| 10 | 결 | `wrist` | | `follow`, `greet`, `regrip`, `laugh` |
| 11 | 결 | `ramyeon` | ✔ | `stay`, `up`, `tomorrow`, `two` |

`name: [0, 2, 3, 6, 8, 11]`.

The three branches, each keyed by the axis the act before leaned on:

| position | romance | presence | warmth | mischief |
|---|---|---|---|---|
| 3 (승 opens) | `overnight` 야근, 사무실에 둘만 | `hoesik` 회식 2차, 부장이 마이크 | `sickday` 몸살로 결근한 그 사람 | `talent` 워크샵 장기자랑에 둘이 뽑힘 |
| 6 (전 opens) | `mother` 어머니와 봉투 | `chairman` 회장실 호출 | `quitting` 그 사람이 사표를 냈다 | `leak` 사내 메신저가 털렸다 |
| 9 (결 opens) | `snow` 첫눈 | `board` 이사회에서 당신 이름이 | `airport` 그 사람이 공항에 있다 | `press` 사내 결혼설이 기사로 |

Option ids for the branch scenes:

```
overnight: nothing, coffee2, blanket, playlist        chairman: name, bow, silent2, deal
hoesik:    ballad, stand, swap, tambourine            quitting: follow2, reason, hold2, joke2
sickday:   porridge2, doctor, text2, soup             leak:     own2, delete, laugh2, screenshot
talent:    duet, mc, backup, costume
snow:      go, call, text3, snowman                   board:    speak, wait2, credit, walk
airport:   drive, ring, letter2, gate                 press:    confirm, deny2, tease, frame
```

Every one of those ids must be unique across the genre — the check asserts it.

- [ ] **Step 5: Point the casting engine at `SLOTS`**

In `src/utils/kdramaCasting.ts`, replace `import { QUESTIONS } from '../data/kdramaQuestions';` with `import { SLOTS } from '../data/kdramaSlots';` and substitute `SLOTS` for `QUESTIONS` in `dominantAxis`, `CEILING` and `cast`. The field access is identical (`.options[i].weights`), so nothing else moves.

Add to the file's doc comment:

```
 * `cast()` takes answers and nothing else — not the genre, not which branch was
 * taken. That is deliberate: four genres tell four stories through the same
 * twelve slots, so one measured distribution covers all of them, and a change
 * that needs the genre in here is a change that broke that.
```

Delete `src/data/kdramaQuestions.ts`.

- [ ] **Step 6: Put the genre in the store**

In `src/store/useFlowStore.ts`, beside `kdramaName`:

```ts
  /** which drama the visitor is in; null until they pick one */
  kdramaGenre: Genre | null;
  setKdramaGenre: (genre: Genre | null) => void;
```

```ts
  kdramaGenre: null,
  setKdramaGenre: (kdramaGenre) => set({ kdramaGenre }),
```

`resetKdrama` leaves the genre alone — "다시 하기" on the poster means answer again, not pick a genre again. `resetTool('kdrama')`, which runs when the visitor leaves the room, clears it along with the name:

```ts
    else if (tool === 'kdrama') { s.resetKdrama(); s.setKdramaName(''); s.setKdramaGenre(null); }
```

Import `Genre` from `../data/kdramaScenes`.

- [ ] **Step 7: Run the check**

Run: `npm run check`

Expected: the structural and distribution blocks PASS (they are reading the same numbers through `SLOTS`). The locale blocks FAIL — the copy is still keyed the old way. Step 9 fixes that.

- [ ] **Step 8: The screen**

In `src/steps/KdramaScreen.tsx`:

**The genre picker** goes on the intro, above the name field. Four cards, the marks borrowed from the quiz set so nothing new has to be drawn:

```tsx
/** borrowed from the quiz set, so no new drawing is needed for a genre */
const GENRE_MARK: Record<Genre, string> = {
  chaebol: 'trendy',
  makjang: 'strong',
  highteen: 'bright',
  idol: 'lovely',
};
```

```tsx
        <div className="mt-7 grid gap-2.5 sm:grid-cols-2">
          {GENRES.map((g) => {
            const on = kdramaGenre === g;
            return (
              <button
                key={g}
                type="button"
                aria-pressed={on}
                onClick={() => setKdramaGenre(g)}
                className={`focus-ring flex min-h-[72px] items-center gap-3.5 rounded-2xl border-[1.5px] p-3.5 text-left transition-colors duration-150 ${
                  on ? 'border-accent bg-accent/[0.05]' : 'border-rule bg-paper-hi hover:border-rule-strong hover:bg-paper-lo/60'
                }`}
              >
                <OptionMark id={GENRE_MARK[g]} active={on} size={34} />
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className={`block font-disp text-[17px] leading-tight ${on ? 'text-ink' : 'text-ink-2'}`}>
                    {t(`kdrama.genre.${g}.label`)}
                  </span>
                  <span className="block text-[12px] leading-snug text-ink-4">
                    {t(`kdrama.genre.${g}.tagline`)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
```

The start button now needs both:

```tsx
        <Button full className="mt-6" disabled={kdramaGenre === null || kdramaName.trim() === ''} onClick={() => setKdramaStep(1)}>
```

and the guard that sends an unequipped visitor back:

```tsx
  if (kdramaStep > 0 && (kdramaGenre === null || kdramaName.trim() === '')) {
    setKdramaStep(0);
    return null;
  }
```

**The scenes** resolve through `sceneAt`. Replace `const question = QUESTIONS[index];` with:

```tsx
    const scene = sceneAt(kdramaGenre, index, kdramaAnswers);
```

and the two copy lookups become `kdrama.${kdramaGenre}.q.${scene.id}.title` and `...options.${optionId}`, mapping over `scene.options` (an array of ids) instead of objects:

```tsx
          {scene.options.map((optionId, o) => {
```

**Delete the act-recap block entirely** — the `if (index % SCENES_PER_ACT === 0 && recap !== null && actSeen !== act)` branch, the `actSeen` state, the `recapKey` import and its `useState`. The branch scene is what that card was for.

**The poster** replaces the casting card. Inside `captureRef`, between the eyebrow and the meters:

```tsx
          <span className="eyebrow text-[8.5px] tracking-[0.26em] text-ink-4">
            {t(`kdrama.genre.${kdramaGenre}.label`)}
          </span>

          <OpticalText className="mt-3 block text-center font-disp text-[27px] leading-tight text-ink md:text-[31px]">
            {String(t(`kdrama.${kdramaGenre}.poster.${casting.typeKey}.title`)).replace('{name}', who)}
          </OpticalText>

          <span className="mt-2 text-[11.5px] leading-none text-ink-4">
            {t(`kdrama.genre.${kdramaGenre}.slot`)}
          </span>
```

`who` is `displayName(kdramaName, lang)`, which already exists — hoist it out of the question block so the card can use it too.

The type sentence below the meters becomes the logline:

```tsx
            {sentences(String(t(`kdrama.${kdramaGenre}.poster.${casting.typeKey}.logline`)).replace('{name}', who)).map((line) => (
```

Delete the `headline` construction and its three `t()` calls.

- [ ] **Step 9: The Korean copy for 재벌**

In `src/data/locales/ko/kdrama.json`, delete `role`, `temper`, `type`, `recap` and `headline`. Relabel the axes for a poster — 존재감 is a thing you say about a person, 긴장감 about a drama:

```json
"axis": { "romance": "로맨스", "presence": "긴장감", "warmth": "다정함", "mischief": "코미디" },
"genre": {
  "chaebol": { "label": "재벌 로맨스", "tagline": "회장님, 비서, 그리고 봉투", "slot": "16부작 · 수목 미니시리즈" }
}
```

Move the existing nine scenes under `chaebol.q` unchanged. Write the twelve branch scenes. The three at each position must read as *consequences* — the visitor arrives there because of how they played the act before:

```json
"overnight": { "title": "10시. 사무실에 둘만 남았습니다. \"{name} 씨, 아직 안 가요?\"",
  "options": {
    "nothing": "모니터만 보면서 안 간다고 한다",
    "coffee2": "커피 두 잔을 타 온다. 묻지도 않고",
    "blanket": "에어컨 세다고 겉옷을 걸쳐 준다",
    "playlist": "스피커를 켠다. 야근용 플레이리스트가 있다"
  } },
"hoesik": { "title": "회식 2차. 부장님이 마이크를 쥐여줍니다. \"{name} 씨, 한 곡 해야지.\"",
  "options": { "ballad": "발라드를 고르고, 한 사람 쪽은 안 본다", "stand": "일어나서 마이크를 받는다. 노래는 그다음 문제", "swap": "부장님 애창곡을 대신 넣어 드린다", "tambourine": "탬버린을 집어 든다. 노래는 안 한다" } }
```

Write `sickday`, `talent`, `mother`, `chairman`, `quitting`, `leak`, `snow`, `board`, `airport`, `press` the same way. `mother` and `snow` keep the text they already have; the other eight are new. Positions 3 and 6 carry `{name}` in all four of their variants; position 9 carries it in none.

Then the twelve posters. The title is where the visitor's name lives:

```json
"poster": {
  "firstLove_direct": {
    "title": "《{name}의 계약 연애》",
    "logline": "3개월만 버티면 되는 계약이었습니다. {name}은 계약서에 없던 걸 하나씩 하기 시작합니다."
  },
  "rival_careful": {
    "title": "《{name}은 이미 알고 있었다》",
    "logline": "아무하고도 싸우지 않습니다. 나중에 보면 {name} 말이 맞았을 뿐이고, 알았을 땐 이미 늦었습니다."
  }
}
```

Write all twelve: `lead`, `firstLove`, `spark`, `second`, `rival`, `bestie`, each `_direct` and `_careful`. A logline is one or two sentences and says what the drama is about, not what the visitor is like — that was the old card's job.

Update `sub`, `premise` and `name_hint` so they describe picking a drama rather than being cast in one.

- [ ] **Step 10: English, then vi and th**

Same keys in `src/data/locales/en/kdrama.json`, written for an English reader who may never have watched a Korean drama — the scene has to carry itself, and the Korean nouns that are the point stay in Hangul with the sentence teaching them. Then copy the English file verbatim over `vi/kdrama.json` and `th/kdrama.json`, as every locale file here has been since the syllable dictionary.

- [ ] **Step 11: Extend the locale assertions**

In `scripts/kdrama.check.ts`, replace the old `SHELL`/`TYPE_KEYS`/`q` loops with per-genre ones:

```ts
const TYPE_KEYS = ROLES.flatMap((role) => ['direct', 'careful'].map((t) => `${role}_${t}`));

for (const [lang, dict] of [['en', enK], ['ko', koK], ['vi', viK], ['th', thK]] as const) {
  const d = dict as Record<string, any>;
  for (const genre of GENRES) {
    const g = d[genre] ?? {};
    for (const key of ['label', 'tagline', 'slot']) {
      ok(`${lang}: genre.${genre}.${key}`,
        typeof d.genre?.[genre]?.[key] === 'string' && d.genre[genre][key].length > 0);
    }
    const story = STORIES[genre];
    for (let i = 0; i < 12; i += 1) {
      const telling = story.tellings[i];
      const variants = telling.branch ? Object.values(telling.scenes) : [telling.scene];
      for (const scene of variants) {
        const title = (g.q?.[scene.id]?.title ?? '') as string;
        ok(`${lang}: ${genre}.q.${scene.id}.title`, title.length > 0);
        for (const optionId of scene.options) {
          ok(`${lang}: ${genre}.q.${scene.id}.options.${optionId}`,
            typeof g.q?.[scene.id]?.options?.[optionId] === 'string'
            && g.q[scene.id].options[optionId].length > 0);
        }
        const carries = title.includes('{name}')
          || Object.values(g.q?.[scene.id]?.options ?? {}).some((o) => String(o).includes('{name}'));
        ok(`${lang}: ${genre}.q.${scene.id} carries {name} exactly when its position does`,
          carries === story.name.includes(i), { scene: scene.id, position: i, carries });
      }
    }
    for (const key of TYPE_KEYS) {
      const poster = g.poster?.[key] ?? {};
      ok(`${lang}: ${genre}.poster.${key}.title`,
        typeof poster.title === 'string' && poster.title.includes('{name}'), poster.title);
      ok(`${lang}: ${genre}.poster.${key}.logline`,
        typeof poster.logline === 'string' && poster.logline.length > 0);
    }
    ok(`${lang}: ${genre} posters read as twelve dramas`,
      new Set(TYPE_KEYS.map((k) => g.poster?.[k]?.title)).size === 12);
  }
  // the vocabulary is gone, not merely unused
  for (const key of ['role', 'temper', 'type', 'recap', 'headline']) {
    ok(`${lang}: kdrama.${key} is gone`, d[key] === undefined);
  }
}
```

- [ ] **Step 12: Run the check and the build**

Run: `npm run check && npm run build`

Expected: both pass.

`GENRES` holds **only `'chaebol'`** until Task 2, and each later task widens it by one. Every loop in the check and the picker reads `GENRES`, so a genre appears in the menu on exactly the commit that finishes it. Do not stub the other three from 재벌's content to get a green check: a placeholder genre is a genre a visitor can pick and be lied to by.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "Make the K-Drama room a drama you star in, starting with 재벌"
```

---

### Task 2: 막장

**Files:**
- Modify: `src/data/kdramaScenes.ts` (add `makjang` to `GENRES` and `STORIES`)
- Modify: `src/data/locales/{en,ko,vi,th}/kdrama.json`

**Interfaces:**
- Consumes: `Scene`, `Telling`, `Story` from Task 1. Produces no new types.

- [ ] **Step 1: Widen `GENRES` and watch the check fail**

Add `'makjang'` to `GENRES`. Run: `npm run check`

Expected: FAIL — `STORIES.makjang` is undefined, then once it exists, every locale key is missing.

- [ ] **Step 2: Write the twenty-one scenes**

막장 is the most recognisable thing in the genre and the whole reason it is in: 출생의 비밀, 기억상실, 친자 확인, 김치 싸대기, 유산, 쌍둥이, 교통사고. The furniture, position by position — nine fixed and three branching, `name: [0, 2, 3, 6, 8, 11]` as in 재벌:

| # | id | beat |
|---|---|---|
| 0 | `wedding` | 결혼식장. 신부 측 하객석에 당신 자리가 있습니다 |
| 1 | `slap` | 김치 싸대기. 맞은 건 당신이 아니었습니다 |
| 2 | `photo2` | 오래된 사진 한 장이 당신 얼굴과 너무 닮았습니다 |
| 3 | branch | romance `hospital2` · presence `will` · warmth `orphan` · mischief `twin` |
| 4 | `dna` | 친자 확인 결과가 봉투째 도착했습니다 |
| 5 | `stepmother` | 새어머니가 당신 방을 정리해 뒀습니다 |
| 6 | branch | romance `amnesia` · presence `boardroom` · warmth `deathbed` · mischief `swap2` |
| 7 | `crash` | 빗길, 브레이크, 그리고 전화 한 통 |
| 8 | `secret2` | 어머니가 20년 동안 말하지 않은 게 있습니다 |
| 9 | branch | romance `rain` · presence `funeral` · warmth `reunion2` · mischief `trial` |
| 10 | `confront` | 다 모인 자리에서 당신이 입을 엽니다 |
| 11 | `forgive` | 손을 잡을지 말지, 그것만 남았습니다 |

Give every scene four options in the option order the axes fix — option 1 leans `romance`, 2 `presence`, 3 `warmth`, 4 `mischief` — and look up each position's tempers in `SLOTS` before writing, because `+1` is 직진 and `-1` is 신중 and an option has to be a thing a person would actually do that fits both.

- [ ] **Step 3: Write the twelve posters**

막장 titles are declarative and a little too much on purpose — 《{name}, 그 여자의 아들》, 《{name}은 두 번 태어났다》. Every title carries `{name}`.

Slot line: `"100부작 · 일일 아침드라마"`.

- [ ] **Step 4: English, then vi and th**

As in Task 1 Step 10.

- [ ] **Step 5: Run the check and the build, then commit**

Run: `npm run check && npm run build`

```bash
git add -A
git commit -m "Add the 막장 drama"
```

---

### Task 3: 하이틴

**Files:** as Task 2, for `highteen`.

- [ ] **Step 1: Widen `GENRES`, watch the check fail**

Run: `npm run check` — FAIL on `STORIES.highteen`.

- [ ] **Step 2: Write the twenty-one scenes**

교복, 야자, 급식, 옥상, 체육대회, 수학여행, 수능, 졸업식. A different world from the office, which is the point of having it. Same shape: nine fixed, branches at 3, 6, 9, `name: [0, 2, 3, 6, 8, 11]`.

| # | id | beat |
|---|---|---|
| 0 | `roll` | 전학 첫날. 선생님이 출석을 부릅니다 |
| 1 | `seat` | 자리 바꾸기. 제비를 뽑았습니다 |
| 2 | `lunch` | 급식 줄. 뒤에서 누가 당신 이름을 부릅니다 |
| 3 | branch | romance `latenight` 야자 끝나고 · presence `sports` 체육대회 계주 · warmth `notes` 필기 빌려주기 · mischief `caught` 매점 탈출하다 걸림 |
| 4 | `rooftop2` | 옥상. 아무한테도 말 안 한 얘기가 나옵니다 |
| 5 | `transfer` | 그 애가 유학 간다는 소문이 돕니다 |
| 6 | branch | romance `trip` 수학여행 밤 · presence `class` 반장 선거 · warmth `sick2` 보건실 · mischief `letter3` 사물함의 편지 |
| 7 | `exam` | 수능 D-30. 독서실 옆자리가 비었습니다 |
| 8 | `fight` | 오해가 쌓였고, 둘 다 사과를 안 했습니다 |
| 9 | branch | romance `snow2` 첫눈 · presence `result` 성적표 · warmth `bench` 운동장 벤치 · mischief `prank` 마지막 장난 |
| 10 | `graduation` | 졸업식. 교복에 이름을 적어 줍니다 |
| 11 | `after` | 교문 밖. 여기서 헤어지면 다음은 없습니다 |

- [ ] **Step 3: Write the twelve posters**

Slot line: `"12부작 · 금토드라마"`. Titles in the register a teen drama uses — 《{name}의 3학년》, 《{name}, 그해 첫눈》.

- [ ] **Step 4: English, then vi and th** — as before.

- [ ] **Step 5: Run the check and the build, then commit**

```bash
git add -A
git commit -m "Add the 하이틴 drama"
```

---

### Task 4: 아이돌

**Files:** as Task 2, for `idol`.

- [ ] **Step 1: Widen `GENRES`, watch the check fail**

- [ ] **Step 2: Write the twenty-one scenes**

연습생, 데뷔조, 숙소, 음방 1위, 열애설, 소속사, 팬사인회, 컴백, 계약 만료. Same shape and the same `name` positions.

| # | id | beat |
|---|---|---|
| 0 | `trainee` | 연습실 거울 앞. 오늘부터 같은 팀입니다 |
| 1 | `monthly` | 월말 평가. 순위가 벽에 붙습니다 |
| 2 | `bunk` | 숙소 2층 침대. 새벽 3시에 아무도 안 잡니다 |
| 3 | branch | romance `practice` 둘만 남은 연습실 · presence `center` 센터 자리 · warmth `cover` 대신 혼나기 · mischief `vlive` 라이브 켠 채로 |
| 4 | `debut` | 데뷔조 명단이 나왔습니다 |
| 5 | `sunbae` | 선배 그룹이 당신을 눈여겨봅니다 |
| 6 | branch | romance `dating` 열애설 · presence `first` 음방 1위 · warmth `injury` 부상 · mischief `edit` 잘린 영상이 돕니다 |
| 7 | `hiatus` | 활동 중단 공지가 올라갑니다 |
| 8 | `renew` | 재계약 서류가 책상에 있습니다 |
| 9 | branch | romance `fansign` 팬사인회 · presence `award` 연말 시상식 · warmth `letter4` 팬레터 · mischief `leak2` 미공개 음원 유출 |
| 10 | `comeback` | 컴백 쇼케이스. 첫 소절이 당신 파트입니다 |
| 11 | `encore` | 앵콜 무대. 마지막일 수도 있습니다 |

- [ ] **Step 3: Write the twelve posters**

Slot line: `"16부작 · 월화드라마"`. Titles like 《{name}, 데뷔조》, 《{name}의 마지막 앵콜》.

- [ ] **Step 4: English, then vi and th** — as before.

- [ ] **Step 5: Run the check and the build, then commit**

```bash
git add -A
git commit -m "Add the 아이돌 drama"
```

---

## Browser verification (mine, after each task)

Not the implementer's — run these against the live preview before reporting a genre done.

1. `/ko/kdrama` — the start button is disabled until both a genre and a name are given.
2. Pick the genre, type `Sarah`, and walk twelve scenes: **no scene anywhere renders a literal `{name}`**, and exactly six say `사라`.
   `[...document.querySelectorAll('h2 span, button[aria-pressed] span')].filter(e => e.textContent.includes('{name}'))` must be empty at every step.
3. The branch fires: play 기 all-warmth and note which scene opens 승; restart, play 기 all-mischief, and confirm a different one.
4. All four axes are reachable at each branch — play each act four ways and collect the four scene ids at positions 3, 6 and 9.
5. The poster shows the genre label, a title containing the visitor's name, the slot line, four meters and a logline — **and no role or temper word anywhere.**
6. `/en/kdrama` with `Sarah` shows `Sarah`, not `사라`.
7. `npm run check` reports the same type spread it did before Task 1. If it moved, a number was retyped.

## Deliberately not built

- **Per-genre engines.** One arithmetic, four stories.
- **Branching that compounds.** A fork reads only the act just finished, so the writing is 3 × 4 and not 4³.
- **The branch on the poster.** Title and logline are genre × type; adding the branch would be 192 posters per language.
- **Showing the role.** It is the index, not the answer.
- **A fifth genre.** 액션 and 사극 stay on the shelf until these four are done.
- **vi/th translations.** Placeholder English, as everywhere else on the site.
