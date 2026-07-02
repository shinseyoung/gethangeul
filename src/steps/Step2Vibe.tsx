import React from 'react';
import { useFlowStore } from '../store/useFlowStore';

const VIBE_OPTIONS = [
  { id: 'bright', label: '밝고 긍정적인', icon: 'icons/Vibe/radiant_icon.svg' },
  { id: 'calm', label: '차분하고 단아한', icon: 'icons/Vibe/serene_icon.svg' },
  { id: 'natural', label: '자연스럽고 편안한', icon: 'icons/Vibe/relaxed_icon.svg' },
  { id: 'soft', label: '부드럽고 따뜻한', icon: 'icons/Vibe/warm_icon.svg' },
  { id: 'mystic', label: '신비롭고 매력적인', icon: 'icons/Vibe/enchanting_icon.svg' },
  { id: 'trendy', label: '세련되고 트렌디한', icon: 'icons/Vibe/chic_icon.svg' },
  { id: 'strong', label: '강인하고 멋진', icon: 'icons/Vibe/badass_icon.svg' },
  { id: 'lovely', label: '사랑스럽고 귀여운', icon: 'icons/Vibe/adorable_icon.svg' },
] as const;

export default function Step2Vibe() {
  const { vibe: selectedVibe, setVibe } = useFlowStore();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full">
      {VIBE_OPTIONS.map((option) => {
        const isSelected = selectedVibe === option.id;

        // 🟢 [수정] 기획자님이 지시하신 8가지 파스텔 컬러 라인업 100% 반영
        let colorStyle = 'border-gray-200'; 
        if (isSelected) {
          switch (option.id) {
            case 'bright':   colorStyle = 'border-[#fecaca] shadow-[0_10px_25px_rgba(254,202,202,0.5)]'; break; // 빨강 파스텔
            case 'calm':     colorStyle = 'border-[#bfdbfe] shadow-[0_10px_25px_rgba(191,219,254,0.5)]'; break; // 파랑 파스텔
            case 'natural':  colorStyle = 'border-[#cce2cb] shadow-[0_10px_25px_rgba(187,247,208,0.5)]'; break; // 초록 파스텔
            case 'soft':     colorStyle = 'border-[#c4bee2] shadow-[0_10px_25px_rgba(233,213,255,0.5)]'; break; // 보라 파스텔
            case 'mystic':   colorStyle = 'border-[#c7d2fe] shadow-[0_10px_25px_rgba(199,210,254,0.5)]'; break; // 남색 파스텔
            case 'trendy':   colorStyle = 'border-[#ffe880] shadow-[0_10px_25px_rgba(254,240,138,0.5)]'; break; // 노랑 파스텔
            case 'strong':   colorStyle = 'border-[#cbd5e1] shadow-[0_10px_25px_rgba(203,213,225,0.6)]'; break; // 먹색 파스텔 
            case 'lovely':   colorStyle = 'border-[#ffc5bf] shadow-[0_10px_25px_rgba(251,207,232,0.5)]'; break; // 핑크 파스텔
          }
        }

        return (
          <button
            key={option.id}
            onClick={() => setVibe(selectedVibe === option.id ? null : option.id)}
            className={`flex flex-col items-center justify-center p-4 rounded-[20px] border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm min-h-[120px] h-full
              ${
                isSelected
                  ? `${colorStyle} bg-white -translate-y-1`
                  : 'border-gray-200 shadow-sm hover:border-gray-300 hover:bg-white/80 hover:shadow-md hover:-translate-y-0.5'
              }
            `}
          >
            <img
              src={option.icon}
              alt={option.label}
              draggable={false}
              className={`
                w-10 h-10 mb-2.5 object-contain select-none pointer-events-none transition-transform duration-300
                ${isSelected ? 'scale-110 opacity-100' : 'scale-100 opacity-80'}
              `}
            />
            <span
              className={`
                text-[13.5px] md:text-[14px] font-bold text-center break-keep leading-tight transition-colors duration-300
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