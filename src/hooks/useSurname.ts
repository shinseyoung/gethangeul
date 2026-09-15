import { useMemo } from 'react';
import { useFlowStore } from '../store/useFlowStore';
import { defaultSurname, suggestSurnames, surnameById, type SurnameSuggestion } from '../utils/surnameMatcher';
import type { SurnameItem } from '../types/name';

export interface ResolvedSurname {
  surname: SurnameItem;
  suggestion: SurnameSuggestion;
  /** the visitor picked this one; false while it is still the opening guess */
  chosen: boolean;
}

/**
 * The surname on screen. Resolves the store's id, and when nothing has been
 * picked yet falls back to a stable guess — computed, never written, so the
 * result screen and the surname screen cannot disagree and no effect has to
 * run before the first paint.
 */
export function useSurname(): ResolvedSurname {
  const givenName = useFlowStore((s) => s.givenName);
  const lang = useFlowStore((s) => s.lang);
  const surnameId = useFlowStore((s) => s.surnameId);
  const gender = useFlowStore((s) => s.gender);
  const answers = useFlowStore((s) => s.nameAnswers);

  return useMemo(() => {
    const suggestion = suggestSurnames(givenName, lang);
    const picked = surnameById(surnameId);
    if (picked) return { surname: picked, suggestion, chosen: true };
    const seed = [givenName, gender ?? '', ...answers.map(String)].join('|');
    return { surname: defaultSurname(givenName, lang, seed), suggestion, chosen: false };
  }, [givenName, lang, surnameId, gender, answers]);
}
