import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import Step0Landing from './steps/Step0Landing';
import Step1Gender from './steps/Step1Gender';
import StepLayout from './steps/components/StepLayout';
import { useFlowStore } from './store/useFlowStore';

export default function App() {
  // 🟢 [개선] Zustand 중앙 스토어에서 필요한 상태와 함수만 뽑아옵니다.
  const { step, gender, nextStep, prevStep } = useFlowStore();

  const getStepContent = () => {
    switch (step) {
      case 1:
        return {
          title: '어떤 성별의 이름을 원하시나요?',
          description: '이름의 어감과 의미를 구성하는 첫 번째 단계입니다.',
          component: <Step1Gender />, // 🟢 더 이상 프롭스를 넘길 필요가 없습니다!
          isNextDisabled: gender === null,
        };
      // case 2, 3, 4 ... 추가 예정
      default:
        return null;
    }
  };

  const stepData = getStepContent();

  return (
    <div 
      className="h-[100dvh] w-full flex flex-col font-sans bg-gray-50 bg-cover bg-center bg-no-repeat bg-fixed overflow-hidden"
      style={{ 
        backgroundImage: "linear-gradient(to right, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.95) 30%, rgba(255, 255, 255, 0.3) 75%, rgba(255, 255, 255, 0) 100%), url('/bg_mountain.png')" 
      }}
    >
      <Header />

      <main className={`flex-1 flex w-full min-h-0 flex-col ${
        step === 0 ? '' : 'overflow-y-auto'
      }`}>
        {step === 0 ? (
          <Step0Landing onNext={nextStep} />
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

      <Footer />
    </div>
  );
}