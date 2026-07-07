import { useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import Step0Landing from './steps/Step0Landing';
import Step1Gender from './steps/Step1Gender';
import Step2Vibe from './steps/Step2Vibe';
import Step3Personality from './steps/Step3Personality';
import Step4Nature from './steps/Step4Nature';
import Step5Result from './steps/Step5Result';
import StepLayout from './steps/components/StepLayout';
import { useFlowStore } from './store/useFlowStore';

export default function App() {
  const { step, gender, vibe, personality, seasonNature, nextStep, prevStep } = useFlowStore();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const getStepContent = () => {
    switch (step) {
      case 1:
        return {
          title: '어떤 성별에 어울리는 이름을 원하시나요?',
          description: '추천될 이름의 범위를 정하는 데 활용돼요.',
          component: <Step1Gender />,
          isNextDisabled: gender === null,
        };
      case 2:
        return {
          title: '사람들에게 어떤 분위기로 기억되고 싶으신가요?',
          description: '이름이 주는 첫인상을 결정해요.',
          component: <Step2Vibe />,
          isNextDisabled: vibe === null,
        };
      case 3:
        return {
          title: '당신을 가장 잘 표현하는 모습은 무엇인가요?',
          description: '당신의 개성을 반영하는 중요한 요소예요.',
          component: <Step3Personality />,
          isNextDisabled: personality === null,
        };
      case 4:
        return {
          title: '어떤 계절이나 자연의 감성을 담고 싶으신가요?',
          description: '이름에 담길 의미와 상징을 더해요.',
          component: <Step4Nature />,
          isNextDisabled: seasonNature === null,
        };
      default:
        return null;
    }
  };

  const stepData = getStepContent();

  return (
    // 🟢 변경 포인트 1: 모바일에서는 최소 높이만 지정하고 스크롤 허용 (min-h-[100dvh] overflow-y-auto)
    //                PC(md) 환경에서는 기존의 칼정렬 고정 레이아웃 유지 (md:h-[100dvh] md:overflow-hidden)
    <div 
      className="min-h-[100dvh] md:h-[100dvh] w-full flex flex-col font-sans bg-gray-50 bg-cover bg-center bg-no-repeat bg-fixed overflow-y-auto md:overflow-hidden"
      style={{ 
        backgroundImage: "linear-gradient(to right, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.95) 30%, rgba(255, 255, 255, 0.3) 75%, rgba(255, 255, 255, 0) 100%), url('/bg_mountain.png')" 
      }}
    >
      <Header />

      {/* 🟢 변경 포인트 2: main 영역 역시 모바일에서는 자식 콘텐츠 크기에 맞춰 늘어나도록 overflow-visible 설정 */}
      <main className="flex-1 flex w-full min-h-0 flex-col overflow-visible md:overflow-hidden">
        {step === 0 ? (
          <Step0Landing onNext={nextStep} />
        ) : step === 5 ? (
          <div className="w-full lg:w-[1024px] xl:w-[1200px] mx-auto my-auto flex flex-col items-center justify-center relative z-10 px-6 lg:px-4 py-3 md:py-4 min-h-0 flex-1 h-full overflow-hidden">
            <Step5Result />
          </div>
        ) : (
          <StepLayout
            currentStep={step}
            title={stepData?.title || ''}
            description={stepData?.description || ''}
            onNext={nextStep}
            onPrev={prevStep}
            isNextDisabled={stepData?.isNextDisabled}
          >
            {stepData?.component}
          </StepLayout>
        )}
      </main>

      {/* 🟢 결과: 모바일에서는 메인이 길어지면 푸터가 화면 아래로 자연스럽게 밀려나 숨겨지며, 스크롤을 끝까지 내렸을 때만 노출됩니다. */}
      <Footer />
    </div>
  );
}