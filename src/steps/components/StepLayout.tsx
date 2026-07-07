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
    <div className="w-full lg:w-[1024px] xl:w-[1200px] mx-auto my-auto flex flex-col md:flex-row gap-8 lg:gap-12 items-stretch justify-center relative z-10 px-6 lg:px-4 py-8 md:py-12">
      
      {/* 🟢 좌측 패널: 상하좌우 패딩을 p-6(24px)으로 균일하게 잡아 상단/하단 대칭 여백의 기준 확보 */}
      <div className="w-full md:w-[340px] bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-[26px] p-6 shadow-lg flex flex-col shrink-0 h-fit">
        
        {/* 상단 헤더 영역 (회색 구분선 border-b) */}
        <div className="pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2 text-[#1e4a38]">
            <span className="text-[11px] font-extrabold tracking-widest uppercase bg-[#1e4a38]/10 px-2.5 py-1 rounded-md">
              HANGEUL NAME
            </span>
          </div>
          <p className="text-[13px] text-gray-400 mt-2 font-medium break-keep">
            당신의 고유한 성향을 분석하여 단 하나뿐인 아름다운 우리말 이름을 짓습니다.
          </p>
        </div>

        {/* 🟢 스텝 리스트 컨테이너:
            - mt-4를 주어 [회색선 ~ 스텝 1 윗면] 간격을 생성
            - 아래쪽은 추가 여백 없이 카드 자체의 pb-6만 작동하게 하여 [스텝 4 아랫면 ~ 카드 바닥선] 간격과 1:1 일치시킴 */}
        <div className="flex flex-col mt-4">
          <div className="relative w-full flex flex-col gap-3">
            
            {/* 세로 진행선 */}
            <div className="absolute left-[39px] top-[40px] bottom-[40px] w-[2px] bg-gray-200 z-10">
              <div
                className="absolute left-0 top-0 w-full bg-[#1e4a38] transition-all duration-500 ease-out z-10"
                style={{
                  height: isResultPage ? '100%' 
                        : currentStep === 1 ? '0%' 
                        : currentStep === 2 ? '33.33%' 
                        : currentStep === 3 ? '66.66%' 
                        : '100%'
                }}
              />
            </div>

            {STEPS_DATA.map((step) => {
              const isPassed = isResultPage ? true : currentStep > step.num;
              const isActive = isResultPage ? false : currentStep === step.num;

              return (
                <div key={step.num} className="relative flex items-center gap-5 p-3.5 w-full shrink-0">
                  <div className={`absolute inset-0 bg-slate-50 border border-gray-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.03)] rounded-[20px] z-0 transition-opacity duration-300 pointer-events-none ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`} />
                  
                  <div className={`relative z-20 w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isPassed ? 'bg-[#1e4a38] border-2 border-[#1e4a38] text-white shadow-sm' 
                      : isActive ? 'bg-white border-2 border-[#1e4a38] text-gray-500' 
                      : 'bg-white border-2 border-gray-200 text-gray-400' 
                  }`}>
                    {isPassed ? <Check size={22} strokeWidth={3} /> : <step.icon size={22} strokeWidth={isActive ? 2.5 : 2} />}
                  </div>

                  <div className="relative z-20 flex flex-col">
                    <span className={`text-[11px] font-extrabold tracking-widest mb-0.5 transition-colors duration-300 ${
                      isActive ? 'text-[#1e4a38]' : isPassed ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      STEP {step.num}
                    </span>
                    <span className={`text-[16px] font-bold transition-colors duration-300 ${
                      isActive ? 'text-gray-900' : isPassed ? 'text-gray-700' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 🟢 우측 콘텐츠 영역: justify-between 구조로 바닥 버튼을 정렬하면서 타이틀 여백 확보 */}
      <div className="flex-1 flex flex-col w-full justify-between relative min-h-0">
        
        {/* 🟢 상단 타이틀: pt-4 md:pt-6 패딩을 주어 왼쪽 흰색 카드 윗면보다 살짝 여유롭게 내려와 안착 (스텝 1의 예쁜 마진 고정) */}
        {!isResultPage && (title || description) && (
          <div className="mb-4 pt-4 md:pt-6 shrink-0">
            <h2 className="text-[28px] md:text-[34px] font-bold text-gray-900 mb-3 leading-[1.1] drop-shadow-sm break-keep tracking-tight">
              {title}
            </h2>
            <p className="text-gray-600 text-lg font-medium drop-shadow-sm break-keep">
              {description}
            </p>
          </div>
        )}

        {/* 중앙 알맹이 영역 */}
        <div className="w-full flex-1 flex flex-col justify-center min-h-0 py-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full flex flex-col justify-center"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 하단 버튼 내비게이션: 항상 좌측 흰색 카드 바닥선과 1:1로 칼같이 떨어짐 */}
        {!isResultPage && (
          <div className="pt-6 flex justify-between items-center w-full shrink-0">
            <button 
              onClick={onPrev}
              className={`px-8 py-4 rounded-full font-bold text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-300 hover:bg-white transition-colors shadow-sm ${currentStep === 1 ? 'invisible' : ''}`}
            >
              이전
            </button>
            
            <button 
              onClick={onNext}
              disabled={isNextDisabled}
              className={`flex items-center gap-2 px-10 py-4 rounded-full font-bold text-white transition-all shadow-md ${
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