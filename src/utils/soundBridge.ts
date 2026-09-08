// Reads the opening sound of a person's name and maps it onto a Korean initial
// consonant (초성), so the name pool can be narrowed by sound before it is
// narrowed by meaning.
//
// Coverage is honest, not pretended: nameDatabase.ts currently holds no name
// beginning with ㅂ, ㅍ or ㅋ, so B / P / F / V names have nothing to match and
// the caller is told so rather than being handed a silent fallback.

export const CHOSEONG = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
] as const;

const HANGUL_BASE = 0xac00;
const HANGUL_LAST = 0xd7a3;
const SYLLABLES_PER_INITIAL = 588;

/** The initial consonant of a Hangul syllable block, or null if it isn't one. */
export function choseongOf(text: string): string | null {
  const code = text.codePointAt(0);
  if (code === undefined) return null;
  if (code >= HANGUL_BASE && code <= HANGUL_LAST) {
    return CHOSEONG[Math.floor((code - HANGUL_BASE) / SYLLABLES_PER_INITIAL)];
  }
  // a bare jamo, e.g. someone typing ㅅ
  if (code >= 0x3131 && code <= 0x314e) {
    const jamo = String.fromCodePoint(code);
    return (CHOSEONG as readonly string[]).includes(jamo) ? jamo : null;
  }
  return null;
}

// Latin onset → Korean initial. `alts` are the next-nearest initials, tried when
// the first choice turns up no names.
type Onset = { cho: string; alts: string[] };

const DIGRAPHS: Record<string, Onset> = {
  ch: { cho: 'ㅊ', alts: ['ㅈ'] },
  sh: { cho: 'ㅅ', alts: ['ㅆ'] },
  th: { cho: 'ㄷ', alts: ['ㅌ'] },
  ph: { cho: 'ㅍ', alts: ['ㅂ'] },
  wh: { cho: 'ㅇ', alts: [] },
  kh: { cho: 'ㅋ', alts: ['ㄱ'] },
  gh: { cho: 'ㄱ', alts: [] },
  kn: { cho: 'ㄴ', alts: [] },
  wr: { cho: 'ㄹ', alts: [] },
  qu: { cho: 'ㅋ', alts: ['ㄱ'] },
  ts: { cho: 'ㅈ', alts: ['ㅊ'] },
  ps: { cho: 'ㅅ', alts: [] },
};

const SINGLES: Record<string, Onset> = {
  a: { cho: 'ㅇ', alts: [] }, e: { cho: 'ㅇ', alts: [] }, i: { cho: 'ㅇ', alts: [] },
  o: { cho: 'ㅇ', alts: [] }, u: { cho: 'ㅇ', alts: [] }, y: { cho: 'ㅇ', alts: [] },
  w: { cho: 'ㅇ', alts: [] }, h: { cho: 'ㅎ', alts: [] },
  b: { cho: 'ㅂ', alts: ['ㅍ'] }, d: { cho: 'ㄷ', alts: ['ㄸ', 'ㅌ'] },
  f: { cho: 'ㅍ', alts: ['ㅂ'] }, g: { cho: 'ㄱ', alts: ['ㄲ'] },
  j: { cho: 'ㅈ', alts: ['ㅉ'] }, k: { cho: 'ㅋ', alts: ['ㄱ'] },
  l: { cho: 'ㄹ', alts: [] }, m: { cho: 'ㅁ', alts: [] }, n: { cho: 'ㄴ', alts: [] },
  p: { cho: 'ㅍ', alts: ['ㅂ'] }, q: { cho: 'ㅋ', alts: ['ㄱ'] },
  r: { cho: 'ㄹ', alts: [] }, s: { cho: 'ㅅ', alts: ['ㅆ'] },
  t: { cho: 'ㅌ', alts: ['ㄷ'] }, v: { cho: 'ㅂ', alts: ['ㅍ'] },
  x: { cho: 'ㅈ', alts: ['ㅅ'] }, z: { cho: 'ㅈ', alts: ['ㅅ'] },
  c: { cho: 'ㅋ', alts: ['ㄱ'] }, // overridden to ㅅ before e / i / y
};

// Letters that survive NFD stripping only with help.
const FOLD: Record<string, string> = {
  đ: 'd', ð: 'd', ø: 'o', æ: 'a', œ: 'o', ß: 's', ł: 'l', ı: 'i', ŋ: 'n', þ: 't',
};

function foldLatin(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z]/g, (ch) => FOLD[ch] ?? '');
}

export type SoundRead =
  | { ok: true; source: 'hangul' | 'latin'; cho: string; alts: string[] }
  | { ok: false; reason: 'empty' | 'unreadable' };

/**
 * Read the opening sound of a name. Accepts Hangul directly and any script that
 * folds down to Latin letters (so Vietnamese, and accented European spellings,
 * work). Anything else — Thai, Japanese, Cyrillic, Arabic — is reported as
 * unreadable so the UI can ask for a romanisation instead of guessing.
 */
export function readOnset(raw: string): SoundRead {
  const first = raw.trim().split(/\s+/)[0] ?? '';
  if (!first) return { ok: false, reason: 'empty' };

  const hangul = choseongOf(first);
  if (hangul) return { ok: true, source: 'hangul', cho: hangul, alts: [] };

  const latin = foldLatin(first);
  if (!latin) return { ok: false, reason: 'unreadable' };

  const digraph = DIGRAPHS[latin.slice(0, 2)];
  if (digraph) return { ok: true, source: 'latin', ...digraph };

  const head = latin[0];
  if (head === 'c' && latin.length > 1 && 'eiy'.includes(latin[1])) {
    return { ok: true, source: 'latin', cho: 'ㅅ', alts: ['ㅆ'] };
  }
  if (head === 'g' && latin.length > 1 && 'eiy'.includes(latin[1])) {
    return { ok: true, source: 'latin', cho: 'ㅈ', alts: ['ㄱ'] };
  }

  const single = SINGLES[head];
  if (single) return { ok: true, source: 'latin', ...single };
  return { ok: false, reason: 'unreadable' };
}
