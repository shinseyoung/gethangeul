import React from 'react';
import { useFlowStore } from '../store/useFlowStore';

const VIBE_OPTIONS = [
  { id: 'bright', label: '밝고 긍정적인', icon: 'icons/Vibe/radiant_icon.svg' },
  { id: 'calm', label: '차분하고 단아한', icon: 'icons/Common/serene_icon.svg' },
  { id: 'natural', label: '자연스럽고 편안한', icon: 'icons/Common/relaxed_icon.svg' },
  { id: 'soft', label: '부드럽고 따뜻한', icon: 'icons/Vibe/warm_icon.svg' },
  { id: 'mystic', label: '신비롭고 매력적인', icon: 'icons/Vibe/enchanting_icon.svg' },
  { id: 'trendy', label: '세련되고 트렌디한', icon: 'icons/Vibe/chic_icon.svg' },
  { id: 'strong', label: '강인하고 멋진', icon: 'icons/Common/badass_icon.svg' },
  { id: 'lovely', label: '사랑스럽고 귀여운', icon: 'icons/Common/adorable_icon.svg' },
] as const;

export default function Step2Vibe() {
  const { vibe: selectedVibe, setVibe } = useFlowStore();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full">
      {VIBE_OPTIONS.map((option) => {
        const isSelected = selectedVibe === option.id;

        let colorStyle = 'border-gray-200'; 
        if (isSelected) {
          switch (option.id) {
            case 'bright':   colorStyle = 'border-[#fecaca] shadow-[0_10px_25px_rgba(254,202,202,0.5)]'; break;
            case 'calm':     colorStyle = 'border-[#bfdbfe] shadow-[0_10px_25px_rgba(191,219,254,0.5)]'; break;
            case 'natural':  colorStyle = 'border-[#cce2cb] shadow-[0_10px_25px_rgba(204,226,203,0.5)]'; break;
            case 'soft':     colorStyle = 'border-[#c4bee2] shadow-[0_10px_25px_rgba(233,213,255,0.5)]'; break;
            case 'mystic':   colorStyle = 'border-[#c7d2fe] shadow-[0_10px_25px_rgba(199,210,254,0.5)]'; break;
            case 'trendy':   colorStyle = 'border-[#ffe880] shadow-[0_10px_25px_rgba(254,240,138,0.5)]'; break;
            case 'strong':   colorStyle = 'border-[#cbd5e1] shadow-[0_10px_25px_rgba(203,213,225,0.6)]'; break;
            case 'lovely':   colorStyle = 'border-[#ffc5bf] shadow-[0_10px_25px_rgba(251,207,232,0.5)]'; break;
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
            {/* 🟢 [개선] 띄어쓰기 기준으로 무조건 블록(줄바꿈) 처리 */}
            <span
              className={`
                text-[13.5px] md:text-[14px] font-bold text-center leading-tight transition-colors duration-300
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