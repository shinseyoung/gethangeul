import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import Step0Landing from './steps/Step0Landing';
import Step1Gender from './steps/Step1Gender';
// 🟢 기획자님이 만들어두신 빈 파일들을 import 합니다 (파일 이름이 다르면 여기를 수정해주세요)
import Step2Vibe from './steps/Step2Vibe';
import Step3Personality from './steps/Step3Personality';
import Step4Nature from './steps/Step4Nature';
import StepLayout from './steps/components/StepLayout';
import { useFlowStore } from './store/useFlowStore';

export default function App() {
  const { step, gender, nextStep, prevStep } = useFlowStore();

  const getStepContent = () => {
    switch (step) {
      case 1:
        return {
          title: '어떤 성별에 어울리는 이름을 원하시나요?',
          description: '추천될 이름의 범위를 정하는 데 활용돼요.',
          component: <Step1Gender />,
          isNextDisabled: gender === null,
        };
      // 🟢 빈 파일들을 흐름에 맞게 배치합니다. (아직 안 만들었으니 isNextDisabled는 임시로 false로 둡니다)
      case 2:
        return {
          title: '사람들에게 어떤 분위기로 기억되고 싶으신가요?',
          description: '이름이 주는 첫인상을 결정해요.',
          //component: <Step2Vibe />, // 빈 파일
          isNextDisabled: false, 
        };
      case 3:
        return {
          title: '당신을 가장 잘 표현하는 모습은 무엇인가요?',
          description: '당신의 개성을 반영하는 중요한 요소예요.',
          //component: <Step3Personality />, // 빈 파일
          isNextDisabled: false,
        };
      case 4:
        return {
          title: '이름에 어떤 계절이나 자연의 감성을 담고 싶으신가요?',
          description: '이름에 담길 의미와 상징을 더해요.',
          //component: <Step4Nature />, // 빈 파일
          isNextDisabled: false,
        };
      case 5:
        // 결과 페이지는 StepLayout을 쓸 수도 있고 안 쓸 수도 있습니다. 임시 처리합니다.
        return {
          title: '결과 분석 중...',
          description: '선택해주신 정보들을 바탕으로 가장 어울리는 한글 이름을 찾고 있습니다.',
          component: <div>결과 화면 준비 중</div>, 
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