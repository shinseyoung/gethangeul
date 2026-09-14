import type { ActId, Axis } from '../utils/kdramaCasting';

export interface Option {
  id: string;
  /** one primary axis at 10 and one secondary at 6 — see the rule below */
  weights: Partial<Record<Axis, number>>;
  /** +1 leans 직진, -1 leans 신중; summed across answers, the sign picks the temper */
  temper: number;
}

export interface Question {
  id: string;
  act: ActId;
  options: Option[];
}

/**
 * Twelve scenes in four acts, told in 기승전결 — and they are one story, not
 * twelve situations. The first version was twelve unrelated prompts dropped into
 * four buckets, and it read that way: a friend running an hour late is not a
 * turning point, whatever act you file it under. Now 기 puts two people in the
 * same room, 승 closes the distance and complicates it, 전 breaks it, 결 decides
 * it. Each scene only makes sense after the one before.
 *
 * The questions ask what someone would *do*, never which part they would like
 * to play. Picking 라이벌 and being told you are the rival is a form, not a
 * test, and gives nobody a reason to answer differently next time.
 *
 * **Every scene offers one option per axis, and the secondary rotates by scene
 * index.** That is not decoration. Balancing the six axis pairs across the set
 * as a whole is not enough: dealing the pairs in order gave one scene three
 * romance-primary options out of four, so that scene fed romance whatever you
 * picked, and one type took 26% of all answer sets against a 20% bound. With
 * the rotation the twelve types spread across 9.4% to 7.0%, an ideal being
 * 8.33%. Both figures are measured over the same 16,828-path stride sample the
 * check walks.
 *
 *   option i of scene s:  primary   = AXES[i]                      weight 10
 *                         secondary = AXES[(i + 1 + (s % 3)) % 4]  weight 6
 *
 * The numbers are written out rather than computed from that formula, so
 * someone retuning a single option can see and edit it. The check guards the
 * invariants whichever way they were produced.
 *
 * The finale's temper counts double. Eleven answers of ±1 always sum to an odd
 * number, so one even weight means the total can never be nought — and nought
 * was a tie, which had to fall one way and made 신중 two thirds of every
 * reading. Weighing the last scene heaviest is also the honest choice: what
 * someone does at the end says more than how they walked in.
 */
export const QUESTIONS: Question[] = [
  {
    id: 'arrival',
    act: 'gi',
    options: [
      { id: 'spot', weights: { romance: 10, presence: 6 }, temper: 1 },
      { id: 'centre', weights: { presence: 10, warmth: 6 }, temper: -1 },
      { id: 'known', weights: { warmth: 10, mischief: 6 }, temper: 1 },
      { id: 'joke', weights: { mischief: 10, romance: 6 }, temper: -1 },
    ],
  },
  {
    id: 'notice',
    act: 'gi',
    options: [
      { id: 'hold', weights: { romance: 10, warmth: 6 }, temper: -1 },
      { id: 'greet', weights: { presence: 10, mischief: 6 }, temper: 1 },
      { id: 'smile', weights: { warmth: 10, romance: 6 }, temper: -1 },
      { id: 'quip', weights: { mischief: 10, presence: 6 }, temper: 1 },
    ],
  },
  {
    id: 'rumour',
    act: 'gi',
    options: [
      { id: 'guess', weights: { romance: 10, mischief: 6 }, temper: 1 },
      { id: 'deny', weights: { presence: 10, romance: 6 }, temper: -1 },
      { id: 'shield', weights: { warmth: 10, presence: 6 }, temper: 1 },
      { id: 'feed', weights: { mischief: 10, warmth: 6 }, temper: -1 },
    ],
  },
  {
    id: 'alone',
    act: 'seung',
    options: [
      { id: 'stay', weights: { romance: 10, presence: 6 }, temper: -1 },
      { id: 'lead', weights: { presence: 10, warmth: 6 }, temper: 1 },
      { id: 'cover', weights: { warmth: 10, mischief: 6 }, temper: -1 },
      { id: 'derail', weights: { mischief: 10, romance: 6 }, temper: 1 },
    ],
  },
  {
    id: 'rival',
    act: 'seung',
    options: [
      { id: 'claim', weights: { romance: 10, warmth: 6 }, temper: 1 },
      { id: 'measure', weights: { presence: 10, mischief: 6 }, temper: -1 },
      { id: 'yield', weights: { warmth: 10, romance: 6 }, temper: 1 },
      { id: 'needle', weights: { mischief: 10, presence: 6 }, temper: -1 },
    ],
  },
  {
    id: 'public',
    act: 'seung',
    options: [
      { id: 'dedicate', weights: { romance: 10, mischief: 6 }, temper: -1 },
      { id: 'sing', weights: { presence: 10, romance: 6 }, temper: 1 },
      { id: 'pass', weights: { warmth: 10, presence: 6 }, temper: -1 },
      { id: 'clown', weights: { mischief: 10, warmth: 6 }, temper: 1 },
    ],
  },
  {
    id: 'secret',
    act: 'jeon',
    options: [
      { id: 'tell', weights: { romance: 10, presence: 6 }, temper: 1 },
      { id: 'own', weights: { presence: 10, warmth: 6 }, temper: -1 },
      { id: 'keep', weights: { warmth: 10, mischief: 6 }, temper: 1 },
      { id: 'deflect', weights: { mischief: 10, romance: 6 }, temper: -1 },
    ],
  },
  {
    id: 'hurt',
    act: 'jeon',
    options: [
      { id: 'reach', weights: { romance: 10, warmth: 6 }, temper: -1 },
      { id: 'stand', weights: { presence: 10, mischief: 6 }, temper: 1 },
      { id: 'wait', weights: { warmth: 10, romance: 6 }, temper: -1 },
      { id: 'lighten', weights: { mischief: 10, presence: 6 }, temper: 1 },
    ],
  },
  {
    id: 'crossroads',
    act: 'jeon',
    options: [
      { id: 'chase', weights: { romance: 10, mischief: 6 }, temper: 1 },
      { id: 'take', weights: { presence: 10, romance: 6 }, temper: -1 },
      { id: 'stay2', weights: { warmth: 10, presence: 6 }, temper: 1 },
      { id: 'gamble', weights: { mischief: 10, warmth: 6 }, temper: -1 },
    ],
  },
  {
    id: 'apology',
    act: 'gyeol',
    options: [
      { id: 'first', weights: { romance: 10, presence: 6 }, temper: -1 },
      { id: 'face', weights: { presence: 10, warmth: 6 }, temper: 1 },
      { id: 'gift', weights: { warmth: 10, mischief: 6 }, temper: -1 },
      { id: 'laugh', weights: { mischief: 10, romance: 6 }, temper: 1 },
    ],
  },
  {
    id: 'station',
    act: 'gyeol',
    options: [
      { id: 'run', weights: { romance: 10, warmth: 6 }, temper: 1 },
      { id: 'call', weights: { presence: 10, mischief: 6 }, temper: -1 },
      { id: 'write', weights: { warmth: 10, romance: 6 }, temper: 1 },
      { id: 'watch', weights: { mischief: 10, presence: 6 }, temper: -1 },
    ],
  },
  {
    id: 'finale',
    act: 'gyeol',
    options: [
      { id: 'reunion', weights: { romance: 10, mischief: 6 }, temper: -2 },
      { id: 'stare', weights: { presence: 10, romance: 6 }, temper: 2 },
      { id: 'letter', weights: { warmth: 10, presence: 6 }, temper: -2 },
      { id: 'toast', weights: { mischief: 10, warmth: 6 }, temper: 2 },
    ],
  },
];
