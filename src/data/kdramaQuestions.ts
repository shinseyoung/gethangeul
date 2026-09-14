import type { Axis } from '../utils/kdramaCasting';

export interface Option {
  id: string;
  /** axis points this answer adds; omitted axes add nothing */
  weights: Partial<Record<Axis, number>>;
  /** +1 leans 직진, -1 leans 신중; summed across answers, the sign picks the temper */
  temper: number;
}

export interface Question {
  id: string;
  options: Option[];
}

/**
 * Six situations, not four and not ten.
 *
 * Four cannot separate twelve outcomes; by ten the visitor is answering to
 * finish rather than to answer.
 *
 * The questions ask what someone would *do*, never which part they would like
 * to play. Picking 라이벌 and being told you are the rival is a form, not a
 * test, and gives nobody a reason to answer differently next time.
 *
 * Each option carries a primary axis at 10 and a secondary at 6, and the twenty-
 * four options are spread so every one of the six axis pairs is reinforced by
 * exactly four of them. Without that discipline romance and warmth kept feeding
 * each other and a quarter of all answer sets came out 첫사랑.
 *
 * The finale's temper counts double. Five answers of ±1 always sum to an odd
 * number, so adding one even weight means the total can never be zero — and a
 * zero was a tie, which had to fall one way and made 신중 two thirds of every
 * reading. Weighing the last scene heaviest is also the honest choice: how
 * someone wants their story to end says more about them than how they walk into
 * a room.
 *
 * The weights are a first tuning. The check asserts what the outcomes must do —
 * every role reachable, no type taking more than a quarter of all answer sets —
 * and never what the numbers are, so they can be moved freely.
 */
export const QUESTIONS: Question[] = [
  {
    id: 'arrival',
    options: [
      { id: 'centre', weights: { presence: 10, mischief: 6 }, temper: 1 },
      { id: 'edge', weights: { warmth: 10, presence: 6 }, temper: -1 },
      { id: 'joke', weights: { mischief: 10, warmth: 6 }, temper: 1 },
      { id: 'observe', weights: { presence: 10, romance: 6 }, temper: -1 },
    ],
  },
  {
    id: 'jealousy',
    options: [
      { id: 'walkover', weights: { romance: 10, presence: 6 }, temper: 1 },
      { id: 'wait', weights: { romance: 10, warmth: 6 }, temper: -1 },
      { id: 'tease', weights: { mischief: 10, romance: 6 }, temper: 1 },
      { id: 'leave', weights: { presence: 10, warmth: 6 }, temper: -1 },
    ],
  },
  {
    id: 'microphone',
    options: [
      { id: 'sing', weights: { presence: 10, mischief: 6 }, temper: 1 },
      { id: 'dedicate', weights: { romance: 10, warmth: 6 }, temper: -1 },
      { id: 'pass', weights: { warmth: 10, mischief: 6 }, temper: -1 },
      { id: 'comedy', weights: { mischief: 10, romance: 6 }, temper: 1 },
    ],
  },
  {
    id: 'late',
    options: [
      { id: 'scold', weights: { presence: 10, mischief: 6 }, temper: 1 },
      { id: 'order', weights: { warmth: 10, mischief: 6 }, temper: -1 },
      { id: 'worry', weights: { warmth: 10, presence: 6 }, temper: -1 },
      { id: 'prank', weights: { mischief: 10, romance: 6 }, temper: 1 },
    ],
  },
  {
    id: 'umbrella',
    options: [
      { id: 'share', weights: { romance: 10, warmth: 6 }, temper: 1 },
      { id: 'give', weights: { warmth: 10, presence: 6 }, temper: -1 },
      { id: 'run', weights: { mischief: 10, romance: 6 }, temper: 1 },
      { id: 'wait', weights: { presence: 10, romance: 6 }, temper: -1 },
    ],
  },
  {
    id: 'finale',
    options: [
      { id: 'reunion', weights: { romance: 10, presence: 6 }, temper: 2 },
      { id: 'letter', weights: { romance: 10, warmth: 6 }, temper: -2 },
      { id: 'toast', weights: { warmth: 10, mischief: 6 }, temper: 2 },
      { id: 'stare', weights: { presence: 10, mischief: 6 }, temper: -2 },
    ],
  },
];
