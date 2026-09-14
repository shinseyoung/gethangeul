# K-Drama, in four acts

Date: 2026-09-14
Status: approved, not yet implemented
Supersedes: the "six questions" section of
[`2026-09-14-kdrama-test-design.md`](2026-09-14-kdrama-test-design.md)

## What changes

The room ships today as six unrelated situations. It works, and it reads like a
questionnaire — six things that could have been asked in any order, about a
person who is not in a story.

This turns it into one: **four acts of three scenes, told in 기승전결**, with the
drama's premise set up before the first scene and each act opening on a line
that describes what your own choices have made of it so far.

Everything downstream is unchanged. The same four axes, the same six roles from
the same six axis pairs, the same two tempers, the same twelve types, the same
card, the same name draw. Only the front of the room changes — twelve scenes
where there were six questions, and something holding them together.

## Why twelve and not sixteen

Sixteen reads better on paper and loses people in the middle. Twelve is four
acts with three beats each, which is enough for an act to have a shape — a
scene that opens it, one that complicates it, one that closes it — and short
enough that a visitor who started finishes.

Six was too few for a different reason: three of the four acts would have had
one scene, which is not an act.

## The branching problem, and what is actually built

"Your last choice changes the next scene" is the whole appeal and also the trap.
Twelve scenes of four options is **4¹² — sixteen million paths**. Nobody writes
that, and a generator that stitches fragments reads like a generator.

So the story does not branch. **The state between acts does.**

At the end of each act, the visitor's three answers in that act have a dominant
axis — whichever of `romance`, `presence`, `warmth`, `mischief` they fed most.
That single value, and nothing else, chooses the line that opens the next act:

```
Act 1 → one fixed opening (nothing has happened yet)
Act 2 → one of four, by Act 1's dominant axis
Act 3 → one of four, by Act 2's dominant axis
Act 4 → one of four, by Act 3's dominant axis
```

Three answers can tie two axes, so **a tie breaks in `AXES` order** —
`romance, presence, warmth, mischief` — the same rule the role ranking and
`roleKey` already use. One tie-break rule for the whole room, not two.

Twelve recap lines, not sixteen million. The visitor sees the story respond to
them three times, which is what "it responded to me" actually feels like, and
the copy stays something a person can write and a translator can translate.

**The recap lines describe, they never predict.** "You have been the one who
says it first" is fair — it happened. "You are heading for a confession scene"
is not — it would leak the ending and make the last act pointless.

## The four acts

| Act | Korean | What it is | Scenes |
|---|---|---|---|
| 1 | 기 | The setup — who you are and where this starts | 3 |
| 2 | 승 | It develops — the thing that was quiet gets loud | 3 |
| 3 | 전 | The turn — it goes somewhere nobody planned | 3 |
| 4 | 결 | The close — what you do with all of it | 3 |

The premise comes first, on the intro screen: a paragraph setting up the drama
the visitor is about to be in, so the first scene lands somewhere rather than
cold. It is deliberately unspecific about *who* the visitor is — that is the
result, and naming it up front would give the game away.

## Scoring

Unchanged in shape, with two arithmetic consequences of going from six answers
to twelve:

- **The pair balance is redone for forty-eight options.** Each option carries a
  primary axis at 10 and a secondary at 6, and the forty-eight are spread so
  each of the six axis pairs is reinforced by exactly eight of them. The
  six-question version needed exactly this discipline — without it romance and
  warmth fed each other and 첫사랑 took a quarter of every reading.
- **The temper needs an odd total again.** Twelve answers of ±1 always sum even,
  so nought is reachable, and nought is a tie that has to fall one way. As with
  six, exactly one scene carries ±2 so the total can never be zero. It is the
  last scene of 결, for the same reason it was the finale before: what someone
  does at the end says more about their temper than how they walked in.

The bounds the check enforces are the ones already shipped: no type above 20% of
answer sets, none below 2%, neither temper below 40%.

## Checking twelve scenes

The six-question version walked all 4⁶ = 4,096 combinations exhaustively. 4¹² is
sixteen million and `npm run check` currently finishes in about four seconds;
walking them all would end that.

**A deterministic stride sample instead.** Enumerate combination indices
`0, 997, 1994, …` up to 4¹², decoding each index into twelve answers. 997 is
prime and coprime with 4¹², so the stride visits every residue class and cannot
land on a repeating pattern of options — a stride of 1000 would hit the same
option in the last scene every time. That is about 16,800 samples, which runs in
well under a second and is more than enough to bound a twelve-way distribution.

The sample is a fixed sequence, not a random one: the same check run twice
inspects the same 16,800 paths, so a failure is reproducible.

## The screen

The question screens keep the shape they have — same option buttons, same
disabled-until-answered Next, same Back that remembers. Three things are added:

- **the act card**, shown between acts: the act's name in Korean and English,
  and the recap line. One tap to continue. It is the only place the visitor
  stops, and it is what makes the twelve scenes feel like four acts rather than
  a long list.
- **the progress rail becomes two rows** — four act marks, and three scene marks
  within the current act. Twelve dots in a line reads as "ten more to go", which
  is the feeling this is trying to avoid.
- **the premise**, on the intro, above the start button.

## Copy

| | Now | After |
|---|---|---|
| scene titles | 6 | 12 |
| options | 24 | 48 |
| act names | — | 4 |
| recap lines | — | 12 |
| premise | — | 1 |
| **total strings** | **30** | **77** |

Roughly two and a half times, in `en` and `ko`, with `vi` and `th` carrying the
English as every locale file on this site does.

The twelve type sentences, six role names, two tempers and four axis names are
untouched — they describe the result, and the result has not changed.

## Migration

`kdramaAnswers` grows from six slots to twelve and `QUESTIONS` from six entries
to twelve. Nothing persists between sessions, so there is no stored state to
migrate; a visitor mid-quiz when this deploys starts again, which is acceptable
for a test that takes two minutes.

The six existing scenes are kept and redistributed across the acts rather than
discarded — they were written and reviewed, and their situations are good. Six
new ones join them, and all forty-eight options get their weights reassigned by
the pair-balance rule above.

## The check

Extends `scripts/kdrama.check.ts`:

- twelve scenes, four options each, ids unique
- exactly three scenes per act, four acts, in 기승전결 order
- each of the six axis pairs is the primary-plus-secondary of exactly eight options
- exactly one scene carries a ±2 temper, so a tie is impossible
- the stride sample of ~16,800 paths: every type reachable, none above 20%, none
  below 2%, neither temper below 40%
- the dominant axis of an act is computed from that act's three answers only,
  and a tie between two axes resolves in `AXES` order
- all four axes are reachable as an act's dominant axis, for each of acts 1–3 —
  otherwise a recap line exists that nobody can ever see
- twelve recap lines, four act names and the premise resolve in all four languages
- no recap line contains a prediction: none of them may mention the role names

## Deliberately not built

- **Real branching.** Sixteen million paths, or a fragment stitcher that reads
  like one. The three act openings are where the story visibly responds, and
  that is enough to feel answered.
- **Carrying more than one value between acts.** Two values would be sixteen
  recap lines per act and a combinatorial argument about which pairs are
  possible. One dominant axis is legible and writable.
- **Letting the visitor go back across an act boundary.** Back works within an
  act. Crossing back would mean recomputing a recap the visitor has already
  read, which reads as the story rewriting itself.
- **A different result model.** Roles, tempers, types, the card and the name draw
  are all unchanged. This is a new front on a room that already works.
