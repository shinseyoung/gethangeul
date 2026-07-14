import React from 'react';
import { useFlowStore } from '../store/useFlowStore';
import { useTranslation } from '../hooks/useTranslation';

const NATURE_OPTIONS_META = [
  { id: 'spring', icon: 'icons/Nature/spring_icon.svg' },
  { id: 'summer', icon: 'icons/Common/chic_icon.svg' },
  { id: 'autumn', icon: 'icons/Nature/autumn_icon.svg' },
  { id: 'winter', icon: 'icons/Nature/winter_icon.svg' },
  { id: 'mountain', icon: 'icons/Common/badass_icon.svg' },
  { id: 'sea', icon: 'icons/Common/sea_icon.svg' },
  { id: 'river', icon: 'icons/Nature/valley_icon.svg' },
  { id: 'forest', icon: 'icons/Nature/forest_icon.svg' },
] as const;

export default function Step4Nature() {
  const { seasonNature: selectedNature, setSeasonNature } = useFlowStore();
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full">
      {NATURE_OPTIONS_META.map((option) => {
        const isSelected = selectedNature === option.id;

        // 🟢 [원본 유지] 자연/계절 컬러셋 100% 동결
        let colorStyle = 'border-gray-200'; 
        if (isSelected) {
          switch (option.id) {
            case 'spring':   colorStyle = 'border-[#fcd5ce] shadow-[0_10px_25px_rgba(252,213,206,0.5)]'; break;
            case 'summer':   colorStyle = 'border-[#ffe880] shadow-[0_10px_25px_rgba(254,240,138,0.5)]'; break;
            case 'autumn':   colorStyle = 'border-[#ffe0b2] shadow-[0_10px_25px_rgba(255,224,178,0.5)]'; break;
            case 'winter':   colorStyle = 'border-[#bfdbfe] shadow-[0_10px_25px_rgba(191,219,254,0.5)]'; break;
            case 'mountain': colorStyle = 'border-[#cbd5e1] shadow-[0_10px_25px_rgba(203,213,225,0.6)]'; break;
            case 'sea':      colorStyle = 'border-[#c7d2fe] shadow-[0_10px_25px_rgba(199,210,254,0.5)]'; break;
            case 'river':    colorStyle = 'border-[#b7d7e8] shadow-[0_8px_20px_rgba(183,215,232,0.25)]'; break;
            case 'forest':   colorStyle = 'border-[#cce2cb] shadow-[0_10px_25px_rgba(204,226,203,0.5)]'; break;
          }
        }

        return (
          <button
            key={option.id}
            onClick={() => setSeasonNature(selectedNature === option.id ? null : option.id)}
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
              alt={t(`options.nature.${option.id}`)}
              draggable={false}
              className={`
                w-10 h-10 mb-2 md:w-12 md:h-12 md:mb-2.5 object-contain select-none pointer-events-none transition-transform duration-300
                ${isSelected ? 'scale-110 opacity-100' : 'scale-100 opacity-80'}
              `}
            />
            {/* 🟢 [원본 유지 + 안전장치] 기존 스타일 및 여백 100% 동결 */}
            <span
              className={`
                text-[12px] md:text-[14px] font-bold text-center leading-tight transition-colors duration-300
                break-keep whitespace-pre-line
                ${isSelected ? 'text-gray-900' : 'text-gray-700'}
              `}
            >
              {t(`options.nature.${option.id}`)}
            </span>
          </button>
        );
      })}
    </div>
  );
}