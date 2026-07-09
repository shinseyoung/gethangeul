// src/utils/nameMatcher.ts (최종 수정안)
import { NAME_DATABASE } from '../data/nameDatabase';
import type { NameItem } from '../types/name';

export const getRecommendedName = (
  gender: 'male' | 'female' | 'neutral' | null,
  vibe: string | null,
  personality: string | null,
  seasonNature: string | null
): NameItem => {
  let candidates = NAME_DATABASE;

  // 1. 성별 조건부 하드 필터링 및 보너스 가중치 설계
  if (gender === 'male' || gender === 'female') {
    // 선택한 성별이 배열에 존재하는 이름만 남김 (하드 필터링)
    candidates = candidates.filter((name) => name.gender.includes(gender));
  }
  // gender가 'neutral'인 경우는 필터링을 하지 않고 전체 후보군을 유지함 (선택 폭 극대화)

  // 예외 처리: 만약 데이터가 없어 후보군이 0명이면 전체 데이터로 폴백
  if (candidates.length === 0) candidates = NAME_DATABASE;

  // 2. 가중치 기반 스코어링 (Soft Matching)
  const scoredCandidates = candidates.map((name) => {
    let score = 0;

    // 유저가 '성별 무관'을 선택했을 때, 실제로 중성 태그를 가진 이름에 보너스 점수 부여
    if (gender === 'neutral' && name.gender.includes('neutral')) {
      score += 0.5;
    }

    // 나머지 성향 태그 매칭 (각 1점씩 가산)
    if (vibe && name.vibes.includes(vibe)) score += 1;
    if (personality && name.personalities.includes(personality)) score += 1;
    if (seasonNature && name.nature.includes(seasonNature)) score += 1;

    // 동점자 발생 시 다시하기 리텐션을 위한 미세 랜덤 가중치 (0 ~ 0.1)
    const randomWeight = Math.random() * 0.1;

    return {
      ...name,
      finalScore: score + randomWeight,
    };
  });

  // 3. 점수 기준 내림차순 정렬 후 최상위 1위 반환
  scoredCandidates.sort((a, b) => b.finalScore - a.finalScore);

  return scoredCandidates[0];
};