import { readName } from './nameTraits';
import { strokesOf } from './strokes';
import { readBirthday, type Animal, type Reading, type Season } from './zodiac';

/**
 * For fun, and the card says so — which is not a disclaimer bolted on the end
 * but the reason the room can exist at all.
 *
 * Three inputs, all of them the visitor's own: the animal their birth year
 * belongs to, the season they were born in, and what their name sounds like.
 * The third is what stops this being a birthday lookup with a name field
 * attached — two people born the same day read differently, which is the only
 * honest way a name can matter here.
 */

export type Luck = 'love' | 'luck' | 'work' | 'people';
export const LUCKS = ['love', 'luck', 'work', 'people'] as const;

export type Colour = 'blue' | 'red' | 'yellow' | 'white' | 'black';

export interface Fortune {
  reading: Reading;
  scores: Record<Luck, number>;
  colour: Colour;
  /** 0–9, the ones digit of the name's stroke count */
  number: number;
  dish: Season;
}

/**
 * Each animal leans on two of the four lucks, and carries its 오방색.
 *
 * The colours are not invented. The twelve branches group into five elements
 * and each element has a direction and a colour: 인묘 wood/east/blue,
 * 사오 fire/south/red, 신유 metal/west/white, 해자 water/north/black, and
 * 진술축미 earth/centre/yellow. A visitor who looks this up finds we agree,
 * which is the same promise the zodiac year makes.
 *
 * The lean pairs are spread so each of the six possible pairs is used exactly
 * twice. That discipline is not decoration — the K-Drama room shipped twice
 * with a skewed distribution because one axis was fed more than the others,
 * and this is the same failure waiting to happen.
 */
const ANIMAL_LEAN: Record<Animal, { lifts: [Luck, Luck]; colour: Colour }> = {
  rat: { lifts: ['luck', 'work'], colour: 'black' },
  ox: { lifts: ['work', 'people'], colour: 'yellow' },
  tiger: { lifts: ['love', 'work'], colour: 'blue' },
  rabbit: { lifts: ['love', 'people'], colour: 'blue' },
  dragon: { lifts: ['luck', 'people'], colour: 'yellow' },
  snake: { lifts: ['love', 'luck'], colour: 'red' },
  horse: { lifts: ['love', 'luck'], colour: 'red' },
  goat: { lifts: ['love', 'people'], colour: 'yellow' },
  monkey: { lifts: ['luck', 'work'], colour: 'white' },
  rooster: { lifts: ['work', 'people'], colour: 'white' },
  dog: { lifts: ['love', 'work'], colour: 'yellow' },
  pig: { lifts: ['luck', 'people'], colour: 'black' },
};

/** Each season leans on two, using four of the six pairs. */
const SEASON_LEAN: Record<Season, [Luck, Luck]> = {
  spring: ['love', 'people'],
  summer: ['luck', 'people'],
  autumn: ['work', 'luck'],
  winter: ['work', 'love'],
};

/** The trait that belongs with each luck, so the name moves the reading too. */
const TRAIT_OF: Record<Luck, 'cute' | 'uncommon' | 'refined' | 'friendly'> = {
  love: 'cute',
  luck: 'uncommon',
  work: 'refined',
  people: 'friendly',
};

const BASE = 34;
const ANIMAL_LIFT = 20;
const SEASON_LIFT = 14;
/** The name nudges rather than decides — the birthday is what the visitor came for. */
const NAME_WEIGHT = 0.45;

/**
 * Never nil and never full. A card that tells someone their love life is zero
 * has stopped being for fun, and a hundred leaves nowhere to go.
 */
const FLOOR = 15;
const CEILING = 90;

export function tell(hangulName: string, iso: string): Fortune | null {
  const reading = readBirthday(iso);
  if (!reading) return null;

  const name = readName(hangulName);
  if (!name) return null;

  const animal = ANIMAL_LEAN[reading.animal];
  const season = SEASON_LEAN[reading.season];

  const scores = Object.fromEntries(LUCKS.map((luck) => {
    let n = BASE;
    if (animal.lifts.includes(luck)) n += ANIMAL_LIFT;
    if (season.includes(luck)) n += SEASON_LIFT;
    // the name's own reading, centred on 50 so it can pull either way
    n += (name.traits[TRAIT_OF[luck]] - 50) * NAME_WEIGHT;
    return [luck, Math.round(Math.min(CEILING, Math.max(FLOOR, n)))];
  })) as Record<Luck, number>;

  const number = strokesOf(hangulName).reduce((sum, c) => sum + c.strokes, 0) % 10;

  return { reading, scores, colour: animal.colour, number, dish: reading.season };
}
