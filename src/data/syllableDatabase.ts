/**
 * The syllables that actually turn up in Korean given names, with how often and
 * from when.
 *
 * Two fields, each with one job. `freq` is how much of a name's familiarity it
 * carries; `era` is whether it sounds like this decade or a grandparent's. The
 * scorer in nameTraits.ts reads both. Neither is a score — sixty rows times five
 * axes of hand-tuned numbers would stop agreeing with each other somewhere
 * around the fiftieth row, so the formulas derive the axes and this table only
 * says what it knows.
 *
 * The bands are judgement, not census data: they come from what contemporary
 * Korean given names are actually built out of. They are one word per row on
 * purpose, so a wrong call is a one-word fix.
 */

export type Freq = 'very-common' | 'common' | 'uncommon';
export type Era = 'modern' | 'timeless' | 'classic';

export interface SyllableItem {
  /** one Hangul syllable block */
  syllable: string;
  /** the key the locale files use */
  roman: string;
  freq: Freq;
  era: Era;
}

export const SYLLABLE_DATABASE: SyllableItem[] = [
  // the twenty that carry the 2010s and 2020s
  { syllable: '서', roman: 'seo',    freq: 'very-common', era: 'modern' },
  { syllable: '준', roman: 'jun',    freq: 'very-common', era: 'modern' },
  { syllable: '지', roman: 'ji',     freq: 'very-common', era: 'modern' },
  { syllable: '우', roman: 'u',      freq: 'very-common', era: 'modern' },
  { syllable: '하', roman: 'ha',     freq: 'very-common', era: 'modern' },
  { syllable: '윤', roman: 'yun',    freq: 'very-common', era: 'modern' },
  { syllable: '은', roman: 'eun',    freq: 'very-common', era: 'modern' },
  { syllable: '민', roman: 'min',    freq: 'very-common', era: 'modern' },
  { syllable: '예', roman: 'ye',     freq: 'very-common', era: 'modern' },
  { syllable: '유', roman: 'yu',     freq: 'very-common', era: 'modern' },
  { syllable: '아', roman: 'a',      freq: 'very-common', era: 'modern' },
  { syllable: '도', roman: 'do',     freq: 'very-common', era: 'modern' },
  { syllable: '시', roman: 'si',     freq: 'very-common', era: 'modern' },
  { syllable: '현', roman: 'hyeon',  freq: 'very-common', era: 'modern' },
  { syllable: '주', roman: 'ju',     freq: 'very-common', era: 'modern' },
  { syllable: '연', roman: 'yeon',   freq: 'very-common', era: 'modern' },
  { syllable: '재', roman: 'jae',    freq: 'very-common', era: 'modern' },
  { syllable: '채', roman: 'chae',   freq: 'very-common', era: 'modern' },
  { syllable: '다', roman: 'da',     freq: 'very-common', era: 'modern' },
  { syllable: '율', roman: 'yul',    freq: 'very-common', era: 'modern' },

  // recent, but not yet everywhere
  { syllable: '온', roman: 'on',     freq: 'common',   era: 'modern' },
  { syllable: '린', roman: 'rin',    freq: 'common',   era: 'modern' },
  { syllable: '후', roman: 'hu',     freq: 'common',   era: 'modern' },
  { syllable: '결', roman: 'gyeol',  freq: 'uncommon', era: 'modern' },
  { syllable: '겸', roman: 'gyeom',  freq: 'uncommon', era: 'modern' },
  { syllable: '솔', roman: 'sol',    freq: 'uncommon', era: 'modern' },

  // names have been built from these for as long as anyone remembers
  { syllable: '수', roman: 'su',     freq: 'common', era: 'timeless' },
  { syllable: '진', roman: 'jin',    freq: 'common', era: 'timeless' },
  { syllable: '호', roman: 'ho',     freq: 'common', era: 'timeless' },
  { syllable: '영', roman: 'yeong',  freq: 'common', era: 'timeless' },
  { syllable: '성', roman: 'seong',  freq: 'common', era: 'timeless' },
  { syllable: '승', roman: 'seung',  freq: 'common', era: 'timeless' },
  { syllable: '원', roman: 'won',    freq: 'common', era: 'timeless' },
  { syllable: '태', roman: 'tae',    freq: 'common', era: 'timeless' },
  { syllable: '소', roman: 'so',     freq: 'common', era: 'timeless' },
  { syllable: '미', roman: 'mi',     freq: 'common', era: 'timeless' },
  { syllable: '나', roman: 'na',     freq: 'common', era: 'timeless' },
  { syllable: '라', roman: 'ra',     freq: 'common', era: 'timeless' },
  { syllable: '인', roman: 'in',     freq: 'common', era: 'timeless' },
  { syllable: '경', roman: 'gyeong', freq: 'common', era: 'timeless' },
  { syllable: '규', roman: 'gyu',    freq: 'common', era: 'timeless' },
  { syllable: '건', roman: 'geon',   freq: 'common', era: 'timeless' },
  { syllable: '기', roman: 'gi',     freq: 'common', era: 'timeless' },
  { syllable: '강', roman: 'gang',   freq: 'common', era: 'timeless' },
  { syllable: '이', roman: 'i',      freq: 'common', era: 'timeless' },
  { syllable: '안', roman: 'an',     freq: 'uncommon', era: 'timeless' },

  // still heard, but they date a person
  { syllable: '정', roman: 'jeong',  freq: 'common', era: 'classic' },
  { syllable: '희', roman: 'hui',    freq: 'common', era: 'classic' },
  { syllable: '명', roman: 'myeong', freq: 'common', era: 'classic' },
  { syllable: '광', roman: 'gwang',  freq: 'common', era: 'classic' },
  { syllable: '상', roman: 'sang',   freq: 'common', era: 'classic' },

  // a grandparent's generation
  { syllable: '철', roman: 'cheol',  freq: 'uncommon', era: 'classic' },
  { syllable: '순', roman: 'sun',    freq: 'uncommon', era: 'classic' },
  { syllable: '자', roman: 'ja',     freq: 'uncommon', era: 'classic' },
  { syllable: '숙', roman: 'suk',    freq: 'uncommon', era: 'classic' },
  { syllable: '옥', roman: 'ok',     freq: 'uncommon', era: 'classic' },
  { syllable: '복', roman: 'bok',    freq: 'uncommon', era: 'classic' },
  { syllable: '덕', roman: 'deok',   freq: 'uncommon', era: 'classic' },
  { syllable: '길', roman: 'gil',    freq: 'uncommon', era: 'classic' },
  { syllable: '만', roman: 'man',    freq: 'uncommon', era: 'classic' },
  { syllable: '병', roman: 'byeong', freq: 'uncommon', era: 'classic' },
];

const BY_SYLLABLE = new Map(SYLLABLE_DATABASE.map((s) => [s.syllable, s]));

/** What the dictionary knows about one syllable, or null if it is not in it. */
export function syllableInfo(char: string): SyllableItem | null {
  return BY_SYLLABLE.get(char) ?? null;
}
