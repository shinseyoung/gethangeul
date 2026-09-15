/**
 * Six situations from a day in Korea, in place of four lists of adjectives.
 *
 * The room used to ask "which vibe do you want" and hand a visitor a job they
 * have no way to do: nobody outside Korea knows what 서연 sounds like, so being
 * asked to choose between sounding like 서연 and sounding like 강우 is being
 * asked to guess. A situation they can answer from their own life, mapped by
 * the site onto sounds they cannot judge, is the only honest direction for that
 * arrow.
 *
 * Every tag here is one `nameDatabase.ts` actually carries, and between them
 * they cover every tag it carries. Both halves are checked, because both halves
 * shipped broken: `natural` was offered on the vibe screen and is on none of
 * the 114 names, and `sky`, `sun` and `flower` are on 46 of them and were
 * offered nowhere.
 *
 * ## Why the tags are not on the variants
 *
 * Each situation is written three ways and a visit gets one of them, so coming
 * back is not the same quiz twice. The **tags belong to the situation** and the
 * variants only supply wording — which makes the important property structural
 * rather than remembered: whichever café scene you were shown, answering first
 * puts `strong, trendy` on the table. So
 *
 *   - the measured distribution cannot move, and the check still walks 4,096
 *     answer sets rather than 4,096 × 3⁶,
 *   - a shared card reproduces for whoever opens it, even though they will be
 *     reading different scenes than the person who sent it.
 *
 * A variant that wanted its own tags would be a different question, and it
 * would have to be a seventh situation instead.
 */

export interface Variant {
  id: string;
  /** four option ids, in the situation's tag order */
  options: [string, string, string, string];
}

export interface Situation {
  id: string;
  /** which field of NameItem this question's tags are read against */
  axis: 'vibes' | 'personalities' | 'nature';
  /** the four tag sets, in option order — the same whichever variant is shown */
  tags: string[][];
  variants: Variant[];
}

const v = (id: string, ...options: string[]): Variant =>
  ({ id, options: options as unknown as Variant['options'] });

export const SITUATIONS: Situation[] = [
  /* The barista question is real — cafés here call your name rather than buzz a
     pager, and a foreign name is exactly what causes the pause this room exists
     to solve. It goes first on purpose: it is the whole room in one. */
  {
    id: 'cup',
    axis: 'vibes',
    tags: [['strong', 'trendy'], ['bright', 'trendy'], ['calm', 'mystic'], ['soft', 'lovely']],
    variants: [
      v('order', 'own', 'short', 'korean', 'whatever'),
      v('mispronounce', 'repeat', 'adopt', 'nod', 'prettier'),
      v('regular', 'usual', 'newthing', 'sameseat', 'theirname'),
    ],
  },
  {
    id: 'train',
    axis: 'personalities',
    tags: [['considerate', 'upright'], ['genuine', 'sensitive'],
      ['graceful', 'prudent'], ['whimsical', 'inquisitive']],
    variants: [
      v('grandmother', 'standup', 'tap', 'gesture', 'pretend'),
      v('sleeper', 'still', 'wake', 'shift', 'almost'),
      v('lost', 'walkthem', 'honest', 'mapit', 'wherefrom'),
    ],
  },
  {
    id: 'dinner',
    axis: 'personalities',
    tags: [['upright', 'dependable'], ['considerate', 'graceful'],
      ['inquisitive', 'genuine'], ['radiant', 'enterprising']],
    variants: [
      v('pour', 'twohands', 'pourback', 'ask', 'toast'),
      v('lastbite', 'leaveit', 'offerit', 'askname', 'rps'),
      v('noraebang', 'knowone', 'singalong', 'learnit', 'dancefirst'),
    ],
  },
  {
    id: 'lift',
    axis: 'vibes',
    tags: [['bright', 'strong'], ['lovely', 'bright'], ['calm', 'soft'], ['mystic', 'strong']],
    variants: [
      v('closing', 'run', 'wave', 'wait', 'stairs'),
      v('full', 'squeeze', 'sorry', 'next', 'silentin'),
      v('button', 'askfloor', 'smilepress', 'quietpress', 'already'),
    ],
  },
  {
    id: 'market',
    axis: 'personalities',
    tags: [['upright', 'resilient'], ['genuine', 'radiant'],
      ['considerate', 'dependable'], ['enterprising', 'prudent']],
    variants: [
      v('extra', 'insist', 'accept', 'return', 'regular'),
      v('haggle', 'asked', 'smileask', 'buymore', 'checkfirst'),
      v('change', 'goback', 'handback', 'nexttime', 'countit'),
    ],
  },
  /* Three tags an option rather than two: eleven nature tags cannot be covered
     by four options carrying one each, and leaving three of them uncovered is
     precisely the bug this replaces. */
  {
    id: 'evening',
    axis: 'nature',
    tags: [['river', 'summer', 'sky'], ['mountain', 'forest', 'autumn'],
      ['sea', 'sun', 'winter'], ['flower', 'spring', 'sky']],
    variants: [
      v('lastnight', 'hangang', 'bukhansan', 'sea', 'alley'),
      v('photo', 'bridge', 'throughtrees', 'wintersun', 'wallflower'),
      v('weather', 'summerwind', 'autumnleaves', 'winterclear', 'springday'),
    ],
  },
];

/** How many ways each situation is written. The same for all six. */
export const VARIANT_COUNT = SITUATIONS[0].variants.length;

/** One option index per situation, null until answered. */
export type Answers = (number | null)[];

/** Which telling of each situation this visit is getting. */
export type Variants = number[];

/** A fresh draw, one variant per situation. */
export function drawVariants(): Variants {
  return SITUATIONS.map((s) => Math.floor(Math.random() * s.variants.length));
}

export interface ProfileTag {
  tag: string;
  axis: Situation['axis'];
  /** the situation it came from, so the card can say which answer pointed here */
  from: string;
}

/**
 * Every tag the visitor's six answers put on the table.
 *
 * It does not take the variants, and that is the point: what you answered is
 * what counts, not which wording you happened to be shown.
 */
export function profileOf(answers: Answers): ProfileTag[] {
  const out: ProfileTag[] = [];
  SITUATIONS.forEach((situation, i) => {
    const tags = situation.tags[answers[i] ?? -1];
    if (!tags) return;
    for (const tag of tags) out.push({ tag, axis: situation.axis, from: situation.id });
  });
  return out;
}

/** The option id at `option` of the telling this visit got for situation `i`. */
export function optionIdAt(i: number, variant: number, option: number): string | null {
  return SITUATIONS[i]?.variants[variant]?.options[option] ?? null;
}
