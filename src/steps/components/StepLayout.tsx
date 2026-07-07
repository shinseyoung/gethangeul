import React from 'react';
import { Sparkles, LayoutGrid, Leaf, UserRound, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS_DATA = [
  { num: 1, title: '성별 선택', icon: UserRound },
  { num: 2, title: '이름의 분위기', icon: Sparkles },
  { num: 3, title: '성격 및 가치관', icon: LayoutGrid },
  { num: 4, title: '계절 및 자연', icon: Leaf },
];

interface StepLayoutProps {
  currentStep: number;
  title: string;
  description: string;
  children: React.ReactNode;
  onNext?: () => void;
  onPrev?: () => void;
  isNextDisabled?: boolean;
}

export default function StepLayout({
  currentStep,
  title,
  description,
  children,
  onNext,
  onPrev,
  isNextDisabled = false
}: StepLayoutProps) {
  const isResultPage = currentStep === 5;

  return (
    // PC 오리지널 구조 원복. 겹침을 방지하기 위해 컨테이너에 유연한 Flex 흐름 적용
    <div className="w-full max-w-[1200px] mx-auto flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-12 px-4 md:px-6 lg:px-4 py-4 md:py-8 relative z-10">
      
      {/* [수정됨] 기획자님 오리지널 UI 디테일 100% 유지 
        - 모바일 화면에서는 flex-row를 적용해 가로 탭 형태로 위로 안착 (스크롤 가능)
        - PC에서는 md:flex-col로 기존과 똑같은 아름다운 좌측 사이드바 구조 
      */}
      <div className={`flex flex-row md:flex-col w-full md:w-[340px] bg-white/95 md:backdrop-blur-md md:border border-gray-200/80 rounded-[20px] md:rounded-[26px] p-4 md:p-6 shadow-sm md:shadow-lg shrink-0 overflow-x-auto md:overflow-visible no-scrollbar ${
        isResultPage ? 'hidden md:flex' : 'flex'
      }`}>
        
        {/* 사이드바 상단 텍스트 (모바일 탭 바 공간 확보를 위해 숨김, PC는 유지) */}
        <div className="hidden md:block pt-2 pb-4 border-b border-gray-100 mb-4 shrink-0">
          <div className="flex items-center gap-2 text-[#1e4a38]">
            <span className="text-[11px] font-extrabold tracking-widest uppercase bg-[#1e4a38]/10 px-2.5 py-1 rounded-md">
              HANGEUL NAME
            </span>
          </div>
          <p className="text-[13px] text-gray-400 mt-2 font-medium break-keep">
            당신의 고유한 성향을 분석하여 단 하나뿐인 아름다운 우리말 이름을 짓습니다.
          </p>
        </div>

        {/* 스텝 리스트 영역 */}
        <div className="flex flex-row md:flex-col gap-3 md:gap-4 relative w-full items-center md:items-stretch">
          
          {/* PC 전용 진행률 세로 선 (기존 디자인 유지) */}
          <div className="hidden md:block absolute left-[39px] top-[40px] bottom-[40px] w-[2px] bg-gray-200 z-10">
            <div
              className="absolute left-0 top-0 w-full bg-[#1e4a38] transition-all duration-500 ease-out z-10"
              style={{
                height: isResultPage ? '100%' : `${((currentStep - 1) / (STEPS_DATA.length - 1)) * 100}%`
              }}
            />
          </div>

          {STEPS_DATA.map((step) => {
            const isPassed = isResultPage ? true : currentStep > step.num;
            const isActive = isResultPage ? false : currentStep === step.num;

            return (
              <div key={step.num} className="relative flex items-center gap-2 md:gap-5 md:p-4 shrink-0">
                {/* 활성화 배경 (PC 전용 쉐도우 유지) */}
                <div className={`hidden md:block absolute inset-0 bg-slate-50 border border-gray-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.03)] rounded-[20px] z-0 transition-opacity duration-300 pointer-events-none ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`} />
                
                {/* 스텝 아이콘 */}
                <div className={`relative z-20 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                  isPassed ? 'bg-[#1e4a38] border-2 border-[#1e4a38] text-white shadow-sm' 
                    : isActive ? 'bg-white border-2 border-[#1e4a38] text-gray-800 shadow-sm' 
                    : 'bg-white border-2 border-gray-200 text-gray-400' 
                }`}>
                  {isPassed ? <Check size={20} strokeWidth={3} /> : <step.icon size={20} className={isActive ? 'text-[#1e4a38]' : ''} strokeWidth={isActive ? 2.5 : 2} />}
                </div>

                {/* 스텝 텍스트 */}
                <div className="relative z-20 flex flex-col">
                  <span className={`hidden md:block text-[11px] font-extrabold tracking-widest mb-0.5 transition-colors duration-300 ${
                    isActive ? 'text-[#1e4a38]' : isPassed ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    STEP {step.num}
                  </span>
                  {/* 모바일 가독성을 위해 비활성 텍스트는 숨기고 선택된 텍스트만 보여주어 탭바 느낌 연출 */}
                  <span className={`text-[12px] md:text-[16px] font-bold whitespace-nowrap transition-colors duration-300 ${
                    isActive ? 'text-gray-900' : isPassed ? 'text-gray-700' : 'text-gray-400 hidden md:block'
                  }`}>
                    {step.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 우측 메인 콘텐츠 영역 (배경 겹침 현상 원천 차단) */}
      <div className="flex-1 flex flex-col w-full relative min-w-0">
        
        {/* 타이틀 영역: shrink-0을 주어 텍스트가 길어져도 찌그러지거나 아래 버튼과 겹치지 않게 방어 */}
        {!isResultPage && (title || description) && (
          <div className="mb-6 md:mb-8 pt-2 md:pt-4 shrink-0">
            <h2 className="text-[24px] sm:text-[28px] md:text-[34px] font-bold text-gray-900 mb-2 md:mb-3 leading-[1.3] break-keep tracking-tight">
              {title}
            </h2>
            <p className="text-[14px] md:text-[16px] text-gray-500 font-medium break-keep leading-relaxed">
              {description}
            </p>
          </div>
        )}

        {/* 선택지 컴포넌트 알맹이 영역: 정상적인 플렉스 흐름 유지 */}
        <div className="flex-1 flex flex-col justify-start">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full flex flex-col justify-center"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 하단 내비게이션 버튼 (mt-auto를 주어 자연스럽게 맨 밑으로 밀어냄. 텍스트가 커져도 겹침 절대 불가) */}
        {!isResultPage && (
          <div className="mt-8 pt-6 pb-2 flex justify-between items-center w-full border-t border-gray-100 shrink-0">
            <button 
              onClick={onPrev}
              className={`px-6 md:px-8 py-3.5 md:py-4 rounded-full font-bold text-gray-600 bg-white/80 backdrop-blur-sm border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm ${currentStep === 1 ? 'invisible' : ''}`}
            >
              이전
            </button>
            
            <button 
              onClick={onNext}
              disabled={isNextDisabled}
              className={`flex items-center gap-2 px-8 md:px-10 py-3.5 md:py-4 rounded-full font-bold text-white transition-all shadow-md ${
                isNextDisabled ? 'bg-gray-300 cursor-not-allowed shadow-none' : 'bg-[#1e4a38] hover:bg-[#143427] hover:-translate-y-[1px] hover:shadow-lg'
              }`}
            >
              다음
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}