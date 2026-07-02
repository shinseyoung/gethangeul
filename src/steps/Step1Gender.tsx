import React from 'react';
import { useFlowStore } from '../store/useFlowStore';

export default function Step1Gender() {
  // 🟢 [개선] App.tsx가 주는 데이터를 기다리지 않고, 스토어에서 직접 구독(Subscribe)합니다.
  const { gender: selectedGender, setGender } = useFlowStore();

  const genderOptions = [
    { id: 'male', label: '남성', icon: 'icons/Gender/male_icon.svg'},
    { id: 'female', label: '여성', icon: 'icons/Gender/female_icon.svg'},
    { id: 'neutral', label: '성별 무관', icon: 'icons/Gender/neutral_icon.svg'},
  ] as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full md:flex-1">
      {genderOptions.map((option) => {
        const isSelected = selectedGender === option.id;

        const selectedStyle =
          option.id === 'male'
            ? 'border-[#b7d7f7] shadow-[0_8px_24px_rgba(183,215,247,0.35)]'
            : option.id === 'female'
            ? 'border-[#f2c6d6] shadow-[0_8px_24px_rgba(242,198,214,0.35)]'
            : 'border-[#aeb4b0] shadow-[0_8px_24px_rgba(174,180,176,0.30)]';
        
        return (
          <button
            key={option.id}
            onClick={() =>  setGender(selectedGender === option.id ? null : option.id)}
            className={`flex flex-col items-center justify-center p-8 h-full rounded-[24px] border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm 
              ${
                isSelected 
                  ? `${selectedStyle} bg-white/80 -translate-y-2`
                  : 'border-gray-200 hover:border-gray-300 hover:bg-white/80 hover:shadow-md hover:-translate-y-1'
              }
            `}
          >
            <img
              src={option.icon}
              alt={option.label}
              draggable={false} // HTML 속성: 이미지 드래그 고스트 방지
              className={`w-28 h-28 mb-4 object-contain transition-all duration-300 select-none pointer-events-none ${isSelected ? 'scale-110' : 'scale-100'}`} 
              // select-none: 선택 방지, pointer-events-none: 마우스 클릭이 이미지에 막히지 않고 부모 버튼으로 바로 전달되게 함
            />
            <span
              className={`
                text-xl font-bold transition-colors duration-300
                ${isSelected ? 'text-gray-900' : 'text-gray-700'}
              `}
            >
              {option.label}
          </span>
          </button>
        );
      })}
    </div>
  );
}