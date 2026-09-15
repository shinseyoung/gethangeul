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
  /** whether this scene speaks to the visitor by name — see the note below */
  name: boolean;
  options: Option[];
}

/**
 * Twelve scenes in four acts, told in 기승전결 — and they are one story, not
 * twelve situations. 기 puts two people in the same room, 승 closes the distance
 * and complicates it, 전 breaks it, 결 decides it. Each scene only makes sense
 * after the one before.
 *
 * **Every scene is a beat a Korean can name.** The version before this one was
 * twelve abstractions — 몰랐어야 할 걸 알게 됐습니다, 판이 다시 짜입니다 — with
 * no room, no object and no person in them. Strip the Hangul and they could
 * have been any drama in any country, which meant they were not this one. A
 * K-drama is made of its furniture: 사수, 엘리베이터, 단톡방, 회식 2차, 옥상,
 * 재벌 3세, 어머니와 봉투, 병원 복도, 계약 연애, 첫눈, 손목, 라면. The test for
 * any replacement is whether you could screenshot it and have a Korean say
 * "아 그거".
 *
 * The questions ask what someone would *do*, never which part they would like
 * to play. Picking 라이벌 and being told you are the rival is a form, not a
 * test, and gives nobody a reason to answer differently next time.
 *
 * Six of the twelve speak to the visitor by name, and they are the six where a
 * Korean would actually use one: being introduced, being talked about, being
 * handed a microphone, being sized up by a mother, being asked for a favour,
 * being asked upstairs. A name in all twelve is a gimmick; a name in none is a
 * story about somebody else. The placeholder lives in the copy rather than in a
 * wrapper here, because `{name} 씨` is a thing you write, not a thing you
 * assemble — and a scene with no name in it has to read correctly on its own.
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
  {
    id: 'elevator',
    act: 'gi',
    name: false,
    options: [
      { id: 'mirror', weights: { romance: 10, warmth: 6 }, temper: -1 },
      { id: 'ask', weights: { presence: 10, mischief: 6 }, temper: 1 },
      { id: 'hold', weights: { warmth: 10, romance: 6 }, temper: -1 },
      { id: 'joke', weights: { mischief: 10, presence: 6 }, temper: 1 },
    ],
  },
  {
    id: 'rumour',
    act: 'gi',
    name: true,
    options: [
      { id: 'sowhat', weights: { romance: 10, mischief: 6 }, temper: 1 },
      { id: 'silence', weights: { presence: 10, romance: 6 }, temper: -1 },
      { id: 'offer', weights: { warmth: 10, presence: 6 }, temper: 1 },
      { id: 'rename', weights: { mischief: 10, warmth: 6 }, temper: -1 },
    ],
  },
  {
    id: 'hoesik',
    act: 'seung',
    name: true,
    options: [
      { id: 'ballad', weights: { romance: 10, presence: 6 }, temper: -1 },
      { id: 'stand', weights: { presence: 10, warmth: 6 }, temper: 1 },
      { id: 'swap', weights: { warmth: 10, mischief: 6 }, temper: -1 },
      { id: 'tambourine', weights: { mischief: 10, romance: 6 }, temper: 1 },
    ],
  },
  {
    id: 'rooftop',
    act: 'seung',
    name: false,
    options: [
      { id: 'beside', weights: { romance: 10, warmth: 6 }, temper: 1 },
      { id: 'coffee', weights: { presence: 10, mischief: 6 }, temper: -1 },
      { id: 'tissue', weights: { warmth: 10, romance: 6 }, temper: 1 },
      { id: 'weather', weights: { mischief: 10, presence: 6 }, temper: -1 },
    ],
  },
  {
    id: 'rival',
    act: 'seung',
    name: false,
    options: [
      { id: 'overtime', weights: { romance: 10, mischief: 6 }, temper: -1 },
      { id: 'between', weights: { presence: 10, romance: 6 }, temper: 1 },
      { id: 'defer', weights: { warmth: 10, presence: 6 }, temper: -1 },
      { id: 'photo', weights: { mischief: 10, warmth: 6 }, temper: 1 },
    ],
  },
  {
    id: 'mother',
    act: 'jeon',
    name: true,
    options: [
      { id: 'refuse', weights: { romance: 10, presence: 6 }, temper: 1 },
      { id: 'return', weights: { presence: 10, warmth: 6 }, temper: -1 },
      { id: 'listen', weights: { warmth: 10, mischief: 6 }, temper: 1 },
      { id: 'open', weights: { mischief: 10, romance: 6 }, temper: -1 },
    ],
  },
  {
    id: 'hospital',
    act: 'jeon',
    name: false,
    options: [
      { id: 'wait', weights: { romance: 10, warmth: 6 }, temper: -1 },
      { id: 'family', weights: { presence: 10, mischief: 6 }, temper: 1 },
      { id: 'porridge', weights: { warmth: 10, romance: 6 }, temper: -1 },
      { id: 'talk', weights: { mischief: 10, presence: 6 }, temper: 1 },
    ],
  },
  {
    id: 'contract',
    act: 'jeon',
    name: true,
    options: [
      { id: 'real', weights: { romance: 10, mischief: 6 }, temper: 1 },
      { id: 'terms', weights: { presence: 10, romance: 6 }, temper: -1 },
      { id: 'why', weights: { warmth: 10, presence: 6 }, temper: 1 },
      { id: 'rings', weights: { mischief: 10, warmth: 6 }, temper: -1 },
    ],
  },
  {
    id: 'snow',
    act: 'gyeol',
    name: false,
    options: [
      { id: 'go', weights: { romance: 10, presence: 6 }, temper: -1 },
      { id: 'call', weights: { presence: 10, warmth: 6 }, temper: 1 },
      { id: 'text', weights: { warmth: 10, mischief: 6 }, temper: -1 },
      { id: 'snowman', weights: { mischief: 10, romance: 6 }, temper: 1 },
    ],
  },
  {
    id: 'wrist',
    act: 'gyeol',
    name: false,
    options: [
      { id: 'follow', weights: { romance: 10, warmth: 6 }, temper: 1 },
      { id: 'greet', weights: { presence: 10, mischief: 6 }, temper: -1 },
      { id: 'regrip', weights: { warmth: 10, romance: 6 }, temper: 1 },
      { id: 'laugh', weights: { mischief: 10, presence: 6 }, temper: -1 },
    ],
  },
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
];
