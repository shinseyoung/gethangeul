import React from 'react';
import { useFlowStore } from '../store/useFlowStore';
import { motion, type Variants } from 'framer-motion';
// 🟢 [추가] 하단 버튼용 Lucide 아이콘 라이브러리 연동
import { Download, Share2, RotateCcw } from 'lucide-react';

const MOCK_RESULT = {
  mainName: '서온',
  meaningTitle: '뜻 : 상서롭고 따뜻한',
  meaningDescription: '" 따뜻한 마음으로 사람들을 비추는 빛 "',
};

const MOCK_ALTERNATIVE_NAMES = [
  { name: '하람', sub: 'Ha-ram' },
  { name: '다온', sub: 'Da-on' },
  { name: '나래', sub: 'Na-rae' },
  { name: '로운', sub: 'Ro-wn' },
  { name: '그린', sub: 'Green' },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3, 
      staggerChildren: 0.15, 
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut" } 
  },
};

export default function Step5Result() {
  const { resetFlow } = useFlowStore();

  return (
    <motion.div 
      className="flex flex-col h-full w-full justify-between gap-3 md:gap-4 min-h-0"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      
      {/* 1. 상단 영역: 메인 결과 박스 (🟢 bg-white/50 반투명 가공 및 형광펜 배경 제거 완료) */}
      <motion.div 
        variants={itemVariants}
        className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 rounded-[24px] border-2 border-gray-200/60 bg-white/50 backdrop-blur-md shadow-xs transition-colors min-h-0"
      >
        {/* 🟢 요구하신 단정한 라벨로 변경 */}
        <span className="text-[11px] md:text-[13px] font-bold text-emerald-700 mb-2 tracking-wider">
          당신의 한글 이름
        </span>
        
        {/* 🟢 영문 이름 공간 완벽 삭제 처리 */}
        <h1 className="text-[40px] md:text-[52px] font-bold text-gray-950 tracking-wide font-serif leading-none my-2">
          {MOCK_RESULT.mainName}
        </h1>
        
        {/* 🟢 요구하신 뜻 및 문구 깔끔한 2줄 구조 가공 완료 */}
        <div className="flex flex-col items-center gap-1.5 mt-2">
          <p className="text-[13.5px] md:text-[15px] text-gray-800 font-semibold tracking-tight">
            {MOCK_RESULT.meaningTitle}
          </p>
          <p className="text-[12.5px] md:text-[14px] text-emerald-800/90 text-center break-keep font-medium leading-relaxed italic">
            {MOCK_RESULT.meaningDescription}
          </p>
        </div>
      </motion.div>

      {/* 2. 중간 영역: 비슷한 느낌의 다른 이름 공간 */}
      <motion.div variants={itemVariants} className="w-full shrink-0">
        <h3 className="text-[12.5px] md:text-[13.5px] font-bold text-gray-500 mb-2 pl-0.5 tracking-tight">
          비슷한 느낌의 다른 이름
        </h3>
        
        <div className="grid grid-cols-5 gap-2 w-full">
          {MOCK_ALTERNATIVE_NAMES.map((alt, idx) => (
            <div 
              key={idx} 
              className="flex flex-col items-center justify-center p-2 rounded-[16px] border border-gray-200 bg-white/60 backdrop-blur-xs shadow-xs hover:border-gray-300 hover:bg-white transition-colors text-center min-h-[65px] md:min-h-[80px]"
            >
              <span className="text-[13.5px] md:text-[15px] font-bold text-gray-900 block mb-0.5">
                {alt.name}
              </span>
              <span className="text-[9.5px] md:text-[11px] text-gray-400 font-medium tracking-tight block truncate w-full">
                {alt.sub}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 3. 하단 영역: 3버튼 그룹 (🟢 왼쪽 정렬선에 아이콘 정밀 배치 완료) */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-2 md:gap-3 w-full shrink-0 pt-1">
        <button
          onClick={() => alert('다운로드 기능 준비 중입니다.')}
          className="flex items-center justify-center gap-2 p-3 rounded-[16px] border border-gray-200 bg-white font-bold text-[12.5px] md:text-[14px] text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:scale-98 transition-all duration-200 shadow-xs"
        >
          <Download size={16} strokeWidth={2.5} className="text-gray-500" />
          결과 다운로드
        </button>
        
        <button
          onClick={() => alert('공유 기능 준비 중입니다.')}
          className="flex items-center justify-center gap-2 p-3 rounded-[16px] border border-gray-200 bg-white font-bold text-[12.5px] md:text-[14px] text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:scale-98 transition-all duration-200 shadow-xs"
        >
          <Share2 size={16} strokeWidth={2.5} className="text-gray-500" />
          이름 공유하기
        </button>
        
        <button
          onClick={() => resetFlow()}
          className="flex items-center justify-center gap-2 p-3 rounded-[16px] bg-emerald-600 font-bold text-[12.5px] md:text-[14px] text-white hover:bg-emerald-700 active:scale-98 transition-all duration-200 shadow-sm"
        >
          <RotateCcw size={16} strokeWidth={2.5} className="text-white/90" />
          다시 만들기
        </button>
      </motion.div>

    </motion.div>
  );
}