import React from 'react';
import { useFlowStore } from '../store/useFlowStore';

const VIBE_OPTIONS = [
  { id: 'bright', label: '밝고 긍정적인', icon: '/icons/Vibe/radiant_icon.svg' },
  { id: 'calm', label: '차분하고 단아한', icon: '/icons/Vibe/serene_icon.svg' },
  { id: 'natural', label: '자연스럽고 편안한', icon: '/icons/Vibe/relaxed_icon.svg' },
  { id: 'soft', label: '부드럽고 따뜻한', icon: '/icons/Vibe/warm_icon.svg' },
  { id: 'mystic', label: '신비롭고 매력적인', icon: '/icons/Vibe/enchanting_icon.svg' },
  { id: 'trendy', label: '세련되고 트렌디한', icon: '/icons/Vibe/chic_icon.svg' },
  { id: 'strong', label: '강인하고 멋진', icon: '/icons/Vibe/badass_icon.svg' },
  { id: 'lovely', label: '사랑스럽고 귀여운', icon: '/icons/Vibe/adorable_icon.svg' },
] as const;

export default function Step2Vibe() {
  const { vibe: selectedVibe, setVibe } = useFlowStore();

  return (
    // 🟢 [개선] max-w-3xl mx-auto를 주어 PC에서 버튼들이 너무 거대해지는 현상을 차단합니다.
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3.5 w-full max-w-3xl mx-auto">
      {VIBE_OPTIONS.map((option) => {
        const isSelected = selectedVibe === option.id;

        return (
          <button
            key={option.id}
            onClick={() => setVibe(selectedVibe === option.id ? null : option.id)}
            // 🟢 [개선] aspect-square를 삭제하고 고정 최소 높이(min-h) 기반의 직사각형으로 변경하여 세로 부피를 절반으로 줄입니다.
            className={`flex flex-col items-center justify-center p-3 md:p-4 rounded-[16px] border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm h-[105px] md:h-[128px]
              ${
                isSelected
                  ? 'border-[#1e4a38] bg-white text-gray-900 shadow-[0_6px_20px_rgba(30,74,56,0.12)] -translate-y-0.5'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-white hover:shadow-md hover:-translate-y-0.5'
              }
            `}
          >
            <img
              src={option.icon}
              alt={option.label}
              draggable={false}
              // 🟢 [개선] 아이콘 스케일을 w-8 / md:w-10 으로 한 단계 다운사이징하여 컴팩트함을 유지합니다.
              className={`
                w-8 h-8 md:w-10 md:h-10 mb-2 object-contain select-none pointer-events-none transition-transform duration-300
                ${isSelected ? 'scale-105 opacity-100' : 'scale-100 opacity-60'}
              `}
            />
            <span
              className={`
                text-[13px] md:text-[14px] font-bold text-center break-keep leading-tight transition-colors duration-300
                ${isSelected ? 'text-[#1e4a38]' : 'text-gray-700'}
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