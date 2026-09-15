# K-Drama, as a drama you star in

Date: 2026-09-15
Status: approved, not yet implemented
Supersedes: the casting result in
[`2026-09-15-kdrama-rebuild-design.md`](2026-09-15-kdrama-rebuild-design.md).
The twelve-scenes-as-real-furniture rule from that spec stands and is extended
to four genres.

## What is wrong with the room as it ships

You type your name. You walk twelve scenes of a Korean drama with your name in
them. At the end the site tells you that you are a **신중한 주인공**.

That is a personality label, and the site already has a room whose whole job is
personality labels — 첫인상 reads a name and prints five meters and a sentence
about you. K-드라마 now does the same thing with eleven more steps in front of
it. Two rooms, one payoff.

It is also the wrong shape for what just happened. Twelve scenes is a *story*.
A story does not resolve into an adjective.

## What replaces it

**A poster for the drama you just starred in.**

> **재벌 로맨스**
> 《**사라**의 계약 연애》
> 16부작 · 수목 미니시리즈
>
> 로맨스 ●●●●● 긴장감 ●●○○○ 다정함 ●●○○○ 코미디 ●●○○○
>
> 3개월만 버티면 되는 계약이었는데, 사라는 계약서에 없던 걸 하나씩 하기
> 시작한다.

Your name is *in the title*. That is the payoff the room has been missing: not
a name handed to you, and not a verdict about you — a thing that exists because
you played it.

This is also the only room on the site that produces a **work** rather than a
reading, which is what stops it duplicating any of the other four.

## Four genres, chosen up front

The room asks which drama you want to be in before it asks anything else.

| genre | the world | why it is in |
|---|---|---|
| `chaebol` 재벌 로맨스 | 사수, 회식, 옥상, 재벌 3세, 어머니와 봉투, 계약 연애 | it is the twelve scenes that already exist — nearly free |
| `makjang` 막장 | 출생의 비밀, 기억상실, 김치 싸대기, 친자 확인, 유산 | the most recognisable and the funniest thing in the genre |
| `highteen` 하이틴 | 교복, 야자, 급식, 옥상, 수능, 졸업식 | a completely different world from the office |
| `idol` 아이돌 | 연습생, 데뷔조, 열애설, 소속사, 팬사인회, 컴백 | the K that most foreigners arrive through |

**Every genre swaps all twelve scenes, not the second half.** A genre that only
shows up after scene six is a genre that is not really there — which is the
exact criticism that produced the last rebuild.

**The test for every scene is unchanged:** could you screenshot it and have a
Korean say "아 그거"?

## What does not change: the engine

Untouched for the third time, and for the same reason — it was measured, it is
even, and none of the complaints have ever been about it:

- four axes, six roles from the six axis pairs, two tempers, twelve types
- the 기승전결 shape: four acts of three scenes
- one primary axis per option per scene, secondary rotating by scene index
- the finale's doubled temper, so a tie cannot happen
- the distribution bounds over the 997-stride sample

**The six role names stop being shown.** `lead`, `firstLove`, `spark`, `second`,
`rival`, `bestie` stay as the internal key that picks a title and a logline;
주인공 / 첫사랑 / 썸남썸녀 and the two tempers come out of the locale files
entirely. The arithmetic is load-bearing; the vocabulary was the problem.

## The numbers live once

Today each scene carries its own `weights` and `temper`, and the values are
fully determined by the scene's position:

```
option i of scene s:  primary   = AXES[i]                      weight 10
                      secondary = AXES[(i + 1 + (s % 3)) % 4]  weight 6
                      temper    = (s + i) even ? +1 : -1,  doubled in scene 11
```

Copying that table into four genres would be four chances to mistype a number
that the distribution depends on. So the data splits in two:

```ts
/** the engine: twelve positions, the same for every genre */
export const SLOTS: Slot[];                       // { act, options: {weights, temper}[] }

/** the stories: what sits in each position */
export const GENRES = ['chaebol', 'makjang', 'highteen', 'idol'] as const;
export const SCENES: Record<Genre, Scene[]>;      // { id, name, options: string[] } × 12
```

`cast()` reads `SLOTS` and never looks at the genre, so **the distribution is
identical in all four genres by construction** rather than by four checks.

## The name still goes in six scenes

Unchanged from the last spec: six of the twelve speak to the visitor by name,
where a Korean would actually use one. Which six is each genre's own business —
아이돌 calls your name at a 팬사인회, 하이틴 at 출석 — but it is six in every
genre and the same six in all four languages.

Korean uses the Hangul the site already produces (`사라 씨`); the other three use
the visitor's own spelling.

## The poster

| line | where it comes from |
|---|---|
| genre label | the genre you chose |
| **title** | `genre × typeKey` — 48 of them, and the name goes in |
| 회차 · 편성 | fixed per genre: 재벌 16부작 수목, 막장 100부작 일일, 하이틴 12부작 금토, 아이돌 16부작 월화 |
| four meters | the four axes, relabelled for a poster: 로맨스 / 긴장감 / 다정함 / 코미디 |
| **logline** | `genre × typeKey` — 48 of them |

The meters keep the same four scores; only their labels change. 존재감 is a
thing you say about a person and 긴장감 is a thing you say about a drama, and
this card is about a drama now.

## What the visitor does

1. pick a genre (four cards, the marks borrowed from the quiz set)
2. type a name — the room still refuses to start without one
3. twelve scenes, four acts, the recap beat between acts
4. the poster

Genre and name sit on the same screen. The room lost its gender question for a
reason; it is not gaining two new steps.

## The copy

|  | now | after |
|---|---|---|
| scene titles | 12 | 48 |
| options | 48 | 192 |
| recap lines | 12 | 48 |
| poster titles | — | 48 |
| loglines | — | 48 |
| genre labels + taglines + slots | — | 12 |
| type sentences, roles, tempers, headline | 20 | — |
| shell, acts, axes, name field | 23 | 23 |
| **per language** | **115** | **419** |

**Recaps are per genre.** A recap that works for all four is a recap with no
room and no object in it, which is the abstraction this room keeps being
rescued from.

This is roughly four times the room, because it is four rooms. **It is built one
genre at a time**, each landing complete — scenes, recaps, posters — so that a
half-finished genre is never reachable and each one can be read and judged on
its own before the next is written.

재벌 is first and is mostly a re-key of what already ships.

## The check

Everything `scripts/kdrama.check.ts` asserts today, plus:

- `SLOTS` still follows the position rule — the one place the numbers live
- every genre has twelve scenes, ids unique within the genre, four options each
- exactly six name-bearing scenes per genre, and each genre's six carry `{name}`
  in all four languages and in no other scene
- every `genre × typeKey` has a title and a logline in all four languages
- **every poster title contains `{name}`** — a title without the visitor in it
  is the old result wearing a new word
- no copy anywhere contains a role name or a temper word; those keys are gone
- the distribution bounds, run once, because `cast()` cannot see the genre

## Deliberately not built

- **Per-genre engines.** Four genres, one arithmetic. A genre that scored
  differently would need its own distribution measured, and there is no reason
  for 막장 to have different maths than 하이틴.
- **A fifth genre.** 액션 is hard to write choices for — action is watched, not
  chosen — and 사극 fights the modern name the room puts in every sixth scene.
  Both stay on the shelf until the four are done.
- **Showing the role.** It is the index, not the answer.
- **A name in the result.** Still the name generator's job.
- **vi/th translations.** Placeholder English, as everywhere else on the site.
