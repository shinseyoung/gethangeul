# Name traits: a first-impression reading, and a label for the match card

Date: 2026-09-14
Status: approved, not yet implemented

## What this covers

Three things, in one pass, because they are one thing wearing three hats:

1. **A scorer** that turns a Korean given name into five numbers.
2. **첫인상 판독기** — a new room at `/{lang}/impression` that shows those five
   numbers for a name the visitor types, with a line of copy explaining them.
3. **A label on the 궁합 card** — the same five numbers, run over both names,
   collapsed to one phrase: `💮 하린 × 🍃 도윤 — 청춘 로맨스 주인공 조합`.

Two further features (K-Drama 이름 테스트, 이름 운세) are **out of scope here**.
They are deliberately deferred: both are the same scorer and the same card with
different questions in front and different labels on top, so building them
before this core exists means building the core three times. When they come,
they should be screens, not systems.

## Why the scorer is computed, not tabled

The site already has a voice, set by 이름궁합: it draws the whole stroke-count
fold on screen so the visitor can see exactly where the number came from. It is
a notebook game and it says so. A star rating pulled from a hash would break
that — there would be nothing to show and nothing to answer with when someone
asks why their name scored four.

So four of the five axes are computed from the jamo of the name itself. Only the
fifth needs data, because "how common is this" is not knowable from the letters.

## The five axes

| Axis | id | Reads | Existing mark |
|---|---|---|---|
| 친근함 | `friendly` | common syllables, nasal and plain onsets, bright short sounds | `considerate.webp` |
| 세련됨 | `refined` | no tense or aspirated onsets, sibilant onsets, open or soft-coda syllables, modern-era syllables | `trendy.webp` |
| 귀여움 | `cute` | bright vowels, no coda, tense onsets, a repeated vowel across the name | `lovely.webp` |
| 차분함 | `calm` | sonorant onsets, dark or neutral vowels, soft codas | `calm.webp` |
| 흔하지 않음 | `uncommon` | the syllable dictionary's frequency band, inverted | `mystic.webp` |

All five marks already exist in `public/marks/`. No new artwork.

## Component 1 — `src/utils/nameTraits.ts`

`Freq`, `Era` and `SyllableItem` are imported from `src/data/syllableDatabase.ts`
(Component 2). `known` carries whole `SyllableItem`s rather than a trimmed shape
because the card needs `roman` to look the copy line up.

```ts
export interface Traits {
  friendly: number;  // integer 0–100
  refined: number;
  cute: number;
  calm: number;
  uncommon: number;
}

export interface Reading {
  /** the family name split off the front, if one was recognised */
  surnameId: string | null;
  /** the syllables actually scored — the given name */
  given: string;
  traits: Traits;
  /** the two highest axes, highest first; ties break in Traits key order */
  top: [keyof Traits, keyof Traits];
  /** dictionary hits for the given name's syllables, in order */
  known: SyllableItem[];
}

export function readName(hangul: string): Reading | null;  // null if no Hangul
```

### Splitting the family name

`readName('김하준')` scores `하준`, not `김하준`. A family name is inherited, not
chosen — it says nothing about the impression the given name makes, and 김 (hard
coda, plain plosive) would drag every 김 name's score down for no reason.

Reuse what exists: if the input is **three or more syllables** and the first
matches a `surnameDatabase` entry, split it off. Otherwise the whole string is
the given name. A visitor who types just `하준` gets the same reading as one who
types `김하준`, which is the correct behaviour — the card names the surname
separately.

The three-syllable floor is doing real work, not padding. 하, 서, 강, 문, 민, 도
and 나 are all family names *and* ordinary given-name syllables, so a rule that
only asked "is the first syllable a surname" would read 하준 as 하 씨 준, 서연 as
서 씨 연, and 민서 as 민 씨 서 — three of the commonest names on the site,
mangled. A Korean name is a one-syllable family name and a two-syllable given
name often enough that "two syllables means no family name" is right far more
than it is wrong. Two-syllable family names (남궁, 선우) are not in the forty-name
database and are not handled; that is the same coarse-rule trade `familyToken`
already makes in `surnameMatcher.ts`.

### Jamo classes

Decomposition reuses the index arithmetic already in `src/utils/strokes.ts`
(`cho = floor(offset / 588)`, `jung = floor(offset / 28) % 21`, `jong = offset % 28`).
Extract that decomposition into a shared helper rather than copying it; `strokes.ts`
keeps its stroke tables and calls the helper.

```
CHO  ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ            indices 0–18
JUNG ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ        indices 0–20
JONG -ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ  indices 0–27
```

| Class | Members (indices) |
|---|---|
| `SONORANT` onset | ㄴ 2, ㄹ 5, ㅁ 6, ㅇ 11 |
| `TENSE` onset | ㄲ 1, ㄸ 4, ㅃ 8, ㅆ 10, ㅉ 13 |
| `ASPIRATE` onset | ㅊ 14, ㅋ 15, ㅌ 16, ㅍ 17 |
| `SIBILANT` onset | ㅅ 9, ㅆ 10, ㅈ 12, ㅉ 13, ㅊ 14 |
| `PLAIN` onset | ㄱ 0, ㄷ 3, ㅂ 7, ㅈ 12, ㅅ 9 |
| `BRIGHT` vowel | ㅏ 0, ㅐ 1, ㅑ 2, ㅒ 3, ㅗ 8, ㅘ 9, ㅙ 10, ㅚ 11, ㅛ 12 |
| `DARK` vowel | ㅓ 4, ㅔ 5, ㅕ 6, ㅖ 7, ㅜ 13, ㅝ 14, ㅞ 15, ㅟ 16, ㅠ 17 |
| `MID` vowel | ㅡ 18, ㅢ 19, ㅣ 20 |
| `SOFT` coda | ㄴ 4, ㄹ 8, ㅁ 16, ㅇ 21 |
| no coda | 0 |
| `HARD` coda | every other non-zero index |

ㅎ 18 is deliberately in no onset class. It is breathy rather than hard and is
scored by name where it matters (`cute`, `refined`).

`PLAIN` and `SIBILANT` overlap on ㅅ 9 and ㅈ 12, on purpose: `friendly` hears
them as ordinary everyday onsets, `refined` hears them as sibilants. The classes
are lenses on the same letter, not a partition of the alphabet.

### Formulas

Each axis is scored **per syllable** from a base, then averaged across the given
name's syllables, then adjusted by the name-level terms, then clamped to 0–100
and rounded to an integer. Rounding happens once, at the end — never per
syllable, or a three-syllable name drifts by a point or two for no reason.

`freq` and `era` come from the syllable dictionary; a syllable absent from the
dictionary is treated as `freq: 'uncommon'`, `era: 'timeless'` for axes other
than `uncommon` and `friendly`, which name the absence explicitly below.

**cute**, base 30

```
+22 BRIGHT vowel        −12 DARK vowel
+18 no coda             −10 HARD coda
+12 TENSE onset
+10 ㅇ or ㅎ onset
name-level: +15 if every syllable shares the same vowel index
```

**calm**, base 35

```
+22 SONORANT onset      −20 ASPIRATE onset
+18 DARK or MID vowel   −12 TENSE onset
+15 SOFT coda           −8  BRIGHT vowel
```

**refined**, base 40

```
+18 SIBILANT onset or ㅎ    −22 TENSE onset
+15 no coda or SOFT coda    −15 ASPIRATE onset
+14 era === 'modern'        −10 HARD coda
                            −10 era === 'classic'
name-level: +12 if exactly 2 syllables; −10 if 1 or ≥4
```

**friendly**, base 35

```
+20 freq is 'very-common' or 'common'   −15 syllable absent from dictionary
+16 SONORANT or PLAIN onset             −10 ASPIRATE onset
+12 BRIGHT vowel
+8  SOFT coda
```

**uncommon** — read straight off the dictionary, no base, no jamo terms. Each
syllable takes the value for its band, then the syllables are averaged like every
other axis:

```
very-common  10
common       35
uncommon     70
absent       88
+12 if era === 'classic'
```

So 하 (very-common) plus 준 (very-common) reads 10, and 하 plus an invented
syllable reads 49 — one unusual half is enough to make a name unusual, but not
as unusual as two.

These numbers are a first tuning, not a law. They are in one file, in one table
each, so moving them is a one-line change — and the check in Component 6 is what
tells you whether a move broke something.

## Component 2 — the syllable dictionary

Two files, mirroring how `nameDatabase` / `surnameDatabase` already split
language-free data from per-language copy.

`src/data/syllableDatabase.ts` — 61 entries, the syllables that actually
turn up in contemporary Korean given names:

```ts
export type Freq = 'very-common' | 'common' | 'uncommon';
export type Era  = 'modern' | 'timeless' | 'classic';

export interface SyllableItem {
  syllable: string;   // one Hangul block
  roman: string;      // the key used in the locale files
  freq: Freq;
  era: Era;
}
```

`src/data/locales/{ko,en,vi,th}/syllables.json` — one line per syllable, keyed by
`roman`:

```json
{ "jun": "Sits at the end of a boy's name more often than any other syllable — solid, unfussy." }
```

**Scores are not in the dictionary.** Sixty-one syllables times five axes is three
hundred hand-tuned numbers that would not agree with each other by the fiftieth
row. The dictionary carries one band, one era and one sentence; the formulas do
the rest. That also means a syllable nobody has written a line for still gets a
reading.

`useTranslation.ts` gains `syllables` alongside `names` and `surnames`, with the
same English fallback.

## Component 3 — `/{lang}/impression`

Modelled directly on `PairScreen`, which already solved every part of this:
a roman-letter input, `hangulFor()` underneath it showing how it was read, a
capture card, and `useImageShare` for save and share.

The card, inside the existing shell (`MountainWash`, inner rule, `GETHANGEUL.COM`):

- the name in 붓 type, with the recognised family name set quieter ahead of it
- five rows, each a mark, an axis name and a meter
- below the rule: the syllable lines, then one blend sentence

**Meter** — `src/components/TraitMeter.tsx`, five dots:
`filled = Math.min(5, Math.floor(score / 20) + 1)`, so the range is 1–5 and a row
is never empty. An empty row reads as a rendering bug, not as a low score.

**Blend sentence** — the two highest axes, sorted into a canonical key so
`cute+friendly` and `friendly+cute` are the same string, looked up at
`impression.blend.<a>_<b>`. Five axes give ten pairs; ten sentences per language.

## Component 4 — `src/utils/pairLabel.ts`

```ts
export function pairLabel(a: string, b: string): { emojiA: string; emojiB: string; key: string } | null;
```

Reads both names, averages the two `Traits` objects, takes the top two axes of
the average, and returns the same canonical key — resolved against `pair.blend.*`,
a separate ten sentences written for the match context rather than reused from
`impression.blend.*`.

Each name's own top axis picks its emoji, from a fixed map:
`friendly 🌾 · refined 🍃 · cute 💮 · calm 🌙 · uncommon ✨`.

The label sits inside the capture card, under the fold, above `GETHANGEUL.COM`.

**The label is symmetric; the percentage is not.** 하린 × 도윤 and 도윤 × 하린
give different numbers — that is how the notebook game has always worked and the
site already shows the fold that proves it — but the same label, because an
average does not care about order. This is intended, not an oversight: the number
is the game, the label describes the pairing.

## Component 5 — routing and navigation

`useFlowStore.ts`:

```ts
export type Tool = 'name' | 'pair' | 'impression';

const PATH_TOOL = /^\/(?:ko|en|vi|th)\/(pair|impression)(?=\/|$)/;

export function toolFromPath(): Tool {
  const m = PATH_TOOL.exec(location.pathname);
  return (m?.[1] as Tool) ?? 'name';
}

export function pathFor(lang: Language, tool: Tool): string {
  return tool === 'name' ? `/${lang}` : `/${lang}/${tool}`;
}
```

Plus `impressionName: string` and `setImpressionName`, kept across navigation the
way `pairA` / `pairB` already are.

`App.tsx` swaps its `tool === 'pair'` ternary for a switch over the three rooms.
`Header.tsx`'s nav array becomes `['name', 'pair', 'impression']`.

**Three tabs is the ceiling for this header.** At 375px the row is already tight.
The two deferred features would make five, and the nav has to become a menu
before either lands. Not now — this is a note for whoever adds the fourth room.

## Component 6 — the check

`scripts/traits.check.ts`, appended to the input list in `scripts/check.mjs`.
Assertions, in the plain-`assert` style the three existing check scripts use:

- every axis of every name in a fixed sample is an integer within 0–100
- `readName('김하준').surnameId === 'kim'` and `.given === '하준'`
- `readName('하준').surnameId === null` and `.given === '하준'` — 하 is a family
  name in the database, and two syllables is below the split floor
- the same for 서연, 민서, 도윤, 강민 and 문수: `surnameId === null`
- `readName('하준')` and `readName('김하준')` produce identical `traits`
- `readName('하준')` called twice is deep-equal — no randomness anywhere
- 서연 scores `refined` ≥ 60; 뚜껑 scores `refined` below 서연's
- a name whose syllables are all off-dictionary does not throw and scores
  `uncommon` ≥ 80; a name half on and half off lands between the two bands,
  not at either end
- every `syllableDatabase` entry has a non-empty line in both `en` and `ko`
- every `syllableDatabase` roman key is unique, and `syllable` is one Hangul block
- all ten blend keys resolve in both `impression.*` and `pair.*`, in `en` and `ko`
- `pairLabel(a, b).key === pairLabel(b, a).key` — the symmetry above, asserted so
  it is a decision rather than an accident

## Files

**New** — `src/utils/nameTraits.ts`, `src/utils/pairLabel.ts`,
`src/data/syllableDatabase.ts`, `src/data/locales/{ko,en,vi,th}/syllables.json`,
`src/steps/ImpressionScreen.tsx`, `src/components/TraitMeter.tsx`,
`scripts/traits.check.ts`

**Changed** — `src/store/useFlowStore.ts`, `src/App.tsx`,
`src/components/layout/Header.tsx`, `src/hooks/useTranslation.ts`,
`src/steps/PairScreen.tsx`, `src/utils/strokes.ts` (decomposition extracted),
`src/data/locales/{ko,en,vi,th}/common.json`, `scripts/check.mjs`

## Deliberately not built

- **Randomness of any kind.** A shared card has to reproduce.
- **A weights config file or a scorer plugin interface.** Five axes, one file,
  numbers in a table. A config layer over constants that live twenty lines away
  is a second place to look for the same value.
- **Per-name editorial rows.** The 114-name database cannot cover a free-text
  input; syllables can.
- **Header nav rework.** Three tabs fit. The fourth room pays for the menu.
- **Birthdate, fortune categories, K-Drama questions.** Separate specs.
