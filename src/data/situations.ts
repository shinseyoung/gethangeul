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
 */

export interface Option {
  id: string;
  /** tags from nameDatabase, all from the situation's own axis */
  tags: string[];
}

export interface Situation {
  id: string;
  /** which field of NameItem this question's tags are read against */
  axis: 'vibes' | 'personalities' | 'nature';
  options: Option[];
}

export const SITUATIONS: Situation[] = [
  /* The barista question is real — cafés here call your name rather than buzz a
     pager, and a foreign name is exactly what causes the pause this room
     exists to solve. It goes first on purpose: it is the whole room in one. */
  { id: 'cup', axis: 'vibes', options: [
    { id: 'own', tags: ['strong', 'trendy'] },
    { id: 'short', tags: ['bright', 'trendy'] },
    { id: 'korean', tags: ['calm', 'mystic'] },
    { id: 'whatever', tags: ['soft', 'lovely'] },
  ] },
  { id: 'train', axis: 'personalities', options: [
    { id: 'standup', tags: ['considerate', 'upright'] },
    { id: 'tap', tags: ['genuine', 'sensitive'] },
    { id: 'gesture', tags: ['graceful', 'prudent'] },
    { id: 'pretend', tags: ['whimsical', 'inquisitive'] },
  ] },
  { id: 'dinner', axis: 'personalities', options: [
    { id: 'twohands', tags: ['upright', 'dependable'] },
    { id: 'pourback', tags: ['considerate', 'graceful'] },
    { id: 'ask', tags: ['inquisitive', 'genuine'] },
    { id: 'toast', tags: ['radiant', 'enterprising'] },
  ] },
  { id: 'lift', axis: 'vibes', options: [
    { id: 'run', tags: ['bright', 'strong'] },
    { id: 'wave', tags: ['lovely', 'bright'] },
    { id: 'wait', tags: ['calm', 'soft'] },
    { id: 'stairs', tags: ['mystic', 'strong'] },
  ] },
  { id: 'market', axis: 'personalities', options: [
    { id: 'insist', tags: ['upright', 'resilient'] },
    { id: 'accept', tags: ['genuine', 'radiant'] },
    { id: 'return', tags: ['considerate', 'dependable'] },
    { id: 'regular', tags: ['enterprising', 'prudent'] },
  ] },
  /* Three tags an option rather than two: eleven nature tags cannot be covered
     by four options carrying one each, and leaving three of them uncovered is
     precisely the bug this replaces. */
  { id: 'evening', axis: 'nature', options: [
    { id: 'hangang', tags: ['river', 'summer', 'sky'] },
    { id: 'bukhansan', tags: ['mountain', 'forest', 'autumn'] },
    { id: 'sea', tags: ['sea', 'sun', 'winter'] },
    { id: 'alley', tags: ['flower', 'spring', 'sky'] },
  ] },
];

/** One option index per situation, null until answered. */
export type Answers = (number | null)[];

export interface ProfileTag {
  tag: string;
  axis: Situation['axis'];
  /** the situation it came from, so the card can say which answer pointed here */
  from: string;
}

/** Every tag the visitor's six answers put on the table. */
export function profileOf(answers: Answers): ProfileTag[] {
  const out: ProfileTag[] = [];
  SITUATIONS.forEach((situation, i) => {
    const option = situation.options[answers[i] ?? -1];
    if (!option) return;
    for (const tag of option.tags) out.push({ tag, axis: situation.axis, from: situation.id });
  });
  return out;
}
