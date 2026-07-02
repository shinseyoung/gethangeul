import { create } from 'zustand';

// 🟢 향후 스텝별로 저장될 데이터들의 '타입(형태)'을 엄격하게 미리 정의합니다.
interface FlowState {
  // 1. 공통 진행 상태
  step: number;

  // 2. 스텝별 유저 선택 데이터 공간
  gender: 'male' | 'female' | 'neutral' | null;     // Step 1: 성별
  vibe: string | null;                              // Step 2: 이름의 분위기 (단일 선택으로 타입 변경)
  personality: string[] | null;                     // Step 3: 성격 및 가치관
  seasonNature: string[] | null;                    // Step 4: 계절 및 자연

  // 3. 상태 변경 함수(Actions)
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  
  setGender: (gender: 'male' | 'female' | 'neutral' | null) => void;
  setVibe: (vibe: string | null) => void;           // 🟢 타입 변경
  setPersonality: (personality: string[]) => void;
  setSeasonNature: (seasonNature: string[]) => void;
  
  // 4. 서비스 초기화 (다시 하기 기능)
  resetFlow: () => void;
}

export const useFlowStore = create<FlowState>((set) => ({
  // 초기값 세팅
  step: 0,
  gender: null,
  vibe: null,
  personality: null,
  seasonNature: null,

  // 스텝 제어 로직
  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: Math.max(0, state.step - 1) })),

  // 개별 데이터 저장 로직
  setGender: (gender) => set({ gender }),
  setVibe: (vibe) => set({ vibe }),                 // 🟢 저장 로직 연결
  setPersonality: (personality) => set({ personality }),
  setSeasonNature: (seasonNature) => set({ seasonNature }),

  // 🟢 모든 데이터를 초기 상태로 되돌리고 랜딩 페이지(0)로 이동합니다.
  resetFlow: () => set({
    step: 0,
    gender: null,
    vibe: null,
    personality: null,
    seasonNature: null,
  }),
}));