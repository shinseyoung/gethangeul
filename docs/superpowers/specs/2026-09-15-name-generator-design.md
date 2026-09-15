# 이름 짓기, rebuilt as a day in Korea

Date: 2026-09-15
Status: approved, not yet implemented
Supersedes: the four-question flow in `src/steps/StepOptions.tsx`

## The problem

The room asks four questions — gender, vibe, personality, nature — and each is a
list of adjectives. It is a form. A visitor picks "Serene & Poised" from a
column of eleven other adjectives, then "Autumn" from a column of eight, and a
name arrives with no visible relationship to either.

That is the complaint, and it is fair: **nothing in the flow is about Korea.**
The same four dropdowns would generate elf names or cocktail names. It is also
the site's front door, so it is the one room where feeling like a questionnaire
costs the most.

## What replaces it

**Six situations from a day in Korea**, then the family name.

Not "which vibe do you want" but: the barista asks for a name for your cup; you
are on the last train and someone's grandmother is standing; your Korean
colleague hands you a drink at the company dinner. Concrete, specific to being
here, and answerable without knowing anything about Korean naming.

The visitor never picks an adjective. They pick what they would *do*, and the
room reads the adjectives out of that.

### Why this and not "what should your name sound like"

Asking directly — *do you want to sound gentle or sharp* — is the same form with
better wording, and it hands the visitor a job they have no way to do. Nobody
outside Korea knows what 서연 sounds like, so being asked to choose between
sounding like 서연 and sounding like 강우 is being asked to guess.

A situation they can answer from their own life, mapped by the site onto sounds
they cannot judge, is the only honest direction for that arrow.

## Measured before writing this

From the live database, not assumed:

- pools by gender: **male 53, female 57, neutral 51** of 114 — none is thin.
- vibes actually carried by names: `calm` 47, `soft` 39, `bright` 39, `trendy` 34,
  `lovely` 28, `strong` 22, `mystic` 19. **Seven, not eight.**
- nature: `spring` 36, `summer` 28, `autumn` 28, `winter` 22, `river` 21,
  `forest` 21, `sky` 21, `sun` 14, `mountain` 14, `sea` 12, `flower` 11.
  **Eleven, not eight.**

### Two faults in the room as it stands today

**`natural` matches nothing.** The vibe screen offers "Understated & Easy",
which maps to the tag `natural`, and no name in the database carries it.
Choosing it narrows the pool to nothing and the flow falls back silently. It
has presumably been doing that since the option was written.

**`sky`, `sun` and `flower` are unreachable.** The nature screen offers eight of
the eleven tags, so 46 names carrying only those three can never be selected for
on that axis.

Both are fixed by construction here: the check asserts every tag an option
references exists in `nameDatabase.ts`, and that every name in a gender's pool
wins at least once across all 4,096 combinations. Neither fault could survive
that.

## The six situations

Each covers one of the axes the name database is already tagged along, so the
existing 114 names need no new data.

| # | Situation | Reads |
|---|---|---|
| 1 | The barista asks what name to write on the cup | how you want to be called — the whole room in one question, asked first on purpose |
| 2 | Last train, and someone's grandmother is standing | warmth |
| 3 | Company dinner, and a colleague pours you a drink | how you meet people |
| 4 | You are three minutes late and the lift is closing | pace |
| 5 | The 아주머니 at the market gives you extra and waves off the money | how you take a kindness |
| 6 | Your last evening in Seoul, and you can be anywhere | what you are drawn to — carries the `nature` tag the database already has |

**Gender is not asked as a question.** It is the one thing on the old flow that
genuinely is an admin field, and asking it first set the form tone for
everything after. It moves to the family-name screen as a quiet three-way
control beside the surname, where it reads as part of assembling the name
rather than as the first thing the site wants to know about you.

## How a situation becomes a name

Each option carries weights on the tags `NameItem` already has — `vibes`,
`personalities`, `nature` — and the six answers add up to a profile. The name
pool is every name in `nameDatabase.ts` matching the visitor's gender choice;
each is scored against the profile; the highest scoring wins.

**The reasoning is shown, not hidden.** The result already prints the name's
meaning; it now also prints one line saying which answers pointed at it — "you
gave the seat up and you took the extra without arguing, so: 은우, a name for
someone easy to be around". That is the same promise 이름궁합 makes by drawing
the stroke-count fold, and it is what stops the result feeling arbitrary, which
was the other half of the complaint.

### The tie the old flow had

Four questions over 114 names meant many visitors landed on the same name. Six
questions with weighted scoring spreads it, and the check enforces the spread
the same way the K-Drama room's does: **no single name may win for more than 8%
of all answer combinations**, and every name in the pool must be reachable.

4⁶ = 4,096 combinations per gender choice, walked exhaustively — small enough
not to need the K-Drama room's stride sample.

## The copy

Written in the register the site moved to: spoken, current, no literary
flourish and no slang with a shelf life. These situations are the first thing a
visitor reads, so they set the voice for the whole site.

**They must also be true.** A foreigner who has been to Korea should recognise
every one of the six, and one who has not should learn something from it. The
barista-name question is real — cafés in Korea ask, and a foreigner's name is
exactly what causes the pause this room exists to solve.

| | Now | After |
|---|---|---|
| question titles | 4 | 6 |
| options | 31 | 24 |
| reasoning lines | — | 12 |
| **total** | **35** | **42** |

Fewer options than today, because four fixed options per situation replaces the
old flow's eleven-adjective grids.

## What does not change

- `nameDatabase.ts`, its 114 names and its tags
- the surname screen, its sound matching and the forty-name list
- the result card, its share and download, and the rooms it hands off to
- `useMatches`, which still does the matching — its inputs change, not its job

## The check

Extends `scripts/matcher.check.ts`:

- six situations, four options each, ids unique
- every option moves at least one tag
- every tag an option references exists in `nameDatabase.ts` — a typo'd tag
  would silently narrow the pool
- across all 4,096 combinations per gender: every name in that gender's pool
  wins at least once, and none wins more than 8%
- the same answers always give the same name — no randomness
- the reasoning line names only answers the visitor actually gave
- all six titles, twenty-four options and twelve reasoning lines resolve in all
  four languages

## Deliberately not built

- **Free-text description.** "Tell us about yourself" is a blank page, and a
  blank page is worse than a form.
- **More than six.** This is the front door. K-Drama is the twelve-scene room,
  and two long quizzes on one site is one too many.
- **Asking the visitor to judge Korean sounds.** They cannot, and pretending
  otherwise is what makes a name feel arbitrary when it arrives.
- **New name data.** Six situations mapped onto the tags that already exist.
