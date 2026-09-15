import { ACTS, AXES, SCENES_PER_ACT, dominantAxis, type Axis } from '../utils/kdramaCasting';
import { BRANCH_AT, SLOTS } from './kdramaSlots';

/**
 * The stories, with no numbers in them.
 *
 * `kdramaSlots.ts` owns the twelve positions and their weights; this file owns
 * what happens in each. A genre is one way of telling the same twelve beats, so
 * swapping genres cannot move the distribution — `cast()` never sees this file.
 *
 * Three of the twelve fork. `dominantAxis()` reads the act just finished and
 * picks which scene opens the next one, so someone who played 기 as warmth walks
 * into a different 승 than someone who played it as mischief. The fork reads
 * only the act before it, which is why the writing is three times four and not
 * four cubed.
 */

/** Widened by one as each genre is finished, so a genre reaches the picker on
 *  exactly the commit that completes it and never as a stub. */
export const GENRES = ['chaebol'] as const;

/** How many scenes a playthrough walks. The same for every genre: the engine
 *  decides it, not the story. */
export const SCENE_COUNT = SLOTS.length;
export type Genre = (typeof GENRES)[number];

export interface Scene {
  id: string;
  /** four option ids, in axis order: romance, presence, warmth, mischief */
  options: [string, string, string, string];
}

/** A position's story: one scene, or four and the act before picks. */
export type Telling =
  | { branch: false; scene: Scene }
  | { branch: true; scenes: Record<Axis, Scene> };

export interface Story {
  /**
   * The positions that speak to the visitor by name — six of them.
   *
   * It is a property of the position, not of the scene, so that at a branch
   * either all four variants carry the name or none does. Otherwise how many
   * times you heard it would depend on which way you went.
   */
  name: number[];
  tellings: Telling[];
}

const fixed = (id: string, ...options: string[]): Telling =>
  ({ branch: false, scene: { id, options: options as unknown as Scene['options'] } });

const branch = (scenes: Record<Axis, Scene>): Telling => ({ branch: true, scenes });

const scene = (id: string, ...options: string[]): Scene =>
  ({ id, options: options as unknown as Scene['options'] });

export const STORIES: Record<Genre, Story> = {
  /* 재벌 로맨스 — 회장님, 비서, 그리고 봉투. The office drama the genre is built
     out of, and the one this room already told. */
  chaebol: {
    name: [0, 2, 3, 6, 8, 11],
    tellings: [
      fixed('intern', 'stare', 'brief', 'learn', 'mutter'),
      fixed('elevator', 'mirror', 'ask', 'hold', 'joke'),
      fixed('rumour', 'sowhat', 'silence', 'offer', 'rename'),
      // 승 opens on how 기 went
      branch({
        romance: scene('overnight', 'stay2', 'coffee2', 'blanket', 'playlist'),
        presence: scene('hoesik', 'ballad', 'stand', 'swap', 'tambourine'),
        warmth: scene('sickday', 'porridge2', 'doctor', 'text2', 'soup'),
        mischief: scene('talent', 'duet', 'mc', 'backup', 'costume'),
      }),
      fixed('rooftop', 'beside', 'coffee', 'tissue', 'weather'),
      fixed('rival', 'overtime', 'between', 'defer', 'photo'),
      // 전 opens on how 승 went
      branch({
        romance: scene('mother', 'refuse', 'return', 'listen', 'open'),
        presence: scene('chairman', 'state', 'bow', 'praise', 'deal'),
        warmth: scene('quitting', 'follow2', 'reason', 'hold2', 'joke2'),
        mischief: scene('leak', 'own', 'delete', 'check', 'screenshot'),
      }),
      fixed('hospital', 'wait', 'family', 'porridge', 'talk'),
      fixed('contract', 'real', 'terms', 'why', 'rings'),
      // 결 opens on how 전 went
      branch({
        romance: scene('snow', 'go', 'call', 'text3', 'snowman'),
        presence: scene('board', 'omit', 'speak', 'credit', 'walk'),
        warmth: scene('airport', 'drive', 'ring', 'letter', 'gate'),
        mischief: scene('press', 'quiet', 'deny', 'shield', 'frame'),
      }),
      fixed('wrist', 'follow', 'greet', 'regrip', 'laugh'),
      fixed('ramyeon', 'stay', 'up', 'tomorrow', 'two'),
    ],
  },
};

/** Which scene sits at `index` for this genre, given what has been answered. */
export function sceneAt(genre: Genre, index: number, answers: (number | null)[]): Scene {
  const telling = STORIES[genre].tellings[index];
  if (!telling.branch) return telling.scene;
  const previous = ACTS[Math.floor(index / SCENES_PER_ACT) - 1];
  /* the act before a branch is always finished by the time it is reached, so
     the fallback is unreachable from the screen — it is here so a wrong call
     site gets a scene rather than undefined */
  return telling.scenes[dominantAxis(answers, previous) ?? AXES[0]];
}

/** Whether the scene at `index` speaks to the visitor by name. */
export function namesYou(genre: Genre, index: number): boolean {
  return STORIES[genre].name.includes(index);
}

export { BRANCH_AT };
