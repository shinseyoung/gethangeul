import { AXES, blendKey, readName, type Axis, type Traits } from './nameTraits';

/**
 * One phrase for a pair of names, from the same five axes the impression room
 * shows one name on.
 *
 * The percentage above it is not symmetric — swap the two names and the fold
 * lands somewhere else, which is how the playground game has always worked and
 * why the card draws the whole fold. This label is symmetric, because it comes
 * from an average, and an average does not care about order. Both are correct
 * at once: the number is the game, the label is the pairing.
 */

const EMOJI: Record<Axis, string> = {
  friendly: '🌾',
  refined: '🍃',
  cute: '💮',
  calm: '🌙',
  uncommon: '✨',
};

export function pairLabel(a: string, b: string): { emojiA: string; emojiB: string; key: string } | null {
  const readA = readName(a);
  const readB = readName(b);
  if (!readA || !readB) return null;

  const mean = Object.fromEntries(
    AXES.map((axis) => [axis, (readA.traits[axis] + readB.traits[axis]) / 2]),
  ) as Traits;

  const ranked = [...AXES].sort((x, y) => mean[y] - mean[x]);

  return {
    emojiA: EMOJI[readA.top[0]],
    emojiB: EMOJI[readB.top[0]],
    key: blendKey(ranked[0], ranked[1]),
  };
}
