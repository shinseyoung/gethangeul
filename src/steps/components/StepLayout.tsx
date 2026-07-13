import React from 'react';
import { Sparkles, LayoutGrid, Leaf, UserRound, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from "../../hooks/useTranslation";

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

  const { t } = useTranslation();

  // 🟢 모바일 가로 게이지 바 채우기 비율 계산
  const progressPercentage = isResultPage ? 100 : (currentStep / 4) * 100;

  return (
    // 🟢 변경 포인트 1: 모바일 전체 상하 패딩을 py-4로 콤팩트하게 줄여 요소들이 화면 위로 쫙 붙게 조절
    <div className="w-full lg:w-[1024px] xl:w-[1200px] mx-auto mt-2 mb-auto md:my-auto flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-12 items-stretch justify-center relative z-10 px-6 lg:px-4 py-4 md:py-12">
      
      {/* 🟢 변경 포인트 2: [PC 전용 패널] md 미만(모바일) 해상도에서는 hidden으로 아예 렌더링 스페이스에서 제거 */}
      <div className="hidden md:flex w-[340px] bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-[26px] p-6 shadow-lg flex-col shrink-0 h-fit">
        {/* 상단 헤더 영역 */}
        <div className="pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2 text-[#1e4a38]">
            <span className="text-[11px] font-extrabold tracking-widest uppercase bg-[#1e4a38]/10 px-2.5 py-1 rounded-md">
              진행 단계
            </span>
          </div>
          <p className="text-[13px] text-gray-400 mt-2 font-medium break-keep ml-[2.5px]">
            당신의 고유한 성향을 분석하여 
            <br />
            단 하나뿐인 아름다운 우리말 이름을 짓습니다.
          </p>
        </div>

        {/* 세로 스텝 진행 리스트 */}
        <div className="flex flex-col mt-4">
          <div className="relative w-full flex flex-col gap-3">
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

      {/* 우측 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col w-full justify-between relative min-h-0">
        
        {/* 🟢 변경 포인트 3: [모바일 전용 상단 프로그레스 UI] md 미만(모바일)에서만 노출되는 초슬림 게이지 바 */}
        {!isResultPage && (
          <div className="flex flex-col w-full md:hidden mb-4 shrink-0">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-extrabold tracking-widest text-[#1e4a38] bg-[#1e4a38]/10 px-2 py-0.5 rounded">
                STEP {currentStep} / 4
              </span>
              <span className="text-[12px] font-bold text-gray-700">
                {STEPS_DATA[currentStep - 1]?.title}
              </span>
            </div>
            <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#1e4a38] transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* 🟢 변경 포인트 4: 모바일용 헤딩 폰트 크기를 text-[22px]로 다이어트하여 스페이싱 최적화 */}
        {!isResultPage && (title || description) && (
          <div className="mb-4 pt-1 md:pt-6 shrink-0">
            <h2 className="text-[22px] md:text-[34px] font-bold text-gray-900 mb-2 md:mb-3 leading-[1.2] md:leading-[1.1] drop-shadow-sm break-keep tracking-tight">
              {title}
            </h2>
            <p className="text-gray-500 md:text-gray-600 text-xs md:text-lg font-medium drop-shadow-sm break-keep">
              {description}
            </p>
          </div>
        )}

        {/* 중앙 선택지 렌더링 영역 */}
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

        {/* 🟢 변경 포인트 5: 하단 내비게이션 버튼 크기 및 패딩 모바일 미세 축소 (px-6 py-3.5) */}
        {!isResultPage && (
          <div className="pt-4 md:pt-6 flex justify-between items-center w-full shrink-0">
            <button 
              onClick={onPrev}
              className={`px-6 py-3.5 md:px-8 md:py-4 rounded-full font-bold text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-300 hover:bg-white transition-colors shadow-sm text-sm md:text-base ${currentStep === 1 ? 'invisible' : ''}`}
            >
              {t("layout.buttons.prev")}
            </button>
            
            <button 
              onClick={onNext}
              disabled={isNextDisabled}
              className={`flex items-center gap-2 px-8 py-3.5 md:px-10 md:py-4 rounded-full font-bold text-white transition-all shadow-md text-sm md:text-base ${
                isNextDisabled ? 'bg-gray-300 cursor-not-allowed shadow-none' : 'bg-[#1e4a38] hover:bg-[#143427] hover:-translate-y-[1px] hover:shadow-lg'
              }`}
            >
              {t("layout.buttons.next")}
              <svg width="18" height="18" className="md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </button>
          </div>
        )}
      </div>

    </div>
  );
}