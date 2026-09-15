# K-Drama, rebuilt so a Korean recognises it

Date: 2026-09-15
Status: approved, not yet implemented
Supersedes: [`2026-09-14-kdrama-acts-design.md`](2026-09-14-kdrama-acts-design.md)
and the twelve scenes it produced

## What is wrong with the room as it ships

A Korean read the twelve scenes and could not follow them. That is the whole
report and it is enough.

What I wrote was not a Korean drama. It was *what an English speaker imagines a
Korean drama is*: twelve abstractions with no furniture in them.

> 몰랐어야 할 걸 알게 됐습니다.
> 둘 중 하나. 어느 쪽이든 이 화는 여기서 끝납니다.
> 서로 말이 엇갈렸고, 연락이 끊겼습니다.

Nothing there is Korean. No office, no 회식, no 옥상, no 어머니, no 봉투, no
소주, no 병실. Strip the Hangul and it could be any drama in any country, which
means it is not this one. A K-drama is made of its furniture, and I wrote none
of it.

The register is the second half. It reads like a novel from thirty years ago
rather than like someone talking, and the previous rewrite only got partway
there.

## Three changes

### 1. The scenes are made of real K-drama furniture

Every scene is a beat a Korean would name instantly and a foreigner who has
watched one drama would recognise. The vocabulary this room is built from:

회식 · 포장마차 · 옥상 · 병실 복도 · 엘리베이터 · 동창회 · 사수와 인턴 ·
재벌 3세 · 비서 · 계약 연애 · 어머니와 봉투 · 손목 잡기 · 우산 · 첫눈 ·
백허그 · 라면 먹고 갈래 · 소주 한 잔

**The test for every scene: could you screenshot it and have a Korean say
"아 그거"?** If the answer is no, it is not in.

### 2. The visitor's name goes into the scenes

The room asks for a name first, and some scenes speak to the visitor by it:

> 회식 2차. 부장이 마이크를 쥐여주며 "**{name}** 씨, 한 곡 해야지."
> "**{name}** 씨." 뒤에서 부르는 소리에 돌아보니 그 사람이다.

Not every scene — a name in all twelve is a gimmick. Roughly half, and always
where a Korean would actually use one: being called, being introduced, being
told off. The other half are pure situation.

**The name is used in the language it reads best in.** In Korean the Hangul that
`hangulFor()` already produces — 사라 씨, not Sarah 씨. In the other three, the
visitor's own spelling. The site already has both.

A scene with no name in it must read correctly on its own, so the placeholder is
per-scene copy, not a wrapper.

### 3. The result does not hand out a name

The card gives the role, the temper, the four meters and the type sentence. **No
name.** That was borrowed from the name generator and it muddied both rooms:
this one is a casting test, and a name arriving at the end invited the reading
that the name was the point. `src/utils/kdramaName.ts` and its pools go away
entirely.

Which also means the visitor's own name, the one they typed at the start, is the
only name in the room — it appears in the scenes and on the card as *who was
cast*, not as a gift.

## What does not change

The engine is untouched and this is deliberate — it was measured, it is even,
and none of the complaints are about it:

- four axes, `romance / presence / warmth / mischief`
- six roles from the six axis pairs, two tempers, twelve types
- the 기승전결 shape: four acts of three scenes
- one primary axis per option per scene, secondary rotating by scene index
- the finale's doubled temper, so a tie cannot happen
- the distribution bounds: no type above 20%, none below 2%, tempers within
  40–60%, checked over the 997-stride sample

Only the words change, plus the name field at the front and the name coming off
the back.

## The twelve scenes

| Act | Scene | Beat | Name |
|---|---|---|---|
| 기 | `intern` | First day. Your 사수 introduces you to the team. | yes |
| 기 | `elevator` | Stuck in the lift with the one person you've been avoiding. | — |
| 기 | `rumour` | The office group chat has decided something about you two. | yes |
| 승 | `hoesik` | 회식 2차. The 부장 puts a microphone in your hand. | yes |
| 승 | `rooftop` | They're on the roof, alone, and they've clearly been crying. | — |
| 승 | `rival` | The 재벌 3세 who owns the building has noticed them too. | — |
| 전 | `mother` | Their mother asks to meet you. She brings an envelope. | yes |
| 전 | `hospital` | Hospital corridor, 2am, and nobody has told you anything. | — |
| 전 | `contract` | They offer you a deal: pretend, for three months. | yes |
| 결 | `snow` | First snow, and you both remember what that was supposed to mean. | — |
| 결 | `wrist` | They take your wrist in front of everyone. | — |
| 결 | `ramyeon` | It's late and they ask if you want to come up for ramyeon. | yes |

Six carry the name, six do not. The acts keep the arc the previous version
established — meeting, closing in, breaking, deciding — but every beat is now
one a Korean can name.

**어머니와 봉투 is in on purpose.** It is the single most recognisable scene in
the genre, and a foreigner who learns only one thing from this room should learn
that one.

## The copy

The register the site moved to, taken further: short, spoken, current, no
literary flourish, no slang with a shelf life. The failure mode to write away
from, from the current file:

| now | the problem |
|---|---|
| 몰랐어야 할 걸 알게 됐습니다 | abstract; no room, no object, no person |
| 판이 다시 짜입니다 | nobody says this |
| 계속 생각나는 쪽 | vague where a scene should be concrete |

A scene title should put the reader somewhere. Four options should be four
things a person would actually do in that room.

The twelve type sentences and twelve recap lines are rewritten to match — the
recaps still describe rather than predict, and still may not name a role.

| | Now | After |
|---|---|---|
| premise | 1 | 1 |
| act names | 4 | 4 |
| scene titles | 12 | 12 |
| options | 48 | 48 |
| recap lines | 12 | 12 |
| type sentences | 12 | 12 |
| name field labels | — | 3 |
| **strings** | **89** | **92** |

Almost all of it is rewritten rather than added, so the work is writing, not
plumbing.

## The check

`scripts/kdrama.check.ts` keeps every structural and distribution assertion it
has. Added:

- exactly six scenes carry `{name}`, and each one's copy contains the
  placeholder in all four languages — a scene that reads as name-bearing in
  English and not in Korean is a scene one language tells differently
- no scene title or option contains `{name}` in a language where the scene is
  not marked name-bearing
- the six scenes without a name carry the placeholder in no language
- the name the room was given is never reachable from the result card's copy
  keys — the result has no name slot at all
- `src/utils/kdramaName.ts` is gone, and nothing imports it
- the room refuses to start with an empty name, the same way the impression
  room refuses to score one

## Deliberately not built

- **A name in the result.** It is the name generator's job, that room does it
  better, and having both blurred each.
- **Changing the engine.** Four axes, six roles, twelve types, the stride
  sample and the bounds were all measured and are all fine. The complaints are
  about words.
- **More scenes.** Twelve is the length that finishes.
- **Honorific grammar around the name.** `{name} 씨` is written into the copy
  where it belongs rather than assembled at runtime; Korean address is not
  something to generate from a template.
