# 한국 이름 운세: a reading built from a birthday you can check

Date: 2026-09-14
Status: approved, not yet implemented

## What this is

A fifth room. A name and a birthday in; four fortunes on meters, a lucky
colour, number and Korean dish out; and — the part that actually earns the
birthday — which of the twelve zodiac animals the visitor is, and what a Korean
hears when they say it.

**For fun, and it says so on the card.** That is not a disclaimer bolted on at
the end: it is why the room can be built at all. Nothing here claims to know
anything about anyone.

## Why the birthday is calculated, not hashed

The easy version takes the birthday, hashes it, and draws four numbers. It would
work and nobody could tell. It is still the wrong answer, for the same reason
the name scorer computes rather than looks up: this site's whole voice is that
you can see where a number came from. 이름궁합 draws the stroke-count fold on
screen. 첫인상 names the syllables it read. A hash gives the room nothing to
show and nothing to answer with.

So the birthday does two things a visitor can check against the world:

- **the year gives the zodiac animal** — 쥐 소 호랑이 토끼 용 뱀 말 양 원숭이 닭 개 돼지
- **the month and day give the season** — 봄 여름 가을 겨울

Both are facts, not inventions. A visitor born in 1996 can look up that they are
a 쥐띠 and find we agree. That is the difference between a toy and a trick.

## The zodiac animal is the real feature

Every Korean knows their 띠. It comes up when people meet, it is how ages get
compared, and a foreigner living in Korea will be asked theirs within a month.
Almost none of them know the answer.

So the card's largest line is not the fortune — it is **"You are a Horse (말띠)"**,
with a sentence on what Koreans say about that animal and what it signals about
age. The four fortunes are the game around it.

This mirrors the K-Drama room's shape deliberately: there the casting is the
headline and the name is the gift. Here the 띠 is the headline and the fortunes
are the gift. A room whose headline is four bars of percentage is a room nobody
screenshots.

### The year boundary, stated plainly

The zodiac year turns at **Seollal (설날), the lunar new year**, not 1 January —
so someone born in January or early February belongs to the previous animal.
Getting this wrong would tell perhaps one visitor in eight the wrong animal,
which is the one fact on the card they can check.

Computing lunar new year properly needs a lunar calendar, which is a dependency
and a table. Instead: **a hardcoded table of Seollal dates**, one row per year
from 1920 to 2044. That is 125 rows of data, no dependency, no algorithm to get
subtly wrong, and it is checkable — a row is right or it is not. Outside that
range the room asks for a birthday inside it rather than guessing.

## The four fortunes

| Fortune | id |
|---|---|
| 연애운 | `love` |
| 행운 | `luck` |
| 직업운 | `work` |
| 인간관계 | `people` |

Scored 0–100 and shown on the same five-dot `TraitMeter` the other two rooms
use. Each is computed from three inputs the visitor supplied, with no randomness:

1. **the animal** — each of the twelve leans on two of the four fortunes
2. **the season** — each of the four leans on two
3. **the name's own five traits**, via `readName` from `src/utils/nameTraits.ts`

The third is the one place this room touches the name scorer, and it is worth
it: it means two people with the same birthday get different readings, which is
what stops the room being a birthday lookup with a name field attached.

**A fortune is never zero and never a hundred.** The scale is clamped to 15–90.
A card that tells someone their 연애운 is nil is not for fun any more, and the
top of the scale should stay somewhere nobody quite reaches.

## The lucky three

- **colour** — from the animal's traditional 오방색 association, shown as a
  swatch with its Korean name (청색, 적색, 황색, 백색, 흑색) so the visitor
  learns the word, not just the hue
- **number** — the ones digit of the name's total stroke count, reusing
  `strokesOf` from `src/utils/strokes.ts`, which the match room already draws
- **Korean dish** — from the season, with a line on when Koreans actually eat it

The dish is the one that will be screenshotted. A foreigner who came for a name
and left knowing what 삼계탕 is on the hottest day of summer got something real.

## The card

The impression room's card shell, reused: `MountainWash` seasoned to the
visitor's own season, the inner rule, the `GETHANGEUL.COM` eyebrow,
`useImageShare`, `TraitMeter`, and `sentences()` so every line breaks on a full
stop. Reading down:

- the animal, large, with its Hangul
- the name and birthday it was read from, quiet
- one sentence on the animal
- four meters
- the lucky three, in a row
- the eyebrow

## Routing and navigation

`/{lang}/fortune`. `Tool` gains `'fortune'`; `PATH_TOOL` already generalises and
the rooms menu already holds four, so the fifth needs no nav work.

## The check

`scripts/fortune.check.ts`, added to the array in `scripts/check.mjs`:

- every Seollal row falls between 21 January and 21 February, the window the lunar
  new year cannot leave, and the rows are strictly ascending with one per year
  from 1920 to 2044 with no gaps
- a birthday the day before its Seollal reads as the previous year's animal, and
  the day of reads as the new one — asserted on a spread of years
- 1996-05-01 is 쥐, 2000-01-01 is 토끼 (before that year's Seollal), 2000-02-05
  is 용 — worked examples a reader can check against any almanac
- a birthday outside 1920–2044 is refused, not guessed
- every fortune of every (animal × season × sampled name) lands in 15–90 and is
  an integer
- the same name and birthday always give the same reading — no randomness
- across all twelve animals and four seasons, each fortune's full range is used:
  no fortune is effectively constant
- the lucky number is 0–9 and matches `strokesOf` on the same name
- all twelve animal names and sentences, four season names, five colour names and
  four dish entries resolve in all four languages

## Deliberately not built

- **Real 사주.** Four pillars needs the hour, a solar-term table and a lot of
  claims this site should not make. The 띠 is the part Koreans actually use
  conversationally, and it is checkable.
- **A lunar calendar dependency.** A 125-row table of Seollal dates is smaller
  than the library, cannot drift, and is reviewable line by line.
- **Daily or monthly fortunes.** They would need a clock, and a clock makes the
  card unreproducible — the shared image would stop matching what the link
  shows. Everything here depends only on what the visitor typed.
- **A birth-hour field.** Two more taps for a number most people do not know, in
  service of precision the room does not claim.
