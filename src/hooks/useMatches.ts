import { useMemo } from 'react';
import { useFlowStore } from '../store/useFlowStore';
import { matchNames, type MatchResult } from '../utils/nameMatcher';

/** The scored names for the current answers; the result screen takes the top one. */
export function useMatches(): MatchResult {
  const givenName = useFlowStore((s) => s.givenName);
  const gender = useFlowStore((s) => s.gender);
  const answers = useFlowStore((s) => s.nameAnswers);

  return useMemo(
    () => matchNames({ givenName, gender, answers }),
    [givenName, gender, answers],
  );
}
