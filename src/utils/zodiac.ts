import { SEOLLAL } from '../data/seollal';

/**
 * Which animal a birthday belongs to, and which season it fell in.
 *
 * Both are facts a visitor can look up and find we agree with, which is the
 * whole reason the birthday is calculated rather than hashed. A hash would work
 * and nobody could tell — and the room would have nothing to show and nothing
 * to answer with, which is not how anything else on this site behaves.
 */

export type Animal =
  | 'rat' | 'ox' | 'tiger' | 'rabbit' | 'dragon' | 'snake'
  | 'horse' | 'goat' | 'monkey' | 'rooster' | 'dog' | 'pig';

/** The traditional order. 1900 was a rat year, and every twelfth since. */
export const ANIMALS = [
  'rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake',
  'horse', 'goat', 'monkey', 'rooster', 'dog', 'pig',
] as const;

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface Reading {
  animal: Animal;
  season: Season;
  /** the zodiac year the birthday belongs to, which is not always its calendar year */
  zodiacYear: number;
}

const FIRST = 1920;
const LAST = 2044;

/**
 * Parsed as UTC on purpose. A local-time parse moves a birthday a day either
 * way depending on where the visitor is sitting, and this room's whole claim is
 * that a date near Seollal lands on the right side of it.
 */
function parse(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  // Date rolls 2001-02-30 forward into March rather than refusing it
  return date.toISOString().slice(0, 10) === iso ? date : null;
}

function seasonOf(month: number): Season {
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

export function readBirthday(iso: string): Reading | null {
  const date = parse(iso);
  if (!date) return null;

  const year = date.getUTCFullYear();
  if (year < FIRST || year > LAST) return null;

  const seollal = parse(SEOLLAL[year]);
  if (!seollal) return null;

  // born before this year's Seollal, so the zodiac year is still the last one
  const zodiacYear = date < seollal ? year - 1 : year;

  // 1900 was a rat year, so the offset from it names the animal
  const animal = ANIMALS[(((zodiacYear - 1900) % 12) + 12) % 12];

  return { animal, season: seasonOf(date.getUTCMonth() + 1), zodiacYear };
}
