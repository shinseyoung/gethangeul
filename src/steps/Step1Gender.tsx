import React from 'react';
import { useFlowStore } from '../store/useFlowStore';

export default function Step1Gender() {
  const { gender: selectedGender, setGender } = useFlowStore();

  const genderOptions = [
    { id: 'male', label: '남성', icon: 'icons/Gender/male_icon.svg'},
    { id: 'female', label: '여성', icon: 'icons/Gender/female_icon.svg'},
    { id: 'neutral', label: '성별 무관', icon: 'icons/Gender/neutral_icon.svg'},
  ] as const;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 w-full md:flex-1">
      {genderOptions.map((option) => {
        const isSelected = selectedGender === option.id;

        // 🟢 [수정] 네온 느낌을 빼고 한 단계 더 부드러워진 리얼 파스텔톤 컬러셋
        const selectedStyle =
          option.id === 'male'
            ? 'border-[#bae6fd] shadow-[0_10px_30px_rgba(186,230,253,0.5)]' // 부드러운 파스텔 블루
            : option.id === 'female'
            ? 'border-[#fbcfe8] shadow-[0_10px_30px_rgba(251,207,232,0.5)]' // 부드러운 파스텔 핑크
            : 'border-[#e2e8f0] shadow-[0_10px_30px_rgba(226,232,240,0.4)]'; // 차분한 파스텔 그레이
        
        return (
          <button
            key={option.id}
            onClick={() => setGender(selectedGender === option.id ? null : option.id)}
            // 🟢 [버그수정] shadow-sm을 선택 안되었을 때만 주도록 분기하여, 선택 시 컬러그림자가 씹히는 현상 100% 해결
            className={`flex flex-col items-center justify-center p-4 md:p-8 rounded-[20px] md:rounded-[24px] border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm 
              ${option.id === 'neutral' ? 'col-span-2 md:col-span-1' : ''} 
              ${isSelected ? `${selectedStyle} bg-white -translate-y-2` : 'border-gray-200 shadow-sm hover:border-gray-300 hover:bg-white/80 hover:shadow-md md:hover:-translate-y-1'}
            `}
          >
            <img
              src={option.icon}
              alt={option.label}
              draggable={false}
              className={`w-20 h-20 md:w-28 md:h-28 mb-3 md:mb-4 object-contain transition-all duration-300 select-none pointer-events-none 
                ${isSelected ? 'scale-110 opacity-100' : 'scale-100 opacity-80'}`} 
            />
            <span
              className={`text-[15px] md:text-xl font-bold transition-colors duration-300 ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}
            >
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}