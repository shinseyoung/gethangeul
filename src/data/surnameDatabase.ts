import type { SurnameItem } from '../types/name';

/**
 * The forty commonest Korean family names, which together cover well over 90%
 * of the population.
 *
 * Forty rather than twenty because this list is matched by *sound*: the top
 * twenty only ever begin with ㄱㅂㅅㅇㅈㅊㅎ, so David, Miller, Nguyen, Lopez,
 * Taylor and Perez would all fall through to a random assignment. Nguyễn alone
 * is two in five Vietnamese, and Vietnamese is one of the four languages this
 * site ships in. The extra twenty are chosen to close ㄴㄷㄹㅁㅌㅍ.
 *
 * ㅋ is the one initial with no Korean family name at all; readOnset already
 * offers ㄱ as its alternate, which is where Kim and Kevin land.
 *
 * `share` is the percentage of the South Korean population carrying the name,
 * rounded from the 2015 census. It is displayed, so it is deliberately coarse.
 */
export const SURNAME_DATABASE: SurnameItem[] = [
  { id: 'kim',   hangul: '김', hanja: '金', roman: 'Kim',   share: 21.5 },
  { id: 'lee',   hangul: '이', hanja: '李', roman: 'Lee',   share: 14.7 },
  { id: 'park',  hangul: '박', hanja: '朴', roman: 'Park',  share: 8.4 },
  { id: 'choi',  hangul: '최', hanja: '崔', roman: 'Choi',  share: 4.7 },
  { id: 'jeong', hangul: '정', hanja: '鄭', roman: 'Jeong', share: 4.3 },
  { id: 'kang',  hangul: '강', hanja: '姜', roman: 'Kang',  share: 2.4 },
  { id: 'cho',   hangul: '조', hanja: '趙', roman: 'Cho',   share: 2.1 },
  { id: 'yoon',  hangul: '윤', hanja: '尹', roman: 'Yoon',  share: 2.1 },
  { id: 'jang',  hangul: '장', hanja: '張', roman: 'Jang',  share: 2.0 },
  { id: 'lim',   hangul: '임', hanja: '林', roman: 'Lim',   share: 1.7 },
  { id: 'han',   hangul: '한', hanja: '韓', roman: 'Han',   share: 1.6 },
  { id: 'oh',    hangul: '오', hanja: '吳', roman: 'Oh',    share: 1.5 },
  { id: 'seo',   hangul: '서', hanja: '徐', roman: 'Seo',   share: 1.5 },
  { id: 'shin',  hangul: '신', hanja: '申', roman: 'Shin',  share: 1.5 },
  { id: 'kwon',  hangul: '권', hanja: '權', roman: 'Kwon',  share: 1.4 },
  { id: 'hwang', hangul: '황', hanja: '黃', roman: 'Hwang', share: 1.4 },
  { id: 'ahn',   hangul: '안', hanja: '安', roman: 'Ahn',   share: 1.4 },
  { id: 'song',  hangul: '송', hanja: '宋', roman: 'Song',  share: 1.4 },
  { id: 'ryu',   hangul: '류', hanja: '柳', roman: 'Ryu',   share: 1.3 },
  { id: 'jeon',  hangul: '전', hanja: '全', roman: 'Jeon',  share: 1.1 },
  { id: 'hong',  hangul: '홍', hanja: '洪', roman: 'Hong',  share: 1.1 },
  { id: 'ko',    hangul: '고', hanja: '高', roman: 'Ko',    share: 0.9 },
  { id: 'moon',  hangul: '문', hanja: '文', roman: 'Moon',  share: 0.9 },
  { id: 'yang',  hangul: '양', hanja: '梁', roman: 'Yang',  share: 0.9 },
  { id: 'son',   hangul: '손', hanja: '孫', roman: 'Son',   share: 0.9 },
  { id: 'bae',   hangul: '배', hanja: '裵', roman: 'Bae',   share: 0.8 },
  { id: 'baek',  hangul: '백', hanja: '白', roman: 'Baek',  share: 0.8 },
  { id: 'heo',   hangul: '허', hanja: '許', roman: 'Heo',   share: 0.7 },
  { id: 'nam',   hangul: '남', hanja: '南', roman: 'Nam',   share: 0.6 },
  { id: 'sim',   hangul: '심', hanja: '沈', roman: 'Sim',   share: 0.5 },
  { id: 'noh',   hangul: '노', hanja: '盧', roman: 'Noh',   share: 0.5 },
  { id: 'ha',    hangul: '하', hanja: '河', roman: 'Ha',    share: 0.5 },
  { id: 'cha',   hangul: '차', hanja: '車', roman: 'Cha',   share: 0.4 },
  { id: 'joo',   hangul: '주', hanja: '朱', roman: 'Joo',   share: 0.4 },
  { id: 'min',   hangul: '민', hanja: '閔', roman: 'Min',   share: 0.3 },
  { id: 'na',    hangul: '나', hanja: '羅', roman: 'Na',    share: 0.3 },
  { id: 'do',    hangul: '도', hanja: '都', roman: 'Do',    share: 0.1 },
  { id: 'ma',    hangul: '마', hanja: '馬', roman: 'Ma',    share: 0.1 },
  { id: 'pyo',   hangul: '표', hanja: '表', roman: 'Pyo',   share: 0.06 },
  { id: 'tae',   hangul: '태', hanja: '太', roman: 'Tae',   share: 0.02 },
];

/**
 * Korean's handful of genuine two-syllable family names. A spaced Korean name
 * otherwise always writes its family name as one Hangul syllable — 김 하준,
 * 박 서연 — but 남궁, 선우 and the rest of these nine are real surnames that
 * happen to break that shape, so both `looksKorean` (romanToHangul.ts, which
 * decides whether typed input is shaped like a Korean name at all) and
 * `splitSurname` (nameTraits.ts, which decides where a given name starts)
 * need the same nine names.
 *
 * This is a separate export, not nine more rows in SURNAME_DATABASE above:
 * that table is the forty-name *picker* list — it carries population `share`
 * for the UI, and scripts/surname.check.ts asserts it holds exactly forty
 * single-syllable entries. These nine are guard/split data (does this shape
 * read as Korean, where does the family name end), not picker data, and
 * folding them into the database would both change the picker UI and break
 * that count.
 */
export const TWO_SYLLABLE_SURNAMES = new Set(['남궁', '선우', '황보', '제갈', '사공', '서문', '독고', '동방', '망절']);
