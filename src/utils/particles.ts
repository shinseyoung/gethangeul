/**
 * 은/는, 이/가, 과/와 — the particle depends on the word in front of it.
 *
 * Korean picks between the pair by whether the syllable before ends in a
 * consonant: 하린은 but 사라는, 하린과 but 사라와. Every room here puts a name the
 * site has never seen in front of a particle, so the copy cannot spell one.
 *
 * The copy writes the pair instead — `{name}{은/는}` — and this resolves it
 * against whatever the name turned out to be. The 받침 form comes first, the
 * way a Korean dictionary lists them.
 *
 * 으로/로 is deliberately not in the copy anywhere: it has a third case (ㄹ
 * takes 로, not 으로) and a two-way switch would get it wrong.
 */

const BASE = 0xac00;
const LAST = 0xd7a3;

/** Does this word end in a final consonant? */
export function hasBatchim(word: string): boolean {
  const trimmed = word.trim();
  if (!trimmed) return false;
  const code = trimmed.codePointAt(trimmed.length - 1);
  if (code === undefined || code < BASE || code > LAST) return false;
  return (code - BASE) % 28 !== 0;
}

/** Resolve every `{A/B}` in `copy` against the last syllable of `word`. */
export function withParticles(copy: string, word: string): string {
  const batchim = hasBatchim(word);
  return copy.replace(/\{([가-힣]{1,2})\/([가-힣]{1,2})\}/g,
    (_, after: string, plain: string) => (batchim ? after : plain));
}
