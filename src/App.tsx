import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import Step0Landing from './steps/Step0Landing';
import Step1Gender from './steps/Step1Gender';
import Step2Vibe from './steps/Step2Vibe';
import Step3Personality from './steps/Step3Personality';
import Step4Nature from './steps/Step4Nature';
import Step5Result from './steps/Step5Result'; // 🟢 Step 5 추가
import StepLayout from './steps/components/StepLayout';
import { useFlowStore } from './store/useFlowStore';

export default function App() {
  // 🟢 seasonNature 상태도 추가로 불러옵니다.
  const { step, gender, vibe, personality, seasonNature, nextStep, prevStep } = useFlowStore();

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
          component: <Step4Nature />, // 🟢 빈 파일 주석 해제 및 연결
          isNextDisabled: seasonNature === null, // 🟢 Step 4 검증 로직 추가
        };
      case 5:
        return {
          // 🟢 기획하신 대로 상단의 "결과 분석 중..." 텍스트를 완전히 비우고 화면을 제공합니다.
          title: '', 
          description: '',
          component: <Step5Result />, 
          // 🟢 어차피 Step5 내부에 3개의 커스텀 버튼이 있으므로 기존 Next 버튼은 숨김(비활성화) 처리합니다.
          isNextDisabled: true, 
        };
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

      <main className={`flex-1 flex w-full min-h-0 flex-col ${step === 0 ? '' : 'overflow-y-auto'}`}>
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