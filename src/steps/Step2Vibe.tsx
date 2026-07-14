import React from 'react';
import { useFlowStore } from '../store/useFlowStore';
import { useTranslation } from '../hooks/useTranslation';

const VIBE_OPTIONS_META = [
  { id: 'bright', icon: 'icons/Vibe/radiant_icon.svg' },
  { id: 'calm', icon: 'icons/Common/serene_icon.svg' },
  { id: 'natural', icon: 'icons/Common/relaxed_icon.svg' },
  { id: 'soft', icon: 'icons/Vibe/warm_icon.svg' },
  { id: 'mystic', icon: 'icons/Vibe/enchanting_icon.svg' },
  { id: 'trendy', icon: 'icons/Common/chic_icon.svg' },
  { id: 'strong', icon: 'icons/Common/badass_icon.svg' },
  { id: 'lovely', icon: 'icons/Common/adorable_icon.svg' },
] as const;

export default function Step2Vibe() {
  const { vibe: selectedVibe, setVibe } = useFlowStore();
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full">
      {VIBE_OPTIONS_META.map((option) => {
        const isSelected = selectedVibe === option.id;

        // 🟢 [원본 유지] 8가지 분위기 컬러셋 100% 동결
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
              alt={t(`options.vibe.${option.id}`)}
              draggable={false}
              className={`
                w-10 h-10 mb-2 md:w-12 md:h-12 md:mb-2.5 object-contain select-none pointer-events-none transition-transform duration-300
                ${isSelected ? 'scale-110 opacity-100' : 'scale-100 opacity-80'}
              `}
            />
            {/* 🟢 [원본 유지 + 안전장치] 기존 텍스트 스타일 100% 동결. 
                 다국어에서 .split(' ')을 쓰면 세로로 길게 찢어지므로 break-keep로 박스 크기 완벽 보존 */}
            <span
              className={`
                text-[12px] md:text-[14px] font-bold text-center leading-tight transition-colors duration-300
                break-keep whitespace-pre-line
                ${isSelected ? 'text-gray-900' : 'text-gray-700'}
              `}
            >
              {t(`options.vibe.${option.id}`)}
            </span>
          </button>
        );
      })}
    </div>
  );
}