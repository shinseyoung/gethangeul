import React from 'react';
import { useFlowStore } from '../store/useFlowStore';

const PERSONALITY_OPTIONS = [
  { id: 'radiant', label: '밝고 긍정적인', icon: 'icons/Personality/radiant_icon.svg' },
  { id: 'considerate', label: '따뜻하고 배려하는', icon: 'icons/Personality/considerate_icon.svg' },
  // 🟢 [수정] 강제 3줄 방지를 위해 "책임감 있고" -> "책임감있고"로 데이터 정제
  { id: 'dependable', label: '책임감있고 신뢰하는', icon: 'icons/Common/badass_icon.svg' },
  { id: 'whimsical', label: '창의적이고 독창적인', icon: 'icons/Personality/whimsical_icon.svg' },
  { id: 'genuine', label: '자연스럽고 솔직한', icon: 'icons/Common/relaxed_icon.svg' },
  { id: 'inquisitive', label: '지적이고 탐구적인', icon: 'icons/Personality/inquisitive_icon.svg' },
  { id: 'enterprising', label: '도전적이고 진취적인', icon: 'icons/Personality/enterprising_icon.svg' },
  { id: 'prudent', label: '차분하고 신중한', icon: 'icons/Common/serene_icon.svg' },
  { id: 'upright', label: '정직하고 원칙적인', icon: 'icons/Personality/upright_icon.svg' },
  { id: 'sensitive', label: '감성적이고 섬세한', icon: 'icons/Common/adorable_icon.svg' },
] as const;

export default function Step3Personality() {
  const { personality: selectedPersonality, setPersonality } = useFlowStore();

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 w-full">
      {PERSONALITY_OPTIONS.map((option) => {
        const isSelected = selectedPersonality === option.id;

        let colorStyle = 'border-gray-200'; 
        if (isSelected) {
          switch (option.id) {
            case 'radiant':      colorStyle = 'border-[#ffe880] shadow-[0_10px_25px_rgba(255,232,128,0.5)]'; break;
            case 'considerate':  colorStyle = 'border-[#ffc5bf] shadow-[0_10px_25px_rgba(255,197,191,0.5)]'; break;
            case 'dependable':   colorStyle = 'border-[#cbd5e1] shadow-[0_10px_25px_rgba(203,213,225,0.6)]'; break;
            case 'whimsical':    colorStyle = 'border-[#c4bee2] shadow-[0_10px_25px_rgba(196,190,226,0.5)]'; break;
            case 'genuine':      colorStyle = 'border-[#cce2cb] shadow-[0_10px_25px_rgba(204,226,203,0.5)]'; break;
            case 'inquisitive':  colorStyle = 'border-[#c7d2fe] shadow-[0_10px_25px_rgba(199,210,254,0.5)]'; break;
            case 'enterprising': colorStyle = 'border-[#ffe0b2] shadow-[0_10px_25px_rgba(255,224,178,0.5)]'; break;
            case 'prudent':      colorStyle = 'border-[#bfdbfe] shadow-[0_10px_25px_rgba(191,219,254,0.5)]'; break;
            case 'upright':      colorStyle = 'border-[#fcd5ce] shadow-[0_10px_25px_rgba(252,213,206,0.5)]'; break;
            case 'sensitive':    colorStyle = 'border-[#fad2e1] shadow-[0_10px_25px_rgba(250,210,225,0.5)]'; break;
          }
        }

        return (
          <button
            key={option.id}
            onClick={() => setPersonality(selectedPersonality === option.id ? null : option.id)}
            className={`flex flex-col items-center justify-center p-3 md:p-4 rounded-[16px] md:rounded-[20px] border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm min-h-[90px] md:min-h-[120px] h-full
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
                w-10 h-10 mb-w-12 md:h-12 mb-2 md:mb-2.5 object-contain select-none pointer-events-none transition-transform duration-300
                ${isSelected ? 'scale-110 opacity-100' : 'scale-100 opacity-80'}
              `}
            />
            {/* 🟢 [개선] 띄어쓰기 기준으로 무조건 블록(줄바꿈) 처리 */}
            <span
              className={`
                text-[12px] md:text-[14px] font-bold text-center leading-tight transition-colors duration-300
                ${isSelected ? 'text-gray-900' : 'text-gray-700'}
              `}
            >
              {option.label.split(' ').map((word, index) => (
                <span key={index} className="block">{word}</span>
              ))}
            </span>
          </button>
        );
      })}
    </div>
  );
}