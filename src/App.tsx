import { useState } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import Step0Landing from './steps/Step0Landing';
import Step1Gender from './steps/Step1Gender';

interface NamingFormData {
  gender: 'male' | 'female' | 'neutral' | null;
}

export default function App() {
  const [step, setStep] = useState<number>(0);
  const [formData, setFormData] = useState<NamingFormData>({
    gender: null,
  });

  const handleNextStep = () => setStep((prev) => prev + 1);
  const handlePrevStep = () => setStep((prev) => Math.max(0, prev - 1));

  const handleGenderSelect = (selectedGender: 'male' | 'female' | 'neutral') => {
    setFormData((prev) => ({ ...prev, gender: selectedGender }));
    handleNextStep(); 
  };

  return (
    // [개선 1] min-h-screen 대신 h-[100dvh]와 overflow-hidden 적용
    // 전체 레이아웃이 화면 밖으로 빠져나가는 것을 원천 차단하여 Footer를 바닥에 강제 고정합니다.
    <div 
      className="h-[100dvh] w-full flex flex-col font-sans bg-gray-50 bg-cover bg-center bg-no-repeat bg-fixed overflow-hidden"
      style={{ backgroundImage: "url('/bg_mountain.png')" }}
    >
      <Header />

      {/* [개선 2] flex-1에 min-h-0 추가
        자식 요소가 아무리 길어도 부모 영역을 찢고 나가지 못하게(내부 스크롤 유도) 막아줍니다.
        Step 0 랜딩 페이지일 때는 패딩(p-4)을 완전히 없애서 기획하신 디자인이 100% 핏되게 맞춥니다.
      */}
      <main className={`flex-1 flex w-full min-h-0 flex-col ${
        step === 0 
          ? '' // 랜딩 페이지는 스스로 꽉 차게 렌더링 (자체 스크롤 활용)
          : 'items-center justify-center p-4 md:p-8 overflow-y-auto' // 스텝1부터는 카드 띄우기 및 스크롤
      }`}>
        {step === 0 && <Step0Landing onNext={handleNextStep} />}
        
        {step === 1 && (
          <Step1Gender 
            onNext={handleGenderSelect} 
            onPrev={handlePrevStep}
            savedGender={formData.gender}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}