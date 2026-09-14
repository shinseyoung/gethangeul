/**
 * Latin letters to Hangul syllables, well enough to play a stroke game with.
 *
 * This is a transliterator, not the official 외래어 표기법: it gets Anna, Minjun
 * and Miller right and it gets David wrong (다비드, where Korean actually writes
 * 데이비드). Names Korean has a settled spelling for are listed in SPELLINGS;
 * everything else goes through the rules and is shown to the visitor as an
 * editable field, because the honest fix for a wrong guess is letting the
 * person who owns the name correct it.
 *
 * ponytail: rules plus a short table. Grow the table when corrections cluster
 * on the same names; reach for a real 외래어 표기법 engine only if they don't.
 */

import { SURNAME_DATABASE, TWO_SYLLABLE_SURNAMES } from '../data/surnameDatabase';

const CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const JUNG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
const JONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

const BASE = 0xac00;

function compose(cho: string, jung: string, jong = ''): string {
  const c = CHO.indexOf(cho);
  const v = JUNG.indexOf(jung);
  const t = JONG.indexOf(jong);
  if (c < 0 || v < 0 || t < 0) return '';
  return String.fromCodePoint(BASE + (c * 21 + v) * 28 + t);
}

/** Put a final consonant onto the syllable already written, if it has none. */
function addCoda(built: string, coda: string): string | null {
  if (!built) return null;
  const last = built.codePointAt(built.length - 1);
  if (last === undefined) return null;
  const offset = last - BASE;
  if (offset < 0 || offset % 28 !== 0) return null;
  return built.slice(0, -1) + String.fromCodePoint(last + JONG.indexOf(coda));
}

const FOLD: Record<string, string> = {
  đ: 'd', ð: 'd', ø: 'o', æ: 'a', œ: 'o', ß: 's', ł: 'l', ı: 'i', ŋ: 'n', þ: 't',
};

function latinise(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z ]/g, (ch) => FOLD[ch] ?? '');
}

const CONSONANT_DIGRAPHS: Record<string, string> = {
  ch: 'ㅊ', sh: 'ㅅ', ph: 'ㅍ', th: 'ㅌ', gh: 'ㄱ', ck: 'ㅋ', kh: 'ㅋ', wh: 'ㅇ',
};

const CONSONANTS: Record<string, string> = {
  b: 'ㅂ', c: 'ㅋ', d: 'ㄷ', f: 'ㅍ', g: 'ㄱ', h: 'ㅎ', j: 'ㅈ', k: 'ㅋ',
  l: 'ㄹ', m: 'ㅁ', n: 'ㄴ', p: 'ㅍ', q: 'ㅋ', r: 'ㄹ', s: 'ㅅ', t: 'ㅌ',
  v: 'ㅂ', x: 'ㅋ', z: 'ㅈ',
};

/** Tried before the two-letter table, longest first. */
const VOWEL_TRIGRAPHS: Record<string, string> = {
  yeo: 'ㅕ', woo: 'ㅜ', yae: 'ㅒ',
};

const VOWEL_DIGRAPHS: Record<string, string> = {
  // Korean's own romanisation, which is how half the names here arrive
  eo: 'ㅓ', eu: 'ㅡ', ae: 'ㅐ', oe: 'ㅚ', ui: 'ㅢ',
  ee: 'ㅣ', ea: 'ㅣ', oo: 'ㅜ', ou: 'ㅜ', au: 'ㅗ', aw: 'ㅗ', ow: 'ㅗ',
  ya: 'ㅑ', yo: 'ㅛ', yu: 'ㅠ', ye: 'ㅖ', wa: 'ㅘ', wo: 'ㅝ', we: 'ㅞ', wi: 'ㅟ',
};

const VOWELS: Record<string, string> = {
  a: 'ㅏ', e: 'ㅔ', i: 'ㅣ', o: 'ㅗ', u: 'ㅜ', y: 'ㅣ',
};

/**
 * A word-final vowel + r is one Korean vowel, not a vowel and a consonant:
 * Miller is 밀러 and Oscar is 오스카, never 밀레르 or 오스카르.
 */
const RHOTIC: Record<string, string> = {
  er: 'ㅓ', or: 'ㅓ', ur: 'ㅓ', ir: 'ㅓ', ar: 'ㅏ',
};

/**
 * Finals Korean actually carries. `r` is deliberately absent: before another
 * consonant it becomes its own 르 syllable (마르코), and at the end of a word it
 * is swallowed by RHOTIC above.
 */
const CODA: Record<string, string> = { n: 'ㄴ', m: 'ㅁ', l: 'ㄹ' };

/** Does position `i` begin a vowel that will take an onset of its own? */
function opensVowel(word: string, i: number): boolean {
  if (i >= word.length) return false;
  if (!(word[i] in VOWELS)) return false;
  // a y before another vowel is the glide in 야/요, not a syllable of its own
  return !(word[i] === 'y' && word[i + 1] !== undefined && word[i + 1] in VOWELS);
}

/** Korean spellings that are settled and that no rule set is going to produce. */
const SPELLINGS: Record<string, string> = {
  david: '데이비드', michael: '마이클', james: '제임스', jane: '제인', john: '존',
  jennifer: '제니퍼', kate: '케이트', jake: '제이크', mike: '마이크', pete: '피트',
  steve: '스티브', dave: '데이브', luke: '루크', grace: '그레이스', alice: '앨리스',
  charles: '찰스', george: '조지', peter: '피터', paul: '폴', mary: '메리',
  claire: '클레어', chloe: '클로이', sophie: '소피', louis: '루이', jose: '호세',
  juan: '후안', maria: '마리아', diego: '디에고', carlos: '카를로스',
  nguyen: '응우옌', tran: '쩐', pham: '팜', hoang: '호앙', dang: '당',
  bui: '부이', ngo: '응오', duong: '즈엉', thao: '타오', linh: '린',
  somchai: '솜차이', suchada: '수차다', kanya: '깐야', apinya: '아피냐',
  emma: '엠마', olivia: '올리비아', noah: '노아', liam: '리암', ava: '에이바',
  sophia: '소피아', isabella: '이사벨라', ethan: '이선', mason: '메이슨',
  ryan: '라이언', taylor: '테일러', leo: '리오', theo: '테오', bryan: '브라이언',
  dylan: '딜런', kyle: '카일', wyatt: '와이엇', lyla: '라일라', tyler: '타일러',
};

/** One word of Latin letters as Hangul syllables. */
function wordToHangul(word: string): string {
  const settled = SPELLINGS[word];
  if (settled) return settled;

  let out = '';
  let i = 0;

  while (i < word.length) {
    // onset
    let cho = 'ㅇ';
    const pair = word.slice(i, i + 2);
    const cDigraph = CONSONANT_DIGRAPHS[pair];
    if (cDigraph) {
      // chr and chl are /kr/, /kl/ — Chris is 크리스, not 츠리스
      cho = pair === 'ch' && (word[i + 2] === 'r' || word[i + 2] === 'l') ? 'ㅋ' : cDigraph;
      i += 2;
    } else if (word[i] in CONSONANTS) {
      cho = CONSONANTS[word[i]];
      i += 1;
    }

    // medial
    let jung = '';
    const rhotic = RHOTIC[word.slice(i, i + 2)];
    const vTrigraph = VOWEL_TRIGRAPHS[word.slice(i, i + 3)];
    const vDigraph = VOWEL_DIGRAPHS[word.slice(i, i + 2)];
    if (rhotic && i + 2 >= word.length) {
      jung = rhotic;
      i += 2;
    } else if (vTrigraph) {
      jung = vTrigraph;
      i += 3;
    } else if (vDigraph) {
      jung = vDigraph;
      i += 2;
    } else if (word[i] in VOWELS) {
      jung = VOWELS[word[i]];
      i += 1;
    }

    if (!jung) {
      // a stray vowel letter we could not read: skip it rather than invent one
      if (cho === 'ㅇ') {
        i += 1;
        continue;
      }
      const consumed = word.slice(i - 2, i);
      const letter = word[i - 1];
      const trailing = i >= word.length;
      // a trailing th is /s/ to Korean ears: Smith is 스미스, not 스미트.
      // This has to be tested before the silent-h rule below, or the h in
      // "th" is dropped first and the whole syllable disappears.
      if (trailing && consumed === 'th') {
        out += compose('ㅅ', 'ㅡ');
        continue;
      }
      // a trailing h is silent: Sarah is 사라, not 사라흐
      if (trailing && letter === 'h' && out) continue;
      const coda = CODA[letter];
      if (coda && (trailing || !opensVowel(word, i))) {
        const merged = addCoda(out, coda);
        if (merged) {
          out = merged;
          continue;
        }
      }
      // otherwise the consonant rides ㅡ, the way Korean writes 마르코
      out += compose(cho, 'ㅡ');
      continue;
    }

    // final: only when the following consonant does not start its own syllable
    let jong = '';
    if (word.slice(i, i + 2) === 'ng' && !opensVowel(word, i + 2)) {
      jong = 'ㅇ';
      i += 2;
    } else if (word[i] === 'l' && opensVowel(word, i + 1)) {
      // an l between two vowels doubles: Emily is 에밀리, Elena is 엘레나.
      // The coda is taken without consuming, so the same l is the next onset.
      jong = 'ㄹ';
    } else if (word[i] in CODA && !opensVowel(word, i + 1)) {
      jong = CODA[word[i]];
      i += 1;
    }
    out += compose(cho, jung, jong);
  }

  return out;
}

/** A whole name as Hangul, spaces kept. */
export function romanToHangul(name: string): string {
  return latinise(name)
    .split(/\s+/)
    .filter(Boolean)
    .map(wordToHangul)
    .filter(Boolean)
    .join(' ');
}

const HANGUL = /[가-힣]/;

/**
 * A romanized Korean surname is a lookup, not a sound to sound out: the whole
 * reason letter-by-letter transliteration is right for Miller and Nguyễn is
 * that Korean has no settled spelling for them, but every one of the forty
 * names in SURNAME_DATABASE already has one. Only the first word is ever
 * checked, and only when there is a second word to be the given name — a bare
 * "Kim" is left to transliterate as a foreign given name (킴), the same way a
 * single token already reaches the impression room as a given name and
 * nothing else.
 */
function knownSurname(word: string): string | null {
  const lower = word.toLowerCase();
  return SURNAME_DATABASE.find((s) => s.roman.toLowerCase() === lower)?.hangul ?? null;
}

/**
 * The Hangul to play the game with. Hangul input is taken as written; anything
 * else is transliterated. Returns null when there is nothing readable.
 */
export function hangulFor(name: string): { hangul: string; converted: boolean } | null {
  const trimmed = name.trim();
  if (!trimmed) return null;
  if (HANGUL.test(trimmed)) return { hangul: trimmed, converted: false };

  const words = trimmed.split(/\s+/);
  const surname = words.length >= 2 ? knownSurname(words[0]) : null;
  if (surname) {
    const given = romanToHangul(words.slice(1).join(' '));
    return { hangul: given ? `${surname} ${given}` : surname, converted: true };
  }

  const hangul = romanToHangul(trimmed);
  return hangul ? { hangul, converted: true } : null;
}

/**
 * Whether typed input is shaped like a Korean name, not merely readable as
 * Hangul. A Korean full name is one surname syllable plus a one-to-three-
 * syllable given name, so four syllables is a generous ceiling — but "Anna
 * Miller" sounds out to exactly four (안나밀러) and would slip under a ceiling
 * alone, so a second word also has to open with a real family name, or the
 * input is a foreign given name plus family name rather than a Korean one.
 * A single word skips that check: there is no family name to verify, so
 * "Sarah" and "Hajun" are judged on syllable count alone, same as any other
 * given name typed here.
 *
 * "Real family name" means two different things depending on the script,
 * because the two scripts carry different amounts of ambiguity. A Latin
 * first word is checked against knownSurname: "Anna" and "Kim" are otherwise
 * indistinguishable Latin words, so the only way to tell a family name from
 * a foreign given name is the forty-row lookup. A Hangul first word carries
 * none of that ambiguity, but it carries a different, structural one: a
 * spaced Korean name almost always writes its family name as a single
 * syllable — 김 하준, 박 서연, 하 준 — never two, so 안나 (two syllables) in
 * "안나 밀러" fails this test even though it is Hangul, while a rare or
 * unlisted one-syllable surname the lookup table doesn't carry (하 준) still
 * passes. The one exception is TWO_SYLLABLE_SURNAMES (surnameDatabase.ts): 남궁 서연 and
 * 선우 지호 are real Korean names whose family name is genuinely two
 * syllables, so a Hangul first word also passes when it is one of those
 * nine — but only those nine, since an arbitrary two-syllable first word
 * (밀러, 스미스) is exactly the "안나 밀러" shape this guard exists to catch.
 * This is a coarser test than knownSurname's, but a table lookup would be
 * the wrong tool here: readName applies its own surname split on the Hangul
 * this guard passes through, so this guard only has to rule out shapes that
 * can't be a Korean name at all, not agree syllable-for-syllable with
 * readName's forty-row table.
 *
 * Either way, a Korean name is never half Latin: whichever script the family
 * name lands in, the rest of the words have to agree, or "family name" and
 * "given name" are really two separate names glued together by a space
 * (김 Smith, Smith 하준) rather than one Korean name.
 */
export function looksKorean(name: string): boolean {
  const read = hangulFor(name);
  if (!read) return false;
  const syllables = [...read.hangul].filter((ch) => HANGUL.test(ch)).length;
  if (syllables > 4) return false;

  const words = name.trim().split(/\s+/);
  if (words.length < 2) return true;

  const first = words[0];
  const rest = words.slice(1).join('');
  const firstIsFamilyName = HANGUL.test(first)
    ? [...first].length === 1 || TWO_SYLLABLE_SURNAMES.has(first)
    : knownSurname(first) !== null;
  return firstIsFamilyName && HANGUL.test(first) === HANGUL.test(rest);
}
