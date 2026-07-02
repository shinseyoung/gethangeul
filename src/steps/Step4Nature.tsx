import React from 'react';
import { useFlowStore } from '../store/useFlowStore';

// 🟢 기획자님이 지시하신 8가지 라벨과 공통 임시 아이콘 적용
const NATURE_OPTIONS = [
  { id: 'spring', label: '봄', icon: 'icons/Common/adorable_icon.svg' },
  { id: 'summer', label: '여름', icon: 'icons/Common/adorable_icon.svg' },
  { id: 'autumn', label: '가을', icon: 'icons/Common/adorable_icon.svg' },
  { id: 'winter', label: '겨울', icon: 'icons/Common/adorable_icon.svg' },
  { id: 'mountain', label: '산', icon: 'icons/Common/adorable_icon.svg' },
  { id: 'sea', label: '바다', icon: 'icons/Common/adorable_icon.svg' },
  { id: 'river', label: '강', icon: 'icons/Common/adorable_icon.svg' },
  { id: 'forest', label: '숲', icon: 'icons/Common/adorable_icon.svg' },
] as const;

export default function Step4Nature() {
  // Store에서 Step 4 데이터 가져오기
  const { seasonNature: selectedNature, setSeasonNature } = useFlowStore();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full">
      {NATURE_OPTIONS.map((option) => {
        const isSelected = selectedNature === option.id;

        // 🟢 테마에 맞는 파스텔 컬러 톤앤매너 배정 (자연/계절 느낌)
        let colorStyle = 'border-gray-200'; 
        if (isSelected) {
          switch (option.id) {
            case 'spring':   colorStyle = 'border-[#fcd5ce] shadow-[0_10px_25px_rgba(252,213,206,0.5)]'; break; // 봄 - 피치 핑크
            case 'summer':   colorStyle = 'border-[#bfdbfe] shadow-[0_10px_25px_rgba(191,219,254,0.5)]'; break; // 여름 - 시원한 파랑
            case 'autumn':   colorStyle = 'border-[#ffe0b2] shadow-[0_10px_25px_rgba(255,224,178,0.5)]'; break; // 가을 - 파스텔 오렌지
            case 'winter':   colorStyle = 'border-[#e2e8f0] shadow-[0_10px_25px_rgba(226,232,240,0.5)]'; break; // 겨울 - 눈(회백색)
            case 'mountain': colorStyle = 'border-[#cce2cb] shadow-[0_10px_25px_rgba(204,226,203,0.5)]'; break; // 산 - 파스텔 초록
            case 'sea':      colorStyle = 'border-[#c7d2fe] shadow-[0_10px_25px_rgba(199,210,254,0.5)]'; break; // 바다 - 깊은 파스텔 남색
            case 'river':    colorStyle = 'border-[#a7f3d0] shadow-[0_10px_25px_rgba(167,243,208,0.5)]'; break; // 강 - 에메랄드/민트
            case 'forest':   colorStyle = 'border-[#bbf7d0] shadow-[0_10px_25px_rgba(187,247,208,0.5)]'; break; // 숲 - 진한 파스텔 초록
          }
        }

        return (
          <button
            key={option.id}
            onClick={() => setSeasonNature(selectedNature === option.id ? null : option.id)}
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
            {/* 🟢 1줄짜리 단어라도 앞선 스텝과 완벽하게 동일한 렌더링 로직 사용 (안정성 확보) */}
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