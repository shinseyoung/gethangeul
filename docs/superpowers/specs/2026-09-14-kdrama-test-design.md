# K-Drama 이름 테스트: a situational test that casts you

Date: 2026-09-14
Status: approved, not yet implemented

## What this is

A fourth room. Six situational questions, and at the end the site tells you
which part you would play in a Korean drama — the role, its temper, how the
character reads on four meters, and a Korean name that suits them.

**The casting is the headline. The name is the gift that comes with it.** That
is the whole difference from the name generator, which already asks four
questions and hands back a name: if this room did the same thing with different
questions, it would be the same room twice.

## Why the questions are situational

The obvious design lets the visitor pick their role — 주인공, 절친, 첫사랑,
라이벌 — and dresses it up. That is a form, not a test. Picking "라이벌" and
being told you are the rival tells you nothing, and gives you no reason to come
back, because changing your answer *is* changing the answer.

So the questions ask about situations — a first club meeting, a friend running
late, being handed a microphone — and the casting is worked out from them. The
visitor knows what they picked and does not know what it adds up to. That gap
is the result, and it is what makes a second run interesting.

**Revisiting is the point.** Every design choice below serves it: enough types
that a different set of answers genuinely lands somewhere else, and a mapping
legible enough that a visitor can see why.

## The four axes

Each answer adds to four axes. Scores are integers 0–100, the same range the
impression room's meters already use.

| Axis | id | What it measures |
|---|---|---|
| 로맨스 | `romance` | how much your story is a love story |
| 카리스마 | `presence` | whether the room turns when you walk in |
| 따뜻함 | `warmth` | soft edges versus sharp ones |
| 엉뚱함 | `mischief` | the chaos you bring on purpose |

Four axes make **exactly six pairs**, and six is exactly the number of roles
this needs. That is not a coincidence to be smoothed over — it is the structure,
and it is the same `blendKey` shape already built and checked in
`src/utils/nameTraits.ts`. Reuse the pattern; do not invent a second one.

## The six roles

The two highest axes name the role:

| top two | 배역 | the part |
|---|---|---|
| `romance` + `presence` | 주인공 | the lead — the story is yours and you know it |
| `romance` + `warmth` | 첫사랑 | the first love — remembered in soft focus |
| `romance` + `mischief` | 썸남썸녀 | the will-they-won't-they, all timing and no timing |
| `presence` + `warmth` | 서브 주인공 | the second lead everyone argues should have won |
| `presence` + `mischief` | 라이벌 | the rival, better dressed and worse behaved |
| `warmth` + `mischief` | 절친 | the best friend who carries every scene they are in |

Canonical pair order, exactly as `blendKey` does it: `romance, presence,
warmth, mischief`. `romance_warmth` is the only spelling; `warmth_romance` never
appears.

## The temper — 결

A fifth signal, separate from the four axes so it does not double-count them.
Each answer also carries a **직진 / 신중** weight; the sign of the total picks
one of two tempers:

- **직진** — says it out loud, moves first, apologises later
- **신중** — waits a beat, reads the room, lands it better

Six roles × two tempers = **twelve types**. Twelve is the number that makes a
second run worth doing; six would run out by the third visit, and sixteen would
be four more sets of copy nobody has time to write well.

## The six questions

Situational, in the voice the quiz screens already use. Each option carries
weights on the four axes plus the 직진/신중 sign.

1. 첫 모임에 들어섰다. 당신은?
2. 좋아하는 사람이 다른 사람과 웃고 있다.
3. 마이크가 당신에게 넘어왔다.
4. 친구가 약속에 한 시간 늦는다.
5. 비 오는 날, 우산이 하나뿐이다.
6. 마지막 화, 당신의 장면은?

Six, not four and not ten: four cannot separate twelve outcomes, and by ten the
visitor is answering to finish rather than to answer.

**The weights are a first tuning, like the trait weights before them.** The
check asserts what the outcomes must do, not what the numbers are, so they can
be moved freely.

## The name

Picked from the 114 names already in `src/data/nameDatabase.ts`, using the tags
`NameItem` already carries. No new name data, and no new tags on the existing
rows.

Each of the twelve types names a small set of `vibes` and `personalities` — say
three and three — that its character would wear. A name qualifies when it
carries at least one tag from each set; the pool is every name that qualifies.
Where a type's pool comes out smaller than five names, widen that type's tag
sets until it does not, and record which ones needed widening. Five is the floor
because the redraw below has to have somewhere to go.

**Gender is not asked.** Stopping a story mid-scene for an admin question is
what the generator does, and it is why that flow feels like a form. Every
type's pool is filtered to `gender` containing `'neutral'`, which the database
already tags on both masculine- and feminine-leaning names, so the pool stays
wide without the site guessing at anyone.

The card offers **다른 이름으로**, which redraws from the same pool. It walks the
pool in order from a starting point fixed by the answers, so it is deterministic
and never repeats until the pool is exhausted — not a random pick that can hand
back the same name twice.

**Only the name redraws. The casting never does.** The casting is the result;
letting someone re-roll it until they like it would turn the test into a
slot machine and make a shared card mean nothing.

## The card

The impression room's card, reused: `MountainWash`, the inner rule, the
`GETHANGEUL.COM` eyebrow, `useImageShare` for save and share, and `TraitMeter`
for the four axes. Reading down:

- the 배역 and 결 as the headline — `신중한 서브 주인공`
- the name below it, in 붓 type, with its romanisation
- four meters, one per axis
- one sentence for the type, from twelve written per language
- the eyebrow

## Routing and navigation

`/{lang}/kdrama`. `Tool` gains `'kdrama'`; `PATH_TOOL` already generalises.

**This room is blocked on a navigation rework and must not ship before it.**
The header nav holds three tabs and is already tight at 375px; a fourth does not
fit. That work — replacing the tab row with a menu that holds four now and five
when the fortune reading lands — is its own small spec and its own branch. It
does not depend on anything here, so it can be done first and independently.

## The check

`scripts/kdrama.check.ts`, added to the array in `scripts/check.mjs`:

- every axis of every reachable answer combination is an integer 0–100
- the same answers always produce the same casting — no randomness anywhere
- all six roles are reachable, and all twelve types are reachable
- no single type takes more than 25% of all answer combinations — a test whose
  every road leads to 주인공 is not a test
- the two highest axes name the role, in canonical order, both ways round
- all twelve type sentences and all six role names resolve in `en` and `ko`
- the six questions and all their options resolve in all four languages
- every type's name pool holds at least five names
- "다른 이름으로" changes the name and leaves the casting untouched, and walking
  a pool of N returns all N before repeating any

## Deliberately not built

- **A shareable permalink encoding the answers.** Wanted eventually, but it is a
  URL-encoding problem with its own edge cases, and the image share already
  covers the actual sharing. Add it when someone asks twice.
- **Any use of the five-axis name scorer.** That reads what a name *sounds*
  like; this reads what a person *chose*. Same card, same meter, different
  engine, and wiring them together would make both harder to reason about.
- **Randomness in the casting.** Same answers, same result, or a shared card
  cannot be reproduced. The name redraw is the one deliberate exception, and it
  is explicit and user-driven.
- **Sixteen types, or a second axis pair for a sub-type.** Twelve is already
  twelve sentences per language.
