import React from 'react';
import { useFlowStore } from '../store/useFlowStore';
import { useTranslation } from '../hooks/useTranslation';

const PERSONALITY_OPTIONS_META = [
  { id: 'radiant', icon: 'icons/Personality/radiant_icon.svg' },
  { id: 'considerate', icon: 'icons/Personality/considerate_icon.svg' },
  { id: 'dependable', icon: 'icons/Common/badass_icon.svg' },
  { id: 'whimsical', icon: 'icons/Personality/whimsical_icon.svg' },
  { id: 'genuine', icon: 'icons/Common/relaxed_icon.svg' },
  { id: 'inquisitive', icon: 'icons/Personality/inquisitive_icon.svg' },
  { id: 'enterprising', icon: 'icons/Personality/enterprising_icon.svg' },
  { id: 'prudent', icon: 'icons/Common/serene_icon.svg' },
  { id: 'upright', icon: 'icons/Personality/upright_icon.svg' },
  { id: 'sensitive', icon: 'icons/Common/adorable_icon.svg' },
] as const;

export default function Step3Personality() {
  const { personality: selectedPersonality, setPersonality } = useFlowStore();
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 w-full">
      {PERSONALITY_OPTIONS_META.map((option) => {
        const isSelected = selectedPersonality === option.id;

        // 🟢 [원본 유지] 10가지 성격 컬러셋 100% 동결
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
              alt={t(`options.personality.${option.id}`)}
              draggable={false}
              className={`
                w-10 h-10 mb-2 md:w-12 md:h-12 md:mb-2.5 object-contain select-none pointer-events-none transition-transform duration-300
                ${isSelected ? 'scale-110 opacity-100' : 'scale-100 opacity-80'}
              `}
            />
            {/* 🟢 [원본 유지 + 안전장치] 기존 디자인 글자 크기, 행간 100% 동결 */}
            <span
              className={`
                text-[12px] md:text-[14px] font-bold text-center leading-tight transition-colors duration-300
                break-keep whitespace-pre-line
                ${isSelected ? 'text-gray-900' : 'text-gray-700'}
              `}
            >
              {t(`options.personality.${option.id}`)}
            </span>
          </button>
        );
      })}
    </div>
  );
}