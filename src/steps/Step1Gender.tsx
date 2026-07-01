import { useState } from 'react';
import StepLayout from './components/StepLayout';

// 직접 제작한 고급스러운 SVG 파비콘 (원본 기획 느낌 복구)
const FemaleIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="10" r="6" />
    <line x1="12" y1="16" x2="12" y2="22" />
    <line x1="9" y1="19" x2="15" y2="19" />
  </svg>
);

const MaleIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="14" r="6" />
    <line x1="14.24" y1="9.76" x2="20" y2="4" />
    <line x1="16" y1="4" x2="20" y2="4" />
    <line x1="20" y1="8" x2="20" y2="4" />
  </svg>
);

function NeutralIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="10" r="6" />
      <line x1="12" y1="17" x2="12" y2="22" />
    </svg>
  );
}

interface Step1GenderProps {
  onNext: (selectedGender: 'male' | 'female' | 'neutral') => void;
  onPrev: () => void;
  savedGender: 'male' | 'female' | 'neutral' | null;
}

export default function Step1Gender({ onNext, onPrev, savedGender }: Step1GenderProps) {
  // 사용자가 이전에 선택했던 값이 있다면 초기값으로 불러옴
  const [selected, setSelected] = useState<'male' | 'female' | 'neutral' | null>(savedGender);

  const genderOptions = [
    { id: 'female', label: '여성', icon: FemaleIcon },
    { id: 'male', label: '남성', icon: MaleIcon },
    { id: 'neutral', label: '성별무관', icon: NeutralIcon },
  ] as const;

  const handleNext = () => {
    if (selected) onNext(selected);
  };

  return (
    <StepLayout
      currentStep={1}
      totalSteps={4}
      title=" 당신의 성별은 무엇인가요?"
      description="모든 이름에는 고유한 분위기가 있습니다."
      onNext={handleNext}
      onPrev={onPrev}
      isNextDisabled={!selected}
    >
      {/* 위아래가 아닌 양옆 구조 (가로 3단 그리드) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full mt-4">
        {genderOptions.map((option) => {
          const isSelected = selected === option.id;
          
          return (
            <button
              key={option.id}
              onClick={() => setSelected(option.id)}
              className={`
                relative flex flex-col items-center justify-center p-8 text-center border-2 rounded-[20px] transition-all duration-300 group
                ${isSelected 
                  ? 'border-[#1e4a38] bg-[#1e4a38]/5 shadow-[0_4px_20px_rgba(30,74,56,0.08)]' 
                  : 'border-gray-100 bg-white hover:border-[#1e4a38]/30 hover:bg-gray-50 hover:shadow-md'
                }
              `}
            >
              {/* 아이콘 컨테이너 */}
              <div className={`
                mb-5 transition-colors duration-300
                ${isSelected ? 'text-[#1e4a38]' : 'text-gray-400 group-hover:text-gray-600'}
              `}>
                <option.icon />
              </div>
              
              <h3 className={`text-xl font-bold mb-1 transition-colors ${isSelected ? 'text-[#1e4a38]' : 'text-gray-800'}`}>
                {option.label}
              </h3>

              {/* 체크 표시 아이콘 */}
              <div className={`
                absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                ${isSelected ? 'border-[#1e4a38] bg-[#1e4a38] scale-100 opacity-100' : 'border-gray-200 scale-90 opacity-0 group-hover:opacity-100'}
              `}>
                {isSelected && (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </StepLayout>
  );
}