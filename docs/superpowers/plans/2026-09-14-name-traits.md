# Name Traits Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Score a Korean given name on five axes computed from its jamo, show that reading in a new room at `/{lang}/impression`, and label the existing 이름궁합 card with the same numbers.

**Architecture:** One pure function, `readName(hangul) → Reading`, is the whole engine. Four of its five axes come from decomposing each syllable into 초성/중성/종성 and scoring class membership; the fifth reads a frequency band off a sixty-syllable dictionary. Two screens consume it — a new `ImpressionScreen` and a two-line addition to `PairScreen` — both reusing the capture-card shell, `useImageShare` and `hangulFor()` that the pair room already established.

**Tech Stack:** React 19, TypeScript, Zustand, Tailwind 3, Vite 8. No test framework: checks are plain-TS scripts bundled by rolldown and run through `npm run check`.

**Spec:** [`docs/superpowers/specs/2026-09-14-name-traits-design.md`](../specs/2026-09-14-name-traits-design.md)

## Global Constraints

- **No randomness anywhere.** Every function in this plan is pure and deterministic on its inputs. A shared card has to reproduce. `Math.random`, `Date.now` and any hash-of-time are forbidden in all files this plan touches.
- **No new dependencies.** Everything here is plain TypeScript plus what `package.json` already has.
- **Verification is `npm run check` and `npm run build`.** There is no test runner. New assertions go into `scripts/*.check.ts` using the `ok(label, condition, detail?)` helper the three existing check scripts already use, and the script is registered in the array in `scripts/check.mjs`.
- **Every check script ends the same way** — the `failures > 0 → process.exit(1)` block, then one `console.log('...checks passed')`. Copy that shape exactly.
- **Locale keys ship in all four languages** (`ko`, `en`, `vi`, `th`). `useTranslation` falls back to English, but a missing key is still a check failure. Write `en` and `ko` properly; `vi` and `th` may start as the English string and are flagged for native review.
- **Scores are integers 0–100.** Rounding happens once, after averaging and after name-level terms.
- **Canonical axis order is `friendly, refined, cute, calm, uncommon`.** Blend keys sort the two axes into this order, so the key is always `friendly_cute`, never `cute_friendly`.
- **Follow the house comment voice.** Existing files explain *why* a decision was made, in prose, where it is surprising. Do not add comments that restate the code.

## File Structure

| File | Responsibility |
|---|---|
| `src/utils/strokes.ts` *(modify)* | Gains an exported `decompose()`. Keeps its stroke tables and now calls it. |
| `src/data/syllableDatabase.ts` *(new)* | 61 syllables, each with a frequency band and an era. No scores, no copy. |
| `src/data/locales/{ko,en,vi,th}/syllables.json` *(new)* | One sentence per syllable, keyed by roman. |
| `src/hooks/useTranslation.ts` *(modify)* | Loads `syllables` alongside `names` and `surnames`. |
| `src/utils/nameTraits.ts` *(new)* | Jamo class tables, the five formulas, the surname split. Exports `readName`. |
| `src/components/TraitMeter.tsx` *(new)* | Five dots for one 0–100 score. Nothing else. |
| `src/steps/ImpressionScreen.tsx` *(new)* | The new room. Input, card, save/share. |
| `src/store/useFlowStore.ts` *(modify)* | Third `Tool`, generalised path regex, `impressionName`. |
| `src/App.tsx` *(modify)* | Routes the third room. |
| `src/components/layout/Header.tsx` *(modify)* | Third nav tab. |
| `src/utils/pairLabel.ts` *(new)* | Averages two readings into one blend key and two emoji. |
| `src/steps/PairScreen.tsx` *(modify)* | Draws the label inside the capture card. |
| `src/data/locales/*/common.json` *(modify)* | `impression.*` and `pair.blend.*`. |
| `scripts/traits.check.ts` *(new)* | Every assertion in the spec's Component 6. |
| `scripts/check.mjs` *(modify)* | Registers the new check script. |

`decompose()` lives in `strokes.ts` rather than a new `jamo.ts` because it is eight lines and `strokes.ts` is its only other caller. The jamo *class* tables (`SONORANT`, `BRIGHT`, …) live in `nameTraits.ts`, which is their only consumer.

---

### Task 1: Extract jamo decomposition

`strokes.ts` already does the index arithmetic inline inside `strokesOfSyllable`. Pull it out so `nameTraits.ts` can use the same code rather than a second copy that drifts.

**Files:**
- Modify: `src/utils/strokes.ts:28-38`
- Test: `scripts/pair.check.ts` (existing stroke assertions are the regression guard)

**Interfaces:**
- Consumes: nothing.
- Produces: `export function decompose(char: string): { cho: number; jung: number; jong: number } | null` from `src/utils/strokes.ts`. Returns jamo **indices**, not characters. `null` when `char` is not a precomposed Hangul syllable block.

- [ ] **Step 1: Confirm the existing stroke checks pass before touching anything**

Run: `npm run check`
Expected: PASS — three lines ending `all name-match checks passed`. If this already fails, stop and report; the refactor needs a green baseline.

- [ ] **Step 2: Add the failing assertion for the new export**

Append to `scripts/pair.check.ts`, immediately after the stroke-count block that ends with the `strokesOf('Anna 안나')` line:

```ts
// --- jamo decomposition, shared with the traits scorer ---------------------
// nameTraits.ts reads the same indices these tables are indexed by, so this is
// the one place the arithmetic is allowed to live.

ok('김 decomposes to ㄱ / ㅣ / ㅁ', JSON.stringify(decompose('김')) === JSON.stringify({ cho: 0, jung: 20, jong: 16 }), decompose('김'));
ok('하 has no final consonant', decompose('하')?.jong === 0, decompose('하'));
ok('뷁 is still a syllable block', decompose('뷁') !== null);
ok('a Latin letter does not decompose', decompose('A') === null);
ok('a bare jamo does not decompose', decompose('ㄱ') === null);
ok('an empty string does not decompose', decompose('') === null);
```

And extend the import at the top of the same file:

```ts
import { decompose, strokesOf, strokesOfSyllable } from '../src/utils/strokes';
```

- [ ] **Step 3: Run the check to verify it fails**

Run: `npm run check`
Expected: FAIL. rolldown reports that `decompose` is not exported by `src/utils/strokes.ts`.

- [ ] **Step 4: Extract the helper**

In `src/utils/strokes.ts`, replace the body of `strokesOfSyllable` and add the export above it:

```ts
/**
 * The three jamo of a Hangul syllable block, as indices into CHO / JUNG / JONG.
 *
 * Indices rather than characters, because every table that reads them — stroke
 * counts here, sound classes in nameTraits — is a flat array in the same order.
 */
export function decompose(char: string): { cho: number; jung: number; jong: number } | null {
  const code = char.codePointAt(0);
  if (code === undefined || code < BASE || code > LAST) return null;
  const offset = code - BASE;
  return {
    cho: Math.floor(offset / 588),
    jung: Math.floor(offset / 28) % 21,
    jong: offset % 28,
  };
}

/** Strokes in one Hangul syllable block, or null if it is not one. */
export function strokesOfSyllable(char: string): number | null {
  const jamo = decompose(char);
  if (jamo === null) return null;
  return CHO[jamo.cho] + JUNG[jamo.jung] + JONG[jamo.jong];
}
```

- [ ] **Step 5: Run the check to verify it passes**

Run: `npm run check`
Expected: PASS. The pre-existing stroke assertions (김 is 5, 박 is 7, …) must still pass — they are the proof the refactor changed nothing.

- [ ] **Step 6: Build**

Run: `npm run build`
Expected: PASS, no TypeScript errors.

- [ ] **Step 7: Commit**

```bash
git add src/utils/strokes.ts scripts/pair.check.ts
git commit -m "Extract jamo decomposition from the stroke counter"
```

---

### Task 2: The syllable dictionary

**Files:**
- Create: `src/data/syllableDatabase.ts`
- Create: `src/data/locales/en/syllables.json`, `.../ko/syllables.json`, `.../vi/syllables.json`, `.../th/syllables.json`
- Modify: `src/hooks/useTranslation.ts`
- Create: `scripts/traits.check.ts`
- Modify: `scripts/check.mjs:5`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `export type Freq = 'very-common' | 'common' | 'uncommon'`
  - `export type Era = 'modern' | 'timeless' | 'classic'`
  - `export interface SyllableItem { syllable: string; roman: string; freq: Freq; era: Era }`
  - `export const SYLLABLE_DATABASE: SyllableItem[]` — 61 entries
  - `export function syllableInfo(char: string): SyllableItem | null` — exact match on `syllable`
  - `t('syllables.<roman>')` resolves to one sentence.

- [ ] **Step 1: Write the failing check script**

Create `scripts/traits.check.ts`:

```ts
// Runnable check for the name-traits layer: the syllable dictionary, the five
// axes, and the blend copy both rooms draw their sentences from.
// Run with: npm run check
import { SYLLABLE_DATABASE, syllableInfo } from '../src/data/syllableDatabase';
import { decompose } from '../src/utils/strokes';
import enSyl from '../src/data/locales/en/syllables.json';
import koSyl from '../src/data/locales/ko/syllables.json';
import viSyl from '../src/data/locales/vi/syllables.json';
import thSyl from '../src/data/locales/th/syllables.json';

let failures = 0;
function ok(label: string, condition: boolean, detail?: unknown) {
  if (condition) return;
  failures += 1;
  console.error(`  FAIL  ${label}${detail === undefined ? '' : ` — ${JSON.stringify(detail)}`}`);
}

// --- the dictionary -------------------------------------------------------

const COUNT = 61;
ok('sixty-one syllables', SYLLABLE_DATABASE.length === COUNT, SYLLABLE_DATABASE.length);
ok('roman keys are unique', new Set(SYLLABLE_DATABASE.map((s) => s.roman)).size === COUNT);
ok('syllables are unique', new Set(SYLLABLE_DATABASE.map((s) => s.syllable)).size === COUNT);
ok('every entry is one Hangul block',
  SYLLABLE_DATABASE.every((s) => [...s.syllable].length === 1 && decompose(s.syllable) !== null));
ok('every freq is a known band',
  SYLLABLE_DATABASE.every((s) => ['very-common', 'common', 'uncommon'].includes(s.freq)));
ok('every era is a known era',
  SYLLABLE_DATABASE.every((s) => ['modern', 'timeless', 'classic'].includes(s.era)));

ok('a known syllable is found', syllableInfo('준')?.roman === 'jun', syllableInfo('준'));
ok('an unknown syllable is not', syllableInfo('뷁') === null);
ok('a non-syllable is not', syllableInfo('A') === null);

// --- the copy -------------------------------------------------------------
// vi and th may still be carrying the English line; they must not be missing.

for (const [lang, dict] of [['en', enSyl], ['ko', koSyl], ['vi', viSyl], ['th', thSyl]] as const) {
  for (const item of SYLLABLE_DATABASE) {
    const line = (dict as Record<string, string>)[item.roman];
    ok(`${lang}: ${item.roman} has a line`, typeof line === 'string' && line.length > 0);
  }
  ok(`${lang}: no orphan lines`,
    Object.keys(dict).every((k) => SYLLABLE_DATABASE.some((s) => s.roman === k)),
    Object.keys(dict).filter((k) => !SYLLABLE_DATABASE.some((s) => s.roman === k)));
}

// --- report ---------------------------------------------------------------

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log('all name-traits checks passed');
```

- [ ] **Step 2: Register the script**

In `scripts/check.mjs`, extend the array on line 5:

```js
for (const input of ['scripts/matcher.check.ts', 'scripts/surname.check.ts', 'scripts/pair.check.ts', 'scripts/traits.check.ts']) {
```

- [ ] **Step 3: Run the check to verify it fails**

Run: `npm run check`
Expected: FAIL. rolldown cannot resolve `../src/data/syllableDatabase`.

- [ ] **Step 4: Write the dictionary**

Create `src/data/syllableDatabase.ts`. These sixty rows are the data verbatim — do not substitute your own:

```ts
/**
 * The syllables that actually turn up in Korean given names, with how often and
 * from when.
 *
 * Two fields, each with one job. `freq` is how much of a name's familiarity it
 * carries; `era` is whether it sounds like this decade or a grandparent's. The
 * scorer in nameTraits.ts reads both. Neither is a score — sixty rows times five
 * axes of hand-tuned numbers would stop agreeing with each other somewhere
 * around the fiftieth row, so the formulas derive the axes and this table only
 * says what it knows.
 *
 * The bands are judgement, not census data: they come from what contemporary
 * Korean given names are actually built out of. They are one word per row on
 * purpose, so a wrong call is a one-word fix.
 */

export type Freq = 'very-common' | 'common' | 'uncommon';
export type Era = 'modern' | 'timeless' | 'classic';

export interface SyllableItem {
  /** one Hangul syllable block */
  syllable: string;
  /** the key the locale files use */
  roman: string;
  freq: Freq;
  era: Era;
}

export const SYLLABLE_DATABASE: SyllableItem[] = [
  // the twenty that carry the 2010s and 2020s
  { syllable: '서', roman: 'seo',    freq: 'very-common', era: 'modern' },
  { syllable: '준', roman: 'jun',    freq: 'very-common', era: 'modern' },
  { syllable: '지', roman: 'ji',     freq: 'very-common', era: 'modern' },
  { syllable: '우', roman: 'u',      freq: 'very-common', era: 'modern' },
  { syllable: '하', roman: 'ha',     freq: 'very-common', era: 'modern' },
  { syllable: '윤', roman: 'yun',    freq: 'very-common', era: 'modern' },
  { syllable: '은', roman: 'eun',    freq: 'very-common', era: 'modern' },
  { syllable: '민', roman: 'min',    freq: 'very-common', era: 'modern' },
  { syllable: '예', roman: 'ye',     freq: 'very-common', era: 'modern' },
  { syllable: '유', roman: 'yu',     freq: 'very-common', era: 'modern' },
  { syllable: '아', roman: 'a',      freq: 'very-common', era: 'modern' },
  { syllable: '도', roman: 'do',     freq: 'very-common', era: 'modern' },
  { syllable: '시', roman: 'si',     freq: 'very-common', era: 'modern' },
  { syllable: '현', roman: 'hyeon',  freq: 'very-common', era: 'modern' },
  { syllable: '주', roman: 'ju',     freq: 'very-common', era: 'modern' },
  { syllable: '연', roman: 'yeon',   freq: 'very-common', era: 'modern' },
  { syllable: '재', roman: 'jae',    freq: 'very-common', era: 'modern' },
  { syllable: '채', roman: 'chae',   freq: 'very-common', era: 'modern' },
  { syllable: '다', roman: 'da',     freq: 'very-common', era: 'modern' },
  { syllable: '율', roman: 'yul',    freq: 'very-common', era: 'modern' },

  // recent, but not yet everywhere
  { syllable: '온', roman: 'on',     freq: 'common',   era: 'modern' },
  { syllable: '린', roman: 'rin',    freq: 'common',   era: 'modern' },
  { syllable: '후', roman: 'hu',     freq: 'common',   era: 'modern' },
  { syllable: '결', roman: 'gyeol',  freq: 'uncommon', era: 'modern' },
  { syllable: '겸', roman: 'gyeom',  freq: 'uncommon', era: 'modern' },
  { syllable: '솔', roman: 'sol',    freq: 'uncommon', era: 'modern' },

  // names have been built from these for as long as anyone remembers
  { syllable: '수', roman: 'su',     freq: 'common', era: 'timeless' },
  { syllable: '진', roman: 'jin',    freq: 'common', era: 'timeless' },
  { syllable: '호', roman: 'ho',     freq: 'common', era: 'timeless' },
  { syllable: '영', roman: 'yeong',  freq: 'common', era: 'timeless' },
  { syllable: '성', roman: 'seong',  freq: 'common', era: 'timeless' },
  { syllable: '승', roman: 'seung',  freq: 'common', era: 'timeless' },
  { syllable: '원', roman: 'won',    freq: 'common', era: 'timeless' },
  { syllable: '태', roman: 'tae',    freq: 'common', era: 'timeless' },
  { syllable: '소', roman: 'so',     freq: 'common', era: 'timeless' },
  { syllable: '미', roman: 'mi',     freq: 'common', era: 'timeless' },
  { syllable: '나', roman: 'na',     freq: 'common', era: 'timeless' },
  { syllable: '라', roman: 'ra',     freq: 'common', era: 'timeless' },
  { syllable: '인', roman: 'in',     freq: 'common', era: 'timeless' },
  { syllable: '경', roman: 'gyeong', freq: 'common', era: 'timeless' },
  { syllable: '규', roman: 'gyu',    freq: 'common', era: 'timeless' },
  { syllable: '건', roman: 'geon',   freq: 'common', era: 'timeless' },
  { syllable: '기', roman: 'gi',     freq: 'common', era: 'timeless' },
  { syllable: '강', roman: 'gang',   freq: 'common', era: 'timeless' },
  { syllable: '이', roman: 'i',      freq: 'common', era: 'timeless' },
  { syllable: '안', roman: 'an',     freq: 'uncommon', era: 'timeless' },

  // still heard, but they date a person
  { syllable: '정', roman: 'jeong',  freq: 'common', era: 'classic' },
  { syllable: '희', roman: 'hui',    freq: 'common', era: 'classic' },
  { syllable: '명', roman: 'myeong', freq: 'common', era: 'classic' },
  { syllable: '광', roman: 'gwang',  freq: 'common', era: 'classic' },
  { syllable: '상', roman: 'sang',   freq: 'common', era: 'classic' },

  // a grandparent's generation
  { syllable: '철', roman: 'cheol',  freq: 'uncommon', era: 'classic' },
  { syllable: '순', roman: 'sun',    freq: 'uncommon', era: 'classic' },
  { syllable: '자', roman: 'ja',     freq: 'uncommon', era: 'classic' },
  { syllable: '숙', roman: 'suk',    freq: 'uncommon', era: 'classic' },
  { syllable: '옥', roman: 'ok',     freq: 'uncommon', era: 'classic' },
  { syllable: '복', roman: 'bok',    freq: 'uncommon', era: 'classic' },
  { syllable: '덕', roman: 'deok',   freq: 'uncommon', era: 'classic' },
  { syllable: '길', roman: 'gil',    freq: 'uncommon', era: 'classic' },
  { syllable: '만', roman: 'man',    freq: 'uncommon', era: 'classic' },
  { syllable: '병', roman: 'byeong', freq: 'uncommon', era: 'classic' },
];

const BY_SYLLABLE = new Map(SYLLABLE_DATABASE.map((s) => [s.syllable, s]));

/** What the dictionary knows about one syllable, or null if it is not in it. */
export function syllableInfo(char: string): SyllableItem | null {
  return BY_SYLLABLE.get(char) ?? null;
}
```

- [ ] **Step 5: Write the English copy**

Create `src/data/locales/en/syllables.json` with **one entry per `roman` key above — all 61, none skipped.** The check in Step 1 fails on any missing key, so this is enumerable and verifiable, not open-ended.

Voice: one sentence, present tense, addressed to someone who does not read Korean. Say what a Korean hearer notices — where the syllable sits in a name, what generation it suggests, what it evokes. Never state the hanja meaning as *the* meaning; the same sound carries many characters, and the site does not know which one a stranger's name uses.

Four lines, as the pattern to follow:

```json
{
  "jun": "Ends a boy's name more often than any other syllable — plain, solid, and impossible to mistake for anything fussy.",
  "seo": "The opening syllable of the 2010s. Soft on the ear and everywhere on a Korean school register right now.",
  "ja": "Closed thousands of women's names a few generations ago and almost none since; to a Korean ear it places someone in their seventies.",
  "cheol": "Iron, and it sounds it — a blunt, unfashionable syllable that reads as somebody's father rather than somebody's classmate."
}
```

- [ ] **Step 6: Write the Korean copy**

Create `src/data/locales/ko/syllables.json`, same 61 keys. Written for a Korean reader, so it can be shorter and more direct than the English — do not translate the English word for word.

```json
{
  "jun": "남자 이름 끝에 가장 흔히 오는 글자. 군더더기 없고 단단합니다.",
  "seo": "2010년대를 연 글자. 부드럽고, 지금 초등학교 명렬표에 가장 많습니다.",
  "ja": "몇 세대 전 여자 이름을 끝맺던 글자. 지금은 거의 쓰이지 않습니다.",
  "cheol": "쇠 철. 소리부터 단단하고, 요즘 이름보다는 아버지 세대에 가깝습니다."
}
```

- [ ] **Step 7: Seed the Vietnamese and Thai copy**

Create `src/data/locales/vi/syllables.json` and `.../th/syllables.json` as **exact copies of the English file**. `useTranslation` would fall back to English anyway, but a real key means the check tells the truth about coverage and a translator has a file to work in.

Add this line to the plan's handoff notes, and to the PR description when this ships: *vi/th syllable copy is English placeholder, pending native review.*

- [ ] **Step 8: Wire the dictionary into `useTranslation`**

In `src/hooks/useTranslation.ts`, add four imports beside the surname ones, extend `TranslationData`, and add the key to all four bundles:

```ts
import koSyllables from '../data/locales/ko/syllables.json';
import enSyllables from '../data/locales/en/syllables.json';
import viSyllables from '../data/locales/vi/syllables.json';
import thSyllables from '../data/locales/th/syllables.json';

type TranslationData = typeof koCommon & {
  names: typeof koNames;
  surnames: typeof koSurnames;
  syllables: typeof koSyllables;
};

const translations: Record<Language, TranslationData> = {
  ko: { ...koCommon, names: koNames, surnames: koSurnames, syllables: koSyllables } as TranslationData,
  en: { ...enCommon, names: enNames, surnames: enSurnames, syllables: enSyllables } as unknown as TranslationData,
  vi: { ...viCommon, names: viNames, surnames: viSurnames, syllables: viSyllables } as unknown as TranslationData,
  th: { ...thCommon, names: thNames, surnames: thSurnames, syllables: thSyllables } as unknown as TranslationData,
};
```

- [ ] **Step 9: Run the check to verify it passes**

Run: `npm run check`
Expected: PASS, with a fourth line `all name-traits checks passed`.

- [ ] **Step 10: Build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 11: Commit**

```bash
git add src/data/syllableDatabase.ts src/data/locales/*/syllables.json src/hooks/useTranslation.ts scripts/traits.check.ts scripts/check.mjs
git commit -m "Add the syllable dictionary behind the name reading"
```

---

### Task 3: The scorer

**Files:**
- Create: `src/utils/nameTraits.ts`
- Modify: `scripts/traits.check.ts` (append a scorer section before the report block)

**Interfaces:**
- Consumes: `decompose` from `src/utils/strokes.ts`; `SYLLABLE_DATABASE`, `syllableInfo`, `Freq`, `Era` from `src/data/syllableDatabase.ts`; `SURNAME_DATABASE` from `src/data/surnameDatabase.ts`.
- Produces:
  - `export type Axis = 'friendly' | 'refined' | 'cute' | 'calm' | 'uncommon'`
  - `export const AXES = ['friendly', 'refined', 'cute', 'calm', 'uncommon'] as const` — a readonly tuple, not `Axis[]`, so `blendKey` can index it
  - `export type Traits = Record<Axis, number>`
  - `export interface Reading { surnameId: string | null; given: string; traits: Traits; top: [Axis, Axis]; known: SyllableItem[] }`
  - `export function readName(hangul: string): Reading | null`
  - `export function blendKey(a: Axis, b: Axis): string` — the two axes in `AXES` order, joined with `_`

- [ ] **Step 1: Write the failing assertions**

Insert into `scripts/traits.check.ts`, **before** the `// --- report ---` block, and extend the imports at the top of the file with `import { AXES, blendKey, readName } from '../src/utils/nameTraits';`:

```ts
// --- the surname split ----------------------------------------------------
// 하, 서, 민, 도, 강 and 문 are family names AND ordinary given-name syllables.
// Splitting on "is the first syllable a surname" alone would read 하준 as
// 하 씨 준 — so the split needs three syllables, not two.

ok('김하준 gives up its family name', readName('김하준')?.surnameId === 'kim', readName('김하준')?.surnameId);
ok('김하준 is scored on 하준', readName('김하준')?.given === '하준', readName('김하준')?.given);
for (const name of ['하준', '서연', '민서', '도윤', '강민', '문수']) {
  ok(`${name} keeps all its syllables`, readName(name)?.surnameId === null, readName(name)?.surnameId);
  ok(`${name} is scored whole`, readName(name)?.given === name, readName(name)?.given);
}
ok('a surname alone is a given name', readName('김')?.given === '김', readName('김')?.given);
ok('the family name does not change the reading',
  JSON.stringify(readName('김하준')?.traits) === JSON.stringify(readName('하준')?.traits));

// --- shape ----------------------------------------------------------------

const sample = ['하준', '서연', '민서', '도윤', '김철수', '박순자', '뚜껑', 'Anna'];
for (const name of sample) {
  const reading = readName(name);
  if (name === 'Anna') { ok('a Latin name reads as nothing', reading === null, reading); continue; }
  ok(`${name} reads`, reading !== null);
  for (const axis of AXES) {
    const score = reading!.traits[axis];
    ok(`${name}.${axis} is an integer 0–100`,
      Number.isInteger(score) && score >= 0 && score <= 100, score);
  }
  ok(`${name} names two distinct top axes`,
    reading!.top.length === 2 && reading!.top[0] !== reading!.top[1], reading!.top);
}

ok('blank input reads as nothing', readName('   ') === null);
ok('the reading is stable', JSON.stringify(readName('하준')) === JSON.stringify(readName('하준')));

// --- the axes say something ------------------------------------------------
// Not exact numbers — those are a tuning and will move. These are the
// orderings that would mean the formulas had stopped working.

ok('서연 is refined', (readName('서연')?.traits.refined ?? 0) >= 60, readName('서연')?.traits.refined);
ok('뚜껑 is less refined than 서연',
  (readName('뚜껑')?.traits.refined ?? 100) < (readName('서연')?.traits.refined ?? 0),
  [readName('뚜껑')?.traits.refined, readName('서연')?.traits.refined]);
ok('a name of nothing but invented syllables is uncommon',
  (readName('뷁쒉')?.traits.uncommon ?? 0) >= 80, readName('뷁쒉')?.traits.uncommon);
ok('하준 is not uncommon', (readName('하준')?.traits.uncommon ?? 100) <= 20, readName('하준')?.traits.uncommon);
ok('half-invented lands between the bands',
  (readName('하뷁')?.traits.uncommon ?? 0) > 20 && (readName('하뷁')?.traits.uncommon ?? 0) < 80,
  readName('하뷁')?.traits.uncommon);
ok('철수 is more classic than 서연 on uncommon',
  (readName('철수')?.traits.uncommon ?? 0) > (readName('서연')?.traits.uncommon ?? 0),
  [readName('철수')?.traits.uncommon, readName('서연')?.traits.uncommon]);
ok('every dictionary syllable scores without throwing',
  SYLLABLE_DATABASE.every((s) => readName(s.syllable + s.syllable) !== null));

// --- blend keys ------------------------------------------------------------

ok('a blend key is canonical whichever way round it is given',
  blendKey('cute', 'friendly') === blendKey('friendly', 'cute'));
ok('a blend key uses AXES order', blendKey('cute', 'friendly') === 'friendly_cute', blendKey('cute', 'friendly'));
ok('there are ten distinct pairs',
  new Set(AXES.flatMap((a) => AXES.filter((b) => b !== a).map((b) => blendKey(a, b)))).size === 10);
```

- [ ] **Step 2: Run the check to verify it fails**

Run: `npm run check`
Expected: FAIL. rolldown cannot resolve `../src/utils/nameTraits`.

- [ ] **Step 3: Write the scorer**

Create `src/utils/nameTraits.ts`:

```ts
import { decompose } from './strokes';
import { SURNAME_DATABASE } from '../data/surnameDatabase';
import { syllableInfo, type Era, type Freq, type SyllableItem } from '../data/syllableDatabase';

/**
 * What a Korean name sounds like to someone who grew up hearing them.
 *
 * Four of the five axes are computed from the jamo, not looked up. That is the
 * point: this site already draws the whole stroke-count fold on the match card
 * so a visitor can see where the number came from, and a star rating pulled out
 * of a hash would have nothing to show and nothing to answer with. Only
 * `uncommon` needs data, because how often a syllable is used is not something
 * the letters can tell you.
 *
 * The weights below are a first tuning. They are meant to be moved; the check
 * script asserts orderings rather than numbers so that moving them is cheap.
 */

export type Axis = 'friendly' | 'refined' | 'cute' | 'calm' | 'uncommon';

/** Canonical order. Blend keys sort into it, so `friendly_cute` is the only spelling. */
export const AXES = ['friendly', 'refined', 'cute', 'calm', 'uncommon'] as const;

export type Traits = Record<Axis, number>;

export interface Reading {
  /** the family name split off the front, if there was one */
  surnameId: string | null;
  /** the syllables actually scored */
  given: string;
  traits: Traits;
  /** the two highest axes, highest first; ties break in AXES order */
  top: [Axis, Axis];
  /** dictionary hits among the given name's syllables, in order */
  known: SyllableItem[];
}

// Jamo classes, as index sets into the CHO / JUNG / JONG orders in strokes.ts.
//
// PLAIN and SIBILANT overlap on ㅅ and ㅈ on purpose: `friendly` hears them as
// ordinary everyday onsets, `refined` hears them as sibilants. These are lenses
// on the same letter, not a partition of the alphabet.
const SONORANT = new Set([2, 5, 6, 11]);        // ㄴㄹㅁㅇ
const TENSE = new Set([1, 4, 8, 10, 13]);       // ㄲㄸㅃㅆㅉ
const ASPIRATE = new Set([14, 15, 16, 17]);     // ㅊㅋㅌㅍ
const SIBILANT = new Set([9, 10, 12, 13, 14]);  // ㅅㅆㅈㅉㅊ
const PLAIN = new Set([0, 3, 7, 9, 12]);        // ㄱㄷㅂㅅㅈ
const H = 18;                                    // ㅎ, breathy — in no class
const IEUNG = 11;                                // ㅇ

const BRIGHT = new Set([0, 1, 2, 3, 8, 9, 10, 11, 12]);   // ㅏㅐㅑㅒㅗㅘㅙㅚㅛ
const DARK = new Set([4, 5, 6, 7, 13, 14, 15, 16, 17]);   // ㅓㅔㅕㅖㅜㅝㅞㅟㅠ
const MID = new Set([18, 19, 20]);                        // ㅡㅢㅣ

const SOFT_CODA = new Set([4, 8, 16, 21]);      // ㄴㄹㅁㅇ

const UNCOMMON_BY_FREQ: Record<Freq, number> = {
  'very-common': 10,
  common: 35,
  uncommon: 70,
};
/** A syllable nobody has catalogued is the most unusual thing a name can hold. */
const UNCOMMON_ABSENT = 88;

const DEFAULT_ERA: Era = 'timeless';

interface Cell {
  cho: number;
  jung: number;
  jong: number;
  info: SyllableItem | null;
}

function cellsOf(given: string): Cell[] {
  const cells: Cell[] = [];
  for (const char of given) {
    const jamo = decompose(char);
    if (jamo === null) continue;
    cells.push({ ...jamo, info: syllableInfo(char) });
  }
  return cells;
}

const clamp = (n: number) => Math.round(Math.min(100, Math.max(0, n)));
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

function cute(cells: Cell[]): number {
  const per = cells.map((c) => {
    let n = 30;
    if (BRIGHT.has(c.jung)) n += 22;
    if (DARK.has(c.jung)) n -= 12;
    if (c.jong === 0) n += 18;
    else if (!SOFT_CODA.has(c.jong)) n -= 10;
    if (TENSE.has(c.cho)) n += 12;
    if (c.cho === IEUNG || c.cho === H) n += 10;
    return n;
  });
  // a name that repeats its vowel — 나나, 다다 — is doing something childlike
  const oneVowel = cells.length > 1 && cells.every((c) => c.jung === cells[0].jung);
  return clamp(mean(per) + (oneVowel ? 15 : 0));
}

function calm(cells: Cell[]): number {
  return clamp(mean(cells.map((c) => {
    let n = 35;
    if (SONORANT.has(c.cho)) n += 22;
    if (ASPIRATE.has(c.cho)) n -= 20;
    if (TENSE.has(c.cho)) n -= 12;
    if (DARK.has(c.jung) || MID.has(c.jung)) n += 18;
    if (BRIGHT.has(c.jung)) n -= 8;
    if (SOFT_CODA.has(c.jong)) n += 15;
    return n;
  })));
}

function refined(cells: Cell[]): number {
  const per = cells.map((c) => {
    let n = 40;
    if (SIBILANT.has(c.cho) || c.cho === H) n += 18;
    if (TENSE.has(c.cho)) n -= 22;
    if (ASPIRATE.has(c.cho)) n -= 15;
    if (c.jong === 0 || SOFT_CODA.has(c.jong)) n += 15;
    else n -= 10;
    const era = c.info?.era ?? DEFAULT_ERA;
    if (era === 'modern') n += 14;
    if (era === 'classic') n -= 10;
    return n;
  });
  // two syllables is what a contemporary given name looks like
  const shape = cells.length === 2 ? 12 : -10;
  return clamp(mean(per) + shape);
}

function friendly(cells: Cell[]): number {
  return clamp(mean(cells.map((c) => {
    let n = 35;
    const freq = c.info?.freq;
    if (freq === 'very-common' || freq === 'common') n += 20;
    if (c.info === null) n -= 15;
    if (SONORANT.has(c.cho) || PLAIN.has(c.cho)) n += 16;
    if (ASPIRATE.has(c.cho)) n -= 10;
    if (BRIGHT.has(c.jung)) n += 12;
    if (SOFT_CODA.has(c.jong)) n += 8;
    return n;
  })));
}

function uncommon(cells: Cell[]): number {
  return clamp(mean(cells.map((c) => {
    if (c.info === null) return UNCOMMON_ABSENT;
    return UNCOMMON_BY_FREQ[c.info.freq] + (c.info.era === 'classic' ? 12 : 0);
  })));
}

/**
 * Where the family name ends.
 *
 * Three syllables, not two. 하, 서, 민, 도, 강 and 문 are all family names and
 * ordinary given-name syllables at once, so a rule that only asked whether the
 * first syllable is a surname would read 하준 as 하 씨 준 and 서연 as 서 씨 연 —
 * three of the commonest names on the site, mangled. Two-syllable family names
 * (남궁, 선우) are not in the forty-name database and are not handled, the same
 * coarse trade familyToken already makes.
 */
function splitSurname(syllables: string[]): { surnameId: string | null; given: string[] } {
  if (syllables.length >= 3) {
    const hit = SURNAME_DATABASE.find((s) => s.hangul === syllables[0]);
    if (hit) return { surnameId: hit.id, given: syllables.slice(1) };
  }
  return { surnameId: null, given: syllables };
}

export function readName(hangul: string): Reading | null {
  const syllables = [...hangul.trim()].filter((c) => decompose(c) !== null);
  if (syllables.length === 0) return null;

  const { surnameId, given } = splitSurname(syllables);
  const cells = cellsOf(given.join(''));

  const traits: Traits = {
    friendly: friendly(cells),
    refined: refined(cells),
    cute: cute(cells),
    calm: calm(cells),
    uncommon: uncommon(cells),
  };

  // ties break in AXES order, so the same name never reorders between renders
  const ranked = [...AXES].sort((a, b) => traits[b] - traits[a]);

  return {
    surnameId,
    given: given.join(''),
    traits,
    top: [ranked[0], ranked[1]],
    known: cells.map((c) => c.info).filter((i): i is SyllableItem => i !== null),
  };
}

/** The two axes in AXES order, so `cute + friendly` and `friendly + cute` are one key. */
export function blendKey(a: Axis, b: Axis): string {
  const [first, second] = [a, b].sort((x, y) => AXES.indexOf(x) - AXES.indexOf(y));
  return `${first}_${second}`;
}
```

- [ ] **Step 4: Run the check to verify it passes**

Run: `npm run check`
Expected: PASS. If an ordering assertion fails, the weights are wrong, not the assertion — the assertions encode what the spec says the axes mean. Adjust the weight tables in `nameTraits.ts` and re-run.

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/utils/nameTraits.ts scripts/traits.check.ts
git commit -m "Score a given name on five axes read off its jamo"
```

---

### Task 4: The impression room

**Files:**
- Create: `src/components/TraitMeter.tsx`
- Create: `src/steps/ImpressionScreen.tsx`
- Modify: `src/store/useFlowStore.ts`
- Modify: `src/App.tsx`
- Modify: `src/components/layout/Header.tsx`
- Modify: `src/data/locales/{en,ko,vi,th}/common.json`
- Modify: `scripts/traits.check.ts`

**Interfaces:**
- Consumes: `readName`, `AXES`, `blendKey`, `Axis`, `Traits` from `src/utils/nameTraits.ts`; `hangulFor` from `src/utils/romanToHangul.ts`; `useImageShare` from `src/hooks/useImageShare.ts`; `surnameById` from `src/utils/surnameMatcher.ts`.
- Produces: `Tool` gains `'impression'`; `useFlowStore` gains `impressionName: string` and `setImpressionName(v: string): void`.

- [ ] **Step 1: Write the failing copy assertions**

Insert into `scripts/traits.check.ts` before the report block, and add to its imports:

```ts
import en from '../src/data/locales/en/common.json';
import ko from '../src/data/locales/ko/common.json';
import vi from '../src/data/locales/vi/common.json';
import th from '../src/data/locales/th/common.json';
```

```ts
// --- the new room has to be fully translated ------------------------------

const PAIRS = AXES.flatMap((a, i) => AXES.slice(i + 1).map((b) => blendKey(a, b)));
ok('ten blends', PAIRS.length === 10, PAIRS.length);

const SHELL = ['eyebrow', 'title', 'sub', 'label', 'placeholder', 'hint', 'waiting',
  'card_label', 'disclaimer', 'family_note'];

for (const [lang, bundle] of [['en', en], ['ko', ko], ['vi', vi], ['th', th]] as const) {
  const room = (bundle as Record<string, any>).impression;
  ok(`${lang}: impression exists`, room !== undefined);
  for (const key of SHELL) {
    ok(`${lang}: impression.${key}`, typeof room?.[key] === 'string' && room[key].length > 0);
  }
  for (const axis of AXES) {
    ok(`${lang}: impression.axis.${axis}`, typeof room?.axis?.[axis] === 'string' && room.axis[axis].length > 0);
  }
  for (const key of PAIRS) {
    ok(`${lang}: impression.blend.${key}`, typeof room?.blend?.[key] === 'string' && room.blend[key].length > 0);
  }
  ok(`${lang}: nav.impression`, typeof (bundle as Record<string, any>).nav?.impression === 'string');
}
```

- [ ] **Step 2: Run the check to verify it fails**

Run: `npm run check`
Expected: FAIL, roughly 80 lines of `FAIL  en: impression.…`.

- [ ] **Step 3: Add the copy to all four `common.json`**

Add an `impression` block beside the existing `pair` block, and `nav.impression` beside `nav.pair`. English:

```json
"nav": { "impression": "Impression" },
"impression": {
  "eyebrow": "How it lands",
  "title": "What a Korean hears in your name.",
  "sub": "Not what it means — what it sounds like. Five things a Korean ear picks up before it thinks about anything else.",
  "label": "A Korean name",
  "placeholder": "Hajun",
  "hint": "Write it in Latin letters or in Hangul. A family name is optional; we read the given name.",
  "waiting": "Write a name above and we will read it back to you.",
  "card_label": "FIRST IMPRESSION",
  "disclaimer": "This reads sound, not fortune. It counts the consonants and vowels your name is built from and how often Koreans use them — nothing about the person carrying it.",
  "family_note": "Read as the family name — family names are inherited, so this one sits out of the scoring.",
  "axis": {
    "friendly": "Approachable",
    "refined": "Polished",
    "cute": "Sweet",
    "calm": "Composed",
    "uncommon": "Unusual"
  },
  "blend": {
    "friendly_refined": "Easy to say and easy to trust — the name of someone who gets introduced to everyone and remembered by all of them.",
    "friendly_cute": "Warm and light. This is a name people shorten into a nickname within a week of meeting you.",
    "friendly_calm": "Unhurried and open. It sounds like the person everyone ends up telling things to.",
    "friendly_uncommon": "Familiar sounds in an arrangement nobody expects — approachable, but not one of a crowd.",
    "refined_cute": "Polished with something soft underneath. It reads younger than it sounds serious.",
    "refined_calm": "The quiet, well-made kind of name. Nothing about it is trying.",
    "refined_uncommon": "Elegant and rare at once — the sort of name people ask you to repeat, then compliment.",
    "cute_calm": "Gentle all the way through. Soft sounds, no sharp edges, nothing raised.",
    "cute_uncommon": "Playful and unplaceable. Koreans will smile at it before they work out where it is from.",
    "calm_uncommon": "Still and slightly out of time — a name that sounds like it has been somewhere."
  }
}
```

Korean:

```json
"nav": { "impression": "첫인상" },
"impression": {
  "eyebrow": "들리는 느낌",
  "title": "이 이름, 한국 사람에겐 이렇게 들려요.",
  "sub": "뜻이 아니라 소리 이야기입니다. 한국인 귀가 뜻을 생각하기 전에 먼저 집는 다섯 가지.",
  "label": "한국 이름",
  "placeholder": "하준",
  "hint": "로마자로 써도 되고 한글로 써도 됩니다. 성은 있어도 되고 없어도 되고, 이름만 읽습니다.",
  "waiting": "위에 이름을 쓰면 읽어드릴게요.",
  "card_label": "첫인상",
  "disclaimer": "운세가 아니라 소리를 봅니다. 이름을 이루는 자음과 모음, 그리고 그 글자를 한국인이 얼마나 쓰는지만 셉니다. 그 이름을 가진 사람에 대해서는 아무것도 모릅니다.",
  "family_note": "성으로 읽었습니다. 성은 물려받는 것이라 점수에서 뺐습니다.",
  "axis": {
    "friendly": "친근함",
    "refined": "세련됨",
    "cute": "귀여움",
    "calm": "차분함",
    "uncommon": "흔하지 않음"
  },
  "blend": {
    "friendly_refined": "부르기 쉽고 믿음이 가는 이름. 소개받으면 이름부터 외워집니다.",
    "friendly_cute": "따뜻하고 가볍습니다. 만난 지 일주일이면 별명이 생기는 쪽.",
    "friendly_calm": "느긋하고 열려 있습니다. 사람들이 결국 속 얘기를 하게 되는 이름.",
    "friendly_uncommon": "익숙한 소리인데 조합이 낯섭니다. 편한데 흔하지는 않은 쪽.",
    "refined_cute": "단정한데 속이 부드럽습니다. 진지하게 들리기보다 어리게 들려요.",
    "refined_calm": "조용하고 잘 만들어진 이름. 애쓰는 구석이 없습니다.",
    "refined_uncommon": "우아하면서 드뭅니다. 한 번 더 물어보고는 예쁘다고 하는 이름.",
    "cute_calm": "처음부터 끝까지 부드럽습니다. 모난 소리도, 높은 소리도 없어요.",
    "cute_uncommon": "장난스럽고 어디 것인지 모르겠는 이름. 웃고 나서 어디 이름이냐고 묻습니다.",
    "calm_uncommon": "고요하고 조금 옛날 같습니다. 어딘가 다녀온 것 같은 이름."
  }
}
```

For `vi` and `th`, copy the **English** block verbatim into each file, same as the syllable files in Task 2. Flag for native review.

- [ ] **Step 4: Run the check to verify the copy assertions pass**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 5: Open the store to the third room**

In `src/store/useFlowStore.ts`, make these five edits:

```ts
export type Tool = 'name' | 'pair' | 'impression';

const PATH_TOOL = /^\/(?:ko|en|vi|th)\/(pair|impression)(?=\/|$)/;

export function toolFromPath(): Tool {
  if (typeof location === 'undefined') return 'name';
  return (PATH_TOOL.exec(location.pathname)?.[1] as Tool) ?? 'name';
}

export function pathFor(lang: Language, tool: Tool): string {
  return tool === 'name' ? `/${lang}` : `/${lang}/${tool}`;
}
```

Delete the now-unused `PATH_PAIR` constant. Add to the `FlowState` interface, beside `pairA` / `pairB`:

```ts
  /** the name on the first-impression screen, kept across navigation */
  impressionName: string;
  setImpressionName: (value: string) => void;
```

And to the store body, beside `pairA: ''`:

```ts
  impressionName: '',
  setImpressionName: (impressionName) => set({ impressionName }),
```

- [ ] **Step 6: Write the meter**

Create `src/components/TraitMeter.tsx`:

```tsx
/**
 * One score, as five dots.
 *
 * Floor-plus-one rather than a straight round, so the range is 1–5 and a row is
 * never empty: an empty row reads as a rendering fault, not as a low score.
 */
export default function TraitMeter({ score, label }: { score: number; label: string }) {
  const filled = Math.min(5, Math.floor(score / 20) + 1);
  return (
    <span className="flex gap-[5px]" role="img" aria-label={`${label}: ${filled} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`h-[7px] w-[7px] rounded-full ${i < filled ? 'bg-accent' : 'bg-rule-strong'}`}
        />
      ))}
    </span>
  );
}
```

- [ ] **Step 7: Write the room**

Create `src/steps/ImpressionScreen.tsx`. It follows `PairScreen` deliberately — same input treatment, same capture-card shell, same save/share pair, same "the other room" footer:

```tsx
import { useMemo } from 'react';
import { useFlowStore } from '../store/useFlowStore';
import { useTranslation } from '../hooks/useTranslation';
import { useImageShare } from '../hooks/useImageShare';
import { hangulFor } from '../utils/romanToHangul';
import { AXES, blendKey, readName } from '../utils/nameTraits';
import { surnameById } from '../utils/surnameMatcher';
import MountainWash from '../components/MountainWash';
import TraitMeter from '../components/TraitMeter';
import OptionMark from '../components/OptionMark';
import AdSlot from '../components/AdSlot';
import Button from '../components/Button';

/**
 * 첫인상 판독기 — the third room.
 *
 * The name flow asks questions and hands back a name. This runs the other
 * direction: a name in, and the five things a Korean ear notices about it. Same
 * scorer the match card labels itself with, so the two rooms cannot disagree.
 */

/** The five axes borrow marks the quiz already uses, so nothing new was drawn. */
const MARK: Record<string, string> = {
  friendly: 'considerate',
  refined: 'trendy',
  cute: 'lovely',
  calm: 'calm',
  uncommon: 'mystic',
};

export default function ImpressionScreen() {
  const { impressionName, setImpressionName, setTool } = useFlowStore();
  const { t } = useTranslation();

  const read = useMemo(() => hangulFor(impressionName), [impressionName]);
  const reading = useMemo(() => (read ? readName(read.hangul) : null), [read]);

  const { captureRef, isSaving, isSharing, handleDownload, handleShare } =
    useImageShare(reading ? `hangeul-impression-${reading.given}` : 'hangeul-impression');

  const surname = surnameById(reading?.surnameId ?? null);

  return (
    <div className="mx-auto w-full max-w-[620px] px-5 pb-24 pt-6 lg:px-4">
      <span className="eyebrow text-[8.5px] tracking-[0.26em] text-accent">{t('impression.eyebrow')}</span>
      <h1 className="mb-2.5 mt-3 -ml-[0.035em] text-pretty font-disp text-[31px] leading-[1.08] tracking-tight text-ink md:text-[40px]">
        {t('impression.title')}
      </h1>
      <p className="text-[14px] leading-relaxed text-ink-3 md:text-[15px]">{t('impression.sub')}</p>

      <div className="mt-7">
        <label htmlFor="impression-name" className="eyebrow mb-2 block text-[8.5px] text-ink-4">
          {t('impression.label')}
        </label>
        <input
          id="impression-name"
          type="text"
          value={impressionName}
          onChange={(e) => setImpressionName(e.target.value)}
          placeholder={t('impression.placeholder')}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="h-[56px] w-full rounded-2xl border-[1.5px] border-rule-strong bg-paper-hi px-5 font-disp text-[20px] text-ink caret-accent outline-none transition-colors duration-150 placeholder:font-body placeholder:text-[15px] placeholder:text-ink-4 focus:border-accent"
        />
        <span className="mt-2 block h-[22px] font-brush text-[19px] leading-none text-accent">
          {read?.hangul}
        </span>
      </div>

      <p className="mt-1 text-[12px] leading-relaxed text-ink-4">{t('impression.hint')}</p>

      {reading === null ? (
        <p className="mt-7 rounded-sm border border-l-[3px] border-rule border-l-pig-jeok bg-paper-hi p-3.5 text-[13px] leading-relaxed text-ink-3">
          {t('impression.waiting')}
        </p>
      ) : (
        <>
          {/* the card: this is what gets screenshotted, so no ad goes inside it */}
          <div
            ref={captureRef}
            className="relative mt-7 overflow-hidden rounded-3xl border border-rule-strong bg-paper-hi px-6 pb-8 pt-9 shadow-[0_26px_56px_-36px_rgba(23,24,26,0.4)] md:px-8"
          >
            <MountainWash season="autumn" className="absolute inset-x-0 bottom-0 h-[170px]" />
            <div className="pointer-events-none absolute inset-2 rounded-[20px] border border-rule" />

            <div className="relative flex flex-col items-center">
              <span className="eyebrow text-[8.5px] tracking-[0.26em] text-ink-4">{t('impression.card_label')}</span>

              <span className="mt-4 font-brush text-[40px] leading-none text-ink">
                {surname && <span className="text-[28px] text-ink-4">{surname.hangul}</span>}
                {reading.given}
              </span>

              <span className="my-6 block h-px w-11 bg-accent" />

              <div className="flex w-full max-w-[280px] flex-col gap-3.5">
                {AXES.map((axis) => (
                  <span key={axis} className="flex items-center gap-3">
                    <OptionMark id={MARK[axis]} active size={26} />
                    <span className="flex-1 font-disp text-[15px] leading-none text-ink-2">
                      {t(`impression.axis.${axis}`)}
                    </span>
                    <TraitMeter score={reading.traits[axis]} label={t(`impression.axis.${axis}`)} />
                  </span>
                ))}
              </div>

              <span className="my-6 block h-px w-11 bg-rule-strong" />

              <span className="max-w-[320px] text-center text-[13px] leading-relaxed text-ink-2">
                {t(`impression.blend.${blendKey(reading.top[0], reading.top[1])}`)}
              </span>

              {reading.known.length > 0 && (
                <span className="mt-4 flex max-w-[320px] flex-col gap-2">
                  {reading.known.map((item) => (
                    <span key={item.roman} className="text-center text-[12px] leading-relaxed text-ink-3">
                      <span className="font-brush text-[15px] text-ink-2">{item.syllable}</span>
                      {' — '}
                      {t(`syllables.${item.roman}`)}
                    </span>
                  ))}
                </span>
              )}

              <span className="eyebrow mt-7 text-[9px] tracking-[0.28em] text-ink-4">GETHANGEUL.COM</span>
            </div>
          </div>

          {surname && (
            <p className="mt-3 text-[12px] leading-relaxed text-ink-4">{t('impression.family_note')}</p>
          )}

          <div className="mt-4 flex flex-col gap-2.5">
            <Button full onClick={handleDownload} disabled={isSaving || isSharing}>
              {isSaving ? t('result.buttons.downloading') : t('result.buttons.download')}
            </Button>
            <Button full variant="secondary" onClick={handleShare} disabled={isSaving || isSharing}>
              {isSharing ? t('result.buttons.sharing') : t('result.buttons.share')}
            </Button>
          </div>
        </>
      )}

      <p className="mt-7 whitespace-pre-line text-[12.5px] leading-relaxed text-ink-4">
        {t('impression.disclaimer')}
      </p>

      <AdSlot size="300x250" className="mt-8" />
    </div>
  );
}
```

- [ ] **Step 8: Route it**

In `src/App.tsx`, add the import and replace the `tool === 'pair'` ternary:

```tsx
import ImpressionScreen from './steps/ImpressionScreen';
```

```tsx
        {tool === 'pair' && <PairScreen />}
        {tool === 'impression' && <ImpressionScreen />}
        {tool === 'name' && (
          <>
            {step === 'landing' && <Step0Landing />}
            {isQuestion(step) && <StepOptions step={step} />}
            {step === 'surname' && <StepSurname />}
            {step === 'loading' && <StepLoading />}
            {step === 'result' && <StepResult />}
          </>
        )}
```

In `src/components/layout/Header.tsx`, extend the nav array:

```tsx
          {(['name', 'pair', 'impression'] as Tool[]).map((item) => (
```

- [ ] **Step 9: Verify in the browser**

Start the dev server with the Browser pane (`preview_start` with `{name: "gethangeul"}`), then check, at `/en/impression`:

1. Typing `Hajun` shows `하준` under the field and renders five meter rows.
2. Typing `Kim Hajun` shows 김 set quieter ahead of 하준, and the family note appears below the card.
3. `read_console_messages` returns no errors.
4. The three header tabs do not wrap at 375px (`resize_window` preset `mobile`).
5. Browser back from `/en/impression` returns to the previous room and the nav follows.
6. Save Image produces a PNG of the card.

Fix anything broken in the source, not in the browser, then re-check.

- [ ] **Step 10: Full check and build**

Run: `npm run check && npm run build`
Expected: PASS both.

- [ ] **Step 11: Commit**

```bash
git add src/components/TraitMeter.tsx src/steps/ImpressionScreen.tsx src/store/useFlowStore.ts src/App.tsx src/components/layout/Header.tsx src/data/locales/*/common.json scripts/traits.check.ts
git commit -m "Add the first-impression room"
```

---

### Task 5: The label on the match card

**Files:**
- Create: `src/utils/pairLabel.ts`
- Modify: `src/steps/PairScreen.tsx`
- Modify: `src/data/locales/{en,ko,vi,th}/common.json`
- Modify: `scripts/traits.check.ts`

**Interfaces:**
- Consumes: `readName`, `AXES`, `blendKey`, `Axis`, `Traits` from `src/utils/nameTraits.ts`.
- Produces: `export function pairLabel(a: string, b: string): { emojiA: string; emojiB: string; key: string } | null`.

- [ ] **Step 1: Write the failing assertions**

Insert into `scripts/traits.check.ts` before the report block, and add `import { pairLabel } from '../src/utils/pairLabel';` to the imports.

This block reads `PAIRS` and the four `common.json` bindings that Task 4 Step 1 introduced, so it must come **after** that block in the file. Tasks run in order, so appending before the report block puts it in the right place — but if you are running this task alone against a file that never got Task 4's block, add `PAIRS` and the `common.json` imports first.

```ts
// --- the label on the match card ------------------------------------------
// The percentage is not symmetric — that is the notebook game and the card
// draws the fold that proves it. The label is, because an average does not care
// about order. Asserted so it stays a decision.

const label = pairLabel('하린', '도윤');
ok('a pair gets a label', label !== null);
ok('each side gets an emoji', (label?.emojiA.length ?? 0) > 0 && (label?.emojiB.length ?? 0) > 0, label);
ok('the label does not depend on order',
  pairLabel('하린', '도윤')?.key === pairLabel('도윤', '하린')?.key,
  [pairLabel('하린', '도윤')?.key, pairLabel('도윤', '하린')?.key]);
ok('an unreadable side gives no label', pairLabel('하린', 'Anna') === null);
ok('a blank side gives no label', pairLabel('', '도윤') === null);
ok('the key is one of the ten', PAIRS.includes(label?.key ?? ''), label?.key);

for (const [lang, bundle] of [['en', en], ['ko', ko], ['vi', vi], ['th', th]] as const) {
  for (const key of PAIRS) {
    const line = (bundle as Record<string, any>).pair?.blend?.[key];
    ok(`${lang}: pair.blend.${key}`, typeof line === 'string' && line.length > 0);
  }
}
```

- [ ] **Step 2: Run the check to verify it fails**

Run: `npm run check`
Expected: FAIL. rolldown cannot resolve `../src/utils/pairLabel`.

- [ ] **Step 3: Write the label**

Create `src/utils/pairLabel.ts`:

```ts
import { AXES, blendKey, readName, type Axis, type Traits } from './nameTraits';

/**
 * One phrase for a pair of names, from the same five axes the impression room
 * shows one name on.
 *
 * The percentage above it is not symmetric — swap the two names and the fold
 * lands somewhere else, which is how the playground game has always worked and
 * why the card draws the whole fold. This label is symmetric, because it comes
 * from an average, and an average does not care about order. Both are correct
 * at once: the number is the game, the label is the pairing.
 */

const EMOJI: Record<Axis, string> = {
  friendly: '🌾',
  refined: '🍃',
  cute: '💮',
  calm: '🌙',
  uncommon: '✨',
};

export function pairLabel(a: string, b: string): { emojiA: string; emojiB: string; key: string } | null {
  const readA = readName(a);
  const readB = readName(b);
  if (!readA || !readB) return null;

  const mean = Object.fromEntries(
    AXES.map((axis) => [axis, (readA.traits[axis] + readB.traits[axis]) / 2]),
  ) as Traits;

  const ranked = [...AXES].sort((x, y) => mean[y] - mean[x]);

  return {
    emojiA: EMOJI[readA.top[0]],
    emojiB: EMOJI[readB.top[0]],
    key: blendKey(ranked[0], ranked[1]),
  };
}
```

- [ ] **Step 4: Add the copy**

Add a `blend` object inside the existing `pair` block in all four `common.json`. These are written for the match context — do not reuse the `impression.blend` sentences. English:

```json
"blend": {
  "friendly_refined": "The pair everyone assumes has known each other for years.",
  "friendly_cute": "The best-friends-to-something-else pair.",
  "friendly_calm": "The pair that never has a dramatic scene and never needs one.",
  "friendly_uncommon": "The pair nobody saw coming and everybody roots for.",
  "refined_cute": "The first-love pair, filmed in spring.",
  "refined_calm": "The slow-burn pair, twelve episodes and one held glance.",
  "refined_uncommon": "The pair the whole drama is secretly about.",
  "cute_calm": "The comfortable pair — one talks, one listens, both stay.",
  "cute_uncommon": "The chaotic pair the fandom makes edits of.",
  "calm_uncommon": "The quiet, fated pair with a backstory nobody has heard yet."
}
```

Korean:

```json
"blend": {
  "friendly_refined": "몇 년은 알고 지낸 줄 아는 조합",
  "friendly_cute": "친구에서 시작하는 조합",
  "friendly_calm": "싸우는 장면이 한 번도 안 나오는 조합",
  "friendly_uncommon": "아무도 예상 못 했는데 다들 응원하는 조합",
  "refined_cute": "봄에 찍는 첫사랑 조합",
  "refined_calm": "12화 내내 눈빛만 오가는 조합",
  "refined_uncommon": "사실 이 드라마의 진짜 주인공 조합",
  "cute_calm": "한 명은 말하고 한 명은 듣는, 편한 조합",
  "cute_uncommon": "팬들이 편집 영상 만드는 조합",
  "calm_uncommon": "사연 있어 보이는 조용한 운명 조합"
}
```

For `vi` and `th`, copy the English block verbatim. Flag for native review.

- [ ] **Step 5: Draw it on the card**

In `src/steps/PairScreen.tsx`, add to the imports:

```tsx
import { pairLabel } from '../utils/pairLabel';
```

Add beside the existing `result` memo:

```tsx
  const label = useMemo(
    () => (readA && readB ? pairLabel(readA.hangul, readB.hangul) : null),
    [readA, readB],
  );
```

Then, inside the capture card, between the fold block's closing `</div>` and the `GETHANGEUL.COM` span:

```tsx
              {label && (
                <span className="mt-7 max-w-[300px] text-center text-[13px] leading-relaxed text-ink-2">
                  {label.emojiA} {readA!.hangul} <span className="text-ink-4">×</span> {label.emojiB} {readB!.hangul}
                  <span className="mt-1.5 block text-ink-3">{t(`pair.blend.${label.key}`)}</span>
                </span>
              )}
```

- [ ] **Step 6: Run the check to verify it passes**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 7: Verify in the browser**

At `/en/pair`, type `Harin` and `Doyun`:

1. The label renders inside the card, below the fold, above `GETHANGEUL.COM`.
2. Swapping the two names changes the percentage but not the label sentence.
3. Save Image captures the label — it must be inside `captureRef`, not below the card.
4. `read_console_messages` returns no errors.

- [ ] **Step 8: Build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 9: Commit and push**

```bash
git add src/utils/pairLabel.ts src/steps/PairScreen.tsx src/data/locales/*/common.json scripts/traits.check.ts
git commit -m "Label the match card with the pair's blend"
git push origin main
```

---

## Handoff notes

- **vi/th copy is English placeholder** in `syllables.json` (61 lines), `impression.*` and `pair.blend.*`. The check asserts presence, not translation. Native review needed before this counts as shipped in four languages.
- **Frequency and era bands are judgement, not census data.** One word per row in `syllableDatabase.ts`; a wrong call is a one-word fix and the check will not object.
- **Header nav is now at three tabs, its ceiling.** The K-Drama test and the fortune reading would make five. Whoever adds the fourth room converts the nav to a menu first.
- **The weights in `nameTraits.ts` are a first tuning.** The check asserts orderings, not values, so they can be moved freely; if a move breaks an ordering, the ordering is what the spec promised the axis means.
