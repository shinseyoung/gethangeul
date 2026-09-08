import { useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import Step0Landing from './steps/Step0Landing';
import StepOptions from './steps/StepOptions';
import StepLoading from './steps/StepLoading';
import StepResult from './steps/StepResult';
import AdSlot from './components/AdSlot';
import { QUESTION_STEPS, useFlowStore, type QuestionStep } from './store/useFlowStore';
import { useTranslation } from './hooks/useTranslation';

const isQuestion = (step: string): step is QuestionStep =>
  (QUESTION_STEPS as readonly string[]).includes(step);

/** The one unit that is always on screen. Only on the result. */
function AnchorAd() {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-center gap-3 border-t border-rule-strong bg-ground/95 px-4 py-2 backdrop-blur-sm">
      <span className="eyebrow text-[7.5px] tracking-[0.22em] text-ink-4">{t('result.ads.mobile_badge')}</span>
      <AdSlot size="320x50" bare className="w-full max-w-[320px]" />
    </div>
  );
}

export default function App() {
  const step = useFlowStore((s) => s.step);
  const lang = useFlowStore((s) => s.lang);

  // Announce the page language: assistive tech, hyphenation and our own
  // per-script line-height rules all key off it.
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  // /en, /ko, /vi, /th are real addresses now, so back and forward have to work
  useEffect(() => {
    const sync = () => useFlowStore.getState().syncLangFromPath();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [step]);

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-ground">
      <Header />
      <main className="flex w-full flex-1 flex-col">
        {step === 'landing' && <Step0Landing />}
        {isQuestion(step) && <StepOptions step={step} />}
        {step === 'loading' && <StepLoading />}
        {step === 'result' && <StepResult />}
      </main>
      <Footer />
      {step === 'result' && <AnchorAd />}
    </div>
  );
}
