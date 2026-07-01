import React from 'react';
import { Sparkles, LayoutGrid, Gift, Leaf, UserRound } from 'lucide-react';

// 스텝 데이터
const STEPS_DATA = [
  { num: 1, title: '성별 선택', icon: UserRound },
  { num: 2, title: '이름의 분위기', icon: Sparkles },
  { num: 3, title: '성격 및 가치관', icon: LayoutGrid },
  { num: 4, title: '계절 및 자연', icon: Leaf },
  { num: 5, title: '결과 확인', icon: Gift },
];

interface StepLayoutProps {
  currentStep: number;
  totalSteps?: number;
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
  // 🔴 오타(return दल) 수정 완료: 올바른 JSX 괄호로 복구했습니다.
  return (
    // 핵심 수정 사항: 가장 바깥 컨테이너의 너비와 패딩을 Step0Landing과 100% 동일하게 일치시켰습니다.
    // 기존: w-full max-w-[1100px] px-6 md:px-8
    // 변경: w-full lg:w-[1024px] xl:w-[1200px] px-6 lg:px-4
    <div className="w-full lg:w-[1024px] xl:w-[1200px] mx-auto flex flex-col md:flex-row gap-12 md:gap-20 items-start relative z-10 px-6 lg:px-4 py-8 md:py-10">

      {/* [좌측 영역] 오직 이 부분만 별도의 둥근 네모 박스로 감싸짐 (기획 이미지 완벽 반영) */}
      <div className="w-full md:w-[340px] bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-[26px] p-6 shadow-lg flex flex-col shrink-0">
        
        {/* 단계 표시 래퍼 */}
        <div className="flex flex-col relative w-full">
          
          {/* 타임라인 트랙 (회색 선 + 초록 선) */}
          <div className="absolute left-[43px] top-[44px] bottom-[44px] w-[2px] bg-gray-200 z-10">
            {/* 🟢 진행률 트랙 (초록색 선) */}
            <div
              className="absolute left-0 top-0 w-full bg-[#1e4a38] transition-all duration-500 ease-out z-10"
              style={{
                // 현 단계의 회색 하이라이트 박스 맨 아래(44px)까지 초록선이 가득 채워지도록 calc 연산
                height: `min(100%, calc(${((currentStep - 1) / (STEPS_DATA.length - 1)) * 100}% + 44px))`
              }}
            />
          </div>

          {STEPS_DATA.map((step) => {
            const isActive = currentStep === step.num;
            const isPassed = currentStep > step.num;

            return (
              <div key={step.num} className="relative flex items-center gap-5 p-5 w-full">
                
                {/* 현 단계 회색 하이라이트 박스 (z-0) */}
                <div className={`absolute inset-0 bg-slate-50 border border-gray-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.03)] rounded-[20px] z-0 transition-opacity duration-300 pointer-events-none ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`} />
                
                {/* 단계 파비콘 동그라미 (z-20) */}
                <div className={`relative z-20 w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                  isActive 
                    ? 'bg-[#1e4a38] text-white shadow-md' 
                    : isPassed
                    ? 'bg-white border-2 border-[#1e4a38] text-[#1e4a38]' 
                    : 'bg-white border-2 border-gray-200 text-gray-400' 
                }`}>
                  <step.icon size={22} strokeWidth={isActive || isPassed ? 2.5 : 2} />
                </div>
                
                {/* 스텝 텍스트 영역 (z-20) */}
                <div className="relative z-20 flex flex-col">
                  <span className={`text-[12px] font-extrabold tracking-widest mb-0.5 transition-colors duration-300 ${
                    isActive ? 'text-[#1e4a38]' : isPassed ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    STEP {step.num}
                  </span>
                  <span className={`text-[17px] font-bold transition-colors duration-300 ${
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

      {/* [우측 영역] 어떤 박스에도 갇혀있지 않은 자유로운 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col w-full md:mt-2">
        
        {/* 주제 및 소주제 (박스 없이 배경 위에 바로 노출) */}
        <div className="mb-10 px-2">
          <h2 className="text-[32px] md:text-[40px] font-bold text-gray-900 mb-4 leading-tight drop-shadow-sm">
            {title}
          </h2>
          <p className="text-gray-600 text-lg font-medium drop-shadow-sm break-keep">
            {description}
          </p>
        </div>

        {/* 카드 등 내부 컨텐츠 */}
        <div className="w-full">
          {children}
        </div>

        {/* 독립적으로 떠 있는 하단 버튼들 */}
        <div className="mt-14 pt-8 border-t border-gray-300/60 flex justify-between items-center w-full px-2">
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
              isNextDisabled 
                ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                : 'bg-[#1e4a38] hover:bg-[#143427] hover:-translate-y-[1px] hover:shadow-lg'
            }`}
          >
            다음 
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
}