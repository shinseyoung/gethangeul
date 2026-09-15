# K-Drama Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the K-Drama room so a Korean recognises every scene, the visitor's own name appears in six of the twelve, and the result hands out no name.

**Architecture:** Three changes to one room, and the casting engine is not one of them. The twelve scenes keep their positions, their weights and their tempers exactly — only their ids and their words change, so the measured distribution is arithmetically identical before and after. A name field goes on the front of the room and the generated name comes off the back.

**Tech Stack:** React 19, TypeScript, Zustand, Tailwind 3, Vite 8. No test framework — `npm run check` bundles `scripts/*.check.ts` with rolldown and runs them; `npm run build` is `tsc -b && vite build`.

**Spec:** [`docs/superpowers/specs/2026-09-15-kdrama-rebuild-design.md`](../specs/2026-09-15-kdrama-rebuild-design.md)

## Global Constraints

- **The engine does not change.** Four axes `romance / presence / warmth / mischief`; six roles from the six axis pairs; two tempers; twelve types; four acts of three scenes in 기승전결; the 997-stride sample; the bounds (no type above 20%, none below 2%, tempers within 40–60%).
- **Every weight and temper block stays byte-identical** to what ships today, in its current position. Only `id` fields and copy change. See "Why no number moves" below.
- **The test for a scene: could you screenshot it and have a Korean say "아 그거"?** If no, it is not in.
- **Exactly six scenes carry `{name}`**, and the same six in all four languages.
- **The result card has no name slot at all.** `src/utils/kdramaName.ts` is deleted and nothing imports it.
- **Register:** short, spoken, current. No literary flourish, no slang with a shelf life. The failure mode to write away from is the file being replaced — `몰랐어야 할 걸 알게 됐습니다`, `판이 다시 짜입니다`, `계속 생각나는 쪽`: abstract, no room, no object, no person.
- **Honorifics are written into the copy, not assembled at runtime.** `{name} 씨` where it belongs; never a template that bolts 씨 onto whatever arrives.
- Korean is the register reference. **Do not translate the English clause by clause** — write each language for its own reader.

---

## Why no number moves

Read the weight and temper blocks in `src/data/kdramaQuestions.ts` and they are fully determined by scene position, not by scene subject:

```
option i of scene s:  primary   = AXES[i]                      weight 10
                      secondary = AXES[(i + 1 + (s % 3)) % 4]  weight 6
                      temper    = (s + i) even ? +1 : -1,  doubled in scene 11
```

Verified against every one of the forty-eight shipped options. So a rebuild that keeps the twelve scenes in their twelve positions can **keep all twelve `weights`/`temper` blocks exactly as written and change only the `id` strings around them.** The distribution cannot drift, because no input to it moves.

That is the whole reason this is a copy job. Do not recompute the weights "to be sure" — retyping them is the only way this plan introduces a distribution bug.

## The twelve scenes

Positions are the existing positions. `name` marks the six that carry `{name}`.

| # | act | id | beat | name |
|---|---|---|---|---|
| 0 | 기 | `intern` | First day; your 사수 introduces you to the team | ✔ |
| 1 | 기 | `elevator` | Stuck in the lift with the one person you have been avoiding | |
| 2 | 기 | `rumour` | The office group chat has decided something about you two | ✔ |
| 3 | 승 | `hoesik` | 회식 2차; the 부장 puts a microphone in your hand | ✔ |
| 4 | 승 | `rooftop` | They are on the roof alone and have clearly been crying | |
| 5 | 승 | `rival` | The 재벌 3세 who owns the building has noticed them | |
| 6 | 전 | `mother` | Their mother asks to meet you; she brings an envelope | ✔ |
| 7 | 전 | `hospital` | Hospital corridor, 2am, and nobody has told you anything | |
| 8 | 전 | `contract` | They offer you a deal: pretend, for three months | ✔ |
| 9 | 결 | `snow` | First snow, and you both remember what that meant | |
| 10 | 결 | `wrist` | They take your wrist in front of everyone | |
| 11 | 결 | `ramyeon` | It is late and they ask if you want to come up for ramyeon | ✔ |

`rumour` and `rival` keep their ids; their copy is rewritten like the rest.

## File Structure

| File | Responsibility |
|---|---|
| `src/data/kdramaQuestions.ts` | modify — twelve new scene ids, new option ids, a `name: boolean` per scene. Weights and tempers untouched. |
| `src/store/useFlowStore.ts` | modify — add `kdramaName` + `setKdramaName`; remove `kdramaReroll` and `bumpKdramaReroll`. |
| `src/utils/kdramaName.ts` | **delete** |
| `src/data/locales/{en,ko,vi,th}/kdrama.json` | modify — all scene copy, recaps, type sentences, premise rewritten; name-field labels added; `reroll` removed. |
| `src/steps/KdramaScreen.tsx` | modify — name field on the intro, `{name}` interpolation in the scenes, name block off the card. |
| `scripts/kdrama.check.ts` | modify — name-pool assertions out, `{name}` assertions in. |

---

### Task 1: The scene table and the name in the store

**Files:**
- Modify: `src/data/kdramaQuestions.ts`
- Modify: `src/store/useFlowStore.ts`
- Delete: `src/utils/kdramaName.ts`
- Modify: `scripts/kdrama.check.ts`

**Interfaces:**
- Produces: `Question` gains `name: boolean`. Scene ids `intern, elevator, rumour, hoesik, rooftop, rival, mother, hospital, contract, snow, wrist, ramyeon` in that order. Store gains `kdramaName: string` and `setKdramaName(name: string): void`; loses `kdramaReroll: number` and `bumpKdramaReroll(): void`.
- Consumes: nothing new.

- [ ] **Step 1: Write the failing assertions**

In `scripts/kdrama.check.ts`, **delete** the whole block under `// --- the name that comes with the casting ---` (from the `const ROLES: Role[]` line's following comment down to the end of the wild-seed loop) **except** the `const ROLES: Role[] = [...]` declaration itself, which later blocks use. Delete the `nameFor, namePool` import. Remove `'reroll'` from the `SHELL` array.

Then add, before the report block:

```ts
// --- the visitor's name in the scenes --------------------------------------
// Six of twelve, and the same six everywhere. A scene that reads as
// name-bearing in English and not in Korean is a scene one language is telling
// differently, which is worse than a scene with no name in it at all.

const NAMED = QUESTIONS.filter((q) => q.name);
ok('exactly six scenes carry a name', NAMED.length === 6, NAMED.map((q) => q.id));
ok('the named scenes are spread across the acts',
  new Set(NAMED.map((q) => q.act)).size === 4, NAMED.map((q) => q.act));

for (const [lang, dict] of [['en', enK], ['ko', koK], ['vi', viK], ['th', thK]] as const) {
  const d = dict as Record<string, any>;
  for (const q of QUESTIONS) {
    const title = (d.q?.[q.id]?.title ?? '') as string;
    const options = Object.values(d.q?.[q.id]?.options ?? {}) as string[];
    const carries = title.includes('{name}') || options.some((o) => o.includes('{name}'));
    ok(`${lang}: q.${q.id} carries {name} exactly when the scene is marked`,
      carries === q.name, { id: q.id, marked: q.name, carries });
  }
  ok(`${lang}: kdrama.name_label`, typeof d.name_label === 'string' && d.name_label.length > 0);
  ok(`${lang}: kdrama.name_placeholder`,
    typeof d.name_placeholder === 'string' && d.name_placeholder.length > 0);
  ok(`${lang}: kdrama.name_hint`, typeof d.name_hint === 'string' && d.name_hint.length > 0);
}

// The result is a casting, not a gift. No copy the card renders may carry a
// name slot, and the module that used to supply one is gone.
for (const [lang, dict] of [['en', enK], ['ko', koK], ['vi', viK], ['th', thK]] as const) {
  const d = dict as Record<string, any>;
  const card = [d.card_label, d.headline, ...Object.values(d.type ?? {})] as string[];
  ok(`${lang}: no card copy has a name slot`,
    card.every((s) => !String(s).includes('{name}')), card.filter((s) => String(s).includes('{name}')));
  ok(`${lang}: the reroll button is gone`, d.reroll === undefined);
}

// --- the weights did not move ---------------------------------------------
// The rebuild is a copy job. If a number moved, the measured distribution above
// is measuring something else than what was signed off.

ok('the weights still follow the position rule',
  QUESTIONS.every((q, s) => q.options.every((o, i) => {
    const primary = AXES[i];
    const secondary = AXES[(i + 1 + (s % 3)) % 4];
    const sign = (s + i) % 2 === 0 ? 1 : -1;
    const scale = s === QUESTIONS.length - 1 ? 2 : 1;
    return o.weights[primary] === 10 && o.weights[secondary] === 6
      && Object.keys(o.weights).length === 2 && o.temper === sign * scale;
  })),
  QUESTIONS.filter((q, s) => q.options.some((o, i) =>
    o.weights[AXES[i]] !== 10 || o.weights[AXES[(i + 1 + (s % 3)) % 4]] !== 6)).map((q) => q.id));
```

- [ ] **Step 2: Run the check to verify it fails**

Run: `npm run check`

Expected: FAIL — `Question` has no `name` property (a TypeScript error from rolldown), and the scene ids do not match.

- [ ] **Step 3: Rename the scenes and mark the six**

In `src/data/kdramaQuestions.ts`, add to the `Question` interface:

```ts
export interface Question {
  id: string;
  act: ActId;
  /** whether this scene speaks to the visitor by name — see the note below */
  name: boolean;
  options: Option[];
}
```

Add to the file's doc comment, after the paragraph about the option rule:

```
 * Six of the twelve speak to the visitor by name, and they are the six where a
 * Korean would actually use one: being introduced, being talked about, being
 * handed a microphone, being sized up by a mother, being asked for a favour,
 * being asked upstairs. A name in all twelve is a gimmick; a name in none is a
 * story about somebody else. The placeholder lives in the copy rather than in a
 * wrapper here, because `{name} 씨` is a thing you write, not a thing you
 * assemble — a scene with no name in it has to read correctly on its own.
```

Then, **for each of the twelve entries in order, change only the `id`, add `name:`, and change the four option `id`s.** Do not touch a single `weights` or `temper` value.

| # | old id | new id | `name` | option ids, in order |
|---|---|---|---|---|
| 0 | `arrival` | `intern` | `true` | `stare`, `brief`, `learn`, `mutter` |
| 1 | `notice` | `elevator` | `false` | `mirror`, `ask`, `hold`, `joke` |
| 2 | `rumour` | `rumour` | `true` | `sowhat`, `silence`, `offer`, `rename` |
| 3 | `alone` | `hoesik` | `true` | `ballad`, `stand`, `swap`, `tambourine` |
| 4 | `rival` | `rooftop` | `false` | `beside`, `coffee`, `tissue`, `weather` |
| 5 | `public` | `rival` | `false` | `overtime`, `between`, `defer`, `photo` |
| 6 | `secret` | `mother` | `true` | `refuse`, `return`, `listen`, `open` |
| 7 | `hurt` | `hospital` | `false` | `wait`, `family`, `porridge`, `talk` |
| 8 | `crossroads` | `contract` | `true` | `real`, `terms`, `why`, `rings` |
| 9 | `apology` | `snow` | `false` | `go`, `call`, `text`, `snowman` |
| 10 | `station` | `wrist` | `false` | `follow`, `greet`, `regrip`, `laugh` |
| 11 | `finale` | `ramyeon` | `true` | `stay`, `up`, `tomorrow`, `two` |

So entry 0 becomes:

```ts
  {
    id: 'intern',
    act: 'gi',
    name: true,
    options: [
      { id: 'stare', weights: { romance: 10, presence: 6 }, temper: 1 },
      { id: 'brief', weights: { presence: 10, warmth: 6 }, temper: -1 },
      { id: 'learn', weights: { warmth: 10, mischief: 6 }, temper: 1 },
      { id: 'mutter', weights: { mischief: 10, romance: 6 }, temper: -1 },
    ],
  },
```

and entry 11:

```ts
  {
    id: 'ramyeon',
    act: 'gyeol',
    name: true,
    options: [
      { id: 'stay', weights: { romance: 10, mischief: 6 }, temper: -2 },
      { id: 'up', weights: { presence: 10, romance: 6 }, temper: 2 },
      { id: 'tomorrow', weights: { warmth: 10, presence: 6 }, temper: -2 },
      { id: 'two', weights: { mischief: 10, warmth: 6 }, temper: 2 },
    ],
  },
```

- [ ] **Step 4: Put the name in the store and take the reroll out**

In `src/store/useFlowStore.ts`:

Add to the `FlowState` interface beside the other room fields:

```ts
  kdramaName: string;
  setKdramaName: (name: string) => void;
```

Remove `kdramaReroll: number;` and `bumpKdramaReroll: () => void;` from the interface.

In the store body, replace the reroll lines:

```ts
  kdramaAnswers: Array(12).fill(null),
  kdramaStep: 0,
  /* the visitor's own name, and the only name in the room. It is asked for
     before the first scene because six of them speak to it. */
  kdramaName: '',
  setKdramaName: (kdramaName) => set({ kdramaName }),
```

and drop `bumpKdramaReroll`. `resetKdrama` keeps the name — a visitor going round again is the same person:

```ts
  /* the casting is the result, so this clears the answers and sends the visitor
     back to the first scene. The name stays: they are still themselves. */
  resetKdrama: () => set({ kdramaAnswers: Array(12).fill(null), kdramaStep: 0 }),
```

In the header's logo handler (`src/components/layout/Header.tsx`) `s.resetKdrama()` is already what runs for the kdrama room; no change needed there.

- [ ] **Step 5: Delete the name module**

```bash
git rm src/utils/kdramaName.ts
```

Run: `npx tsc -b --noEmit 2>&1 | head` and confirm the only remaining errors are in `src/steps/KdramaScreen.tsx`, which Task 3 fixes.

- [ ] **Step 6: Run the check**

Run: `npm run check`

Expected: the distribution, role, type, act and recap blocks all PASS unchanged (they are reading the same numbers). The copy assertions FAIL — the locales still hold the old scene ids. That is Task 2.

- [ ] **Step 7: Commit**

```bash
git add src/data/kdramaQuestions.ts src/store/useFlowStore.ts scripts/kdrama.check.ts
git rm --cached src/utils/kdramaName.ts 2>/dev/null; git add -A src/utils
git commit -m "Rename the twelve scenes and give the room a name field"
```

---

### Task 2: The copy

**Files:**
- Modify: `src/data/locales/ko/kdrama.json`
- Modify: `src/data/locales/en/kdrama.json`
- Modify: `src/data/locales/vi/kdrama.json`
- Modify: `src/data/locales/th/kdrama.json`

**Interfaces:**
- Consumes: the scene and option ids from Task 1.
- Produces: `t('kdrama.name_label')`, `t('kdrama.name_placeholder')`, `t('kdrama.name_hint')`, and `q.<sceneId>.title` / `q.<sceneId>.options.<optionId>` for the twelve new scenes.

**Write Korean first.** This room is being rebuilt because the Korean did not read as Korean; English written first and translated is how it got that way.

- [ ] **Step 1: Write the twelve Korean scene titles**

In `src/data/locales/ko/kdrama.json`, replace the `q` object's twelve entries. The titles:

```json
"intern":   "첫 출근. 사수가 팀에 소개합니다. \"오늘부터 같이 일할 {name} 씨예요.\"",
"elevator": "하필 그 사람이랑 둘이 엘리베이터에 갇혔습니다. 12층까지 올라가야 합니다.",
"rumour":   "회사 단톡방이 이미 정해놨습니다. \"{name} 씨랑 그분, 둘이 뭐 있는 거 맞지?\"",
"hoesik":   "회식 2차. 부장님이 마이크를 쥐여줍니다. \"{name} 씨, 한 곡 해야지.\"",
"rooftop":  "옥상. 그 사람이 혼자 있고, 방금까지 운 게 보입니다.",
"rival":    "건물주 아들이 그 사람한테 관심을 보입니다. 차도 사람도 여기 사람 같지가 않습니다.",
"mother":   "그 사람 어머니가 만나자고 합니다. 앉자마자 봉투를 밀어 놓습니다. \"{name} 씨라고 했죠.\"",
"hospital": "새벽 두 시, 병원 복도. 아무도 당신한테 무슨 일인지 말해주지 않습니다.",
"contract": "\"{name} 씨. 딱 3개월만, 사귀는 척해 주면 안 돼요?\"",
"snow":     "첫눈이 옵니다. 첫눈 오면 보자고 했던 게, 둘 다 기억납니다.",
"wrist":    "사람들 다 보는 데서, 그 사람이 당신 손목을 잡습니다.",
"ramyeon":  "늦은 밤, 집 앞. \"{name} 씨, 라면 먹고 갈래요?\""
```

- [ ] **Step 2: Write the forty-eight Korean options**

Four per scene, in the option order Task 1 fixed. **The option order is the axis order** — option 1 leans `romance`, 2 `presence`, 3 `warmth`, 4 `mischief` — and the temper alternates by position, so each option must be a thing a person would actually do that *fits the axis and the lean it was given*. Look up each scene's tempers in `kdramaQuestions.ts` before writing it: `+1` is 직진, `-1` is 신중.

Two scenes written out as the pattern. `intern` (tempers `+1, -1, +1, -1`):

```json
"intern": {
  "title": "첫 출근. 사수가 팀에 소개합니다. \"오늘부터 같이 일할 {name} 씨예요.\"",
  "options": {
    "stare": "인사하는 내내, 아까 복도에서 마주친 사람만 보인다",
    "brief": "짧게 인사하고, 묻는 말에만 또박또박 답한다",
    "learn": "한 명씩 눈 맞추면서 이름을 따라 불러 본다",
    "mutter": "\"잘 부탁드립니다\" 하고, 속으로 \"...살려주세요\""
  }
}
```

`mother` (tempers `+1, -1, +1, -1`):

```json
"mother": {
  "title": "그 사람 어머니가 만나자고 합니다. 앉자마자 봉투를 밀어 놓습니다. \"{name} 씨라고 했죠.\"",
  "options": {
    "refuse": "봉투를 그대로 두고 \"저는 그런 거 받을 생각 없습니다\"",
    "return": "봉투를 어머니 쪽으로 다시 밀고, 끝까지 존댓말로 듣는다",
    "listen": "\"걱정되시는 거 압니다\" 부터 말한다",
    "open": "봉투를 열어 보고 \"이걸로 뭐 하면 되죠?\""
  }
}
```

Write the other ten the same way. Each option is one thing a person does, in one line, with a room and an object in it where there can be one.

- [ ] **Step 3: Rewrite the Korean recaps, types and premise**

Twelve `recap` lines, twelve `type` sentences and the `premise`, in the same register. The recaps still describe rather than predict and still may not contain any string from `role` — the check enforces both. The types still have to read as twelve different people.

The premise now says what the room does with the name:

```json
"premise": "열두 장면. 사무실 하나, 계절 하나, 자꾸 같은 자리에서 마주치는 사람들. 몇 장면은 당신 이름을 부릅니다. 어떤 배역인지는 끝에서 알려드릴게요."
```

- [ ] **Step 4: Add the name field's three strings and drop `reroll`**

```json
"name_label": "이름",
"name_placeholder": "Sarah",
"name_hint": "몇 장면에서 이 이름을 부릅니다. 한글로 바꿔서 보여드려요.",
```

Delete the `"reroll"` key. Rewrite `disclaimer` so it no longer mentions the name that used to come with the casting:

```json
"disclaimer": "그냥 재미로 보는 겁니다. 장면 열두 개가 사람을 알 리 없어요."
```

- [ ] **Step 5: Write the English**

Same keys in `src/data/locales/en/kdrama.json`, written for an English reader who may never have watched a Korean drama — the scene has to carry itself. Keep the Korean nouns that are the point and let the sentence teach them:

```json
"hoesik": "Round two of the 회식. The 부장 puts a microphone in your hand. \"{name}, one song.\"",
"mother": "Their mother asks to meet you. She sits down and slides an envelope across. \"So you're {name}.\"",
"ramyeon": "Late, outside their building. \"{name} — want to come up for ramyeon?\""
```

`{name}` in the same six scenes and nowhere else. No `씨` in the English — the honorific is Korean grammar, and the check only asks that the same six scenes carry the placeholder.

```json
"name_label": "Your name",
"name_placeholder": "Sarah",
"name_hint": "A few scenes will call you by it.",
```

- [ ] **Step 6: Seed Vietnamese and Thai**

Copy the English file verbatim over `vi/kdrama.json` and `th/kdrama.json`, as every locale file on this site has been since the syllable dictionary. Note in the report that vi/th is placeholder.

- [ ] **Step 7: Run the check**

Run: `npm run check`

Expected: all kdrama checks pass except anything the screen still owns. If `carries {name} exactly when the scene is marked` fails, one language put the name in a different scene from the others — fix the copy, not the mark.

- [ ] **Step 8: Commit**

```bash
git add src/data/locales/*/kdrama.json
git commit -m "Write twelve scenes a Korean would recognise"
```

---

### Task 3: The screen

**Files:**
- Modify: `src/steps/KdramaScreen.tsx`

**Interfaces:**
- Consumes: `kdramaName`, `setKdramaName` from the store; `Question.name`; `hangulFor` from `src/utils/romanToHangul`.
- Produces: nothing other rooms read.

- [ ] **Step 1: Take the generated name out**

Delete the `nameFor` import, the `seed` memo, the `const name = ...` line, and `kdramaReroll` / `bumpKdramaReroll` from the destructured store. In the card, delete the two spans that render it:

```tsx
          <span className="mt-5 font-brush text-[40px] leading-none text-ink">{name.hangul}</span>
          <span className="eyebrow mt-2 text-[8.5px] tracking-[0.24em] text-ink-4">{name.id}</span>
```

Change the guard from `if (!casting || !name)` to `if (!casting)`. Delete the "no name reroll" comment above the `resetKdrama` button — there is no longer a name for it to be about.

Replace the component's doc comment's last paragraph, which describes the old behaviour:

```tsx
/**
 * K-Drama 이름 테스트 — the fourth room.
 *
 * The other three rooms read something you already have: a name you typed, two
 * names you picked. This one reads what you would *do*. It asks for a name
 * first, and six of the twelve scenes speak to you by it — the name is how you
 * are in the story, not what you get out of it. The result is a casting and
 * nothing else; handing out a name at the end is the name generator's job, and
 * having both blurred each.
 */
```

- [ ] **Step 2: Put the name field on the intro**

Add above the component, beside `MARK`:

```tsx
/** What the scenes call you: the Hangul the site already makes on a Korean
 *  page, your own spelling everywhere else. */
function displayName(name: string, lang: string): string {
  const trimmed = name.trim();
  if (lang !== 'ko') return trimmed;
  return hangulFor(trimmed)?.hangul ?? trimmed;
}
```

with `import { hangulFor } from '../utils/romanToHangul';` and `lang` pulled from the store alongside the rest.

In the `kdramaStep === 0` block, between the premise aside and the start button:

```tsx
        <div className="mt-7">
          <label htmlFor="kdrama-name" className="eyebrow mb-2 block text-[8.5px] text-ink-4">
            {t('kdrama.name_label')}
          </label>
          <input
            id="kdrama-name"
            type="text"
            value={kdramaName}
            onChange={(e) => setKdramaName(e.target.value)}
            placeholder={String(t('kdrama.name_placeholder'))}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="h-[56px] w-full rounded-2xl border-[1.5px] border-rule-strong bg-paper-hi px-5 font-disp text-[20px] text-ink caret-accent outline-none transition-colors duration-150 placeholder:font-body placeholder:text-[15px] placeholder:text-ink-4 focus:border-accent"
          />
          <span className="mt-2 block h-[22px] font-brush text-[19px] leading-none text-accent">
            {lang === 'ko' ? displayName(kdramaName, lang) : ''}
          </span>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-4">{t('kdrama.name_hint')}</p>
        </div>
```

and gate the start button, the way the impression room refuses to score an empty name:

```tsx
        <Button full className="mt-8" disabled={kdramaName.trim() === ''} onClick={() => setKdramaStep(1)}>
```

- [ ] **Step 3: Put the name into the scenes**

In the question block, the title and each option go through one replace. Immediately after `const recap = recapKey(act, kdramaAnswers);`:

```tsx
    /* the placeholder is in the copy, not around it, so a scene with no name in
       it needs no special case — replace finds nothing and the line stands */
    const who = displayName(kdramaName, lang);
    const named = (copy: unknown) => String(copy).replace('{name}', who);
```

Then `{t(...)}` becomes `{named(t(...))}` in the two places the scene copy is rendered — the `<h2>` title and the option `<span>`.

- [ ] **Step 4: Send an unnamed visitor back to the start**

A deep link to `/ko/kdrama` with a step already past the intro would render scenes addressed to nobody. Extend the existing guard at the top of the question block:

```tsx
  // the six named scenes have nothing to say without one
  if (kdramaStep > 0 && kdramaName.trim() === '') {
    setKdramaStep(0);
    return null;
  }
```

placed directly after the `const onCard = ...` line.

- [ ] **Step 5: Run the check and the build**

Run: `npm run check && npm run build`

Expected: both pass, no TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add src/steps/KdramaScreen.tsx
git commit -m "Ask for the name, use it in six scenes, hand none back"
```

---

## Browser verification (mine, after Task 3)

Not the implementer's — run these against the live preview before reporting done.

1. `/ko/kdrama` — the start button is disabled with the field empty, enabled once a name is typed, and the brush line under the field shows the Hangul.
2. Type `Sarah`, start, and read scene 1: it says `사라 씨` and not `Sarah 씨` or `{name}`.
3. Walk all twelve and confirm **no scene anywhere renders a literal `{name}`** — grep the rendered text:
   `[...document.querySelectorAll('h2,button span')].filter(e => e.textContent.includes('{name}'))` must be empty at every step.
4. The result card shows the headline, four meters and the type sentence, and **no name** — no brush glyph, no romanisation.
5. `/en/kdrama` with `Sarah` shows `Sarah`, not `사라`.
6. Reload `/ko/kdrama` mid-quiz with the name cleared and confirm it returns to the intro rather than rendering a scene addressed to nobody.
7. Distribution unchanged: `npm run check` prints the same type spread it did before Task 1. If it moved, a weight was retyped.

## Deliberately not built

- **A name in the result.** The name generator's job; that room does it better.
- **Changing the engine.** Every number is where the measurement left it.
- **Runtime honorific grammar.** `{name} 씨` is written into the Korean copy scene by scene; Korean address is not something to generate from a template.
- **More scenes.** Twelve is the length that finishes.
- **vi/th translations.** Placeholder English, as with every other room; the whole site's translations are one job, not five.
