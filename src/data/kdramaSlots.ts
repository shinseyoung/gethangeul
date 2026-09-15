import type { ActId, Axis } from '../utils/kdramaCasting';

export interface SlotOption {
  /** one primary axis at 10 and one secondary at 6 */
  weights: Partial<Record<Axis, number>>;
  /** +1 leans 직진, -1 leans 신중; doubled in the finale so a tie cannot happen */
  temper: number;
}

export interface Slot {
  act: ActId;
  options: SlotOption[];
}

/**
 * The twelve positions, and the only place a number lives.
 *
 * Four genres tell four different stories through these same twelve slots, so
 * the weights belong to the slot rather than to the scene sitting in it. That
 * is not tidiness: it is why `cast()` cannot tell which genre or which branch
 * was played, and why one measured distribution covers all four instead of
 * four tables that would each have to be measured and could each be mistyped.
 *
 *   option j of slot i:  primary   = AXES[j]                      weight 10
 *                        secondary = AXES[(j + 1 + (i % 3)) % 4]  weight 6
 *                        temper    = (i + j) even ? +1 : -1, doubled in slot 11
 *
 * Balance has to hold inside a slot, not only across the twelve: dealing the
 * six axis pairs in order gave one slot three romance-primary options out of
 * four, and that single skew pushed a type to 26% of all answer sets against a
 * 20% bound. With the rotation the twelve types spread across 9.4% to 7.0%,
 * an ideal being 8.33%, measured over the 997-stride sample the check walks.
 *
 * The finale's temper counts double. Eleven answers of ±1 always sum to an odd
 * number, so one even weight means the total can never be nought — and nought
 * was a tie, which had to fall one way and made 신중 two thirds of every
 * reading.
 */
export const SLOTS: Slot[] = [
  { act: 'gi', options: [
    { weights: { romance: 10, presence: 6 }, temper: 1 },
    { weights: { presence: 10, warmth: 6 }, temper: -1 },
    { weights: { warmth: 10, mischief: 6 }, temper: 1 },
    { weights: { mischief: 10, romance: 6 }, temper: -1 },
  ] },
  { act: 'gi', options: [
    { weights: { romance: 10, warmth: 6 }, temper: -1 },
    { weights: { presence: 10, mischief: 6 }, temper: 1 },
    { weights: { warmth: 10, romance: 6 }, temper: -1 },
    { weights: { mischief: 10, presence: 6 }, temper: 1 },
  ] },
  { act: 'gi', options: [
    { weights: { romance: 10, mischief: 6 }, temper: 1 },
    { weights: { presence: 10, romance: 6 }, temper: -1 },
    { weights: { warmth: 10, presence: 6 }, temper: 1 },
    { weights: { mischief: 10, warmth: 6 }, temper: -1 },
  ] },
  { act: 'seung', options: [
    { weights: { romance: 10, presence: 6 }, temper: -1 },
    { weights: { presence: 10, warmth: 6 }, temper: 1 },
    { weights: { warmth: 10, mischief: 6 }, temper: -1 },
    { weights: { mischief: 10, romance: 6 }, temper: 1 },
  ] },
  { act: 'seung', options: [
    { weights: { romance: 10, warmth: 6 }, temper: 1 },
    { weights: { presence: 10, mischief: 6 }, temper: -1 },
    { weights: { warmth: 10, romance: 6 }, temper: 1 },
    { weights: { mischief: 10, presence: 6 }, temper: -1 },
  ] },
  { act: 'seung', options: [
    { weights: { romance: 10, mischief: 6 }, temper: -1 },
    { weights: { presence: 10, romance: 6 }, temper: 1 },
    { weights: { warmth: 10, presence: 6 }, temper: -1 },
    { weights: { mischief: 10, warmth: 6 }, temper: 1 },
  ] },
  { act: 'jeon', options: [
    { weights: { romance: 10, presence: 6 }, temper: 1 },
    { weights: { presence: 10, warmth: 6 }, temper: -1 },
    { weights: { warmth: 10, mischief: 6 }, temper: 1 },
    { weights: { mischief: 10, romance: 6 }, temper: -1 },
  ] },
  { act: 'jeon', options: [
    { weights: { romance: 10, warmth: 6 }, temper: -1 },
    { weights: { presence: 10, mischief: 6 }, temper: 1 },
    { weights: { warmth: 10, romance: 6 }, temper: -1 },
    { weights: { mischief: 10, presence: 6 }, temper: 1 },
  ] },
  { act: 'jeon', options: [
    { weights: { romance: 10, mischief: 6 }, temper: 1 },
    { weights: { presence: 10, romance: 6 }, temper: -1 },
    { weights: { warmth: 10, presence: 6 }, temper: 1 },
    { weights: { mischief: 10, warmth: 6 }, temper: -1 },
  ] },
  { act: 'gyeol', options: [
    { weights: { romance: 10, presence: 6 }, temper: -1 },
    { weights: { presence: 10, warmth: 6 }, temper: 1 },
    { weights: { warmth: 10, mischief: 6 }, temper: -1 },
    { weights: { mischief: 10, romance: 6 }, temper: 1 },
  ] },
  { act: 'gyeol', options: [
    { weights: { romance: 10, warmth: 6 }, temper: 1 },
    { weights: { presence: 10, mischief: 6 }, temper: -1 },
    { weights: { warmth: 10, romance: 6 }, temper: 1 },
    { weights: { mischief: 10, presence: 6 }, temper: -1 },
  ] },
  { act: 'gyeol', options: [
    { weights: { romance: 10, mischief: 6 }, temper: -2 },
    { weights: { presence: 10, romance: 6 }, temper: 2 },
    { weights: { warmth: 10, presence: 6 }, temper: -2 },
    { weights: { mischief: 10, warmth: 6 }, temper: 2 },
  ] },
];

/**
 * Where the story forks: the first scene of 승, 전 and 결.
 *
 * `dominantAxis()` already read the act just finished and already picked a line
 * from it — the fork was computed and then spent on a card with one button on
 * it. These three positions spend it on a scene instead.
 */
export const BRANCH_AT: readonly number[] = [3, 6, 9];
