import React from 'react';
import { useFlowStore } from '../store/useFlowStore';
// 🟢 [추가] 다국어 훅 임포트 (프로젝트 경로에 맞게 조정해 주세요)
import { useTranslation } from '../hooks/useTranslation';

// 🟢 [FE 최적화] 언어와 무관한 정적 데이터(id, icon)는 외부 상수로 분리하여 리렌더링 방지
const GENDER_OPTIONS_META = [
  { id: 'male', icon: 'icons/Gender/male_icon.svg' },
  { id: 'female', icon: 'icons/Gender/female_icon.svg' },
  { id: 'neutral', icon: 'icons/Gender/neutral_icon.svg' },
] as const;

export default function Step1Gender() {
  const { gender: selectedGender, setGender } = useFlowStore();
  const { t } = useTranslation(); // 🟢 다국어 번역 함수 호출

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 w-full md:flex-1">
      {GENDER_OPTIONS_META.map((option) => {
        const isSelected = selectedGender === option.id;

        // 🟢 [원본 유지] 부드러운 리얼 파스텔톤 컬러셋 및 그림자 100% 동결
        const selectedStyle =
          option.id === 'male'
            ? 'border-[#bae6fd] shadow-[0_10px_30px_rgba(186,230,253,0.5)]'
            : option.id === 'female'
            ? 'border-[#fbcfe8] shadow-[0_10px_30px_rgba(251,207,232,0.5)]'
            : 'border-[#e2e8f0] shadow-[0_10px_30px_rgba(226,232,240,0.4)]';
        
        return (
          <button
            key={option.id}
            onClick={() => setGender(selectedGender === option.id ? null : option.id)}
            // 🟢 [원본 유지] 컬러 그림자 씹힘 방지 분기 및 레이아웃 클래스 100% 동결
            className={`flex flex-col items-center justify-center p-4 md:p-8 rounded-[20px] md:rounded-[24px] border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm 
              ${option.id === 'neutral' ? 'col-span-2 md:col-span-1' : ''} 
              ${isSelected ? `${selectedStyle} bg-white -translate-y-2` : 'border-gray-200 shadow-sm hover:border-gray-300 hover:bg-white/80 hover:shadow-md md:hover:-translate-y-1'}
            `}
          >
            <img
              src={option.icon}
              alt={t(`options.gender.${option.id}`)}
              draggable={false}
              className={`w-20 h-20 md:w-28 md:h-28 mb-3 md:mb-4 object-contain transition-all duration-300 select-none pointer-events-none 
                ${isSelected ? 'scale-110 opacity-100' : 'scale-100 opacity-80'}`} 
            />
            {/* 🟢 [원본 유지 + 안전장치] 기존 폰트 및 스타일 그대로 유지 + break-keep 추가 */}
            <span
              className={`text-[15px] md:text-xl font-bold transition-colors duration-300 break-keep ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}
            >
              {t(`options.gender.${option.id}`)}
            </span>
          </button>
        );
      })}
    </div>
  );
}