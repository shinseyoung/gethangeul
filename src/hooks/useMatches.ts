import { useMemo } from 'react';
import { useFlowStore } from '../store/useFlowStore';
import { matchNames, type MatchResult } from '../utils/nameMatcher';

/** The same three candidates on the Choose screen and the Result screen. */
export function useMatches(): MatchResult {
  const givenName = useFlowStore((s) => s.givenName);
  const gender = useFlowStore((s) => s.gender);
  const vibe = useFlowStore((s) => s.vibe);
  const personality = useFlowStore((s) => s.personality);
  const seasonNature = useFlowStore((s) => s.seasonNature);

  return useMemo(
    () => matchNames({ givenName, gender, vibe, personality, seasonNature }),
    [givenName, gender, vibe, personality, seasonNature],
  );
}
