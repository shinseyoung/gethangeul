import { create } from 'zustand';

// 🟢 지원 언어 타입 정의
export type Language = 'ko' | 'en' | 'vi' | 'th';

interface FlowState {
  // 1. 공통 진행 상태 & 언어 설정
  step: number;
  lang: Language;

  // 2. 스텝별 유저 선택 데이터 공간
  gender: 'male' | 'female' | 'neutral' | null;
  vibe: string | null;
  personality: string | null;
  seasonNature: string | null;

  // 3. 상태 변경 함수(Actions)
  setStep: (step: number) => void;
  setLang: (lang: Language) => void;
  nextStep: () => void;
  prevStep: () => void;
  
  setGender: (gender: 'male' | 'female' | 'neutral' | null) => void;
  setVibe: (vibe: string | null) => void;
  setPersonality: (personality: string | null) => void;
  setSeasonNature: (seasonNature: string | null) => void;
  
  // 4. 서비스 초기화
  resetFlow: () => void;
}

export const useFlowStore = create<FlowState>((set) => ({
  // 초기값 세팅 (기본 언어: 한국어)
  step: 0,
  lang: 'ko',
  gender: null,
  vibe: null,
  personality: null,
  seasonNature: null,

  // 스텝 및 언어 제어 로직 (🟢 명시적 타입 주입으로 any 에러 해결)
  setStep: (step: number) => set({ step }),
  setLang: (lang: Language) => set({ lang }),
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: Math.max(0, state.step - 1) })),

  // 개별 데이터 저장 로직
  setGender: (gender) => set({ gender }),
  setVibe: (vibe) => set({ vibe }),
  setPersonality: (personality) => set({ personality }),
  setSeasonNature: (seasonNature) => set({ seasonNature }),

  // 🟢 set((state) => (...)) 콜백 구조로 완벽히 감싸서 state 참조 에러 해결
  resetFlow: () =>
    set((state) => ({
      step: 0,
      lang: state.lang, // 사용자가 선택한 언어 유지
      gender: null,
      vibe: null,
      personality: null,
      seasonNature: null,
    })),
    
}));

if (typeof window !== 'undefined') {
  (window as any).useFlowStore = useFlowStore;
}