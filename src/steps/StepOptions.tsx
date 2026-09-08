import { QUESTION_STEPS, useFlowStore, type QuestionStep } from '../store/useFlowStore';
import { useTranslation } from '../hooks/useTranslation';
import OptionMark from '../components/OptionMark';
import CheckMark from '../components/CheckMark';
import Button, { ArrowLeft, ArrowRight } from '../components/Button';

/**
 * One screen for all four questions. These used to be four near-identical files
 * whose only real difference was a switch statement of pastel border colours.
 */

const OPTIONS: Record<QuestionStep, string[]> = {
  gender: ['male', 'female', 'neutral'],
  vibe: ['bright', 'calm', 'natural', 'soft', 'mystic', 'trendy', 'strong', 'lovely'],
  personality: [
    'radiant', 'considerate', 'dependable', 'whimsical', 'genuine', 'inquisitive',
    'enterprising', 'prudent', 'upright', 'sensitive', 'graceful', 'resilient',
  ],
  nature: ['spring', 'summer', 'autumn', 'winter', 'mountain', 'sea', 'river', 'forest'],
};

const COLS: Record<QuestionStep, string> = {
  gender: 'grid-cols-1 sm:grid-cols-3',
  vibe: 'grid-cols-2 md:grid-cols-4',
  personality: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  nature: 'grid-cols-2 md:grid-cols-4',
};

export default function StepOptions({ step }: { step: QuestionStep }) {
  const { setAnswer, answerFor, next, prev } = useFlowStore();
  const { t } = useTranslation();

  const index = QUESTION_STEPS.indexOf(step);
  const selected = answerFor(step);
  const questionKey = `questions.step${index + 1}`;

  return (
    <div className="mx-auto flex w-full max-w-[900px] flex-1 flex-col px-6 pb-8 pt-5 lg:px-4">
      {/* progress */}
      <div>
        <div className="flex items-center gap-2">
          {QUESTION_STEPS.map((s, i) => (
            <span key={s} className="contents">
              <span
                className={`block h-[9px] w-[9px] rotate-45 border ${
                  i < index ? 'border-accent bg-accent'
                    : i === index ? 'border-[1.5px] border-accent bg-paper'
                    : 'border-rule-strong bg-paper'
                }`}
              />
              {i < QUESTION_STEPS.length - 1 && (
                <span className={`h-px flex-1 ${i < index ? 'bg-accent' : 'bg-rule'}`} />
              )}
            </span>
          ))}
        </div>
        <div className="mt-2.5 flex justify-between">
          {QUESTION_STEPS.map((s, i) => (
            <span key={s} className={`eyebrow text-[8.5px] ${i === index ? 'text-accent' : 'text-ink-4'}`}>
              {t(`layout.steps.${i + 1}`)}
            </span>
          ))}
        </div>
      </div>

      <div className="pb-5 pt-7">
        <h2 className="mb-2.5 -ml-[0.035em] text-pretty font-disp text-[29px] leading-[1.1] tracking-tight text-ink md:text-[38px]">
          {t(`${questionKey}.title`)}
        </h2>
        <p className="text-[14px] leading-relaxed text-ink-3 md:text-[15px]">{t(`${questionKey}.description`)}</p>
      </div>

      <div className={`grid gap-2.5 ${COLS[step]}`}>
        {OPTIONS[step].map((id) => {
          const on = selected === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={on}
              onClick={() => setAnswer(step, on ? null : id)}
              /* border width is identical in both states so the box never
                 resizes — that shift is what made these feel like they wobbled */
              className={`focus-ring flex min-h-[84px] items-center gap-3.5 rounded-2xl border-[1.5px] p-3.5 text-left transition-colors duration-150 ${
                on
                  ? 'border-accent bg-accent/[0.05]'
                  : 'border-rule bg-paper-hi hover:border-rule-strong hover:bg-paper-lo/60'
              }`}
            >
              <OptionMark id={id} active={on} size={42} />
              <span className={`min-w-0 flex-1 text-balance font-disp text-[19px] leading-tight md:text-[20px] ${on ? 'text-ink' : 'text-ink-2'}`}>
                {t(`options.${step}.${id}`)}
              </span>
              <CheckMark on={on} />
            </button>
          );
        })}
      </div>

      <div className="mt-auto flex items-center justify-between gap-4 pt-9">
        <Button variant="ghost" onClick={prev} className="px-3">
          <ArrowLeft />
          {t('layout.buttons.prev')}
        </Button>
        <Button onClick={next} disabled={!selected}>
          {t('layout.buttons.next')}
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
